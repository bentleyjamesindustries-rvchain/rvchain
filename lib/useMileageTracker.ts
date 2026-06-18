'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { calculateDistance } from './parks';

const MIN_MOVE_MILES = 0.02;
const MAX_SPEED_MPH = 90;
const SESSION_KEY = 'rvchain_mileage_session';

interface TrackerSession {
  active: boolean;
  sessionMiles: number;
  startedAt: string | null;
}

function loadSession(): TrackerSession {
  if (typeof window === 'undefined') return { active: false, sessionMiles: 0, startedAt: null };
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { active: false, sessionMiles: 0, startedAt: null };
}

function saveSession(session: TrackerSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function useMileageTracker(onMilesAccumulated?: (miles: number) => void) {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionMiles, setSessionMiles] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const sessionMilesRef = useRef(0);

  const beginWatch = useCallback((resetMiles: boolean) => {
    if (!navigator.geolocation) {
      setGpsError('GPS is not supported on this device.');
      return;
    }

    if (watchIdRef.current !== null) return;

    setGpsError(null);
    if (resetMiles) {
      sessionMilesRef.current = 0;
      setSessionMiles(0);
      saveSession({ active: true, sessionMiles: 0, startedAt: new Date().toISOString() });
    } else {
      saveSession({
        active: true,
        sessionMiles: sessionMilesRef.current,
        startedAt: loadSession().startedAt ?? new Date().toISOString(),
      });
    }

    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const now = Date.now();
        setLastUpdate(new Date());
        setGpsError(null);

        const last = lastPosRef.current;
        if (last) {
          const miles = calculateDistance(last.lat, last.lng, lat, lng);
          const hours = (now - last.time) / (1000 * 60 * 60);
          const speed = hours > 0 ? miles / hours : 0;

          if (miles >= MIN_MOVE_MILES && speed <= MAX_SPEED_MPH) {
            sessionMilesRef.current += miles;
            setSessionMiles(sessionMilesRef.current);
            saveSession({
              active: true,
              sessionMiles: sessionMilesRef.current,
              startedAt: loadSession().startedAt,
            });
            onMilesAccumulated?.(miles);
          }
        }

        lastPosRef.current = { lat, lng, time: now };
      },
      (err) => {
        setGpsError(
          err.code === 1
            ? 'Location permission denied. Enable GPS to track mileage.'
            : 'Unable to get GPS signal. Try again outdoors.'
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }, [onMilesAccumulated]);

  useEffect(() => {
    const saved = loadSession();
    if (saved.active) {
      sessionMilesRef.current = saved.sessionMiles;
      setSessionMiles(saved.sessionMiles);
      beginWatch(false);
    }
  }, [beginWatch]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    lastPosRef.current = null;
    setIsTracking(false);
    saveSession({ active: false, sessionMiles: 0, startedAt: null });
  }, []);

  const startTracking = useCallback(() => {
    beginWatch(true);
  }, [beginWatch]);

  useEffect(() => () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  }, []);

  const resetSession = useCallback(() => {
    sessionMilesRef.current = 0;
    setSessionMiles(0);
    saveSession({ active: isTracking, sessionMiles: 0, startedAt: loadSession().startedAt });
  }, [isTracking]);

  return {
    isTracking,
    sessionMiles,
    lastUpdate,
    gpsError,
    startTracking,
    stopTracking,
    resetSession,
  };
}