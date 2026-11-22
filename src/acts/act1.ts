import { ActContext, createDefaultSceneState, SceneFrameState } from '../core/sceneState';
import { clamp, easeInOutQuart, easeOutCubic, easeOutExpo, lerp, smoothstep } from '../core/math';

/**
 * ACT I · 纸境初墨 (0:00.0 – 0:10.3 | frames 0 – 620 | 8 bars quiet music-box overture)
 *
 * Pure Xuan paper stillness -> single falling sumi ink drop -> organic capillary ink bloom ->
 * Ink!Sans emerges from the ink pool -> Broomie paints a single cyan-sumi calligraphy arc ->
 * minimalist Cinzel SHANGHAIVANIA title -> final wind-up anticipation for the Frame 620 drop.
 */
export function evaluateAct1(ctx: ActContext): SceneFrameState {
  const s = createDefaultSceneState();
  const { localFrame: f, time, beatPulse, smoothAudio } = ctx;

  // Smooth cinematic dolly-in (zero shake)
  const dollyT = easeInOutQuart(clamp(f / 580, 0, 1));
  const anticipationZoom = smoothstep(575, 619, f) * 1.1;
  s.camPos = [
    Math.sin(time * 0.28) * 0.45,
    lerp(0.6, 0.25, dollyT),
    lerp(14.2, 11.4, dollyT) - anticipationZoom,
  ];
  s.camLookAt = [0, 0.05, 0];
  s.camFov = 42;

  // Xuan paper canvas + organic sumi ink bloom triggered when droplet hits at frame 108
  s.paperMix = 1.0;
  s.monochrome = 0.0;
  const bloomT = easeOutExpo(clamp((f - 108) / 260, 0, 1));
  s.inkBloom = bloomT * 0.56 + smoothstep(580, 620, f) * 0.28;
  s.bloomCenter = [0.5, 0.52];
  s.colorA = '#1AD1E8';
  s.colorB = '#F5D327';
  s.backdropEnergy = 0.14 + smoothAudio.rms * 0.25;

  // Doodle Sphere pages gently drifting in warm quiet sanctuary
  s.doodleOpacity = smoothstep(10, 90, f) * 0.92;
  s.doodleTurbulence = 0.04;

  // Falling sumi ink drop (frames 32..195, strikes center at ~frame 94-108)
  if (f >= 28 && f <= 215) {
    s.inkDropRipple = {
      progress: clamp((f - 28) / 185, 0, 1),
      cx: 960,
      cy: 510,
      color: '#0D0E14',
    };
  }

  // Ink!Sans materializes gracefully out of the blooming ink pool (frames 138..250)
  const emerge = easeOutCubic(clamp((f - 138) / 100, 0, 1));
  s.inkOpacity = emerge;
  s.inkX = 50;
  s.inkY = lerp(52, 46, emerge);
  s.inkScale = lerp(0.88, 1.02, emerge) + smoothstep(575, 619, f) * 0.07;

  // Anticipation wind-up right before frame 620 drop
  const windUp = smoothstep(568, 619, f);
  s.inkPose = f < 310 ? 'idle' : windUp > 0.15 ? 'brushReady' : 'brushReady';
  s.inkEye = windUp > 0.4 ? 'starBurst' : f > 460 ? 'excited' : 'classic';
  s.brushPaintColor = '#1AD1E8';
  s.brushAngleOffset = lerp(0, -48, windUp);
  s.headTilt = lerp(0, -10, windUp);
  s.rimColor = '#F5D327';
  s.rimIntensity = 0.28 + emerge * 0.2;

  // Single delicate blink around frame 320 for living character soul
  const blinkWave = f >= 312 && f <= 326 ? Math.sin(((f - 312) / 14) * Math.PI) : 0;
  s.blink = blinkWave;

  // Single sweeping 3D calligraphy ribbon painted across the Doodle Sphere (frames 210..560)
  if (f >= 205) {
    const rp = easeOutCubic(clamp((f - 205) / 150, 0, 1));
    const rt = smoothstep(495, 618, f) * 0.65;
    s.ribbons.push({
      id: 'act1_sweep',
      points: [
        [-9.2, -2.6, -2.4],
        [-3.4, 2.7, -1.3],
        [3.4, 1.5, -0.7],
        [9.4, -1.8, -1.9],
      ],
      width: 1.08,
      progress: rp,
      tail: rt,
      inkColor: '#0E0F16',
      tipColor: '#1AD1E8',
      opacity: 0.92,
    });
  }

  // Minimal museum-grade SHANGHAIVANIA main title (frames 270..565, fades cleanly before drop!)
  const titleIn = smoothstep(265, 345, f);
  const titleOut = 1 - smoothstep(515, 575, f);
  s.titleOpacity = titleIn * titleOut;
  s.titleText = 'SHANGHAIVANIA';
  s.titleTrackingEm = lerp(0.18, 0.30, clamp((f - 265) / 310, 0, 1));
  s.titleYPercent = 83;
  s.titleColor = '#FAF7F0';

  // Gentle opening fade from black (frames 0..42)
  s.fadeBlack = 1 - smoothstep(0, 42, f);
  s.letterboxPx = lerp(84, 56, smoothstep(550, 620, f));

  // Subtle beat pulse on SOUL hidden in Act I
  s.soulOpacity = 0;
  s.boxOpacity = 0;
  s.hudOpacity = 0;

  // Keep beatPulse referenced for future micro-details
  void beatPulse;

  return s;
}
