import React, { useMemo } from 'react';
import { createInkWashMaterial } from '../shaders/inkWashShader';

export interface InkWashBackdrop3DProps {
  time: number;
  paperMix: number;
  monochrome: number;
  energy: number;
  inkBloom?: number;
  bloomCenter?: [number, number];
  colorA: string;
  colorB: string;
  spectrum?: number;
}

export const InkWashBackdrop3D: React.FC<InkWashBackdrop3DProps> = ({
  time,
  paperMix,
  monochrome,
  energy,
  inkBloom = 0,
  bloomCenter = [0.5, 0.5],
  colorA,
  colorB,
  spectrum = 0,
}) => {
  const mat = useMemo(() => createInkWashMaterial(), []);

  mat.uniforms.uTime.value = time;
  mat.uniforms.uPaperMix.value = paperMix;
  mat.uniforms.uMonochrome.value = monochrome;
  mat.uniforms.uEnergy.value = energy;
  mat.uniforms.uInkBloom.value = inkBloom;
  mat.uniforms.uBloomCenter.value.set(bloomCenter[0], bloomCenter[1]);
  mat.uniforms.uColorA.value.set(colorA);
  mat.uniforms.uColorB.value.set(colorB);
  mat.uniforms.uSpectrum.value = spectrum;

  return (
    <mesh renderOrder={-1000} frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};
