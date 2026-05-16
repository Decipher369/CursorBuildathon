import axios from 'axios';
import twilio from 'twilio';
import { transcribeAudio, analyzeSentiment } from '@/lib/valsea';
import { getBaseUrl } from '@/lib/config';
import { uploadCallAudio } from '@/lib/audio-storage';
import { twimlError, twimlResponse } from '@/lib/twiml-error';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const recordingUrl = formData.get('RecordingUrl');
    const from = formData.get('From');

    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');

    if (!recordingUrl || !from) {
      throw new Error('Missing RecordingUrl or From in Twilio webhook');
    }
    if (!business_id) {
      throw new Error('Missing business_id query parameter');
    }

    const audioResponse = await axios.get(recordingUrl, {
      responseType: 'arraybuffer',
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN,
      },
    });

    const audio_base64_input = Buffer.from(audioResponse.data).toString('base64');
    const transcript = await transcribeAudio(audio_base64_input);
    const { score: sentiment_score, label: sentiment_label } =
      await analyzeSentiment(transcript);

    const baseUrl = getBaseUrl();
    const processResponse = await axios.post(
      `${baseUrl}/api/calls/process`,
      {
        business_id,
        phone_number: from,
        transcript,
        sentiment_score,
        sentiment_label,
      },
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (processResponse.status < 200 || processResponse.status >= 300) {
      throw new Error(
        processResponse.data?.message || 'Call processing failed',
      );
    }

    const { audio_base64, response: responseText } = processResponse.data;

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
