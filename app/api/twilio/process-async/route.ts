import axios from 'axios';
import twilio from 'twilio';
import { NextResponse } from 'next/server';
import { transcribeAudio, analyzeSentiment } from '@/lib/valsea';
import { uploadCallAudio } from '@/lib/audio-storage';
import { getBusiness, insertCall } from '@/lib/supabase';
import { getOrCreateCustomer, buildMemoryContext } from '@/lib/memory';
import { processCall } from '@/lib/openai';
import { textToSpeech } from '@/lib/elevenlabs';

export const runtime = 'nodejs';
export const maxDuration = 60;

/* ── History ─────────────────────────────────────────────────────── */

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

function encodeHistory(history: HistoryMessage[]): string {
  return Buffer.from(JSON.stringify(history.slice(-6))).toString('base64');
}

function decodeHistory(encoded: string | null): HistoryMessage[] {
  if (!encoded) return [];
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  } catch {
    return [];
  }
}

/* ── TwiML helpers ───────────────────────────────────────────────── */

function xmlResponse(xml: string): NextResponse {
  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

/**
 * Build a TwiML string that:
 *  - plays audio or says text
 *  - then either hangs up OR records the next caller turn
 */
function buildTwiml(opts: {
  audioUrl?: string | null;
  text?: string;
  nextActionUrl?: string;
  hangup?: boolean;
}): string {
  const VoiceResponse = (twilio.twiml as any).VoiceResponse;
  const twiml = new VoiceResponse();

  if (opts.audioUrl) {
    twiml.play(opts.audioUrl);
  } else if (opts.text) {
    twiml.say({ voice: 'alice' }, opts.text.slice(0, 500));
  }

  if (opts.hangup) {
    twiml.hangup();
  } else if (opts.nextActionUrl) {
    twiml.record({
      action: opts.nextActionUrl,
      method: 'POST',
      maxLength: 30,
      playBeep: false,
      trim: 'trim-silence',
      timeout: 3,
    });
  }

  return twiml.toString();
}

/* ── Farewell detection ──────────────────────────────────────────── */

const FAREWELL_RE =
  /\b(goodbye|good-?bye|bye\b|farewell|have a (great|good|wonderful|nice) (day|evening|night)|thanks? for calling|thank you for calling|take care now|that('?s| is) all)\b/i;

function isFarewell(text: string): boolean {
  return FAREWELL_RE.test(text);
}

/* ── Recording fetch with retry ──────────────────────────────────── */

async function fetchRecordingWithRetry(
  wavUrl: string,
  accountSid: string,
  authToken: string,
  maxAttempts = 4,
  retryDelayMs = 800,
): Promise<Buffer> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[process-async] Fetch recording attempt ${attempt}/${maxAttempts}:`, wavUrl);
      const res = await axios.get(wavUrl, {
        responseType: 'arraybuffer',
        auth: { username: accountSid, password: authToken },
      });
      const buf = Buffer.from(res.data as ArrayBuffer);
      console.log(`[process-async] Recording fetched, bytes:`, buf.length);
      return buf;
    } catch (err: any) {
      lastErr = err;
      console.log(
        `[process-async] Attempt ${attempt} failed, status:`,
        err?.response?.status,
        err?.message,
      );
      if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }
  throw new Error(
    `Failed to fetch recording after ${maxAttempts} attempts: ${(lastErr as any)?.message}`,
  );
}

/* ── Route ───────────────────────────────────────────────────────── */

export async function POST(request: Request) {
  const formData = await request.formData();

  console.log('[process-async] Keys:', [...formData.keys()]);
  console.log('[process-async] RecordingUrl:', formData.get('RecordingUrl'));
  console.log('[process-async] SpeechResult:', formData.get('SpeechResult'));

  const recordingUrl = formData.get('RecordingUrl') as string | null;
  const speechResult = formData.get('SpeechResult') as string | null;
  const from = formData.get('From') as string | null;

  const { searchParams } = new URL(request.url);
  const business_id = searchParams.get('business_id');
  const history = decodeHistory(searchParams.get('history'));

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? '';
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';

  /** Build the Record action URL for the next turn, carrying history forward. */
  function nextUrl(updatedHistory: HistoryMessage[]): string {
    return (
      `${appUrl}/api/twilio/process-async` +
      `?business_id=${encodeURIComponent(business_id ?? '')}` +
      `&history=${encodeURIComponent(encodeHistory(updatedHistory))}`
    );
  }

  /** Respond and keep the conversation going (used for timeout / hard errors). */
  function keepAlive(text: string): NextResponse {
    return xmlResponse(buildTwiml({ text, nextActionUrl: nextUrl(history) }));
  }

  if (!from) {
    return xmlResponse(buildTwiml({ text: 'Missing caller number. Please call again.', hangup: true }));
  }
  if (!business_id) {
    return xmlResponse(buildTwiml({ text: 'Agent configuration error. Please try again later.', hangup: true }));
  }

  async function processCallPipeline(): Promise<NextResponse> {
    // ── Step 1: Transcribe ────────────────────────────────────────
    let transcript = '';

    if (recordingUrl) {
      const wavUrl = recordingUrl.endsWith('.wav') ? recordingUrl : `${recordingUrl}.wav`;
      let audioBuffer: Buffer | null = null;
      try {
        audioBuffer = await fetchRecordingWithRetry(wavUrl, accountSid, authToken);
      } catch (err: any) {
        console.log('[process-async] Could not fetch recording:', err.message);
      }

      if (audioBuffer) {
        try {
          transcript = await transcribeAudio(audioBuffer);
          console.log('[process-async] Valsea transcript:', transcript);
        } catch (err: any) {
          console.log('[process-async] Valsea error:', err.message);
          if (err?.response) {
            const body = err.response.data;
            console.log(
              '[process-async] Valsea body:',
              typeof body === 'object' ? JSON.stringify(body) : String(body),
            );
          }
        }
      }
    }

    if (!transcript && speechResult) {
      console.log('[process-async] Using SpeechResult fallback:', speechResult);
      transcript = speechResult;
    }

    // Silent turn — ask if caller is still there; don't hang up
    if (!transcript) {
      console.log('[process-async] No transcript — prompting caller');
      return xmlResponse(
        buildTwiml({
          text: 'Are you still there? Please go ahead and speak.',
          nextActionUrl: nextUrl(history),
        }),
      );
    }

    // ── Step 2: Sentiment (async, resolved in Step 5) ─────────────
    const sentimentPromise = analyzeSentiment(transcript);

    // ── Step 3: Business + customer context ───────────────────────
    const [business, { customer }] = await Promise.all([
      getBusiness(business_id!),
      getOrCreateCustomer(from),
    ]);
    const memoryContext = await buildMemoryContext(customer.id);

    // ── Step 4: GPT-4o reply (with full conversation history) ─────
    const openaiResult = await processCall(transcript, business, memoryContext, history);
    console.log('[process-async] GPT intent:', openaiResult.intent, '| response:', openaiResult.response);

    // ── Step 5: ElevenLabs TTS in parallel with sentiment ─────────
    const [{ score: sentiment_score, label: sentiment_label }, audio_base64] =
      await Promise.all([
        sentimentPromise,
        textToSpeech(openaiResult.response).catch((err: any) => {
          console.log('[process-async] ElevenLabs error:', err.message);
          return null as string | null;
        }),
      ]);

    // ── Step 6: Escalation logic ──────────────────────────────────
    let escalated = openaiResult.escalate === true;
    if (!escalated && business.escalation_threshold !== 'never') {
      if (business.escalation_threshold === 'negative' && sentiment_label === 'negative')
        escalated = true;
      if (
        business.escalation_threshold === 'neutral' &&
        (sentiment_label === 'negative' || sentiment_label === 'neutral')
      )
        escalated = true;
    }

    // ── Step 7: Update history (user turn + assistant reply) ──────
    const updatedHistory: HistoryMessage[] = ([
      ...history,
      { role: 'user' as const, content: transcript },
      { role: 'assistant' as const, content: openaiResult.response },
    ] as HistoryMessage[]).slice(-6);

    // ── Step 8: Farewell detection — only hang up on explicit bye ─
    const shouldHangup =
      isFarewell(openaiResult.response) || openaiResult.intent === 'farewell';

    // ── Step 9: Persist call record (fire-and-forget) ─────────────
    insertCall({
      business_id,
      customer_id: customer.id,
      phone_number: from,
      transcript,
      sentiment_score,
      sentiment_label,
      intent: openaiResult.intent,
      agent_response: openaiResult.response,
      resolved: openaiResult.intent !== 'escalation',
      escalated,
      duration_seconds: 0,
    } as Record<string, unknown>).catch((err: any) =>
      console.log('[process-async] insertCall error:', err.message),
    );

    // ── Step 10: Build TwiML response ─────────────────────────────
    const actionUrl = shouldHangup ? undefined : nextUrl(updatedHistory);

    if (audio_base64) {
      try {
        const audioUrl = await uploadCallAudio(audio_base64);
        console.log('[process-async] Audio uploaded:', audioUrl);
        return xmlResponse(buildTwiml({ audioUrl, nextActionUrl: actionUrl, hangup: shouldHangup }));
      } catch (err: any) {
        console.log('[process-async] uploadCallAudio error:', err.message);
      }
    }

    // Fallback to <Say>
    const replyText =
      typeof openaiResult.response === 'string' && openaiResult.response
        ? openaiResult.response
        : 'Thank you for calling. We will get back to you shortly.';

    return xmlResponse(buildTwiml({ text: replyText, nextActionUrl: actionUrl, hangup: shouldHangup }));
  }

  // ── 12-second hard timeout ────────────────────────────────────────
  try {
    return await Promise.race([
      processCallPipeline(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 12000),
      ),
    ]);
  } catch (err: any) {
    if (err.message === 'timeout') {
      console.log('[process-async] Hard timeout — keeping conversation alive');
      return keepAlive('Sorry, I am still processing. Please say that again.');
    }
    console.log('[process-async] Unhandled error:', err.message, err.stack);
    return keepAlive('Sorry, something went wrong. Please go ahead and speak.');
  }
}
