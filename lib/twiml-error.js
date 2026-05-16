import { NextResponse } from 'next/server';
import twilio from 'twilio';

export function twimlError(message = 'Sorry, something went wrong. Please try again later.') {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  twiml.say({ voice: 'alice' }, message.slice(0, 500));
  twiml.hangup();
  return twiml.toString();
}

export function twimlResponse(xml) {
  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
