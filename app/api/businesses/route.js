import { NextResponse } from 'next/server';
import { insertBusiness, getAllBusinesses } from '@/lib/supabase';
import { normalizePhoneNumber } from '@/lib/phone';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      language,
      faqs,
      hours,
      escalation_threshold,
      twilio_phone_number,
    } = body;

    const existing = await getAllBusinesses();
    if (existing?.length > 0) {
      return NextResponse.json(
        {
          error: true,
          message:
            'MVP supports one business only. Use the dashboard for your existing business.',
        },
        { status: 400 },
      );
    }

    const business = await insertBusiness({
      name,
      type,
      language,
      faqs,
      hours,
      escalation_threshold,
      twilio_phone_number: twilio_phone_number
        ? normalizePhoneNumber(twilio_phone_number)
        : undefined,
    });

    return NextResponse.json(business, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const businesses = await getAllBusinesses();
    return NextResponse.json(businesses);
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}
