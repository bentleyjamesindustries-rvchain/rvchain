'use client';

import { useEffect, useRef, useState } from 'react';

/** Desktop: vehicle lineup in frame on first paint. */
const DESKTOP_PAN_START = 35;
const DESKTOP_PAN_RANGE = 50;
/** Mobile: tighter crop so the full rig lineup shows on tall portrait screens. */
const MOBILE_PAN_START = 52;
const MOBILE_PAN_RANGE = 18;
const PAN_LERP = 0.028;
const SNAP_THRESHOLD = 0.04;

function easeScrollProgress(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

export default function ScenicBackground() {
  const [positionY, setPositionY] = useState(DESKTOP_PAN_START);
  const targetYRef = useRef(DESKTOP_PAN_START);
  const currentYRef = useRef(DESKTOP_PAN_START);
  const rafRef = useRef(0);
  const animatingRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const mobileRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    mobileRef.current = isMobileViewport();

    const panStart = () => (mobileRef.current ? MOBILE_PAN_START : DESKTOP_PAN_START);
    const panRange = () => (mobileRef.current ? MOBILE_PAN_RANGE : DESKTOP_PAN_RANGE);

    // Set initial crop for this device
    const start = panStart();
    currentYRef.current = start;
    targetYRef.current = start;
    setPositionY(start);

    const tick = () => {
      const prev = currentYRef.current;
      const target = targetYRef.current;
      const delta = target - prev;

      if (Math.abs(delta) < SNAP_THRESHOLD) {
        currentYRef.current = target;
        setPositionY(target);
        animatingRef.current = false;
        return;
      }

      const next = prev + delta * PAN_LERP;
      currentYRef.current = next;
      setPositionY(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    const startEasing = () => {
      if (reduceMotionRef.current || animatingRef.current) return;
      animatingRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };

    const updateTarget = () => {
      mobileRef.current = isMobileViewport();
      const scrollY = window.scrollY;
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const rawProgress = Math.min(scrollY / scrollable, 1);
      const progress = easeScrollProgress(rawProgress);
      const target = panStart() + progress * panRange();
      targetYRef.current = target;

      if (reduceMotionRef.current) {
        currentYRef.current = target;
        setPositionY(target);
        return;
      }

      if (Math.abs(target - currentYRef.current) >= SNAP_THRESHOLD) {
        startEasing();
      }
    };

    // Keep fixed bg covering mobile browser chrome (address bar show/hide)
    const setVh = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--rv-vvh', `${h}px`);
    };

    setVh();
    updateTarget();
    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', () => {
      setVh();
      updateTarget();
    });
    window.visualViewport?.addEventListener('resize', setVh);
    window.visualViewport?.addEventListener('scroll', setVh);

    return () => {
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
      window.visualViewport?.removeEventListener('resize', setVh);
      window.visualViewport?.removeEventListener('scroll', setVh);
      cancelAnimationFrame(rafRef.current);
      animatingRef.current = false;
    };
  }, []);

  return (
    <>
      <div className="rv-scene-fixed" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/rvchain-scene-bg.jpg"
          alt=""
          className="rv-scene-img"
          style={{ objectPosition: `center ${positionY}%` }}
        />
      </div>
      <div className="rv-scene-overlay" aria-hidden />
    </>
  );
}
