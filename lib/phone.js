/** Normalize to E.164-ish for Twilio matching (+6591234567) */
export function normalizePhoneNumber(value) {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  if (String(value).trim().startsWith('+')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}
