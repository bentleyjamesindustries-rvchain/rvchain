'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Baby, Check, Copy, Lock, Phone, Plus, Shield, Snowflake, Trash2, Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  addExplorer,
  ensureFamilyAccount,
  formatPhoneDisplay,
  MAX_EXPLORERS,
  markPhoneVerified,
  normalizePhoneInput,
  removeExplorer,
  resetExplorerPin,
  setExplorerFrozen,
  setParentPhone,
  type ExplorerAgeBand,
  type FamilyAccount,
} from '@/lib/familyExplorers';
import { sendParentSmsCode, verifyParentSmsCode } from '@/lib/parentPhoneVerify';
import { loadKidsProgress } from '@/lib/kidsProgress';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';

interface MyLittleExplorersPanelProps {
  parentUserId: string;
}

export default function MyLittleExplorersPanel({ parentUserId }: MyLittleExplorersPanelProps) {
  const [family, setFamily] = useState<FamilyAccount | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [consent, setConsent] = useState(false);

  const [nick, setNick] = useState('');
  const [pin, setPin] = useState('');
  const [ageBand, setAgeBand] = useState<ExplorerAgeBand>('unspecified');
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const refresh = useCallback(() => {
    const acc = ensureFamilyAccount(parentUserId);
    setFamily(acc);
    if (acc.parentPhone) setPhoneInput(acc.parentPhone);
  }, [parentUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!family) {
    return <p className="text-sm text-slate-400">Loading family…</p>;
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(family.familyCode);
      toast.success('Family code copied!');
    } catch {
      toast.info(family.familyCode);
    }
  };

  const handleSendCode = async () => {
    if (!consent) {
      return toast.error('Confirm you are the parent/guardian first.');
    }
    const phone = normalizePhoneInput(phoneInput);
    if (!phone) return toast.error('Enter a valid 10-digit US phone number.');
    setSending(true);
    const result = await sendParentSmsCode(phone);
    setSending(false);
    if (!result.ok) return toast.error(result.error || 'Failed to send.');
    setParentPhone(parentUserId, phone);
    setCodeSent(true);
    refresh();
    if (result.demo && result.demoCode) {
      toast.success(`Demo SMS code: ${result.demoCode}`, { duration: 12000 });
    } else {
      toast.success('Verification code sent by SMS.');
    }
  };

  const handleVerify = async () => {
    const phone = normalizePhoneInput(phoneInput) || family.parentPhone;
    if (!phone) return toast.error('Enter your phone number.');
    if (!/^\d{6}$/.test(smsCode.trim())) return toast.error('Enter the 6-digit code.');
    setVerifying(true);
    const result = await verifyParentSmsCode(phone, smsCode.trim());
    setVerifying(false);
    if (!result.ok) return toast.error(result.error || 'Invalid code.');
    markPhoneVerified(parentUserId, phone);
    setSmsCode('');
    setCodeSent(false);
    refresh();
    toast.success('Parent phone verified!');
  };

  const handleAddExplorer = async () => {
    setAdding(true);
    const result = await addExplorer(parentUserId, { nickname: nick, pin, ageBand });
    setAdding(false);
    if ('error' in result) return toast.error(result.error);
    setNick('');
    setPin('');
    setShowAdd(false);
    refresh();
    toast.success(`${result.explorer.nickname} is ready to explore!`);
  };

  const handleResetPin = async (explorerId: string, nickname: string) => {
    const newPin = window.prompt(`New 4–6 digit PIN for ${nickname}:`);
    if (!newPin) return;
    const result = await resetExplorerPin(parentUserId, explorerId, newPin);
    if ('error' in result) return toast.error(result.error);
    refresh();
    toast.success('PIN updated.');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-800/40 bg-gradient-to-br from-amber-950/40 to-emerald-950/20 p-4">
        <div className="flex items-center gap-2 text-amber-200 font-semibold text-sm mb-1">
          <Baby className="w-4 h-4" />
          My Explorers
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Create explorer profiles under your account. Explorers sign in with your family code, their
          nickname, and a PIN you set. You can freeze or remove explorers anytime.
        </p>
        <p className="text-[10px] text-amber-400/80 mt-2">{DEMO_NOTICE_SHORT}</p>
      </div>

      {/* Family code */}
      <div>
        <div className="text-xs text-slate-400 mb-1.5 font-medium">Family code</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono text-lg font-bold tracking-widest bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-emerald-300">
            {family.familyCode}
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="h-11 px-3 rounded-xl border border-slate-600 hover:bg-slate-800 flex items-center gap-1.5 text-xs font-semibold"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Explorers need this code + nickname + PIN. Demo: family data is saved on this device (same
          browser until cloud sync).
        </p>
      </div>

      {/* Phone verify */}
      <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-950/50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Phone className="w-4 h-4 text-sky-400" />
          Parent phone on file
          {family.phoneVerified && (
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5 ml-auto">
              <Check className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {family.phoneVerified ? (
          <p className="text-sm text-slate-300">{formatPhoneDisplay(family.parentPhone)}</p>
        ) : (
          <>
            <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-600"
              />
              <span>
                I am the parent/guardian of any explorers I create and can be reached at this number for
                verification.
              </span>
            </label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 h-10 text-sm"
            />
            {!codeSent ? (
              <button
                type="button"
                disabled={sending}
                onClick={handleSendCode}
                className="w-full h-10 rounded-xl bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-sm font-semibold"
              >
                {sending ? 'Sending…' : 'Send SMS code'}
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 h-10 text-sm tracking-widest"
                />
                <button
                  type="button"
                  disabled={verifying}
                  onClick={handleVerify}
                  className="px-4 h-10 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-sm font-semibold"
                >
                  Verify
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Explorer list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">
            Explorers{' '}
            <span className="text-slate-400">
              ({family.explorers.length}/{MAX_EXPLORERS})
            </span>
          </div>
          {family.phoneVerified && family.explorers.length < MAX_EXPLORERS && (
            <button
              type="button"
              onClick={() => setShowAdd((v) => !v)}
              className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add explorer
            </button>
          )}
        </div>

        {!family.phoneVerified && (
          <p className="text-xs text-amber-400/90 mb-3 flex items-start gap-1.5">
            <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Verify your phone above before adding explorers.
          </p>
        )}

        {showAdd && family.phoneVerified && (
          <div className="mb-3 space-y-2 rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-3">
            <input
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="Nickname (e.g. Scout)"
              maxLength={20}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 h-10 text-sm"
            />
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="PIN (4–6 digits)"
              maxLength={6}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 h-10 text-sm"
            />
            <select
              value={ageBand}
              onChange={(e) => setAgeBand(e.target.value as ExplorerAgeBand)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 h-10 text-sm"
            >
              <option value="unspecified">Age band (optional)</option>
              <option value="under-8">Under 8</option>
              <option value="8-12">8–12</option>
              <option value="13+">13+</option>
            </select>
            <button
              type="button"
              disabled={adding}
              onClick={handleAddExplorer}
              className="w-full h-10 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-sm font-semibold"
            >
              {adding ? 'Creating…' : 'Create explorer'}
            </button>
          </div>
        )}

        {family.explorers.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 border border-dashed border-slate-700 rounded-xl px-3">
            No explorers yet. Add an explorer profile after verifying your phone.
          </p>
        ) : (
          <div className="space-y-2">
            {family.explorers.map((exp) => {
              const progress = loadKidsProgress(`explorer:${exp.id}`);
              const finds = Object.keys(progress.finds).length;
              const cards = progress.ownedCardIds.length;
              return (
                <div
                  key={exp.id}
                  className={`rounded-xl border px-3 py-3 ${
                    exp.frozen
                      ? 'border-slate-700 bg-slate-900/40 opacity-80'
                      : 'border-slate-700 bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                        {exp.nickname}
                        {exp.frozen && (
                          <span className="text-[10px] text-sky-400 flex items-center gap-0.5">
                            <Snowflake className="w-3 h-3" /> Frozen
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        🌿 {finds} plants · 🃏 {cards} cards
                        {exp.ageBand !== 'unspecified' && ` · ${exp.ageBand}`}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => handleResetPin(exp.id, exp.nickname)}
                        className="text-[10px] px-2 py-1 rounded-lg border border-slate-600 hover:bg-slate-800 flex items-center gap-0.5"
                        title="Reset PIN"
                      >
                        <Lock className="w-3 h-3" /> PIN
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExplorerFrozen(parentUserId, exp.id, !exp.frozen);
                          refresh();
                          toast.success(exp.frozen ? 'Explorer unlocked' : 'Explorer frozen');
                        }}
                        className="text-[10px] px-2 py-1 rounded-lg border border-slate-600 hover:bg-slate-800 flex items-center gap-0.5"
                      >
                        {exp.frozen ? (
                          <>
                            <Unlock className="w-3 h-3" /> Unfreeze
                          </>
                        ) : (
                          <>
                            <Snowflake className="w-3 h-3" /> Freeze
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!window.confirm(`Remove ${exp.nickname}? Their progress stays on this device under their id.`)) return;
                          removeExplorer(parentUserId, exp.id);
                          refresh();
                          toast.success('Explorer removed');
                        }}
                        className="text-[10px] px-2 py-1 rounded-lg border border-red-900/50 text-red-300 hover:bg-red-950/40 flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800 pt-3 space-y-1">
        <p className="font-medium text-slate-400">Parent tips</p>
        <p>Explorer profiles are private to your family — not public accounts.</p>
        <p>Explorers cannot post on the adult forum. Supervise outdoor scavenger hunts.</p>
        <p>With Twilio env vars set, real SMS is used; otherwise demo codes appear in a toast.</p>
      </div>
    </div>
  );
}
