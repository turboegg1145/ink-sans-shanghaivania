import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createBrushRibbonMaterial } from '../shaders/brushRibbonShader';

export interface BroomieRibbon3DProps {
  /** Control points along the 3D calligraphy sweep */
  points: readonly [number, number, number][];
  width?: number;
  progress: number;
  tail: number;
  inkColor?: string;
  tipColor?: string;
  opacity?: number;
  time: number;
}

/** Build a flat twisted calligraphy ribbon BufferGeometry along a 3D CatmullRomCurve3 */
function buildRibbonGeometry(
  points: readonly [number, number, number][],
  width: number,
  segments = 72
): THREE.BufferGeometry {
  const vecs = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(vecs);
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const normals = new Float32Array((segments + 1) * 2 * 3);
  const uvs = new Float32Array((segments + 1) * 2 * 2);
  const indices: number[] = [];

  const up = new THREE.Vector3(0, 0, 1);
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const pt = curve.getPointAt(u);
    curve.getTangentAt(u, tangent).normalize();

    side.crossVectors(tangent, up);
    if (side.lengthSq() < 1e-4) {
      side.crossVectors(tangent, new THREE.Vector3(0, 1, 0));
    }
    side.normalize();
    normal.crossVectors(side, tangent).normalize();

    // Subtle calligraphy width modulation
    const halfW = width * 0.5 * (0.72 + 0.35 * Math.sin(u * Math.PI));

    const vIdx = i * 2;
    positions[vIdx * 3] = pt.x - side.x * halfW;
    positions[vIdx * 3 + 1] = pt.y - side.y * halfW;
    positions[vIdx * 3 + 2] = pt.z - side.z * halfW;

    positions[(vIdx + 1) * 3] = pt.x + side.x * halfW;
    positions[(vIdx + 1) * 3 + 1] = pt.y + side.y * halfW;
    positions[(vIdx + 1) * 3 + 2] = pt.z + side.z * halfW;

    normals[vIdx * 3] = normal.x;
    normals[vIdx * 3 + 1] = normal.y;
    normals[vIdx * 3 + 2] = normal.z;

    normals[(vIdx + 1) * 3] = normal.x;
    normals[(vIdx + 1) * 3 + 1] = normal.y;
    normals[(vIdx + 1) * 3 + 2] = normal.z;

    uvs[vIdx * 2] = u;
    uvs[vIdx * 2 + 1] = 0;
    uvs[(vIdx + 1) * 2] = u;
    uvs[(vIdx + 1) * 2 + 1] = 1;

    if (i < segments) {
      const a = vIdx;
      const b = vIdx + 1;
      const c = vIdx + 2;
      const d = vIdx + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

export const BroomieRibbon3D: React.FC<BroomieRibbon3DProps> = ({
  points,
  width = 1.25,
  progress,
  tail,
  inkColor = '#101118',
  tipColor = '#1AD1E8',
  opacity = 1,
  time,
}) => {
  const key = points.map((p) => p.join(',')).join('|') + ':' + width;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geometry = useMemo(() => buildRibbonGeometry(points, width, 80), [key]);
  const material = useMemo(() => createBrushRibbonMaterial(inkColor, tipColor), []);

  material.uniforms.uProgress.value = progress;
  material.uniforms.uTail.value = tail;
  material.uniforms.uTime.value = time;
  material.uniforms.uInkColor.value.set(inkColor);
  material.uniforms.uTipColor.value.set(tipColor);
  material.uniforms.uOpacity.value = opacity;

  if (opacity <= 0.01 || progress <= tail + 0.005) return null;

  return <mesh geometry={geometry} material={material} />;
};
