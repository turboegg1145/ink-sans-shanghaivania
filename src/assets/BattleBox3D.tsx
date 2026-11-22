import React, { useMemo } from 'react';
import * as THREE from 'three';

export interface BattleBox3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  /** Glow accent color along border */
  borderColor?: string;
  /** Inner obsidian tint opacity */
  fillOpacity?: number;
  /** Diagonal slash split separation [0..1] */
  splitAmount?: number;
  /** Gravity wall direction when Blue SOUL is active */
  gravityWall?: 'none' | 'bottom' | 'top' | 'left' | 'right';
  /** Overall visibility opacity */
  opacity?: number;
  /** Border line thickness */
  thickness?: number;
  /** Optional subtle prism diamond corner accents */
  ornament?: number;
}

export const BattleBox3D: React.FC<BattleBox3DProps> = ({
  position = [0, -1.35, 0],
  rotation = [0, 0, 0],
  width = 4.6,
  height = 3.2,
  borderColor = '#FAF7F0',
  fillOpacity = 0.72,
  splitAmount = 0,
  gravityWall = 'none',
  opacity = 1,
  thickness = 0.085,
  ornament = 1,
}) => {
  const hw = width / 2;
  const hh = height / 2;

  // Split displacement (clean diagonal drift when sliced by Broomie or Chara slash!)
  const splitOffset = splitAmount * 0.85;
  const splitRot = splitAmount * 0.14;

  // Build crisp 4-edge bars for either intact box or upper-left / lower-right split halves
  const cornerLen = Math.min(width, height) * 0.14;

  const borderMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: borderColor,
        transparent: true,
        opacity,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  borderMat.color.set(borderColor);
  borderMat.opacity = opacity;

  if (opacity <= 0.01) return null;

  const renderBoxHalf = (halfSign: 1 | -1) => {
    const dx = halfSign * splitOffset;
    const dy = -halfSign * splitOffset * 0.42;
    const rz = halfSign * splitRot;

    return (
      <group position={[dx, dy, 0]} rotation={[0, 0, rz]}>
        {halfSign === -1 ? (
          <>
            {/* Top bar */}
            <mesh position={[0, hh, 0]} material={borderMat}>
              <boxGeometry args={[width + thickness, thickness, thickness]} />
            </mesh>
            {/* Left bar */}
            <mesh position={[-hw, 0, 0]} material={borderMat}>
              <boxGeometry args={[thickness, height + thickness, thickness]} />
            </mesh>
          </>
        ) : (
          <>
            {/* Bottom bar */}
            <mesh position={[0, -hh, 0]} material={borderMat}>
              <boxGeometry args={[width + thickness, thickness, thickness]} />
            </mesh>
            {/* Right bar */}
            <mesh position={[hw, 0, 0]} material={borderMat}>
              <boxGeometry args={[thickness, height + thickness, thickness]} />
            </mesh>
          </>
        )}
      </group>
    );
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Translucent Obsidian Glass Arena Floor (rendered strictly behind beams & danmaku!) */}
      {splitAmount < 0.05 && (
        <mesh position={[0, 0, -0.06]} renderOrder={-10}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            color="#07080E"
            transparent
            opacity={fillOpacity * opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Split halves (when splitAmount === 0, they unite seamlessly into the intact crisp box!) */}
      {renderBoxHalf(-1)}
      {renderBoxHalf(1)}

      {/* Subtle architectural calligraphy corner brackets (design polish without clutter) */}
      {ornament > 0.05 && splitAmount < 0.05 && (
        <group>
          {[
            [-1, 1],
            [1, 1],
            [-1, -1],
            [1, -1],
          ].map(([sx, sy], i) => (
            <group key={i} position={[sx * (hw + 0.16), sy * (hh + 0.16), 0.01]}>
              <mesh position={[-sx * cornerLen * 0.5, 0, 0]}>
                <boxGeometry args={[cornerLen, 0.025, 0.02]} />
                <meshBasicMaterial
                  color={borderColor}
                  transparent
                  opacity={opacity * ornament * 0.55}
                />
              </mesh>
              <mesh position={[0, -sy * cornerLen * 0.5, 0]}>
                <boxGeometry args={[0.025, cornerLen, 0.02]} />
                <meshBasicMaterial
                  color={borderColor}
                  transparent
                  opacity={opacity * ornament * 0.55}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Diegetic Gravity Wall Glow (Blue SOUL slam cue — no text needed!) */}
      {gravityWall !== 'none' && (
        <mesh
          position={
            gravityWall === 'bottom'
              ? [0, -hh + 0.12, 0.02]
              : gravityWall === 'top'
                ? [0, hh - 0.12, 0.02]
                : gravityWall === 'left'
                  ? [-hw + 0.12, 0, 0.02]
                  : [hw - 0.12, 0, 0.02]
          }
        >
          <planeGeometry
            args={
              gravityWall === 'bottom' || gravityWall === 'top'
                ? [width * 0.96, 0.28]
                : [0.28, height * 0.96]
            }
          />
          <meshBasicMaterial
            color="#2B6BFF"
            transparent
            opacity={0.55 * opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};
