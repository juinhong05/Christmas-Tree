"use client";

import { useEffect, useRef } from "react";

type TreeParticle = {
  height: number;
  angle: number;
  radius: number;
  size: number;
  alpha: number;
  twinkle: number;
  tone: number;
  branch: number;
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

type HeartParticle = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkle: number;
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

function drawHeartShape(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frame: number) {
  const pulse = 1 + Math.sin(frame / 24) * 0.035;
  const s = size * pulse;
  const gradient = ctx.createRadialGradient(x - s * 0.18, y - s * 0.22, 0, x, y, s * 1.2);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.38, "rgba(255,204,218,0.96)");
  gradient.addColorStop(1, "rgba(255,104,145,0.86)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.62);
  ctx.bezierCurveTo(x - s * 1.18, y - s * 0.06, x - s * 0.78, y - s * 0.98, x, y - s * 0.44);
  ctx.bezierCurveTo(x + s * 0.78, y - s * 0.98, x + s * 1.18, y - s * 0.06, x, y + s * 0.62);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.62)";
  ctx.lineWidth = Math.max(1, size * 0.07);
  ctx.stroke();
}

function createTreeParticles(count: number) {
  const particles: TreeParticle[] = [];
  for (let i = 0; i < count; i += 1) {
    const height = Math.pow(Math.random(), 0.72);
    const cone = Math.pow(1 - height, 0.9);
    const tier = 0.72 + Math.pow(Math.max(0, Math.sin(height * Math.PI * 8.4)), 1.8) * 0.38;
    particles.push({
      height,
      angle: random(0, Math.PI * 2),
      radius: cone * tier * random(0.08, 1),
      size: random(0.45, 1.45),
      alpha: random(0.42, 0.95),
      twinkle: random(0, Math.PI * 2),
      tone: Math.random(),
      branch: random(-0.02, 0.02),
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

function createHeartParticles(count: number) {
  const particles: HeartParticle[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = random(0, Math.PI * 2);
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    const fill = Math.sqrt(Math.random());
    particles.push({
      x: x * fill,
      y: y * fill,
      size: random(0.65, 1.55),
      alpha: random(0.5, 0.95),
      twinkle: random(0, Math.PI * 2),
    });
  }
  return particles;
}

function particleColor(tone: number, pulse: number) {
  if (tone > 0.78) {
    return `rgba(255,255,255,${0.72 + pulse * 0.22})`;
  }
  if (tone > 0.42) {
    return `rgba(255,214,226,${0.58 + pulse * 0.28})`;
  }
  return `rgba(255,118,154,${0.5 + pulse * 0.24})`;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const treeParticles = createTreeParticles(6400);
    const ringParticles = createRingParticles(3300);
    const heartParticles = createHeartParticles(260);
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
      pitch = clamp(pitch + deltaY * 0.006, -0.62, 0.62);
      spinVelocity = (deltaX / deltaTime) * 0.22;
      pitchVelocity = (deltaY / deltaTime) * 0.11;
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
        pitch = clamp(pitch - 0.16, -0.62, 0.62);
        pitchVelocity = -0.012;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        pitch = clamp(pitch + 0.16, -0.62, 0.62);
        pitchVelocity = 0.012;
      }
    };

    const drawScene = () => {
      frame += reduceMotion ? 0 : 1;
      if (!reduceMotion) {
        if (!isDragging) {
          rotation += spinVelocity;
          pitch = clamp(pitch + pitchVelocity, -0.62, 0.62);
          spinVelocity = spinVelocity * 0.985 + 0.0032 * 0.015;
          pitchVelocity *= 0.94;
        }
      }
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#020403";
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.515;
      const baseY = height * 0.82;
      const treeHeight = Math.min(height * 0.62, width * 0.72, 460);
      const baseRadius = Math.min(width * 0.3, treeHeight * 0.52);
      const scale = treeHeight / 470;
      const pitchSin = Math.sin(pitch);
      const pitchCos = Math.cos(pitch);

      drawGlow(ctx, cx, baseY - treeHeight * 0.27, baseRadius * 1.35, "rgba(255,142,178,0.34)");
      drawGlow(ctx, cx, baseY - treeHeight * 0.06, baseRadius * 1.15, "rgba(255,255,255,0.34)");

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

      const ringWidths = [0.55, 0.78, 1.02, 1.24];
      for (const point of ringParticles) {
        const wobble = Math.sin(frame / 120 + point.angle * 2 + point.ring) * 0.012;
        const angle = point.angle + wobble + rotation * 0.18;
        const ringWidth = width * ringWidths[point.ring] * 0.5;
        const ringHeight = height * (0.055 + point.ring * 0.015) * (1 - Math.abs(pitch) * 0.34);
        const x = cx + Math.cos(angle) * ringWidth + point.jitterX * 9 * scale;
        const y = baseY + Math.sin(angle) * ringHeight + pitch * 34 * scale + point.jitterY * 5 * scale;
        const frontBoost = Math.sin(angle) > 0 ? 0.18 : -0.06;
        ctx.fillStyle = `rgba(245,250,255,${Math.max(0.1, point.alpha + frontBoost)})`;
        ctx.beginPath();
        ctx.arc(x, y, point.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (const point of treeParticles) {
        const branchWave = Math.sin(point.height * Math.PI * 11 + point.angle * 0.6);
        const spiral = point.angle + point.height * 14.2 + frame * 0.008 + rotation;
        const breathing = 1 + Math.sin(frame / 90 + point.twinkle) * 0.025;
        const topSpread = point.height > 0.82 ? (point.height - 0.82) * 0.13 : 0;
        const radius = baseRadius * (point.radius + point.branch + branchWave * 0.026 + topSpread) * breathing;
        const localX = Math.cos(spiral) * radius;
        const localY = -point.height * treeHeight + Math.sin(spiral * 2.1) * 6.5 * scale;
        const localZ = Math.sin(spiral) * radius * 0.7;
        const tiltedY = localY * pitchCos - localZ * pitchSin;
        const tiltedZ = localY * pitchSin + localZ * pitchCos;
        const perspective = clamp(1 + tiltedZ / (treeHeight * 3.4), 0.72, 1.32);
        const x = cx + localX * perspective;
        const y = baseY + tiltedY * perspective;
        const depth = 0.6 + clamp(tiltedZ / (baseRadius * 2.2), -0.28, 0.38);
        const pulse = (Math.sin(frame / 16 + point.twinkle) + 1) / 2;
        const spineFade = point.height > 0.86 ? 0.72 : 1;
        const size = point.size * scale * spineFade * perspective * (0.78 + depth * 0.42 + pulse * 0.3);

        ctx.fillStyle = particleColor(point.tone, pulse * point.alpha);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        if (point.tone > 0.93 && pulse > 0.62) {
          ctx.fillStyle = `rgba(255,255,255,${0.28 * pulse})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawGlow(ctx, cx, baseY - treeHeight * 0.05, baseRadius * 0.56, "rgba(255,255,255,0.34)");
      drawGlow(ctx, cx, baseY - treeHeight * 0.48, baseRadius * 0.5, "rgba(255,164,190,0.34)");

      const heartScale = Math.max(0.74, scale) * 1.05;
      const tiltedTopY = -treeHeight * pitchCos;
      const tiltedTopZ = -treeHeight * pitchSin;
      const heartPerspective = clamp(1 + tiltedTopZ / (treeHeight * 3.4), 0.82, 1.18);
      const heartY = baseY + tiltedTopY * heartPerspective - 20 * scale;
      drawGlow(ctx, cx, heartY, 44 * heartScale, "rgba(255,122,160,0.34)");
      drawHeartShape(ctx, cx, heartY + 2 * heartScale, 16 * heartScale, frame);
      for (const heart of heartParticles) {
        const pulse = (Math.sin(frame / 12 + heart.twinkle) + 1) / 2;
        const heartAngle = rotation * 0.72;
        const heartX = heart.x * Math.cos(heartAngle) + Math.sin(heartAngle) * heart.size * 0.36;
        ctx.fillStyle = `rgba(255,226,235,${heart.alpha * 0.72})`;
        ctx.beginPath();
        ctx.arc(
          cx + heartX * heartScale,
          heartY + heart.y * heartScale,
          heart.size * heartScale * 0.72 * (0.8 + pulse * 0.32),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.restore();

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
    <main className="particle-stage" aria-label="Particle Christmas tree scene">
      <canvas ref={canvasRef} className="particle-canvas" aria-label="Drag in any direction to rotate the particle Christmas tree" tabIndex={0} />
      <p className="christmas-script">Merry Christmas</p>
      <h1 className="sr-only">Merry Christmas particle tree</h1>
    </main>
  );
}
