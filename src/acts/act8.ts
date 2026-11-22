import { ActContext, createDefaultSceneState, SceneFrameState } from '../core/sceneState';
import { clamp, easeInOutQuart, lerp, smoothstep } from '../core/math';

/**
 * ACT VIII · 枯瓶无魂 (2:41.9 – 3:02.1 | frames 9714 – 10928 | 16 bars = 20.2s Hollow Monochrome Silence)
 *
 * THE EMOTIONAL HEART OF THE ENTIRE FILM:
 * - Bass vanishes completely for 20 full seconds.
 * - Bars 0–6 (9714–10168): All 8 glass paint vials visibly drain dry one by one and crack in the macro showcase.
 * - Bars 6–13 (10168–10700): Stark monochrome Xuan paper + deep black sumi ink void. Ink!Sans stands completely
 *   still with pitch-black brow shadow & hollow empty eye sockets above a minimal white Battle Box holding ONE
 *   quietly beating Crimson SOUL. A single slow black ink drop falls and ripples outward in pure silence.
 * - Bars 13–16 (10700–10928): Hairline prismatic embers begin pulsing around the void -> Ink slowly lifts his
 *   head -> pinpoint starlight ignites at frame 10922 right before Act IX's nuclear reignition!
 */
export function evaluateAct8(ctx: ActContext): SceneFrameState {
  const s = createDefaultSceneState();
  const { frame, localFrame: lf, progress, time, beatPulse } = ctx;

  // Opening brief white flash decay coming out of Act VII's collapse
  if (lf < 24) {
    s.whiteFlash = (1 - lf / 24) * 0.65;
  }

  // Agonizingly slow, rock-steady cinema push-in (ABSOLUTELY ZERO SHAKE!)
  const push = easeInOutQuart(progress);
  s.camPos = [
    0,
    lerp(0.45, 0.22, push),
    lerp(12.4, 9.8, push) - smoothstep(0.92, 1.0, progress) * 1.0,
  ];
  s.camLookAt = [0, -0.35, 0];
  s.camRoll = 0;

  // Color drains completely into stark archival monochrome Xuan paper + obsidian ink void
  const monoRamp = smoothstep(0, 48, lf);
  // Subtle prismatic ember spark strictly in the final 45 frames before Act IX reignition!
  const reigniteEmber = smoothstep(10870, 10928, frame);
  s.monochrome = monoRamp * (1 - reigniteEmber * 0.65);
  s.paperMix = smoothstep(0, 60, lf) * 0.88;
  s.inkBloom = lerp(0.28, 0.42, push) + reigniteEmber * 0.2;
  s.bloomCenter = [0.5, 0.56];
  s.colorA = reigniteEmber > 0.05 ? '#1AD1E8' : '#222228';
  s.colorB = reigniteEmber > 0.05 ? '#F5D327' : '#888890';
  s.backdropEnergy = 0.08 + reigniteEmber * 0.4;

  // Nearly frozen monochrome Doodle Sphere floating in eerie quietude
  s.doodleOpacity = 0.68;
  s.doodleTurbulence = 0.015;

  // Compute the 8 vials draining dry sequentially across frames 9740..10120!
  const vialLevels = Array.from({ length: 8 }, (_, idx) => {
    const startDrain = 9750 + idx * 42;
    const drainT = smoothstep(startDrain, startDrain + 60, frame);
    return clamp(1 - drainT, 0, 1);
  });
  const shatterT = smoothstep(10020, 10150, frame) * 0.85;

  // Show the draining Vial Macro Showcase across Bars 0..6.5, then fade it out for pure stark stillness!
  const macroIn = smoothstep(24, 72, lf);
  const macroOut = 1 - smoothstep(430, 495, lf);
  if (macroIn * macroOut > 0.01) {
    s.vialMacro = {
      opacity: macroIn * macroOut,
      activeIndex: -1,
      levels: vialLevels,
      shatter: shatterT,
    };
  }

  // Void Ink!Sans — emotionless, empty sockets, drained vials, Broomie lowered in silence
  s.inkOpacity = smoothstep(16, 65, lf);
  s.inkX = 50;
  s.inkY = lerp(38, 35, push);
  s.inkScale = lerp(0.84, 0.90, push);
  s.inkPose = reigniteEmber > 0.5 ? 'brushReady' : 'voidStand';
  s.inkEye = reigniteEmber > 0.62 ? 'starBurst' : 'void';
  s.vialLevels = vialLevels;
  s.brushPaintColor = reigniteEmber > 0.35 ? '#1AD1E8' : '#121216';
  s.headTilt = lerp(6, -4, reigniteEmber);
  s.rimColor = '#1AD1E8';
  s.rimIntensity = reigniteEmber * 0.7;

  // Single slow black ink teardrop falls during the deepest silence (frames 10290..10560)
  if (frame >= 10290 && frame <= 10570) {
    s.inkDropRipple = {
      progress: clamp((frame - 10290) / 280, 0, 1),
      cx: 960,
      cy: 760,
      color: '#0D0D12',
    };
  }

  // Stark white Battle Box cleanly separated below Void Ink, holding ONLY the quietly pulsing Crimson SOUL!
  const boxAppear = smoothstep(465, 535, lf);
  s.boxOpacity = boxAppear;
  s.boxPos = [0, -2.32, 0];
  s.boxRot = [0, 0, 0];
  s.boxWidth = 3.5;
  s.boxHeight = 1.78;
  s.boxBorderColor = '#FAF7F0';
  s.boxFillOpacity = 0.84;
  s.boxOrnament = 0;

  s.soulOpacity = boxAppear;
  s.soulMode = 'red';
  s.soulPos = [0, -2.32, 0.22];
  s.soulScale = 0.29;
  // Gentle heartbeat pulse synced to the sparse music-box pulse
  s.soulPulse = beatPulse * 0.45 + Math.sin(time * 3.1) * 0.08;

  // Zero HUD clutter during this haunting silence; wide cinema letterbox deepens intimacy
  s.hudOpacity = 0;
  s.letterboxPx = lerp(56, 86, smoothstep(0, 120, lf) * (1 - reigniteEmber));

  return s;
}
