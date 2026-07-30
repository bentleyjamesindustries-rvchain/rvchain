import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  TRAILHEAD_SYSTEM,
  modeInstruction,
  FREE_AI_MESSAGES_PER_DAY,
  type TrailheadMode,
} from '@/lib/trailheadAi';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.XAI_MODEL ?? 'grok-4-1-fast-non-reasoning';

function getOpenAI() {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });
}

async function userHasAiPro(authHeader: string | null): Promise<boolean> {
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !anon) return false;
  try {
    const sb = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData } = await sb.auth.getUser();
    if (!userData.user) return false;
    const { data: profile } = await sb
      .from('profiles')
      .select('ai_pro, is_admin, seller_pro')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (profile?.ai_pro || profile?.is_admin) return true;
    const mods = (process.env.NEXT_PUBLIC_MODERATOR_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (userData.user.email && mods.includes(userData.user.email.toLowerCase())) return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const client = getOpenAI();
    if (!client) {
      return NextResponse.json(
        {
          error:
            'Trailhead AI is not configured yet. Add XAI_API_KEY in Vercel environment variables.',
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      mode?: TrailheadMode;
      messages?: { role: 'user' | 'assistant'; content: string }[];
      imageDataUrl?: string | null;
      freeTierUsed?: number;
    };

    const mode = (body.mode ?? 'general') as TrailheadMode;
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    if (messages.length === 0) {
      return NextResponse.json({ error: 'Message required.' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const isPro = await userHasAiPro(authHeader);
    const freeUsed = Number(body.freeTierUsed ?? 0);
    if (!isPro && freeUsed >= FREE_AI_MESSAGES_PER_DAY) {
      return NextResponse.json(
        {
          error: `Free daily limit reached (${FREE_AI_MESSAGES_PER_DAY} messages). AI Pro unlocks unlimited Trailhead AI.`,
          code: 'LIMIT',
        },
        { status: 429 }
      );
    }

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      return NextResponse.json({ error: 'User message required.' }, { status: 400 });
    }

    type ContentPart =
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } };

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${TRAILHEAD_SYSTEM}\n\n${modeInstruction(mode)}`,
      },
    ];

    for (const m of messages) {
      if (m === lastUser && body.imageDataUrl && body.imageDataUrl.startsWith('data:image')) {
        const parts: ContentPart[] = [
          { type: 'text', text: m.content || 'What can you tell me about this image?' },
          { type: 'image_url', image_url: { url: body.imageDataUrl } },
        ];
        openaiMessages.push({ role: 'user', content: parts });
      } else {
        openaiMessages.push({
          role: m.role,
          content: m.content,
        });
      }
    }

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: openaiMessages,
      temperature: 0.6,
      max_tokens: 1200,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ||
      'I could not generate a reply. Please try again.';

    return NextResponse.json({
      reply: text,
      model: MODEL,
      pro: isPro,
    });
  } catch (e) {
    console.error('trailhead ai', e);
    const msg = e instanceof Error ? e.message : 'AI request failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
