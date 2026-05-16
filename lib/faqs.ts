export type FaqItem = { question: string; answer: string };

export function parseFaqs(faqs: unknown): FaqItem[] {
  if (!faqs) return [{ question: '', answer: '' }];
  if (typeof faqs === 'string') {
    const blocks = faqs.split(/\n(?=Q:\s)/).filter(Boolean);
    if (!blocks.length) return [{ question: '', answer: '' }];
    return blocks.map((block) => {
      const match = block.match(/^Q:\s*(.*?)(?:\nA:\s*([\s\S]*))?$/i);
      return {
        question: match?.[1]?.trim() ?? block.trim(),
        answer: match?.[2]?.trim() ?? '',
      };
    });
  }
  if (Array.isArray(faqs)) {
    return faqs.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const row = item as Record<string, string>;
        return {
          question: row.q ?? row.question ?? '',
          answer: row.a ?? row.answer ?? '',
        };
      }
      return { question: String(item), answer: '' };
    });
  }
  if (typeof faqs === 'object') {
    return Object.entries(faqs as Record<string, string>).map(([question, answer]) => ({
      question,
      answer: String(answer),
    }));
  }
  return [{ question: '', answer: '' }];
}

export function serializeFaqs(items: FaqItem[]) {
  return items
    .filter((item) => item.question.trim() || item.answer.trim())
    .map((item) => `Q: ${item.question.trim()}\nA: ${item.answer.trim()}`)
    .join('\n');
}
