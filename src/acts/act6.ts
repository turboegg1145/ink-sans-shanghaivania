import { ActContext, createDefaultSceneState, SceneFrameState } from '../core/sceneState';
import { clamp, easeOutCubic, easeOutExpo, lerp, smoothstep } from '../core/math';
import { impactRecoil } from '../core/timeline';

/**
 * ACT VI · 弦断悬停 (1:41.3 – 1:51.4 | frames 6078 – 6684 | 8 bars THE DIMENSIONAL PIXEL RIFT!)
 *
 * Bass vanishes -> Razor diagonal slash tears right across the 3D Sumi-e Doodle Sphere ->
 * Inside the glowing cyan/gold tear sits the authentic retro 2D pixel Ink!Sans Fight v0.39!
 * A Chara knife slash cuts across at frame 6220 -> iconic retro "MISS" pops cleanly inside the rift!
 * At frames 6540–6684, heavy sumi ink slashes paint the dimensional tear shut before Act VII explodes!
 */
export function evaluateAct6(ctx: ActContext): SceneFrameState {
  const s = createDefaultSceneState();
  const { frame, localFrame: lf, duration, time, smoothAudio } = ctx;

  const openRec = impactRecoil(frame, 6078, 12);
  const missSlashFrame = 6225;
  const missRec = impactRecoil(frame, missSlashFrame, 10);

  // Calm gliding camera outside the dimensional tear
  s.camPos = [
    Math.sin(time * 0.4) * 0.65,
    0.25 + openRec * 0.2 + missRec * 0.15,
    11.6 - openRec * 0.6,
  ];
  s.camLookAt = [0, 0, 0];

  // Deep violet-indigo 3D sumi Doodle Sphere visible in upper & lower corners outside the tear
  s.paperMix = 0;
  s.colorA = '#9B4DFF';
  s.colorB = '#1AD1E8';
  s.backdropEnergy = 0.26 + smoothAudio.rms * 0.28;
  s.doodleOpacity = 0.85;
  s.doodleTurbulence = 0.14;

  // Hide 3D Ink & 3D Box while the retro 2D Pixel Dimension owns center frame!
  s.inkOpacity = 0;
  s.boxOpacity = 0;
  s.soulOpacity = 0;
  s.hudOpacity = 0;

  // Opening diagonal tear slash (frames 6078..6106)
  if (lf < 2) s.impactFlash = 0.9;
  if (lf < 28) {
    s.slashProgress = clamp(lf / 26, 0, 1);
    s.slashAngleDeg = -11;
    s.slashColor = '#1AD1E8';
  }

  // Second knife slash inside the rift triggering retro "MISS" at frame 6225!
  if (frame >= missSlashFrame && frame < missSlashFrame + 24) {
    s.slashProgress = (frame - missSlashFrame) / 24;
    s.slashAngleDeg = 22;
    s.slashColor = '#FF2A4D';
  }

  // Dimensional Rift smoothly tears wide open, holds cleanly, then snaps shut on a brush swipe
  const openT = easeOutExpo(clamp((lf - 10) / 48, 0, 1));
  const closeT = 1 - easeOutCubic(clamp((lf - (duration - 92)) / 82, 0, 1));
  const riftAmt = openT * closeT * 0.92;

  s.dimensionalRift = {
    openAmount: riftAmt,
    showMiss: frame >= missSlashFrame + 8 && frame <= duration + 6078 - 75,
    angleDeg: lerp(-11, -7, smoothstep(100, duration - 120, lf)),
  };

  // Closing sumi ink ribbon painting over the rift right before Act VII's drop!
  if (lf > duration - 105) {
    const closeRib = clamp((lf - (duration - 105)) / 85, 0, 1);
    s.ribbons.push({
      id: 'act6_seal_rib',
      points: [
        [-10.2, -3.5, 1.5],
        [-3.2, 0.2, 1.8],
        [3.4, 1.4, 1.8],
        [10.2, 3.8, 1.5],
      ],
      width: 2.2,
      progress: easeOutCubic(closeRib),
      tail: 0,
      inkColor: '#0A0B10',
      tipColor: '#9B4DFF',
      opacity: 0.96,
    });
  }

  s.letterboxPx = 56;
  return s;
}
