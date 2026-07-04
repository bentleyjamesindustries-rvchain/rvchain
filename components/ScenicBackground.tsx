'use client';

import { useEffect, useRef, useState } from 'react';

const PAN_START = 5;
/** How far the image pans (%) across a full page scroll — lower = slower drift. */
const PAN_RANGE = 30;
/** How quickly the background catches up to scroll — lower = smoother, slower feel. */
const PAN_LERP = 0.07;

export default function ScenicBackground() {
  const [positionY, setPositionY] = useState(PAN_START);
  const targetYRef = useRef(PAN_START);
  const rafRef = useRef(0);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateTarget = () => {
      const scrollY = window.scrollY;
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(scrollY / scrollable, 1);
      const target = PAN_START + progress * PAN_RANGE;
      targetYRef.current = target;
      if (reduceMotionRef.current) {
        setPositionY(target);
      }
    };

    const animate = () => {
      if (!reduceMotionRef.current) {
        setPositionY((prev) => {
          const target = targetYRef.current;
          const next = prev + (target - prev) * PAN_LERP;
          return Math.abs(target - next) < 0.05 ? target : next;
        });
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    updateTarget();
    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
      cancelAnimationFrame(rafRef.current);
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