'use client';

import { useEffect, useState } from 'react';

export default function ScenicBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollable, setScrollable] = useState(1);

  useEffect(() => {
    const update = () => {
      setScrollY(window.scrollY);
      setScrollable(Math.max(document.documentElement.scrollHeight - window.innerHeight, 1));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const progress = Math.min(scrollY / scrollable, 1);
  // Pan from soft mountains (top) to family campsite (bottom) while image always fills the screen
  const positionY = 5 + progress * 78;

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