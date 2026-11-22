import React from 'react';
import { clamp } from '../core/math';

export interface DiegeticBattleHUDProps {
  /** 0..1 visibility (hidden during overture, quiet breaks, and hollow void!) */
  opacity: number;
  /** Player HP out of 92 (classic LV 19/20 feel) */
  hp: number;
  maxHp?: number;
  /** Karma / Ink poison drain segment */
  kr?: number;
  /** Monochrome styling */
  monochrome?: boolean;
  /** Bottom inset above letterbox */
  bottomPx?: number;
}

/**
 * Ultra-minimal, authentic Undertale diegetic HP strip.
 * Zero fake subtitles, zero telemetry clutter — only the iconic HP bar in crisp Silkscreen font.
 */
export const DiegeticBattleHUD: React.FC<DiegeticBattleHUDProps> = ({
  opacity,
  hp,
  maxHp = 92,
  kr = 0,
  monochrome = false,
  bottomPx = 76,
}) => {
  if (opacity <= 0.01) return null;

  const safeHp = clamp(hp, 1, maxHp);
  const safeKr = clamp(kr, 0, safeHp - 1);
  const yellowPct = ((safeHp - safeKr) / maxHp) * 100;
  const krPct = (safeKr / maxHp) * 100;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: bottomPx,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        opacity: clamp(opacity, 0, 1),
        fontFamily: '"Silkscreen", monospace',
        color: '#FAF7F0',
        letterSpacing: '0.06em',
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)',
        pointerEvents: 'none',
      }}
    >
      <span style={{ fontSize: 20, opacity: 0.92 }}>LV 19</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 16, opacity: 0.78 }}>HP</span>
        <div
          style={{
            width: 196,
            height: 20,
            backgroundColor: monochrome ? '#2A2A2E' : '#B81D33',
            border: '2px solid rgba(250, 247, 240, 0.78)',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${yellowPct}%`,
              minWidth: safeHp - safeKr > 0 ? 4 : 0,
              height: '100%',
              backgroundColor: monochrome ? '#F2EFE8' : '#F5D327',
            }}
          />
          {krPct > 0.2 && (
            <div
              style={{
                width: `${krPct}%`,
                height: '100%',
                backgroundColor: monochrome ? '#888890' : '#D946EF',
              }}
            />
          )}
        </div>
      </div>

      <span style={{ fontSize: 20, minWidth: 96, textAlign: 'right' }}>
        {Math.round(safeHp)} / {maxHp}
      </span>
    </div>
  );
};
