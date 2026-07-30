'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  MapPin,
  Sparkles,
  Trophy,
  Play,
  Square,
  Camera,
  ChevronLeft,
  Bot,
  Caravan,
  Navigation,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  VEHICLE_TYPES,
  type VehicleType,
  type TrailSession,
  listTrailSessions,
  completeTrailSession,
  trailLogStats,
  getTrailPassportStamps,
  trailPassportSummary,
  getEarnedTrailBadges,
  TRAIL_LOG_BADGES,
  vehicleLabel,
  vehicleEmoji,
} from '@/lib/trailLog';
import { getCurrentPositionOnce, formatCoords } from '@/lib/geoState';
import { compressImageFile } from '@/lib/imageCompress';
import { useI18n } from '@/lib/i18n/context';

type View = 'hub' | 'log' | 'active' | 'passport' | 'badges' | 'history' | 'howto';

interface AdultExplorerPanelProps {
  userId: string;
  displayHandle?: string | null;
  onGoAi?: () => void;
  onGoMarket?: () => void;
}

/**
 * Trail Log for adult recreational vehicle adventures.
 * Not for under-13 collection of location/photos.
 */
export default function AdultExplorerPanel({
  userId,
  displayHandle,
  onGoAi,
  onGoMarket,
}: AdultExplorerPanelProps) {
  const { t } = useI18n();
  const [view, setView] = useState<View>('hub');
  const [adultOk, setAdultOk] = useState(false);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  void tick;

  const name = displayHandle?.trim() || 'Explorer';
  const vehicleLabelI18n = (id: string) => {
    const map: Record<string, string> = {
      camper: t('trailLog.vCamper'),
      'offroad-truck': t('trailLog.vTruck'),
      atv: t('trailLog.vAtv'),
      'dirt-bike': t('trailLog.vDirt'),
      snowmobile: t('trailLog.vSnow'),
      other: t('trailLog.vOther'),
    };
    return map[id] || id;
  };

  const stats = trailLogStats(userId);
  const sessions = listTrailSessions(userId);

  // Active log form
  const [vehicle, setVehicle] = useState<VehicleType>('atv');
  const [note, setNote] = useState('');
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    setNote('');
    setStartedAt(null);
    setLat(null);
    setLng(null);
    setPhoto(null);
    setVehicle('atv');
  }, []);

  useEffect(() => {
    if (view === 'hub') refresh();
  }, [view]);

  if (!adultOk) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div className="rounded-3xl border border-sky-700/40 bg-gradient-to-br from-sky-950/50 via-slate-900 to-slate-950 p-6 space-y-4">
          <div className="inline-flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-wide">
            <MapPin className="w-4 h-4" />
            {t('trailLog.title')}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('trailLog.ageGateTitle')}</h1>
          <p className="text-sm text-slate-200 leading-relaxed">{t('trailLog.ageGateBody')}</p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>{t('trailLog.ageGateLi1')}</li>
            <li>{t('trailLog.ageGateLi2')}</li>
            <li>{t('trailLog.ageGateLi3')}</li>
          </ul>
          <button
            type="button"
            onClick={() => setAdultOk(true)}
            className="w-full min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm"
          >
            {t('trailLog.ageGateCta')}
          </button>
        </div>
      </div>
    );
  }

  const grabGps = async () => {
    setGpsBusy(true);
    try {
      const fix = await getCurrentPositionOnce();
      setLat(fix.lat);
      setLng(fix.lng);
      toast.success(t('trailLog.locPinned'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not get location');
    } finally {
      setGpsBusy(false);
    }
  };

  const onPhoto = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1200, 0.8, 600_000);
      setPhoto(dataUrl);
    } catch {
      toast.error(t('trailLog.photoFail'));
    }
  };

  const startLog = () => {
    setStartedAt(new Date().toISOString());
    setView('active');
  };

  const finishLog = async () => {
    if (!startedAt) return;
    setSaving(true);
    try {
      const session = await completeTrailSession(userId, {
        vehicleType: vehicle,
        note,
        lat,
        lng,
        photoDataUrl: photo,
        startedAt,
      });
      toast.success(
        session.stateCode
          ? `Log saved · ${session.stateCode} stamped`
          : 'Log saved · add GPS next time for state stamps'
      );
      resetForm();
      refresh();
      setView('hub');
    } catch {
      toast.error(t('trailLog.saveFail'));
    } finally {
      setSaving(false);
    }
  };

  if (view === 'howto') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        <button type="button" onClick={() => setView('hub')} className="text-sm text-slate-300 hover:text-white min-h-[44px]">
          {t('common.back')}
        </button>
        <div className="rounded-3xl border border-slate-600 bg-slate-900/90 p-6 space-y-3 text-sm text-slate-100">
          <h2 className="text-xl font-bold text-white">{t('trailLog.howtoTitle')}</h2>
          <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
            <li>{t('trailLog.howto1')}</li>
            <li>{t('trailLog.howto2')}</li>
            <li>{t('trailLog.howto3')}</li>
            <li>{t('trailLog.howto4')}</li>
          </ol>
          <p className="text-xs text-slate-400 pt-2">{t('trailLog.howtoNote')}</p>
        </div>
      </div>
    );
  }

  if (view === 'passport') {
    const stamps = getTrailPassportStamps(userId);
    const summary = trailPassportSummary(userId);
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        <button
          type="button"
          onClick={() => setView('hub')}
          className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" /> {t('common.back')}
        </button>
        <div className="rounded-3xl border border-amber-700/40 bg-gradient-to-br from-amber-950/50 via-slate-900 to-sky-950/40 p-5 sm:p-7">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{t('trailLog.passportTitle')}</h2>
          <p className="text-sm text-slate-200 mt-1">
            {t('trailLog.passportSub')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-600/40 text-amber-100">
              {t('trailLog.statesCount', { n: summary.stamped, total: summary.total })}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-600/40 text-sky-100">
              {t('trailLog.gpsLogs', { n: summary.withGps })}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-600/40 text-emerald-100">
              {t('trailLog.pctComplete', { n: summary.pct })}
            </span>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800 max-w-md">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-sky-400"
              style={{ width: `${summary.pct}%` }}
            />
          </div>
          {summary.stamped === 0 && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setView('log');
              }}
              className="mt-4 min-h-[44px] px-5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold"
            >
              {t('trailLog.logWithGps')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {stamps.map((s) => (
            <div
              key={s.code}
              title={
                s.stamped
                  ? `${s.name}: ${s.findCount} log${s.findCount === 1 ? '' : 's'}`
                  : `${s.name}: not stamped`
              }
              className={`rounded-xl border px-1 py-2 text-center ${
                s.stamped
                  ? 'border-amber-600/50 bg-amber-950/40 text-amber-100'
                  : 'border-slate-800 bg-slate-950/50 text-slate-600'
              }`}
            >
              <div className="text-xs font-bold">{s.code}</div>
              {s.stamped && <div className="text-[9px] opacity-80">{s.findCount}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'badges') {
    const earned = new Set(getEarnedTrailBadges(userId).map((b) => b.id));
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        <button
          type="button"
          onClick={() => setView('hub')}
          className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" /> {t('common.back')}
        </button>
        <h2 className="text-xl font-bold text-white">{t('trailLog.badgesTitle')}</h2>
        <p className="text-sm text-slate-300">
          {earned.size} / {TRAIL_LOG_BADGES.length} unlocked
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {TRAIL_LOG_BADGES.map((b) => {
            const got = earned.has(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-4 flex gap-3 ${
                  got
                    ? 'border-violet-600/40 bg-violet-950/30'
                    : 'border-slate-800 bg-slate-950/40 opacity-60'
                }`}
              >
                <div className="text-3xl">{b.emoji}</div>
                <div>
                  <div className="font-bold text-white">{b.name}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{b.description}</div>
                  <div className="text-[10px] font-semibold mt-1 text-violet-300">
                    {got ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        <button
          type="button"
          onClick={() => setView('hub')}
          className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" /> {t('common.back')}
        </button>
        <h2 className="text-xl font-bold text-white">{t('trailLog.historyTitle')}</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400">{t('trailLog.historyEmpty')}</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s: TrailSession) => (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 flex gap-3"
              >
                {s.photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.photoDataUrl}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                    {vehicleEmoji(s.vehicleType)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white">
                    {vehicleLabel(s.vehicleType)}
                    {s.stateCode ? ` · ${s.stateCode}` : ''}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(s.endedAt).toLocaleString()}
                    {s.lat != null && s.lng != null
                      ? ` · ${formatCoords(s.lat, s.lng)}`
                      : ''}
                  </div>
                  {s.note && (
                    <p className="text-sm text-slate-200 mt-1 line-clamp-2">{s.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'log' || view === 'active') {
    return (
      <div className="max-w-lg mx-auto px-3 sm:px-6 py-4 space-y-4">
        <button
          type="button"
          onClick={() => {
            resetForm();
            setView('hub');
          }}
          className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" /> {t('common.cancel')}
        </button>

        <div className="rounded-3xl border border-sky-700/40 bg-slate-900 p-5 space-y-4">
          <h2 className="text-xl font-bold text-white">
            {view === 'active' ? t('trailLog.activeLog') : t('trailLog.logRide')}
          </h2>
          <p className="text-sm text-slate-300">
            {t('trailLog.pickVehicle')}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {VEHICLE_TYPES.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={view === 'active'}
                onClick={() => setVehicle(v.id)}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${
                  vehicle === v.id
                    ? 'border-sky-500 bg-sky-950/50 text-white'
                    : 'border-slate-700 bg-slate-950 text-slate-300'
                }`}
              >
                <span className="mr-1.5">{v.emoji}</span>
                {vehicleLabelI18n(v.id)}
              </button>
            ))}
          </div>

          {view === 'log' && (
            <button
              type="button"
              onClick={startLog}
              className="w-full min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> {t('trailLog.startLog')}
            </button>
          )}

          {view === 'active' && (
            <>
              <p className="text-xs text-emerald-300 font-semibold">
                {t('trailLog.started', { time: startedAt ? new Date(startedAt).toLocaleTimeString() : '—' })}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={gpsBusy}
                  onClick={() => void grabGps()}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-600 text-sm font-semibold text-slate-100 hover:border-sky-500 flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  {gpsBusy ? t('trailLog.gettingGps') : lat != null ? t('trailLog.gpsPinned') : t('trailLog.pinGps')}
                </button>
                <label className="min-h-[44px] px-4 rounded-xl border border-slate-600 text-sm font-semibold text-slate-100 hover:border-sky-500 flex items-center gap-2 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  {photo ? t('trailLog.photoAdded') : t('trailLog.addPhoto')}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => void onPhoto(e.target.files)}
                  />
                </label>
              </div>

              {lat != null && lng != null && (
                <p className="text-xs text-slate-400">{formatCoords(lat, lng)}</p>
              )}
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="w-full max-h-40 object-cover rounded-xl" />
              )}

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={t('trailLog.notePh')}
                className="w-full bg-slate-950 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
              />

              <button
                type="button"
                disabled={saving}
                onClick={() => void finishLog()}
                className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Square className="w-4 h-4" />
                {saving ? t('trailLog.saving') : t('trailLog.endSave')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Hub
  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="rounded-3xl border border-sky-700/40 bg-gradient-to-br from-sky-950/60 via-slate-900 to-violet-950/40 p-6 sm:p-8">
        <div className="text-sky-400 text-xs font-bold uppercase tracking-wide mb-1">
          {t('trailLog.title')}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {name !== 'Explorer' ? `${name} · ${t('trailLog.title')}` : t('trailLog.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-200 max-w-lg leading-relaxed">
          {t('trailLog.subtitle')}
        </p>
        <p className="mt-3 text-sm font-semibold text-sky-100">
          {t('trailLog.statsLine', {
            sessions: stats.sessions,
            states: stats.states,
            badges: stats.badges,
            badgeTotal: stats.badgeTotal,
            vehicles: stats.vehiclesUsed,
          })}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          resetForm();
          setView('log');
        }}
        className="w-full min-h-[52px] rounded-3xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-base flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" /> {t('trailLog.logRide')}
      </button>

      <div className="grid sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setView('passport')}
          className="text-left rounded-3xl border border-amber-700/40 bg-amber-950/30 hover:border-amber-500/50 p-5 transition"
        >
          <MapPin className="w-8 h-8 text-amber-300 mb-3" />
          <div className="text-lg font-bold text-white">{t('trailLog.passport')}</div>
          <p className="text-sm text-slate-300 mt-1">{t('trailLog.passportDesc')}</p>
        </button>
        <button
          type="button"
          onClick={() => setView('badges')}
          className="text-left rounded-3xl border border-violet-700/40 bg-violet-950/30 hover:border-violet-500/50 p-5 transition"
        >
          <Trophy className="w-8 h-8 text-violet-300 mb-3" />
          <div className="text-lg font-bold text-white">{t('trailLog.badges')}</div>
          <p className="text-sm text-slate-300 mt-1">
            {t('trailLog.badgesCount', { n: stats.badges, total: stats.badgeTotal })}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setView('history')}
          className="text-left rounded-3xl border border-emerald-700/40 bg-emerald-950/30 hover:border-emerald-500/50 p-5 transition"
        >
          <Sparkles className="w-8 h-8 text-emerald-300 mb-3" />
          <div className="text-lg font-bold text-white">{t('trailLog.history')}</div>
          <p className="text-sm text-slate-300 mt-1">{t('trailLog.historyDesc')}</p>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onGoAi?.()}
          className="text-left rounded-2xl border border-violet-600/40 bg-violet-950/20 hover:border-violet-400 px-4 py-3 flex items-center gap-3"
        >
          <Bot className="w-5 h-5 text-violet-300 shrink-0" />
          <div>
            <div className="text-sm font-bold text-white">{t('trailLog.preRideAi')}</div>
            <div className="text-xs text-slate-400">{t('trailLog.preRideAiDesc')}</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onGoMarket?.()}
          className="text-left rounded-2xl border border-amber-700/40 bg-amber-950/20 hover:border-amber-500 px-4 py-3 flex items-center gap-3"
        >
          <Caravan className="w-5 h-5 text-amber-300 shrink-0" />
          <div>
            <div className="text-sm font-bold text-white">{t('trailLog.needGear')}</div>
            <div className="text-xs text-slate-400">{t('trailLog.needGearDesc')}</div>
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setView('howto')}
        className="w-full text-left rounded-2xl border border-slate-700 bg-slate-900/40 px-4 py-3 flex items-center gap-3 text-sm text-slate-300 hover:text-white"
      >
        <BookOpen className="w-4 h-4 shrink-0" />
        {t('trailLog.howWorks')}
      </button>
    </div>
  );
}
