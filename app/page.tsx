"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

type Flake = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  phase: number;
};

type Sparkle = {
  x: number;
  y: number;
  radius: number;
  phase: number;
  color: string;
};

const ornaments = [
  { x: -50, y: -130, r: 11, color: "#ff4d6d" },
  { x: 52, y: -96, r: 12, color: "#74d7ff" },
  { x: -95, y: -36, r: 11, color: "#ffd166" },
  { x: 92, y: 6, r: 10, color: "#ff9f1c" },
  { x: -140, y: 88, r: 12, color: "#e0aaff" },
  { x: 8, y: 120, r: 11, color: "#ff4d6d" },
  { x: 142, y: 104, r: 13, color: "#80ed99" },
  { x: -44, y: 178, r: 12, color: "#9bf6ff" },
  { x: 90, y: 196, r: 10, color: "#ffd166" },
];

const wish =
  "\u4ece\u5c4f\u5e55\u5230\u661f\u5149\uff0c\u4ece\u4ee3\u7801\u5230\u6d6a\u6f2b\uff0c\u8fd9\u68f5\u5723\u8bde\u6811\u613f\u70b9\u4eae\u4f60\u7684\u51ac\u65e5\uff0c\u4e5f\u70b9\u4eae\u4f60\u5fc3\u91cc\u7684\u5c0f\u4e16\u754c\u3002";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - height / 2);
  ctx.lineTo(x - width / 2, y + height / 2);
  ctx.lineTo(x + width / 2, y + height / 2);
  ctx.closePath();
  ctx.fill();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outer: number,
  inner: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}

function drawGarland(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  width: number,
  color: string,
  phase: number,
  scale: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < 80; i += 1) {
    const p = i / 79;
    const x = cx + (p - 0.5) * width;
    const wave = Math.sin(p * Math.PI * 4 + phase) * 12 * scale;
    if (i === 0) {
      ctx.moveTo(x, y + wave);
    } else {
      ctx.lineTo(x, y + wave);
    }
  }
  ctx.stroke();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "#ff4d6d";
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.35);
  ctx.bezierCurveTo(x - size * 1.35, y - size * 0.5, x - size * 0.85, y - size * 1.6, x, y - size * 0.75);
  ctx.bezierCurveTo(x + size * 0.85, y - size * 1.6, x + size * 1.35, y - size * 0.5, x, y + size * 0.35);
  ctx.fill();
}

function drawTree(ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) {
  const scale = Math.min(width / 980, height / 820, 1.12);
  const cx = width * 0.5;
  const ground = height * 0.78;
  const top = ground - 510 * scale;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#07111f");
  sky.addColorStop(0.55, "#10233c");
  sky.addColorStop(1, "#16354b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 22; i += 1) {
    const x = ((i * 137) % width) + Math.sin(frame / 90 + i) * 12;
    const y = 38 + ((i * 59) % Math.max(140, height * 0.46));
    ctx.beginPath();
    ctx.arc(x, y, i % 3 === 0 ? 1.8 : 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  const hill = ctx.createLinearGradient(0, ground - 10 * scale, 0, height);
  hill.addColorStop(0, "#f8fbff");
  hill.addColorStop(1, "#bde0fe");
  ctx.fillStyle = hill;
  ctx.beginPath();
  ctx.ellipse(cx - 170 * scale, ground + 40 * scale, 270 * scale, 80 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 120 * scale, ground + 44 * scale, 310 * scale, 88 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(cx - 34 * scale, ground - 50 * scale, 68 * scale, 92 * scale);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(cx - 8 * scale, ground - 48 * scale, 8 * scale, 88 * scale);

  drawTriangle(ctx, cx, top + 64 * scale, 180 * scale, 155 * scale, "#27c46d");
  drawTriangle(ctx, cx, top + 145 * scale, 270 * scale, 220 * scale, "#0f8f4f");
  drawTriangle(ctx, cx, top + 255 * scale, 365 * scale, 280 * scale, "#08653b");
  drawTriangle(ctx, cx, top + 386 * scale, 465 * scale, 335 * scale, "#064a32");

  drawTriangle(ctx, cx - 44 * scale, top + 124 * scale, 76 * scale, 70 * scale, "#2bdc77");
  drawTriangle(ctx, cx - 82 * scale, top + 226 * scale, 126 * scale, 100 * scale, "#22b966");
  drawTriangle(ctx, cx - 112 * scale, top + 355 * scale, 160 * scale, 126 * scale, "#118a50");

  drawGarland(ctx, cx, top + 174 * scale, 220 * scale, "#ffd966", frame / 50, scale);
  drawGarland(ctx, cx, top + 272 * scale, 318 * scale, "#ffb3c1", frame / 45 + 0.8, scale);
  drawGarland(ctx, cx, top + 405 * scale, 400 * scale, "#9ad7ff", frame / 42 + 1.6, scale);

  drawStar(ctx, cx, top - 34 * scale, 42 * scale, 18 * scale, "#ffd966");
  drawStar(ctx, cx, top - 34 * scale, 23 * scale, 9 * scale, "#fff7ad");

  for (const item of ornaments) {
    const x = cx + item.x * scale;
    const y = top + 290 * scale + item.y * scale;
    const glow = 1 + Math.sin(frame / 18 + item.x) * 0.08;
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(x, y, item.r * scale * glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.beginPath();
    ctx.arc(x - item.r * scale * 0.32, y - item.r * scale * 0.32, item.r * scale * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHeart(ctx, cx - 12 * scale, top + 300 * scale, 18 * scale);
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [recipient, setRecipient] = useState("you");
  const [sender, setSender] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRecipient(params.get("to") || "you");
    setSender(params.get("from") || "");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const flakes: Flake[] = [];
    const sparkles: Sparkle[] = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animation = 0;
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      flakes.length = 0;
      sparkles.length = 0;
      for (let i = 0; i < 95; i += 1) {
        flakes.push({
          x: rand(0, window.innerWidth),
          y: rand(0, window.innerHeight),
          radius: rand(0.9, 2.7),
          speed: rand(0.45, 1.8),
          drift: rand(-0.35, 0.35),
          phase: rand(0, Math.PI * 2),
        });
      }
      for (let i = 0; i < 42; i += 1) {
        sparkles.push({
          x: rand(window.innerWidth * 0.25, window.innerWidth * 0.75),
          y: rand(window.innerHeight * 0.18, window.innerHeight * 0.72),
          radius: rand(1.2, 2.8),
          phase: rand(0, Math.PI * 2),
          color: ["#ffd966", "#fff7ad", "#bde0fe", "#ffffff"][i % 4],
        });
      }
    };

    const tick = () => {
      frame += reduceMotion ? 0 : 1;
      drawTree(ctx, window.innerWidth, window.innerHeight, frame);

      ctx.fillStyle = "rgba(255,255,255,0.88)";
      for (const flake of flakes) {
        if (!reduceMotion) {
          flake.y += flake.speed;
          flake.x += flake.drift + Math.sin(frame / 24 + flake.phase) * 0.18;
          if (flake.y > window.innerHeight + 8) {
            flake.y = -8;
            flake.x = rand(0, window.innerWidth);
          }
        }
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const sparkle of sparkles) {
        const pulse = reduceMotion ? 0.55 : (Math.sin(frame / 13 + sparkle.phase) + 1) / 2;
        ctx.fillStyle = sparkle.color;
        ctx.globalAlpha = 0.35 + pulse * 0.5;
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.radius + pulse * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animation = window.requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const shareUrl = (nextRecipient = recipient, nextSender = sender) => {
    const url = new URL(window.location.href);
    const cleanRecipient = nextRecipient.trim();
    const cleanSender = nextSender.trim();

    if (cleanRecipient && cleanRecipient !== "you") {
      url.searchParams.set("to", cleanRecipient);
    } else {
      url.searchParams.delete("to");
    }

    if (cleanSender) {
      url.searchParams.set("from", cleanSender);
    } else {
      url.searchParams.delete("from");
    }

    return url.toString();
  };

  const updateUrl = (nextRecipient: string, nextSender: string) => {
    const url = shareUrl(nextRecipient, nextSender);
    window.history.replaceState(null, "", url);
    setCopied(false);
  };

  const onRecipientChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setRecipient(value);
    updateUrl(value, sender);
  };

  const onSenderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSender(value);
    updateUrl(recipient, value);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareGift = async () => {
    const url = shareUrl();
    if (navigator.share) {
      await navigator.share({
        title: "Python Christmas Tree",
        text: wish,
        url,
      });
      return;
    }
    await copyLink();
  };

  const name = recipient.trim() || "you";

  return (
    <main className="gift-stage">
      <canvas ref={canvasRef} className="tree-canvas" aria-hidden="true" />
      <section className="gift-message" aria-label="Christmas greeting">
        <p className="eyebrow">Python Christmas Tree</p>
        <h1>Merry Christmas, {name}</h1>
        <p className="wish">{wish}</p>
        <p className="signature">{sender.trim() ? `From ${sender.trim()}` : "Made with code and starlight"}</p>
      </section>

      <section className="share-panel" aria-label="Personalize and share">
        <label>
          <span>To</span>
          <input value={recipient} onChange={onRecipientChange} maxLength={36} />
        </label>
        <label>
          <span>From</span>
          <input value={sender} onChange={onSenderChange} maxLength={36} placeholder="your name" />
        </label>
        <div className="actions">
          <button type="button" onClick={copyLink} aria-label="Copy gift link">
            {copied ? "Copied" : "Copy link"}
          </button>
          <button type="button" className="primary" onClick={shareGift} aria-label="Share gift link">
            Share
          </button>
        </div>
      </section>
    </main>
  );
}
