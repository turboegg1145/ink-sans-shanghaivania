import { ActContext, createDefaultSceneState, SceneFrameState } from '../core/sceneState';
import { DanmakuOrb } from '../assets/BoneAndDanmaku3D';
import { clamp, easeOutBack, easeOutCubic, lerp, smoothstep } from '../core/math';
import { INK_VIALS } from '../core/palette';
import { BAR_FRAMES, impactRecoil, LANDMARKS } from '../core/timeline';

/**
 * ACT VII · 多元画卷狂潮 (1:51.4 – 2:41.9 | frames 6684 – 9714 | 40 bars Multiverse Storm)
 *
 * 4 Distinct Escalating Sub-Movements:
 * - 7A (6684–7440): Purple SOUL trapped gliding on 3 glowing Muffet-style magenta silk rails + cross Blasters
 * - 7B (7440–8055): Yellow SOUL flips upright firing luminous golden counter-shots shattering incoming waves
 * - 7C (8055–8890): HEAVY GROOVE SHIFT at 8055 -> PHASE 3 CRIMSON AWAKENING! Ink's brow plunges into shadow
 *                   with piercing crimson slits + Twin-Flank 6-Blaster Phalanx cascading laser walls!
 * - 7D (8890–9714): Doodle Sphere Multiverse Collapse — whirling AU pages, glitchX eyes, dense chromatic
 *                   danmaku crescendo shattering abruptly into the 9714 silence!
 */
export function evaluateAct7(ctx: ActContext): SceneFrameState {
  const s = createDefaultSceneState();
  const { frame, localFrame: lf, time, beatPulse, smoothAudio } = ctx;
  const localBar = lf / BAR_FRAMES; // [0..40]

  const is7A = frame < 7440;
  const is7B = frame >= 7440 && frame < LANDMARKS.ACT7_GROOVE_SHIFT;
  const is7C = frame >= LANDMARKS.ACT7_GROOVE_SHIFT && frame < 8890;
  const is7D = frame >= 8890;

  // Clean decisive recoils strictly on Act VII return, Phase 3 shift (8055), and 8890 surge
  const dropRec = impactRecoil(frame, 6684, 14);
  const p3Rec = impactRecoil(frame, LANDMARKS.ACT7_GROOVE_SHIFT, 16);
  const stormRec = impactRecoil(frame, 8890, 14);
  const impulse = dropRec * 0.55 + p3Rec * 0.65 + stormRec * 0.45;

  // Smooth sweeping director camera (crane arcs & dynamic fov push during Phase 3!)
  const swayX = Math.sin(time * (is7D ? 0.8 : 0.5)) * (is7C || is7D ? 2.1 : 1.3);
  s.camPos = [
    swayX,
    (is7C ? 0.55 : 0.35) + impulse * 0.24,
    (is7C ? 10.9 : 11.5) - impulse * 0.8,
  ];
  s.camLookAt = [0, -0.4, 0];
  s.camRoll = swayX * 0.015;

  // Palette escalates from Violet -> Solar Yellow/Red -> Phase 3 Volcanic Crimson -> Glitch Chromatic
  if (is7A) {
    s.colorA = '#9B4DFF';
    s.colorB = '#F047A8';
  } else if (is7B) {
    s.colorA = '#F5D327';
    s.colorB = '#FF8C1A';
  } else if (is7C) {
    s.colorA = '#E62E4D';
    s.colorB = '#F5821F';
  } else {
    s.colorA = '#FF2A4D';
    s.colorB = '#1AD1E8';
  }
  s.backdropEnergy = 0.65 + smoothAudio.rms * 0.35;
  s.doodleOpacity = 0.85;
  s.doodleTurbulence = is7D ? 0.95 : is7C ? 0.62 : 0.38;

  // Opening Act VII drop impact + Phase 3 Awakening impact at 8055!
  if (lf < 3) s.impactFlash = 1.0;
  else if (frame >= LANDMARKS.ACT7_GROOVE_SHIFT && frame < LANDMARKS.ACT7_GROOVE_SHIFT + 3) s.impactFlash = 1.0;
  else if (frame >= 8890 && frame < 8892) s.impactFlash = 0.85;

  if (lf < 24) {
    s.slashProgress = lf / 24;
    s.slashAngleDeg = 18;
    s.slashColor = '#9B4DFF';
  } else if (frame >= LANDMARKS.ACT7_GROOVE_SHIFT && frame < LANDMARKS.ACT7_GROOVE_SHIFT + 26) {
    s.slashProgress = (frame - LANDMARKS.ACT7_GROOVE_SHIFT) / 26;
    s.slashAngleDeg = -20;
    s.slashColor = '#E62E4D';
  }

  if (frame >= LANDMARKS.ACT7_GROOVE_SHIFT && frame < LANDMARKS.ACT7_GROOVE_SHIFT + 46) {
    s.splashes.push({
      id: 'act7_p3_splash',
      progress: (frame - LANDMARKS.ACT7_GROOVE_SHIFT) / 46,
      cx: 960,
      cy: 390,
      color: '#E62E4D',
      secondaryColor: '#0E0F15',
      seed: 707,
      scale: 1.55,
    });
  }

  // Ink!Sans Presence — transforms dramatically into Phase 3 Crimson Shadow at 8055!
  s.inkOpacity = 1;
  s.inkX = 50 + Math.sin(time * 1.15) * 2.0;
  s.inkY = 28.5 + Math.sin(time * 2.3) * 0.8;
  s.inkScale = is7C ? 0.76 : 0.70;
  s.inkPose = is7D ? 'overdriveAscend' : is7C ? 'conductorCast' : is7B ? 'brushReady' : 'conductorCast';
  s.inkEye = is7A ? 'purple' : is7B ? 'target' : is7C ? 'phase3' : Math.floor(localBar * 2) % 2 === 0 ? 'glitchX' : 'phase3';
  s.brushPaintColor = s.colorA;
  s.brushAngleOffset = Math.sin(time * 2.8) * 22;
  s.rimColor = s.colorA;
  s.rimIntensity = is7C || is7D ? 0.72 : 0.48;

  // 3D Battle Box
  const boxIn = easeOutBack(clamp(lf / 18, 0, 1));
  const endFade = 1 - smoothstep(9682, 9714, frame);
  s.boxOpacity = clamp(lf / 10, 0, 1) * endFade;
  s.boxPos = [0, -1.55, 0];
  s.boxRot = [-0.14, swayX * 0.06, Math.sin(time * 0.6) * 0.035];
  s.boxWidth = (is7C || is7D ? 5.8 : 5.4) * boxIn;
  s.boxHeight = 3.05 * boxIn;
  s.boxBorderColor = is7A ? '#C48CFF' : is7B ? '#FFE629' : is7C ? '#FF4D6D' : '#FAF7F0';
  s.boxOrnament = 1;

  // ── SOUL Mechanics tailored per Sub-Movement! ──
  const evalSoul = (tSec: number): [number, number] => {
    if (is7A) {
      // Purple SOUL snapped cleanly onto 3 discrete silk rails (-2.35, -1.55, -0.75) with crisp lane hops!
      const laneIdx = Math.floor((Math.sin(tSec * 2.2) + 1) * 1.49);
      const railY = [-2.32, -1.55, -0.78][clamp(laneIdx, 0, 2)];
      return [Math.sin(tSec * 2.6) * 2.0, railY];
    }
    if (is7B) {
      // Yellow Shooter SOUL strafing horizontally along lower arena while firing upward bolts!
      return [Math.sin(tSec * 2.4) * 2.1, -2.35 + Math.cos(tSec * 3.2) * 0.25];
    }
    // 7C & 7D: Agile Red/Rainbow SOUL weaving through Phase 3 laser walls & multiverse storm
    return [Math.sin(tSec * 2.8) * 2.25, -1.55 + Math.cos(tSec * 3.7) * 1.05];
  };
  const [sx, sy] = evalSoul(time);
  s.soulOpacity = s.boxOpacity;
  s.soulMode = is7A ? 'purple' : is7B ? 'yellow' : is7C ? 'red' : 'rainbow';
  s.soulPos = [sx, sy, 0.3];
  s.soulPulse = beatPulse * 0.72;
  s.soulTrail = [1, 2, 3, 4].map((k) => {
    const [tx, ty] = evalSoul(time - k * 0.025);
    return [tx, ty, 0.28 - k * 0.01];
  });

  // ── Sub-Movement Combat Patterns ──
  const orbs: DanmakuOrb[] = [];
  let minDist = 99;

  if (is7A) {
    // Render 3 horizontal glowing purple rails as thin prismatic bones + vertical sweeping bones
    [-2.32, -1.55, -0.78].forEach((ry, idx) => {
      s.bones.push({
        id: `a7_rail_${idx}`,
        position: [0, ry, 0.06],
        rotation: [0, 0, Math.PI / 2],
        length: 5.15,
        thickness: 0.22,
        kind: 'prismatic',
        opacity: 0.55 * endFade,
      });
    });
    for (let i = 0; i < 9; i++) {
      const u = ((time * 0.85 + i / 9) % 1);
      const bx = lerp(-2.5, 2.5, u);
      const railY = [-2.32, -1.55, -0.78][i % 3];
      const fade = smoothstep(0, 0.1, u) * (1 - smoothstep(0.9, 1, u));
      orbs.push({
        position: [bx, railY, 0.22],
        rotation: [0, 0, time * 4 + i],
        scale: 1.05,
        color: i % 2 === 0 ? '#F047A8' : '#1AD1E8',
        shape: 'diamond',
        opacity: fade * endFade,
      });
      const d = Math.hypot(bx - sx, railY - sy);
      if (d < minDist) minDist = d;
    }
  } else if (is7B) {
    // Yellow SOUL fires upward rapid golden diamond counter-bolts!
    for (let k = 0; k < 5; k++) {
      const shotU = ((time * 3.8 + k / 5) % 1);
      const shotY = sy + 0.4 + shotU * 3.6;
      const shotX = evalSoul(time - shotU * 0.22)[0];
      orbs.push({
        position: [shotX, shotY, 0.26],
        rotation: [0, 0, 0],
        scale: 0.82,
        color: '#FFE629',
        shape: 'petal',
        opacity: (1 - shotU * 0.85) * endFade,
      });
    }
    // Incoming golden/white descending bone volley
    for (let i = 0; i < 8; i++) {
      const u = ((time * 0.72 + i / 8) % 1);
      const by = lerp(0.1, -2.95, u);
      const bx = Math.sin(i * 1.9 + Math.floor(time * 0.72 + i / 8)) * 2.2;
      const fade = smoothstep(0, 0.12, u) * (1 - smoothstep(0.88, 1, u));
      s.bones.push({
        id: `a7b_bone_${i}`,
        position: [bx, by, 0.14],
        rotation: [0, 0, Math.PI / 2],
        length: 0.95,
        thickness: 0.82,
        kind: i % 3 === 0 ? 'orange' : 'white',
        opacity: fade * endFade,
      });
      const d = Math.hypot(bx - sx, by - sy);
      if (d < minDist) minDist = d;
    }
  } else if (is7C) {
    // PHASE 3: Twin-Flank 6-Blaster Phalanx firing cascading horizontal crimson/gold laser walls!
    const cycle = (localBar * 1.0) % 1;
    for (let row = 0; row < 3; row++) {
      const yPos = -0.35 - row * 1.2;
      const rowPhase = (cycle + row * 0.33) % 1;
      const charge = clamp(rowPhase / 0.38, 0, 1);
      const beam =
        rowPhase >= 0.40
          ? (1 - smoothstep(0.65, 0.94, rowPhase)) * easeOutCubic(clamp((rowPhase - 0.40) / 0.08, 0, 1))
          : 0;
      const side = row % 2 === 0 ? -1 : 1;
      s.blasters.push({
        id: `a7c_gb_${row}`,
        position: [side * 5.65, yPos, 0.25],
        rotation: [0.04, -side * 0.15, -side * (Math.PI / 2)],
        scale: 0.78 * endFade,
        charge,
        beam,
        beamLength: 16,
        beamRadius: 0.36,
        leftEyeColor: '#FF2244',
        rightEyeColor: '#F5821F',
        beamColorA: '#E62E4D',
        beamColorB: '#F5D327',
      });
    }
    // Cross-diagonal bone barrage
    for (let i = 0; i < 6; i++) {
      const u = ((time * 0.95 + i / 6) % 1);
      const bx = lerp(-2.7, 2.7, u);
      const by = -1.55 + Math.sin(u * Math.PI * 2 + i) * 1.1;
      const fade = smoothstep(0, 0.12, u) * (1 - smoothstep(0.88, 1, u));
      s.bones.push({
        id: `a7c_b_${i}`,
        position: [bx, by, 0.14],
        rotation: [0, 0, 0.45 * (i % 2 === 0 ? 1 : -1)],
        length: 1.25,
        thickness: 0.85,
        kind: i % 2 === 0 ? 'white' : 'ink',
        opacity: fade * endFade,
      });
      const d = Math.hypot(bx - sx, by - sy);
      if (d < minDist) minDist = d;
    }
  } else {
    // 7D: Multiverse Collapse — dense chromatic spiral + 4 corner Blasters converging toward 9714!
    for (let ring = 0; ring < 2; ring++) {
      const u = ((time * 0.62 + ring * 0.5) % 1);
      const r = 0.4 + u * 4.4;
      const alpha = smoothstep(0, 0.12, u) * (1 - smoothstep(0.84, 1, u)) * endFade;
      for (let i = 0; i < 16; i++) {
        const theta = (i / 16) * Math.PI * 2 + time * (ring === 0 ? 1.15 : -1.0);
        const px = Math.cos(theta) * r;
        const py = -1.55 + Math.sin(theta) * r * 0.68;
        orbs.push({
          position: [px, py, 0.22],
          rotation: [0, 0, theta - Math.PI / 2],
          scale: 0.96,
          color: INK_VIALS[(i + ring * 4) % INK_VIALS.length].hex,
          shape: ring === 0 ? 'petal' : 'diamond',
          opacity: alpha,
        });
        const d = Math.hypot(px - sx, py - sy);
        if (d < minDist) minDist = d;
      }
    }
    const corners: [number, number, number][] = [
      [-5.5, 2.35, 0.72],
      [5.5, 2.35, -0.72],
      [-5.5, -3.2, 2.15],
      [5.5, -3.2, -2.15],
    ];
    const p = (localBar * 1.25) % 1;
    corners.forEach(([cx, cy, aimZ], idx) => {
      const lp = (p + (idx >= 2 ? 0.5 : 0)) % 1;
      const charge = clamp(lp / 0.4, 0, 1);
      const beam =
        lp >= 0.42 ? (1 - smoothstep(0.68, 0.95, lp)) * easeOutCubic(clamp((lp - 0.42) / 0.08, 0, 1)) : 0;
      s.blasters.push({
        id: `a7d_gb_${idx}`,
        position: [cx, cy, 0.22],
        rotation: [0.04, cx < 0 ? 0.14 : -0.14, aimZ],
        scale: 0.75 * endFade,
        charge,
        beam,
        beamLength: 16,
        beamRadius: 0.34,
        leftEyeColor: '#FF2A4D',
        rightEyeColor: '#1AD1E8',
        beamColorA: '#FF2A4D',
        beamColorB: '#1AD1E8',
      });
    });
  }

  s.danmaku = orbs;

  // ── DENSE 8-PHASE MULTIVERSE SET-PIECES ACROSS ALL 40 BARS OF ACT VII! ──
  // 7A2 (7060–7440): Dual Purple/White Bone Pinwheels flanking the Purple Silk Rail Box!
  if (frame >= 7060 && frame < 7440) {
    const wA = smoothstep(7060, 7100, frame) * (1 - smoothstep(7390, 7440, frame));
    s.boneWheels.push(
      {
        id: 'a7_wheel_l',
        position: [-4.7, -1.55, -0.2],
        radius: 1.4,
        spokes: 6,
        boneLength: 1.05,
        rotationZ: time * 2.3,
        kind: 'prismatic',
        altKind: 'white',
        opacity: wA,
      },
      {
        id: 'a7_wheel_r',
        position: [4.7, -1.55, -0.2],
        radius: 1.4,
        spokes: 6,
        boneLength: 1.05,
        rotationZ: -time * 2.3,
        kind: 'cyan',
        altKind: 'prismatic',
        opacity: wA,
      }
    );
  }

  // 7B2 (7740–8055): Z-Depth Golden/White Bone Corridor rushing toward the camera right into Phase 3!
  if (frame >= 7740 && frame < LANDMARKS.ACT7_GROOVE_SHIFT) {
    s.boneTunnel = {
      id: 'a7_golden_tunnel',
      time,
      speed: 0.92,
      gateCount: 7,
      radius: 2.4,
      center: [0, -1.55],
      kindA: 'orange',
      kindB: 'white',
      opacity: smoothstep(7740, 7790, frame) * (1 - smoothstep(8020, 8055, frame)),
    };
  }

  // 7C1 (8055): SAKUGA PHASE 3 CRIMSON EYE CUT-IN!
  if (frame >= LANDMARKS.ACT7_GROOVE_SHIFT && frame <= LANDMARKS.ACT7_GROOVE_SHIFT + 42) {
    s.cutIn = {
      progress: (frame - LANDMARKS.ACT7_GROOVE_SHIFT) / 42,
      eyeStyle: 'phase3',
      accentColor: '#E62E4D',
      secondaryColor: '#F5821F',
      angleDeg: -9,
    };
  }

  // 7C & 7D: Blazing Crimson/Obsidian Sacred Enso Mandala spinning behind Phase 3 Ink!
  if (is7C || is7D) {
    s.mandalas.push({
      id: 'a7_p3_mandala',
      position: [0, -1.2, -2.2],
      rotation: [-0.14, 0, 0],
      scale: is7D ? 1.5 : 1.25,
      colorA: s.colorA,
      colorB: s.colorB,
      opacity: 0.72 * endFade,
      pulse: beatPulse,
    });
  }

  // 7C2 (8470–8890): Phase 3 Battle Box Diagonal Split + Giant X-Slash!
  if (frame >= 8470 && frame < 8890) {
    s.boxSplit = smoothstep(8470, 8492, frame) * (1 - smoothstep(8840, 8885, frame)) * 0.72;
    if (frame >= 8470 && frame < 8496) {
      s.slashProgress = (frame - 8470) / 26;
      s.slashAngleDeg = 24;
      s.slashColor = '#E62E4D';
    }
  }

  // 7D2 (9300–9680): Multiverse Collapse Z-Depth Chromatic Tunnel rushing to the silent cliff!
  if (frame >= 9300 && frame < 9685) {
    s.boneTunnel = {
      id: 'a7_collapse_tunnel',
      time,
      speed: 1.15,
      gateCount: 8,
      radius: 2.55,
      center: [0, -1.55],
      kindA: 'cyan',
      kindB: 'orange',
      opacity: smoothstep(9300, 9345, frame) * endFade * 0.85,
    };
  }

  // Dynamic sweeping twin calligraphy ribbons
  const ribU = (time * 0.38) % 1;
  s.ribbons.push(
    {
      id: 'act7_rib_a',
      points: [
        [-9.8, -2.8, -2.4],
        [-3.2, 2.4, -1.6],
        [3.2, -1.8, -1.5],
        [9.8, 2.6, -2.4],
      ],
      width: 1.55,
      progress: easeOutCubic(clamp(ribU * 1.45, 0, 1)),
      tail: smoothstep(0.5, 1.0, ribU) * 0.92,
      inkColor: '#0D0E15',
      tipColor: s.colorA,
      opacity: 0.88 * endFade,
    },
    {
      id: 'act7_rib_b',
      points: [
        [9.8, 2.8, -2.5],
        [3.4, -2.4, -1.7],
        [-3.4, 1.8, -1.5],
        [-9.8, -2.4, -2.5],
      ],
      width: 1.35,
      progress: easeOutCubic(clamp(((ribU + 0.5) % 1) * 1.45, 0, 1)),
      tail: smoothstep(0.5, 1.0, (ribU + 0.5) % 1) * 0.92,
      inkColor: '#12131C',
      tipColor: s.colorB,
      opacity: 0.8 * endFade,
    }
  );

  // White flash shockwave right at the end of 7D collapsing into Act VIII silence
  if (frame >= 9708) {
    s.whiteFlash = clamp((frame - 9708) / 6, 0, 0.7);
  }

  s.soulGraze = clamp(1 - (minDist - 0.35) / 0.8, 0, 1.0);
  s.hudOpacity = smoothstep(8, 28, lf) * endFade;
  s.hudHp = Math.round(lerp(56, 18, clamp(localBar / 40, 0, 1)));
  s.hudKr = is7C || is7D ? 10 : 6;

  return s;
}
