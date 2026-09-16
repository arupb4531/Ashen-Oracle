'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const r = (min, max) => Math.random() * (max - min) + min;

// ─── Particle initialization per scene type ───────────────────────────────────
function initParticles(type, w, h) {
  switch (type) {
    case 'embers': return [
      ...Array.from({ length: 75 }, () => ({
        type: 'ember', x: r(0, w), y: r(h * 0.4, h + 60),
        vx: r(-0.6, 0.6), vy: r(-1.8, -0.7),
        size: r(0.8, 2.8), life: r(0.1, 1),
        hue: r(10, 38), seed: r(0, Math.PI * 2),
      })),
      ...Array.from({ length: 30 }, () => ({
        type: 'ash', x: r(0, w), y: r(0, h),
        vx: r(-0.25, 0.25), vy: r(-0.35, -0.08),
        size: r(1, 2.5), life: r(0.2, 1), seed: r(0, Math.PI * 2),
      })),
    ];

    case 'fog': return [
      ...Array.from({ length: 9 }, () => ({
        type: 'fog', x: r(-250, w + 250), y: r(h * 0.25, h),
        vx: r(-0.35, 0.35), size: r(90, 220),
        life: r(0.3, 0.8), seed: r(0, Math.PI * 2),
      })),
      ...Array.from({ length: 35 }, () => ({
        type: 'dust', x: r(0, w), y: r(-20, h * 0.4),
        vx: r(-0.12, 0.12), vy: r(0.1, 0.5),
        size: r(0.5, 1.8), life: r(0.2, 0.9), seed: r(0, Math.PI * 2),
      })),
    ];

    case 'motes': return [
      ...Array.from({ length: 140 }, () => ({
        type: 'mote', x: r(0, w), y: r(0, h),
        dvx: r(-0.18, 0.18), dvy: r(-0.18, 0.18),
        size: r(0.5, 1.8), seed: r(0, Math.PI * 2), life: 1,
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        type: 'inkdrop', x: r(0, w), y: r(0, h),
        size: 0, life: 0, timer: Math.floor(r(60, 400)) + i * 90,
      })),
    ];

    case 'ravens': return [
      ...Array.from({ length: 5 }, () => ({
        type: 'raven',
        x: r(-150, -50), y: r(h * 0.04, h * 0.45),
        vx: r(0.6, 1.8), phase: r(0, Math.PI * 2),
        amp: r(18, 55), size: r(10, 22), baseY: 0,
      })).map(p => ({ ...p, baseY: p.y })),
      ...Array.from({ length: 14 }, () => ({
        type: 'mist', x: r(0, w), y: r(h * 0.55, h + 80),
        vx: r(-0.12, 0.12), vy: r(-0.25, -0.08),
        size: r(60, 160), life: r(0.1, 0.7), seed: r(0, Math.PI * 2),
      })),
    ];

    case 'sparks': return Array.from({ length: 65 }, () => ({
      type: 'spark',
      x: r(w * 0.38, w * 0.62), y: r(h * 0.72, h + 10),
      vx: r(-5, 5), vy: r(-8, -2.5),
      size: r(0.8, 2.5), life: r(0, 1), hue: r(15, 52),
    }));

    case 'fireflies': return [
      ...Array.from({ length: 32 }, () => {
        const bx = r(0, w), by = r(h * 0.15, h * 0.9);
        return {
          type: 'firefly', baseX: bx, baseY: by,
          phase: r(0, Math.PI * 2), speed: r(0.35, 0.75),
          size: r(2, 4), x: bx, y: by,
        };
      }),
      ...Array.from({ length: 22 }, () => ({
        type: 'leaf', x: r(0, w), y: r(-60, -5),
        vx: r(-0.4, 0.4), vy: r(0.35, 0.8),
        rotation: r(0, Math.PI * 2), rotSpeed: r(-0.025, 0.025),
        size: r(5, 13), life: r(0.4, 1), hue: r(18, 42),
      })),
    ];

    default: return initParticles('embers', w, h);
  }
}

// ─── Particle update ───────────────────────────────────────────────────────────
function updateParticle(p, w, h, t) {
  switch (p.type) {
    case 'ember':
      p.x += p.vx + Math.sin(t + p.seed) * 0.45;
      p.y += p.vy;
      p.life -= 0.0045;
      if (p.y < -12 || p.life <= 0) {
        p.x = r(0, w); p.y = h + 10;
        p.life = r(0.5, 1); p.vx = r(-0.6, 0.6); p.vy = r(-1.8, -0.7);
      }
      break;

    case 'ash':
      p.x += p.vx + Math.sin(t * 0.4 + p.seed) * 0.28;
      p.y += p.vy;
      p.life -= 0.0018;
      if (p.y < -10 || p.life <= 0) {
        p.x = r(0, w); p.y = h + 8; p.life = r(0.4, 0.9);
        p.vy = r(-0.35, -0.08);
      }
      break;

    case 'fog':
      p.x += p.vx + Math.sin(t * 0.15 + p.seed) * 0.09;
      if (p.x > w + 280) p.x = -280;
      else if (p.x < -280) p.x = w + 280;
      break;

    case 'dust':
      p.y += p.vy; p.x += p.vx;
      p.life -= 0.0008;
      if (p.y > h + 10 || p.life <= 0) {
        p.y = -8; p.x = r(0, w); p.life = r(0.3, 0.9);
      }
      break;

    case 'mote':
      p.x += p.dvx + (Math.random() - 0.5) * 0.12;
      p.y += p.dvy + (Math.random() - 0.5) * 0.12;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      break;

    case 'inkdrop':
      if (p.timer > 0) { p.timer--; break; }
      p.size += 0.9; p.life -= 0.014;
      if (p.life <= 0) {
        p.x = r(0, w); p.y = r(0, h);
        p.size = 0; p.life = 1; p.timer = Math.floor(r(200, 500));
      }
      break;

    case 'raven':
      p.x += p.vx;
      p.phase += 0.055;
      p.y = p.baseY + Math.sin(p.phase) * p.amp * 0.5;
      if (p.x > w + 160) {
        p.x = r(-160, -60);
        p.baseY = r(h * 0.04, h * 0.45);
        p.vx = r(0.6, 1.8);
      }
      break;

    case 'mist':
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.0009;
      if (p.y < h * 0.3 || p.life <= 0) {
        p.x = r(0, w); p.y = h + 60; p.life = r(0.2, 0.65);
      }
      break;

    case 'spark':
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.22;
      p.life -= 0.022;
      if (p.life <= 0 || p.y > h + 60) {
        p.x = r(w * 0.38, w * 0.62);
        p.y = r(h * 0.72, h + 10);
        p.vx = r(-5, 5); p.vy = r(-8, -2.5);
        p.life = r(0.5, 1);
      }
      break;

    case 'firefly':
      p.phase += p.speed * 0.018;
      p.x = p.baseX + Math.cos(p.phase) * 28 + Math.sin(p.phase * 0.63) * 14;
      p.y = p.baseY + Math.sin(p.phase * 0.78) * 18 + Math.cos(p.phase * 0.45) * 9;
      if (Math.random() < 0.0008) {
        p.baseX = r(0, w); p.baseY = r(h * 0.15, h * 0.9);
      }
      break;

    case 'leaf':
      p.x += p.vx; p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life -= 0.0018;
      if (p.y > h + 25 || p.life <= 0) {
        p.x = r(0, w); p.y = r(-30, -5);
        p.life = r(0.5, 1); p.vy = r(0.35, 0.8);
        p.hue = r(18, 42);
      }
      break;
  }
}

// ─── Particle draw ─────────────────────────────────────────────────────────────
function drawParticle(ctx, p, t) {
  ctx.save();
  switch (p.type) {
    case 'ember': {
      const a = Math.min(p.life * 2, 1) * 0.88;
      // Soft glow halo (drawn as larger, low-opacity circle — no shadowBlur for perf)
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 58%, ${a * 0.12})`;
      ctx.fill();
      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 68%, ${a})`;
      ctx.fill();
      break;
    }
    case 'ash': {
      const a = p.life * 0.32;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(185, 165, 145, ${a})`;
      ctx.fill();
      break;
    }
    case 'fog': {
      const a = 0.038;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      g.addColorStop(0, `rgba(175, 185, 205, ${a})`);
      g.addColorStop(1, `rgba(175, 185, 205, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'dust': {
      const a = p.life * 0.28;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(195, 190, 188, ${a})`;
      ctx.fill();
      break;
    }
    case 'mote': {
      const flicker = 0.2 + Math.sin(t * 1.2 + p.seed) * 0.12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(215, 195, 150, ${flicker})`;
      ctx.fill();
      break;
    }
    case 'inkdrop': {
      if (p.timer > 0 || p.life <= 0) break;
      const a = p.life * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(15, 8, 30, ${a})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    }
    case 'raven': {
      ctx.translate(p.x, p.y);
      const flap = Math.sin(p.phase * 3.5) * 0.45;
      ctx.fillStyle = 'rgba(12, 10, 18, 0.78)';
      // Left wing
      ctx.save(); ctx.rotate(-flap);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size, -p.size * 0.7, -p.size * 1.6, 0.2, -p.size * 0.45, p.size * 0.25);
      ctx.fill(); ctx.restore();
      // Right wing
      ctx.save(); ctx.rotate(flap);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size, -p.size * 0.7, p.size * 1.6, 0.2, p.size * 0.45, p.size * 0.25);
      ctx.fill(); ctx.restore();
      // Body
      ctx.beginPath();
      ctx.ellipse(0, p.size * 0.08, p.size * 0.38, p.size * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mist': {
      const a = p.life * 0.065;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      g.addColorStop(0, `rgba(80, 130, 85, ${a})`);
      g.addColorStop(1, `rgba(40, 80, 45, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'spark': {
      const a = Math.pow(p.life, 0.6) * 0.92;
      // Glow halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 62%, ${a * 0.1})`;
      ctx.fill();
      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 78%, ${a})`;
      ctx.fill();
      break;
    }
    case 'firefly': {
      const blink = (Math.sin(p.phase * 1.8) + 1) / 2;
      const a = blink * 0.85;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      g.addColorStop(0, `rgba(90, 255, 180, ${a})`);
      g.addColorStop(0.45, `rgba(40, 200, 130, ${a * 0.28})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(195, 255, 225, ${a})`;
      ctx.fill();
      break;
    }
    case 'leaf': {
      const a = p.life * 0.65;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.42, p.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 65%, 35%, ${a})`;
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// ─── Per-scene background gradient ────────────────────────────────────────────
const BG_DRAW = {
  embers: (ctx, w, h, t) => {
    const g = ctx.createRadialGradient(w / 2, h, 0, w / 2, h * 0.25, h * 1.3);
    g.addColorStop(0, '#3e1000'); g.addColorStop(0.35, '#180600'); g.addColorStop(1, '#040100');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Animated forge glow
    const gv = 0.14 + Math.sin(t * 0.9) * 0.04;
    const fg = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.9);
    fg.addColorStop(0, `rgba(255,70,5,${gv})`);
    fg.addColorStop(0.5, `rgba(180,30,0,${gv * 0.28})`);
    fg.addColorStop(1, 'transparent');
    ctx.fillStyle = fg; ctx.fillRect(0, 0, w, h);
  },
  fog: (ctx, w, h, t) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#04070e'); g.addColorStop(0.5, '#080d18'); g.addColorStop(1, '#020408');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Cold top light
    const ml = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.65);
    ml.addColorStop(0, 'rgba(160,178,210,0.06)'); ml.addColorStop(1, 'transparent');
    ctx.fillStyle = ml; ctx.fillRect(0, 0, w, h);
  },
  motes: (ctx, w, h, t) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h);
    g.addColorStop(0, '#1c0e2a'); g.addColorStop(0.45, '#0e0818'); g.addColorStop(1, '#040208');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Flickering candle glow
    const cv = 0.1 + Math.sin(t * 1.8) * 0.025 + Math.sin(t * 7.3) * 0.01;
    const cg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.55);
    cg.addColorStop(0, `rgba(200,148,48,${cv})`);
    cg.addColorStop(0.55, `rgba(140,90,25,${cv * 0.25})`);
    cg.addColorStop(1, 'transparent');
    ctx.fillStyle = cg; ctx.fillRect(0, 0, w, h);
  },
  ravens: (ctx, w, h, t) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#010a01'); g.addColorStop(0.5, '#040d04'); g.addColorStop(1, '#010301');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Pale moon (top-right)
    const mn = ctx.createRadialGradient(w * 0.78, h * 0.08, 0, w * 0.78, h * 0.08, h * 0.45);
    mn.addColorStop(0, 'rgba(160,210,165,0.07)');
    mn.addColorStop(0.5, 'rgba(80,145,90,0.02)');
    mn.addColorStop(1, 'transparent');
    ctx.fillStyle = mn; ctx.fillRect(0, 0, w, h);
    // Ground mist
    const ms = ctx.createLinearGradient(0, h * 0.68, 0, h);
    ms.addColorStop(0, 'transparent'); ms.addColorStop(1, 'rgba(25,55,28,0.18)');
    ctx.fillStyle = ms; ctx.fillRect(0, 0, w, h);
  },
  sparks: (ctx, w, h, t) => {
    const g = ctx.createRadialGradient(w / 2, h, 0, w / 2, h * 0.5, h);
    g.addColorStop(0, '#421400'); g.addColorStop(0.28, '#220800'); g.addColorStop(1, '#060200');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Intense forge glow — more saturated than embers
    const iv = 0.38 + Math.sin(t * 2.8) * 0.1 + Math.sin(t * 8.4) * 0.04;
    const fg = ctx.createRadialGradient(w / 2, h, 0, w / 2, h * 0.65, h * 0.55);
    fg.addColorStop(0, `rgba(255,110,15,${iv})`);
    fg.addColorStop(0.4, `rgba(200,55,0,${iv * 0.38})`);
    fg.addColorStop(1, 'transparent');
    ctx.fillStyle = fg; ctx.fillRect(0, 0, w, h);
  },
  fireflies: (ctx, w, h, t) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#020510'); g.addColorStop(0.5, '#040918'); g.addColorStop(1, '#010204');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Large silver moon at top
    const moon = ctx.createRadialGradient(w / 2, -h * 0.08, 0, w / 2, -h * 0.08, h * 0.85);
    moon.addColorStop(0, 'rgba(195,218,240,0.14)');
    moon.addColorStop(0.28, 'rgba(145,175,215,0.04)');
    moon.addColorStop(0.65, 'rgba(100,140,190,0.015)');
    moon.addColorStop(1, 'transparent');
    ctx.fillStyle = moon; ctx.fillRect(0, 0, w, h);
    // Moon disk
    ctx.beginPath();
    ctx.arc(w / 2, 0, 55, 0, Math.PI * 2);
    const md = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, 55);
    md.addColorStop(0, 'rgba(225,235,248,0.18)');
    md.addColorStop(1, 'rgba(200,220,242,0)');
    ctx.fillStyle = md; ctx.fill();
  },
};

// Map persona ids to scene type
const PERSONA_SCENE = {
  ember_keeper:    'embers',
  oathbound_knight:'fog',
  hollow_scholar:  'motes',
  grave_prophet:   'ravens',
  old_smith:       'sparks',
  moonlit_duelist: 'fireflies',
};

// ─── Component ────────────────────────────────────────────────────────────────
export function SceneBackground({ personaId }) {
  const canvasRef     = useRef(null);
  const particlesRef  = useRef([]);
  const rafRef        = useRef(null);
  const [opacity, setOpacity] = useState(1);
  const [activeId, setActiveId] = useState(personaId);

  // Fade transition when persona changes
  useEffect(() => {
    if (personaId === activeId) return;
    setOpacity(0);
    const t = setTimeout(() => { setActiveId(personaId); setOpacity(1); }, 480);
    return () => clearTimeout(t);
  }, [personaId]); // eslint-disable-line

  // Animation loop — reruns when activeId changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const sceneType = PERSONA_SCENE[activeId] || 'embers';
    const drawBg = BG_DRAW[sceneType] || BG_DRAW.embers;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = initParticles(sceneType, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const loop = () => {
      t += 0.016;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      drawBg(ctx, w, h, t);
      particlesRef.current.forEach(p => updateParticle(p, w, h, t));
      particlesRef.current.forEach(p => drawParticle(ctx, p, t));
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [activeId]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 0, pointerEvents: 'none',
        opacity, transition: 'opacity 0.48s ease',
        display: 'block',
      }}
    />
  );
}
