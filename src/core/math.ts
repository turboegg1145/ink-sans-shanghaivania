// Deterministic math, easing, PRNG, and spline utilities (100% pure for multi-shard rendering)

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function invLerp(a: number, b: number, v: number): number {
  if (Math.abs(b - a) < 1e-8) return 0;
  return clamp((v - a) / (b - a), 0, 1);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = invLerp(edge0, edge1, x);
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = invLerp(edge0, edge1, x);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function easeOutCubic(t: number): number {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3);
}

export function easeOutExpo(t: number): number {
  const c = clamp(t, 0, 1);
  return c === 1 ? 1 : 1 - Math.pow(2, -10 * c);
}

export function easeInOutQuart(t: number): number {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 8 * c * c * c * c : 1 - Math.pow(-2 * c + 2, 4) / 2;
}

export function easeOutBack(t: number, s = 1.45): number {
  const c = clamp(t, 0, 1) - 1;
  return 1 + (s + 1) * c * c * c + s * c * c;
}

/** Fast deterministic Mulberry32 PRNG */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash1D(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

/** 2D Catmull-Rom spline interpolation for silky SOUL dodging & camera trajectories */
export function catmullRom2D(
  pts: readonly [number, number][],
  tNorm: number
): [number, number] {
  const n = pts.length;
  if (n === 0) return [0, 0];
  if (n === 1) return pts[0];
  const u = clamp(tNorm, 0, 1) * (n - 1);
  const i = Math.min(n - 2, Math.floor(u));
  const t = u - i;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[Math.min(n - 1, i + 1)];
  const p3 = pts[Math.min(n - 1, i + 2)];
  const t2 = t * t;
  const t3 = t2 * t;
  const x =
    0.5 *
    (2 * p1[0] +
      (-p0[0] + p2[0]) * t +
      (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
      (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
  const y =
    0.5 *
    (2 * p1[1] +
      (-p0[1] + p2[1]) * t +
      (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
      (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
  return [x, y];
}
