import { NextResponse } from 'next/server';
import { getBusiness, updateBusiness } from '@/lib/supabase';
import { normalizePhoneNumber } from '@/lib/phone';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const business = await getBusiness(id);
    return NextResponse.json(business);
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      type,
      language,
      faqs,
      hours,
      escalation_threshold,
      twilio_phone_number,
      agent_name,
      persona,
      escalation_phone,
    } = body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (language !== undefined) updates.language = language;
    if (faqs !== undefined) updates.faqs = faqs;
    if (hours !== undefined) updates.hours = hours;
    if (escalation_threshold !== undefined) {
      updates.escalation_threshold = escalation_threshold;
    }
    if (agent_name !== undefined) updates.agent_name = agent_name;
    if (persona !== undefined) updates.persona = persona;
    if (escalation_phone !== undefined) {
      updates.escalation_phone = escalation_phone
        ? normalizePhoneNumber(escalation_phone)
        : null;
    }
    if (twilio_phone_number !== undefined) {
      updates.twilio_phone_number = twilio_phone_number
        ? normalizePhoneNumber(twilio_phone_number)
        : null;
    }

    const business = await updateBusiness(id, updates);
    return NextResponse.json(business);
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}
