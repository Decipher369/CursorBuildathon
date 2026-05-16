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

  // Record the next turn — loop back to this route
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

function buildSilenceWarningTwiml(actionUrl) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.say(
    { voice: 'alice' },
    'Are you still there? I will end this call in 10 seconds if I don\'t hear from you.',
  );
  twiml.pause({ length: 2 });

  twiml.record({
    maxLength: 15,
    action: actionUrl,
    method: 'POST',
    playBeep: true,
    trim: 'trim-silence',
    timeout: 8,
  });

  // Still nothing — countdown and hang up
  twiml.say({ voice: 'alice' }, '10. 9. 8. 7. 6. 5. 4. 3. 2. 1. Thank you for calling. Goodbye.');
  twiml.hangup();

  return twiml.toString();
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const recordingUrl = formData.get('RecordingUrl');
    const from = formData.get('From');
    const recordingDuration = parseInt(formData.get('RecordingDuration') ?? '0', 10);

    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');
    const call_sid = searchParams.get('call_sid') ?? formData.get('CallSid') ?? null;
    const silenceFlag = searchParams.get('silence') === '1';

    if (!from) throw new Error('Missing From in Twilio webhook');
    if (!business_id) throw new Error('Missing business_id query parameter');

    const baseUrl = getBaseUrl();
    const sidParam = call_sid ? `&call_sid=${encodeURIComponent(call_sid)}` : '';
    const actionUrl = `${baseUrl}/api/twilio/process?business_id=${encodeURIComponent(business_id)}${sidParam}`;

    // No recording or silence redirect → warn the caller
    if (silenceFlag || !recordingUrl || recordingDuration < 1) {
      return twimlResponse(buildSilenceWarningTwiml(actionUrl));
    }

    const wavUrl = recordingUrl.endsWith('.wav') ? recordingUrl : `${recordingUrl}.wav`;
    const audioResponse = await axios.get(wavUrl, {
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
      phone_number: String(from),
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
