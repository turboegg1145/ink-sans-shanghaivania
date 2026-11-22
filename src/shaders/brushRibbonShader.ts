import * as THREE from 'three';

export const BRUSH_RIBBON_VERTEX = /* glsl */ `
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

export const BRUSH_RIBBON_FRAGMENT = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  uniform float uProgress;   // [0..1] brush sweep head
  uniform float uTail;       // [0..1] brush sweep tail fade
  uniform float uTime;
  uniform vec3 uInkColor;    // base sumi or saturated vial color
  uniform vec3 uTipColor;    // luminous paint accent at bristle tips
  uniform float uOpacity;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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
    // Active span along ribbon length vUv.x
    float headMask = 1.0 - smoothstep(uProgress - 0.06, uProgress + 0.01, vUv.x);
    float tailMask = smoothstep(uTail - 0.02, uTail + 0.14, vUv.x);
    float span = headMask * tailMask;
    if (span < 0.01) discard;

    // Taper width at start and tip like calligraphy sumi brush
    float localT = clamp((vUv.x - uTail) / max(0.001, uProgress - uTail), 0.0, 1.0);
    float widthProfile = sin(localT * 3.14159) * 0.75 + 0.25;
    float edgeDist = abs(vUv.y - 0.5) * 2.0;

    // Dry-brush feibai (飞白) bristle grooves along vUv.y
    float bristles = noise(vec2(vUv.x * 16.0 - uTime * 1.4, vUv.y * 42.0));
    float fineBristles = noise(vec2(vUv.x * 38.0, vUv.y * 95.0));
    float bristleMask = smoothstep(widthProfile, widthProfile - 0.26, edgeDist + (bristles - 0.5) * 0.34);

    // Dry-brush streaks opening up near the trailing tail
    float drySplit = smoothstep(0.28 + (1.0 - localT) * 0.32, 0.72, bristles * 0.7 + fineBristles * 0.3);
    float alpha = span * bristleMask * mix(1.0, drySplit, (1.0 - localT) * 0.65) * uOpacity;
    if (alpha < 0.02) discard;

    // Color blends from rich sumi core to glowing paint rim & leading bristle tip
    vec3 viewDir = normalize(vViewPos);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.2);
    float tipGlow = smoothstep(0.62, 1.0, localT);

    vec3 col = mix(uInkColor, uTipColor, tipGlow * 0.78 + fresnel * 0.55);
    col += uTipColor * smoothstep(0.68, 0.96, edgeDist) * 0.45;
    col += vec3(1.0) * tipGlow * (1.0 - edgeDist) * 0.28;

    gl_FragColor = vec4(col, alpha);
  }
`;

export function createBrushRibbonMaterial(
  inkColor = '#12131A',
  tipColor = '#1AD1E8'
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: BRUSH_RIBBON_VERTEX,
    fragmentShader: BRUSH_RIBBON_FRAGMENT,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      uProgress: { value: 1.0 },
      uTail: { value: 0.0 },
      uTime: { value: 0 },
      uInkColor: { value: new THREE.Color(inkColor) },
      uTipColor: { value: new THREE.Color(tipColor) },
      uOpacity: { value: 1.0 },
    },
  });
}
