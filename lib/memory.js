import {
  getCustomerByPhone,
  insertCustomer,
  updateCustomerLastSeen,
  getCallsByCustomer,
  getCallsByCallSid,
} from './supabase.js';

/**
 * Get or create a customer record keyed by phone number.
 * If call_sid is provided and the customer already has a turn for that
 * call_sid, we skip bumping total_calls (avoids inflating it once per turn).
 */
export async function getOrCreateCustomer(phone_number, call_sid = null) {
  try {
    const existing = await getCustomerByPhone(phone_number);

    if (existing) {
      // Only count as a new "call" if this is the first turn of this call_sid
      const isFirstTurn = call_sid
        ? (await getCallsByCallSid(call_sid)).length === 0
        : true;

      const customer = isFirstTurn
        ? await updateCustomerLastSeen(existing.id)
        : existing;

      return { customer, isReturning: true };
    }

    const customer = await insertCustomer(phone_number);
    return { customer, isReturning: false };
  } catch (err) {
    throw new Error(`getOrCreateCustomer failed: ${err.message}`);
  }
}

function daysAgo(dateString) {
  const then = new Date(dateString).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

function sentimentTrend(calls) {
  const labels = calls
    .map((c) => c.sentiment_label)
    .filter(Boolean);

  if (labels.length === 0) return 'neutral';

  const negativeCount = labels.filter((l) => l === 'negative').length;
  const positiveCount = labels.filter((l) => l === 'positive').length;

  if (negativeCount > positiveCount) return 'negative';
  if (positiveCount > negativeCount) return 'positive';
  return 'neutral';
}

export async function buildMemoryContext(customer_id) {
  try {
    const calls = await getCallsByCustomer(customer_id);

    if (!calls || calls.length === 0) {
      return 'This is a new customer, first time calling.';
    }

    const totalCalls = calls.length;
    const lastCall = calls[0];
    const lastFive = calls.slice(0, 5);
    const trend = sentimentTrend(lastFive);

    return `This customer has called ${totalCalls} times before.
Last call (${daysAgo(lastCall.created_at)} days ago): intent was ${lastCall.intent ?? 'unknown'}, resolved: ${lastCall.resolved ?? false}.
Overall sentiment trend: ${trend}.`;
  } catch (err) {
    throw new Error(`buildMemoryContext failed: ${err.message}`);
  }
}

/**
 * Build the prior-turn message history for a live call so the AI can
 * recall everything said earlier in the same session.
 * Returns an array of { role: 'user' | 'assistant', content } ordered
 * oldest-first, ready to spread into the OpenAI messages array.
 */
export async function buildConversationHistory(call_sid) {
  if (!call_sid) return [];

  try {
    const turns = await getCallsByCallSid(call_sid);

    const history = [];
    for (const turn of turns) {
      if (turn.transcript) {
        history.push({ role: 'user', content: turn.transcript });
      }
      if (turn.agent_response) {
        history.push({ role: 'assistant', content: turn.agent_response });
      }
    }
    return history;
  } catch (err) {
    // Non-fatal — degrade gracefully without history
    console.error('[memory] buildConversationHistory failed:', err.message);
    return [];
  }
}
