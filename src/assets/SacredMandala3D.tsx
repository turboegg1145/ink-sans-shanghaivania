import React, { useMemo } from 'react';
import * as THREE from 'three';
import { clamp } from '../core/math';

export interface SacredMandala3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  colorA?: string;
  colorB?: string;
  opacity?: number;
  time: number;
  pulse?: number;
}

/**
 * Original 3D Touhou × Sumi-e Sacred Enso Mandala:
 * Multi-layered counter-rotating calligraphic ink circle + 8-point & 12-point geometric stars + tick rings.
 * Zero text — pure architectural geometric beauty floating behind Ink!Sans or beneath the Battle Box.
 */
export const SacredMandala3D: React.FC<SacredMandala3DProps> = ({
  position = [0, -1.45, -1.8],
  rotation = [0, 0, 0],
  scale = 1,
  colorA = '#1AD1E8',
  colorB = '#F5D327',
  opacity = 0.85,
  time,
  pulse = 0,
}) => {
  const starGeo8 = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i <= 4; i++) {
        const a = (i / 4) * Math.PI * 2 + (k * Math.PI) / 4;
        pts.push(new THREE.Vector3(Math.cos(a) * 3.1, Math.sin(a) * 3.1, 0));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const hexGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i <= 3; i++) {
        const a = (i / 3) * Math.PI * 2 + (k * Math.PI) / 3;
        pts.push(new THREE.Vector3(Math.cos(a) * 2.25, Math.sin(a) * 2.25, 0));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  if (opacity <= 0.01) return null;

  const sc = scale * (1 + pulse * 0.06);
  const op = clamp(opacity, 0, 1);

  return (
    <group position={position} rotation={rotation} scale={sc}>
      {/* Outer Sumi Enso Calligraphic Brush Ring */}
      <mesh rotation={[0, 0, time * 0.25]}>
        <ringGeometry args={[3.55, 3.74, 64, 1, 0.25, Math.PI * 1.82]} />
        <meshBasicMaterial
          color={colorA}
          transparent
          opacity={op * 0.58}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Secondary Counter-Rotating Fine Compass Ring */}
      <mesh rotation={[0, 0, -time * 0.42]}>
        <ringGeometry args={[3.08, 3.16, 48]} />
        <meshBasicMaterial
          color={colorB}
          transparent
          opacity={op * 0.52}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 8-Point Sacred Star Wireframe */}
      <lineSegments geometry={starGeo8} rotation={[0, 0, time * 0.34]}>
        <lineBasicMaterial
          color={colorA}
          transparent
          opacity={op * 0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Inner Hexagram Star Wireframe */}
      <lineSegments geometry={hexGeo} rotation={[0, 0, -time * 0.52]}>
        <lineBasicMaterial
          color={colorB}
          transparent
          opacity={op * 0.62}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* 12 Radial Petals / Compass Ticks around perimeter */}
      <group rotation={[0, 0, time * 0.18]}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 3.35, Math.sin(a) * 3.35, 0.01]}
              rotation={[0, 0, a]}
            >
              <planeGeometry args={[i % 3 === 0 ? 0.42 : 0.22, 0.055]} />
              <meshBasicMaterial
                color={i % 2 === 0 ? colorA : colorB}
                transparent
                opacity={op * 0.72}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* Inner Luminous Core Ring */}
      <mesh rotation={[0, 0, time * 0.8]}>
        <ringGeometry args={[1.18, 1.26, 36]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={op * 0.38}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
