import { NextResponse } from 'next/server';
import { getBusiness, insertCall } from '@/lib/supabase';
import { getOrCreateCustomer, buildMemoryContext } from '@/lib/memory';
import { processCall } from '@/lib/openai';
import { textToSpeech } from '@/lib/elevenlabs';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      business_id,
      phone_number,
      transcript,
      sentiment_score,
      sentiment_label,
    } = body;

    const business = await getBusiness(business_id);
    const { customer, isReturning } = await getOrCreateCustomer(phone_number);
    const memoryContext = await buildMemoryContext(customer.id);
    const openaiResult = await processCall(transcript, business, memoryContext);
    const audio_base64 = await textToSpeech(openaiResult.response);

    let escalated = openaiResult.escalate === true;
    if (
      !escalated &&
      sentiment_label === 'negative' &&
      business.escalation_threshold === 'low'
    ) {
      escalated = true;
    }

    const call = await insertCall({
      business_id,
      customer_id: customer.id,
      phone_number,
      transcript,
      sentiment_score,
      sentiment_label,
      intent: openaiResult.intent,
      agent_response: openaiResult.response,
      resolved: openaiResult.intent !== 'escalation',
      escalated,
      duration_seconds: 0,
    });

    return NextResponse.json({
      call_id: call.id,
      transcript,
      sentiment_score,
      sentiment_label,
      intent: openaiResult.intent,
      response: openaiResult.response,
      audio_base64,
      escalated,
      customer: {
        id: customer.id,
        isReturning,
        total_calls: customer.total_calls,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}
