import { NextResponse } from 'next/server';
import { getCustomerByPhone, getCallsByCustomer } from '@/lib/supabase';

export async function GET(_request, { params }) {
  try {
    const { phone_number } = await params;
    const decodedPhone = decodeURIComponent(phone_number);

    const customer = await getCustomerByPhone(decodedPhone);
    if (!customer) {
      return NextResponse.json(
        { error: true, message: 'Customer not found' },
        { status: 404 },
      );
    }

    const calls = await getCallsByCustomer(customer.id);
    return NextResponse.json({ customer, calls });
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}
