import OpenAI from 'openai';
import { env } from '../config/env.js';

let client;
if (env.openaiApiKey) {
  client = new OpenAI({ apiKey: env.openaiApiKey });
}

export async function generateCoachAdvice(summary) {
  if (!client) {
    return {
      message:
        'Your protein intake looks low this week. Try adding paneer, dal, or rajma to 2 meals. Keep daily movement above 6,000 steps for steady XP gain.'
    };
  }

  const prompt = `You are RAVIVE AI Coach. Give concise, game-like guidance.
User summary: ${JSON.stringify(summary)}
Return max 5 bullets. Mention recovery missions if negative habits appear.`;

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt
  });

  const text = response.output_text || 'Stay consistent and complete one small mission right now.';
  return { message: text };
}
