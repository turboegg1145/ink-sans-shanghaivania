import React from 'react';
import { Bone3D, BoneKind } from './BoneAndDanmaku3D';
import { clamp } from '../core/math';

export interface BoneWheelCue {
  id: string;
  position: [number, number, number];
  radius: number;
  spokes: number;
  boneLength: number;
  rotationZ: number;
  tiltX?: number;
  kind?: BoneKind;
  altKind?: BoneKind;
  opacity?: number;
}

export interface BoneTunnelCue {
  id: string;
  /** Progress driving Z-depth bone gates flying toward the camera */
  time: number;
  speed: number;
  gateCount: number;
  radius: number;
  center: [number, number];
  kindA: BoneKind;
  kindB: BoneKind;
  opacity: number;
}

/** Sculpted 3D Rotating Bone Pinwheel (classic Undertale Sans spiral wheel elevated to 3D!) */
export const BoneWheel3D: React.FC<BoneWheelCue> = ({
  position,
  radius,
  spokes,
  boneLength,
  rotationZ,
  tiltX = 0,
  kind = 'white',
  altKind,
  opacity = 1,
}) => {
  if (opacity <= 0.01) return null;

  return (
    <group position={position} rotation={[tiltX, 0, rotationZ]}>
      {Array.from({ length: spokes }, (_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        const bx = Math.cos(a) * radius;
        const by = Math.sin(a) * radius;
        const k = altKind && i % 2 === 1 ? altKind : kind;
        return (
          <Bone3D
            key={i}
            position={[bx, by, 0]}
            rotation={[0, 0, a - Math.PI / 2]}
            length={boneLength}
            thickness={0.78}
            kind={k}
            opacity={opacity}
          />
        );
      })}
    </group>
  );
};

/** 3D Z-Depth Perspective Bone Corridor rushing past the camera toward the viewer! */
export const BoneTunnel3D: React.FC<BoneTunnelCue> = ({
  time,
  speed,
  gateCount,
  radius,
  center,
  kindA,
  kindB,
  opacity,
}) => {
  if (opacity <= 0.01) return null;

  return (
    <group>
      {Array.from({ length: gateCount }, (_, g) => {
        const u = ((time * speed + g / gateCount) % 1);
        const z = -12 + u * 16.5; // flies from deep background (-12) right past Battle Box (+4.5)
        const fade = clamp(u * 4, 0, 1) * clamp((1 - u) * 5, 0, 1) * opacity;
        const rot = g * 0.45 + time * 0.35;
        const k = g % 2 === 0 ? kindA : kindB;

        // 4 bones forming a rotating square perspective gate around the SOUL corridor
        return (
          <group key={g} position={[center[0], center[1], z]} rotation={[0, 0, rot]}>
            {[0, 1, 2, 3].map((side) => {
              const a = (side * Math.PI) / 2;
              return (
                <Bone3D
                  key={side}
                  position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]}
                  rotation={[0, 0, a]}
                  length={radius * 1.9}
                  thickness={0.76}
                  kind={k}
                  opacity={fade}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
};
