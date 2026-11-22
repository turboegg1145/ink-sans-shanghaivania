import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { InkWashBackdrop3D } from './assets/InkWashBackdrop3D';
import { DoodleSphere3D } from './assets/DoodleSphere3D';
import { GasterBlaster3D } from './assets/GasterBlaster3D';
import { BattleBox3D } from './assets/BattleBox3D';
import { Soul3D } from './assets/Soul3D';
import { Bone3D, DanmakuField3D, DanmakuOrb } from './assets/BoneAndDanmaku3D';
import { BroomieRibbon3D } from './assets/BroomieRibbon3D';
import { InkSansRig } from './assets/InkSansRig';
import { DimensionalRiftLayer } from './assets/DimensionalRiftLayer';
import { CompositorOverlay } from './post/CompositorOverlay';
import { DiegeticBattleHUD } from './post/DiegeticBattleHUD';
import { ensureFontsLoaded } from './fonts';
import { WIDTH, HEIGHT } from './core/timeline';
import { INK_VIALS } from './core/palette';

/**
 * 4-Frame Look-Dev Verification Sheet:
 * - Frame 0: Act I Xuan Paper Overture & Ink Bloom
 * - Frame 1: Full Combat Showcase (3D Gaster Blasters, Touhou Danmaku, Broomie Ribbon, Ink!Sans)
 * - Frame 2: Act VI Dimensional Rift (3D Sumi-e World torn open to reveal Pixel v0.39 substrate)
 * - Frame 3: Act VIII Hollow Monochrome Void (drained vials, shadowed empty eyes, stark sumi paper)
 */
export const LookDevShowcase: React.FC = () => {
  ensureFontsLoaded();
  const frame = useCurrentFrame();
  const mode = frame % 4;
  const time = 12.4 + frame * 0.4;

  // Build Touhou rose danmaku sample for Frame 1
  const danmakuOrbs: DanmakuOrb[] = [];
  if (mode === 1) {
    for (let ring = 0; ring < 2; ring++) {
      const count = 18;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + ring * 0.17;
        const r = 1.65 + ring * 1.15 + Math.sin(a * 5) * 0.28;
        danmakuOrbs.push({
          position: [Math.cos(a) * r, -1.2 + Math.sin(a) * r * 0.72, 0.3],
          rotation: [0, 0, a - Math.PI / 2],
          scale: ring === 0 ? 0.95 : 1.1,
          color: INK_VIALS[(i + ring * 3) % INK_VIALS.length].hex,
          shape: ring === 0 ? 'petal' : 'diamond',
          opacity: 0.95,
        });
      }
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#050508' }}>
      {/* 3D WebGL Stage */}
      <ThreeCanvas
        width={WIDTH}
        height={HEIGHT}
        camera={{ position: [0, 0.4, 11.5], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
      >
        <ambientLight intensity={mode === 0 ? 1.1 : 0.72} />
        <directionalLight position={[6, 9, 10]} intensity={1.35} color="#FFFBF0" />
        <pointLight
          position={[-5, 2, 5]}
          intensity={mode === 3 ? 0.4 : 2.2}
          color={mode === 1 ? '#1AD1E8' : '#F5D327'}
        />
        <pointLight
          position={[5, -2, 5]}
          intensity={mode === 3 ? 0.2 : 1.9}
          color={mode === 1 ? '#F047A8' : '#9B4DFF'}
        />

        {/* Custom GLSL Domain-Warped Sumi-e Ink Wash Backdrop */}
        <InkWashBackdrop3D
          time={time}
          paperMix={mode === 0 ? 1.0 : mode === 3 ? 0.82 : 0.0}
          monochrome={mode === 3 ? 1.0 : 0.0}
          energy={mode === 1 ? 0.85 : mode === 2 ? 0.55 : 0.18}
          inkBloom={mode === 0 ? 0.56 : mode === 3 ? 0.32 : 0}
          bloomCenter={[0.5, 0.48]}
          colorA={mode === 1 ? '#1AD1E8' : '#9B4DFF'}
          colorB={mode === 1 ? '#F5D327' : '#F047A8'}
          spectrum={0}
        />

        {/* Floating Hand-Inked AU Sketchbook Doodle Sphere */}
        <DoodleSphere3D
          time={time}
          energy={mode === 1 ? 0.75 : 0.15}
          monochrome={mode === 3 ? 1.0 : 0.0}
          turbulence={mode === 1 ? 0.55 : 0.05}
          opacity={mode === 0 ? 0.92 : mode === 3 ? 0.65 : 0.78}
        />

        {/* Sweeping 3D Calligraphy Brush Ribbons */}
        {(mode === 0 || mode === 1 || mode === 2) && (
          <>
            <BroomieRibbon3D
              points={[
                [-8.5, -2.5, -2.5],
                [-3.2, 2.6, -1.2],
                [3.4, 1.4, -0.5],
                [8.8, -1.8, -1.8],
              ]}
              width={mode === 0 ? 1.05 : 1.5}
              progress={0.94}
              tail={0.08}
              inkColor="#101118"
              tipColor={mode === 0 ? '#1AD1E8' : '#F047A8'}
              opacity={0.92}
              time={time}
            />
            {mode === 1 && (
              <BroomieRibbon3D
                points={[
                  [8.5, 3.4, -2.2],
                  [2.6, -0.6, -0.8],
                  [-3.0, -2.6, 0.4],
                  [-8.8, 1.8, -1.4],
                ]}
                width={1.35}
                progress={0.92}
                tail={0.1}
                inkColor="#12131E"
                tipColor="#F5D327"
                opacity={0.9}
                time={time + 1.2}
              />
            )}
          </>
        )}

        {/* Sculpted 3D Gaster Blasters (aiming cleanly along local -Y into the battle arena!) */}
        {mode === 1 && (
          <>
            <GasterBlaster3D
              position={[-5.3, 2.35, 0.2]}
              rotation={[0.04, 0.14, 0.72]}
              scale={0.86}
              charge={1.0}
              beam={0.92}
              beamLength={18}
              beamRadius={0.44}
              leftEyeColor="#1AD1E8"
              rightEyeColor="#F5D327"
              beamColorA="#1AD1E8"
              beamColorB="#9B4DFF"
              time={time}
            />
            <GasterBlaster3D
              position={[5.3, 2.35, 0.2]}
              rotation={[0.04, -0.14, -0.72]}
              scale={0.86}
              charge={0.85}
              beam={0.0}
              leftEyeColor="#F047A8"
              rightEyeColor="#F5D327"
              beamColorA="#F047A8"
              beamColorB="#F5D327"
              time={time}
            />
          </>
        )}

        {/* 3D Morphing Battle Box, Sculpted Bones, Danmaku & Glowing SOUL */}
        {mode === 1 && (
          <group>
            <BattleBox3D
              position={[0, -1.55, 0]}
              rotation={[-0.12, 0.06, 0.02]}
              width={5.4}
              height={3.0}
              borderColor="#FAF7F0"
              gravityWall="bottom"
              ornament={1}
            />
            <Bone3D position={[-2.1, -2.25, 0.12]} length={1.48} kind="cyan" />
            <Bone3D position={[2.1, -2.25, 0.12]} length={1.48} kind="orange" />
            <Bone3D position={[-1.4, -2.4, 0.12]} length={1.2} kind="white" />
            <Bone3D position={[1.4, -2.4, 0.12]} length={1.2} kind="white" />
            <DanmakuField3D orbs={danmakuOrbs} />
            <Soul3D
              position={[0.35, -1.65, 0.28]}
              mode="blue"
              graze={0.85}
              pulse={0.45}
              trail={[
                [0.05, -1.8, 0.25],
                [-0.28, -1.92, 0.22],
                [-0.65, -1.94, 0.2],
              ]}
              time={time}
            />
          </group>
        )}

        {/* Frame 3 Hollow Void: minimal stark white box cleanly separated below Ink!Sans */}
        {mode === 3 && (
          <group>
            <BattleBox3D
              position={[0, -2.35, 0]}
              width={3.4}
              height={1.75}
              borderColor="#FAF7F0"
              fillOpacity={0.82}
              ornament={0}
            />
            <Soul3D position={[0, -2.35, 0.2]} mode="red" scale={0.28} time={time} />
          </group>
        )}
      </ThreeCanvas>

      {/* High-Res Original Anime Cel/Sumi-e Ink!Sans Character Layer */}
      {mode !== 2 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: mode === 1 ? '31%' : mode === 3 ? '36%' : '46%',
            transform: `translate(-50%, -50%) scale(${mode === 0 ? 1.02 : mode === 1 ? 0.72 : 0.84})`,
            pointerEvents: 'none',
          }}
        >
          <InkSansRig
            time={time}
            beat={mode === 1 ? 0.5 : 0.05}
            pose={mode === 0 ? 'brushReady' : mode === 1 ? 'conductorCast' : 'voidStand'}
            eyeStyle={mode === 0 ? 'classic' : mode === 1 ? 'starBurst' : 'void'}
            brushPaintColor={mode === 0 ? '#1AD1E8' : mode === 1 ? '#F047A8' : '#141418'}
            vialLevels={mode === 3 ? [0, 0, 0, 0, 0, 0, 0, 0] : [1, 1, 1, 1, 1, 1, 1, 1]}
            monochrome={mode === 3 ? 1 : 0}
            rimColor={mode === 1 ? '#1AD1E8' : '#F5D327'}
            rimIntensity={mode === 3 ? 0 : 0.45}
            size={620}
          />
        </div>
      )}

      {/* Frame 0 Minimal Cinema Title Layout (pure graphic design, zero AI kickers!) */}
      {mode === 0 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 108,
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: '0.26em',
              color: '#FAF7F0',
              textShadow: '0 4px 28px rgba(10, 10, 16, 0.85)',
            }}
          >
            SHANGHAIVANIA
          </div>
        </div>
      )}

      {/* Frame 2 Dimensional Pixel Rift Test */}
      {mode === 2 && <DimensionalRiftLayer openAmount={0.86} time={time} showMiss />}

      {/* Minimal Diegetic HP Strip (ONLY on active combat Frame 1) */}
      <DiegeticBattleHUD opacity={mode === 1 ? 1 : 0} hp={74} kr={12} />

      {/* Sakuga Compositor */}
      <CompositorOverlay letterboxPx={56} monochrome={mode === 3 ? 1 : 0} />
    </AbsoluteFill>
  );
};
