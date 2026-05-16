import { NextResponse } from 'next/server';
import { normalizePhoneNumber } from '@/lib/phone';

export async function GET() {
  try {
    const twilio_phone_number = normalizePhoneNumber(
      process.env.TWILIO_PHONE_NUMBER ?? '',
    );
    const app_url =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

    return NextResponse.json({
      twilio_phone_number,
      voice_webhook_path: '/api/twilio/voice',
      app_url,
    });
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 },
    );
  }
}
