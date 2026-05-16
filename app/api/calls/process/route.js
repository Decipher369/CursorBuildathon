import { NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/valsea';
import { handleProcessCall } from '@/lib/process-call-handler';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      business_id,
      phone_number,
      transcript,
      sentiment_score: providedScore,
      sentiment_label: providedLabel,
    } = body;

    let sentiment_score = providedScore;
    let sentiment_label = providedLabel;

    if (sentiment_score == null || !sentiment_label) {
      const sentiment = await analyzeSentiment(transcript);
      sentiment_score = sentiment.score;
      sentiment_label = sentiment.label;
    }

    const result = await handleProcessCall({
      business_id,
      phone_number,
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
