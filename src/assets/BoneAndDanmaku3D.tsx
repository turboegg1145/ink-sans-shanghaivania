import React, { useMemo } from 'react';
import * as THREE from 'three';

export type BoneKind = 'white' | 'cyan' | 'orange' | 'ink' | 'prismatic';

export interface BoneItem {
  id?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  length: number;
  thickness?: number;
  kind?: BoneKind;
  opacity?: number;
}

export interface DanmakuOrb {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color: string;
  shape?: 'orb' | 'diamond' | 'petal';
  opacity?: number;
}

const BONE_COLORS: Record<BoneKind, { base: string; emissive: string; ei: number; outline: string }> = {
  white: { base: '#FAF7F0', emissive: '#D8D4CC', ei: 0.25, outline: '#09090D' },
  cyan: { base: '#24E5FF', emissive: '#00C8FF', ei: 1.05, outline: '#09090D' },
  orange: { base: '#FF8C1A', emissive: '#FF6A00', ei: 1.05, outline: '#09090D' },
  ink: { base: '#18131B', emissive: '#541428', ei: 0.55, outline: '#FF3B5C' },
  prismatic: { base: '#FFFFFF', emissive: '#FF55C8', ei: 0.9, outline: '#09090D' },
};

// Shared unit-length sculpted bone (shaft + twin condyle knobs at top and bottom)
function createBoneParts() {
  const shaft = new THREE.CylinderGeometry(0.11, 0.11, 1.0, 12);
  const knob = new THREE.SphereGeometry(0.16, 10, 10);
  const diamond = new THREE.OctahedronGeometry(0.16, 0);
  const petal = new THREE.ConeGeometry(0.12, 0.42, 4);
  return { shaft, knob, diamond, petal };
}

let cachedParts: ReturnType<typeof createBoneParts> | null = null;
function getBoneParts() {
  if (!cachedParts) cachedParts = createBoneParts();
  return cachedParts;
}

export const Bone3D: React.FC<BoneItem> = ({
  position,
  rotation = [0, 0, 0],
  length,
  thickness = 1.0,
  kind = 'white',
  opacity = 1,
}) => {
  const parts = useMemo(() => getBoneParts(), []);
  if (opacity <= 0.01) return null;

  const style = BONE_COLORS[kind];
  const halfLen = length * 0.5;
  const kOff = 0.115 * thickness;

  return (
    <group position={position} rotation={rotation}>
      {/* Shaft */}
      <mesh geometry={parts.shaft} scale={[thickness, length, thickness]}>
        <meshStandardMaterial
          color={style.base}
          emissive={style.emissive}
          emissiveIntensity={style.ei}
          roughness={0.35}
          transparent={opacity < 0.99}
          opacity={opacity}
        />
      </mesh>
      {/* Crisp outline on shaft */}
      <mesh geometry={parts.shaft} scale={[thickness * 1.24, length * 1.01, thickness * 1.24]}>
        <meshBasicMaterial color={style.outline} side={THREE.BackSide} transparent={opacity < 0.99} opacity={opacity} />
      </mesh>

      {/* Top & Bottom twin condyle knobs */}
      {[-1, 1].map((yDir) =>
        [-1, 1].map((xDir) => (
          <group
            key={`${yDir}_${xDir}`}
            position={[xDir * kOff, yDir * halfLen, 0]}
            scale={[thickness, thickness * 0.92, thickness * 0.92]}
          >
            <mesh geometry={parts.knob}>
              <meshStandardMaterial
                color={style.base}
                emissive={style.emissive}
                emissiveIntensity={style.ei}
                roughness={0.35}
                transparent={opacity < 0.99}
                opacity={opacity}
              />
            </mesh>
            <mesh geometry={parts.knob} scale={1.22}>
              <meshBasicMaterial color={style.outline} side={THREE.BackSide} transparent={opacity < 0.99} opacity={opacity} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};

export const DanmakuField3D: React.FC<{ orbs: readonly DanmakuOrb[] }> = ({ orbs }) => {
  const parts = useMemo(() => getBoneParts(), []);
  if (orbs.length === 0) return null;

  return (
    <group>
      {orbs.map((o, i) => {
        const sc = o.scale ?? 1;
        const op = o.opacity ?? 1;
        if (op <= 0.01) return null;
        const geo =
          o.shape === 'petal'
            ? parts.petal
            : o.shape === 'diamond'
              ? parts.diamond
              : parts.knob;

        return (
          <group key={i} position={o.position} rotation={o.rotation ?? [0, 0, 0]} scale={sc}>
            {/* Outer glowing colored shell */}
            <mesh geometry={geo} scale={1.18}>
              <meshBasicMaterial
                color={o.color}
                transparent
                opacity={op * 0.88}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {/* Crisp incandescent white center (authentic Touhou bullet legibility!) */}
            <mesh geometry={geo} scale={0.58}>
              <meshBasicMaterial color="#FFFFFF" transparent opacity={op} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
