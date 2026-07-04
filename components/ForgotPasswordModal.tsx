'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Smartphone, ArrowLeft, Eye, EyeOff, KeyRound, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import {
  RecoveryChannel,
  sendRecoveryCode,
  verifyRecoveryCode,
  updateUserPassword,
  explainRecoveryError,
  isValidEmail,
  isValidPhone,
  normalizePhone,
} from '@/lib/passwordRecovery';
import { supabase } from '@/lib/supabaseClient';

type Step = 'contact' | 'verify' | 'action';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onLoggedIn: () => void;
  initialEmail?: string;
}

export default function ForgotPasswordModal({
  onClose,
  onLoggedIn,
  initialEmail = '',
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('contact');
  const [channel, setChannel] = useState<RecoveryChannel>('email');
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const contact = channel === 'email' ? email : phone;
  const contactValid = channel === 'email' ? isValidEmail(email) : isValidPhone(phone);
  const contactDisplay =
    channel === 'email' ? email.trim() : normalizePhone(phone);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const selectChannel = (next: RecoveryChannel) => {
    if (next === channel) return;
    setChannel(next);
    setCode('');
    setStep('contact');
    setVerified(false);
    setResendCooldown(0);
  };

  const handleSendCode = async () => {
    if (!contactValid) {
      toast.error(
        channel === 'email' ? 'Enter a valid email address.' : 'Enter a valid phone number.'
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await sendRecoveryCode(channel, contact);
      if (error) throw error;
      toast.success(
        channel === 'email'
          ? '6-digit code sent to your email only.'
          : '6-digit code sent to your phone only.'
      );
      setStep('verify');
      setResendCooldown(60);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Could not send code.';
      toast.error(explainRecoveryError(raw));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.trim().length < 6) {
      toast.error('Enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await verifyRecoveryCode(channel, contact, code);
      if (error) throw error;
      setVerified(true);
      setStep('action');
      toast.success('Code verified! You can log in or set a new password.');
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Invalid or expired code.';
      toast.error(explainRecoveryError(raw));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await handleSendCode();
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expired. Verify your code again or use Sign In with your password.');
        setStep('verify');
        setVerified(false);
        return;
      }
      toast.success('Welcome back, RVer!');
      onLoggedIn();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateUserPassword(newPassword);
      if (error) throw error;
      toast.success('Password updated! You are signed in.');
      onLoggedIn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[112] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="modal bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">Forgot password</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              {step === 'contact' && 'Choose email or text — we send to one only'}
              {step === 'verify' && `Enter the code from ${channel === 'email' ? 'email' : 'text'}`}
              {step === 'action' && 'You’re verified'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'contact' && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Send passcode via
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => selectChannel('email')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
                    channel === 'email'
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => selectChannel('sms')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
                    channel === 'sms'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Text
                </button>
              </div>
            </div>

            {channel === 'email' ? (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@rv.com"
                  className="w-full bg-slate-800 border border-sky-700/50 px-4 h-11 rounded-2xl text-sm outline-none focus:border-sky-600"
                  autoComplete="email"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Code goes to this email only — not your phone.
                </p>
              </div>
            ) : (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Mobile number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-slate-800 border border-emerald-700/50 px-4 h-11 rounded-2xl text-sm outline-none focus:border-emerald-600"
                  autoComplete="tel"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Code goes to this number only — not your email. Use the phone on your account.
                </p>
              </div>
            )}

            <button
              onClick={handleSendCode}
              disabled={loading || !contactValid}
              className={`w-full disabled:opacity-40 h-11 rounded-2xl font-semibold text-sm transition ${
                channel === 'email'
                  ? 'bg-sky-700 hover:bg-sky-600'
                  : 'bg-emerald-700 hover:bg-emerald-600'
              }`}
            >
              {loading
                ? 'Sending…'
                : channel === 'email'
                  ? 'Send code to email'
                  : 'Send code to phone'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                channel === 'email'
                  ? 'bg-sky-950 text-sky-300 border border-sky-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {channel === 'email' ? <Mail className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
              Sent via {channel === 'email' ? 'email' : 'text'} to {contactDisplay}
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full bg-slate-800 border border-slate-600 px-4 h-12 rounded-2xl text-center text-xl font-mono tracking-[0.4em] outline-none focus:border-sky-600"
              autoComplete="one-time-code"
            />

            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length < 6}
              className="w-full bg-sky-700 hover:bg-sky-600 disabled:opacity-40 h-11 rounded-2xl font-semibold text-sm transition"
            >
              {loading ? 'Verifying…' : 'Verify passcode'}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep('contact');
                  setCode('');
                }}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Choose {channel === 'email' ? 'text' : 'email'} instead
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-sky-400 hover:text-sky-300 disabled:text-slate-600"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </div>
        )}

        {step === 'action' && verified && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Your passcode is valid. Continue to your account or set a new password below.
            </p>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 h-11 rounded-2xl font-semibold text-sm transition"
            >
              <LogIn className="w-4 h-4" />
              Log in to rvchain
            </button>

            <button
              type="button"
              onClick={() => setShowResetForm((v) => !v)}
              className="w-full flex items-center justify-center gap-2 border border-slate-600 hover:bg-slate-800 h-11 rounded-2xl text-sm transition"
            >
              <KeyRound className="w-4 h-4" />
              {showResetForm ? 'Hide password reset' : 'Reset my password'}
            </button>

            {showResetForm && (
              <div className="space-y-3 pt-1 border-t border-slate-800">
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (8+ characters)"
                    className="w-full bg-slate-800 border border-slate-600 pl-4 pr-11 h-11 rounded-2xl text-sm"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-800 border border-slate-600 px-4 h-11 rounded-2xl text-sm"
                  autoComplete="new-password"
                />
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-40 h-11 rounded-2xl font-semibold text-sm transition"
                >
                  {loading ? 'Saving…' : 'Save new password & log in'}
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-300 mt-4 w-full"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}