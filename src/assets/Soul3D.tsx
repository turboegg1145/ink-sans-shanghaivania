import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PALETTE } from '../core/palette';

export type SoulMode = 'red' | 'blue' | 'yellow' | 'purple' | 'cyan' | 'orange' | 'green' | 'rainbow' | 'white';

export interface Soul3DProps {
  position: [number, number, number];
  mode?: SoulMode;
  scale?: number;
  /** Motion trail history positions (most recent first) */
  trail?: readonly [number, number, number][];
  /** Graze intensity [0..1] when skimming close to danmaku bullets */
  graze?: number;
  /** Optional subtle heartbeat pulse */
  pulse?: number;
  time: number;
  opacity?: number;
}

const MODE_COLOR: Record<SoulMode, string> = {
  red: PALETTE.soulRed,
  blue: PALETTE.soulBlue,
  yellow: PALETTE.soulYellow,
  purple: PALETTE.soulPurple,
  cyan: PALETTE.soulCyan,
  orange: PALETTE.soulOrange,
  green: PALETTE.soulGreen,
  white: PALETTE.soulWhite,
  rainbow: '#1AD1E8',
};

let cachedHeartGeo: THREE.ExtrudeGeometry | null = null;
function getHeartGeometry(): THREE.ExtrudeGeometry {
  if (cachedHeartGeo) return cachedHeartGeo;
  const s = new THREE.Shape();
  // Crisp faceted Undertale-inspired sculpted heart
  s.moveTo(0, -0.58);
  s.bezierCurveTo(-0.56, -0.18, -0.66, 0.36, -0.32, 0.52);
  s.bezierCurveTo(-0.14, 0.60, -0.02, 0.44, 0, 0.30);
  s.bezierCurveTo(0.02, 0.44, 0.14, 0.60, 0.32, 0.52);
  s.bezierCurveTo(0.66, 0.36, 0.56, -0.18, 0, -0.58);

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 2,
    curveSegments: 14,
  });
  geo.center();
  cachedHeartGeo = geo;
  return geo;
}

export const Soul3D: React.FC<Soul3DProps> = ({
  position,
  mode = 'red',
  scale = 0.34,
  trail = [],
  graze = 0,
  pulse = 0,
  time,
  opacity = 1,
}) => {
  const heartGeo = useMemo(() => getHeartGeometry(), []);

  if (opacity <= 0.01) return null;

  let color = MODE_COLOR[mode];
  if (mode === 'rainbow') {
    const hue = (time * 0.45) % 1;
    color = '#' + new THREE.Color().setHSL(hue, 0.92, 0.58).getHexString();
  }

  // Yellow mode flips upright shooter orientation cleanly
  const rotZ = mode === 'yellow' ? Math.PI : 0;
  const beatScale = scale * (1 + pulse * 0.11);

  return (
    <group>
      {/* Silky afterimage trail */}
      {trail.map((pt, i) => {
        const frac = 1 - (i + 1) / (trail.length + 1);
        return (
          <mesh
            key={i}
            geometry={heartGeo}
            position={pt}
            rotation={[0, 0, rotZ]}
            scale={beatScale * (0.45 + frac * 0.5)}
          >
            <meshBasicMaterial
              color={color}
              transparent
              opacity={frac * frac * 0.34 * opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {/* Main sculpted glowing SOUL */}
      <group position={position} rotation={[0, Math.sin(time * 2.2) * 0.14, rotZ]}>
        {/* Outer ink rim for sharp legibility against bright ink washes */}
        <mesh geometry={heartGeo} scale={beatScale * 1.15}>
          <meshBasicMaterial color="#0A0A10" side={THREE.BackSide} transparent opacity={opacity} />
        </mesh>

        {/* Radiant heart body */}
        <mesh geometry={heartGeo} scale={beatScale}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.15 + graze * 0.8}
            roughness={0.22}
            metalness={0.1}
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* Inner white determination highlight */}
        <mesh geometry={heartGeo} position={[0, 0.02, 0.07]} scale={beatScale * 0.46}>
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.72 * opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Delicate luminous halo ring */}
        <mesh position={[0, 0, -0.05]} scale={beatScale * (2.15 + graze * 0.9)}>
          <ringGeometry args={[0.62, 0.72, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={(0.20 + graze * 0.42) * opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Touhou Graze Sparks (appear ONLY when skimming close to danmaku!) */}
        {graze > 0.12 && (
          <group rotation={[0, 0, time * 7.5]}>
            {[0, 1, 2, 3, 4, 5].map((k) => {
              const a = (k / 6) * Math.PI * 2;
              const r = beatScale * (1.25 + graze * 1.1);
              return (
                <mesh
                  key={k}
                  position={[Math.cos(a) * r, Math.sin(a) * r, 0.05]}
                  rotation={[0, 0, a]}
                >
                  <planeGeometry args={[0.14 * graze, 0.035]} />
                  <meshBasicMaterial
                    color="#FFFFFF"
                    transparent
                    opacity={graze * 0.9 * opacity}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </group>
    </group>
  );
};
