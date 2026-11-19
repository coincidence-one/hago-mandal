'use client';

import { useEffect, useRef } from 'react';
import { drawStudioBaseball3D } from '@/utils/drawStudioBaseball3D';
import { cn } from '@/utils/cn';

export interface BurstFrameMeta {
  src: string;
  label: string;
  focalX?: number;
  focalY?: number;
}

export type BallSyncMode = 'none' | 'batter-contact' | 'homerun-launch';

export interface OhtaniScrollCanvasProps {
  frames: BurstFrameMeta[];
  progress: number; // 0.0 to 1.0
  isMotionPaused: boolean;
  customPhotoUrl?: string;
  zoomStart?: number;
  zoomEnd?: number;
  saturationStart?: number;
  saturationEnd?: number;
  ballSyncMode?: BallSyncMode;
  className?: string;
  ariaLabel: string;
}

const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const evalQuadBezier = (
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): { x: number; y: number } => {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
};

export const OhtaniScrollCanvas = ({
  frames,
  progress,
  isMotionPaused,
  customPhotoUrl,
  zoomStart = 1.0,
  zoomEnd = 1.05,
  saturationStart = 0.2,
  saturationEnd = 0.95,
  ballSyncMode = 'none',
  className,
  ariaLabel,
}: OhtaniScrollCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>([]);
  const progressRef = useRef<number>(progress);
  const pausedRef = useRef<boolean>(isMotionPaused);
  const framesRef = useRef<BurstFrameMeta[]>(frames);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    pausedRef.current = isMotionPaused;
  }, [isMotionPaused]);

  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  // Preload all burst frames cleanly
  useEffect(() => {
    let isMounted = true;
    const loaded: Array<HTMLImageElement | null> = Array.from(
      { length: frames.length },
      () => null
    );
    imagesRef.current = loaded;

    frames.forEach((frame, idx) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!isMounted) return;
        loaded[idx] = img;
      };
      img.src = frame.src;
      if (img.complete && img.naturalWidth > 0) {
        loaded[idx] = img;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [frames]);

  useEffect(() => {
    if (customPhotoUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let smoothedProgress = progressRef.current;
    let spinTick = 0;

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
     * Computes exact draw box (dx, dy, drawW, drawH) for an image of dimensions (natW, natH)
     * so we can project normalized photo coordinates (u, v) -> exact canvas pixels!
     */
    const getCoverTransform = (
      natW: number,
      natH: number,
      w: number,
      h: number,
      focalX: number,
      focalY: number,
      zoom: number
    ) => {
      const coverScale = Math.max(w / natW, h / natH) * zoom;
      const drawW = natW * coverScale;
      const drawH = natH * coverScale;
      const dx = (w - drawW) * focalX;
      const dy = (h - drawH) * focalY;
      return { dx, dy, drawW, drawH };
    };

    const drawCoverSubject = (
      img: HTMLImageElement,
      w: number,
      h: number,
      focalX: number,
      focalY: number,
      zoom: number,
      alpha: number,
      saturation: number
    ) => {
      if (!img.complete || img.naturalWidth === 0 || alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.filter = `contrast(1.18) brightness(0.94) saturate(${saturation.toFixed(2)})`;

      const { dx, dy, drawW, drawH } = getCoverTransform(
        img.naturalWidth,
        img.naturalHeight,
        w,
        h,
        focalX,
        focalY,
        zoom
      );

      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();
    };

    const drawOpticalReticle = (
      x: number,
      y: number,
      halfSize: number,
      tagText: string,
      isLocked: boolean
    ) => {
      ctx.save();
      ctx.strokeStyle = isLocked
        ? '#f4b942'
        : 'rgba(243, 242, 238, 0.6)';
      ctx.lineWidth = isLocked ? 1.8 : 1.1;
      const cLen = Math.max(5, halfSize * 0.35);

      ctx.beginPath();
      // Top-left
      ctx.moveTo(x - halfSize, y - halfSize + cLen);
      ctx.lineTo(x - halfSize, y - halfSize);
      ctx.lineTo(x - halfSize + cLen, y - halfSize);
      // Top-right
      ctx.moveTo(x + halfSize - cLen, y - halfSize);
      ctx.lineTo(x + halfSize, y - halfSize);
      ctx.lineTo(x + halfSize, y - halfSize + cLen);
      // Bottom-left
      ctx.moveTo(x - halfSize, y + halfSize - cLen);
      ctx.lineTo(x - halfSize, y + halfSize);
      ctx.lineTo(x - halfSize + cLen, y + halfSize);
      // Bottom-right
      ctx.moveTo(x + halfSize - cLen, y + halfSize);
      ctx.lineTo(x + halfSize, y + halfSize);
      ctx.lineTo(x + halfSize, y + halfSize - cLen);
      ctx.stroke();

      // Label pill above reticle
      ctx.font = '700 9.5px "JetBrains Mono", monospace';
      const textW = ctx.measureText(tagText).width;
      const pillW = textW + 12;
      const pillH = 16;
      const px = clamp(
        x - pillW * 0.5,
        8,
        canvas.getBoundingClientRect().width - pillW - 8
      );
      const py = Math.max(8, y - halfSize - pillH - 6);

      ctx.fillStyle = isLocked ? '#f4b942' : 'rgba(10, 10, 11, 0.85)';
      ctx.fillRect(px, py, pillW, pillH);
      if (!isLocked) {
        ctx.strokeStyle = 'rgba(244, 185, 66, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, pillW, pillH);
      }

      ctx.fillStyle = isLocked ? '#0b0c0e' : '#f4b942';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, px + pillW * 0.5, py + pillH * 0.5);
      ctx.restore();
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!pausedRef.current) {
        spinTick += 0.05;
        smoothedProgress = lerp(smoothedProgress, progressRef.current, 0.24);
      } else {
        smoothedProgress = progressRef.current;
      }

      const p = clamp(smoothedProgress, 0, 1);
      const list = framesRef.current;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#0b0c0e';
      ctx.fillRect(0, 0, w, h);

      const zoom = lerp(zoomStart, zoomEnd, p);
      const sat = lerp(saturationStart, saturationEnd, p);

      if (list.length > 0) {
        const exactIdx = p * (list.length - 1);
        const baseIdx = Math.floor(exactIdx);
        const nextIdx = Math.min(list.length - 1, baseIdx + 1);
        const blend = exactIdx - baseIdx;

        const baseImg = imagesRef.current[baseIdx];
        const nextImg = imagesRef.current[nextIdx];
        const baseMeta = list[baseIdx];
        const nextMeta = list[nextIdx];

        if (baseImg && baseMeta) {
          drawCoverSubject(
            baseImg,
            w,
            h,
            baseMeta.focalX ?? 0.5,
            baseMeta.focalY ?? 0.5,
            zoom,
            1,
            sat
          );
        }
        if (nextImg && nextMeta && nextIdx !== baseIdx && blend > 0.01) {
          drawCoverSubject(
            nextImg,
            w,
            h,
            nextMeta.focalX ?? 0.5,
            nextMeta.focalY ?? 0.5,
            zoom,
            blend,
            sat
          );
        }
      }

      // =====================================================================
      // PIXEL-EXACT 3D BASEBALL SYNCHRONIZATION IN WIDESCREEN (1920x1280)
      // Ohtani stands on center-right facing LEFT toward pitcher/outfield.
      // The real baseball is in the open green field on the LEFT (never on his body!).
      // =====================================================================
      if (ballSyncMode === 'batter-contact') {
        // In wide-bat-05.jpg (1920 x 1280), the real white baseball in front of Ohtani's bat
        // is located in the open green grass on the LEFT at:
        // u = 0.2732, v = 0.6160
        const lastMeta = list[list.length - 1];
        const tfContact = getCoverTransform(
          1920,
          1280,
          w,
          h,
          lastMeta?.focalX ?? 0.5,
          lastMeta?.focalY ?? 0.5,
          zoom
        );

        const targetX = tfContact.dx + 0.2732 * tfContact.drawW;
        const targetY = tfContact.dy + 0.6160 * tfContact.drawH;
        const targetR = Math.max(9, 0.0135 * tfContact.drawW);

        // Incoming pitch arrives from the pitcher's direction on the FAR LEFT (open field)
        // and curves into the hitting zone in front of Ohtani's bat barrel!
        const startP = {
          x: tfContact.dx + 0.035 * tfContact.drawW,
          y: tfContact.dy + 0.26 * tfContact.drawH,
        };
        const ctrlP = {
          x: tfContact.dx + 0.145 * tfContact.drawW,
          y: tfContact.dy + 0.57 * tfContact.drawH,
        };
        const endP = { x: targetX, y: targetY };

        const curPos = evalQuadBezier(p, startP, ctrlP, endP);
        const curRadius = lerp(targetR * 1.25, targetR, p);

        // Draw dashed incoming pitch curve through the open left field
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 185, 66, 0.72)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        const steps = 28;
        for (let i = 0; i <= steps; i += 1) {
          const st = (i / steps) * p;
          const pt = evalQuadBezier(st, startP, ctrlP, endP);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Draw 3D spinning baseball converging 1:1 onto the real photographed baseball in wide-bat-05.jpg
        drawStudioBaseball3D(
          ctx,
          curPos.x,
          curPos.y,
          curRadius,
          p * 12 + spinTick,
          p * 8 + spinTick * 0.6,
          0.35,
          1.0
        );

        const isContact = p >= 0.78;
        drawOpticalReticle(
          curPos.x,
          curPos.y,
          curRadius + 10,
          isContact ? 'BARREL LOCK // 191.5 KM/H' : 'INCOMING // 165.0 KM/H',
          isContact
        );
      } else if (ballSyncMode === 'homerun-launch') {
        // All 4 frames (wide-hr-01..04.jpg) are 1920x1280 (3:2 widescreen):
        // Frame 0 (p = 0.000): wide-hr-01.jpg -> real ball at contact in open left grass (u = 0.2732, v = 0.6160)
        // Frame 1 (p = 0.333): wide-hr-02.jpg -> real ball right off horizontal bat tip on far left (u = 0.1565, v = 0.4039)
        // Frame 2 (p = 0.667): wide-hr-03.jpg -> Ohtani sky-high follow-through on right; ball climbs into upper-left sky
        // Frame 3 (p = 1.000): wide-hr-04.jpg -> Ball rockets out top-left at (u = 0.038, v = 0.085)
        const tf = getCoverTransform(1920, 1280, w, h, 0.5, 0.5, zoom);

        // Exact contact point (Frame 0 real ball)
        const pContact = {
          x: tf.dx + 0.2732 * tf.drawW,
          y: tf.dy + 0.6160 * tf.drawH,
        };
        // Exact bat-extension point (Frame 1 real ball right off the horizontal bat tip!)
        const pExtension = {
          x: tf.dx + 0.1565 * tf.drawW,
          y: tf.dy + 0.4039 * tf.drawH,
        };
        // High upper-left stadium sky launch exit (Frames 2 -> 3)
        const pSkyExit = {
          x: tf.dx + 0.038 * tf.drawW,
          y: tf.dy + 0.085 * tf.drawH,
        };

        // Construct a single smooth quadratic Bezier from pContact (t=0) to pSkyExit (t=1)
        // whose control point is solved so that at t = 1/3 (Frame 1), the curve passes
        // EXACTLY through pExtension (the real baseball off the horizontal bat tip in wide-hr-02.jpg)!
        // For quadratic Bezier B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2 at t = 1/3:
        // B(1/3) = (4/9) P0 + (4/9) P1 + (1/9) P2 = pExtension
        // => P1 = (9 * pExtension - 4 * P0 - P2) / 4
        const ctrlP = {
          x: (9 * pExtension.x - 4 * pContact.x - pSkyExit.x) / 4,
          y: (9 * pExtension.y - 4 * pContact.y - pSkyExit.y) / 4,
        };

        const curPos = evalQuadBezier(p, pContact, ctrlP, pSkyExit);
        const baseR = Math.max(10, 0.014 * tf.drawW);
        const arcSwell = Math.sin(p * Math.PI) * 5;
        const curRadius = baseR + arcSwell;

        // Draw #f4b942 Volt home-run launch trajectory out into the upper-left sky (away from Ohtani!)
        ctx.save();
        ctx.strokeStyle = '#f4b942';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        const steps = 32;
        for (let i = 0; i <= steps; i += 1) {
          const st = (i / steps) * p;
          const pt = evalQuadBezier(st, pContact, ctrlP, pSkyExit);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Draw glowing impact ring at the bat barrel contact point
        if (p < 0.45) {
          ctx.save();
          ctx.strokeStyle = `rgba(244, 185, 66, ${(1 - p / 0.45) * 0.65})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pContact.x, pContact.y, baseR * (1.3 + p * 2.5), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Motion-blur ghost behind launched home-run ball
        if (!pausedRef.current && p > 0.04) {
          const gPos = evalQuadBezier(
            clamp(p - 0.03, 0, 1),
            pContact,
            ctrlP,
            pSkyExit
          );
          drawStudioBaseball3D(
            ctx,
            gPos.x,
            gPos.y,
            curRadius * 0.9,
            -p * 18 - spinTick,
            p * 12,
            -0.4,
            0.24
          );
        }

        // Main 3D Home-Run Baseball rocketing off the bat into the upper-left sky!
        drawStudioBaseball3D(
          ctx,
          curPos.x,
          curPos.y,
          curRadius,
          -p * 18 - spinTick * 1.4,
          p * 12 + spinTick,
          -0.4,
          1
        );

        drawOpticalReticle(
          curPos.x,
          curPos.y,
          curRadius + 10,
          p > 0.6 ? '28° LAUNCH // 138M' : 'EXIT VELO // 191.5 KM/H',
          p > 0.5
        );
      }

      // Subtle architectural bottom vignette
      const vGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
      vGrad.addColorStop(0, 'rgba(10, 10, 11, 0)');
      vGrad.addColorStop(1, 'rgba(10, 10, 11, 0.82)');
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    customPhotoUrl,
    zoomStart,
    zoomEnd,
    saturationStart,
    saturationEnd,
    ballSyncMode,
  ]);

  if (customPhotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={customPhotoUrl}
        alt={ariaLabel}
        className={cn(
          'h-full w-full object-cover contrast-125 brightness-90',
          className
        )}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label={ariaLabel}
      className={cn('block h-full w-full', className)}
    />
  );
};
