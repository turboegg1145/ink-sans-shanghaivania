import { ActContext, createDefaultSceneState, SceneFrameState } from '../core/sceneState';
import { DanmakuOrb } from '../assets/BoneAndDanmaku3D';
import { clamp, easeInOutQuart, easeOutBack, easeOutCubic, easeOutExpo, lerp, smoothstep } from '../core/math';
import { INK_VIALS } from '../core/palette';
import { BAR_FRAMES, impactRecoil, LANDMARKS } from '../core/timeline';

/**
 * ACT IX · 终焉破晓 (3:02.1 – 3:44.7 | frames 10928 – 13484 | Grand Full-Spectrum Finale & Quiet Ring-Out)
 *
 * - Frame 10928 (REIGNITION): 3-frame sakuga impact inversion + blinding white flash + all 8 vials refill in a
 *   nuclear prismatic burst! Full aurora-spectrum GLSL shader (`spectrum = 1.0`) ignites!
 * - 10928 – 12141 (16 bars): Full-Spectrum Overdrive — Rainbow SOUL weaving through prismatic bone cathedrals,
 *   4 swirling rainbow calligraphy ribbons, and rotating 6-Blaster Prismatic Star Array!
 * - 12141 – 13203 (14 bars, PEAK AT 12141!): SHANGHAIVANIA TRANSCENDENT FINALE!
 *   Grand orbital panorama unveiling an 8-Blaster 360° Cathedral Dome + blazing 48-petal Touhou prism mandala!
 * - Frame 13203 – 13484 (220.05s FINAL CYMBAL CUT & RING-OUT):
 *   One decisive diagonal final brush-slash + pure white flash -> resolves full-circle back to warm peaceful
 *   Xuan paper, drifting sketchbook pages, calm Ink!Sans resting Broomie, final SHANGHAIVANIA signature -> fade out!
 */
export function evaluateAct9(ctx: ActContext): SceneFrameState {
  const s = createDefaultSceneState();
  const { frame, localFrame: lf, time, beatPulse, smoothAudio } = ctx;
  const localBar = lf / BAR_FRAMES;

  const isPeak = frame >= LANDMARKS.ACT9_TRANSCEND && frame < LANDMARKS.ACT9_FINAL_CUT;
  const isOutro = frame >= LANDMARKS.ACT9_FINAL_CUT;

  // ═══════════════════════════════════════════════════════════════════════
  // OUTRO RESOLUTION (frames 13203 – 13484 | 220.05s – 224.73s)
  // Full-circle poetic return to warm Xuan paper stillness!
  // ═══════════════════════════════════════════════════════════════════════
  if (isOutro) {
    const of = frame - LANDMARKS.ACT9_FINAL_CUT; // 0..281
    const outroP = clamp(of / 281, 0, 1);

    // Pure white peak flash on the final cymbal crash (fades cleanly over 46 frames)
    s.whiteFlash = (1 - easeOutCubic(clamp(of / 46, 0, 1))) * 0.98;
    if (of < 18) {
      s.slashProgress = clamp(of / 16, 0, 1);
      s.slashAngleDeg = -14;
      s.slashColor = '#F5D327';
    }

    // Gentle serene camera pull-out on warm Xuan paper
    s.camPos = [0, 0.35, lerp(11.4, 13.4, easeInOutQuart(outroP))];
    s.camLookAt = [0, 0.05, 0];
    s.paperMix = 1.0;
    s.monochrome = 0.0;
    s.inkBloom = lerp(0.54, 0.42, outroP);
    s.bloomCenter = [0.5, 0.52];
    s.colorA = '#1AD1E8';
    s.colorB = '#F5D327';
    s.backdropEnergy = 0.12;
    s.doodleOpacity = 0.85;
    s.doodleTurbulence = 0.03;

    // Calm resting Ink!Sans smiling warmly with all 8 vials restored
    s.inkOpacity = 1;
    s.inkX = 50;
    s.inkY = 44;
    s.inkScale = 0.96;
    s.inkPose = 'idle';
    s.inkEye = 'classic';
    s.brushPaintColor = '#1AD1E8';
    s.vialLevels = [1, 1, 1, 1, 1, 1, 1, 1];
    s.rimColor = '#F5D327';
    s.rimIntensity = 0.32;
    s.blink = of >= 135 && of <= 152 ? Math.sin(((of - 135) / 17) * Math.PI) : 0;

    // One graceful closing calligraphy stroke resting behind Ink
    s.ribbons.push({
      id: 'act9_outro_stroke',
      points: [
        [-8.8, -2.0, -2.2],
        [-2.8, 1.9, -1.3],
        [3.2, 1.2, -1.1],
        [8.8, -1.5, -2.0],
      ],
      width: 0.95,
      progress: 0.96,
      tail: 0.04,
      inkColor: '#0E0F16',
      tipColor: '#F5D327',
      opacity: 0.85,
    });

    // Final quiet editorial title & graceful fade to black
    s.titleOpacity = smoothstep(32, 85, of) * (1 - smoothstep(210, 265, of));
    s.titleText = 'SHANGHAIVANIA';
    s.titleTrackingEm = lerp(0.24, 0.34, outroP);
    s.titleYPercent = 83;
    s.titleColor = '#FAF7F0';

    s.boxOpacity = 0;
    s.soulOpacity = 0;
    s.hudOpacity = 0;
    s.letterboxPx = lerp(56, 86, smoothstep(20, 120, of));
    s.fadeBlack = smoothstep(225, 280, of);
    return s;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTIVE FINALE (10928 – 13203): REIGNITION -> TRANSCENDENT PEAK
  // ═══════════════════════════════════════════════════════════════════════
  const reigniteRec = impactRecoil(frame, LANDMARKS.ACT9_REIGNITION, 18);
  const peakRec = impactRecoil(frame, LANDMARKS.ACT9_TRANSCEND, 18);
  const impulse = reigniteRec * 0.72 + peakRec * 0.68;

  // Grand sweeping orbital panorama (pulls wider at 12141 to unveil the full 8-Blaster Cathedral Dome!)
  const orbitR = isPeak ? 2.85 : 1.75;
  const orbitAngle = time * (isPeak ? 0.56 : 0.42);
  const baseZ = isPeak ? 12.6 : 11.4;
  s.camPos = [
    Math.sin(orbitAngle) * orbitR,
    (isPeak ? 1.15 : 0.55) + Math.cos(orbitAngle * 0.7) * 0.35 + impulse * 0.25,
    baseZ - impulse * 0.9,
  ];
  s.camLookAt = [0, -0.45, 0];
  s.camRoll = Math.sin(orbitAngle) * 0.036;

  // Full iridescent Aurora-Prism GLSL ink wash!
  s.paperMix = 0;
  s.monochrome = 0;
  s.spectrum = isPeak ? 1.0 : smoothstep(0, 36, lf) * 0.85;
  s.colorA = '#1AD1E8';
  s.colorB = '#F5D327';
  s.backdropEnergy = 0.78 + smoothAudio.rms * 0.22;
  s.doodleOpacity = 0.92;
  s.doodleTurbulence = isPeak ? 0.92 : 0.58;

  // Reignition (10928) & Transcendent Peak (12141) sakuga impact flashes & splashes!
  if (lf < 3) s.impactFlash = 1.0;
  else if (lf < 14) s.whiteFlash = (1 - (lf - 3) / 11) * 0.92;
  if (frame >= LANDMARKS.ACT9_TRANSCEND && frame < LANDMARKS.ACT9_TRANSCEND + 3) s.impactFlash = 1.0;
  else if (frame >= LANDMARKS.ACT9_TRANSCEND + 3 && frame < LANDMARKS.ACT9_TRANSCEND + 12) {
    s.whiteFlash = (1 - (frame - LANDMARKS.ACT9_TRANSCEND - 3) / 9) * 0.75;
  }

  if (lf < 28) {
    s.slashProgress = lf / 28;
    s.slashAngleDeg = -18;
    s.slashColor = '#1AD1E8';
    s.splashes.push({
      id: 'act9_reignite_splash',
      progress: clamp(lf / 48, 0, 1),
      cx: 960,
      cy: 480,
      color: '#1AD1E8',
      secondaryColor: '#F5D327',
      seed: 909,
      scale: 1.75,
    });
  } else if (frame >= LANDMARKS.ACT9_TRANSCEND && frame < LANDMARKS.ACT9_TRANSCEND + 48) {
    s.slashProgress = clamp((frame - LANDMARKS.ACT9_TRANSCEND) / 26, 0, 1);
    s.slashAngleDeg = 16;
    s.slashColor = '#F047A8';
    s.splashes.push({
      id: 'act9_peak_splash',
      progress: (frame - LANDMARKS.ACT9_TRANSCEND) / 48,
      cx: 960,
      cy: 520,
      color: '#F047A8',
      secondaryColor: '#1AD1E8',
      seed: 999,
      scale: 1.8,
    });
  }

  // Ascended Prismatic Ink!Sans conducting the entire Doodle Sphere!
  s.inkOpacity = 1;
  s.inkX = 50 + Math.sin(time * 1.0) * 2.2;
  s.inkY = isPeak ? 25.5 : 27.5;
  s.inkScale = isPeak ? 0.64 : 0.69;
  s.inkPose = 'overdriveAscend';
  s.inkEye = 'prismatic';
  s.brushPaintColor = INK_VIALS[Math.floor(localBar) % INK_VIALS.length].hex;
  s.brushAngleOffset = Math.sin(time * 3.0) * 26;
  s.rimColor = s.brushPaintColor;
  s.rimIntensity = 0.78 + beatPulse * 0.22;

  // 3D Battle Box (wide glowing prismatic arena)
  const boxIn = easeOutBack(clamp(lf / 18, 0, 1));
  s.boxOpacity = clamp(lf / 10, 0, 1);
  s.boxPos = [0, -1.52, 0];
  s.boxRot = [isPeak ? -0.22 : -0.14, Math.sin(orbitAngle) * 0.14, Math.cos(orbitAngle) * 0.04];
  s.boxWidth = (isPeak ? 6.4 : 5.8) * boxIn;
  s.boxHeight = (isPeak ? 3.5 : 3.2) * boxIn;
  s.boxBorderColor = '#FFFFFF';
  s.boxOrnament = 1;

  // Rainbow Determination SOUL weaving gracefully through the grand climax!
  const evalFinaleSoul = (tSec: number): [number, number] => [
    Math.sin(tSec * 2.55) * 2.35,
    -1.52 + Math.sin(tSec * 3.85 + 0.5) * 1.15,
  ];
  const [sx, sy] = evalFinaleSoul(time);
  s.soulOpacity = s.boxOpacity;
  s.soulMode = 'rainbow';
  s.soulPos = [sx, sy, 0.32];
  s.soulPulse = beatPulse * 0.8;
  s.soulTrail = [1, 2, 3, 4, 5, 6].map((k) => {
    const [tx, ty] = evalFinaleSoul(time - k * 0.022);
    return [tx, ty, 0.30 - k * 0.01];
  });

  // ── 3D Swirling Rainbow Calligraphy Ribbon Vortex! ──
  [0, 1, 2].forEach((idx) => {
    const rt = ((time * 0.36 + idx / 3) % 1);
    const vialCol = INK_VIALS[(idx * 3 + Math.floor(localBar)) % INK_VIALS.length].hex;
    const yOff = (idx - 1) * 2.1;
    s.ribbons.push({
      id: `act9_rib_${idx}`,
      points: [
        [-10.4, -2.5 + yOff, -2.8],
        [-3.6, 2.2 - yOff * 0.4, -1.8],
        [3.6, -1.4 + yOff * 0.4, -1.6],
        [10.4, 2.5 - yOff, -2.8],
      ],
      width: isPeak ? 1.65 : 1.35,
      progress: easeOutExpo(clamp(rt * 1.35, 0, 1)),
      tail: smoothstep(0.45, 1.0, rt) * 0.92,
      inkColor: '#0E101A',
      tipColor: vialCol,
      opacity: 0.88,
    });
  });

  // ── Prismatic Bone Cathedral Pillars (10928–12141) ──
  let minDist = 99;
  if (!isPeak) {
    for (let i = 0; i < 8; i++) {
      const u = ((time * 0.82 + i / 8) % 1);
      const bx = lerp(-2.8, 2.8, u);
      const isTop = i % 2 === 0;
      const len = 1.0 + 0.45 * Math.sin(time * 3.1 + i);
      const by = isTop ? 0.02 - len * 0.5 : -3.05 + len * 0.5;
      const fade = smoothstep(0, 0.1, u) * (1 - smoothstep(0.9, 1, u));
      s.bones.push({
        id: `a9_bone_${i}`,
        position: [bx, by, 0.14],
        length: len,
        thickness: 0.9,
        kind: i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'orange' : 'white',
        opacity: fade,
      });
      const d = Math.hypot(bx - sx, by - sy);
      if (d < minDist) minDist = d;
    }
  }

  // ── GRAND TOUHOU PRISMATIC MANDALA DANMAKU ──
  const orbs: DanmakuOrb[] = [];
  const ringCount = isPeak ? 3 : 2;
  const perRing = isPeak ? 16 : 14;
  for (let ring = 0; ring < ringCount; ring++) {
    const u = ((time * (isPeak ? 0.54 : 0.44) + ring / ringCount) % 1);
    const rBase = 0.45 + u * (isPeak ? 4.8 : 4.0);
    const alpha = smoothstep(0, 0.1, u) * (1 - smoothstep(0.84, 1, u));
    const rot = time * (ring % 2 === 0 ? 0.85 : -0.75);
    for (let i = 0; i < perRing; i++) {
      const theta = (i / perRing) * Math.PI * 2 + rot;
      const mod = 1 + 0.25 * Math.cos((isPeak ? 6 : 5) * (theta - rot));
      const px = Math.cos(theta) * rBase * mod;
      const py = -1.52 + Math.sin(theta) * rBase * mod * 0.66;
      orbs.push({
        position: [px, py, 0.24],
        rotation: [0, 0, theta - Math.PI / 2],
        scale: isPeak ? 1.06 : 0.94,
        color: INK_VIALS[(i + ring * 2) % INK_VIALS.length].hex,
        shape: ring === 0 ? 'petal' : ring === 1 ? 'diamond' : 'orb',
        opacity: alpha,
      });
      const d = Math.hypot(px - sx, py - sy);
      if (d < minDist) minDist = d;
    }
  }
  s.danmaku = orbs;

  // ── 6-BLASTER STAR ARRAY -> 8-BLASTER 360° CATHEDRAL DOME AT 12141 PEAK! ──
  const blasterCount = isPeak ? 8 : 6;
  const domeRadiusX = isPeak ? 6.45 : 5.75;
  const domeRadiusY = isPeak ? 3.85 : 3.45;
  const domeRot = time * (isPeak ? 0.32 : 0.22);
  const volleyCycle = (localBar * (isPeak ? 1.0 : 0.75)) % 1;

  for (let k = 0; k < blasterCount; k++) {
    const theta = domeRot + (k / blasterCount) * Math.PI * 2;
    const rx = Math.cos(theta) * domeRadiusX;
    const ry = -1.15 + Math.sin(theta) * domeRadiusY;
    const dx = 0 - rx;
    const dy = -1.52 - ry;
    const aimZ = Math.atan2(dx, -dy);

    // Alternating even/odd synchronized cathedral volleys (final 2 bars ALL 8 FIRE TOGETHER!)
    const allFire = frame >= 13040;
    const groupOffset = allFire ? 0 : (k % 2) * 0.5;
    const p = (volleyCycle + groupOffset) % 1;
    const charge = allFire ? clamp((frame - 13040) / 36, 0, 1) : clamp(p / 0.4, 0, 1);
    const beam = allFire
      ? frame >= 13076
        ? easeOutCubic(clamp((frame - 13076) / 6, 0, 1))
        : 0
      : p >= 0.42
        ? (1 - smoothstep(0.66, 0.94, p)) * easeOutCubic(clamp((p - 0.42) / 0.08, 0, 1))
        : 0;

    const cA = INK_VIALS[k % INK_VIALS.length].hex;
    const cB = INK_VIALS[(k + 3) % INK_VIALS.length].hex;

    s.blasters.push({
      id: `a9_dome_${k}`,
      position: [rx, ry, 0.2],
      rotation: [0.04, rx < 0 ? 0.14 : -0.14, aimZ],
      scale: isPeak ? 0.74 : 0.70,
      charge,
      beam,
      beamLength: 16,
      beamRadius: allFire ? 0.40 : 0.32,
      leftEyeColor: cA,
      rightEyeColor: cB,
      beamColorA: cA,
      beamColorB: cB,
    });
  }

  // ── GRAND FINALE SPECTACLE LAYERS (MANDALA + PINWHEELS + Z-TUNNEL + SAKUGA CUT-INS) ──
  // Colossal spinning Golden/Cyan Enso Mandala framing the entire Cathedral Dome!
  s.mandalas.push({
    id: 'a9_cathedral_mandala',
    position: [0, -1.15, -2.4],
    rotation: [isPeak ? -0.2 : -0.1, 0, 0],
    scale: isPeak ? 1.72 : 1.32,
    colorA: '#1AD1E8',
    colorB: '#F5D327',
    opacity: isPeak ? 0.92 : 0.68,
    pulse: beatPulse,
  });

  // Flanking Prismatic Bone Pinwheels (bars 8..16 before the 12141 peak)
  if (!isPeak && localBar >= 8) {
    const wA = smoothstep(8, 8.6, localBar);
    s.boneWheels.push(
      {
        id: 'a9_wheel_l',
        position: [-4.8, -1.5, -0.25],
        radius: 1.45,
        spokes: 8,
        boneLength: 1.08,
        rotationZ: time * 2.6,
        kind: 'cyan',
        altKind: 'orange',
        opacity: wA,
      },
      {
        id: 'a9_wheel_r',
        position: [4.8, -1.5, -0.25],
        radius: 1.45,
        spokes: 8,
        boneLength: 1.08,
        rotationZ: -time * 2.6,
        kind: 'orange',
        altKind: 'cyan',
        opacity: wA,
      }
    );
  }

  // Z-Depth Prismatic Bone Tunnel surging forward during the 12141..13040 Transcendent Climax!
  if (isPeak && frame < 13060) {
    s.boneTunnel = {
      id: 'a9_prism_tunnel',
      time,
      speed: 1.08,
      gateCount: 7,
      radius: 2.75,
      center: [0, -1.52],
      kindA: 'cyan',
      kindB: 'orange',
      opacity: smoothstep(12141, 12195, frame) * (1 - smoothstep(12990, 13060, frame)) * 0.78,
    };
  }

  // Sakuga Prismatic Eye Cut-Ins right at 10938 (Reignition!) and 12141 (Transcendent Peak!)
  if (frame >= LANDMARKS.ACT9_REIGNITION + 8 && frame <= LANDMARKS.ACT9_REIGNITION + 48) {
    s.cutIn = {
      progress: (frame - (LANDMARKS.ACT9_REIGNITION + 8)) / 40,
      eyeStyle: 'prismatic',
      accentColor: '#1AD1E8',
      secondaryColor: '#F5D327',
      angleDeg: -8,
    };
  } else if (frame >= LANDMARKS.ACT9_TRANSCEND + 4 && frame <= LANDMARKS.ACT9_TRANSCEND + 44) {
    s.cutIn = {
      progress: (frame - (LANDMARKS.ACT9_TRANSCEND + 4)) / 40,
      eyeStyle: 'prismatic',
      accentColor: '#F047A8',
      secondaryColor: '#1AD1E8',
      angleDeg: 8,
      flip: true,
    };
  }

  s.soulGraze = clamp(1 - (minDist - 0.35) / 0.75, 0, 1.0);
  s.hudOpacity = smoothstep(8, 28, lf);
  // Determination holds at 1 HP in the transcendent finale (classic Undertale emotional payoff!)
  s.hudHp = isPeak ? 1 : Math.round(lerp(18, 1, clamp(localBar / 16, 0, 1)));
  s.hudKr = isPeak ? 0 : 4;

  return s;
}
