const DEMO_SMS_KEY = 'rvchain_demo_sms_pending';

function storeDemoCode(phone: string, code: string) {
  sessionStorage.setItem(
    DEMO_SMS_KEY,
    JSON.stringify({ phone, code, expires: Date.now() + 10 * 60 * 1000 })
  );
}

function checkDemoCode(phone: string, code: string): boolean {
  try {
    const raw = sessionStorage.getItem(DEMO_SMS_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as { phone: string; code: string; expires: number };
    if (data.expires < Date.now()) {
      sessionStorage.removeItem(DEMO_SMS_KEY);
      return false;
    }
    if (data.phone !== phone || data.code !== code) return false;
    sessionStorage.removeItem(DEMO_SMS_KEY);
    return true;
  } catch {
    return false;
  }
}

export async function sendParentSmsCode(phone: string): Promise<{
  ok: boolean;
  demo?: boolean;
  demoCode?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/family/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      demo?: boolean;
      demoCode?: string;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: data.error || 'Could not send code.' };
    if (data.demo && data.demoCode) {
      storeDemoCode(phone, data.demoCode);
    }
    return {
      ok: true,
      demo: data.demo,
      demoCode: data.demoCode,
    };
  } catch {
    return { ok: false, error: 'Network error sending SMS code.' };
  }
}

export async function verifyParentSmsCode(
  phone: string,
  code: string
): Promise<{ ok: boolean; error?: string; demo?: boolean }> {
  // Demo path works across serverless instances via sessionStorage
  if (checkDemoCode(phone, code.trim())) {
    return { ok: true, demo: true };
  }

  try {
    const res = await fetch('/api/family/verify-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok) return { ok: false, error: data.error || 'Invalid code.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error verifying code.' };
  }
}
