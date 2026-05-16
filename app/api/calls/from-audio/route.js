import { NextResponse } from 'next/server';
import { transcribeAudio, analyzeSentiment } from '@/lib/valsea';
import { handleProcessCall } from '@/lib/process-call-handler';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio');
    const business_id = formData.get('business_id');
    const phone_number = formData.get('phone_number');

    if (!audio || typeof audio === 'string') {
      throw new Error('Missing audio file');
    }
    if (!business_id || !phone_number) {
      throw new Error('Missing business_id or phone_number');
    }

    const buffer = Buffer.from(await audio.arrayBuffer());
    const audio_base64 = buffer.toString('base64');

    const transcript = await transcribeAudio(audio_base64);
    const { score: sentiment_score, label: sentiment_label } =
      await analyzeSentiment(transcript);

    const result = await handleProcessCall({
      business_id: String(business_id),
      phone_number: String(phone_number),
      transcript,
      sentiment_score,
      sentiment_label,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}
