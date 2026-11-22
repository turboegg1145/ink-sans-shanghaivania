import * as THREE from 'three';

export const INK_WASH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const INK_WASH_FRAGMENT = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uPaperMix;       // 1.0 = warm Xuan paper, 0.0 = deep sumi void
  uniform float uMonochrome;     // 1.0 = stark black & white (Act VIII)
  uniform float uEnergy;         // smoothed musical energy [0..1]
  uniform float uInkBloom;       // radial ink-drop spread [0..1.5]
  uniform vec2 uBloomCenter;     // normalized [0..1]
  uniform vec3 uColorA;          // active primary vial color
  uniform vec3 uColorB;          // active secondary vial color
  uniform float uSpectrum;       // 1.0 = full iridescent prism waves (Act IX)
  uniform vec2 uResolution;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.56;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 3; i++) {
      v += amp * noise(p);
      p = rot * p * 2.04 + vec2(17.1, 31.7);
      amp *= 0.5;
    }
    return v;
  }

  vec3 prismColor(float t) {
    return 0.52 + 0.48 * cos(6.28318 * (t + vec3(0.00, 0.33, 0.67)));
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = (vUv - 0.5) * aspect;
    float t = uTime * 0.14;

    // Two-stage domain-warped sumi-e fluid ink (fast 3-octave SwiftShader-friendly fbm)
    vec2 q = vec2(
      fbm(uv * 2.2 + vec2(t * 0.65, -t * 0.35)),
      fbm(uv * 2.2 + vec2(-t * 0.45, t * 0.55) + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
      fbm(uv * 3.1 + 2.3 * q + vec2(1.7, 9.2) + t * 0.32),
      fbm(uv * 3.1 + 2.3 * q + vec2(8.3, 2.8) - t * 0.28)
    );
    float f = fbm(uv * 2.6 + 2.1 * r);
    float fineFbm = noise(uv * 9.5 + r * 1.8);

    // Xuan paper mulberry fibers + archival grain
    float fiberH = noise(vUv * vec2(190.0, 28.0)) * 0.5 + noise(vUv * vec2(30.0, 195.0)) * 0.5;
    float fineGrain = hash(floor(vUv * uResolution * 0.5));
    float paperTex = (fiberH - 0.5) * 0.055 + (fineGrain - 0.5) * 0.022;

    // Warm Xuan paper base (Act I / Act VIII)
    vec3 paperBase = vec3(0.955, 0.935, 0.892) + paperTex;
    float washCloud = smoothstep(0.36, 0.82, f);
    vec3 sumiInk = vec3(0.038, 0.040, 0.052);
    vec3 paperCol = mix(paperBase, mix(vec3(0.84, 0.815, 0.77), sumiInk, 0.18), washCloud * 0.45);

    // Deep Sumi Void base (combat acts) — rich dark obsidian so foreground character & danmaku pop!
    vec3 voidDeep = vec3(0.020, 0.022, 0.035);
    vec3 voidMid  = vec3(0.055, 0.062, 0.095);
    float filament = smoothstep(0.42, 0.82, f);
    float ridge = pow(clamp(1.0 - abs(r.x - r.y) * 2.6, 0.0, 1.0), 3.4);

    vec3 tintA = mix(uColorA, vec3(0.85), uMonochrome);
    vec3 tintB = mix(uColorB, vec3(0.45), uMonochrome);
    if (uSpectrum > 0.01) {
      vec3 specA = prismColor(f * 1.5 + uTime * 0.2);
      vec3 specB = prismColor(q.x * 1.7 - uTime * 0.16 + 0.35);
      tintA = mix(tintA, specA, uSpectrum);
      tintB = mix(tintB, specB, uSpectrum);
    }

    vec3 voidCol = mix(voidDeep, voidMid, filament);
    float paintStrength = (0.12 + 0.20 * uEnergy) * (1.0 - 0.80 * uMonochrome);
    voidCol += tintA * ridge * (0.24 + 0.30 * uEnergy) * (1.0 - 0.88 * uMonochrome);
    voidCol += tintB * smoothstep(0.56, 0.92, q.y * f) * paintStrength;
    float centerLift = exp(-dot(uv, uv) * 1.55);
    voidCol += mix(tintA, tintB, 0.5) * centerLift * (0.045 + 0.06 * uEnergy) * (1.0 - uMonochrome);
    voidCol += paperTex * 0.30;

    // Crisp calligraphic ink-drop bloom with feathered sumi capillary edge (NO muddy airbrush glow!)
    vec2 bUv = (vUv - uBloomCenter) * aspect;
    float bDist = length(bUv);
    float capillary = (f - 0.5) * 0.19 + (fineFbm - 0.5) * 0.11;
    float edgeCoord = bDist + capillary;
    float dropMask = 1.0 - smoothstep(uInkBloom - 0.025, uInkBloom + 0.012, edgeCoord);
    // Thin authentic wet-ink ring + delicate outer watercolor wash
    float outerWash = (1.0 - smoothstep(uInkBloom - 0.01, uInkBloom + 0.075, edgeCoord)) * (1.0 - dropMask);
    float thinRim = smoothstep(uInkBloom - 0.032, uInkBloom - 0.008, edgeCoord) * dropMask;

    vec3 col = mix(voidCol, paperCol, uPaperMix);
    if (uInkBloom > 0.001 && uPaperMix > 0.01) {
      vec3 wetInk = vec3(0.030, 0.032, 0.044) + tintA * (0.04 * (1.0 - uMonochrome)) * filament;
      // Subtle watery charcoal halo outside crisp ink edge
      col = mix(col, mix(vec3(0.16, 0.17, 0.22), tintA * 0.35, 0.32 * (1.0 - uMonochrome)), outerWash * 0.55 * uPaperMix);
      col = mix(col, wetInk, dropMask * uPaperMix);
      // Razor calligraphy pigment highlight right inside the wet edge
      col += mix(tintA, tintB, fineFbm) * thinRim * 0.52 * (1.0 - uMonochrome) * uPaperMix;
    }

    if (uMonochrome > 0.001) {
      float luma = dot(col, vec3(0.299, 0.587, 0.114));
      vec3 mono = mix(vec3(0.025, 0.025, 0.030), vec3(0.955, 0.940, 0.905), smoothstep(0.05, 0.95, luma));
      col = mix(col, mono, uMonochrome);
    }

    float vig = smoothstep(1.42, 0.38, length(uv));
    col *= mix(0.78, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createInkWashMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: INK_WASH_VERTEX,
    fragmentShader: INK_WASH_FRAGMENT,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uPaperMix: { value: 1.0 },
      uMonochrome: { value: 0.0 },
      uEnergy: { value: 0.2 },
      uInkBloom: { value: 0.0 },
      uBloomCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uColorA: { value: new THREE.Color('#1AD1E8') },
      uColorB: { value: new THREE.Color('#F5D327') },
      uSpectrum: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(1920, 1080) },
    },
  });
}
