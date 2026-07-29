'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingPage from '@/components/MarketingPage';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';

const TO_EMAIL = 'admin@rv-chain.com';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      toast.error('Email and message are required');
      return;
    }

    setSending(true);
    try {
      // 1) Save on our server (+ Resend email if configured on Vercel)
      const apiRes = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const apiData = (await apiRes.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
        saved?: boolean;
        emailed?: boolean;
      };

      // 2) Also email from the browser (FormSubmit often blocks server-side = "Forbidden")
      let formSubmitOk = false;
      try {
        const fsRes = await fetch(
          `https://formsubmit.co/ajax/${encodeURIComponent(TO_EMAIL)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              name: name.trim() || 'Website visitor',
              email: email.trim(),
              message: message.trim(),
              _subject: `rvchain contact from ${name.trim() || email.trim()}`,
              _template: 'table',
              _captcha: 'false',
              _replyto: email.trim(),
            }),
          }
        );
        const fsData = (await fsRes.json().catch(() => ({}))) as {
          success?: string | boolean;
          message?: string;
        };
        formSubmitOk =
          fsRes.ok &&
          (fsData.success === true ||
            fsData.success === 'true' ||
            String(fsData.message || '').toLowerCase().includes('success'));
      } catch {
        formSubmitOk = false;
      }

      const ok = apiRes.ok || formSubmitOk || apiData.saved || apiData.emailed;
      if (!ok) {
        toast.error(
          apiData.error ||
            'Could not send. If this is the first message ever, check admin@rv-chain.com for a confirmation link from FormSubmit, then try again.'
        );
        return;
      }

      toast.success('Message sent — we will get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <MarketingPage title="Contact us">
      <p className="text-lg text-white font-medium">
        Questions, feedback, or want to list gear? Send a message below — it goes to{' '}
        <span className="text-amber-300 font-bold">{TO_EMAIL}</span>. No mail app opens.
      </p>

      <div className="rounded-2xl border-2 border-slate-500 bg-slate-950/90 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-lg">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          Send us a message
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-100 mb-1.5 block">Name (optional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-slate-900 border-2 border-slate-500 focus:border-amber-500 text-white placeholder:text-slate-400 h-12 px-3 rounded-xl text-base outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-100 mb-1.5 block">Your email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-slate-900 border-2 border-slate-500 focus:border-amber-500 text-white placeholder:text-slate-400 h-12 px-3 rounded-xl text-base outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-100 mb-1.5 block">Message</span>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              rows={6}
              className="w-full bg-slate-900 border-2 border-slate-500 focus:border-amber-500 text-white placeholder:text-slate-400 px-3 py-3 rounded-xl text-base outline-none resize-y"
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>
        <p className="text-xs text-slate-300 leading-relaxed">
          First-time note: FormSubmit may send a one-time activation email to {TO_EMAIL}. Open that
          link once so future messages land in the inbox. You can also read messages anytime in
          Supabase → Table Editor → <code className="text-amber-200">contact_messages</code>.
        </p>
      </div>

      <p className="text-sm text-slate-100">
        Prefer the Market?{' '}
        <Link href="/" className="text-amber-300 font-semibold underline underline-offset-2">
          List or browse gear →
        </Link>
      </p>
    </MarketingPage>
  );
}
