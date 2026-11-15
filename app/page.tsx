"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TreeParticle = {
  height: number;
  angle: number;
  radius: number;
  size: number;
  alpha: number;
  twinkle: number;
  tone: number;
  branch: number;
  tierStrength: number;
  edgeBias: number;
  coreGlow: number;
};

type RingParticle = {
  ring: number;
  angle: number;
  jitterX: number;
  jitterY: number;
  size: number;
  alpha: number;
};

type SnowParticle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  alpha: number;
  phase: number;
};

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, color);
  glow.addColorStop(0.42, color.replace("0.34", "0.12"));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGlow(ctx, x, y, size * 3.2, "rgba(255,201,123,0.38)");
  const gold = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
  gold.addColorStop(0, "#fffaf0");
  gold.addColorStop(0.5, "#ffe4a6");
  gold.addColorStop(1, "#bc792f");
  ctx.fillStyle = gold;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = i * Math.PI / 5 - Math.PI / 2;
    const radius = i % 2 ? size * 0.44 : size;
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#fff4cd";
  ctx.lineWidth = Math.max(0.5, size * 0.04);
  ctx.stroke();
}

function sleighPosition(width: number, height: number, progress: number, direction: number) {
  const scale = Math.max(0.62, Math.min(1, width / 1180));
  const x = -280 + progress * (width + 560);
  return {
    scale,
    x: direction > 0 ? x : width - x,
    y: -24 + (Math.max(65, height * 0.16) + 24) * clamp(progress / 0.32, 0, 1)
      + Math.sin(progress * 20) * 7,
  };
}

function drawSantaFlight(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number, direction: number) {
  const { x, y, scale } = sleighPosition(width, height, progress, direction);
  const frame = progress * 630;
  const lead = [42, 80, 118, 156, 194, 232];

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * direction, scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "rgba(255, 218, 119, 0.68)";
  ctx.lineWidth = 1.4;
  for (let sparkle = 0; sparkle < 7; sparkle += 1) {
    const trailX = -58 - sparkle * 16;
    const trailY = Math.sin(frame / 18 + sparkle * 1.8) * 12;
    const radius = 1.2 + ((sparkle + frame / 12) % 3) * 0.5;
    ctx.beginPath();
    ctx.arc(trailX, trailY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 232, 163, 0.78)";
    ctx.fill();
  }

  for (let index = 0; index < lead.length; index += 1) {
    const deerX = lead[index];
    const deerY = Math.sin(frame / 26 + index * 0.9) * 5 - index * 2;

    ctx.strokeStyle = "rgba(246, 209, 164, 0.58)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-20, -6);
    ctx.quadraticCurveTo(deerX - 18, deerY + 3, deerX, deerY);
    ctx.stroke();

    ctx.fillStyle = "#6c3e27";
    ctx.beginPath();
    ctx.ellipse(deerX, deerY, 13, 7, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(deerX + 12, deerY - 7, 5, 6, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#7e4a2e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(deerX - 7, deerY + 5);
    ctx.lineTo(deerX - 10, deerY + 14);
    ctx.moveTo(deerX + 6, deerY + 5);
    ctx.lineTo(deerX + 9, deerY + 13);
    ctx.moveTo(deerX + 12, deerY - 11);
    ctx.lineTo(deerX + 8, deerY - 19);
    ctx.moveTo(deerX + 12, deerY - 13);
    ctx.lineTo(deerX + 18, deerY - 18);
    ctx.stroke();

    ctx.fillStyle = index === 0 ? "#d84242" : "#f0c8a3";
    ctx.beginPath();
    ctx.arc(deerX + 16, deerY - 7, index === 0 ? 2.1 : 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#9d263b";
  ctx.beginPath();
  ctx.moveTo(-52, 4);
  ctx.quadraticCurveTo(-28, -15, 8, -10);
  ctx.lineTo(0, 9);
  ctx.quadraticCurveTo(-25, 13, -48, 11);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#f4c86d";
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-54, 13);
  ctx.quadraticCurveTo(-27, 23, 6, 13);
  ctx.quadraticCurveTo(-24, 29, -52, 20);
  ctx.stroke();

  const gifts = [
    { x: -50, y: -10, width: 13, height: 10, color: "#c9304b" },
    { x: -38, y: -15, width: 12, height: 14, color: "#d98a2c" },
    { x: -57, y: -20, width: 11, height: 11, color: "#b93676" },
  ];
  for (const gift of gifts) {
    ctx.fillStyle = gift.color;
    ctx.fillRect(gift.x, gift.y, gift.width, gift.height);
    ctx.strokeStyle = "#f9d779";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(gift.x + gift.width / 2, gift.y);
    ctx.lineTo(gift.x + gift.width / 2, gift.y + gift.height);
    ctx.moveTo(gift.x, gift.y + gift.height * 0.42);
    ctx.lineTo(gift.x + gift.width, gift.y + gift.height * 0.42);
    ctx.stroke();
    ctx.fillStyle = "#fff1c9";
    ctx.beginPath();
    ctx.arc(gift.x + gift.width / 2 - 2, gift.y - 1, 2.1, 0, Math.PI * 2);
    ctx.arc(gift.x + gift.width / 2 + 2, gift.y - 1, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#d23b42";
  ctx.beginPath();
  ctx.ellipse(-22, -23, 10, 15, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6d1ad";
  ctx.beginPath();
  ctx.arc(-20, -39, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d62f3b";
  ctx.beginPath();
  ctx.moveTo(-28, -43);
  ctx.lineTo(-20, -57);
  ctx.lineTo(-12, -43);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff5ea";
  ctx.beginPath();
  ctx.arc(-20, -57, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-17, -35, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

type ProjectPoint = (x: number, y: number, z: number) => { x: number; y: number; perspective: number };

function drawSolidBranches(
  ctx: CanvasRenderingContext2D, progress: number, height: number, radius: number, rotation: number, project: ProjectPoint,
) {
  const foot = project(0, 0, 0);
  const trunkTop = project(0, -height * Math.min(progress, 0.14), 0);
  const trunkWidth = radius * 0.085;
  ctx.fillStyle = "#68452f";
  ctx.fillRect(foot.x - trunkWidth / 2, trunkTop.y, trunkWidth, foot.y - trunkTop.y);
  ctx.fillStyle = "#9d7047";
  ctx.fillRect(foot.x - trunkWidth * 0.27, trunkTop.y, trunkWidth * 0.19, foot.y - trunkTop.y);

  const boughs = [0.07, 0.14, 0.23, 0.31, 0.41, 0.5, 0.57, 0.65, 0.73, 0.79, 0.86];
  for (const [tier, bottom] of boughs.entries()) {
    if (progress <= bottom) break;
    const top = Math.min(progress, bottom + 0.18 + 0.035 * Math.sin(tier * 2.7), 1);
    const spread = radius * Math.pow(1 - bottom, 0.92) * (1 + 0.08 * Math.cos(tier * 3.9));
    const peak = project(Math.sin(tier * 2.1) * spread * 0.08, -height * top, 0);
    const left = project(-spread, -height * bottom, 0);
    const right = project(spread, -height * bottom, 0);
    const shade = ctx.createLinearGradient(left.x, peak.y, right.x, left.y);
    shade.addColorStop(0, "#142e24");
    shade.addColorStop(0.43 + Math.sin(rotation + tier) * 0.10, tier % 2 ? "#39653d" : "#315b39");
    shade.addColorStop(1, "#0a281e");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    for (let j = 0; j <= 36; j++) {
      const angle = Math.PI - j * Math.PI / 36;
      const ripple = Math.cos(angle * 7 + tier * 2.1 + rotation);
      const serration = 0.90 + 0.10 * ripple + 0.045 * Math.cos(j * 2.4 + tier);
      const point = project(Math.cos(angle) * spread * serration,
        -height * bottom + (ripple * 0.019 + Math.sin(j * 2.7 + tier) * 0.008) * height,
        Math.sin(angle) * spread * 0.48);
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

const santaPasses = 3;

function drawTreeDecorations(
  ctx: CanvasRenderingContext2D, progress: number, height: number, radius: number,
  scale: number, rotation: number, project: ProjectPoint,
) {
  const fabricWidth = Math.max(2, 6 * scale);
  ctx.save();
  ctx.lineCap = "round";
  for (let ribbon = 0; ribbon < 2; ribbon++) {
    const segments: [number, number][] = [];
    const paint = () => {
      if (segments.length < 2) { segments.length = 0; return; }
      ctx.beginPath();
      for (const [i, [x, y]] of segments.entries()) {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = ribbon === 0 ? "#682031" : "#70512d";
      ctx.lineWidth = fabricWidth + 2;
      ctx.stroke();
      ctx.strokeStyle = ribbon === 0 ? "#bd3c54" : "#dbac63";
      ctx.lineWidth = fabricWidth;
      ctx.stroke();
      ctx.strokeStyle = ribbon === 0 ? "#ee8490" : "#ffe3a7";
      ctx.lineWidth = Math.max(0.6, fabricWidth * 0.22);
      ctx.stroke();
      segments.length = 0;
    };
    for (let i = 0; i <= 240 * progress; i++) {
      const t = 0.12 + i / 240 * 0.78;
      const angle = rotation + t * 30 + ribbon * Math.PI + 0.23 * Math.sin(t * 23);
      if (Math.sin(angle) < 0.04) { paint(); continue; }
      const spread = radius * Math.pow(1 - t, 0.92) * 0.94;
      const point = project(Math.cos(angle) * spread, -height * t + Math.sin(angle * 2) * fabricWidth, Math.sin(angle) * spread);
      segments.push([point.x, point.y]);
    }
    paint();
  }

  const colors = ["#e95463", "#edbf65", "#559bd2", "#b584cc", "#dce6e0"];
  for (let i = 0; i < 44; i++) {
    const h = 0.15 + i / 43 * 0.74;
    if ((h - 0.12) / 0.78 > progress) break;
    const angle = i * 2.39996 + rotation;
    if (Math.sin(angle) < -0.12) continue;
    const spread = radius * Math.pow(1 - h, 0.92) * (0.77 + (i % 4) * 0.055);
    const p = project(Math.cos(angle) * spread, -height * h, Math.sin(angle) * spread);
    const size = (3.3 + (i * 3 % 7) * 0.65) * Math.max(0.48, scale) * p.perspective;
    const y = p.y + size * 1.6;
    ctx.strokeStyle = "#efcb80";
    ctx.lineWidth = Math.max(0.6, size * 0.14);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - size);
    ctx.lineTo(p.x, y - size);
    ctx.stroke();
    const glass = ctx.createRadialGradient(p.x - size * 0.33, y - size * 0.4, 0, p.x, y, size);
    glass.addColorStop(0, "#fff8ed");
    glass.addColorStop(0.3, colors[i % colors.length]);
    glass.addColorStop(0.78, colors[i % colors.length]);
    glass.addColorStop(1, "#322132");
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.ellipse(p.x, y, size * (i % 3 === 0 ? 0.79 : 1), size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e6bd76";
    ctx.fillRect(p.x - size * 0.27, y - size * 1.13, size * 0.54, size * 0.31);
  }
  ctx.restore();
}

function drawLandedPresents(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  flightProgress: number,
  baseRadius: number,
  treeScale: number,
  project: ProjectPoint,
) {
  const gifts = [
    { x: -0.64, z: 0.32, color: "#b42e45", ribbon: "#ffe39e" },
    { x: -0.34, z: 0.52, color: "#37659c", ribbon: "#e7f4ff" },
    { x: 0.27, z: 0.57, color: "#ae4238", ribbon: "#ffe39e" },
    { x: 0.60, z: 0.39, color: "#714582", ribbon: "#fbe9fa" },
  ];

  for (let index = 0; index < gifts.length * santaPasses; index++) {
    const i = index % gifts.length;
    const pass = Math.floor(index / gifts.length);
    const direction = pass % 2 === 0 ? 1 : -1;
    const gift = gifts[i];
    const takeoff = 0.4 + i * 0.075;
    const time = flightProgress - pass - takeoff;
    if (time < 0) continue;
    const launch = sleighPosition(width, height, takeoff, direction);
    const landing = project((gift.x + Math.sin(index * 2.6) * 0.10 + (pass - 1) * 0.13) * baseRadius,
      0, (gift.z + pass * 0.17) * baseRadius);
    const t = clamp(time / 0.16, 0, 1);
    const launchX = launch.x - 31 * launch.scale * direction;
    const size = (16 + index * 7 % 15) * Math.max(0.57, treeScale) * landing.perspective;
    const x = launchX + (landing.x - launchX) * t;
    const bounce = Math.sin(Math.PI * clamp((time - 0.16) / 0.035, 0, 1)) * size * 0.16;
    const y = launch.y + (landing.y - launch.y) * t * t - bounce;
    if (t > 0.73) {
      ctx.fillStyle = `rgba(0,0,0,${0.55 * (t - 0.73) / 0.27})`;
      ctx.beginPath();
      ctx.ellipse(landing.x + size * 0.1, landing.y - size * 0.04, size * 0.73, size * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * Math.PI) * (i % 2 ? -0.55 : 0.55) + Math.sin(index * 1.7) * 0.085);
    ctx.fillStyle = "#161221";
    ctx.beginPath();
    ctx.moveTo(size * 0.5, -size * 0.82);
    ctx.lineTo(size * 0.72, -size * 0.96);
    ctx.lineTo(size * 0.72, -size * 0.16);
    ctx.lineTo(size * 0.5, 0);
    ctx.fill();
    ctx.fillStyle = gift.color;
    ctx.fillRect(-size / 2, -size * 0.82, size, size * 0.82);
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.82);
    ctx.lineTo(-size * 0.28, -size * 0.96);
    ctx.lineTo(size * 0.72, -size * 0.96);
    ctx.lineTo(size * 0.5, -size * 0.82);
    ctx.fill();
    ctx.fillStyle = "#ffffff33";
    ctx.fill();
    ctx.fillStyle = gift.ribbon;
    ctx.fillRect(-size * 0.09, -size * 0.82, size * 0.18, size * 0.82);
    ctx.fillRect(-size / 2, -size * 0.58, size, size * 0.11);
    ctx.strokeStyle = gift.ribbon;
    ctx.lineWidth = Math.max(1, size * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.82);
    ctx.bezierCurveTo(-size * 0.66, -size * 0.99, -size * 0.18, -size * 1.26, 0, -size * 0.82);
    ctx.bezierCurveTo(size * 0.18, -size * 1.26, size * 0.66, -size * 0.99, 0, -size * 0.82);
    ctx.stroke();
    ctx.restore();
  }
}

function createTreeParticles(count: number) {
  const particles: TreeParticle[] = [];
  const branchTiers = [0.07, 0.17, 0.28, 0.4, 0.52, 0.64, 0.75, 0.85, 0.94];

  for (let i = 0; i < count; i += 1) {
    const fromBranchTier = Math.random() < 0.64;
    const tierCenter = branchTiers[Math.floor(random(0, branchTiers.length))];
    const height = fromBranchTier
      ? clamp(tierCenter + random(-0.014, 0.024) * (1 - tierCenter * 0.35), 0.025, 0.985)
      : Math.pow(Math.random(), 0.72);
    const cone = Math.pow(1 - height, 0.86);
    const tierWave = Math.pow(Math.max(0, Math.sin(height * Math.PI * 8.8)), 2.2);
    const coreGlow = Math.random() < 0.13 ? random(0.42, 1) : 0;
    const tierStrength = fromBranchTier ? random(0.62, 1) : tierWave * random(0.2, 0.56);
    const edgeBias = coreGlow > 0 ? random(0.02, 0.2) : fromBranchTier ? random(0.54, 1.08) : Math.pow(Math.random(), 0.82);

    particles.push({
      height,
      angle: random(0, Math.PI * 2),
      radius: cone * (0.76 + tierWave * 0.22 + tierStrength * 0.14) * edgeBias,
      size: random(0.42, 1.38) * (1 + tierStrength * 0.18 + coreGlow * 0.12),
      alpha: random(0.38, 0.95),
      twinkle: random(0, Math.PI * 2),
      tone: coreGlow > 0 ? random(0.72, 1) : Math.random(),
      branch: random(-0.016, 0.022),
      tierStrength,
      edgeBias,
      coreGlow,
    });
  }
  return particles;
}

function createRingParticles(count: number) {
  const particles: RingParticle[] = [];
  for (let i = 0; i < count; i += 1) {
    particles.push({
      ring: Math.floor(random(0, 4)),
      angle: random(0, Math.PI * 2),
      jitterX: random(-1, 1),
      jitterY: random(-1, 1),
      size: random(0.45, 1.5),
      alpha: random(0.38, 0.92),
    });
  }
  return particles;
}

function createSnowParticles(count: number, width: number, height: number) {
  const particles: SnowParticle[] = [];
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: random(0, width),
      y: random(height * 0.1, height * 0.96),
      size: random(0.45, 1.55),
      speed: random(0.16, 0.62),
      drift: random(-0.15, 0.15),
      alpha: random(0.24, 0.86),
      phase: random(0, Math.PI * 2),
    });
  }
  return particles;
}

function particleColor(tone: number, pulse: number, alpha: number) {
  if (tone > 0.78) {
    return `rgba(152,250,156,${clamp((0.56 + pulse * 0.32) * alpha, 0.12, 0.98)})`;
  }
  if (tone > 0.42) {
    return `rgba(58,188,100,${clamp((0.48 + pulse * 0.34) * alpha, 0.1, 0.96)})`;
  }
  return `rgba(18,121,67,${clamp((0.42 + pulse * 0.32) * alpha, 0.08, 0.9)})`;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicPageActiveRef = useRef(false);
  const resumeMusicRef = useRef(false);
  const surpriseActiveRef = useRef(false);
  const [surpriseRevealed, setSurpriseRevealed] = useState(false);
  const [needsMusicStart, setNeedsMusicStart] = useState(true);

  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !musicPageActiveRef.current || document.visibilityState !== "visible") {
      return;
    }

    void audio.play().then(
      () => {
        resumeMusicRef.current = true;
        if (!musicPageActiveRef.current || document.visibilityState !== "visible") {
          audio.pause();
          return;
        }
        setNeedsMusicStart(!surpriseActiveRef.current);
      },
      () => {
        if (musicPageActiveRef.current && document.visibilityState === "visible") {
          setNeedsMusicStart(true);
        }
      },
    );
  }, []);

  const revealSurprise = useCallback(() => {
    surpriseActiveRef.current = true;
    setSurpriseRevealed(true);
    setNeedsMusicStart(false);
    startMusic();
  }, [startMusic]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = 0.32;
    musicPageActiveRef.current = document.visibilityState === "visible" && document.hasFocus();
    const pauseMusic = () => {
      musicPageActiveRef.current = false;
      audio.pause();
    };
    const restoreMusic = () => {
      musicPageActiveRef.current = document.visibilityState === "visible" && document.hasFocus();
      if (musicPageActiveRef.current && resumeMusicRef.current) {
        startMusic();
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        restoreMusic();
      } else {
        pauseMusic();
      }
    };
    // Also guard native playback (for example, mobile lock-screen media controls).
    const guardPlayback = () => {
      if (!musicPageActiveRef.current || document.visibilityState !== "visible") {
        audio.pause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", pauseMusic);
    window.addEventListener("pageshow", restoreMusic);
    window.addEventListener("blur", pauseMusic);
    window.addEventListener("focus", restoreMusic);
    audio.addEventListener("play", guardPlayback);
    startMusic();
    window.addEventListener("pointerdown", startMusic, { once: true });
    window.addEventListener("keydown", startMusic, { once: true });

    return () => {
      pauseMusic();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", pauseMusic);
      window.removeEventListener("pageshow", restoreMusic);
      window.removeEventListener("blur", pauseMusic);
      window.removeEventListener("focus", restoreMusic);
      audio.removeEventListener("play", guardPlayback);
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
    };
  }, [startMusic]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let animation = 0;
    let frame = 0;
    let revealStartedAt: number | undefined;
    let width = 0;
    let height = 0;
    let rotation = 0;
    let pitch = 0;
    let spinVelocity = 0.0032;
    let pitchVelocity = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerTime = 0;
    const maxPitch = 0.86;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const treeParticles = createTreeParticles(7600);
    const ringParticles = createRingParticles(3300);
    let snowParticles: SnowParticle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      snowParticles = createSnowParticles(Math.max(360, Math.floor((width * height) / 1800)), width, height);
    };

    const setDraggingClass = (dragging: boolean) => {
      canvas.classList.toggle("is-dragging", dragging);
    };

    const startRotation = (event: PointerEvent) => {
      isDragging = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastPointerTime = performance.now();
      spinVelocity = 0;
      pitchVelocity = 0;
      setDraggingClass(true);
      canvas.setPointerCapture(event.pointerId);
    };

    const rotateWithPointer = (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }

      const now = performance.now();
      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;
      const deltaTime = Math.max(16, now - lastPointerTime);

      rotation += deltaX * 0.012;
      pitch = clamp(pitch - deltaY * 0.009, 0, maxPitch);
      spinVelocity = (deltaX / deltaTime) * 0.22;
      pitchVelocity = (-deltaY / deltaTime) * 0.18;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastPointerTime = now;
    };

    const stopRotation = (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      setDraggingClass(false);
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    const cancelCapturedRotation = () => {
      isDragging = false;
      setDraggingClass(false);
    };

    const rotateWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        rotation -= 0.28;
        spinVelocity = -0.025;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        rotation += 0.28;
        spinVelocity = 0.025;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        pitch = clamp(pitch + 0.18, 0, maxPitch);
        pitchVelocity = 0.018;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        pitch = clamp(pitch - 0.18, 0, maxPitch);
        pitchVelocity = -0.018;
      }
    };

    const drawScene = (now = performance.now()) => {
      frame += reduceMotion ? 0 : 1;
      if (!reduceMotion) {
        if (!isDragging) {
          rotation += spinVelocity;
          pitch = clamp(pitch + pitchVelocity, 0, maxPitch);
          spinVelocity = spinVelocity * 0.985 + 0.0032 * 0.015;
          pitchVelocity *= 0.94;
        }
      }
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#020403";
      ctx.fillRect(0, 0, width, height);

      if (surpriseActiveRef.current) revealStartedAt ??= now;
      const elapsed = revealStartedAt === undefined ? -1 : (now - revealStartedAt) / 1000;
      const treeProgress = clamp(elapsed / 2.4, 0, 1);
      const decorProgress = clamp((elapsed - 2.4) / 2.3, 0, 1);
      const starProgress = clamp((elapsed - 4.7) / 0.65, 0, 1);
      const flightProgress = (elapsed - 5.7) / 10;

      const cx = width * 0.515;
      const baseY = height * 0.82;
      const treeHeight = Math.min(height * 0.62, width * 0.72, 460);
      const baseRadius = Math.min(width * 0.3, treeHeight * 0.52);
      const scale = treeHeight / 470;
      const pitchSin = Math.sin(pitch);
      const pitchCos = Math.cos(pitch);
      const pitchAmount = Math.abs(pitchSin);
      const viewCenterY = baseY - treeHeight * 0.38 * pitchAmount;
      const projectPoint = (localX: number, localY: number, localZ: number) => {
        const cameraY = localY * pitchCos + localZ * pitchSin + localZ * pitchCos * 0.18;
        const cameraZ = localZ * pitchCos - localY * pitchSin;
        const perspective = clamp(1 + cameraZ / (treeHeight * 2.35), 0.56, 1.62);

        return {
          x: cx + localX * perspective,
          y: viewCenterY + cameraY * perspective,
          z: cameraZ,
          perspective,
        };
      };
      const basePoint = projectPoint(0, 0, 0);
      const corePoint = projectPoint(0, -treeHeight * 0.34 * treeProgress, 0);

      if (treeProgress > 0) {
        drawGlow(ctx, cx, corePoint.y, baseRadius * treeProgress, "rgba(39,151,76,0.25)");
      }

      for (const flake of snowParticles) {
        if (!reduceMotion) {
          flake.y += flake.speed;
          flake.x += flake.drift + Math.sin(frame / 70 + flake.phase) * 0.08;
          if (flake.y > height + 8) {
            flake.y = height * 0.08;
            flake.x = random(0, width);
          }
        }
        ctx.fillStyle = `rgba(255,255,255,${flake.alpha})`;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      if (elapsed < 0) {
        animation = window.requestAnimationFrame(drawScene);
        return;
      }

      drawGlow(ctx, cx, basePoint.y - treeHeight * 0.06 * pitchCos, baseRadius * (1.08 + pitchAmount * 0.18), "rgba(255,255,255,0.34)");
      const ringWidths = [0.55, 0.78, 1.02, 1.24];
      for (const point of ringParticles) {
        const wobble = Math.sin(frame / 120 + point.angle * 2 + point.ring) * 0.012;
        const angle = point.angle + wobble + rotation * 0.18;
        const ringWidth = width * ringWidths[point.ring] * 0.5;
        const ringDepth = ringWidth * 0.52;
        const projected = projectPoint(Math.cos(angle) * ringWidth, 0, Math.sin(angle) * ringDepth);
        const x = projected.x + point.jitterX * 9 * scale;
        const y = projected.y + point.jitterY * 5 * scale;
        const frontBoost = Math.sin(angle) > 0 ? 0.18 : -0.06;
        ctx.fillStyle = `rgba(245,250,255,${Math.max(0.1, point.alpha + frontBoost)})`;
        ctx.beginPath();
        ctx.arc(x, y, point.size * scale * projected.perspective, 0, Math.PI * 2);
        ctx.fill();
      }

      drawSolidBranches(ctx, treeProgress, treeHeight, baseRadius, rotation, projectPoint);
      ctx.save();

      for (const point of treeParticles) {
        if (point.height >= treeProgress) continue;
        const branchWave = Math.sin(point.height * Math.PI * 12.8 + point.angle * 0.6);
        const spiral = point.angle + point.height * 14.2 + frame * 0.008 + rotation;
        const breathing = 1 + Math.sin(frame / 90 + point.twinkle) * 0.025;
        const layerBreath = 1 + point.tierStrength * Math.sin(frame / 80 + point.twinkle) * 0.035;
        const topSpread = point.height > 0.82 ? (point.height - 0.82) * 0.13 : 0;
        const radius =
          baseRadius *
          (point.radius + point.branch + branchWave * (0.018 + point.tierStrength * 0.028) + topSpread) *
          breathing *
          layerBreath;
        const localX = Math.cos(spiral) * radius;
        const branchSag = point.tierStrength * Math.pow(point.edgeBias, 1.3) * 12 * scale;
        const localY =
          -point.height * treeHeight +
          branchSag +
          Math.sin(spiral * 2.1) * (4.8 + point.tierStrength * 3.2) * scale;
        const localZ = Math.sin(spiral) * radius;
        const projected = projectPoint(localX, localY, localZ);
        const depth = 0.6 + clamp(projected.z / (baseRadius * 1.55), -0.42, 0.55);
        const pulse = (Math.sin(frame / 16 + point.twinkle) + 1) / 2;
        const depthAlpha = clamp(0.68 + projected.z / (baseRadius * 1.42), 0.34, 1.16);
        const layerAlpha = clamp(point.alpha * (0.72 + point.tierStrength * 0.32 + point.coreGlow * 0.18) * depthAlpha, 0.12, 1);
        const spineFade = point.height > 0.86 ? 0.72 : 1;
        const size =
          point.size *
          scale *
          spineFade *
          projected.perspective *
          (0.64 + depth * 0.38 + pulse * 0.28 + point.tierStrength * 0.26 + point.coreGlow * 0.24);

        if (point.height > 0.07 && projected.z > -baseRadius * 0.15) {
          ctx.strokeStyle = particleColor(point.tone, pulse, layerAlpha * 0.55);
          ctx.lineWidth = Math.max(0.4, size * 0.55);
          const reach = size * 3.6;
          const lean = projected.x < cx ? -1 : 1;
          ctx.beginPath();
          ctx.moveTo(projected.x, projected.y);
          ctx.lineTo(projected.x + lean * reach, projected.y + reach * (0.28 + Math.sin(point.twinkle) * 0.42));
          ctx.stroke();
        }

        if (point.tone > 0.985 && pulse > 0.72) {
          ctx.fillStyle = `rgba(205,244,200,${0.48 * pulse})`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      if (decorProgress > 0) {
        drawTreeDecorations(ctx, decorProgress, treeHeight, baseRadius, scale, rotation, projectPoint);
        const colors = ["#ffe19b", "#ff626e", "#e4f4ff", "#78baff"];
        for (let i = 0; i <= 200; i++) {
          const t = i / 200;
          if (t > decorProgress) break;
          const angle = t * Math.PI * 10 + rotation;
          const radius = baseRadius * Math.pow(1 - t, 0.86);
          const light = projectPoint(Math.cos(angle) * radius, -t * treeHeight, Math.sin(angle) * radius);
          const bulb = i % 6 === 0;
          ctx.globalAlpha = Math.sin(angle) < 0 ? 0.38 : 1;
          ctx.fillStyle = bulb ? colors[(i / 6) % colors.length] : "#f5c568";
          ctx.beginPath();
          ctx.arc(light.x, light.y, (bulb ? 4 : 1.5) * Math.max(0.45, scale) * light.perspective, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (starProgress > 0) {
        const top = projectPoint(0, -treeHeight - 14 * scale, 0);
        drawStar(ctx, top.x, top.y, 20 * Math.max(0.55, scale) * top.perspective * starProgress);
      }

      if (flightProgress >= 0) {
        drawLandedPresents(ctx, width, height, flightProgress, baseRadius, scale, projectPoint);
        const pass = Math.floor(flightProgress);
        if (pass < santaPasses) {
          drawSantaFlight(ctx, width, height, flightProgress - pass, pass % 2 === 0 ? 1 : -1);
        }
      }

      animation = window.requestAnimationFrame(drawScene);
    };

    resize();
    drawScene();
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", rotateWithKeyboard);
    canvas.addEventListener("pointerdown", startRotation);
    canvas.addEventListener("pointermove", rotateWithPointer);
    canvas.addEventListener("pointerup", stopRotation);
    canvas.addEventListener("pointercancel", stopRotation);
    canvas.addEventListener("lostpointercapture", cancelCapturedRotation);

    return () => {
      window.cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", rotateWithKeyboard);
      canvas.removeEventListener("pointerdown", startRotation);
      canvas.removeEventListener("pointermove", rotateWithPointer);
      canvas.removeEventListener("pointerup", stopRotation);
      canvas.removeEventListener("pointercancel", stopRotation);
      canvas.removeEventListener("lostpointercapture", cancelCapturedRotation);
    };
  }, []);

  return (
    <main className="particle-stage" aria-label="Christmas tree scene" onClick={surpriseRevealed ? undefined : revealSurprise}>
      <audio ref={audioRef} src="/last-christmas.mp3" loop preload="auto" />
      <canvas ref={canvasRef} className="particle-canvas" aria-label="Drag left or right to spin the particle Christmas tree; drag upward for a limited top view" tabIndex={0} />
      {surpriseRevealed && <p className="christmas-script">Merry Christmas</p>}
      {needsMusicStart && (
        <button className={surpriseRevealed ? "music-start-prompt" : "music-start-prompt music-start-prompt--centered"} type="button" onClick={surpriseRevealed ? startMusic : undefined}>
          <span>{surpriseRevealed ? "Resume music" : "Tap for Christmas surprise"}</span>
        </button>
      )}
      <h1 className="sr-only">Merry Christmas particle tree</h1>
    </main>
  );
}
