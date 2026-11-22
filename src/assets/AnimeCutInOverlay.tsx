import React from 'react';
import { InkEyeStyle, InkSansRig } from './InkSansRig';
import { clamp, easeOutExpo } from '../core/math';

export interface AnimeCutInProps {
  /** 0..1 lifecycle progress (snaps open sharply, holds, zips shut cleanly!) */
  progress: number;
  eyeStyle: InkEyeStyle;
  accentColor: string;
  secondaryColor?: string;
  angleDeg?: number;
  time: number;
  /** Optional flip direction */
  flip?: boolean;
}

/**
 * Pure Sakuga Anime Close-Up Eye Cut-In Panel:
 * Razor-sharp diagonal manga panel slashing across the frame for ~28 frames on major phase awakenings,
 * showcasing an intense hyper-zoomed close-up of Ink!Sans's glowing eyes & speedlines.
 * ZERO text / ZERO AI-slop subtitles!
 */
export const AnimeCutInOverlay: React.FC<AnimeCutInProps> = ({
  progress,
  eyeStyle,
  accentColor,
  secondaryColor = '#F5D327',
  angleDeg = -8,
  time,
  flip = false,
}) => {
  const p = clamp(progress, 0, 1);
  if (p <= 0.005 || p >= 0.995) return null;

  // Snappy anime entry (0..0.18), tight dramatic hold (0.18..0.78), whip exit (0.78..1.0)
  const enter = easeOutExpo(clamp(p / 0.18, 0, 1));
  const exit = 1 - clamp((p - 0.78) / 0.22, 0, 1) ** 2;
  const bandHeight = enter * exit * 280; // px tall diagonal banner
  const slideX = (1 - enter) * (flip ? 220 : -220) + (1 - exit) * (flip ? -260 : 260);

  if (bandHeight < 2) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: 2400,
          height: bandHeight,
          transform: `rotate(${angleDeg}deg)`,
          backgroundColor: '#07070D',
          borderTop: `5px solid ${accentColor}`,
          borderBottom: `5px solid ${secondaryColor}`,
          boxShadow: `0 0 42px ${accentColor}88`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* High-speed anime diagonal speedlines inside the cut-in */}
        <svg
          width="2400"
          height="320"
          viewBox="0 0 2400 320"
          style={{ position: 'absolute', inset: 0, opacity: 0.42 }}
        >
          {Array.from({ length: 24 }, (_, i) => {
            const y = (i / 24) * 320;
            const xShift = ((time * 2400 + i * 197) % 2400) - 400;
            const w = 160 + (i % 5) * 90;
            return (
              <rect
                key={i}
                x={xShift}
                y={y}
                width={w}
                height={i % 3 === 0 ? 4 : 2}
                fill={i % 2 === 0 ? accentColor : '#FFFFFF'}
              />
            );
          })}
        </svg>

        {/* Hyper-zoomed dramatic close-up of Ink!Sans's skull & glowing eyes! */}
        <div
          style={{
            transform: `translate(${slideX.toFixed(1)}px, 315px) scale(2.45)`,
          }}
        >
          <InkSansRig
            time={time}
            pose="brushReady"
            eyeStyle={eyeStyle}
            brushPaintColor={accentColor}
            rimColor={accentColor}
            rimIntensity={0.8}
            flipX={flip}
            size={620}
          />
        </div>
      </div>
    </div>
  );
};
