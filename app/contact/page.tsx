'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingPage from '@/components/MarketingPage';
import { submitContactMessage } from '@/lib/marketListings';
import { toast } from 'sonner';
import { Mail, MessageSquare } from 'lucide-react';

const CONTACT_EMAIL = 'admin@rv-chain.com';

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
    const { error } = await submitContactMessage({ name, email, message });
    setSending(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Message sent — thanks for reaching out.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <MarketingPage title="Contact us">
      <p className="text-lg text-white font-medium">
        Questions, feedback, or want to list gear? Reach out — we read every message.
      </p>

      <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-950/40 px-4 py-4 sm:px-5 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-slate-950" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-200">
              Email us directly
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-lg sm:text-xl font-bold text-white hover:text-amber-200 underline underline-offset-4 break-all"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=rvchain%20inquiry`}
          className="sm:ml-auto shrink-0 h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm inline-flex items-center justify-center"
        >
          Open email app
        </a>
      </div>

      <div className="rounded-2xl border border-slate-500 bg-slate-950/80 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          Or send a message here
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-200 mb-1.5 block">Name (optional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-slate-900 border-2 border-slate-500 focus:border-amber-500 text-white placeholder:text-slate-400 h-12 px-3 rounded-xl text-base outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-200 mb-1.5 block">Your email</span>
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
            <span className="text-sm font-semibold text-slate-200 mb-1.5 block">Message</span>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              rows={5}
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
      </div>

      <p className="text-sm text-slate-200">
        Prefer the Market?{' '}
        <Link href="/" className="text-amber-300 font-semibold underline underline-offset-2">
          List or browse gear →
        </Link>
      </p>
    </MarketingPage>
  );
}
