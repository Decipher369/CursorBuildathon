import { NextResponse } from 'next/server';
import axios from 'axios';
import twilio from 'twilio';
import { transcribeAudio, analyzeSentiment } from '@/lib/valsea';
import { getBaseUrl } from '@/lib/config';

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

    const { audio_base64 } = processResponse.data;

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    twiml.play(`data:audio/mpeg;base64,${audio_base64}`);

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}
