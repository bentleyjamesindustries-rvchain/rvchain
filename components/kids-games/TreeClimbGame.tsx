'use client';

/**
 * Tree Climb — kid-friendly climber inspired by classic tower jumpers (e.g. Icy Tower, 2001).
 * Jump branch to branch, climb as high as you can. Fall off-screen = game over.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from './GameShell';
import { getHighScore, saveHighScore } from '@/lib/kidsGames';

interface TreeClimbGameProps {
  userId: string;
  onBack: () => void;
}

type Phase = 'ready' | 'playing' | 'over';

interface Platform {
  x: number;
  y: number; // world Y (up is smaller y)
  w: number;
  kind: 'branch' | 'leaf' | 'start';
  vx: number; // moving platforms
}

const W = 480;
const H = 560;
const PW = 36;
const PH = 40;
const GRAVITY = 0.48;
const JUMP_V = -11.2;
const MOVE_ACCEL = 0.55;
const MOVE_MAX = 6.2;
const FRICTION = 0.82;

export default function TreeClimbGame({ userId, onBack }: TreeClimbGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>('ready');
  const scoreRef = useRef(0);
  const bestRef = useRef(getHighScore(userId, 'tree-climb'));
  const keys = useRef({ left: false, right: false, jump: false });
  const jumpQueued = useRef(false);
  const rafRef = useRef(0);

  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bestRef.current);
  const [runKey, setRunKey] = useState(0);

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const beginRun = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setRunKey((k) => k + 1);
    setPhaseBoth('playing');
  }, [setPhaseBoth]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        keys.current.jump = true;
        jumpQueued.current = true;
        if (phaseRef.current === 'ready') beginRun();
        if (phaseRef.current === 'over') beginRun();
      }
      if (e.code === 'Enter' && (phaseRef.current === 'ready' || phaseRef.current === 'over')) {
        beginRun();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        keys.current.jump = false;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [beginRun]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerX = W / 2 - PW / 2;
    let playerY = 0;
    let vx = 0;
    let vy = 0;
    let onGround = false;
    let cameraY = 0;
    let maxHeight = 0;
    let platforms: Platform[] = [];
    let highestPlatY = 0;
    let lastTs = 0;
    let ended = false;
    let anim = 0;

    const resetWorld = () => {
      platforms = [
        { x: 40, y: H - 80, w: W - 80, kind: 'start', vx: 0 },
      ];
      highestPlatY = H - 80;
      // seed a column of branches above start
      let y = H - 80;
      for (let i = 0; i < 18; i++) {
        y -= 48 + Math.random() * 28;
        const w = 70 + Math.random() * 50;
        const x = 24 + Math.random() * (W - w - 48);
        const moving = i > 6 && Math.random() < 0.22;
        platforms.push({
          x,
          y,
          w,
          kind: Math.random() > 0.7 ? 'leaf' : 'branch',
          vx: moving ? (Math.random() > 0.5 ? 1.2 : -1.2) : 0,
        });
        highestPlatY = y;
      }
      playerX = W / 2 - PW / 2;
      playerY = H - 80 - PH;
      vx = 0;
      vy = 0;
      onGround = true;
      cameraY = 0;
      maxHeight = 0;
      ended = false;
      anim = 0;
    };

    // Fresh world each run (effect remounts via runKey)
    resetWorld();

    const spawnAbove = () => {
      while (highestPlatY > cameraY - 80) {
        const gap = 44 + Math.random() * 32 + Math.min(24, maxHeight / 400);
        const y = highestPlatY - gap;
        const w = Math.max(52, 90 - maxHeight / 120 + Math.random() * 40);
        const x = 20 + Math.random() * (W - w - 40);
        const moving = maxHeight > 200 && Math.random() < 0.28;
        platforms.push({
          x,
          y,
          w,
          kind: Math.random() > 0.65 ? 'leaf' : 'branch',
          vx: moving ? (1.1 + Math.random() * 1.4) * (Math.random() > 0.5 ? 1 : -1) : 0,
        });
        highestPlatY = y;
      }
      // prune far below camera
      platforms = platforms.filter((p) => p.y < cameraY + H + 120);
    };

    const finish = () => {
      if (ended) return;
      ended = true;
      const finalScore = Math.floor(maxHeight);
      scoreRef.current = finalScore;
      setScore(finalScore);
      const result = saveHighScore(userId, 'tree-climb', finalScore);
      bestRef.current = result.best;
      setBest(result.best);
      setPhaseBoth('over');
    };

    const clientToX = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * W;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (phaseRef.current === 'ready' || phaseRef.current === 'over') {
        beginRun();
        return;
      }
      if (phaseRef.current !== 'playing') return;
      const gx = clientToX(e.clientX);
      // left half = left, right half = right, center upper = jump
      if (e.clientY - canvas.getBoundingClientRect().top < canvas.getBoundingClientRect().height * 0.35) {
        jumpQueued.current = true;
      } else if (gx < W * 0.4) {
        keys.current.left = true;
        keys.current.right = false;
      } else if (gx > W * 0.6) {
        keys.current.right = true;
        keys.current.left = false;
      } else {
        jumpQueued.current = true;
      }
    };
    const onPointerUp = () => {
      keys.current.left = false;
      keys.current.right = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (phaseRef.current !== 'playing' || e.buttons === 0) return;
      const gx = clientToX(e.clientX);
      keys.current.left = gx < W * 0.42;
      keys.current.right = gx > W * 0.58;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);

    const loop = (ts: number) => {
      const dt = lastTs ? Math.min(32, ts - lastTs) / 16.67 : 1;
      lastTs = ts;
      anim += dt;

      const playing = phaseRef.current === 'playing' && !ended;
      const ready = phaseRef.current === 'ready';
      const over = phaseRef.current === 'over' || ended;

      if (playing) {
        // horizontal
        if (keys.current.left) vx -= MOVE_ACCEL * dt;
        if (keys.current.right) vx += MOVE_ACCEL * dt;
        if (!keys.current.left && !keys.current.right) {
          if (onGround) vx *= Math.pow(FRICTION, dt);
          else vx *= Math.pow(0.98, dt);
        }
        vx = Math.max(-MOVE_MAX, Math.min(MOVE_MAX, vx));

        // jump
        if ((jumpQueued.current || keys.current.jump) && onGround) {
          vy = JUMP_V;
          onGround = false;
          jumpQueued.current = false;
          keys.current.jump = false;
        } else {
          jumpQueued.current = false;
        }

        // gravity (slightly stronger higher for tension)
        const gScale = 1 + Math.min(0.25, maxHeight / 4000);
        vy += GRAVITY * gScale * dt;

        playerX += vx * dt;
        playerY += vy * dt;

        // walls
        if (playerX < 4) {
          playerX = 4;
          vx = Math.abs(vx) * 0.35;
        }
        if (playerX + PW > W - 4) {
          playerX = W - 4 - PW;
          vx = -Math.abs(vx) * 0.35;
        }

        // move platforms
        for (const p of platforms) {
          if (p.vx !== 0) {
            p.x += p.vx * dt;
            if (p.x < 12) {
              p.x = 12;
              p.vx = Math.abs(p.vx);
            }
            if (p.x + p.w > W - 12) {
              p.x = W - 12 - p.w;
              p.vx = -Math.abs(p.vx);
            }
          }
        }

        // platform collision (only when falling)
        onGround = false;
        if (vy >= 0) {
          for (const p of platforms) {
            const feet = playerY + PH;
            const prevFeet = feet - vy * dt;
            if (
              prevFeet <= p.y + 4 &&
              feet >= p.y &&
              feet <= p.y + 16 &&
              playerX + PW - 6 > p.x &&
              playerX + 6 < p.x + p.w
            ) {
              playerY = p.y - PH;
              vy = 0;
              onGround = true;
              // ride moving branch
              if (p.vx) playerX += p.vx * dt;
              break;
            }
          }
        }

        // height score (world coords: lower y = higher)
        const height = Math.max(0, H - 80 - playerY);
        if (height > maxHeight) {
          maxHeight = height;
          scoreRef.current = Math.floor(maxHeight);
          setScore(scoreRef.current);
        }

        // camera follows when climbing above mid-screen
        const targetCam = playerY - H * 0.55;
        if (targetCam < cameraY) {
          // pull camera up with player; ramp follow speed with height
          const follow = 0.12 + Math.min(0.2, maxHeight / 5000);
          cameraY += (targetCam - cameraY) * follow * dt * 3;
        }
        // also slowly scroll up after first climb (Icy Tower feel)
        if (maxHeight > 80) {
          const autoScroll = 0.35 + Math.min(2.8, maxHeight / 900);
          cameraY -= autoScroll * dt;
        }

        spawnAbove();

        // fall below view
        if (playerY > cameraY + H + 20) {
          finish();
        }
      }

      // --- draw ---
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#7dd3fc');
      sky.addColorStop(0.4, '#86efac');
      sky.addColorStop(1, '#166534');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // trunk
      const trunkX = W / 2 - 28;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(trunkX, 0, 56, H);
      ctx.fillStyle = '#92400e';
      for (let i = 0; i < 20; i++) {
        const ty = ((i * 40 - cameraY * 0.3) % (H + 40)) - 20;
        ctx.fillRect(trunkX + 8, ty, 6, 22);
        ctx.fillRect(trunkX + 40, ty + 15, 5, 18);
      }

      // far leaves
      ctx.fillStyle = 'rgba(22, 101, 52, 0.35)';
      for (let i = 0; i < 12; i++) {
        const lx = (i * 53 + 10) % W;
        const ly = ((i * 71 - cameraY * 0.15) % (H + 60)) - 30;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 40, 28, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const toScreen = (wy: number) => wy - cameraY;

      // platforms
      for (const p of platforms) {
        const sy = toScreen(p.y);
        if (sy < -40 || sy > H + 40) continue;

        if (p.kind === 'start') {
          ctx.fillStyle = '#a16207';
          ctx.fillRect(p.x, sy, p.w, 14);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(p.x, sy, p.w, 5);
          ctx.strokeStyle = '#fffbeb';
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x, sy, p.w, 14);
        } else if (p.kind === 'leaf') {
          // bright leafy pad
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.ellipse(p.x + p.w / 2, sy + 6, p.w / 2, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ecfdf5';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#86efac';
          ctx.beginPath();
          ctx.ellipse(p.x + p.w / 2, sy + 4, p.w / 3, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // branch — warm wood, very visible
          ctx.fillStyle = '#d97706';
          ctx.fillRect(p.x, sy, p.w, 12);
          ctx.fillStyle = '#fde68a';
          ctx.fillRect(p.x + 2, sy + 2, p.w - 4, 4);
          ctx.strokeStyle = '#fff7ed';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(p.x, sy, p.w, 12);
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(p.x + 8, sy + 2, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.vx !== 0) {
          ctx.fillStyle = '#f472b6';
          ctx.font = '10px system-ui';
          ctx.fillText('↔', p.x + p.w / 2 - 5, sy - 4);
        }
      }

      // player (pudgy squirrel)
      if (!ready || true) {
        const sx = playerX;
        const sy = toScreen(playerY);
        const bob = onGround ? Math.sin(anim * 0.12) * 1.2 : 0;

        // shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(sx + PW / 2, sy + PH + 2, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // body
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(sx + PW / 2, sy + 24 + bob, 16, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffedd5';
        ctx.beginPath();
        ctx.ellipse(sx + PW / 2, sy + 26 + bob, 9, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // head
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.arc(sx + PW / 2, sy + 12 + bob, 13, 0, Math.PI * 2);
        ctx.fill();
        // ears
        ctx.beginPath();
        ctx.arc(sx + 8, sy + 4 + bob, 6, 0, Math.PI * 2);
        ctx.arc(sx + PW - 8, sy + 4 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.arc(sx + 8, sy + 5 + bob, 3, 0, Math.PI * 2);
        ctx.arc(sx + PW - 8, sy + 5 + bob, 3, 0, Math.PI * 2);
        ctx.fill();

        // eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(sx + 14, sy + 11 + bob, 2.5, 0, Math.PI * 2);
        ctx.arc(sx + 22, sy + 11 + bob, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx + 14.5, sy + 10 + bob, 1, 0, Math.PI * 2);
        ctx.arc(sx + 22.5, sy + 10 + bob, 1, 0, Math.PI * 2);
        ctx.fill();

        // blush + smile
        ctx.fillStyle = 'rgba(251,113,133,0.45)';
        ctx.beginPath();
        ctx.ellipse(sx + 10, sy + 15 + bob, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(sx + 26, sy + 15 + bob, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#9f1239';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(sx + PW / 2, sy + 15 + bob, 3, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();

        // fluffy tail
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.ellipse(sx + 4, sy + 22 + bob, 8, 12, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // HUD
      if (playing || over) {
        ctx.fillStyle = 'rgba(15,23,42,0.55)';
        ctx.fillRect(10, 10, 150, 52);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px system-ui,sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Height ${scoreRef.current}`, 20, 34);
        ctx.font = '12px system-ui,sans-serif';
        ctx.fillStyle = '#fcd34d';
        ctx.fillText(`Best ${bestRef.current}`, 20, 52);
      }

      if (ready) {
        ctx.fillStyle = 'rgba(15,23,42,0.4)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px system-ui,sans-serif';
        ctx.fillText('Tree Climb', W / 2, H / 2 - 50);
        ctx.font = '15px system-ui,sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('Jump branch to branch — go high!', W / 2, H / 2 - 14);
        ctx.fillText('← → move · Space / tap top to jump', W / 2, H / 2 + 12);
        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 15px system-ui,sans-serif';
        ctx.fillText('Tap Play or press Enter', W / 2, H / 2 + 52);
        ctx.textAlign = 'left';
      }

      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px system-ui,sans-serif';
        ctx.fillText('Fell out of the tree!', W / 2, H / 2 - 40);
        ctx.fillStyle = '#fde68a';
        ctx.font = '20px system-ui,sans-serif';
        ctx.fillText(`Height ${scoreRef.current}`, W / 2, H / 2);
        ctx.fillStyle = '#86efac';
        ctx.font = '15px system-ui,sans-serif';
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
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [userId, setPhaseBoth, runKey, beginRun]);

  return (
    <GameShell
      title="Tree Climb"
      subtitle="Icy Tower–style · jump up the tree"
      onBack={onBack}
    >
      <div className="relative flex justify-center bg-slate-950">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full max-w-[420px] h-auto touch-none cursor-pointer block select-none mx-auto"
        />
        {phase === 'ready' && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
            <button
              type="button"
              onClick={beginRun}
              className="pointer-events-auto px-8 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-black shadow-lg"
            >
              Play →
            </button>
          </div>
        )}
        {phase === 'over' && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 px-4">
            <button
              type="button"
              onClick={beginRun}
              className="px-5 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg"
            >
              Climb again
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
        {phase === 'playing'
          ? `Height ${score}${best > 0 ? ` · Best ${best}` : ''} · ←→ move · jump on branches`
          : 'Classic tower climb — don’t fall!'}
      </p>
    </GameShell>
  );
}
