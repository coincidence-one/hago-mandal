'use client';

import { useEffect, useRef } from 'react';

export interface VerticalPitchCorridorProps {
  progress: number; // 0.0 to 1.0
  isMotionPaused: boolean;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * 108 3D unit-sphere coordinates along the official baseball seam curve
 */
const SEAM_COUNT = 108;
const SEAM_POINTS_3D: Vec3[] = Array.from({ length: SEAM_COUNT }, (_, i) => {
  const t = (i / SEAM_COUNT) * Math.PI * 2;
  const a = 0.42;
  const b = 0.58;
  const c = 2 * Math.sqrt(a * b);
  const x = a * Math.cos(t) - b * Math.cos(3 * t);
  const y = a * Math.sin(t) + b * Math.sin(3 * t);
  const z = c * Math.sin(2 * t);
  const len = Math.hypot(x, y, z) || 1;
  return { x: x / len, y: y / len, z: z / len };
});

/**
 * 160 3D unit-sphere leather pore / grain points so the cowhide texture visibly
 * rotates in 3D space while the studio lighting stays fixed in world space.
 */
const LEATHER_PORES_3D: Vec3[] = Array.from({ length: 160 }, (_, i) => {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / 160);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.sin(phi) * Math.sin(theta),
    z: Math.cos(phi),
  };
});

const rotate3D = (p: Vec3, rx: number, ry: number, rz: number): Vec3 => {
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const y1 = p.y * cosX - p.z * sinX;
  const z1 = p.y * sinX + p.z * cosX;
  const x1 = p.x;

  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x2 = x1 * cosY + z1 * sinY;
  const z2 = -x1 * sinY + z1 * cosY;
  const y2 = y1;

  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  return {
    x: x2 * cosZ - y2 * sinZ,
    y: x2 * sinZ + y2 * cosZ,
    z: z2,
  };
};

/**
 * Evaluates cubic Bezier S-curve connecting:
 * P0 (Top-Right: Pitcher Ohtani's release frame in Act 01)
 * -> Center Macro Apex
 * -> P3 (Bottom-Left: Batter Ohtani's strike-zone frame in Act 03)
 */
const evalCubicBezier = (
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): { x: number; y: number } => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
};

export const VerticalPitchCorridor = ({
  progress,
  isMotionPaused,
}: VerticalPitchCorridorProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef<number>(progress);
  const pausedRef = useRef<boolean>(isMotionPaused);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    pausedRef.current = isMotionPaused;
  }, [isMotionPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let smoothedProgress = progressRef.current;
    let continuousSpin = 0;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    /**
     * World-lit 3D Photorealistic Baseball:
     * Lighting stays fixed at top-left (-0.45, -0.48, 0.75) while the 3D seam
     * geometry and cowhide leather pores rotate smoothly in 3D space.
     */
    const drawStudioBaseball3D = (
      cx: number,
      cy: number,
      radius: number,
      rx: number,
      ry: number,
      rz: number,
      alpha: number
    ) => {
      if (radius < 3 || alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);

      // Soft contact drop-shadow beneath the sphere
      const dropShadow = ctx.createRadialGradient(
        radius * 0.18,
        radius * 0.24,
        radius * 0.2,
        0,
        0,
        radius * 1.45
      );
      dropShadow.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      dropShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = dropShadow;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // Clip to sphere
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.clip();

      // 1. World-fixed studio chiaroscuro cowhide shading (Top-Left Key Light -> Bottom-Right Core Shadow)
      const leatherGrad = ctx.createRadialGradient(
        -radius * 0.36,
        -radius * 0.38,
        radius * 0.04,
        -radius * 0.08,
        -radius * 0.08,
        radius * 1.12
      );
      leatherGrad.addColorStop(0, '#ffffff');
      leatherGrad.addColorStop(0.24, '#f5f4f0');
      leatherGrad.addColorStop(0.55, '#c7c4bc');
      leatherGrad.addColorStop(0.8, '#57534e');
      leatherGrad.addColorStop(0.95, '#1c1917');
      leatherGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = leatherGrad;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

      // 2. Rotating 3D Cowhide Leather Micro-Pores (shaded by fixed world light!)
      for (let i = 0; i < LEATHER_PORES_3D.length; i += 1) {
        const pore = rotate3D(LEATHER_PORES_3D[i], rx, ry, rz);
        if (pore.z <= 0.05) continue;
        const lightIntensity = clamp(
          pore.x * -0.45 + pore.y * -0.45 + pore.z * 0.77,
          0,
          1
        );
        const px = pore.x * radius;
        const py = pore.y * radius;
        const pSize = Math.max(0.7, radius * 0.016 * pore.z);
        ctx.fillStyle = `rgba(28, 25, 23, ${(0.12 + lightIntensity * 0.16) * pore.z})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Project 3D Seam Curve & 108 Raised V-Chevron Stitches
      const rotatedSeam = SEAM_POINTS_3D.map((pt) => rotate3D(pt, rx, ry, rz));

      // Depressed seam groove shadow
      ctx.strokeStyle = 'rgba(28, 25, 23, 0.55)';
      ctx.lineWidth = Math.max(1.4, radius * 0.085);
      ctx.lineCap = 'round';
      ctx.beginPath();
      let penDown = false;
      for (let i = 0; i <= SEAM_COUNT; i += 1) {
        const pt = rotatedSeam[i % SEAM_COUNT];
        if (!pt) continue;
        if (pt.z > -0.04) {
          const sx = pt.x * radius;
          const sy = pt.y * radius;
          if (!penDown) {
            ctx.moveTo(sx, sy);
            penDown = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        } else {
          penDown = false;
        }
      }
      ctx.stroke();

      // Raised crimson V-stitches shaded by fixed top-left studio light
      const stitchSpan = Math.max(1.6, radius * 0.095);
      ctx.lineWidth = Math.max(1.1, radius * 0.042);

      for (let i = 0; i < SEAM_COUNT; i += 1) {
        const curr = rotatedSeam[i];
        const next = rotatedSeam[(i + 1) % SEAM_COUNT];
        if (!curr || !next || curr.z <= 0.02) continue;

        const sx = curr.x * radius;
        const sy = curr.y * radius;
        const tx = next.x * radius - sx;
        const ty = next.y * radius - sy;
        const tLen = Math.hypot(tx, ty) || 1;
        const ux = tx / tLen;
        const uy = ty / tLen;
        const nx = -uy;
        const ny = ux;

        const foreshorten = Math.pow(curr.z, 0.45);
        const sLen = stitchSpan * foreshorten;

        // World-space lighting dot product so stitches on the dark right side go dark crimson
        const lightDot = clamp(
          curr.x * -0.48 + curr.y * -0.48 + curr.z * 0.73,
          0.12,
          1
        );
        const rCol = Math.round(70 + lightDot * 165);
        const gCol = Math.round(8 + lightDot * 22);
        const bCol = Math.round(12 + lightDot * 24);
        ctx.strokeStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;

        ctx.beginPath();
        ctx.moveTo(
          sx + nx * sLen - ux * sLen * 0.45,
          sy + ny * sLen - uy * sLen * 0.45
        );
        ctx.lineTo(sx + ux * sLen * 0.35, sy + uy * sLen * 0.35);
        ctx.lineTo(
          sx - nx * sLen - ux * sLen * 0.45,
          sy - ny * sLen - uy * sLen * 0.45
        );
        ctx.stroke();
      }

      // 4. Subtle edge rim light (Top-Left crisp white, Bottom-Right subtle Volt edge bounce)
      const rimGrad = ctx.createRadialGradient(
        0,
        0,
        radius * 0.78,
        0,
        0,
        radius
      );
      rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      rimGrad.addColorStop(0.88, 'rgba(10, 10, 11, 0.25)');
      rimGrad.addColorStop(1, 'rgba(243, 242, 238, 0.35)');
      ctx.fillStyle = rimGrad;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

      ctx.restore();
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!pausedRef.current) {
        continuousSpin += 0.045;
        smoothedProgress = lerp(smoothedProgress, progressRef.current, 0.2);
      } else {
        smoothedProgress = progressRef.current;
      }

      const p = clamp(smoothedProgress, 0, 1);
      ctx.clearRect(0, 0, w, h);

      // S-Curve Control Points:
      // Starts Top-Right (under Act 01 Pitcher photo frame) -> Sweeps through Center -> Dives Bottom-Left (above Act 03 Batter photo frame)
      const isDesktop = w >= 1024;
      const p0 = { x: isDesktop ? w * 0.72 : w * 0.58, y: h * 0.06 };
      const p1 = { x: isDesktop ? w * 0.72 : w * 0.58, y: h * 0.45 };
      const p2 = { x: isDesktop ? w * 0.28 : w * 0.42, y: h * 0.55 };
      const p3 = { x: isDesktop ? w * 0.28 : w * 0.42, y: h * 0.94 };

      // 1. Draw architectural dotted guide curve (full path)
      ctx.save();
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.14)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 2. Draw active #f4b942 Volt laser path up to current ball position (p)
      const steps = 48;
      const activeSteps = Math.max(1, Math.round(p * steps));
      ctx.save();
      ctx.strokeStyle = '#f4b942';
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      for (let i = 0; i <= activeSteps; i += 1) {
        const st = (i / steps) * Math.min(1, p / Math.max(0.01, activeSteps / steps));
        const pt = evalCubicBezier(clamp(st, 0, p), p0, p1, p2, p3);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Evaluate current 3D Ball Position & Perspective Scale along the S-curve
      const ballPos = evalCubicBezier(p, p0, p1, p2, p3);
      // Perspective bell-curve: swells to a dramatic macro close-up in the center of the flight, tapers at entry/exit
      const perspectiveArc = Math.sin(p * Math.PI);
      const baseUnit = Math.min(w, h) / 560;
      const ballRadius = (24 + perspectiveArc * 52) * baseUnit;

      // 3D Spin angles driven by both scroll scrub (high speed) and subtle idle spin
      const rx = p * 16 + continuousSpin;
      const ry = p * 10 + continuousSpin * 0.6;
      const rz = -0.35 + p * 0.5;

      // Subtle shutter motion-blur ghost behind the ball along the curve
      if (!pausedRef.current && p > 0.03) {
        for (let g = 2; g >= 1; g -= 1) {
          const gt = clamp(p - g * 0.018, 0, 1);
          const gPos = evalCubicBezier(gt, p0, p1, p2, p3);
          const gArc = Math.sin(gt * Math.PI);
          const gRad = (24 + gArc * 52) * baseUnit;
          drawStudioBaseball3D(
            gPos.x,
            gPos.y,
            gRad * 0.94,
            rx - g * 0.35,
            ry - g * 0.2,
            rz,
            0.14 / g
          );
        }
      }

      // Main 3D Studio-Lit Baseball
      drawStudioBaseball3D(ballPos.x, ballPos.y, ballRadius, rx, ry, rz, 1);

      // 4. Minimalist Optical Tracking Crosshair & Telemetry Tag around the ball
      const boxHalf = ballRadius + 14;
      ctx.save();
      ctx.strokeStyle = 'rgba(244, 185, 66, 0.55)';
      ctx.lineWidth = 1;
      const cornerLen = 8;

      // Top-left bracket
      ctx.beginPath();
      ctx.moveTo(ballPos.x - boxHalf, ballPos.y - boxHalf + cornerLen);
      ctx.lineTo(ballPos.x - boxHalf, ballPos.y - boxHalf);
      ctx.lineTo(ballPos.x - boxHalf + cornerLen, ballPos.y - boxHalf);
      // Top-right bracket
      ctx.moveTo(ballPos.x + boxHalf - cornerLen, ballPos.y - boxHalf);
      ctx.lineTo(ballPos.x + boxHalf, ballPos.y - boxHalf);
      ctx.lineTo(ballPos.x + boxHalf, ballPos.y - boxHalf + cornerLen);
      // Bottom-left bracket
      ctx.moveTo(ballPos.x - boxHalf, ballPos.y + boxHalf - cornerLen);
      ctx.lineTo(ballPos.x - boxHalf, ballPos.y + boxHalf);
      ctx.lineTo(ballPos.x - boxHalf + cornerLen, ballPos.y + boxHalf);
      // Bottom-right bracket
      ctx.moveTo(ballPos.x + boxHalf - cornerLen, ballPos.y + boxHalf);
      ctx.lineTo(ballPos.x + boxHalf, ballPos.y + boxHalf);
      ctx.lineTo(ballPos.x + boxHalf, ballPos.y + boxHalf - cornerLen);
      ctx.stroke();

      // Monospace coordinate label next to reticle
      ctx.fillStyle = '#f4b942';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const distRemaining = lerp(18.44, 0.43, p).toFixed(2);
      ctx.fillText(
        `LOCK // ${distRemaining}M`,
        ballPos.x + boxHalf + 8,
        ballPos.y - 2
      );
      ctx.fillStyle = 'rgba(243, 242, 238, 0.7)';
      ctx.fillText(
        '165.0 KM/H · 2,650 RPM',
        ballPos.x + boxHalf + 8,
        ballPos.y + 12
      );
      ctx.restore();

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const p = clamp(progress, 0, 1);
  const remainingMeters = lerp(18.44, 0.43, p).toFixed(2);
  const elapsedSeconds = lerp(0.0, 0.4, p).toFixed(2);
  const marqueeShiftLeft = isMotionPaused ? 0 : -p * 280;
  const marqueeShiftRight = isMotionPaused ? 0 : p * 280 - 160;

  return (
    <section
      id="pitch-corridor"
      className="relative h-[175vh] w-full border-y border-white/10 bg-[#0b0c0e] select-none"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden pt-16 pb-6">
        {/* Subtle Architectural Film Grain */}
        <div
          aria-hidden="true"
          className="film-grain-overlay pointer-events-none absolute inset-0 opacity-60"
        />

        {/* Top Kinetic Marquee */}
        <div
          aria-hidden="true"
          className="relative z-10 w-full overflow-hidden border-b border-white/10 py-2.5"
        >
          <div
            style={{
              transform: `translate3d(${marqueeShiftLeft.toFixed(1)}px, 0, 0)`,
            }}
            className="font-display whitespace-nowrap text-2xl tracking-wider text-stroke-editorial uppercase sm:text-4xl"
          >
            165.0 KM/H // 2,650 RPM // FOUR-SEAM FASTBALL // MOUND TO PLATE // 165.0 KM/H // 2,650 RPM // FOUR-SEAM FASTBALL //
          </div>
        </div>

        {/* Split Editorial Telemetry Readouts (Top-Left & Bottom-Right so Center S-Curve is 100% clear for the 3D Ball!) */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-4 py-6 sm:px-8">
          {/* Upper-Left Telemetry Block */}
          <div className="flex flex-col items-start">
            <span className="font-mono-tech border border-[#f4b942]/40 bg-[#0b0c0e] px-3 py-1 text-[11px] font-bold tracking-[0.25em] text-[#f4b942] uppercase">
              ACT 02 // 18.44M PITCH FLIGHT
            </span>
            <p className="font-display mt-3 text-6xl leading-none tracking-tight text-[#f4f1ea] tabular-nums sm:text-8xl lg:text-9xl">
              {remainingMeters}
              <span className="text-[#f4b942]">M</span>
            </p>
            <p className="font-mono-tech mt-1 text-xs tracking-widest text-zinc-400 uppercase">
              DISTANCE TO HOME PLATE · ELAPSED{' '}
              <strong className="text-[#f4f1ea]">{elapsedSeconds}S</strong>
            </p>
          </div>

          {/* Lower-Right Telemetry Block */}
          <div className="flex flex-col items-end text-right">
            <p className="font-display text-4xl leading-none tracking-tight text-stroke-editorial uppercase sm:text-6xl">
              0.40 SEC DECISION
            </p>
            <p className="font-mono-tech mt-2 text-xs tracking-widest text-zinc-400 uppercase">
              18.44M FROM THE MOUND <span className="text-[#f4b942]">→</span> 0.40 SECONDS TO REACT
            </p>
          </div>
        </div>

        {/* Full-Viewport 3D World-Lit Baseball & S-Curve Trajectory Canvas */}
        <canvas
          ref={canvasRef}
          aria-label="마운드에서 홈플레이트까지 S자 궤적으로 회전하며 날아가는 3D 실사 야구공"
          className="pointer-events-none absolute inset-0 z-20 block h-full w-full"
        />

        {/* Bottom Kinetic Marquee */}
        <div
          aria-hidden="true"
          className="relative z-10 w-full overflow-hidden border-t border-white/10 py-2.5"
        >
          <div
            style={{
              transform: `translate3d(${marqueeShiftRight.toFixed(1)}px, 0, 0)`,
            }}
            className="font-display whitespace-nowrap text-2xl tracking-wider text-zinc-800 uppercase sm:text-4xl"
          >
            0.40 SECONDS TO DECIDE // STRIKE ZONE 3×3 // TWO-WAY 二刀流 // 0.40 SECONDS TO DECIDE // STRIKE ZONE 3×3 //
          </div>
        </div>
      </div>
    </section>
  );
};
