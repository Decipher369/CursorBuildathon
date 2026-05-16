import { NextResponse } from 'next/server';
import { insertBusiness, getAllBusinesses } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, language, faqs, hours, escalation_threshold } = body;

    const business = await insertBusiness({
      name,
      type,
      language,
      faqs,
      hours,
      escalation_threshold,
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
