import { getBusiness, insertCall } from './supabase.js';
import { getOrCreateCustomer, buildMemoryContext } from './memory.js';
import { processCall } from './openai.js';
import { textToSpeech } from './elevenlabs.js';

export async function handleProcessCall({
  business_id,
  phone_number,
  transcript,
  sentiment_score,
  sentiment_label,
}) {
  const business = await getBusiness(business_id);
  const { customer, isReturning } = await getOrCreateCustomer(phone_number);
  const memoryContext = await buildMemoryContext(customer.id);
  const openaiResult = await processCall(transcript, business, memoryContext);
  const audio_base64 = await textToSpeech(openaiResult.response);

  let escalated = openaiResult.escalate === true;
  if (!escalated && business.escalation_threshold !== 'never') {
    if (
      business.escalation_threshold === 'negative' &&
      sentiment_label === 'negative'
    ) {
      escalated = true;
    }
    if (
      business.escalation_threshold === 'neutral' &&
      (sentiment_label === 'negative' || sentiment_label === 'neutral')
    ) {
      escalated = true;
    }
  }

  const callPayload = {
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
    audio_base64,
  };

  let call;
  try {
    call = await insertCall(callPayload);
  } catch (err) {
    if (String(err.message).includes('audio_base64')) {
      const { audio_base64: _audio, ...withoutAudio } = callPayload;
      call = await insertCall(withoutAudio);
    } else {
      throw err;
    }
  }

  return {
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
  };
}
