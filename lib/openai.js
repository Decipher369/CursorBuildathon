import OpenAI from 'openai';

let openaiClient;

function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function formatFaqs(faqs) {
  if (!faqs) return 'None specified';
  if (Array.isArray(faqs)) {
    return faqs
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const q = item.q ?? item.question ?? '';
          const a = item.a ?? item.answer ?? '';
          return `Q: ${q}\nA: ${a}`;
        }
        return String(item);
      })
      .join('\n');
  }
  if (typeof faqs === 'object') {
    return Object.entries(faqs)
      .map(([q, a]) => `Q: ${q}\nA: ${a}`)
      .join('\n');
  }
  return String(faqs);
}

const FALLBACK = {
  intent: 'unknown',
  response: 'Sorry, could you repeat that?',
  confidence: 'low',
  escalate: false,
};

export async function processCall(transcript, business, memoryContext) {
  try {
    const personaLine = business.persona
      ? `Persona: ${business.persona}`
      : `You are the AI receptionist for ${business.name}, a ${business.type}.`;
    const agentLabel = business.agent_name
      ? `Your name is ${business.agent_name}.`
      : '';

    const systemPrompt = `${personaLine}
${agentLabel}
Operating hours: ${business.hours ?? 'Not specified'}.
You can help with:
${formatFaqs(business.faqs)}
Customer history: ${memoryContext}
Respond naturally and warmly. Keep it concise — this is a phone call.
If returning customer, acknowledge them.
Reply ONLY in this JSON:
{
  "intent": "booking | faq | escalation | unknown",
  "response": "your spoken response",
  "confidence": "high | medium | low",
  "escalate": true | false
}`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return FALLBACK;

    const parsed = JSON.parse(content);
    return {
      intent: parsed.intent ?? 'unknown',
      response: parsed.response ?? FALLBACK.response,
      confidence: parsed.confidence ?? 'low',
      escalate: Boolean(parsed.escalate),
    };
  } catch {
    return FALLBACK;
  }
}
