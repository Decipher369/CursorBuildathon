import axios from 'axios';
import twilio from 'twilio';
import { transcribeAudio, analyzeSentiment } from '@/lib/valsea';
import { uploadCallAudio } from '@/lib/audio-storage';
import { handleProcessCall } from '@/lib/process-call-handler';
import { getBaseUrl } from '@/lib/config';
import { twimlError, twimlResponse } from '@/lib/twiml-error';

export const runtime = 'nodejs';
export const maxDuration = 60;

function buildLoopTwiml(replyText, replyAudioUrl, actionUrl) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  if (replyAudioUrl) {
    twiml.play(replyAudioUrl);
  } else if (replyText) {
    twiml.say({ voice: 'alice' }, String(replyText).slice(0, 500));
  }

  // Record the next turn — loops back to the fast /process route
  twiml.record({
    maxLength: 30,
    action: actionUrl,
    method: 'POST',
    playBeep: true,
    trim: 'trim-silence',
    timeout: 10,
  });

  // Fallthrough if nothing recorded after timeout — treat as silence
  twiml.redirect({ method: 'POST' }, `${actionUrl}&silence=1`);

  return twiml.toString();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');
    const recording_sid = searchParams.get('recording_sid');
    const from = searchParams.get('from');
    const call_sid = searchParams.get('call_sid') ?? null;

    if (!business_id) throw new Error('Missing business_id');
    if (!recording_sid) throw new Error('Missing recording_sid');
    if (!from) throw new Error('Missing from');

    const baseUrl = getBaseUrl();
    const sidParam = call_sid ? `&call_sid=${encodeURIComponent(call_sid)}` : '';
    const actionUrl = `${baseUrl}/api/twilio/process?business_id=${encodeURIComponent(business_id)}${sidParam}`;

    // Wait for Twilio to finish transcoding the recording before downloading
    await sleep(3000);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const wavUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recording_sid}.wav`;

    const audioResponse = await axios.get(wavUrl, {
      responseType: 'arraybuffer',
      auth: { username: accountSid, password: authToken },
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

    let replyAudioUrl = null;
    if (audio_base64) {
      try {
        replyAudioUrl = await uploadCallAudio(audio_base64);
      } catch {
        // Blob upload failed — fall back to <Say>
      }
    }

    return twimlResponse(buildLoopTwiml(responseText, replyAudioUrl, actionUrl));
  } catch (err) {
    return twimlResponse(
      twimlError(err.message || 'Sorry, we could not process your call.'),
    );
  }
}
