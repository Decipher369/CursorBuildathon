import { NextResponse } from 'next/server';
import { getBusiness } from '@/lib/supabase';

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
