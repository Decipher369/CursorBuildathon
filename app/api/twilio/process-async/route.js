import axios from 'axios';
import twilio from 'twilio';
import { transcribeAudio, analyzeSentiment } from '@/lib/valsea';
import { uploadCallAudio } from '@/lib/audio-storage';
import { handleProcessCall } from '@/lib/process-call-handler';
import { getBaseUrl } from '@/lib/config';
import { twimlError, twimlResponse } from '@/lib/twiml-error';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request) {
  try {
    // business_id is in the query string (we put it there in the Record action URL)
    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');

    // Twilio POSTs all call params in the form body — never in the query string
    const formData = await request.formData();
    const recording_sid = formData.get('RecordingSid');
    const recordingUrlParam = formData.get('RecordingUrl');
    const from = formData.get('From');
    const call_sid = formData.get('CallSid') ?? null;

    console.log('[process-async] business_id:', business_id);
    console.log('[process-async] RecordingSid:', recording_sid);
    console.log('[process-async] From:', from);
    console.log('[process-async] RecordingUrl:', recordingUrlParam);

    if (!business_id || !from) {
      throw new Error(`Missing required params: business_id=${business_id}, from=${from}`);
    }
    if (!recording_sid && !recordingUrlParam) {
      throw new Error('Missing RecordingSid and RecordingUrl from Twilio POST body');
    }

    const baseUrl = getBaseUrl();
    const actionUrl = `${baseUrl}/api/twilio/process-async?business_id=${encodeURIComponent(business_id)}`;

    // Derive .wav URL — prefer what Twilio gave us, fall back to constructing from SID
    const recordingUrl = recordingUrlParam
      ? (recordingUrlParam.endsWith('.wav') ? recordingUrlParam : `${recordingUrlParam}.wav`)
      : `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings/${recording_sid}.wav`;
    const audioResponse = await axios.get(recordingUrl, {
      responseType: 'arraybuffer',
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN,
      },
    });

    const audioBuffer = Buffer.from(audioResponse.data);
    const transcript = await transcribeAudio(audioBuffer);
    const { score: sentiment_score, label: sentiment_label } =
      await analyzeSentiment(transcript);

    const { audio_base64, response: responseText } = await handleProcessCall({
      business_id,
      phone_number: from,
      transcript,
      sentiment_score,
      sentiment_label,
      call_sid,
    });

    // Build reply TwiML + loop Record
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    let replyAudioUrl = null;
    if (audio_base64) {
      try {
        replyAudioUrl = await uploadCallAudio(audio_base64);
      } catch {
        // Blob upload failed — fall back to <Say>
      }
    }

    if (replyAudioUrl) {
      twiml.play(replyAudioUrl);
    } else if (responseText) {
      twiml.say({ voice: 'alice' }, String(responseText).slice(0, 500));
    } else {
      twiml.say({ voice: 'alice' }, 'Thank you for calling.');
    }

    // Loop — record the next caller turn
    twiml.record({
      maxLength: 30,
      action: actionUrl,
      method: 'POST',
      playBeep: false,
      trim: 'trim-silence',
      timeout: 3,
    });

    return twimlResponse(twiml.toString());
  } catch (err) {
    console.error('[process-async] failed:', err?.message ?? err);
    return twimlResponse(
      twimlError(err.message || 'Sorry, we could not process your call.'),
    );
  }
}
