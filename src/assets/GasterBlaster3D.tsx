import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createBlasterBeamMaterial } from '../shaders/blasterBeamShader';
import { clamp } from '../core/math';

export interface GasterBlaster3DProps {
  position: [number, number, number];
  /**
   * Rotation of the Blaster skull in 3D space.
   * NOTE: By design, the skull faces the viewer (+Z) and shoots its beam DOWNWARD along its local -Y axis!
   * So rotating Z (`rotation={[0, 0, angle]}`) cleanly aims the beam anywhere in the 2D/3D battle plane
   * without ever blasting into the camera lens!
   */
  rotation?: [number, number, number];
  scale?: number;
  /** 0 = dormant, 0..1 = charging/opening jaw */
  charge?: number;
  /** Beam fire intensity [0..1] */
  beam?: number;
  beamLength?: number;
  beamRadius?: number;
  leftEyeColor?: string;
  rightEyeColor?: string;
  beamColorA?: string;
  beamColorB?: string;
  monochrome?: boolean;
  time: number;
}

/**
 * Razor-sharp, angular, iconic Ink!Sans horned dragon-skull Gaster Blaster silhouette!
 * Crisp crests, hollowed temples, aggressive cheek flanges, and jagged upper fangs.
 */
function createCraniumGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  // Crown apex spike
  s.moveTo(0, 1.56);
  // Right brow ridge & swept outer horn
  s.lineTo(0.24, 1.24);
  s.lineTo(0.46, 1.38);
  s.lineTo(0.68, 1.05);
  s.lineTo(0.98, 1.18); // upper outer horn tip
  s.lineTo(0.86, 0.72);
  // Sculpted angular cheekbone & swept-back fang flange
  s.lineTo(1.18, 0.36);
  s.lineTo(0.92, -0.08);
  s.lineTo(1.06, -0.58);
  s.lineTo(0.76, -1.14); // right outer fang tip
  s.lineTo(0.56, -0.74);
  // Jagged predatory upper teeth
  s.lineTo(0.42, -1.00);
  s.lineTo(0.26, -0.68);
  s.lineTo(0.12, -0.92);
  s.lineTo(0.0, -0.66);
  s.lineTo(-0.12, -0.92);
  s.lineTo(-0.26, -0.68);
  s.lineTo(-0.42, -1.00);
  s.lineTo(-0.56, -0.74);
  // Left outer fang & mirrored sculpted cheek/horn
  s.lineTo(-0.76, -1.14);
  s.lineTo(-1.06, -0.58);
  s.lineTo(-0.92, -0.08);
  s.lineTo(-1.18, 0.36);
  s.lineTo(-0.86, 0.72);
  s.lineTo(-0.98, 1.18);
  s.lineTo(-0.68, 1.05);
  s.lineTo(-0.46, 1.38);
  s.lineTo(-0.24, 1.24);
  s.lineTo(0, 1.56);

  // Fierce slanted left eye socket hole
  const leftEye = new THREE.Path();
  leftEye.moveTo(-0.16, 0.12);
  leftEye.lineTo(-0.22, 0.44);
  leftEye.lineTo(-0.68, 0.32);
  leftEye.lineTo(-0.78, -0.06);
  leftEye.lineTo(-0.44, -0.26);
  leftEye.lineTo(-0.16, -0.08);
  leftEye.closePath();
  s.holes.push(leftEye);

  // Fierce slanted right eye socket hole
  const rightEye = new THREE.Path();
  rightEye.moveTo(0.16, 0.12);
  rightEye.lineTo(0.16, -0.08);
  rightEye.lineTo(0.44, -0.26);
  rightEye.lineTo(0.78, -0.06);
  rightEye.lineTo(0.68, 0.32);
  rightEye.lineTo(0.22, 0.44);
  rightEye.closePath();
  s.holes.push(rightEye);

  // Sharp inverted-teardrop nasal cavity
  const nose = new THREE.Path();
  nose.moveTo(0, -0.08);
  nose.lineTo(0.14, -0.44);
  nose.lineTo(0, -0.56);
  nose.lineTo(-0.14, -0.44);
  nose.closePath();
  s.holes.push(nose);

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.52,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.028,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.center();
  return geo;
}

function createJawGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-0.62, 0.20);
  s.lineTo(-0.42, -0.04);
  s.lineTo(-0.26, 0.18);
  s.lineTo(-0.10, -0.04);
  s.lineTo(0.0, 0.16);
  s.lineTo(0.10, -0.04);
  s.lineTo(0.26, 0.18);
  s.lineTo(0.42, -0.04);
  s.lineTo(0.62, 0.20);
  s.lineTo(0.52, -0.34);
  s.lineTo(0.22, -0.58);
  s.lineTo(0.0, -0.64);
  s.lineTo(-0.22, -0.58);
  s.lineTo(-0.52, -0.34);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.022,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

function createStarPupilGeometry(points = 4, outer = 0.22, inner = 0.068): THREE.ShapeGeometry {
  const s = new THREE.Shape();
  const total = points * 2;
  for (let i = 0; i <= total; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / total) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  return new THREE.ShapeGeometry(s);
}

let cachedCranium: THREE.ExtrudeGeometry | null = null;
let cachedJaw: THREE.ExtrudeGeometry | null = null;
let cachedStar4: THREE.ShapeGeometry | null = null;
let cachedStar5: THREE.ShapeGeometry | null = null;

function getBlasterGeometries() {
  if (!cachedCranium) cachedCranium = createCraniumGeometry();
  if (!cachedJaw) cachedJaw = createJawGeometry();
  if (!cachedStar4) cachedStar4 = createStarPupilGeometry(4, 0.23, 0.065);
  if (!cachedStar5) cachedStar5 = createStarPupilGeometry(5, 0.23, 0.08);
  return { cranium: cachedCranium, jaw: cachedJaw, star4: cachedStar4, star5: cachedStar5 };
}

export const GasterBlaster3D: React.FC<GasterBlaster3DProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  charge = 0,
  beam = 0,
  beamLength = 26,
  beamRadius = 0.56,
  leftEyeColor = '#1AD1E8',
  rightEyeColor = '#F5D327',
  beamColorA = '#1AD1E8',
  beamColorB = '#F5D327',
  monochrome = false,
  time,
}) => {
  const geos = useMemo(() => getBlasterGeometries(), []);
  const beamMat = useMemo(
    () => createBlasterBeamMaterial(beamColorA, beamColorB),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  beamMat.uniforms.uTime.value = time;
  beamMat.uniforms.uIntensity.value = clamp(beam, 0, 1);
  beamMat.uniforms.uColorA.value.set(monochrome ? '#D8D8E0' : beamColorA);
  beamMat.uniforms.uColorB.value.set(monochrome ? '#FFFFFF' : beamColorB);

  const lEye = monochrome ? '#FFFFFF' : leftEyeColor;
  const rEye = monochrome ? '#FFFFFF' : rightEyeColor;

  const jawOpen = clamp(charge * 0.42 + beam * 0.78, 0, 1.15);
  // Crisp recoil UPWARD along +Y (opposite to the -Y firing beam!)
  const recoilY = beam * 0.34;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, recoilY, 0]}>
        {/* Sculpted Angular Upper Cranium */}
        <mesh geometry={geos.cranium}>
          <meshStandardMaterial
            color="#FCF9F2"
            roughness={0.32}
            metalness={0.08}
            emissive="#141620"
            emissiveIntensity={0.18}
          />
        </mesh>

        {/* Crisp Sumi Ink Cel Outline */}
        <mesh geometry={geos.cranium} scale={[1.045, 1.04, 1.06]}>
          <meshBasicMaterial color="#07070B" side={THREE.BackSide} />
        </mesh>

        {/* Sculpted Forehead Central Fissure + Brow Cracks */}
        <mesh position={[0, 0.76, 0.31]}>
          <boxGeometry args={[0.075, 0.96, 0.04]} />
          <meshBasicMaterial color="#09090E" />
        </mesh>
        <mesh position={[-0.48, 0.66, 0.31]} rotation={[0, 0, 0.36]}>
          <boxGeometry args={[0.045, 0.38, 0.03]} />
          <meshBasicMaterial color="#09090E" />
        </mesh>
        <mesh position={[0.48, 0.66, 0.31]} rotation={[0, 0, -0.36]}>
          <boxGeometry args={[0.045, 0.38, 0.03]} />
          <meshBasicMaterial color="#09090E" />
        </mesh>

        {/* Deep obsidian inner skull cavity behind eye sockets */}
        <mesh position={[0, 0.02, -0.02]}>
          <boxGeometry args={[1.64, 0.98, 0.40]} />
          <meshBasicMaterial color="#06060A" />
        </mesh>

        {/* Left glowing 4-point star pupil */}
        <mesh
          geometry={geos.star4}
          position={[-0.44, 0.08, 0.25]}
          rotation={[0, 0, time * 1.6 + charge * 2.2]}
          scale={0.85 + charge * 0.25 + beam * 0.2}
        >
          <meshBasicMaterial color={lEye} side={THREE.DoubleSide} />
        </mesh>

        {/* Right glowing 5-point star pupil */}
        <mesh
          geometry={geos.star5}
          position={[0.44, 0.08, 0.25]}
          rotation={[0, 0, -time * 1.2 - charge * 2.4]}
          scale={0.85 + charge * 0.25 + beam * 0.2}
        >
          <meshBasicMaterial color={rEye} side={THREE.DoubleSide} />
        </mesh>

        {/* Articulated Lower Jaw */}
        <group
          position={[0, -0.84 - jawOpen * 0.44, -0.02]}
          rotation={[jawOpen * 0.25, 0, 0]}
        >
          <mesh geometry={geos.jaw}>
            <meshStandardMaterial color="#F2EEE6" roughness={0.36} metalness={0.05} />
          </mesh>
          <mesh geometry={geos.jaw} scale={[1.06, 1.07, 1.08]}>
            <meshBasicMaterial color="#07070B" side={THREE.BackSide} />
          </mesh>
        </group>

        {/* Muzzle Plasma Core inside opened jaw */}
        {(charge > 0.06 || beam > 0.01) && (
          <mesh
            position={[0, -1.02 - jawOpen * 0.22, 0.08]}
            scale={0.18 + charge * 0.26 + beam * 0.34}
          >
            <sphereGeometry args={[0.64, 16, 16]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={clamp(charge * 0.85 + beam * 0.95, 0, 1)}
            />
          </mesh>
        )}

        {/* Sacred Geometry Charge Reticle perpendicular to firing direction (-Y) */}
        {charge > 0.05 && beam < 0.75 && (
          <group position={[0, -1.35, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh rotation={[0, 0, time * 2.5]} scale={1.75 - charge * 0.95}>
              <ringGeometry args={[0.82, 0.92, 36]} />
              <meshBasicMaterial
                color={lEye}
                transparent
                opacity={clamp(charge * (1 - beam), 0, 0.9)}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[0, 0, -time * 4.2]} scale={1.3 - charge * 0.65}>
              <ringGeometry args={[0.64, 0.72, 6]} />
              <meshBasicMaterial
                color={rEye}
                transparent
                opacity={clamp(charge * (1 - beam) * 0.85, 0, 0.85)}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* Volumetric GLSL Plasma Beam firing cleanly along local -Y! */}
      {beam > 0.01 && (
        <group position={[0, -1.15, 0.25]}>
          {/* Outer chromatic volumetric sheath */}
          <mesh position={[0, -beamLength / 2, 0]} material={beamMat} renderOrder={25}>
            <cylinderGeometry
              args={[
                beamRadius * (0.78 + 0.22 * beam),
                beamRadius * (0.98 + 0.25 * beam),
                beamLength,
                24,
                1,
                true,
              ]}
            />
          </mesh>

          {/* Razor-sharp incandescent white core */}
          <mesh position={[0, -beamLength / 2, 0]} renderOrder={26}>
            <cylinderGeometry
              args={[beamRadius * 0.34 * beam, beamRadius * 0.42 * beam, beamLength, 16, 1, true]}
            />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={clamp(beam * 0.94, 0, 1)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Expanding shock-rings travelling down the -Y beam */}
          {[0, 1, 2, 3].map((idx) => {
            const p = (time * 3.4 + idx * 0.25) % 1;
            const yPos = -p * Math.min(beamLength * 0.68, 13);
            const ringScale = (0.72 + p * 1.15) * beamRadius;
            return (
              <mesh
                key={idx}
                position={[0, yPos, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[ringScale, ringScale, 1]}
                renderOrder={27}
              >
                <torusGeometry args={[1.05, 0.07, 10, 32]} />
                <meshBasicMaterial
                  color={idx % 2 === 0 ? lEye : rEye}
                  transparent
                  opacity={(1 - p) * beam * 0.85}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};
