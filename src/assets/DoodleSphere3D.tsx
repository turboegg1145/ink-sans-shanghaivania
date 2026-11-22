import React, { useMemo } from 'react';
import * as THREE from 'three';
import { seededRandom } from '../core/math';
import { INK_VIALS } from '../core/palette';

export interface DoodleSphere3DProps {
  time: number;
  energy: number;
  monochrome?: number;
  turbulence?: number;
  opacity?: number;
  accentColorA?: string;
  accentColorB?: string;
}

/** Generate 6 bespoke hand-inked procedural AU sketch textures (color & strict monochrome variants) */
function createSketchTextures(mono: boolean): THREE.CanvasTexture[] {
  const textures: THREE.CanvasTexture[] = [];
  const W = 256;
  const H = 340;

  for (let variant = 0; variant < 6; variant++) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    ctx.fillStyle = mono ? '#ECEAE4' : '#F5EFE2';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(22, 22, 30, 0.24)';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, W - 28, H - 28);

    ctx.strokeStyle = 'rgba(40, 45, 60, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 36; y < H - 24; y += 22) {
      ctx.beginPath();
      ctx.moveTo(22, y);
      ctx.lineTo(W - 22, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#181922';
    ctx.fillStyle = '#181922';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (variant === 0) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(28, 230);
      ctx.lineTo(82, 128);
      ctx.lineTo(126, 168);
      ctx.lineTo(174, 96);
      ctx.lineTo(228, 230);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(128, 72, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(40 + i * 14, 245);
        ctx.lineTo(54 + i * 14, 275);
        ctx.stroke();
      }
    } else if (variant === 1) {
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(128, 168, 74, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(128, 168, 52, 0, Math.PI * 2);
      ctx.stroke();
      for (let k = 0; k < 2; k++) {
        ctx.beginPath();
        for (let i = 0; i <= 4; i++) {
          const a = (i * Math.PI) / 2 + (k * Math.PI) / 4;
          const x = 128 + Math.cos(a) * 72;
          const y = 168 + Math.sin(a) * 72;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = mono ? '#181922' : '#1AD1E8';
      ctx.beginPath();
      ctx.arc(128, 168, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (variant === 2) {
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(128, 222);
      ctx.bezierCurveTo(60, 175, 58, 118, 96, 108);
      ctx.bezierCurveTo(116, 104, 128, 124, 128, 134);
      ctx.bezierCurveTo(128, 124, 140, 104, 160, 108);
      ctx.bezierCurveTo(198, 118, 196, 175, 128, 222);
      ctx.stroke();
      ctx.fillStyle = mono ? 'rgba(24, 24, 28, 0.16)' : 'rgba(230, 46, 77, 0.25)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(128 + Math.cos(a) * 64, 164 + Math.sin(a) * 64);
        ctx.lineTo(128 + Math.cos(a) * 86, 164 + Math.sin(a) * 86);
        ctx.stroke();
      }
    } else if (variant === 3) {
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(128, 84);
      ctx.quadraticCurveTo(192, 108, 184, 186);
      ctx.lineTo(160, 232);
      ctx.lineTo(142, 206);
      ctx.lineTo(128, 228);
      ctx.lineTo(114, 206);
      ctx.lineTo(96, 232);
      ctx.lineTo(72, 186);
      ctx.quadraticCurveTo(64, 108, 128, 84);
      ctx.stroke();
      ctx.fillStyle = '#181922';
      ctx.beginPath();
      ctx.ellipse(104, 158, 14, 18, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(152, 158, 14, 18, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = mono ? '#D8D8D8' : '#F5D327';
      ctx.beginPath();
      ctx.arc(152, 158, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (variant === 4) {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(52, 268);
      ctx.quadraticCurveTo(132, 148, 204, 72);
      ctx.stroke();
      ctx.lineWidth = 12;
      ctx.strokeStyle = 'rgba(24, 25, 34, 0.85)';
      ctx.beginPath();
      ctx.moveTo(46, 134);
      ctx.bezierCurveTo(105, 84, 155, 225, 212, 178);
      ctx.stroke();
      ctx.fillStyle = mono ? '#181922' : '#9B4DFF';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(68 + i * 21, 110 + Math.sin(i * 2.1) * 58, 3 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.lineWidth = 3;
      ctx.strokeRect(58, 102, 140, 140);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(44, 88);
      ctx.lineTo(212, 256);
      ctx.moveTo(212, 88);
      ctx.lineTo(44, 256);
      ctx.stroke();
      ctx.fillStyle = mono ? 'rgba(24, 24, 28, 0.14)' : 'rgba(245, 130, 31, 0.28)';
      ctx.fillRect(92, 136, 72, 72);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    textures.push(tex);
  }

  return textures;
}

interface PageDatum {
  xBase: number;
  yBase: number;
  zBase: number;
  orbitR: number;
  theta: number;
  speed: number;
  rotOffset: [number, number, number];
  scale: number;
  variant: number;
  bobPhase: number;
}

interface DropletDatum {
  radius: number;
  theta: number;
  yBase: number;
  speed: number;
  size: number;
  colorIdx: number;
}

export const DoodleSphere3D: React.FC<DoodleSphere3DProps> = ({
  time,
  energy,
  monochrome = 0,
  turbulence = 0,
  opacity = 1,
  accentColorA = '#1AD1E8',
  accentColorB = '#F5D327',
}) => {
  const colorTextures = useMemo(() => createSketchTextures(false), []);
  const monoTextures = useMemo(() => createSketchTextures(true), []);
  const textures = monochrome > 0.5 ? monoTextures : colorTextures;

  const pageGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1.45, 1.95, 6, 8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 1.4) * 0.14 + Math.cos(y * 1.1) * 0.08;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Strictly staged in background hemisphere (z between -4.5 and -22) so pages NEVER photobomb foreground Battle Box!
  const pages = useMemo<PageDatum[]>(() => {
    const rng = seededRandom(20260409);
    const arr: PageDatum[] = [];
    for (let i = 0; i < 42; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const xBase = side * (4.2 + rng() * 14.5);
      const yBase = (rng() - 0.5) * 14.5;
      const zBase = -4.8 - rng() * 14.5;
      arr.push({
        xBase,
        yBase,
        zBase,
        orbitR: 0.6 + rng() * 1.4,
        theta: rng() * Math.PI * 2,
        speed: (0.14 + rng() * 0.22) * (rng() > 0.5 ? 1 : -1),
        rotOffset: [(rng() - 0.5) * 0.7, (rng() - 0.5) * 1.2, (rng() - 0.5) * 0.45],
        scale: 0.62 + rng() * 0.85,
        variant: i % 6,
        bobPhase: rng() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  const droplets = useMemo<DropletDatum[]>(() => {
    const rng = seededRandom(99103);
    const arr: DropletDatum[] = [];
    for (let i = 0; i < 48; i++) {
      arr.push({
        radius: 5.5 + rng() * 11,
        theta: rng() * Math.PI * 2,
        yBase: (rng() - 0.5) * 11,
        speed: (0.08 + rng() * 0.14) * (rng() > 0.5 ? 1 : -1),
        size: 0.06 + rng() * 0.13,
        colorIdx: i % INK_VIALS.length,
      });
    }
    return arr;
  }, []);

  if (opacity <= 0.01) return null;

  const pageTint = monochrome > 0.5 ? '#DEDCD6' : '#FFFDF8';

  return (
    <group>
      {/* Background Hemisphere Floating AU Sketchbook Pages */}
      {pages.map((p, idx) => {
        const a = p.theta + time * p.speed * (1 + turbulence * 1.8);
        const x = p.xBase + Math.cos(a) * p.orbitR * (1 + turbulence);
        const y = p.yBase + Math.sin(time * 0.7 + p.bobPhase) * (0.55 + energy * 0.3);
        const z = Math.min(-3.8, p.zBase + Math.sin(a) * p.orbitR);

        return (
          <mesh
            key={idx}
            geometry={pageGeo}
            position={[x, y, z]}
            rotation={[
              p.rotOffset[0] + Math.sin(time * 0.45 + p.bobPhase) * (0.16 + turbulence * 0.3),
              p.rotOffset[1] + Math.cos(time * 0.25 + p.bobPhase) * (0.35 + turbulence * 0.6),
              p.rotOffset[2] + Math.cos(time * 0.35 + p.bobPhase) * 0.14,
            ]}
            scale={p.scale}
          >
            <meshStandardMaterial
              map={textures[p.variant]}
              color={pageTint}
              roughness={0.85}
              metalness={0.0}
              transparent
              opacity={opacity * 0.88}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Floating Zero-Gravity Paint & Sumi Ink Droplets (kept behind z = -1.5) */}
      {droplets.map((d, idx) => {
        const a = d.theta + time * d.speed * (1 + turbulence * 2.2);
        const x = Math.cos(a) * d.radius;
        const z = -Math.abs(Math.sin(a)) * 10.0 - 1.8;
        const y = d.yBase + Math.sin(time * 1.05 + idx) * 0.55;
        const col =
          monochrome > 0.65
            ? idx % 3 === 0
              ? '#E2E0DA'
              : '#141418'
            : idx % 3 === 0
              ? '#111219'
              : idx % 2 === 0
                ? accentColorA
                : idx % 5 === 0
                  ? accentColorB
                  : INK_VIALS[d.colorIdx].hex;

        return (
          <mesh
            key={`drop-${idx}`}
            position={[x, y, z]}
            scale={[d.size, d.size * (1.0 + energy * 0.3), d.size]}
          >
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={col}
              emissive={col}
              emissiveIntensity={col === '#111219' || monochrome > 0.65 ? 0.06 : 0.62}
              roughness={0.22}
              metalness={0.12}
              transparent
              opacity={opacity * 0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
};
