import { ActContext, createDefaultSceneState, SceneFrameState } from '../core/sceneState';
import { DanmakuOrb } from '../assets/BoneAndDanmaku3D';
import { clamp, easeOutCubic, lerp, smoothstep } from '../core/math';
import { INK_VIALS } from '../core/palette';
import { BAR_FRAMES, impactRecoil } from '../core/timeline';

/**
 * ACT V · 东方弹幕花阵 (1:00.8 – 1:41.3 | frames 3652 – 6078 | 32 bars Touhou × Megalovania Showstopper!)
 *
 * 4 Distinct 8-Bar Movements:
 * - 5A (bars 0–8,  peak 4120): Blooming Touhou Rhodonea Rose Petals (r = cos(5θ)) in 8-vial rainbow colors
 * - 5B (bars 8–16, peak 4680): Twin Counter-Rotating Logarithmic Danmaku Spirals + 4 Flanking Blasters
 * - 5C (bars 16–24):           BROOMIE SPLITS THE 3D BATTLE BOX IN HALF! Orange/Cyan dash weave across the split
 * - 5D (bars 24–32, peak 5680): Grand 48-Petal Danmaku Mandala + 6-Blaster Outer Crown driving to the 6078 cliff!
 */
export function evaluateAct5(ctx: ActContext): SceneFrameState {
  const s = createDefaultSceneState();
  const { frame, localFrame: lf, time, beatPulse, smoothAudio } = ctx;
  const localBar = lf / BAR_FRAMES; // [0..32]
  const phase = Math.min(3, Math.floor(localBar / 8)); // 0, 1, 2, 3

  // Exact heavy-hit recoils on phase peaks & the 4864 box-split slash
  const splitFrame = 4864;
  const recA = impactRecoil(frame, 4120, 12);
  const recB = impactRecoil(frame, 4680, 12);
  const recSplit = impactRecoil(frame, splitFrame, 16);
  const recC = impactRecoil(frame, 5680, 14);
  const impulse = recA * 0.35 + recB * 0.35 + recSplit * 0.65 + recC * 0.45;

  // Sweeping Touhou panoramic camera choreography (high-angle perspective tilt!)
  const camOrbitX = Math.sin(time * 0.42) * (phase === 3 ? 2.4 : 1.55);
  const camElevY = phase === 0 ? 1.15 : phase === 1 ? 0.75 : phase === 2 ? 0.35 : 1.35;
  s.camPos = [camOrbitX, camElevY + impulse * 0.24, 11.8 - impulse * 0.75];
  s.camLookAt = [0, -0.55, 0];
  s.camRoll = Math.sin(time * 0.36) * 0.032;

  // Shifting vivid palette across the 4 movements
  const pal: [string, string][] = [
    ['#F047A8', '#1AD1E8'], // Rose Bloom
    ['#1AD1E8', '#F5D327'], // Twin Spirals
    ['#FF8C1A', '#24E5FF'], // Split Box Orange/Cyan
    ['#9B4DFF', '#F5D327'], // Grand Mandala
  ];
  s.colorA = pal[phase][0];
  s.colorB = pal[phase][1];
  s.backdropEnergy = 0.62 + smoothAudio.rms * 0.38;
  s.doodleOpacity = 0.82;
  s.doodleTurbulence = 0.38 + phase * 0.12;

  // Ink!Sans elevated like a Touhou spellcard conductor
  s.inkOpacity = 1;
  s.inkX = 50 + Math.sin(time * 0.85) * 2.2;
  s.inkY = 26.5 + Math.sin(time * 2.0) * 0.9;
  s.inkScale = 0.66;
  const doingSplitSlash = frame >= splitFrame - 6 && frame <= splitFrame + 24;
  s.inkPose = doingSplitSlash ? 'slashSweep' : phase === 3 ? 'overdriveAscend' : 'conductorCast';
  s.inkEye = phase === 0 ? 'heart' : phase === 1 ? 'starBurst' : phase === 2 ? 'excited' : 'prismatic';
  s.brushPaintColor = s.colorA;
  s.brushAngleOffset = doingSplitSlash ? 55 : Math.sin(time * 2.4) * 18;
  s.rimColor = s.colorA;
  s.rimIntensity = 0.55 + beatPulse * 0.25;

  // ── 3D Battle Box (expands into Touhou Spellcard Arena & SPLITS IN HALF during 5C!) ──
  const splitAmt =
    phase === 2
      ? smoothstep(splitFrame, splitFrame + 22, frame) * (1 - smoothstep(5410, 5465, frame)) * 0.88
      : 0;
  s.boxOpacity = 1;
  s.boxPos = [0, -1.48, 0];
  s.boxRot = [
    phase === 0 || phase === 3 ? -0.22 : -0.12,
    camOrbitX * 0.055,
    Math.sin(time * 0.5) * 0.03,
  ];
  s.boxWidth = phase === 0 || phase === 3 ? 6.2 : 5.5;
  s.boxHeight = phase === 0 || phase === 3 ? 3.5 : 3.05;
  s.boxBorderColor = phase === 2 ? '#FF8C1A' : '#FAF7F0';
  s.boxSplit = splitAmt;
  s.boxOrnament = 1;

  // Slash VFX right on frame 4864 box split!
  if (frame >= splitFrame && frame < splitFrame + 2) s.impactFlash = 1.0;
  if (frame >= splitFrame && frame < splitFrame + 26) {
    s.slashProgress = (frame - splitFrame) / 26;
    s.slashAngleDeg = -28;
    s.slashColor = '#FF8C1A';
  }
  if (frame >= splitFrame && frame < splitFrame + 44) {
    s.splashes.push({
      id: 'act5_split_splash',
      progress: (frame - splitFrame) / 44,
      cx: 960,
      cy: 640,
      color: '#FF8C1A',
      secondaryColor: '#24E5FF',
      seed: 505,
      scale: 1.4,
    });
  }

  // ── Silky Touhou Graze SOUL Path ──
  const evalTouhouSoul = (tSec: number): [number, number] => {
    // Graceful Lissajous weave threading directly through rose & spiral gaps
    const wx = Math.sin(tSec * 2.15) * 2.15;
    const wy = -1.48 + Math.sin(tSec * 3.25 + 0.7) * 1.05;
    return [wx, wy];
  };
  const [sx, sy] = evalTouhouSoul(time);
  s.soulOpacity = 1;
  s.soulMode = phase === 2 ? (Math.floor(localBar) % 2 === 0 ? 'orange' : 'cyan') : phase === 3 ? 'rainbow' : 'red';
  s.soulPos = [sx, sy, 0.3];
  s.soulPulse = beatPulse * 0.7;
  s.soulTrail = [1, 2, 3, 4, 5].map((k) => {
    const [tx, ty] = evalTouhouSoul(time - k * 0.024);
    return [tx, ty, 0.28 - k * 0.01];
  });

  // ── TOUHOU GEOMETRIC DANMAKU GENERATOR ──
  const orbs: DanmakuOrb[] = [];
  let minOrbDist = 99;
  const cx = 0;
  const cy = -1.48;

  if (phase === 0) {
    // 5A: 3 Concentric Rhodonea Rose Rings (r = R + A * cos(5θ)) blooming smoothly!
    for (let ring = 0; ring < 3; ring++) {
      const waveT = ((time * 0.36 + ring / 3) % 1);
      const baseR = 0.45 + waveT * 3.7;
      const alpha = smoothstep(0, 0.12, waveT) * (1 - smoothstep(0.82, 1, waveT));
      const count = 20;
      const rot = time * (ring % 2 === 0 ? 0.55 : -0.48) + ring * 0.6;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2 + rot;
        const roseMod = 1 + 0.24 * Math.cos(5 * (theta - rot));
        const r = baseR * roseMod;
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r * 0.64;
        orbs.push({
          position: [px, py, 0.22],
          rotation: [0, 0, theta - Math.PI / 2],
          scale: 0.95 + (ring === 0 ? 0.15 : 0),
          color: INK_VIALS[(i + ring * 2) % INK_VIALS.length].hex,
          shape: ring % 2 === 0 ? 'petal' : 'diamond',
          opacity: alpha,
        });
        const d = Math.hypot(px - sx, py - sy);
        if (d < minOrbDist) minOrbDist = d;
      }
    }
  } else if (phase === 1) {
    // 5B: Twin Counter-Rotating 6-Arm Logarithmic Danmaku Spirals!
    const arms = 6;
    const stepsPerArm = 7;
    for (let dir = -1; dir <= 1; dir += 2) {
      for (let arm = 0; arm < arms; arm++) {
        for (let st = 0; st < stepsPerArm; st++) {
          const u = ((time * 0.52 + st / stepsPerArm) % 1);
          const r = 0.35 + u * 3.85;
          const theta = (arm / arms) * Math.PI * 2 + dir * (time * 1.1 + u * 2.8);
          const px = cx + Math.cos(theta) * r;
          const py = cy + Math.sin(theta) * r * 0.66;
          const alpha = smoothstep(0, 0.1, u) * (1 - smoothstep(0.85, 1, u));
          orbs.push({
            position: [px, py, 0.22],
            rotation: [0, 0, theta - Math.PI / 2],
            scale: 0.88,
            color: dir > 0 ? '#1AD1E8' : '#F047A8',
            shape: dir > 0 ? 'petal' : 'orb',
            opacity: alpha,
          });
          const d = Math.hypot(px - sx, py - sy);
          if (d < minOrbDist) minOrbDist = d;
        }
      }
    }
  } else if (phase === 2) {
    // 5C: Split Box Orange/Cyan Alternating Bone Spears + Crossing Sparks!
    for (let i = 0; i < 10; i++) {
      const u = ((time * 0.95 + i / 10) % 1);
      const fromLeft = i % 2 === 0;
      const bx = lerp(fromLeft ? -3.4 : 3.4, fromLeft ? 3.4 : -3.4, u);
      const by = cy + ((i % 5) - 2) * 0.62;
      const fade = smoothstep(0, 0.12, u) * (1 - smoothstep(0.88, 1, u));
      s.bones.push({
        id: `a5_split_b_${i}`,
        position: [bx, by, 0.14],
        rotation: [0, 0, Math.PI / 2],
        length: 1.35,
        thickness: 0.85,
        kind: fromLeft ? 'orange' : 'cyan',
        opacity: fade,
      });
      const d = Math.hypot(bx - sx, by - sy);
      if (d < minOrbDist) minOrbDist = d;
    }
  } else {
    // 5D: Grand 48-Petal Geometric Starburst Mandala!
    for (let ring = 0; ring < 3; ring++) {
      const u = ((time * 0.44 + ring / 3) % 1);
      const rBase = 0.4 + u * 4.2;
      const alpha = smoothstep(0, 0.1, u) * (1 - smoothstep(0.82, 1, u));
      const count = 16;
      const rot = time * (ring % 2 === 0 ? 0.72 : -0.62);
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2 + rot;
        const star = 1 + 0.28 * Math.abs(Math.cos(4 * (theta - rot)));
        const px = cx + Math.cos(theta) * rBase * star;
        const py = cy + Math.sin(theta) * rBase * star * 0.66;
        orbs.push({
          position: [px, py, 0.22],
          rotation: [0, 0, theta - Math.PI / 2],
          scale: 1.0,
          color: INK_VIALS[(i + ring * 3) % INK_VIALS.length].hex,
          shape: ring === 1 ? 'diamond' : 'petal',
          opacity: alpha,
        });
        const d = Math.hypot(px - sx, py - sy);
        if (d < minOrbDist) minOrbDist = d;
      }
    }
  }
  s.danmaku = orbs;

  // Flanking Blasters punctuating 5B & 5D
  if (phase === 1 || phase === 3) {
    const subBar = (localBar % 2) / 2;
    const count = phase === 3 ? 4 : 2;
    const positions: [number, number, number, number][] =
      count === 2
        ? [
            [-5.6, 2.2, 0.2, 0.72],
            [5.6, 2.2, 0.2, -0.72],
          ]
        : [
            [-5.7, 2.4, 0.2, 0.76],
            [5.7, 2.4, 0.2, -0.76],
            [-5.9, -1.8, 0.2, 1.48],
            [5.9, -1.8, 0.2, -1.48],
          ];
    positions.forEach(([x, y, z, aimZ], idx) => {
      const p = (subBar + (idx >= 2 ? 0.5 : 0)) % 1;
      const charge = clamp(p / 0.42, 0, 1);
      const beam =
        p >= 0.44 ? (1 - smoothstep(0.66, 0.94, p)) * easeOutCubic(clamp((p - 0.44) / 0.08, 0, 1)) : 0;
      s.blasters.push({
        id: `a5_gb_${idx}`,
        position: [x, y, z],
        rotation: [0.04, x < 0 ? 0.14 : -0.14, aimZ],
        scale: 0.76,
        charge,
        beam,
        beamLength: 17,
        beamRadius: 0.36,
        leftEyeColor: s.colorA,
        rightEyeColor: s.colorB,
        beamColorA: s.colorA,
        beamColorB: s.colorB,
      });
    });
  }

  const endFade = 1 - smoothstep(6054, 6078, frame);

  // ── DENSE 4-BAR SET-PIECES ACROSS ALL 32 BARS OF ACT V! ──
  const sub8 = Math.min(7, Math.floor(localBar / 4)); // 0..7 (each = 4 bars = ~5.05s!)

  // Sacred Touhou Spellcard Mandala projected in 3D beneath the Battle Box (peaks in 5A2, 5D1, 5D2!)
  s.mandalas.push({
    id: 'a5_spell_mandala',
    position: [0, -1.5, -1.6],
    rotation: [phase === 0 || phase === 3 ? -0.22 : -0.1, 0, 0],
    scale: sub8 === 1 || sub8 >= 6 ? 1.42 : 1.05,
    colorA: s.colorA,
    colorB: s.colorB,
    opacity: (sub8 === 1 || sub8 >= 6 ? 0.88 : 0.45) * endFade,
    pulse: beatPulse,
  });

  // Sub-movement 3 (bars 12..16): Z-Depth 3D Perspective Bone Corridor rushing toward the viewer!
  if (sub8 === 3) {
    s.boneTunnel = {
      id: 'a5_tunnel',
      time,
      speed: 0.72,
      gateCount: 6,
      radius: 2.35,
      center: [0, -1.48],
      kindA: 'cyan',
      kindB: 'white',
      opacity: smoothstep(12, 12.6, localBar) * (1 - smoothstep(15.5, 16, localBar)),
    };
  }

  // Sub-movement 5 (bars 20..24): Counter-rotating Bone Pinwheels flanking the Split Battle Box!
  if (sub8 === 5) {
    const wA = smoothstep(20, 20.5, localBar) * (1 - smoothstep(23.5, 24, localBar));
    s.boneWheels.push(
      {
        id: 'a5_wheel_l',
        position: [-4.5, -1.45, -0.2],
        radius: 1.5,
        spokes: 8,
        boneLength: 1.1,
        rotationZ: time * 2.4,
        kind: 'orange',
        altKind: 'cyan',
        opacity: wA,
      },
      {
        id: 'a5_wheel_r',
        position: [4.5, -1.45, -0.2],
        radius: 1.5,
        spokes: 8,
        boneLength: 1.1,
        rotationZ: -time * 2.4,
        kind: 'cyan',
        altKind: 'orange',
        opacity: wA,
      }
    );
  }

  // Sakuga Cut-In right before the Grand Mandala Finale at bar 24 (frame 5471)!
  if (frame >= 5462 && frame <= 5502) {
    s.cutIn = {
      progress: (frame - 5462) / 40,
      eyeStyle: 'excited',
      accentColor: '#9B4DFF',
      secondaryColor: '#F5D327',
      angleDeg: 8,
      flip: true,
    };
  }

  // Sweeping twin calligraphy ribbons orbiting the spellcard stage
  const ribT = (time * 0.34) % 1;
  s.ribbons.push(
    {
      id: 'act5_rib_a',
      points: [
        [-9.8, 3.2, -2.8],
        [-3.0, 0.5, -1.8],
        [3.5, -2.4, -1.6],
        [9.8, 2.2, -2.6],
      ],
      width: 1.5,
      progress: easeOutCubic(clamp(ribT * 1.4, 0, 1)),
      tail: smoothstep(0.5, 1.0, ribT) * 0.92,
      inkColor: '#0E0F18',
      tipColor: s.colorA,
      opacity: 0.85 * endFade,
    },
    {
      id: 'act5_rib_b',
      points: [
        [9.8, -2.8, -2.6],
        [3.4, 2.2, -1.7],
        [-3.2, -1.6, -1.5],
        [-9.8, 2.6, -2.5],
      ],
      width: 1.3,
      progress: easeOutCubic(clamp(((ribT + 0.5) % 1) * 1.4, 0, 1)),
      tail: smoothstep(0.5, 1.0, (ribT + 0.5) % 1) * 0.92,
      inkColor: '#12131E',
      tipColor: s.colorB,
      opacity: 0.78 * endFade,
    }
  );

  // Beat peak impact splashes at 4120 & 5680
  if (frame >= 4120 && frame < 4160) {
    s.splashes.push({
      id: 'act5_peakA',
      progress: (frame - 4120) / 40,
      cx: 960,
      cy: 600,
      color: '#F047A8',
      secondaryColor: '#1AD1E8',
      seed: 511,
      scale: 1.4,
    });
  }
  if (frame >= 5680 && frame < 5722) {
    s.splashes.push({
      id: 'act5_peakC',
      progress: (frame - 5680) / 42,
      cx: 960,
      cy: 560,
      color: '#9B4DFF',
      secondaryColor: '#F5D327',
      seed: 577,
      scale: 1.6,
    });
  }

  s.boxOpacity *= endFade;
  s.soulOpacity *= endFade;
  s.soulGraze = clamp(1 - (minOrbDist - 0.35) / 0.75, 0, 1.0);

  s.hudOpacity = endFade;
  s.hudHp = Math.round(lerp(72, 56, clamp(localBar / 32, 0, 1)));
  s.hudKr = 8;

  return s;
}
