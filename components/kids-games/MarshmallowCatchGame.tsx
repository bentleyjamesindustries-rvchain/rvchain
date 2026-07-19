'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from './GameShell';
import { HoldButton, MobileControlBar } from './MobileGameControls';
import { getHighScore, saveHighScore } from '@/lib/kidsGames';

interface MarshmallowCatchGameProps {
  userId: string;
  onBack: () => void;
}

type Phase = 'ready' | 'playing' | 'over';

interface Drop {
  x: number;
  y: number;
  vy: number;
  good: boolean;
  r: number;
}

const W = 800;
const H = 420;
const BASKET_W = 88;
const BASKET_H = 36;
const BASKET_Y = H - 70;

export default function MarshmallowCatchGame({ userId, onBack }: MarshmallowCatchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>('ready');
  const scoreRef = useRef(0);
  const bestRef = useRef(getHighScore(userId, 'marshmallow-catch'));
  const basketX = useRef(W / 2 - BASKET_W / 2);
  const keys = useRef({ left: false, right: false });
  const pointerActive = useRef(false);
  const rafRef = useRef(0);

  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bestRef.current);
  const [lives, setLives] = useState(3);
  const [isNewBest, setIsNewBest] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const beginRun = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    setIsNewBest(false);
    basketX.current = W / 2 - BASKET_W / 2;
    setRunKey((k) => k + 1);
    setPhaseBoth('playing');
  }, [setPhaseBoth]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = true;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (phaseRef.current === 'ready' || phaseRef.current === 'over') beginRun();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [beginRun]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drops: Drop[] = [];
    let spawnTimer = 40;
    let livesLeft = 3;
    let lastTs = 0;
    let fireFlicker = 0;
    let ended = false;

    const finish = () => {
      if (ended) return;
      ended = true;
      const finalScore = scoreRef.current;
      setScore(finalScore);
      const result = saveHighScore(userId, 'marshmallow-catch', finalScore);
      bestRef.current = result.best;
      setBest(result.best);
      setIsNewBest(result.isNewBest);
      setLives(0);
      setPhaseBoth('over');
    };

    const clientToGameX = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * W;
    };

    const moveBasketToClientX = (clientX: number) => {
      basketX.current = Math.max(
        8,
        Math.min(W - BASKET_W - 8, clientToGameX(clientX) - BASKET_W / 2)
      );
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      if (phaseRef.current === 'ready' || phaseRef.current === 'over') return;
      pointerActive.current = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (phaseRef.current === 'playing') {
        moveBasketToClientX(e.clientX);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (phaseRef.current !== 'playing') return;
      // Follow finger whenever dragging OR whenever touch is active
      if (!pointerActive.current && e.pointerType === 'mouse' && e.buttons === 0) return;
      e.preventDefault();
      moveBasketToClientX(e.clientX);
    };
    const onPointerUp = (e: PointerEvent) => {
      pointerActive.current = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    const loop = (ts: number) => {
      const dt = lastTs ? Math.min(32, ts - lastTs) / 16.67 : 1;
      lastTs = ts;
      fireFlicker += dt;
      const playing = phaseRef.current === 'playing' && !ended;
      const ready = phaseRef.current === 'ready';
      const over = phaseRef.current === 'over' || ended;

      if (playing) {
        const moveSpeed = 7.5 * dt;
        if (keys.current.left) basketX.current -= moveSpeed;
        if (keys.current.right) basketX.current += moveSpeed;
        basketX.current = Math.max(8, Math.min(W - BASKET_W - 8, basketX.current));

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const good = Math.random() > 0.28;
          drops.push({
            x: 40 + Math.random() * (W - 80),
            y: -20,
            vy: 2.4 + Math.random() * 2.2 + Math.min(3, scoreRef.current / 80),
            good,
            r: good ? 14 : 12,
          });
          spawnTimer = Math.max(18, 42 - scoreRef.current / 15);
        }

        for (const d of drops) {
          d.y += d.vy * dt * 1.1;
        }

        const bx = basketX.current;
        const next: Drop[] = [];
        for (const d of drops) {
          const inBasket =
            d.y + d.r >= BASKET_Y &&
            d.y - d.r <= BASKET_Y + BASKET_H &&
            d.x >= bx - 4 &&
            d.x <= bx + BASKET_W + 4;

          if (inBasket) {
            if (d.good) {
              scoreRef.current += 10;
              setScore(scoreRef.current);
            } else {
              livesLeft -= 1;
              setLives(livesLeft);
              if (livesLeft <= 0) finish();
            }
            continue;
          }

          if (d.y > H + 30) {
            if (d.good) {
              livesLeft -= 1;
              setLives(livesLeft);
              if (livesLeft <= 0) finish();
            }
            continue;
          }
          next.push(d);
        }
        drops = next;
      }

      // sky night camp
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0f172a');
      sky.addColorStop(0.55, '#1e1b4b');
      sky.addColorStop(1, '#422006');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // stars
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 97) % W;
        const sy = (i * 53) % 180;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // trees silhouette
      ctx.fillStyle = '#052e16';
      for (let i = 0; i < 6; i++) {
        const tx = i * 140 + 20;
        ctx.beginPath();
        ctx.moveTo(tx + 30, H - 100);
        ctx.lineTo(tx, H - 40);
        ctx.lineTo(tx + 60, H - 40);
        ctx.closePath();
        ctx.fill();
      }

      // ground
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, H - 48, W, 48);

      // campfire
      const fx = W / 2;
      const fy = H - 52;
      ctx.fillStyle = '#57534e';
      ctx.fillRect(fx - 28, fy, 56, 10);
      const flame = 18 + Math.sin(fireFlicker * 0.4) * 4;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(fx, fy - flame * 0.4, 14, flame, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(fx, fy - flame * 0.55, 7, flame * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // drops
      for (const d of drops) {
        if (d.good) {
          ctx.fillStyle = '#fafaf9';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fcd34d';
          ctx.beginPath();
          ctx.arc(d.x, d.y + 3, d.r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#44403c';
          ctx.beginPath();
          ctx.arc(d.x - 3, d.y - 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // basket / stick
      const bx = basketX.current;
      ctx.fillStyle = '#a8a29e';
      ctx.fillRect(bx + BASKET_W / 2 - 3, BASKET_Y - 40, 6, 44);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(bx, BASKET_Y, BASKET_W, BASKET_H);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.strokeRect(bx, BASKET_Y, BASKET_W, BASKET_H);
      ctx.fillStyle = '#ea580c';
      ctx.font = '20px serif';
      ctx.fillText('🔥', bx + BASKET_W / 2 - 12, BASKET_Y + 26);

      // HUD
      ctx.fillStyle = 'rgba(15,23,42,0.55)';
      ctx.fillRect(12, 12, 200, 56);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Score ${scoreRef.current}`, 24, 38);
      ctx.font = '13px system-ui,sans-serif';
      ctx.fillStyle = '#fcd34d';
      ctx.fillText(`Best ${bestRef.current}`, 24, 56);
      ctx.fillStyle = '#fda4af';
      ctx.font = '16px system-ui,sans-serif';
      ctx.fillText(`Lives ${'❤️'.repeat(Math.max(0, livesLeft))}`, W - 140, 40);

      if (ready) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px system-ui,sans-serif';
        ctx.fillText('Marshmallow Catch', W / 2, H / 2 - 36);
        ctx.font = '16px system-ui,sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('Catch white mallows · avoid charcoal', W / 2, H / 2);
        ctx.fillStyle = '#fdba74';
        ctx.font = 'bold 15px system-ui,sans-serif';
        ctx.fillText('Tap or press Enter to start', W / 2, H / 2 + 40);
        ctx.textAlign = 'left';
      }

      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px system-ui,sans-serif';
        ctx.fillText('Campfire closed!', W / 2, H / 2 - 36);
        ctx.font = '20px system-ui,sans-serif';
        ctx.fillStyle = '#fde68a';
        ctx.fillText(`Score ${scoreRef.current}`, W / 2, H / 2);
        ctx.fillStyle = '#86efac';
        ctx.font = '16px system-ui,sans-serif';
        ctx.fillText(
          scoreRef.current >= bestRef.current && scoreRef.current > 0
            ? 'New best!'
            : `Best ${bestRef.current}`,
          W / 2,
          H / 2 + 28
        );
        ctx.textAlign = 'left';
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [userId, setPhaseBoth, runKey, beginRun]);

  return (
    <GameShell
      title="Marshmallow Catch"
      subtitle="Catch mallows · skip charcoal"
      onBack={onBack}
    >
      <div className="flex flex-col">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto touch-none cursor-pointer block bg-slate-900 select-none"
          style={{ touchAction: 'none' }}
        />

        {phase === 'ready' && (
          <div className="p-3 border-t border-slate-700 space-y-2">
            <p className="text-center text-sm text-slate-300">
              Drag on the screen or use the buttons to catch mallows
            </p>
            <button
              type="button"
              onClick={beginRun}
              className="w-full min-h-[52px] rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-base font-black"
            >
              Play →
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <MobileControlBar>
            <HoldButton
              label="◀"
              sub="left"
              className="bg-amber-700 text-white"
              onHoldStart={() => {
                keys.current.left = true;
                keys.current.right = false;
              }}
              onHoldEnd={() => {
                keys.current.left = false;
              }}
            />
            <HoldButton
              label="▶"
              sub="right"
              className="bg-amber-700 text-white"
              onHoldStart={() => {
                keys.current.right = true;
                keys.current.left = false;
              }}
              onHoldEnd={() => {
                keys.current.right = false;
              }}
            />
          </MobileControlBar>
        )}

        {phase === 'over' && (
          <div className="flex flex-col sm:flex-row gap-2 p-3 border-t border-slate-700">
            <button
              type="button"
              onClick={beginRun}
              className="flex-1 min-h-[52px] rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold"
            >
              Play again
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 min-h-[52px] rounded-2xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold"
            >
              Arcade
            </button>
          </div>
        )}
      </div>
      <p className="px-3 py-2 text-center text-xs text-slate-500">
        Score {score} · Lives {lives}
        {best > 0 ? ` · Best ${best}` : ''} · drag canvas or hold ◀ ▶
      </p>
    </GameShell>
  );
}
