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
    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');
    const recording_sid = searchParams.get('recording_sid');
    const from = searchParams.get('from');
    const call_sid = searchParams.get('call_sid') ?? null;

    if (!business_id || !recording_sid || !from) {
      throw new Error('Missing required params: business_id, recording_sid, from');
    }

    const baseUrl = getBaseUrl();
    const sidParam = call_sid ? `&call_sid=${encodeURIComponent(call_sid)}` : '';
    const actionUrl = `${baseUrl}/api/twilio/process?business_id=${encodeURIComponent(business_id)}${sidParam}`;

    // Download the recording as wav using Twilio credentials
    const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings/${recording_sid}.wav`;
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

    // Loop — record the next turn
    twiml.record({
      maxLength: 30,
      action: actionUrl,
      method: 'POST',
      playBeep: true,
      trim: 'trim-silence',
      timeout: 10,
    });

    // Fallthrough after timeout → silence warning
    twiml.redirect({ method: 'POST' }, `${actionUrl}&silence=1`);

    return twimlResponse(twiml.toString());
  } catch (err) {
    console.error('[process-async] failed:', err?.message ?? err);
    return twimlResponse(
      twimlError(err.message || 'Sorry, we could not process your call.'),
    );
  }
}
