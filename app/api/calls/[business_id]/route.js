import { NextResponse } from 'next/server';
import { getCallsByBusiness } from '@/lib/supabase';

export async function GET(_request, { params }) {
  try {
    const { business_id } = await params;
    const calls = await getCallsByBusiness(business_id);
    return NextResponse.json(calls);
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}
