import { ActContext, createDefaultSceneState, SceneFrameState } from '../core/sceneState';
import { clamp, easeInOutQuart, easeOutCubic, lerp, smoothstep } from '../core/math';
import { INK_VIALS } from '../core/palette';

/**
 * ACT III · 静息蘸墨 (0:30.6 – 0:40.6 | frames 1836 – 2439 | 8 bars quiet breath & vial macro)
 *
 * Drums drop completely out -> rock-steady intimate camera push-in ->
 * bespoke graphic macro showcase of Ink's 8 glowing translucent glass vials ->
 * each vial lifts & illuminates sequentially, culminating in Cobalt Blue & Solar Gold dip
 * right before the massive Frame 2439 Act IV drop!
 */
export function evaluateAct3(ctx: ActContext): SceneFrameState {
  const s = createDefaultSceneState();
  const { localFrame: lf, duration, progress, time, smoothAudio } = ctx;

  // Rock-steady intimate slow push-in (ZERO shake!)
  const push = easeInOutQuart(progress);
  s.camPos = [
    Math.sin(time * 0.35) * 0.3,
    lerp(0.5, 0.32, push),
    lerp(11.6, 9.5, push) - smoothstep(0.9, 1.0, progress) * 0.9,
  ];
  s.camLookAt = [0, 0.15, 0];

  // Cycle through the 8 vials across the 8 bars!
  const activeVialIdx = Math.min(7, Math.floor(progress * 8));
  const activeVial = INK_VIALS[activeVialIdx];
  const nextVial = INK_VIALS[(activeVialIdx + 2) % 8];

  // Tranquil deep indigo-sumi backdrop with gentle ink breath
  s.paperMix = 0.0;
  s.colorA = activeVial.hex;
  s.colorB = nextVial.hex;
  s.backdropEnergy = 0.18 + smoothAudio.rms * 0.25;
  s.doodleOpacity = 0.72;
  s.doodleTurbulence = 0.05;

  // Ink!Sans closer portrait framing, thoughtfully inspecting his vials before dipping Broomie
  const windUp = smoothstep(0.86, 1.0, progress);
  s.inkOpacity = 1;
  s.inkX = 50;
  s.inkY = lerp(42, 40, push);
  s.inkScale = lerp(0.88, 1.04, push);
  s.inkPose = windUp > 0.2 ? 'brushReady' : 'vialInspect';

  // Eyes playfully shift with each vial he contemplates!
  const eyeCycle = ['classic', 'excited', 'heart', 'starBurst', 'classic', 'purple', 'target', 'starBurst'] as const;
  s.inkEye = eyeCycle[activeVialIdx];
  s.brushPaintColor = progress > 0.72 ? '#2B6BFF' : activeVial.hex;
  s.brushAngleOffset = lerp(0, -42, windUp);
  s.headTilt = lerp(-6, 8, Math.sin(progress * Math.PI)) * (1 - windUp);
  s.rimColor = activeVial.hex;
  s.rimIntensity = 0.42;

  // Gentle thoughtful blink midway through Act III
  s.blink = lf >= 245 && lf <= 261 ? Math.sin(((lf - 245) / 16) * Math.PI) : 0;

  // Slow, hypnotic twin calligraphy ink ribbons coiling behind Ink
  const coilP = easeOutCubic(clamp(lf / 240, 0, 1));
  const coilTail = smoothstep(duration - 90, duration, lf) * 0.7;
  s.ribbons.push({
    id: 'act3_coil_a',
    points: [
      [-9.0, 2.8, -3.0],
      [-3.5, -1.8, -2.0],
      [3.5, 2.2, -1.6],
      [9.0, -2.2, -2.8],
    ],
    width: 0.95,
    progress: coilP,
    tail: coilTail,
    inkColor: '#0E0F18',
    tipColor: activeVial.hex,
    opacity: 0.76,
  });

  // ── Signature Graphic Centerpiece: Macro 8-Vial Showcase along lower frame! ──
  const macroIn = smoothstep(18, 68, lf);
  const macroOut = 1 - smoothstep(duration - 42, duration - 6, lf);
  s.vialMacro = {
    opacity: macroIn * macroOut,
    activeIndex: activeVialIdx,
    levels: [1, 1, 1, 1, 1, 1, 1, 1],
    shatter: 0,
  };

  // No battle box or HUD during this quiet poetic pause
  s.boxOpacity = 0;
  s.soulOpacity = 0;
  s.hudOpacity = 0;
  s.letterboxPx = lerp(56, 72, Math.sin(progress * Math.PI));

  return s;
}
