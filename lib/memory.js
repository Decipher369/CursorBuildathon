import {
  getCustomerByPhone,
  insertCustomer,
  updateCustomerLastSeen,
  getCallsByCustomer,
} from './supabase.js';

export async function getOrCreateCustomer(phone_number) {
  try {
    const existing = await getCustomerByPhone(phone_number);

    if (existing) {
      const customer = await updateCustomerLastSeen(existing.id);
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
