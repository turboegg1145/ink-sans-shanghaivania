import * as THREE from 'three';

export const BLASTER_BEAM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const BLASTER_BEAM_FRAGMENT = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(41.1, 289.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPos);
    float ndv = abs(dot(N, V));

    // Incandescent pure white core + high-velocity plasma/ink streaks
    float streak1 = noise(vec2(vUv.x * 8.0, vUv.y * 6.0 - uTime * 14.0));
    float streak2 = noise(vec2(vUv.x * 20.0 + 3.1, vUv.y * 14.0 - uTime * 22.0));
    float energy = streak1 * 0.65 + streak2 * 0.35;

    float core = pow(ndv, 1.6);
    float sheath = pow(ndv, 0.55);

    vec3 outerCol = mix(uColorA, uColorB, sin(vUv.y * 12.0 - uTime * 10.0) * 0.5 + 0.5);
    vec3 col = mix(outerCol * (1.2 + energy * 0.9), vec3(1.0, 0.99, 0.97), smoothstep(0.38, 0.85, core));

    // Soft muzzle ramp & far fade
    float endFade = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    float alpha = clamp(sheath * (0.72 + 0.35 * energy) * uIntensity * endFade, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`;

export function createBlasterBeamMaterial(
  colorA = '#1AD1E8',
  colorB = '#F5D327'
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: BLASTER_BEAM_VERTEX,
    fragmentShader: BLASTER_BEAM_FRAGMENT,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
    },
  });
}
