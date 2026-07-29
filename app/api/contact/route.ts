import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'admin@rv-chain.com';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !key || url.includes('your-project')) return null;
  return createClient(url, key);
}

async function sendViaResend(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'no_resend' };

  const from =
    process.env.CONTACT_FROM_EMAIL ?? 'rvchain Contact <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [TO_EMAIL],
      reply_to: input.email,
      subject: `rvchain contact: ${input.name || input.email}`,
      text: [
        `From: ${input.name || '(no name)'} <${input.email}>`,
        '',
        input.message,
        '',
        '— sent from rv-chain.com/contact',
      ].join('\n'),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: body || res.statusText };
  }
  return { ok: true };
}

/**
 * Contact form handler:
 * 1) Always stores the message in Supabase (contact_messages)
 * 2) Emails admin when RESEND_API_KEY is set (recommended)
 * 3) Client also attempts FormSubmit from the browser (see contact page)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    const name = (body.name ?? '').trim();
    const email = (body.email ?? '').trim().toLowerCase();
    const message = (body.message ?? '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!message || message.length < 3) {
      return NextResponse.json({ error: 'Please enter a message.' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
    }

    const sb = getSupabase();
    let saved = false;
    if (sb) {
      const { error } = await sb.from('contact_messages').insert({
        name: name || null,
        email,
        message,
      });
      if (error) {
        console.error('contact_messages insert', error.message);
      } else {
        saved = true;
      }
    }

    const resend = await sendViaResend({ name, email, message });
    const emailed = resend.ok;

    // Success if we saved and/or emailed. Client may also send FormSubmit.
    if (!saved && !emailed) {
      return NextResponse.json(
        {
          error:
            'Could not save or send your message. Please try again in a moment.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      saved,
      emailed,
      to: TO_EMAIL,
    });
  } catch (e) {
    console.error('contact api', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 }
    );
  }
}
