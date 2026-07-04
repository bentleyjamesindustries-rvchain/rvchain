'use client';

import { useEffect, useRef, useState } from 'react';

const PAN_START = 5;
/** Full vertical sweep so mountains → campsite are visible by page bottom. */
const PAN_RANGE = 78;
/** Lower = background eases in more slowly after scroll. */
const PAN_LERP = 0.028;
const SNAP_THRESHOLD = 0.04;

/** Gentle ease-in-out so pan accelerates and decelerates through the scroll journey. */
function easeScrollProgress(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function ScenicBackground() {
  const [positionY, setPositionY] = useState(PAN_START);
  const targetYRef = useRef(PAN_START);
  const currentYRef = useRef(PAN_START);
  const rafRef = useRef(0);
  const animatingRef = useRef(false);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      const scrollY = window.scrollY;
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const rawProgress = Math.min(scrollY / scrollable, 1);
      const progress = easeScrollProgress(rawProgress);
      const target = PAN_START + progress * PAN_RANGE;
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

    updateTarget();
    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget);

    return () => {
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
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