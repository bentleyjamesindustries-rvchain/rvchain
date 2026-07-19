'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from './GameShell';
import { getHighScore, saveHighScore } from '@/lib/kidsGames';

interface TrailRunGameProps {
  userId: string;
  onBack: () => void;
}

type Phase = 'ready' | 'playing' | 'over';

interface Obstacle {
  x: number;
  w: number;
  h: number;
  kind: 'log' | 'rock';
}

interface Leaf {
  x: number;
  y: number;
  taken: boolean;
}

const W = 800;
const H = 420;
const GROUND = 340;
const PLAYER_X = 120;
const PLAYER_W = 44;
const PLAYER_H = 52;

export default function TrailRunGame({ userId, onBack }: TrailRunGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>('ready');
  const scoreRef = useRef(0);
  const bestRef = useRef(getHighScore(userId, 'trail-run'));
  const jumpQueued = useRef(false);
  const rafRef = useRef(0);

  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bestRef.current);
  const [isNewBest, setIsNewBest] = useState(false);
  /** Bumps to hard-reset the world when starting a new run */
  const [runKey, setRunKey] = useState(0);

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const beginRun = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setIsNewBest(false);
    setRunKey((k) => k + 1);
    setPhaseBoth('playing');
  }, [setPhaseBoth]);

  const queueJump = useCallback(() => {
    if (phaseRef.current === 'ready') {
      beginRun();
      jumpQueued.current = true;
      return;
    }
    if (phaseRef.current === 'playing') {
      jumpQueued.current = true;
    }
  }, [beginRun]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        if (phaseRef.current === 'over') return;
        queueJump();
      }
      if ((e.code === 'Enter' || e.code === 'Space') && phaseRef.current === 'over') {
        e.preventDefault();
        beginRun();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [queueJump, beginRun]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerY = GROUND - PLAYER_H;
    let vy = 0;
    let onGround = true;
    let speed = 5.2;
    let spawnTimer = 50;
    let leafTimer = 30;
    let distance = 0;
    let leafBonus = 0;
    let scroll = 0;
    let lastTs = 0;
    let obstacles: Obstacle[] = [];
    let leaves: Leaf[] = [];
    let ended = false;

    const finish = () => {
      if (ended || phaseRef.current !== 'playing') return;
      ended = true;
      const finalScore = Math.floor(distance / 3) + leafBonus;
      scoreRef.current = finalScore;
      setScore(finalScore);
      const result = saveHighScore(userId, 'trail-run', finalScore);
      bestRef.current = result.best;
      setBest(result.best);
      setIsNewBest(result.isNewBest);
      setPhaseBoth('over');
    };

    const loop = (ts: number) => {
      const dt = lastTs ? Math.min(32, ts - lastTs) / 16.67 : 1;
      lastTs = ts;
      const playing = phaseRef.current === 'playing' && !ended;
      const ready = phaseRef.current === 'ready';
      const over = phaseRef.current === 'over' || ended;

      if (playing) {
        if (jumpQueued.current && onGround) {
          vy = -13.5;
          onGround = false;
        }
        jumpQueued.current = false;

        vy += 0.72 * dt;
        playerY += vy * dt;
        if (playerY >= GROUND - PLAYER_H) {
          playerY = GROUND - PLAYER_H;
          vy = 0;
          onGround = true;
        }

        speed = Math.min(11, 5.2 + distance / 900);
        scroll += speed * dt;
        distance += speed * dt;

        spawnTimer -= dt;
        leafTimer -= dt;
        if (spawnTimer <= 0) {
          const kind: Obstacle['kind'] = Math.random() > 0.55 ? 'log' : 'rock';
          obstacles.push({
            x: W + 20,
            w: kind === 'log' ? 54 : 36,
            h: kind === 'log' ? 28 : 34,
            kind,
          });
          spawnTimer = 65 + Math.random() * 55 - Math.min(18, speed * 1.5);
        }
        if (leafTimer <= 0) {
          leaves.push({
            x: W + 10,
            y: GROUND - 70 - Math.random() * 90,
            taken: false,
          });
          leafTimer = 28 + Math.random() * 40;
        }

        const move = speed * dt * 1.15;
        for (const o of obstacles) o.x -= move;
        for (const l of leaves) l.x -= move;
        obstacles = obstacles.filter((o) => o.x + o.w > -20);
        leaves = leaves.filter((l) => l.x > -30 && !l.taken);

        const px = PLAYER_X + 8;
        const py = playerY + 6;
        const pw = PLAYER_W - 16;
        const ph = PLAYER_H - 10;

        for (const o of obstacles) {
          const oy = GROUND - o.h;
          if (
            px < o.x + o.w - 6 &&
            px + pw > o.x + 6 &&
            py < oy + o.h &&
            py + ph > oy + 4
          ) {
            finish();
            break;
          }
        }

        for (const l of leaves) {
          if (l.taken) continue;
          if (px < l.x + 22 && px + pw > l.x && py < l.y + 22 && py + ph > l.y) {
            l.taken = true;
            leafBonus += 25;
          }
        }

        const total = Math.floor(distance / 3) + leafBonus;
        if (total !== scoreRef.current) {
          scoreRef.current = total;
          setScore(total);
        }
      }

      // --- draw ---
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0c4a6e');
      sky.addColorStop(0.5, '#155e75');
      sky.addColorStop(1, '#3f6212');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 200 - scroll * 0.15) % (W + 160) + W + 160) % (W + 160) - 80;
        ctx.beginPath();
        ctx.ellipse(cx, 50 + (i % 3) * 18, 48, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#14532d';
      for (let i = 0; i < 5; i++) {
        const hx = ((i * 200 - scroll * 0.25) % (W + 220) + W + 220) % (W + 220) - 110;
        ctx.beginPath();
        ctx.ellipse(hx + 100, GROUND - 20, 120, 55, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < 7; i++) {
        const tx = ((i * 150 - scroll * 0.5) % (W + 140) + W + 140) % (W + 140) - 70;
        ctx.fillStyle = '#44403c';
        ctx.fillRect(tx + 20, GROUND - 95, 12, 55);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(tx + 26, GROUND - 140);
        ctx.lineTo(tx - 10, GROUND - 75);
        ctx.lineTo(tx + 62, GROUND - 75);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(0, GROUND, W, 6);
      ctx.fillStyle = '#92400e';
      for (let i = 0; i < 18; i++) {
        const dx = ((i * 55 - scroll) % (W + 50) + W + 50) % (W + 50) - 25;
        ctx.fillRect(dx, GROUND + 16, 24, 3);
      }

      for (const l of leaves) {
        if (l.taken) continue;
        ctx.font = '22px serif';
        ctx.fillText('🍃', l.x, l.y + 18);
      }

      for (const o of obstacles) {
        const oy = GROUND - o.h;
        if (o.kind === 'log') {
          ctx.fillStyle = '#7c2d12';
          ctx.fillRect(o.x, oy, o.w, o.h);
          ctx.strokeStyle = '#431407';
          ctx.lineWidth = 2;
          ctx.strokeRect(o.x, oy, o.w, o.h);
        } else {
          ctx.fillStyle = '#57534e';
          ctx.beginPath();
          ctx.moveTo(o.x + o.w / 2, oy);
          ctx.lineTo(o.x + o.w, oy + o.h);
          ctx.lineTo(o.x, oy + o.h);
          ctx.closePath();
          ctx.fill();
        }
      }

      const bob = onGround ? Math.sin(scroll * 0.2) * 2 : 0;
      const pyDraw = playerY + bob;
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(PLAYER_X, pyDraw + 12, PLAYER_W, PLAYER_H - 16);
      ctx.beginPath();
      ctx.arc(PLAYER_X + PLAYER_W - 6, pyDraw + 16, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(PLAYER_X + PLAYER_W + 2, pyDraw + 4);
      ctx.lineTo(PLAYER_X + PLAYER_W + 10, pyDraw - 8);
      ctx.lineTo(PLAYER_X + PLAYER_W - 6, pyDraw + 8);
      ctx.fill();
      ctx.fillStyle = '#fdba74';
      ctx.beginPath();
      ctx.ellipse(PLAYER_X + 18, pyDraw + 32, 12, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(PLAYER_X + PLAYER_W + 2, pyDraw + 14, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c2410c';
      if (onGround) {
        const leg = Math.sin(scroll * 0.35) * 6;
        ctx.fillRect(PLAYER_X + 8, pyDraw + PLAYER_H - 14, 8, 12);
        ctx.fillRect(PLAYER_X + 28, pyDraw + PLAYER_H - 14 + leg * 0.15, 8, 12);
      } else {
        ctx.fillRect(PLAYER_X + 10, pyDraw + PLAYER_H - 10, 8, 10);
        ctx.fillRect(PLAYER_X + 26, pyDraw + PLAYER_H - 8, 8, 8);
      }

      ctx.fillStyle = 'rgba(15,23,42,0.55)';
      ctx.fillRect(12, 12, 168, 56);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Score ${scoreRef.current}`, 24, 38);
      ctx.font = '13px system-ui,sans-serif';
      ctx.fillStyle = '#fcd34d';
      ctx.fillText(`Best ${bestRef.current}`, 24, 56);

      if (ready) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px system-ui,sans-serif';
        ctx.fillText('Trail Run', W / 2, H / 2 - 30);
        ctx.font = '18px system-ui,sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('Tap or press Space to jump', W / 2, H / 2 + 10);
        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 16px system-ui,sans-serif';
        ctx.fillText('Tap anywhere to start', W / 2, H / 2 + 48);
        ctx.textAlign = 'left';
      }

      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px system-ui,sans-serif';
        ctx.fillText('Ouch! Trail end.', W / 2, H / 2 - 40);
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
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '15px system-ui,sans-serif';
        ctx.fillText('Use the buttons below', W / 2, H / 2 + 60);
        ctx.textAlign = 'left';
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [userId, setPhaseBoth, runKey]);

  return (
    <GameShell title="Trail Run" subtitle="Jump over logs · grab leaves" onBack={onBack}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto touch-none cursor-pointer block bg-slate-900 select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if (phaseRef.current === 'over') return;
            queueJump();
          }}
        />
        {phase === 'over' && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 px-4">
            <button
              type="button"
              onClick={beginRun}
              className="px-5 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg"
            >
              Play again
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-5 h-11 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold"
            >
              Arcade
            </button>
          </div>
        )}
      </div>
      <p className="px-3 py-2 text-center text-xs text-slate-500">
        Score {score}
        {best > 0 ? ` · Best ${best}` : ''} · Tap to jump
      </p>
    </GameShell>
  );
}
