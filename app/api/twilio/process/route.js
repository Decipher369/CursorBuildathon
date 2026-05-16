import axios from 'axios';
import twilio from 'twilio';
import { transcribeAudio, analyzeSentiment } from '@/lib/valsea';
import { uploadCallAudio } from '@/lib/audio-storage';
import { handleProcessCall } from '@/lib/process-call-handler';
import { twimlError, twimlResponse } from '@/lib/twiml-error';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const recordingUrl = formData.get('RecordingUrl');
    const from = formData.get('From');

    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');

    if (!from) {
      throw new Error('Missing From in Twilio webhook');
    }
    if (!recordingUrl) {
      return twimlResponse(
        twimlError('We did not catch that. Please call again and speak after the tone.'),
      );
    }
    if (!business_id) {
      throw new Error('Missing business_id query parameter');
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
    });

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    if (audio_base64) {
      try {
        const audioUrl = await uploadCallAudio(audio_base64);
        twiml.play(audioUrl);
      } catch {
        const fallback =
          typeof responseText === 'string' && responseText
            ? responseText
            : 'Thank you for calling. We will get back to you shortly.';
        twiml.say({ voice: 'alice' }, fallback.slice(0, 500));
      }
    } else if (responseText) {
      twiml.say({ voice: 'alice' }, String(responseText).slice(0, 500));
    } else {
      twiml.say({ voice: 'alice' }, 'Thank you for calling.');
    }

    return twimlResponse(twiml.toString());
  } catch (err) {
    return twimlResponse(
      twimlError(err.message || 'Sorry, we could not process your call.'),
    );
  }
}
