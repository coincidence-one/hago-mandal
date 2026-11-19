'use client';

import { useEffect, useRef } from 'react';
import { drawStudioBaseball3D } from '@/utils/drawStudioBaseball3D';

export interface HomeRunFlightCorridorProps {
  progress: number; // 0.0 to 1.0
  isMotionPaused: boolean;
}

const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

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

const MANDAL_CORE_9_LABELS: Array<{
  row: number;
  col: number;
  code: string;
  title: string;
  isCore?: boolean;
}> = [
  { row: -1, col: -1, code: '01', title: '몸 만들기' },
  { row: -1, col: 0, code: '02', title: '제구' },
  { row: -1, col: 1, code: '03', title: '구위' },
  { row: 0, col: -1, code: '04', title: '멘탈' },
  { row: 0, col: 0, code: '17', title: '핵심 목표', isCore: true },
  { row: 0, col: 1, code: '05', title: '165km/h' },
  { row: 1, col: -1, code: '06', title: '인간성' },
  { row: 1, col: 0, code: '07', title: '운 (運)' },
  { row: 1, col: 1, code: '08', title: '변화구' },
];

export const HomeRunFlightCorridor = ({
  progress,
  isMotionPaused,
}: HomeRunFlightCorridorProps) => {
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

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!pausedRef.current) {
        continuousSpin += 0.055;
        smoothedProgress = lerp(smoothedProgress, progressRef.current, 0.2);
      } else {
        smoothedProgress = progressRef.current;
      }

      const p = clamp(smoothedProgress, 0, 1);
      ctx.clearRect(0, 0, w, h);

      // Phase A (0.00 -> 0.74): 138M Parabolic Home Run Arch
      // Phase B (0.74 -> 1.00): The Home Run Ball splits into the 3x3 Mandal-Art Core at center-bottom!
      const flightT = clamp(p / 0.76, 0, 1);
      const splitT = clamp((p - 0.74) / 0.26, 0, 1);

      const isDesktop = w >= 1024;
      // Parabolic Home Run Arch:
      // Starts from Upper-Left/Center (leaving Ohtani's bat from Act 04)
      // -> Climbs to a high apex in Upper-Right/Center
      // -> Arrives at Center-Bottom (w*0.5, h*0.56) where it splits into the 3x3 Mandal-Art!
      const p0 = { x: isDesktop ? w * 0.22 : w * 0.2, y: h * 0.78 };
      const p1 = { x: isDesktop ? w * 0.34 : w * 0.32, y: h * 0.06 };
      const p2 = { x: isDesktop ? w * 0.68 : w * 0.68, y: h * 0.1 };
      const p3 = { x: w * 0.5, y: h * 0.56 };

      // Ground baseline for Statcast 3D shadow projection
      const groundY0 = h * 0.82;
      const groundY3 = h * 0.72;

      // 1. Draw Statcast ground projection line & altitude verticals
      ctx.save();
      ctx.strokeStyle = 'rgba(243, 242, 238, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p0.x, groundY0);
      ctx.lineTo(p3.x, groundY3);
      ctx.stroke();

      // Altitude drop-lines along the home-run arch
      const pillarCount = 8;
      for (let i = 1; i <= pillarCount; i += 1) {
        const ptT = i / (pillarCount + 1);
        if (flightT >= ptT) {
          const archPt = evalCubicBezier(ptT, p0, p1, p2, p3);
          const gx = lerp(p0.x, p3.x, ptT);
          const gy = lerp(groundY0, groundY3, ptT);

          ctx.strokeStyle = 'rgba(244, 185, 66, 0.16)';
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(archPt.x, archPt.y);
          ctx.lineTo(gx, gy);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(244, 185, 66, 0.45)';
          ctx.beginPath();
          ctx.arc(gx, gy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 2. Full dotted parabolic guide curve
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

      // 3. Active glowing #f4b942 Volt Home Run trajectory arc
      const steps = 54;
      const activeSteps = Math.max(1, Math.round(flightT * steps));
      ctx.save();
      ctx.strokeStyle = '#f4b942';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i <= activeSteps; i += 1) {
        const st =
          (i / steps) * Math.min(1, flightT / Math.max(0.01, activeSteps / steps));
        const pt = evalCubicBezier(clamp(st, 0, flightT), p0, p1, p2, p3);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      // 4. Current 3D Home-Run Baseball Position & Scale
      const ballPos = evalCubicBezier(flightT, p0, p1, p2, p3);
      const baseUnit = Math.min(w, h) / 560;
      // Swells dramatically at the top of the parabolic arch (flightT ≈ 0.45)
      const archSwell = Math.sin(flightT * Math.PI);
      const ballRadius =
        (22 + archSwell * 54) * baseUnit * (1 - splitT * 0.65);

      // Ferocious backspin rotation
      const rx = -flightT * 22 - continuousSpin * 1.4;
      const ry = flightT * 12 + continuousSpin * 0.7;
      const rz = 0.25 - flightT * 0.5;

      // Motion-blur ghosts during flight
      if (!pausedRef.current && flightT > 0.03 && splitT < 0.3) {
        for (let g = 2; g >= 1; g -= 1) {
          const gt = clamp(flightT - g * 0.02, 0, 1);
          const gPos = evalCubicBezier(gt, p0, p1, p2, p3);
          const gSwell = Math.sin(gt * Math.PI);
          const gRad = (22 + gSwell * 54) * baseUnit;
          drawStudioBaseball3D(
            ctx,
            gPos.x,
            gPos.y,
            gRad * 0.92,
            rx + g * 0.4,
            ry - g * 0.25,
            rz,
            0.15 / g
          );
        }
      }

      // Draw Main 3D Baseball (fades into the center core cell as splitT -> 1)
      if (splitT < 0.95) {
        drawStudioBaseball3D(
          ctx,
          ballPos.x,
          ballPos.y,
          ballRadius,
          rx,
          ry,
          rz,
          1 - splitT * 0.85
        );
      }

      // Optical Tracking Reticle during flight (before split)
      if (splitT < 0.25) {
        const boxHalf = ballRadius + 14;
        const cornerLen = 8;
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 185, 66, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ballPos.x - boxHalf, ballPos.y - boxHalf + cornerLen);
        ctx.lineTo(ballPos.x - boxHalf, ballPos.y - boxHalf);
        ctx.lineTo(ballPos.x - boxHalf + cornerLen, ballPos.y - boxHalf);
        ctx.moveTo(ballPos.x + boxHalf - cornerLen, ballPos.y - boxHalf);
        ctx.lineTo(ballPos.x + boxHalf, ballPos.y - boxHalf);
        ctx.lineTo(ballPos.x + boxHalf, ballPos.y - boxHalf + cornerLen);
        ctx.moveTo(ballPos.x - boxHalf, ballPos.y + boxHalf - cornerLen);
        ctx.lineTo(ballPos.x - boxHalf, ballPos.y + boxHalf);
        ctx.lineTo(ballPos.x - boxHalf + cornerLen, ballPos.y + boxHalf);
        ctx.moveTo(ballPos.x + boxHalf - cornerLen, ballPos.y + boxHalf);
        ctx.lineTo(ballPos.x + boxHalf, ballPos.y + boxHalf);
        ctx.lineTo(ballPos.x + boxHalf, ballPos.y + boxHalf - cornerLen);
        ctx.stroke();

        const curDist = Math.round(flightT * 138);
        const curAlt = Math.round(Math.sin(flightT * Math.PI) * 38);
        ctx.fillStyle = '#f4b942';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `DIST ${curDist}M // ALT ${curAlt}M`,
          ballPos.x + boxHalf + 8,
          ballPos.y - 2
        );
        ctx.fillStyle = 'rgba(243, 242, 238, 0.75)';
        ctx.fillText(
          '191.5 KM/H · 28° BARREL',
          ballPos.x + boxHalf + 8,
          ballPos.y + 12
        );
        ctx.restore();
      }

      // 5. Phase B (splitT > 0.02): The Home Run Ball Bursts into the 9 Mandal-Art Core Nodes!
      if (splitT > 0.02) {
        const easeSplit = 1 - Math.pow(1 - splitT, 3);
        const gridStep = Math.min(w * 0.24, h * 0.17, 118);
        const cellW = gridStep * 0.88;
        const cellH = gridStep * 0.62;

        ctx.save();
        // Shockwave ring expanding from p3
        ctx.strokeStyle = `rgba(244, 185, 66, ${(1 - splitT) * 0.65})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p3.x, p3.y, easeSplit * gridStep * 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        MANDAL_CORE_9_LABELS.forEach((node) => {
          const targetX = p3.x + node.col * gridStep;
          const targetY = p3.y + node.row * (cellH + 14);
          const nx = lerp(p3.x, targetX, easeSplit);
          const ny = lerp(p3.y, targetY, easeSplit);

          // Connector ray from center to outer pillar node
          if (!node.isCore) {
            ctx.strokeStyle = `rgba(244, 185, 66, ${0.28 * easeSplit})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(nx, ny);
            ctx.stroke();
          }

          const cw = cellW * (0.4 + 0.6 * easeSplit);
          const ch = cellH * (0.4 + 0.6 * easeSplit);

          ctx.fillStyle = node.isCore
            ? `rgba(244, 185, 66, ${0.95 * easeSplit})`
            : `rgba(10, 10, 11, ${0.9 * easeSplit})`;
          ctx.strokeStyle = node.isCore
            ? '#f4b942'
            : `rgba(243, 242, 238, ${0.35 * easeSplit})`;
          ctx.lineWidth = node.isCore ? 2 : 1;

          ctx.fillRect(nx - cw * 0.5, ny - ch * 0.5, cw, ch);
          ctx.strokeRect(nx - cw * 0.5, ny - ch * 0.5, cw, ch);

          if (easeSplit > 0.45) {
            ctx.globalAlpha = clamp((easeSplit - 0.45) / 0.55, 0, 1);
            ctx.fillStyle = node.isCore ? '#0b0c0e' : '#f4b942';
            ctx.font = '700 9px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(
              node.isCore ? 'CORE // 17' : `PILLAR ${node.code}`,
              nx,
              ny - 7
            );

            ctx.fillStyle = node.isCore ? '#0b0c0e' : '#f4f1ea';
            ctx.font = '800 12px "SUITE-Regular", sans-serif';
            ctx.fillText(node.title, nx, ny + 10);
            ctx.globalAlpha = 1;
          }
        });
        ctx.restore();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const p = clamp(progress, 0, 1);
  const flightT = clamp(p / 0.76, 0, 1);
  const distanceMeters = Math.round(flightT * 138);
  const distanceFeet = Math.round(distanceMeters * 3.28084);
  const hangTimeSec = (flightT * 5.4).toFixed(1);
  const marqueeShift = isMotionPaused ? 0 : -p * 300;

  return (
    <section
      id="homerun-corridor"
      className="relative h-[185vh] w-full border-t border-white/10 bg-[#0b0c0e] select-none"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden pt-16 pb-6">
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
              transform: `translate3d(${marqueeShift.toFixed(1)}px, 0, 0)`,
            }}
            className="font-display whitespace-nowrap text-2xl tracking-wider text-stroke-editorial uppercase sm:text-4xl"
          >
            EXIT VELOCITY 191.5 KM/H // 28° LAUNCH ANGLE // 138M (453 FT) // BARREL HOME RUN // ONE GOAL INTO 81 ACTIONS //
          </div>
        </div>

        {/* Split Editorial Telemetry Readouts */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-4 py-6 sm:px-8">
          <div className="flex flex-col items-start">
            <span className="font-mono-tech border border-[#f4b942]/40 bg-[#0b0c0e] px-3 py-1 text-[11px] font-bold tracking-[0.25em] text-[#f4b942] uppercase">
              ACT 05 // 138M HOME RUN TRAJECTORY → MANDAL-ART
            </span>
            <div className="mt-3 flex items-baseline gap-4">
              <p className="font-display text-6xl leading-none tracking-tight text-[#f4f1ea] tabular-nums sm:text-8xl lg:text-9xl">
                {distanceMeters}
                <span className="text-[#f4b942]">M</span>
              </p>
              <span className="font-mono-tech text-sm font-bold tracking-widest text-zinc-400 sm:text-lg">
                ({distanceFeet} FT)
              </span>
            </div>
            <p className="font-mono-tech mt-1 text-xs tracking-widest text-zinc-400 uppercase">
              HANG TIME <strong className="text-[#f4f1ea]">{hangTimeSec}S</strong> ·{' '}
              {p >= 0.74
                ? 'SPLITTING INTO 9 MANDAL-ART CORES'
                : 'SOARING OVER CENTER FIELD WALL'}
            </p>
          </div>

          <div className="flex flex-col items-end text-right">
            <p className="font-display text-3xl leading-none tracking-tight text-stroke-editorial uppercase sm:text-5xl">
              {p >= 0.74 ? '1 BALL → 9 CORES → 81 CELLS' : '119.0 MPH EXIT VELO'}
            </p>
            <p className="font-mono-tech mt-2 text-xs tracking-widest text-zinc-400 uppercase">
              ONE DREAM <span className="text-[#f4b942]">→</span> 8 PILLARS{' '}
              <span className="text-[#f4b942]">→</span> 64 DAILY ACTIONS
            </p>
          </div>
        </div>

        {/* Full-Viewport 3D Home Run Ball Flight & 9-Core Split Canvas */}
        <canvas
          ref={canvasRef}
          aria-label="배트를 떠난 3D 홈런 타구가 138m 포물선을 그리며 날아가 9개의 만다라트 코어 격자로 분열하는 캔버스"
          className="pointer-events-none absolute inset-0 z-20 block h-full w-full"
        />
      </div>
    </section>
  );
};
