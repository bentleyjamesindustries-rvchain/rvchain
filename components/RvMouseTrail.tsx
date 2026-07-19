'use client';

import { useEffect, useRef } from 'react';

interface BootMark {
  x: number;
  y: number;
  angle: number;
  side: 'left' | 'right';
  born: number;
}

const PRINT_LIFE_MS = 850;
/** Pixels of mouse travel between prints — higher = fewer footprints */
const MIN_DISTANCE = 12;
const STRIDE_OFFSET = 3;
const MAX_MARKS = 120;

function drawBootPrint(
  ctx: CanvasRenderingContext2D,
  side: 'left' | 'right',
  alpha: number
) {
  const flip = side === 'left' ? -1 : 1;
  ctx.scale(flip, 1);

  const sole = `rgba(92, 64, 42, ${alpha})`;
  const tread = `rgba(55, 38, 22, ${alpha * 0.88})`;

  ctx.fillStyle = sole;
  ctx.beginPath();
  ctx.ellipse(3.2, 0, 4.2, 3, 0.15, 0, Math.PI * 2);
  ctx.ellipse(-2.8, 0, 3.4, 2.6, -0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = tread;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(0.5 + i * 1.4, 0, 1.8, 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = `rgba(72, 50, 32, ${alpha * 0.75})`;
  ctx.beginPath();
  ctx.ellipse(-3.2, 0, 1.4, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBootMark(ctx: CanvasRenderingContext2D, mark: BootMark, now: number) {
  const age = now - mark.born;
  const t = age / PRINT_LIFE_MS;
  if (t >= 1) return false;

  const alpha = (1 - t * t) * 0.65;

  ctx.save();
  ctx.translate(mark.x, mark.y);
  ctx.rotate(mark.angle);
  drawBootPrint(ctx, mark.side, alpha);
  ctx.restore();
  return true;
}

export default function RvMouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const marksRef = useRef<BootMark[]>([]);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const stepSideRef = useRef<'left' | 'right'>('left');
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

        const angle = Math.atan2(dy, dx);
        const perp = angle + Math.PI / 2;
        const side = stepSideRef.current;
        const offset = side === 'left' ? -STRIDE_OFFSET : STRIDE_OFFSET;

        marksRef.current.push({
          x: e.clientX + Math.cos(perp) * offset,
          y: e.clientY + Math.sin(perp) * offset,
          angle,
          side,
          born: performance.now(),
        });

        stepSideRef.current = side === 'left' ? 'right' : 'left';

        if (marksRef.current.length > MAX_MARKS) {
          marksRef.current.splice(0, marksRef.current.length - MAX_MARKS);
        }
      }

      lastRef.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      lastRef.current = null;
      stepSideRef.current = 'left';
    };

    const tick = (now: number) => {
      if (!enabledRef.current || !ctx) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      marksRef.current = marksRef.current.filter((mark) => drawBootMark(ctx, mark, now));
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