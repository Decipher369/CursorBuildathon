export const runtime = 'nodejs';

const TWIML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello! Welcome to CallSense. Your AI agent is ready.</Say>
</Response>`;

export async function POST() {
  return new Response(TWIML, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
