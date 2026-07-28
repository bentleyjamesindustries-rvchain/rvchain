'use client';

import { useState } from 'react';
import MarketingPage from '@/components/MarketingPage';
import { submitContactMessage } from '@/lib/marketListings';
import { toast } from 'sonner';

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
    <MarketingPage title="Contact">
      <p>Questions, feedback, or want to list gear? Reach out.</p>
      <form onSubmit={onSubmit} className="space-y-3 pt-2 max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="w-full bg-slate-900 border border-slate-700 h-11 px-3 rounded-xl text-sm"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full bg-slate-900 border border-slate-700 h-11 px-3 rounded-xl text-sm"
        />
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          rows={5}
          className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-sm"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full h-11 rounded-2xl bg-amber-600 hover:bg-amber-500 font-semibold text-sm disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </form>
      <p className="text-xs text-slate-500 pt-4">
        Prefer email? Write us at{' '}
        <a href="mailto:hello@rv-chain.com" className="text-sky-400 underline">
          hello@rv-chain.com
        </a>
        .
      </p>
    </MarketingPage>
  );
}
