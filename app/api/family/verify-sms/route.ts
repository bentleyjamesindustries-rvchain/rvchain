import { NextRequest, NextResponse } from 'next/server';

function normalizePhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone.trim().startsWith('+') && digits.length >= 10) return `+${digits}`;
  return null;
}

function twilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone);
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!phone) {
      return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Enter the 6-digit code.' }, { status: 400 });
    }

    if (twilioConfigured()) {
      const sid = process.env.TWILIO_ACCOUNT_SID!;
      const token = process.env.TWILIO_AUTH_TOKEN!;
      const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const form = new URLSearchParams({ To: phone, Code: code });
      const res = await fetch(
        `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        }
      );
      const data = (await res.json()) as { status?: string };
      if (!res.ok || data.status !== 'approved') {
        return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    const store =
      (globalThis as unknown as { __rvchainDemoSms?: Map<string, { code: string; expires: number }> })
        .__rvchainDemoSms ?? new Map();
    const entry = store.get(phone);
    if (!entry || entry.expires < Date.now()) {
      return NextResponse.json(
        { error: 'Code expired. Send a new one.' },
        { status: 400 }
      );
    }
    if (entry.code !== code) {
      return NextResponse.json({ error: 'Invalid code.' }, { status: 400 });
    }
    store.delete(phone);
    return NextResponse.json({ ok: true, demo: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
