import React from 'react';
import { clamp } from '../core/math';

export interface CompositorOverlayProps {
  /** Sakuga 2-frame impact inversion [0..1] (pure anime flash frame on heavy hits) */
  impactFlash?: number;
  /** Pure white blinding peak flash [0..1] (used sparingly on major act transitions / final cut) */
  whiteFlash?: number;
  /** Cinematic letterbox bar height in px (0 = full 16:9, 76 = 2.15:1 widescreen) */
  letterboxPx?: number;
  /** Ink diagonal slash streak across screen (0 = none, 0..1 = sweep progress) */
  slashProgress?: number;
  slashAngleDeg?: number;
  slashColor?: string;
  /** Subtle monochrome desaturation vignette */
  monochrome?: number;
  /** Fade to black [0..1] */
  fadeBlack?: number;
}

/**
 * High-craft Anime/Sakuga Compositor Overlay:
 * - Zero constant screen shake
 * - Zero AI-slop mini-titles or HUD telemetry
 * - Pure optical craftsmanship: letterbox framing, razor brush slashes, impact frames
 */
export const CompositorOverlay: React.FC<CompositorOverlayProps> = ({
  impactFlash = 0,
  whiteFlash = 0,
  letterboxPx = 56,
  slashProgress = 0,
  slashAngleDeg = -18,
  slashColor = '#1AD1E8',
  monochrome = 0,
  fadeBlack = 0,
}) => {
  const lb = clamp(letterboxPx, 0, 140);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Diagonal Sakuga Brush / Knife Slash Cut */}
      {slashProgress > 0.01 && slashProgress < 0.99 && (
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <linearGradient id="slashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={slashColor} stopOpacity="0" />
              <stop offset="30%" stopColor={slashColor} stopOpacity="0.95" />
              <stop offset="55%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="85%" stopColor={slashColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g transform={`translate(960, 540) rotate(${slashAngleDeg})`}>
            {/* Wide glowing blade smear */}
            <ellipse
              cx={(slashProgress - 0.5) * 1600}
              cy={0}
              rx={Math.sin(slashProgress * Math.PI) * 1250}
              ry={Math.sin(slashProgress * Math.PI) * 26}
              fill="url(#slashGrad)"
            />
            {/* Razor white core */}
            <ellipse
              cx={(slashProgress - 0.5) * 1600}
              cy={0}
              rx={Math.sin(slashProgress * Math.PI) * 1180}
              ry={Math.sin(slashProgress * Math.PI) * 6.5}
              fill="#FFFFFF"
            />
          </g>
        </svg>
      )}

      {/* Sakuga High-Contrast Impact Inversion Frame (strictly 1-3 frames on decisive impacts!) */}
      {impactFlash > 0.05 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: `invert(${(impactFlash * 100).toFixed(0)}%) contrast(${(1 + impactFlash * 0.85).toFixed(2)})`,
            WebkitBackdropFilter: `invert(${(impactFlash * 100).toFixed(0)}%) contrast(${(1 + impactFlash * 0.85).toFixed(2)})`,
          }}
        />
      )}

      {/* Pure White Optical Peak Flash */}
      {whiteFlash > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: monochrome > 0.5 ? '#F5F2EB' : '#FFFFFF',
            opacity: clamp(whiteFlash, 0, 1),
          }}
        />
      )}

      {/* Cinematic Letterbox Framing */}
      {lb > 0.5 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: lb,
              backgroundColor: '#050508',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: lb,
              backgroundColor: '#050508',
            }}
          />
        </>
      )}

      {/* Final / Opening Black Fade */}
      {fadeBlack > 0.005 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#040406',
            opacity: clamp(fadeBlack, 0, 1),
          }}
        />
      )}
    </div>
  );
};
