import React from 'react';
import { Img, staticFile } from 'remotion';
import { clamp } from '../core/math';

export interface DimensionalRiftLayerProps {
  /** 0 = closed, 1 = wide open diagonal tear revealing the classic pixel world */
  openAmount: number;
  time: number;
  showMiss?: boolean;
  angleDeg?: number;
}

/**
 * Surgical Dimensional Rift (Act VI centerpiece):
 * A jagged sumi-ink brush slash tears open the 3D canvas, revealing the authentic
 * retro 2D pixel Ink!Sans Fight substrate cleanly framed inside the tear.
 */
export const DimensionalRiftLayer: React.FC<DimensionalRiftLayerProps> = ({
  openAmount,
  time,
  showMiss = false,
  angleDeg = -11,
}) => {
  const amt = clamp(openAmount, 0, 1);
  if (amt <= 0.005) return null;

  const halfBand = amt * 38; // % of viewport height
  const skew = Math.tan((angleDeg * Math.PI) / 180) * 16;
  const topLeft = clamp(50 - halfBand - skew, 2, 98);
  const topRight = clamp(50 - halfBand + skew, 2, 98);
  const botRight = clamp(50 + halfBand + skew, 2, 98);
  const botLeft = clamp(50 + halfBand - skew, 2, 98);

  const bob = Math.sin(time * 5.2) * 4;
  const blasterPulse = Math.sin(time * 9.0) > 0;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Clipped Retro 2D Undertale Pixel Dimension */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000000',
          clipPath: `polygon(0% ${topLeft}%, 100% ${topRight}%, 100% ${botRight}%, 0% ${botLeft}%)`,
          overflow: 'hidden',
        }}
      >
        {/* Subtle authentic CRT scanlines strictly inside the retro tear */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.032) 0px, rgba(255,255,255,0.032) 2px, transparent 2px, transparent 6px)',
          }}
        />

        {/* Iconic MISS pixel stamp cleanly framed inside upper tear */}
        {showMiss && (
          <Img
            src={staticFile('sprites/rift/miss.png')}
            style={{
              position: 'absolute',
              left: '50%',
              top: '21.5%',
              transform: 'translate(-50%, -50%)',
              width: 210,
              height: 50,
              imageRendering: 'pixelated',
            }}
          />
        )}

        {/* Retro 2D Pixel Ink!Sans assembled at exact v0.39 proportions */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '41.5%',
            transform: `translate(-50%, -50%) translateY(${bob.toFixed(1)}px) scale(0.84)`,
            width: 392,
            height: 410,
            imageRendering: 'pixelated',
          }}
        >
          <Img
            src={staticFile('sprites/rift/ink_legs.png')}
            style={{
              position: 'absolute',
              left: 108,
              top: 256,
              width: 176,
              height: 136,
              imageRendering: 'pixelated',
            }}
          />
          <Img
            src={staticFile(showMiss ? 'sprites/rift/ink_body_slash.png' : 'sprites/rift/ink_body_idle.png')}
            style={{
              position: 'absolute',
              left: 0,
              top: -8,
              width: 392,
              height: 600,
              imageRendering: 'pixelated',
            }}
          />
          <Img
            src={staticFile('sprites/rift/ink_head_classic.png')}
            style={{
              position: 'absolute',
              left: 132,
              top: 64,
              width: 128,
              height: 120,
              imageRendering: 'pixelated',
            }}
          />
        </div>

        {/* Twin flanking retro pixel Ink Gaster Blasters */}
        <Img
          src={staticFile(blasterPulse ? 'sprites/rift/ink_blaster_open.png' : 'sprites/rift/ink_blaster_closed.png')}
          style={{
            position: 'absolute',
            left: '22%',
            top: '42%',
            width: 160,
            height: 208,
            transform: 'translate(-50%, -50%) rotate(-16deg)',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 10px rgba(26, 209, 232, 0.72))',
          }}
        />
        <Img
          src={staticFile(blasterPulse ? 'sprites/rift/ink_blaster_open.png' : 'sprites/rift/ink_blaster_closed.png')}
          style={{
            position: 'absolute',
            left: '78%',
            top: '42%',
            width: 160,
            height: 208,
            transform: 'translate(-50%, -50%) rotate(16deg) scaleX(-1)',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 10px rgba(245, 211, 39, 0.72))',
          }}
        />

        {/* Classic Undertale Battle Box */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '65.5%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            height: 152,
            border: '5px solid #FFFFFF',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('sprites/rift/soul_red.png')}
            style={{ width: 28, height: 28, imageRendering: 'pixelated' }}
          />
        </div>

        {/* Classic Orange Battle Action Strip — cleanly inside lower tear */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '79.5%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            gap: 44,
            imageRendering: 'pixelated',
          }}
        >
          {['btn_fight.png', 'btn_act.png', 'btn_item.png', 'btn_mercy.png'].map((btn) => (
            <Img
              key={btn}
              src={staticFile(`sprites/rift/${btn}`)}
              style={{ width: 168, height: 64, imageRendering: 'pixelated' }}
            />
          ))}
        </div>
      </div>

      {/* Crisp Glowing Ink-Edge Border + Scattered Pixel Fragments along the Tear */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <filter id="riftEdgeGlow">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1={0}
          y1={(topLeft / 100) * 1080}
          x2={1920}
          y2={(topRight / 100) * 1080}
          stroke="#1AD1E8"
          strokeWidth={7}
          filter="url(#riftEdgeGlow)"
        />
        <line
          x1={0}
          y1={(topLeft / 100) * 1080}
          x2={1920}
          y2={(topRight / 100) * 1080}
          stroke="#FFFFFF"
          strokeWidth={2.5}
        />
        <line
          x1={0}
          y1={(botLeft / 100) * 1080}
          x2={1920}
          y2={(botRight / 100) * 1080}
          stroke="#F5D327"
          strokeWidth={7}
          filter="url(#riftEdgeGlow)"
        />
        <line
          x1={0}
          y1={(botLeft / 100) * 1080}
          x2={1920}
          y2={(botRight / 100) * 1080}
          stroke="#FFFFFF"
          strokeWidth={2.5}
        />

        {/* Crisp detached pixel squares floating right along the dimensional seam */}
        {Array.from({ length: 14 }, (_, i) => {
          const u = (i + 0.5) / 14;
          const x = u * 1920;
          const isTop = i % 2 === 0;
          const yBase = isTop
            ? ((topLeft + (topRight - topLeft) * u) / 100) * 1080
            : ((botLeft + (botRight - botLeft) * u) / 100) * 1080;
          const drift = Math.sin(time * 3.5 + i * 1.9) * 14 + (isTop ? -18 : 18);
          const sz = 7 + (i % 3) * 4;
          return (
            <rect
              key={i}
              x={x - sz / 2}
              y={yBase + drift - sz / 2}
              width={sz}
              height={sz}
              fill={isTop ? '#1AD1E8' : '#F5D327'}
              opacity={0.85}
            />
          );
        })}
      </svg>
    </div>
  );
};
