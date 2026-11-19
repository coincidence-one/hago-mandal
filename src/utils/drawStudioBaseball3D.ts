export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const clamp = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

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

const LEATHER_PORES_3D: Vec3[] = Array.from({ length: 140 }, (_, i) => {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / 140);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.sin(phi) * Math.sin(theta),
    z: Math.cos(phi),
  };
});

export const rotateVec3 = (
  p: Vec3,
  rx: number,
  ry: number,
  rz: number
): Vec3 => {
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
 * Renders a photorealistic 3D MLB baseball on a 2D canvas context.
 * The studio key light is fixed in world space at top-left (-0.45, -0.48, 0.75)
 * while the 3D cowhide pores and 108 raised crimson V-stitches rotate in 3D space.
 */
export const drawStudioBaseball3D = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rz: number,
  alpha: number = 1
): void => {
  if (radius < 2.5 || alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);

  // Soft ambient drop shadow
  const dropShadow = ctx.createRadialGradient(
    radius * 0.16,
    radius * 0.22,
    radius * 0.18,
    0,
    0,
    radius * 1.4
  );
  dropShadow.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
  dropShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = dropShadow;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Clip to sphere
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();

  // 1. World-fixed studio chiaroscuro cowhide shading
  const leatherGrad = ctx.createRadialGradient(
    -radius * 0.36,
    -radius * 0.38,
    radius * 0.04,
    -radius * 0.08,
    -radius * 0.08,
    radius * 1.12
  );
  leatherGrad.addColorStop(0, '#ffffff');
  leatherGrad.addColorStop(0.26, '#f5f4f0');
  leatherGrad.addColorStop(0.56, '#c7c4bc');
  leatherGrad.addColorStop(0.82, '#57534e');
  leatherGrad.addColorStop(0.96, '#1c1917');
  leatherGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = leatherGrad;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

  // 2. Rotating 3D Cowhide Leather Micro-Pores
  if (radius >= 14) {
    for (let i = 0; i < LEATHER_PORES_3D.length; i += 1) {
      const pore = rotateVec3(LEATHER_PORES_3D[i], rx, ry, rz);
      if (pore.z <= 0.05) continue;
      const lightIntensity = clamp(
        pore.x * -0.45 + pore.y * -0.45 + pore.z * 0.77,
        0,
        1
      );
      const px = pore.x * radius;
      const py = pore.y * radius;
      const pSize = Math.max(0.6, radius * 0.015 * pore.z);
      ctx.fillStyle = `rgba(28, 25, 23, ${(0.11 + lightIntensity * 0.15) * pore.z})`;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Project 3D Seam Curve & 108 Raised V-Chevron Stitches
  const rotatedSeam = SEAM_POINTS_3D.map((pt) => rotateVec3(pt, rx, ry, rz));

  ctx.strokeStyle = 'rgba(28, 25, 23, 0.55)';
  ctx.lineWidth = Math.max(1.1, radius * 0.085);
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

  const stitchSpan = Math.max(1.3, radius * 0.095);
  ctx.lineWidth = Math.max(0.9, radius * 0.042);

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

  // 4. Rim highlight
  const rimGrad = ctx.createRadialGradient(
    0,
    0,
    radius * 0.78,
    0,
    0,
    radius
  );
  rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  rimGrad.addColorStop(0.88, 'rgba(10, 10, 11, 0.22)');
  rimGrad.addColorStop(1, 'rgba(243, 242, 238, 0.35)');
  ctx.fillStyle = rimGrad;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

  ctx.restore();
};
