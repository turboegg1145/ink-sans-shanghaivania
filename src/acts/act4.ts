import { ActContext, createDefaultSceneState, SceneFrameState } from '../core/sceneState';
import { clamp, easeOutBack, easeOutCubic, lerp, smoothstep } from '../core/math';
import { BAR_FRAMES, impactRecoil } from '../core/timeline';

/**
 * ACT IV · 虹瓶轮舞 (0:40.6 – 1:00.8 | frames 2439 – 3652 | 16 bars Blue SOUL gravity & 6-Blaster Hex Ring)
 *
 * Frame 2439: Cobalt Blue detonation -> Blue SOUL telekinetic gravity slams cycling walls (Bottom -> Right -> Top -> Left)!
 * Bars 1–8: Parabolic Blue SOUL jumping cleanly over bone floors + shifting gravity walls every 2 bars.
 * Bars 9–16: 6-Blaster Hexagonal 3D Ring orbiting around the Battle Box firing rhythmic clockwise pairs,
 *            culminating in a synchronized 4-Blaster X-beam climax at frames 3500–3620!
 */
export function evaluateAct4(ctx: ActContext): SceneFrameState {
  const s = createDefaultSceneState();
  const { frame, localFrame: lf, time, beatPulse, smoothAudio } = ctx;
  const localBar = lf / BAR_FRAMES;

  // Cycle gravity wall every 2 bars during bars 0..8
  const slamCycle = Math.floor(localBar / 2) % 4;
  const walls = ['bottom', 'right', 'top', 'left'] as const;
  const activeWall = localBar < 8.5 ? walls[slamCycle] : 'bottom';
  const slamFrame = 2439 + Math.floor(localBar / 2) * Math.round(BAR_FRAMES * 2);

  // Clean single-impulse recoils strictly on drop, gravity slams, and climax volleys
  const dropRec = impactRecoil(frame, 2439, 14);
  const slamRec = localBar < 8.5 ? impactRecoil(frame, slamFrame, 10) : 0;
  const climaxRec = impactRecoil(frame, 3500, 14);

  // Camera smoothly cranes & shifts weight with active gravity direction
  const gravTiltZ =
    activeWall === 'right' ? 0.055 : activeWall === 'left' ? -0.055 : activeWall === 'top' ? 0.0 : 0;
  const orbitX = localBar >= 8 ? Math.sin((localBar - 8) * 0.52) * 1.9 : Math.sin(time * 0.6) * 0.45;

  s.camPos = [
    orbitX,
    0.35 + dropRec * 0.25 + slamRec * 0.18 + climaxRec * 0.28,
    11.5 - dropRec * 0.85 - climaxRec * 0.75,
  ];
  s.camLookAt = [0, -0.35, 0];
  s.camRoll = lerp(0, gravTiltZ, 0.85);

  // Dynamic vial palette shifts across the 4 phases of Act IV
  const palettes: [string, string][] = [
    ['#2B6BFF', '#1AD1E8'], // Cobalt + Cyan
    ['#F5821F', '#F5D327'], // Orange + Gold
    ['#1AD1E8', '#9B4DFF'], // Cyan + Violet
    ['#E62E4D', '#F5D327'], // Crimson + Gold Climax
  ];
  const palIdx = Math.min(3, Math.floor(localBar / 4));
  s.colorA = palettes[palIdx][0];
  s.colorB = palettes[palIdx][1];
  s.backdropEnergy = 0.55 + smoothAudio.rms * 0.4;
  s.doodleOpacity = 0.78;
  s.doodleTurbulence = 0.32 + smoothAudio.bass * 0.22;

  // Opening drop impact frame & splash burst
  if (lf < 3) s.impactFlash = 1.0;
  else if (lf < 6) s.whiteFlash = (6 - lf) / 6;
  if (lf < 24) {
    s.slashProgress = clamp(lf / 22, 0, 1);
    s.slashAngleDeg = 14;
    s.slashColor = '#2B6BFF';
  }
  if (lf < 46) {
    s.splashes.push({
      id: 'act4_drop_splash',
      progress: clamp(lf / 44, 0, 1),
      cx: 960,
      cy: 470,
      color: '#2B6BFF',
      secondaryColor: '#F5D327',
      seed: 404,
      scale: 1.5,
    });
  }

  // Ink!Sans conducting telekinetic gravity & hexagonal blasters
  s.inkOpacity = 1;
  s.inkX = 50 + Math.cos(time * 0.9) * 1.6;
  s.inkY = 29.5 + Math.sin(time * 2.1) * 0.8;
  s.inkScale = 0.7;
  s.inkPose = localBar >= 8 ? 'conductorCast' : slamRec > 0.2 ? 'slashSweep' : 'brushReady';
  s.inkEye = palIdx === 0 ? 'classic' : palIdx === 1 ? 'target' : palIdx === 2 ? 'starBurst' : 'excited';
  s.brushPaintColor = s.colorA;
  s.brushAngleOffset = Math.sin(localBar * Math.PI) * 18;
  s.rimColor = s.colorA;
  s.rimIntensity = 0.5 + beatPulse * 0.25;

  // 3D Battle Box with active glowing Blue Gravity Wall
  const boxIn = easeOutBack(clamp(lf / 20, 0, 1));
  s.boxOpacity = clamp(lf / 12, 0, 1);
  s.boxPos = [0, -1.58, 0];
  s.boxRot = [-0.11, orbitX * 0.06, gravTiltZ * 0.8];
  s.boxWidth = 5.4 * boxIn;
  s.boxHeight = 3.0 * boxIn;
  s.boxBorderColor = localBar < 8.5 ? '#6699FF' : '#FAF7F0';
  s.gravityWall = localBar < 8.5 ? activeWall : 'none';
  s.boxOrnament = 1;

  // Blue SOUL parabolic jumping physics locked to the active gravity floor!
  const evalBlueSoul = (tSec: number): [number, number] => {
    const hop = Math.abs(Math.sin(tSec * 4.2));
    const slide = Math.sin(tSec * 1.9) * 1.65;
    if (localBar >= 8.5) {
      // Free-flight Red/Cyan orbit inside Hex Blaster Ring!
      return [Math.cos(tSec * 2.6) * 1.45, -1.58 + Math.sin(tSec * 3.9) * 0.88];
    }
    if (activeWall === 'bottom') return [slide, -2.72 + hop * 1.35];
    if (activeWall === 'top') return [slide, -0.44 - hop * 1.35];
    if (activeWall === 'right') return [2.32 - hop * 1.55, -1.58 + Math.sin(tSec * 2.1) * 0.95];
    return [-2.32 + hop * 1.55, -1.58 + Math.sin(tSec * 2.1) * 0.95];
  };
  const [sx, sy] = evalBlueSoul(time);
  s.soulOpacity = s.boxOpacity;
  s.soulMode = localBar < 8.5 ? 'blue' : 'cyan';
  s.soulPos = [sx, sy, 0.28];
  s.soulPulse = beatPulse * 0.65;
  s.soulTrail = [1, 2, 3, 4].map((k) => {
    const [tx, ty] = evalBlueSoul(time - k * 0.028);
    return [tx, ty, 0.26 - k * 0.01];
  });

  // Bone floor arrays emerging from the slammed gravity wall (Bars 0..8.5)
  let minDist = 99;
  if (localBar < 8.8) {
    const boneCount = 8;
    for (let i = 0; i < boneCount; i++) {
      const u = ((time * 0.85 + i / boneCount) % 1);
      const fade = smoothstep(0, 0.1, u) * (1 - smoothstep(0.9, 1, u));
      const len = 0.85 + 0.35 * Math.sin(i * 1.7 + time * 3);
      const isHoriz = activeWall === 'left' || activeWall === 'right';
      const pos: [number, number, number] = isHoriz
        ? [
            activeWall === 'right' ? 2.6 - len * 0.5 : -2.6 + len * 0.5,
            lerp(-2.8, -0.35, u),
            0.12,
          ]
        : [
            lerp(-2.5, 2.5, u),
            activeWall === 'bottom' ? -2.98 + len * 0.5 : -0.18 - len * 0.5,
            0.12,
          ];
      const kind = i % 3 === 0 ? 'cyan' : i % 5 === 0 ? 'orange' : 'white';
      s.bones.push({
        id: `a4_bone_${i}`,
        position: pos,
        rotation: isHoriz ? [0, 0, Math.PI / 2] : [0, 0, 0],
        length: len,
        thickness: 0.88,
        kind,
        opacity: fade * s.boxOpacity,
      });
      const d = Math.hypot(pos[0] - sx, pos[1] - sy);
      if (d < minDist) minDist = d;
    }
  }

  // Sweeping Paint Ribbons synchronized to vial palette
  const ribU = (localBar * 0.35) % 1;
  s.ribbons.push({
    id: 'act4_rib1',
    points: [
      [-9.6, 2.8, -2.5],
      [-3.5, -1.6, -1.6],
      [3.8, 2.2, -1.4],
      [9.6, -1.8, -2.4],
    ],
    width: 1.45,
    progress: easeOutCubic(clamp(ribU * 1.5, 0, 1)),
    tail: smoothstep(0.55, 1.0, ribU) * 0.9,
    inkColor: '#0E1019',
    tipColor: s.colorA,
    opacity: 0.88,
  });

  // ── Bars 8..16: 6-Blaster Hexagonal 3D Ring orbiting around the Battle Box! ──
  if (localBar >= 7.8) {
    const ringAlpha = smoothstep(7.8, 8.6, localBar);
    const ringAngle0 = (localBar - 8) * 0.42;
    const isClimaxVolley = frame >= 3470 && frame <= 3630;
    const activePair = Math.floor((localBar - 8) * 1.5) % 3;
    const pairPhase = ((localBar - 8) * 1.5) % 1;

    for (let k = 0; k < 6; k++) {
      const theta = ringAngle0 + (k / 6) * Math.PI * 2;
      const rx = Math.cos(theta) * 5.65;
      const ry = -1.35 + Math.sin(theta) * 3.35;
      // Aim inward toward center of Battle Box (0, -1.58)!
      // Local -Y aims inward when rotZ = atan2(dx, -dy) -> let's compute exact inward angle!
      const dx = 0 - rx;
      const dy = -1.58 - ry;
      const aimZ = Math.atan2(dx, -dy);

      const inPair = k % 3 === activePair || isClimaxVolley;
      let charge = 0.25;
      let beam = 0;
      if (isClimaxVolley) {
        const ct = clamp((frame - 3470) / 30, 0, 1);
        charge = ct;
        beam = frame >= 3500 ? (1 - smoothstep(3555, 3625, frame)) * easeOutCubic(clamp((frame - 3500) / 5, 0, 1)) : 0;
      } else if (inPair) {
        charge = clamp(pairPhase / 0.42, 0, 1);
        beam =
          pairPhase >= 0.44
            ? (1 - smoothstep(0.68, 0.96, pairPhase)) * easeOutCubic(clamp((pairPhase - 0.44) / 0.08, 0, 1))
            : 0;
      }

      s.blasters.push({
        id: `a4_hex_${k}`,
        position: [rx, ry, 0.22],
        rotation: [0.04, rx < 0 ? 0.12 : -0.12, aimZ],
        scale: 0.72 * ringAlpha,
        charge,
        beam,
        beamLength: 14.5,
        beamRadius: isClimaxVolley ? 0.36 : 0.32,
        leftEyeColor: k % 2 === 0 ? s.colorA : s.colorB,
        rightEyeColor: k % 2 === 0 ? s.colorB : s.colorA,
        beamColorA: s.colorA,
        beamColorB: s.colorB,
      });
    }
  }

  // Spinning 3D Bone Pinwheels flanking the Blue Gravity Arena (bars 4..8.5)
  if (localBar >= 3.8 && localBar < 8.8) {
    const wAlpha = smoothstep(3.8, 4.3, localBar) * (1 - smoothstep(8.2, 8.8, localBar));
    s.boneWheels.push(
      {
        id: 'a4_wheel_l',
        position: [-4.6, -1.55, -0.3],
        radius: 1.35,
        spokes: 6,
        boneLength: 1.05,
        rotationZ: time * 1.9,
        kind: 'cyan',
        altKind: 'white',
        opacity: wAlpha,
      },
      {
        id: 'a4_wheel_r',
        position: [4.6, -1.55, -0.3],
        radius: 1.35,
        spokes: 6,
        boneLength: 1.05,
        rotationZ: -time * 1.9,
        kind: 'orange',
        altKind: 'white',
        opacity: wAlpha,
      }
    );
  }

  // Sakuga Eye Cut-In launching the Hexagonal Blaster Ring at bar 8 (frame 3045)!
  if (frame >= 3036 && frame <= 3076) {
    s.cutIn = {
      progress: (frame - 3036) / 40,
      eyeStyle: 'starBurst',
      accentColor: '#1AD1E8',
      secondaryColor: '#F5D327',
      angleDeg: -7,
    };
  }

  // Spinning Sacred Mandala behind Ink during the Hexagonal Blaster Climax (bars 8..16)
  if (localBar >= 7.8) {
    s.mandalas.push({
      id: 'a4_mandala',
      position: [0, -1.45, -2.0],
      rotation: [0, 0, 0],
      scale: 1.15,
      colorA: s.colorA,
      colorB: s.colorB,
      opacity: smoothstep(7.8, 8.6, localBar) * 0.72,
      pulse: beatPulse,
    });
  }

  // Climax impact flash + ink splash at frame 3500
  if (frame >= 3500 && frame < 3502) s.impactFlash = 0.9;
  if (frame >= 3500 && frame < 3542) {
    s.splashes.push({
      id: 'act4_climax_splash',
      progress: (frame - 3500) / 42,
      cx: 960,
      cy: 610,
      color: '#E62E4D',
      secondaryColor: '#F5D327',
      seed: 444,
      scale: 1.5,
    });
  }

  s.soulGraze = clamp(1 - (minDist - 0.45) / 0.85, 0, 0.92);
  s.hudOpacity = smoothstep(10, 32, lf);
  s.hudHp = Math.round(lerp(84, 72, clamp(localBar / 16, 0, 1)));
  s.hudKr = 6;

  return s;
}
