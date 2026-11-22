import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import {
  barAtFrame,
  beatAtFrame,
  beatPulse,
  FPS,
  getActAtFrame,
  getActProgress,
  HEIGHT,
  WIDTH,
} from './core/timeline';
import { getAudioAtFrame, getSmoothedAudio } from './core/audio';
import { ActContext, SceneFrameState } from './core/sceneState';
import { ensureFontsLoaded } from './fonts';

import { evaluateAct1 } from './acts/act1';
import { evaluateAct2 } from './acts/act2';
import { evaluateAct3 } from './acts/act3';
import { evaluateAct4 } from './acts/act4';
import { evaluateAct5 } from './acts/act5';
import { evaluateAct6 } from './acts/act6';
import { evaluateAct7 } from './acts/act7';
import { evaluateAct8 } from './acts/act8';
import { evaluateAct9 } from './acts/act9';

import { InkWashBackdrop3D } from './assets/InkWashBackdrop3D';
import { DoodleSphere3D } from './assets/DoodleSphere3D';
import { GasterBlaster3D } from './assets/GasterBlaster3D';
import { BattleBox3D } from './assets/BattleBox3D';
import { Soul3D } from './assets/Soul3D';
import { Bone3D, DanmakuField3D } from './assets/BoneAndDanmaku3D';
import { BoneTunnel3D, BoneWheel3D } from './assets/BoneWheel3D';
import { BroomieRibbon3D } from './assets/BroomieRibbon3D';
import { SacredMandala3D } from './assets/SacredMandala3D';
import { InkSansRig } from './assets/InkSansRig';
import { InkDropRipple, InkSplashBurst, VialMacroShowcase } from './assets/InkSplatter2D';
import { DimensionalRiftLayer } from './assets/DimensionalRiftLayer';
import { AnimeCutInOverlay } from './assets/AnimeCutInOverlay';
import { DiegeticBattleHUD } from './post/DiegeticBattleHUD';
import { CompositorOverlay } from './post/CompositorOverlay';

/** Synchronous deterministic 3D camera rig inside R3F (executes before every Remotion frame snapshot) */
const CameraRig: React.FC<{
  pos: [number, number, number];
  lookAt: [number, number, number];
  roll: number;
  fov: number;
}> = ({ pos, lookAt, roll, fov }) => {
  const { camera } = useThree();
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
  camera.rotateZ(roll);
  if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
};

function evaluateMasterState(frame: number): SceneFrameState {
  const act = getActAtFrame(frame);
  const localFrame = frame - act.start;
  const duration = act.end - act.start;
  const ctx: ActContext = {
    frame,
    localFrame,
    duration,
    progress: getActProgress(frame, act),
    time: frame / FPS,
    localTime: localFrame / FPS,
    beat: beatAtFrame(frame),
    bar: barAtFrame(frame),
    beatPulse: beatPulse(frame, 1, 5.2),
    audio: getAudioAtFrame(frame),
    smoothAudio: getSmoothedAudio(frame, 8),
  };

  switch (act.id) {
    case 'act1_overture':
      return evaluateAct1(ctx);
    case 'act2_first_stroke':
      return evaluateAct2(ctx);
    case 'act3_quiet_dip':
      return evaluateAct3(ctx);
    case 'act4_vial_waltz':
      return evaluateAct4(ctx);
    case 'act5_danmaku_bloom':
      return evaluateAct5(ctx);
    case 'act6_dimensional_rift':
      return evaluateAct6(ctx);
    case 'act7_multiverse_surge':
      return evaluateAct7(ctx);
    case 'act8_hollow_void':
      return evaluateAct8(ctx);
    case 'act9_finale':
      return evaluateAct9(ctx);
  }
}

export const ShanghaivaniaMaster: React.FC = () => {
  ensureFontsLoaded();
  const frame = useCurrentFrame();
  const time = frame / FPS;
  const st = evaluateMasterState(frame);
  const pulse = beatPulse(frame, 1, 5.2);

  return (
    <AbsoluteFill style={{ backgroundColor: '#050508' }}>
      {/* Original 320kbps Master Audio Track */}
      <Audio src={staticFile('audio/shanghaivania.mp3')} />

      {/* ═══ PERSISTENT 3D WEBGL STAGE (ZERO CONTEXT REMOUNTS ACROSS ALL 13,484 FRAMES) ═══ */}
      <ThreeCanvas
        width={WIDTH}
        height={HEIGHT}
        camera={{ position: st.camPos, fov: st.camFov }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        <CameraRig
          pos={st.camPos}
          lookAt={st.camLookAt}
          roll={st.camRoll}
          fov={st.camFov}
        />

        {/* Cinema 3-Point Adaptive Lighting */}
        <ambientLight intensity={st.paperMix > 0.5 ? 1.12 : 0.72} />
        <directionalLight position={[6, 9, 10]} intensity={1.38} color="#FFFBF0" />
        <pointLight
          position={[-5.5, 2.5, 5.5]}
          intensity={st.monochrome > 0.6 ? 0.35 : 2.15}
          color={st.colorA}
        />
        <pointLight
          position={[5.5, -2.0, 5.5]}
          intensity={st.monochrome > 0.6 ? 0.25 : 1.95}
          color={st.colorB}
        />

        {/* 1. Custom GLSL Domain-Warped Sumi-e Ink Wash / Xuan Paper Backdrop */}
        <InkWashBackdrop3D
          time={time}
          paperMix={st.paperMix}
          monochrome={st.monochrome}
          energy={st.backdropEnergy}
          inkBloom={st.inkBloom}
          bloomCenter={st.bloomCenter}
          colorA={st.colorA}
          colorB={st.colorB}
          spectrum={st.spectrum}
        />

        {/* 2. Original 3D Hand-Inked AU Sketchbook Doodle Sphere */}
        <DoodleSphere3D
          time={time}
          energy={st.backdropEnergy}
          monochrome={st.monochrome}
          turbulence={st.doodleTurbulence}
          opacity={st.doodleOpacity}
          accentColorA={st.colorA}
          accentColorB={st.colorB}
        />

        {/* 3. Original 3D Touhou × Sumi-e Sacred Enso Mandalas */}
        {st.mandalas.map((m) => (
          <SacredMandala3D key={m.id} {...m} time={time} />
        ))}

        {/* 4. Original 3D GLSL Calligraphy Brush Ribbons */}
        {st.ribbons.map((rib) => (
          <BroomieRibbon3D
            key={rib.id}
            points={rib.points}
            width={rib.width}
            progress={rib.progress}
            tail={rib.tail}
            inkColor={rib.inkColor}
            tipColor={rib.tipColor}
            opacity={rib.opacity}
            time={time}
          />
        ))}

        {/* 5. Original 3D Z-Depth Perspective Bone Corridor Tunnel */}
        {st.boneTunnel && <BoneTunnel3D {...st.boneTunnel} />}

        {/* 6. Original 3D Spinning Bone Pinwheels */}
        {st.boneWheels.map((w) => (
          <BoneWheel3D key={w.id} {...w} />
        ))}

        {/* 7. Original 3D Morphing & Splittable Battle Box */}
        <BattleBox3D
          position={st.boxPos}
          rotation={st.boxRot}
          width={st.boxWidth}
          height={st.boxHeight}
          borderColor={st.boxBorderColor}
          fillOpacity={st.boxFillOpacity}
          splitAmount={st.boxSplit}
          gravityWall={st.gravityWall}
          opacity={st.boxOpacity}
          ornament={st.boxOrnament}
        />

        {/* 8. Sculpted 3D Bones & Touhou Geometric Danmaku Field */}
        {st.bones.map((b, i) => (
          <Bone3D key={b.id ?? `bone_${i}`} {...b} />
        ))}
        <DanmakuField3D orbs={st.danmaku} />

        {/* 9. Sculpted 3D Faceted SOUL with Graze Halo & Afterimage Trail */}
        <Soul3D
          position={st.soulPos}
          mode={st.soulMode}
          scale={st.soulScale}
          trail={st.soulTrail}
          graze={st.soulGraze}
          pulse={st.soulPulse}
          time={time}
          opacity={st.soulOpacity}
        />

        {/* 10. Sculpted 3D Volumetric Gaster Blasters */}
        {st.blasters.map((gb) => (
          <GasterBlaster3D key={gb.id} {...gb} monochrome={st.monochrome > 0.7} time={time} />
        ))}
      </ThreeCanvas>

      {/* ═══ LAYER 2: ORIGINAL HIGH-RES CEL/SUMI-E INK!SANS CHARACTER RIG ═══ */}
      {st.inkOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: `${st.inkX}%`,
            top: `${st.inkY}%`,
            transform: `translate(-50%, -50%) scale(${st.inkScale.toFixed(3)})`,
            opacity: st.inkOpacity,
            pointerEvents: 'none',
          }}
        >
          <InkSansRig
            time={time}
            beat={pulse * 0.5}
            pose={st.inkPose}
            eyeStyle={st.inkEye}
            brushPaintColor={st.brushPaintColor}
            vialLevels={st.vialLevels}
            monochrome={st.monochrome}
            blink={st.blink}
            brushAngleOffset={st.brushAngleOffset}
            headTilt={st.headTilt}
            flipX={st.flipX}
            rimColor={st.rimColor}
            rimIntensity={st.rimIntensity}
            size={620}
          />
        </div>
      )}

      {/* ═══ LAYER 3: BESPOKE 2D GRAPHIC CENTERPIECES ═══ */}
      {st.inkDropRipple && (
        <InkDropRipple
          progress={st.inkDropRipple.progress}
          cx={st.inkDropRipple.cx}
          cy={st.inkDropRipple.cy}
          color={st.inkDropRipple.color}
          monochrome={st.monochrome > 0.5}
        />
      )}

      {st.vialMacro && (
        <VialMacroShowcase
          opacity={st.vialMacro.opacity}
          time={time}
          activeIndex={st.vialMacro.activeIndex}
          levels={st.vialMacro.levels}
          shatter={st.vialMacro.shatter}
        />
      )}

      {st.splashes.map((sp) => (
        <InkSplashBurst
          key={sp.id}
          progress={sp.progress}
          cx={sp.cx}
          cy={sp.cy}
          color={sp.color}
          secondaryColor={sp.secondaryColor}
          seed={sp.seed}
          scale={sp.scale}
        />
      ))}

      {/* Act VI Surgical Dimensional Pixel Rift */}
      {st.dimensionalRift && (
        <DimensionalRiftLayer
          openAmount={st.dimensionalRift.openAmount}
          showMiss={st.dimensionalRift.showMiss}
          angleDeg={st.dimensionalRift.angleDeg}
          time={time}
        />
      )}

      {/* Sakuga Anime Close-Up Eye Cut-In Panel (zero text!) */}
      {st.cutIn && (
        <AnimeCutInOverlay
          progress={st.cutIn.progress}
          eyeStyle={st.cutIn.eyeStyle}
          accentColor={st.cutIn.accentColor}
          secondaryColor={st.cutIn.secondaryColor}
          angleDeg={st.cutIn.angleDeg}
          flip={st.cutIn.flip}
          time={time}
        />
      )}

      {/* Minimal Museum-Grade Main Title (Act I opening & Act IX closing ONLY — zero AI kickers!) */}
      {st.titleOpacity > 0.01 && st.titleText && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${st.titleYPercent}%`,
            transform: 'translate(-50%, -50%)',
            opacity: st.titleOpacity,
            fontFamily: '"Cinzel", serif',
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: `${st.titleTrackingEm.toFixed(3)}em`,
            color: st.titleColor,
            textShadow: '0 4px 28px rgba(8, 8, 14, 0.88)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {st.titleText}
        </div>
      )}

      {/* Ultra-Minimal Diegetic HP Strip (combat acts only) */}
      <DiegeticBattleHUD
        opacity={st.hudOpacity}
        hp={st.hudHp}
        kr={st.hudKr}
        monochrome={st.monochrome > 0.6}
      />

      {/* Sakuga Optical Compositor (letterbox, slash cut, crisp impact frames, clean fades) */}
      <CompositorOverlay
        impactFlash={st.impactFlash}
        whiteFlash={st.whiteFlash}
        letterboxPx={st.letterboxPx}
        slashProgress={st.slashProgress}
        slashAngleDeg={st.slashAngleDeg}
        slashColor={st.slashColor}
        monochrome={st.monochrome}
        fadeBlack={st.fadeBlack}
      />
    </AbsoluteFill>
  );
};
