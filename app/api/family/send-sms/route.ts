import { NextRequest, NextResponse } from 'next/server';

/** In-memory demo codes (per phone). Resets on server restart. */
const demoCodes = new Map<string, { code: string; expires: number }>();

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
      (process.env.TWILIO_VERIFY_SERVICE_SID || process.env.TWILIO_FROM_NUMBER)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone);
    if (!phone) {
      return NextResponse.json({ error: 'Enter a valid US phone number.' }, { status: 400 });
    }

    if (twilioConfigured() && process.env.TWILIO_VERIFY_SERVICE_SID) {
      const sid = process.env.TWILIO_ACCOUNT_SID!;
      const token = process.env.TWILIO_AUTH_TOKEN!;
      const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const form = new URLSearchParams({ To: phone, Channel: 'sms' });
      const res = await fetch(
        `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        console.error('Twilio Verify send failed', errText);
        return NextResponse.json(
          { error: 'SMS provider error. Try again or use demo mode.' },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, demo: false });
    }

    // Demo fallback: 6-digit code, return to client for testing
    const code = String(Math.floor(100000 + Math.random() * 900000));
    demoCodes.set(phone, { code, expires: Date.now() + 10 * 60 * 1000 });
    // Expose on global for verify route in same process
    (globalThis as unknown as { __rvchainDemoSms?: Map<string, { code: string; expires: number }> })
      .__rvchainDemoSms = demoCodes;

    return NextResponse.json({
      ok: true,
      demo: true,
      demoCode: code,
      message: 'Demo mode — no real SMS sent.',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export { demoCodes };
