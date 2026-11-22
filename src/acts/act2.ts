import { ActContext, createDefaultSceneState, SceneFrameState } from '../core/sceneState';
import {
  catmullRom2D,
  clamp,
  easeOutBack,
  easeOutCubic,
  lerp,
  smoothstep,
} from '../core/math';
import { BAR_FRAMES, impactRecoil } from '../core/timeline';

/**
 * ACT II · 首笔破界 (0:10.3 – 0:30.6 | frames 620 – 1836 | 16 bars explosive opening clash)
 *
 * Frame 620: Broomie shatters the Xuan paper into deep iridescent Sumi Void, tears open the 3D Battle Box.
 * Bars 1–4: Crisp Red SOUL figure-8 weaving through alternating white & cyan bone waves + dual brush ribbons.
 * Bars 5–8: Twin sculpted 3D Gaster Blasters materialize & fire crisscrossing diagonal plasma beams.
 * Bars 9–12: 3D crane orbit + 4-Blaster Cardinal Cross volleys while SOUL threads exact safe quadrants.
 * Bars 13–16: Escalating brush-slash combo + converging bone walls leading into the 1836 sudden silence.
 */
export function evaluateAct2(ctx: ActContext): SceneFrameState {
  const s = createDefaultSceneState();
  const { frame, localFrame: lf, time, beatPulse, smoothAudio } = ctx;

  // Exact local bar index [0..16]
  const localBar = lf / BAR_FRAMES;

  // ── Deliberate Heavy-Impact Recoils ONLY on real blows (NO constant jitter!) ──
  const dropRecoil = impactRecoil(frame, 620, 14);
  const b1Fire = impactRecoil(frame, 998, 12);
  const b2Fire = impactRecoil(frame, 1149, 12);
  const cross1Fire = impactRecoil(frame, 1301, 12);
  const cross2Fire = impactRecoil(frame, 1453, 12);
  const slashRec = impactRecoil(frame, 1604, 10) + impactRecoil(frame, 1756, 10);
  const totalImpulse = dropRecoil * 0.55 + (b1Fire + b2Fire + cross1Fire + cross2Fire) * 0.32 + slashRec * 0.22;

  // ── Smooth Cinema Camera Choreography ──
  const orbitPhase = smoothstep(8, 12, localBar) * Math.sin((localBar - 8) * 0.78) * 1.85;
  s.camPos = [
    orbitPhase + Math.sin(time * 0.55) * 0.4,
    0.35 + Math.cos(time * 0.45) * 0.18 + totalImpulse * 0.22,
    11.4 - dropRecoil * 0.9 - smoothstep(13, 15.6, localBar) * 0.85,
  ];
  s.camLookAt = [0, -0.32, 0];
  s.camRoll = orbitPhase * 0.018;

  // ── Deep Iridescent Sumi Void Backdrop (shatters out of Xuan paper in first 12 frames!) ──
  s.paperMix = 1 - smoothstep(0, 10, lf);
  s.colorA = localBar < 8 ? '#1AD1E8' : '#9B4DFF';
  s.colorB = localBar < 8 ? '#F5D327' : '#F047A8';
  s.backdropEnergy = 0.45 + smoothAudio.rms * 0.45;
  s.doodleOpacity = 0.78;
  s.doodleTurbulence = 0.26 + smoothAudio.bass * 0.18;

  // ── Frame 620 Impact Flash, Slash & Splash Burst ──
  if (lf < 3) s.impactFlash = 1.0;
  else if (lf < 6) s.whiteFlash = (6 - lf) / 5;
  if (lf < 26) {
    s.slashProgress = clamp(lf / 22, 0, 1);
    s.slashAngleDeg = -18;
    s.slashColor = '#1AD1E8';
  }
  if (lf < 46) {
    s.splashes.push({
      id: 'act2_drop_burst',
      progress: clamp(lf / 44, 0, 1),
      cx: 960,
      cy: 460,
      color: '#1AD1E8',
      secondaryColor: '#F5D327',
      seed: 202,
      scale: 1.45,
    });
  }

  // ── Ink!Sans Stage Presence & Choreography ──
  s.inkOpacity = 1;
  s.inkX = 50 + Math.sin(time * 1.1) * 1.8;
  s.inkY = 30.5 + Math.sin(time * 2.2) * 0.8;
  s.inkScale = 0.72;
  const isSlashing = (lf >= 0 && lf < 30) || (localBar >= 12.8 && localBar < 13.4) || (localBar >= 14.8 && localBar < 15.5);
  s.inkPose = isSlashing ? 'slashSweep' : localBar >= 4 && localBar < 12 ? 'conductorCast' : 'brushReady';
  s.inkEye = localBar < 4 ? 'starBurst' : localBar < 8 ? 'excited' : localBar < 12 ? 'purple' : 'starBurst';
  s.brushPaintColor = localBar < 8 ? '#1AD1E8' : '#F047A8';
  s.brushAngleOffset = isSlashing ? 38 : Math.sin(localBar * Math.PI) * 14;
  s.rimColor = s.colorA;
  s.rimIntensity = 0.45 + beatPulse * 0.25;

  // ── 3D Battle Box (pops cleanly in with easeOutBack right on drop!) ──
  const boxIn = easeOutBack(clamp(lf / 24, 0, 1));
  s.boxOpacity = clamp(lf / 14, 0, 1);
  s.boxPos = [0, -1.58, 0];
  s.boxRot = [
    -0.1 + Math.sin(time * 0.8) * 0.04,
    orbitPhase * 0.07,
    Math.sin(localBar * 0.6) * 0.025,
  ];
  s.boxWidth = 5.4 * boxIn;
  s.boxHeight = 2.95 * boxIn;
  s.boxBorderColor = '#FAF7F0';
  s.boxOrnament = 1;

  // ── Red SOUL silky Catmull-Rom dodging trajectory + motion trail ──
  const evalSoulXY = (tSec: number): [number, number] => {
    const cycle = ((tSec * 0.42) % 1 + 1) % 1;
    const pts: [number, number][] = [
      [0.0, -1.55],
      [1.45, -1.05],
      [1.75, -2.05],
      [0.15, -2.28],
      [-1.55, -1.95],
      [-1.4, -0.95],
      [0.0, -1.55],
    ];
    return catmullRom2D(pts, cycle);
  };
  const [sx, sy] = evalSoulXY(time);
  s.soulOpacity = s.boxOpacity;
  s.soulMode = 'red';
  s.soulPos = [sx, sy, 0.28];
  s.soulPulse = beatPulse * 0.65;
  s.soulTrail = [1, 2, 3, 4].map((step) => {
    const [tx, ty] = evalSoulXY(time - step * 0.032);
    return [tx, ty, 0.26 - step * 0.01];
  });

  // ── Sweeping 3D Calligraphy Brush Ribbons behind the arena ──
  const ribCycle = (localBar * 0.5) % 1;
  s.ribbons.push({
    id: 'act2_rib_a',
    points: [
      [-9.5, -2.4, -2.4],
      [-3.2, 2.5, -1.5],
      [3.5, 1.4, -1.2],
      [9.5, -1.9, -2.2],
    ],
    width: 1.4,
    progress: easeOutCubic(clamp(ribCycle * 1.45, 0, 1)),
    tail: smoothstep(0.55, 1.0, ribCycle) * 0.92,
    inkColor: '#0E1019',
    tipColor: s.colorA,
    opacity: 0.9,
  });
  s.ribbons.push({
    id: 'act2_rib_b',
    points: [
      [9.4, 3.2, -2.6],
      [2.8, -0.8, -1.6],
      [-3.1, -2.6, -1.3],
      [-9.4, 1.6, -2.4],
    ],
    width: 1.25,
    progress: easeOutCubic(clamp(((ribCycle + 0.5) % 1) * 1.45, 0, 1)),
    tail: smoothstep(0.55, 1.0, (ribCycle + 0.5) % 1) * 0.92,
    inkColor: '#12131E',
    tipColor: s.colorB,
    opacity: 0.85,
  });

  // ── Sculpted 3D Bone Waves sweeping across the Battle Box (Bars 0..6 & 12..16) ──
  let minBulletDist = 99;
  if (localBar < 6.5 || localBar >= 11.8) {
    const numBones = 7;
    for (let i = 0; i < numBones; i++) {
      const u = ((time * 0.72 + i / numBones) % 1);
      const bx = lerp(-2.55, 2.55, u);
      const edgeFade = smoothstep(0, 0.1, u) * (1 - smoothstep(0.9, 1, u));
      const isTop = i % 2 === 0;
      const len = 1.05 + 0.45 * Math.sin(time * 2.5 + i * 1.3);
      const by = isTop ? -0.18 - len * 0.5 : -2.98 + len * 0.5;
      const kind = i % 4 === 0 ? 'cyan' : i % 4 === 2 ? 'orange' : 'white';
      s.bones.push({
        id: `a2_b_${i}`,
        position: [bx, by, 0.12],
        length: len,
        thickness: 0.92,
        kind,
        opacity: edgeFade * s.boxOpacity,
      });
      const dist = Math.hypot(bx - sx, by - sy);
      if (dist < minBulletDist) minBulletDist = dist;
    }
  }

  // ── 3D Gaster Blasters (Bars 4..12) — Crisp Charge Reticles + Volumetric Beams! ──
  const spawnBlaster = (
    id: string,
    startF: number,
    fireF: number,
    endF: number,
    pos: [number, number, number],
    aimZ: number,
    colA: string,
    colB: string
  ) => {
    if (frame < startF || frame > endF) return;
    const enter = easeOutBack(clamp((frame - startF) / 18, 0, 1));
    const exit = 1 - smoothstep(endF - 16, endF, frame);
    const charge = clamp((frame - startF) / Math.max(1, fireF - startF), 0, 1);
    const beam =
      frame >= fireF
        ? (1 - smoothstep(fireF + 14, endF - 6, frame)) * easeOutCubic(clamp((frame - fireF) / 4, 0, 1))
        : 0;
    s.blasters.push({
      id,
      position: pos,
      rotation: [0.04, pos[0] < 0 ? 0.14 : -0.14, aimZ],
      scale: 0.84 * enter * exit,
      charge,
      beam,
      beamLength: 18,
      beamRadius: 0.42,
      leftEyeColor: colA,
      rightEyeColor: colB,
      beamColorA: colA,
      beamColorB: colB,
    });
  };

  // Bars 5–8: Twin diagonal crisscross blasters
  spawnBlaster('a2_gb1', 940, 998, 1088, [-5.2, 2.25, 0.25], 0.72, '#1AD1E8', '#F5D327');
  spawnBlaster('a2_gb2', 940, 998, 1088, [5.2, 2.25, 0.25], -0.72, '#F5D327', '#1AD1E8');
  spawnBlaster('a2_gb3', 1090, 1149, 1245, [-5.4, -1.55, 0.25], Math.PI / 2, '#9B4DFF', '#1AD1E8');
  spawnBlaster('a2_gb4', 1090, 1149, 1245, [5.4, -1.55, 0.25], -Math.PI / 2, '#F047A8', '#F5D327');

  // Bars 9–12: Cardinal Cross (North-South then Diagonal X)
  spawnBlaster('a2_gb5', 1242, 1301, 1392, [-1.5, 2.75, 0.25], 0.0, '#1AD1E8', '#9B4DFF');
  spawnBlaster('a2_gb6', 1242, 1301, 1392, [1.5, 2.75, 0.25], 0.0, '#F047A8', '#F5D327');
  spawnBlaster('a2_gb7', 1394, 1453, 1550, [-5.2, 1.95, 0.25], 0.68, '#1AD1E8', '#F5D327');
  spawnBlaster('a2_gb8', 1394, 1453, 1550, [5.2, 1.95, 0.25], -0.68, '#F047A8', '#1AD1E8');

  // Sakuga Eye Cut-In on bar 8 (frame 1226) launching the 4-Blaster Cardinal Cross!
  if (frame >= 1218 && frame <= 1256) {
    s.cutIn = {
      progress: (frame - 1218) / 38,
      eyeStyle: 'excited',
      accentColor: '#9B4DFF',
      secondaryColor: '#1AD1E8',
      angleDeg: 7,
      flip: true,
    };
  }

  // Subtle Sacred Enso Mandala spinning behind the Battle Box during the Cardinal Cross (bars 8..16)
  if (localBar >= 8) {
    s.mandalas.push({
      id: 'a2_mandala',
      position: [0, -1.55, -2.0],
      rotation: [-0.1, 0, 0],
      scale: 1.05,
      colorA: s.colorA,
      colorB: s.colorB,
      opacity: smoothstep(8, 8.6, localBar) * 0.56,
      pulse: beatPulse,
    });
  }

  // Bars 13–16: Dual dramatic Broomie slash streaks + ink splashes across screen
  if (frame >= 1604 && frame < 1630) {
    s.slashProgress = (frame - 1604) / 26;
    s.slashAngleDeg = 16;
    s.slashColor = '#F047A8';
  } else if (frame >= 1756 && frame < 1784) {
    s.slashProgress = (frame - 1756) / 28;
    s.slashAngleDeg = -22;
    s.slashColor = '#F5D327';
  }
  if (frame >= 1604 && frame < 1644) {
    s.splashes.push({
      id: 'a2_slash_splash',
      progress: (frame - 1604) / 40,
      cx: 960,
      cy: 560,
      color: '#F047A8',
      secondaryColor: '#1AD1E8',
      seed: 222,
      scale: 1.35,
    });
  }

  // Graze sparks when SOUL skims close to bones or beams
  s.soulGraze = clamp(1 - (minBulletDist - 0.5) / 0.85, 0, 0.9);

  // Clean fade-out of battle box right on the 1836 silence transition
  const outFade = 1 - smoothstep(1816, 1836, frame);
  s.boxOpacity *= outFade;
  s.soulOpacity *= outFade;
  s.hudOpacity = smoothstep(20, 48, lf) * outFade;
  s.hudHp = Math.round(lerp(92, 84, clamp(lf / 1216, 0, 1)));
  s.hudKr = 4;

  return s;
}
