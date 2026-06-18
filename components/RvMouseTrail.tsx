'use client';

import { useEffect, useRef } from 'react';

interface TrackMark {
  x: number;
  y: number;
  angle: number;
  born: number;
}

const TRACK_LIFE_MS = 850;
const MIN_DISTANCE = 12;
const WHEEL_SPACING = 7;
const MAX_MARKS = 220;

function drawWheelTread(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  alpha: number
) {
  const dirt = `rgba(101, 67, 33, ${alpha})`;
  const groove = `rgba(62, 39, 18, ${alpha * 0.85})`;

  ctx.fillStyle = dirt;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(offsetX, i * 3.2, 2.8, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = groove;
  ctx.fillRect(offsetX - 1.2, -4.5, 2.4, 9);
}

function drawTrackMark(ctx: CanvasRenderingContext2D, mark: TrackMark, now: number) {
  const age = now - mark.born;
  const t = age / TRACK_LIFE_MS;
  if (t >= 1) return false;

  const alpha = (1 - t * t) * 0.62;

  ctx.save();
  ctx.translate(mark.x, mark.y);
  ctx.rotate(mark.angle);
  drawWheelTread(ctx, -WHEEL_SPACING, alpha);
  drawWheelTread(ctx, WHEEL_SPACING, alpha);
  ctx.restore();
  return true;
}

export default function RvMouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const marksRef = useRef<TrackMark[]>([]);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);
  const enabledRef = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const wideEnough = window.innerWidth >= 768;

    if (prefersReduced || !finePointer || !wideEnough) {
      enabledRef.current = false;
      return;
    }

    enabledRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      if (!enabledRef.current) return;

      const last = lastRef.current;
      if (last) {
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MIN_DISTANCE) return;

        marksRef.current.push({
          x: e.clientX,
          y: e.clientY,
          angle: Math.atan2(dy, dx),
          born: performance.now(),
        });

        if (marksRef.current.length > MAX_MARKS) {
          marksRef.current.splice(0, marksRef.current.length - MAX_MARKS);
        }
      }

      lastRef.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      lastRef.current = null;
    };

    const tick = (now: number) => {
      if (!enabledRef.current || !ctx) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      marksRef.current = marksRef.current.filter((mark) => drawTrackMark(ctx, mark, now));
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      enabledRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="rv-mouse-trail fixed inset-0 z-[5] pointer-events-none"
      aria-hidden
    />
  );
}