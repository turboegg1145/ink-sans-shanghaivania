import React from 'react';
import { INK_VIALS } from '../core/palette';
import { clamp, seededRandom } from '../core/math';

export interface InkDropRippleProps {
  /** 0..1 progress of droplet falling & splashing into expanding concentric sumi rings */
  progress: number;
  cx?: number;
  cy?: number;
  color?: string;
  monochrome?: boolean;
}

/**
 * Minimalist Sumi-e Falling Ink Drop & Concentric Ripple (used in Act I overture & Act VIII hollow void).
 * Pure graphic restraint — zero clutter, maximum emotional weight.
 */
export const InkDropRipple: React.FC<InkDropRippleProps> = ({
  progress,
  cx = 960,
  cy = 540,
  color = '#111218',
  monochrome = false,
}) => {
  const p = clamp(progress, 0, 1);
  if (p <= 0.001 || p >= 0.999) return null;

  // Phase A (0..0.38): teardrop falls from top of frame to cy
  const fallT = clamp(p / 0.38, 0, 1);
  const fallEase = fallT * fallT * fallT; // accelerating gravity
  const dropY = -60 + (cy + 60) * fallEase;

  // Phase B (0.38..1.0): impact splash & concentric rings
  const impactT = clamp((p - 0.38) / 0.62, 0, 1);
  const rings = [0, 0.14, 0.28];

  const rng = seededRandom(7731);
  const droplets = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2 + (rng() - 0.5) * 0.25;
    const dist = 45 + rng() * 175;
    const r = 3.5 + rng() * 8.5;
    return { angle, dist, r };
  });

  const ringAccent = monochrome ? '#141418' : '#1AD1E8';

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* Falling Ink Teardrop */}
      {fallT < 1 && (
        <g transform={`translate(${cx}, ${dropY.toFixed(1)})`}>
          <path
            d={`M 0 ${-26 - fallT * 24} C 8 -10, 14 4, 14 14 A 14 14 0 1 1 -14 14 C -14 4, -8 -10, 0 ${-26 - fallT * 24} Z`}
            fill={color}
          />
          <ellipse cx="-4" cy="11" rx="3" ry="6" fill="rgba(255,255,255,0.45)" />
        </g>
      )}

      {/* Concentric Sumi Impact Ripples + Radial Droplets */}
      {impactT > 0 && (
        <g transform={`translate(${cx}, ${cy})`}>
          {rings.map((delay, idx) => {
            const rt = clamp((impactT - delay) / (1 - delay), 0, 1);
            if (rt <= 0) return null;
            const ease = 1 - Math.pow(1 - rt, 3);
            const radius = 14 + ease * (320 + idx * 140);
            const opacity = (1 - rt) * (idx === 0 ? 0.78 : 0.45);
            return (
              <circle
                key={idx}
                cx={0}
                cy={0}
                r={radius}
                fill="none"
                stroke={idx === 1 ? ringAccent : color}
                strokeWidth={Math.max(1.2, (1 - rt) * (idx === 0 ? 7 : 3.2))}
                opacity={opacity}
              />
            );
          })}

          {droplets.map((d, i) => {
            const ease = 1 - Math.pow(1 - impactT, 2.6);
            const x = Math.cos(d.angle) * d.dist * ease;
            const y = Math.sin(d.angle) * d.dist * ease;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={d.r * (1 - impactT * 0.55)}
                fill={i % 4 === 0 && !monochrome ? '#F5D327' : color}
                opacity={(1 - impactT) * 0.85}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
};

export interface VialMacroShowcaseProps {
  /** 0..1 visibility */
  opacity: number;
  /** Time in seconds for liquid slosh */
  time: number;
  /** Highlighted active vial index (0..7) or -1 */
  activeIndex: number;
  /** Fill levels for all 8 vials [0..1] */
  levels?: readonly number[];
  /** 0..1 crack/shatter progress for Act VIII */
  shatter?: number;
}

/**
 * Bespoke Design Showcase of Ink's 8 Translucent Glass Paint Vials:
 * Used during Act III (quiet dip) & Act VIII (draining hollow void) as a high-design graphic composition.
 */
export const VialMacroShowcase: React.FC<VialMacroShowcaseProps> = ({
  opacity,
  time,
  activeIndex,
  levels = [1, 1, 1, 1, 1, 1, 1, 1],
  shatter = 0,
}) => {
  if (opacity <= 0.01) return null;

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}
    >
      <defs>
        <filter id="vialMacroGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform="translate(960, 865)">
        {INK_VIALS.map((vial, idx) => {
          const offset = (idx - 3.5) * 96;
          const isActive = idx === activeIndex;
          const level = clamp(levels[idx] ?? 1, 0, 1);
          const lift = isActive ? -22 : Math.sin(time * 2.0 + idx * 0.7) * 4;
          const slosh = Math.sin(time * 3.4 + idx * 1.1) * 4;
          const crackDrift = shatter > 0.01 ? (idx % 2 === 0 ? 1 : -1) * shatter * 16 : 0;
          const liquidH = 74 * level;

          return (
            <g
              key={vial.id}
              transform={`translate(${offset.toFixed(1)}, ${(lift + Math.abs(crackDrift) * 0.3).toFixed(1)}) rotate(${(crackDrift * 0.7).toFixed(1)})`}
            >
              {/* Subtle glowing halo under active vial */}
              {isActive && level > 0.1 && (
                <ellipse
                  cx={0}
                  cy={14}
                  rx={30}
                  ry={52}
                  fill={vial.hex}
                  opacity={0.28}
                  filter="url(#vialMacroGlow)"
                />
              )}

              {/* Cork stopper */}
              <rect
                x={-13}
                y={-56}
                width={26}
                height={18}
                rx={4}
                fill="#B8905E"
                stroke="#0F0F14"
                strokeWidth={3}
              />

              {/* Glass bottle silhouette */}
              <rect
                x={-20}
                y={-38}
                width={40}
                height={96}
                rx={14}
                fill="rgba(240, 245, 255, 0.1)"
                stroke={isActive ? '#FFFFFF' : 'rgba(250, 247, 240, 0.65)'}
                strokeWidth={isActive ? 3.2 : 2.2}
              />

              {/* Sloshing liquid paint inside */}
              {level > 0.03 && (
                <clipPath id={`vialClip_${idx}`}>
                  <rect x={-17} y={-35} width={34} height={90} rx={11} />
                </clipPath>
              )}
              {level > 0.03 && (
                <g clipPath={`url(#vialClip_${idx})`}>
                  <path
                    d={`M -22 ${56 - liquidH + slosh}
                        Q 0 ${56 - liquidH - slosh} 22 ${56 - liquidH + slosh}
                        L 22 60 L -22 60 Z`}
                    fill={vial.hex}
                    opacity={isActive ? 0.96 : 0.78}
                  />
                  {/* Top liquid meniscus glint */}
                  <path
                    d={`M -16 ${56 - liquidH + slosh} Q 0 ${56 - liquidH - slosh} 16 ${56 - liquidH + slosh}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    opacity={0.65}
                  />
                </g>
              )}

              {/* Crack lines during Act VIII shatter */}
              {shatter > 0.1 && (
                <path
                  d="M -12 -18 L 2 -4 L -6 14 L 10 34"
                  fill="none"
                  stroke="#FAF7F0"
                  strokeWidth={2}
                  opacity={clamp(shatter * 1.4, 0, 0.9)}
                />
              )}

              {/* Specular glass reflection streak */}
              <line
                x1={-11}
                y1={-26}
                x2={-11}
                y2={38}
                stroke="#FFFFFF"
                strokeWidth={2.6}
                strokeLinecap="round"
                opacity={0.55}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export interface InkSplashBurstProps {
  /** 0..1 animation progress of radial splatter burst */
  progress: number;
  cx: number;
  cy: number;
  color: string;
  secondaryColor?: string;
  seed?: number;
  scale?: number;
}

/** Crisp graphic-design sumi-e ink splatter burst triggered strictly on major beat impacts */
export const InkSplashBurst: React.FC<InkSplashBurstProps> = ({
  progress,
  cx,
  cy,
  color,
  secondaryColor = '#0E0F15',
  seed = 101,
  scale = 1,
}) => {
  const p = clamp(progress, 0, 1);
  if (p <= 0.005 || p >= 0.995) return null;

  const rng = seededRandom(seed);
  const ease = 1 - Math.pow(1 - p, 3.2);
  const fade = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;

  const streaks = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2 + (rng() - 0.5) * 0.22;
    const len = (90 + rng() * 240) * scale;
    const w = (4 + rng() * 11) * scale;
    const useAlt = rng() > 0.62;
    return { a, len, w, useAlt };
  });

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: fade }}
    >
      <g transform={`translate(${cx}, ${cy})`}>
        {streaks.map((s, idx) => {
          const r0 = 26 * ease * scale;
          const r1 = (26 + s.len) * ease;
          const x0 = Math.cos(s.a) * r0;
          const y0 = Math.sin(s.a) * r0;
          const x1 = Math.cos(s.a) * r1;
          const y1 = Math.sin(s.a) * r1;
          return (
            <g key={idx}>
              <line
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                stroke={s.useAlt ? secondaryColor : color}
                strokeWidth={s.w * (1 - p * 0.5)}
                strokeLinecap="round"
              />
              <circle
                cx={Math.cos(s.a) * (r1 + 18 * scale)}
                cy={Math.sin(s.a) * (r1 + 18 * scale)}
                r={s.w * 0.55 * (1 - p * 0.4)}
                fill={s.useAlt ? secondaryColor : color}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
