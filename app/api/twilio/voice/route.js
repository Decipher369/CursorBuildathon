import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { getBusinessByTwilioPhone, getAllBusinesses } from '@/lib/supabase';
import { getBaseUrl } from '@/lib/config';
import { normalizePhoneNumber } from '@/lib/phone';

async function resolveBusinessId(incomingTo) {
  const normalizedTo = normalizePhoneNumber(incomingTo);
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

export async function POST(request) {
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
      'Thank you for calling. Please state how I can help you.',
    );
    twiml.record({
      maxLength: 30,
      action: actionUrl,
      method: 'POST',
      playBeep: true,
      trim: 'trim-silence',
    });

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
