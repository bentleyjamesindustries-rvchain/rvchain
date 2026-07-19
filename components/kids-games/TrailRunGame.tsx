'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from './GameShell';
import { getHighScore, saveHighScore } from '@/lib/kidsGames';
import {
  getTrailRunCharacter,
  loadTrailRunCharacter,
  saveTrailRunCharacter,
  TRAIL_RUN_CHARACTERS,
  type TrailRunCharacter,
  type TrailRunCharacterId,
} from '@/lib/trailRunCharacters';

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
const PLAYER_W = 48;
const PLAYER_H = 50;

function drawCuteRunner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  onGround: boolean,
  scroll: number,
  character: TrailRunCharacter
) {
  const p = character.palette;
  const cx = x + PLAYER_W / 2;
  // ~25% slower bounce / leg cycle than before
  const bob = onGround ? Math.sin(scroll * 0.165) * 1.5 : 0;
  const baseY = y + bob;
  const legSwing = onGround ? Math.sin(scroll * 0.3) * 5 : 0;
  const style = character.style;

  // ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(cx, y + PLAYER_H + 2, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.fillStyle = p.bodyDark;
  if (onGround) {
    ctx.beginPath();
    ctx.ellipse(cx - 10, baseY + PLAYER_H - 6 + legSwing * 0.15, 7, 9, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 10, baseY + PLAYER_H - 6 - legSwing * 0.15, 7, 9, -0.15, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(cx - 8, baseY + PLAYER_H - 10, 7, 7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 10, baseY + PLAYER_H - 8, 7, 7, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // tail by species
  if (style === 'fox') {
    ctx.fillStyle = p.bodyDark;
    ctx.beginPath();
    ctx.ellipse(cx - 24, baseY + 22, 10, 12, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.accent || p.belly;
    ctx.beginPath();
    ctx.ellipse(cx - 24, baseY + 20, 5, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'bunny') {
    ctx.fillStyle = p.bodyDark;
    ctx.beginPath();
    ctx.arc(cx - 20, baseY + 28, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.arc(cx - 20, baseY + 28, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // bear stubby tail
    ctx.fillStyle = p.bodyDark;
    ctx.beginPath();
    ctx.arc(cx - 20, baseY + 26, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // chubby body — bear a bit rounder
  const bodyRx = style === 'bear' ? 24 : 22;
  const bodyRy = style === 'bear' ? 19 : 18;
  ctx.fillStyle = p.body;
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 30, bodyRx, bodyRy, 0, 0, Math.PI * 2);
  ctx.fill();

  // belly
  ctx.fillStyle = p.belly;
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 33, style === 'bear' ? 14 : 13, style === 'bear' ? 13 : 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // arms
  ctx.fillStyle = p.bodyDark;
  ctx.beginPath();
  ctx.ellipse(cx - 20, baseY + 28, 7, 6, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 20, baseY + 28, 7, 6, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = p.body;
  ctx.beginPath();
  ctx.arc(cx + 2, baseY + 12, style === 'bear' ? 19 : 18, 0, Math.PI * 2);
  ctx.fill();

  // ears
  if (style === 'bunny') {
    // tall floppy ears
    ctx.fillStyle = p.ear;
    ctx.beginPath();
    ctx.ellipse(cx - 8, baseY - 10, 6, 16, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 14, baseY - 12, 6, 17, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.earInner;
    ctx.beginPath();
    ctx.ellipse(cx - 8, baseY - 10, 2.5, 10, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 14, baseY - 12, 2.5, 11, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'bear') {
    ctx.fillStyle = p.ear;
    ctx.beginPath();
    ctx.arc(cx - 12, baseY - 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 16, baseY - 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.earInner;
    ctx.beginPath();
    ctx.arc(cx - 12, baseY - 1, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 16, baseY - 1, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // fox round ears
    ctx.fillStyle = p.ear;
    ctx.beginPath();
    ctx.arc(cx - 10, baseY - 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 14, baseY - 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.earInner;
    ctx.beginPath();
    ctx.arc(cx - 10, baseY - 1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 14, baseY - 1, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // blush
  ctx.fillStyle = p.cheek;
  ctx.beginPath();
  ctx.ellipse(cx - 8, baseY + 16, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 12, baseY + 16, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // snout for bear
  if (style === 'bear') {
    ctx.fillStyle = p.belly;
    ctx.beginPath();
    ctx.ellipse(cx + 3, baseY + 17, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // eyes
  ctx.fillStyle = '#0f172a';
  const eyeY = baseY + (style === 'bear' ? 10 : 11);
  ctx.beginPath();
  ctx.ellipse(cx - 3, eyeY, 4.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 9, eyeY, 4.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 1.5, eyeY - 2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 10.5, eyeY - 2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 4, eyeY + 2, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 8, eyeY + 2, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // nose
  ctx.fillStyle = p.nose;
  ctx.beginPath();
  if (style === 'bear') {
    ctx.ellipse(cx + 3, baseY + 16, 3.5, 2.5, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(cx + 3, baseY + 17, 2.5, 2, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // smile
  ctx.strokeStyle = p.nose;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx + 3, baseY + 18.5, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

/** Mini preview for picker cards (canvas) */
function CharacterPreview({ character }: { character: TrailRunCharacter }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 96, 96);
    ctx.fillStyle = 'transparent';
    // scale draw into preview box
    ctx.save();
    ctx.translate(24, 20);
    ctx.scale(1.05, 1.05);
    drawCuteRunner(ctx, 0, 0, true, 0, character);
    ctx.restore();
  }, [character]);
  return (
    <canvas ref={ref} width={96} height={96} className="w-20 h-20 mx-auto block pointer-events-none" />
  );
}

export default function TrailRunGame({ userId, onBack }: TrailRunGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<Phase>('ready');
  const scoreRef = useRef(0);
  const bestRef = useRef(getHighScore(userId, 'trail-run'));
  const jumpQueued = useRef(false);
  const rafRef = useRef(0);
  const characterRef = useRef<TrailRunCharacter>(
    getTrailRunCharacter(loadTrailRunCharacter(userId))
  );

  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bestRef.current);
  const [isNewBest, setIsNewBest] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [characterId, setCharacterId] = useState<TrailRunCharacterId>(() =>
    loadTrailRunCharacter(userId)
  );

  const character = getTrailRunCharacter(characterId);
  characterRef.current = character;

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const pickCharacter = (id: TrailRunCharacterId) => {
    setCharacterId(id);
    saveTrailRunCharacter(userId, id);
    characterRef.current = getTrailRunCharacter(id);
  };

  const beginRun = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setIsNewBest(false);
    setRunKey((k) => k + 1);
    setPhaseBoth('playing');
  }, [setPhaseBoth]);

  const queueJump = useCallback(() => {
    // On ready screen, picking starts only via Play button (not canvas jump)
    if (phaseRef.current === 'playing') {
      jumpQueued.current = true;
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        if (phaseRef.current === 'ready') {
          beginRun();
          jumpQueued.current = true;
          return;
        }
        if (phaseRef.current === 'over') return;
        queueJump();
      }
      if ((e.code === 'Enter' || e.code === 'Space') && phaseRef.current === 'over') {
        e.preventDefault();
        beginRun();
      }
      // 1/2/3 pick character while ready
      if (phaseRef.current === 'ready') {
        if (e.key === '1') pickCharacter('maple-fox');
        if (e.key === '2') pickCharacter('bun-bunny');
        if (e.key === '3') pickCharacter('cocoa-bear');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueJump, beginRun, userId]);

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
          vy = -15.8; // slightly higher, floatier jump
          onGround = false;
        }
        jumpQueued.current = false;

        vy += 0.62 * dt; // gentler gravity so jumps feel better
        playerY += vy * dt;
        if (playerY >= GROUND - PLAYER_H) {
          playerY = GROUND - PLAYER_H;
          vy = 0;
          onGround = true;
        }

        // Start slow, ease up over a long distance (Icy Tower–style ramp)
        const BASE_SPEED = 2.6;
        const MAX_SPEED = 10.5;
        speed = Math.min(MAX_SPEED, BASE_SPEED + distance / 1600);
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
          // Leave leaves a bit lower / more reachable for jumps
          leaves.push({
            x: W + 10,
            y: GROUND - 55 - Math.random() * 75,
            taken: false,
          });
          leafTimer = 22 + Math.random() * 32;
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

        // Generous leaf pickup box (easier to collect)
        const LEAF_HIT = 36;
        for (const l of leaves) {
          if (l.taken) continue;
          if (
            px < l.x + LEAF_HIT &&
            px + pw > l.x - 4 &&
            py < l.y + LEAF_HIT &&
            py + ph > l.y - 4
          ) {
            l.taken = true;
            leafBonus += 100; // each leaf = 100 pts
          }
        }

        const total = Math.floor(distance / 3) + leafBonus;
        if (total !== scoreRef.current) {
          scoreRef.current = total;
          setScore(total);
        }
      }

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
        // Bright glow so leaves pop on the trail
        ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.beginPath();
        ctx.arc(l.x + 14, l.y + 12, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(74, 222, 128, 0.55)';
        ctx.beginPath();
        ctx.arc(l.x + 14, l.y + 12, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '28px serif';
        ctx.fillText('🍃', l.x, l.y + 20);
        // sparkle tip
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(l.x + 22, l.y + 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const o of obstacles) {
        const oy = GROUND - o.h;
        // Bright hazards so kids can see what to jump
        if (o.kind === 'log') {
          // light wood body
          ctx.fillStyle = '#d97706';
          ctx.fillRect(o.x, oy, o.w, o.h);
          // bark rings
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          for (let r = 8; r < o.w - 4; r += 12) {
            ctx.beginPath();
            ctx.moveTo(o.x + r, oy + 3);
            ctx.lineTo(o.x + r, oy + o.h - 3);
            ctx.stroke();
          }
          // cream end-cap
          ctx.fillStyle = '#fde68a';
          ctx.fillRect(o.x, oy, 8, o.h);
          // thick outline
          ctx.strokeStyle = '#fff7ed';
          ctx.lineWidth = 3;
          ctx.strokeRect(o.x + 0.5, oy + 0.5, o.w - 1, o.h - 1);
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          ctx.strokeRect(o.x + 1.5, oy + 1.5, o.w - 3, o.h - 3);
        } else {
          // bright rock
          const tipX = o.x + o.w / 2;
          ctx.fillStyle = '#a8a29e';
          ctx.beginPath();
          ctx.moveTo(tipX, oy);
          ctx.lineTo(o.x + o.w + 2, oy + o.h);
          ctx.lineTo(o.x - 2, oy + o.h);
          ctx.closePath();
          ctx.fill();
          // highlight face
          ctx.fillStyle = '#e7e5e4';
          ctx.beginPath();
          ctx.moveTo(tipX, oy + 4);
          ctx.lineTo(o.x + o.w * 0.55, oy + o.h * 0.55);
          ctx.lineTo(o.x + o.w * 0.25, oy + o.h * 0.7);
          ctx.closePath();
          ctx.fill();
          // outline
          ctx.strokeStyle = '#fafaf9';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(tipX, oy);
          ctx.lineTo(o.x + o.w + 2, oy + o.h);
          ctx.lineTo(o.x - 2, oy + o.h);
          ctx.closePath();
          ctx.stroke();
          ctx.strokeStyle = '#57534e';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      if (!ready) {
        drawCuteRunner(ctx, PLAYER_X, playerY, onGround, scroll, characterRef.current);
      }

      if (playing || over) {
        ctx.fillStyle = 'rgba(15,23,42,0.55)';
        ctx.fillRect(12, 12, 168, 56);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 18px system-ui,sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Score ${scoreRef.current}`, 24, 38);
        ctx.font = '13px system-ui,sans-serif';
        ctx.fillStyle = '#fcd34d';
        ctx.fillText(`Best ${bestRef.current}`, 24, 56);
      }

      if (ready) {
        // soft trail backdrop; picker is HTML overlay
        ctx.fillStyle = 'rgba(15,23,42,0.25)';
        ctx.fillRect(0, 0, W, H);
        // idle preview of selected character in center
        drawCuteRunner(ctx, W / 2 - PLAYER_W / 2, GROUND - PLAYER_H - 20, true, scroll * 0.22, characterRef.current);
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

  void isNewBest;

  return (
    <GameShell title="Trail Run" subtitle="Pick a buddy · jump logs · grab leaves" onBack={onBack}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto touch-none cursor-pointer block bg-slate-900 select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if (phaseRef.current === 'ready' || phaseRef.current === 'over') return;
            queueJump();
          }}
        />

        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-end sm:justify-center p-3 sm:p-5 bg-slate-950/55 backdrop-blur-[2px]">
            <div className="w-full max-w-lg space-y-3">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-black text-white">Pick your runner</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Tap a buddy, then hit Play
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {TRAIL_RUN_CHARACTERS.map((c) => {
                  const selected = c.id === characterId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => pickCharacter(c.id)}
                      className={`rounded-2xl border-2 p-2 sm:p-3 text-center transition ${
                        selected
                          ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/20 scale-[1.02]'
                          : 'border-slate-600 bg-slate-900/80 hover:border-slate-400'
                      }`}
                    >
                      <CharacterPreview character={c} />
                      <div className="text-sm font-bold text-white mt-0.5">
                        {c.emoji} {c.name}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-400 leading-tight mt-0.5">
                        {c.tagline}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={beginRun}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-black shadow-lg"
              >
                Play as {character.name} →
              </button>
            </div>
          </div>
        )}

        {phase === 'over' && (
          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
            <div className="flex justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={beginRun}
                className="px-5 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg"
              >
                Play again
              </button>
              <button
                type="button"
                onClick={() => setPhaseBoth('ready')}
                className="px-5 h-11 rounded-2xl bg-amber-700/90 hover:bg-amber-600 text-white text-sm font-semibold"
              >
                Change buddy
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-5 h-11 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold"
              >
                Arcade
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="px-3 py-2 text-center text-xs text-slate-500">
        {phase === 'playing'
          ? `Running as ${character.name} · Score ${score}${best > 0 ? ` · Best ${best}` : ''} · Tap to jump`
          : phase === 'ready'
            ? `Selected: ${character.emoji} ${character.name}`
            : `Score ${score}${best > 0 ? ` · Best ${best}` : ''}`}
      </p>
    </GameShell>
  );
}
