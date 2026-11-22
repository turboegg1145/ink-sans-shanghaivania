// Exact musical timeline & choreography engine for Valor Genesect - Shanghaivania (190.00 BPM @ 60fps)

export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = 13484; // 224.733s
export const BPM = 190.0;
export const BEAT_SECONDS = 60 / BPM; // 0.315789s
export const BEAT_FRAMES = BEAT_SECONDS * FPS; // 18.947368 frames
export const BAR_FRAMES = BEAT_FRAMES * 4; // 75.789474 frames
export const PHASE_OFFSET_SECONDS = 0.2197;
export const PHASE_OFFSET_FRAMES = PHASE_OFFSET_SECONDS * FPS; // ~13.18 frames

export type ActId =
  | 'act1_overture'
  | 'act2_first_stroke'
  | 'act3_quiet_dip'
  | 'act4_vial_waltz'
  | 'act5_danmaku_bloom'
  | 'act6_dimensional_rift'
  | 'act7_multiverse_surge'
  | 'act8_hollow_void'
  | 'act9_finale';

export interface ActDef {
  id: ActId;
  index: number;
  start: number;
  end: number;
}

// Frame-verified against the real 60fps spectral onset drops of Shanghaivania.mp3
export const ACTS: readonly ActDef[] = [
  { id: 'act1_overture', index: 1, start: 0, end: 620 },          // 0:00.00 – 0:10.33 (8 bars quiet music-box)
  { id: 'act2_first_stroke', index: 2, start: 620, end: 1836 },   // 0:10.33 – 0:30.60 (16 bars first drop)
  { id: 'act3_quiet_dip', index: 3, start: 1836, end: 2439 },     // 0:30.60 – 0:40.65 (8 bars quiet breath)
  { id: 'act4_vial_waltz', index: 4, start: 2439, end: 3652 },    // 0:40.65 – 1:00.87 (16 bars vial shifts & blasters)
  { id: 'act5_danmaku_bloom', index: 5, start: 3652, end: 6078 }, // 1:00.87 – 1:41.30 (32 bars Touhou danmaku)
  { id: 'act6_dimensional_rift', index: 6, start: 6078, end: 6684 }, // 1:41.30 – 1:51.40 (8 bars bridge / pixel rift)
  { id: 'act7_multiverse_surge', index: 7, start: 6684, end: 9714 }, // 1:51.40 – 2:41.90 (40 bars multiverse storm)
  { id: 'act8_hollow_void', index: 8, start: 9714, end: 10928 },  // 2:41.90 – 3:02.13 (16 bars emotionless monochrome)
  { id: 'act9_finale', index: 9, start: 10928, end: TOTAL_FRAMES }, // 3:02.13 – 3:44.73 (reignition -> 12141 peak -> 13203 cut)
] as const;

export const ACT_MAP: Record<ActId, ActDef> = Object.fromEntries(
  ACTS.map((a) => [a.id, a])
) as Record<ActId, ActDef>;

// Key musical landmarks inside acts
export const LANDMARKS = {
  ACT2_DROP: 620,
  ACT3_BREAK: 1836,
  ACT4_DROP: 2439,
  ACT4_CLIMAX: 3500,    // 58.3s peak
  ACT5_PEAK_A: 4120,    // 68.7s peak
  ACT5_PEAK_B: 4680,    // 78.0s peak
  ACT5_PEAK_C: 5680,    // 94.7s peak
  ACT6_BREAK: 6078,
  ACT7_DROP: 6684,
  ACT7_GROOVE_SHIFT: 8055, // 134.25s heavy bass shift
  ACT8_SILENCE: 9714,
  ACT9_REIGNITION: 10928,
  ACT9_TRANSCEND: 12141,   // 202.35s high-register Touhou climax
  ACT9_FINAL_CUT: 13203,   // 220.05s final cymbal hit & ring-out
} as const;

export function getActAtFrame(frame: number): ActDef {
  for (let i = ACTS.length - 1; i >= 0; i--) {
    if (frame >= ACTS[i].start) return ACTS[i];
  }
  return ACTS[0];
}

export function getActProgress(frame: number, act: ActDef): number {
  const span = Math.max(1, act.end - act.start);
  return Math.max(0, Math.min(1, (frame - act.start) / span));
}

export function beatAtFrame(frame: number): number {
  return (frame - PHASE_OFFSET_FRAMES) / BEAT_FRAMES;
}

export function barAtFrame(frame: number): number {
  return (frame - PHASE_OFFSET_FRAMES) / BAR_FRAMES;
}

/** Crisp exponential decay pulse (1.0 on downbeat, decays cleanly to 0) */
export function beatPulse(frame: number, everyBeats = 1, sharpness = 5.5): number {
  const b = beatAtFrame(frame) / everyBeats;
  const frac = ((b % 1) + 1) % 1;
  return Math.exp(-frac * sharpness);
}

/** Deliberate damped impact recoil (NO continuous jitter). Returns 0 outside [0, durationFrames]. */
export function impactRecoil(frame: number, hitFrame: number, durationFrames = 14): number {
  const dt = frame - hitFrame;
  if (dt < 0 || dt > durationFrames) return 0;
  const t = dt / durationFrames;
  // Fast crisp kick, clean critically-damped settle
  return Math.sin(t * Math.PI * 1.5) * Math.exp(-t * 5.2);
}

/** Hit-stop helper: freezes a visual clock for `holdFrames` right after `hitFrame` for sakuga punch */
export function applyHitStop(frame: number, hits: readonly { at: number; hold: number }[]): {
  effectiveFrame: number;
  inHitStop: boolean;
  hitStopProgress: number;
} {
  let offset = 0;
  for (const h of hits) {
    if (frame >= h.at && frame < h.at + h.hold) {
      return {
        effectiveFrame: h.at - offset,
        inHitStop: true,
        hitStopProgress: (frame - h.at) / Math.max(1, h.hold),
      };
    }
    if (frame >= h.at + h.hold) {
      offset += h.hold;
    }
  }
  return { effectiveFrame: frame - offset, inHitStop: false, hitStopProgress: 0 };
}
