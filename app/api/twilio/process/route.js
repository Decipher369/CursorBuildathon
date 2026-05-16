import twilio from 'twilio';
import { getBaseUrl } from '@/lib/config';
import { twimlError, twimlResponse } from '@/lib/twiml-error';

export const runtime = 'nodejs';

function buildSilenceWarningTwiml(actionUrl) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.say(
    { voice: 'alice' },
    "Are you still there? I will end this call in 10 seconds if I don't hear from you.",
  );
  twiml.pause({ length: 2 });

  twiml.record({
    maxLength: 15,
    action: actionUrl,
    method: 'POST',
    playBeep: true,
    trim: 'trim-silence',
    timeout: 8,
  });

  twiml.say({ voice: 'alice' }, '10. 9. 8. 7. 6. 5. 4. 3. 2. 1. Thank you for calling. Goodbye.');
  twiml.hangup();

  return twiml.toString();
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const recordingSid = formData.get('RecordingSid');
    const from = formData.get('From');
    const recordingDuration = parseInt(formData.get('RecordingDuration') ?? '0', 10);

    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');
    const call_sid = searchParams.get('call_sid') ?? formData.get('CallSid') ?? null;
    const silenceFlag = searchParams.get('silence') === '1';

    if (!from) throw new Error('Missing From in Twilio webhook');
    if (!business_id) throw new Error('Missing business_id query parameter');

    const baseUrl = getBaseUrl();
    const sidParam = call_sid ? `&call_sid=${encodeURIComponent(call_sid)}` : '';
    const actionUrl = `${baseUrl}/api/twilio/process?business_id=${encodeURIComponent(business_id)}${sidParam}`;

    // Silence or missing recording → warn the caller and record again
    if (silenceFlag || !recordingSid || recordingDuration < 1) {
      return twimlResponse(buildSilenceWarningTwiml(actionUrl));
    }

    // Respond to Twilio immediately (< 1 second) to avoid the 15-second timeout.
    // Redirect to the async route which does all the heavy processing.
    const asyncParams = new URLSearchParams({ business_id, recording_sid: recordingSid, from: String(from) });
    if (call_sid) asyncParams.set('call_sid', call_sid);

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    twiml.say({ voice: 'alice' }, 'Please hold while I process your request.');
    twiml.redirect({ method: 'POST' }, `${baseUrl}/api/twilio/process-async?${asyncParams}`);

    return twimlResponse(twiml.toString());
  } catch (err) {
    return twimlResponse(
      twimlError(err.message || 'Sorry, we could not process your call.'),
    );
  }
}
