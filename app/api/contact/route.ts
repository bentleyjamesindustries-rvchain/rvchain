import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'admin@rv-chain.com';

function getServiceSupabase() {
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

/** FormSubmit — works without API keys; first message may need inbox confirmation. */
async function sendViaFormSubmit(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TO_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: input.name || 'Website visitor',
        email: input.email,
        message: input.message,
        _subject: `rvchain contact from ${input.name || input.email}`,
        _template: 'table',
        _captcha: 'false',
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    if (!res.ok) {
      return { ok: false, error: data.message || res.statusText };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'FormSubmit failed' };
  }
}

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

    // Store a copy in Supabase when available
    const sb = getServiceSupabase();
    if (sb) {
      await sb.from('contact_messages').insert({
        name: name || null,
        email,
        message,
      });
    }

    // Prefer Resend when configured; otherwise FormSubmit → admin@rv-chain.com
    let emailOk = false;
    let emailError = '';

    const resend = await sendViaResend({ name, email, message });
    if (resend.ok) {
      emailOk = true;
    } else {
      const fs = await sendViaFormSubmit({ name, email, message });
      if (fs.ok) emailOk = true;
      else emailError = fs.error || resend.error || 'Could not send email';
    }

    if (!emailOk) {
      return NextResponse.json(
        {
          error:
            emailError ||
            'Could not deliver email. Please try again later.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 }
    );
  }
}
