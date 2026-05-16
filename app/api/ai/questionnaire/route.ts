import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const QUESTIONS_BY_STEP: Record<number, string> = {
  1: 'What is your business name and what do you do? (e.g. "Mama\'s Kitchen – a halal home-cooked delivery service in KL")',
  2: 'What are the main products or services you offer? List up to 5.',
  3: 'What are your operating hours and days?',
  4: 'What are the most common questions customers call about? List 3-5 FAQs.',
  5: 'How would you describe the ideal tone and personality of your phone receptionist? (e.g. warm and friendly, professional and efficient, casual and fun)',
  6: 'Is there a human agent or phone number customers should be transferred to for complaints or urgent issues? If yes, what is that number?',
  7: 'Are there things the AI agent should never say or do? Any rules or restrictions?',
};

const TOTAL_STEPS = Object.keys(QUESTIONS_BY_STEP).length;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const step = parseInt(searchParams.get('step') ?? '1', 10);
  const question = QUESTIONS_BY_STEP[step] ?? null;
  return NextResponse.json({ step, total: TOTAL_STEPS, question });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, business_type } = body as {
      answers: { step: number; question: string; answer: string }[];
      business_type: string;
    };

    if (!answers?.length) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    const answersText = answers
      .map((a) => `Q${a.step}: ${a.question}\nA: ${a.answer}`)
      .join('\n\n');

    const systemPrompt = `You are a business setup assistant for CallSense, an AI voice receptionist platform.
Based on the answers below from a ${business_type ?? 'business'} owner, generate a structured business profile.
Return ONLY valid JSON with exactly these fields:
{
  "name": "business name",
  "persona": "2-3 sentence description of how the AI receptionist should sound and behave",
  "hours": "operating hours in plain text",
  "faqs": [
    { "question": "...", "answer": "..." },
    ...up to 8 items
  ],
  "agent_name": "a friendly first name for the AI agent (e.g. Aisha, Sam, Alex)",
  "escalation_phone": "the human escalation phone number or empty string"
}

Make the persona warm, professional, and natural for the business type.
Expand the FAQs to cover what customers typically ask, using the owner's answers as context.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: answersText },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const profile = JSON.parse(content);
    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
