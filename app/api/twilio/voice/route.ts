export const runtime = 'nodejs';
export const maxDuration = 10;

import twilio from 'twilio';
import { getBusinessByTwilioPhone, getAllBusinesses } from '@/lib/supabase';
import { getBaseUrl } from '@/lib/config';
import { normalizePhoneNumber } from '@/lib/phone';
import { twimlError, twimlResponse } from '@/lib/twiml-error';

async function resolveBusinessId(incomingTo: FormDataEntryValue | null) {
  const normalizedTo = normalizePhoneNumber(
    incomingTo != null ? String(incomingTo) : '',
  );
  if (normalizedTo) {
    const byPhone = await getBusinessByTwilioPhone(normalizedTo);
    if (byPhone) return byPhone.id;
  }

  if (process.env.DEFAULT_BUSINESS_ID) {
    return process.env.DEFAULT_BUSINESS_ID;
  }

  const businesses = await getAllBusinesses();
  if (!businesses?.length) {
    throw new Error('No business configured. Complete onboarding first.');
  }
  return businesses[0].id;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid');
    const from = formData.get('From');
    const to = formData.get('To');

    if (!callSid || !from) {
      throw new Error('Missing CallSid or From in Twilio webhook');
    }

    const businessId = await resolveBusinessId(to);
    const baseUrl = getBaseUrl();
    const actionUrl = `${baseUrl}/api/twilio/process?business_id=${encodeURIComponent(businessId)}`;

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    twiml.say(
      { voice: 'alice' },
      'Thank you for calling CallSense. Please tell me how I can help you after the tone.',
    );
    twiml.record({
      maxLength: 30,
      action: actionUrl,
      method: 'POST',
      playBeep: true,
      trim: 'trim-silence',
      timeout: 3,
    });
    twiml.say({ voice: 'alice' }, 'We did not receive your message. Goodbye.');
    twiml.hangup();

    return twimlResponse(twiml.toString());
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Sorry, we could not connect your call.';
    return twimlResponse(twimlError(message));
  }
}
