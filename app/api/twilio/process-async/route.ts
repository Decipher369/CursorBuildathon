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

/* ── Helpers ─────────────────────────────────────────────────────── */

function twimlSay(text: string): NextResponse {
  const VoiceResponse = (twilio.twiml as any).VoiceResponse;
  const twiml = new VoiceResponse();
  twiml.say({ voice: 'alice' }, text.slice(0, 500));
  twiml.hangup();
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

function twimlPlay(url: string): NextResponse {
  const VoiceResponse = (twilio.twiml as any).VoiceResponse;
  const twiml = new VoiceResponse();
  twiml.play(url);
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

/** Fetch Twilio recording with up to 4 retries (800 ms apart) on 404/error. */
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
      console.log(`[process-async] Fetching recording attempt ${attempt}/${maxAttempts}:`, wavUrl);
      const res = await axios.get(wavUrl, {
        responseType: 'arraybuffer',
        auth: { username: accountSid, password: authToken },
      });
      const buf = Buffer.from(res.data as ArrayBuffer);
      console.log(`[process-async] Recording fetched OK, bytes:`, buf.length);
      return buf;
    } catch (err: any) {
      lastErr = err;
      const status = err?.response?.status;
      console.log(`[process-async] Recording fetch attempt ${attempt} failed, status:`, status, err?.message);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
      }
    }
  }
  throw new Error(`Failed to fetch recording after ${maxAttempts} attempts: ${(lastErr as any)?.message}`);
}

/* ── Route ───────────────────────────────────────────────────────── */

export async function POST(request: Request) {
  const formData = await request.formData();

  // Debug: log all incoming Twilio fields
  console.log('[process-async] Form data keys:', [...formData.keys()]);
  console.log('[process-async] RecordingUrl:', formData.get('RecordingUrl'));
  console.log('[process-async] RecordingSid:', formData.get('RecordingSid'));
  console.log('[process-async] SpeechResult:', formData.get('SpeechResult'));

  const recordingUrl = formData.get('RecordingUrl') as string | null;
  const speechResult = formData.get('SpeechResult') as string | null;
  const from = formData.get('From') as string | null;

  const { searchParams } = new URL(request.url);
  const business_id = searchParams.get('business_id');

  if (!from) {
    return twimlSay('Missing caller number. Please call again.');
  }
  if (!business_id) {
    return twimlSay('Agent configuration error. Please try again later.');
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? '';
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';

  /** The full call pipeline — sequential but with zero unnecessary gaps. */
  async function processCallPipeline(): Promise<NextResponse> {
    // ── Step 1: Get transcript (Valsea or SpeechResult fallback) ──
    let transcript = '';

    if (recordingUrl) {
      const wavUrl = recordingUrl.endsWith('.wav')
        ? recordingUrl
        : `${recordingUrl}.wav`;

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
          console.log('[process-async] Valsea transcription error:', err.message);
          if (err?.response) {
            console.log('[process-async] Valsea status:', err.response.status);
            const body = err.response.data;
            console.log(
              '[process-async] Valsea body:',
              typeof body === 'object' ? JSON.stringify(body) : String(body),
            );
          }
        }
      }
    }

    // Fallback to Twilio SpeechResult
    if (!transcript && speechResult) {
      console.log('[process-async] Using SpeechResult fallback:', speechResult);
      transcript = speechResult;
    }

    if (!transcript) {
      return twimlSay('We did not catch that. Please call again and speak after the tone.');
    }

    // ── Step 2: Sentiment (fast, can start right after transcript) ──
    const sentimentPromise = analyzeSentiment(transcript);

    // ── Step 3: Load business + customer context ──
    const [business, { customer, isReturning }] = await Promise.all([
      getBusiness(business_id!),
      getOrCreateCustomer(from),
    ]);
    const memoryContext = await buildMemoryContext(customer.id);

    // ── Step 4: GPT-4o reply ──
    const openaiResult = await processCall(transcript, business, memoryContext);
    console.log('[process-async] GPT intent:', openaiResult.intent, '| response:', openaiResult.response);

    // ── Step 5: ElevenLabs TTS (now that we have the reply text) ──
    const [{ score: sentiment_score, label: sentiment_label }, audio_base64] =
      await Promise.all([
        sentimentPromise,
        textToSpeech(openaiResult.response).catch((err: any) => {
          console.log('[process-async] ElevenLabs error:', err.message);
          return null as string | null;
        }),
      ]);

    // ── Step 6: Escalation logic ──
    let escalated = openaiResult.escalate === true;
    if (!escalated && business.escalation_threshold !== 'never') {
      if (business.escalation_threshold === 'negative' && sentiment_label === 'negative') escalated = true;
      if (
        business.escalation_threshold === 'neutral' &&
        (sentiment_label === 'negative' || sentiment_label === 'neutral')
      ) escalated = true;
    }

    // ── Step 7: Persist call record (fire-and-forget, don't block TwiML) ──
    const callPayload: Record<string, unknown> = {
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
    };

    insertCall(callPayload).catch((err: any) => {
      if (String(err.message).includes('audio_base64')) {
        insertCall(callPayload).catch(() => {});
      }
      console.log('[process-async] insertCall error:', err.message);
    });

    // ── Step 8: Build TwiML response ──
    if (audio_base64) {
      try {
        const audioUrl = await uploadCallAudio(audio_base64);
        console.log('[process-async] Audio uploaded:', audioUrl);
        return twimlPlay(audioUrl);
      } catch (err: any) {
        console.log('[process-async] uploadCallAudio error:', err.message);
      }
    }

    // Fallback: <Say> the text response
    const fallbackText =
      typeof openaiResult.response === 'string' && openaiResult.response
        ? openaiResult.response
        : 'Thank you for calling. We will get back to you shortly.';
    return twimlSay(fallbackText);
  }

  // ── 12-second hard timeout ─────────────────────────────────────
  try {
    const result = await Promise.race([
      processCallPipeline(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 12000),
      ),
    ]);
    return result;
  } catch (err: any) {
    if (err.message === 'timeout') {
      console.log('[process-async] Hard timeout reached — returning fallback TwiML');
      return twimlSay('Sorry, I am still processing. Please say that again.');
    }
    console.log('[process-async] Unhandled error:', err.message, err.stack);
    return twimlSay('Sorry, we could not process your call. Please try again.');
  }
}
