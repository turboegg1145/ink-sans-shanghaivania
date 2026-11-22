import React from 'react';
import { INK_VIALS, PALETTE } from '../core/palette';
import { clamp } from '../core/math';

export type InkEyeStyle =
  | 'classic'
  | 'starBurst'
  | 'excited'
  | 'heart'
  | 'purple'
  | 'target'
  | 'glitchX'
  | 'phase3'
  | 'void'
  | 'prismatic';

export type InkPose =
  | 'idle'
  | 'brushReady'
  | 'slashSweep'
  | 'vialInspect'
  | 'conductorCast'
  | 'voidStand'
  | 'overdriveAscend';

export interface InkSansRigProps {
  time: number;
  beat?: number;
  pose?: InkPose;
  eyeStyle?: InkEyeStyle;
  brushPaintColor?: string;
  vialLevels?: readonly number[];
  monochrome?: number;
  blink?: number;
  brushAngleOffset?: number;
  headTilt?: number;
  flipX?: boolean;
  size?: number;
  rimColor?: string;
  rimIntensity?: number;
}

function starPath(cx: number, cy: number, points: number, outer: number, inner: number, rotDeg = 0): string {
  const total = points * 2;
  const rad0 = (rotDeg * Math.PI) / 180;
  let d = '';
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rad0 + (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d + 'Z';
}

function heartPath(cx: number, cy: number, s: number): string {
  return `M ${cx} ${cy + s * 0.95}
    C ${cx - s * 1.15} ${cy + s * 0.2}, ${cx - s * 1.15} ${cy - s * 0.85}, ${cx - s * 0.48} ${cy - s * 0.85}
    C ${cx - s * 0.14} ${cy - s * 0.85}, ${cx} ${cy - s * 0.52}, ${cx} ${cy - s * 0.36}
    C ${cx} ${cy - s * 0.52}, ${cx + s * 0.14} ${cy - s * 0.85}, ${cx + s * 0.48} ${cy - s * 0.85}
    C ${cx + s * 1.15} ${cy - s * 0.85}, ${cx + s * 1.15} ${cy + s * 0.2}, ${cx} ${cy + s * 0.95} Z`;
}

/**
 * Studio-Grade Original Cel-Shaded / Sumi-e Ink!Sans Multi-Part Character Rig:
 * - Sculpted anime skeleton anatomy (expressive brow/cheekbones, cel-shadow planes, articulated phalange hands)
 * - Dynamic contrapposto combat stance, billowing layered scarf with sumi brushwork folds
 * - 8 gleaming glass paint vials on buckled leather sash (individually drainable in Act VIII)
 * - Legendary Broomie giant paintbrush with painted aura wisps & animated dripping ink
 */
export const InkSansRig: React.FC<InkSansRigProps> = ({
  time,
  beat = 0,
  pose = 'idle',
  eyeStyle = 'classic',
  brushPaintColor = '#1AD1E8',
  vialLevels = [1, 1, 1, 1, 1, 1, 1, 1],
  monochrome = 0,
  blink = 0,
  brushAngleOffset = 0,
  headTilt = 0,
  flipX = false,
  size = 640,
  rimColor = '#1AD1E8',
  rimIntensity = 0.45,
}) => {
  const breathe = Math.sin(time * 2.3) * 3.2 + beat * 2.0;
  const wind = time * 3.1;

  const poseCfg = {
    idle:            { torsoRot: -1.5, headY: 0,  headR: 3,   lArmR: 12,  rArmR: -16, brushR: -28, brushX: 8,   brushY: 4,   hoverY: 0,   smirk: 0.3 },
    brushReady:      { torsoRot: -5.5, headY: -2, headR: -5,  lArmR: 34,  rArmR: -52, brushR: 20,  brushX: 38,  brushY: -24, hoverY: -4,  smirk: 0.8 },
    slashSweep:      { torsoRot: 11,   headY: -4, headR: 10,  lArmR: 54,  rArmR: -86, brushR: 78,  brushX: 68,  brushY: -8,  hoverY: -10, smirk: 1.0 },
    vialInspect:     { torsoRot: -3.5, headY: 2,  headR: -12, lArmR: -22, rArmR: 26,  brushR: -40, brushX: -14, brushY: 16,  hoverY: 2,   smirk: 0.2 },
    conductorCast:   { torsoRot: -3,   headY: -5, headR: -4,  lArmR: 68,  rArmR: -72, brushR: 32,  brushX: 46,  brushY: -36, hoverY: -12, smirk: 0.9 },
    voidStand:       { torsoRot: 0,    headY: 6,  headR: 4,   lArmR: 4,   rArmR: -4,  brushR: -38, brushX: -6,  brushY: 16,  hoverY: 0,   smirk: 0.0 },
    overdriveAscend: { torsoRot: -6,   headY: -8, headR: -7,  lArmR: 78,  rArmR: -80, brushR: 50,  brushX: 54,  brushY: -44, hoverY: -20, smirk: 1.0 },
  }[pose];

  const torsoRot = poseCfg.torsoRot + Math.sin(time * 1.4) * 1.3;
  const headRot = poseCfg.headR + headTilt + Math.cos(time * 1.8) * 1.5;
  const brushTotalRot = poseCfg.brushR + brushAngleOffset + Math.sin(time * 2.0) * 1.8;
  const hover = poseCfg.hoverY + Math.sin(time * 1.85) * (pose === 'overdriveAscend' ? 8 : 3.2);

  // Flowing multi-harmonic scarf wind waves (sweeping dramatically to the right & left)
  const w1 = Math.sin(wind) * 18;
  const w2 = Math.sin(wind - 1.15) * 30;
  const w3 = Math.sin(wind - 2.3) * 40;
  const w4 = Math.cos(wind - 0.8) * 16;
  const w5 = Math.cos(wind - 2.0) * 28;

  const eyeScaleY = clamp(1 - blink * 0.92, 0.08, 1);

  const renderPupils = () => {
    if (eyeStyle === 'void') return null;

    if (eyeStyle === 'phase3') {
      return (
        <g filter="url(#inkEyeGlow)">
          <ellipse cx="-26" cy="-148" rx="10" ry="5" fill="#FF1E42" />
          <ellipse cx="-26" cy="-148" rx="4.5" ry="2.2" fill="#FFF2F4" />
          <ellipse cx="26" cy="-148" rx="10" ry="5" fill="#FF1E42" />
          <ellipse cx="26" cy="-148" rx="4.5" ry="2.2" fill="#FFF2F4" />
        </g>
      );
    }

    if (eyeStyle === 'glitchX') {
      return (
        <g filter="url(#inkEyeGlow)" strokeWidth="4.4" strokeLinecap="round">
          <path d="M -35 -157 L -17 -139 M -17 -157 L -35 -139" stroke="#FF2A4D" />
          <path d="M 17 -157 L 35 -139 M 35 -157 L 17 -139" stroke="#1AD1E8" />
        </g>
      );
    }

    if (eyeStyle === 'heart') {
      return (
        <g filter="url(#inkEyeGlow)">
          <path d={heartPath(-26, -148, 10.8)} fill="#FF2E63" />
          <path d={heartPath(26, -148, 10.8)} fill="#FFD633" />
        </g>
      );
    }

    if (eyeStyle === 'purple') {
      return (
        <g filter="url(#inkEyeGlow)">
          <circle cx="-26" cy="-148" r="9.5" fill="none" stroke="#B85CFF" strokeWidth="3.8" />
          <circle cx="-26" cy="-148" r="3" fill="#F0D9FF" />
          <path d={starPath(26, -148, 4, 13, 5, time * 28)} fill="#F047A8" />
          <circle cx="26" cy="-148" r="3.2" fill="#FFF" />
        </g>
      );
    }

    if (eyeStyle === 'target') {
      return (
        <g filter="url(#inkEyeGlow)">
          <circle cx="-26" cy="-148" r="9.2" fill="none" stroke="#FF3B3B" strokeWidth="2.8" />
          <path d="M -26 -160 L -26 -136 M -38 -148 L -14 -148" stroke="#FF3B3B" strokeWidth="2.4" />
          <circle cx="26" cy="-148" r="8.8" fill="none" stroke="#FF9922" strokeWidth="3.6" />
          <circle cx="26" cy="-148" r="3" fill="#FFF3CC" />
        </g>
      );
    }

    if (eyeStyle === 'excited') {
      return (
        <g filter="url(#inkEyeGlow)">
          <path d={starPath(-26, -148, 4, 14, 5.4, 0)} fill="#24E5FF" />
          <path d={starPath(26, -148, 5, 14.5, 6.2, time * 24)} fill="#FFE438" />
          <circle cx="-26" cy="-148" r="3.6" fill="#FFFFFF" />
          <circle cx="26" cy="-148" r="3.6" fill="#FFFFFF" />
        </g>
      );
    }

    if (eyeStyle === 'starBurst') {
      return (
        <g filter="url(#inkEyeGlow)">
          <path d={starPath(-26, -148, 4, 13, 4.6, time * 30)} fill="#1AD1E8" />
          <path d={starPath(26, -148, 5, 14, 5.4, -time * 24)} fill="#F5D327" />
          <circle cx="-26" cy="-148" r="3.2" fill="#FFFFFF" />
          <circle cx="26" cy="-148" r="3.2" fill="#FFFFFF" />
        </g>
      );
    }

    if (eyeStyle === 'prismatic') {
      return (
        <g filter="url(#inkEyeGlow)">
          <path d={starPath(-26, -148, 4, 14.5, 4.8, time * 45)} fill="url(#prismGrad)" />
          <path d={starPath(26, -148, 6, 14.5, 5.2, -time * 40)} fill="url(#prismGrad)" />
          <circle cx="-26" cy="-148" r="4" fill="#FFFFFF" />
          <circle cx="26" cy="-148" r="4" fill="#FFFFFF" />
        </g>
      );
    }

    // Classic iconic Ink!Sans: cyan luminous ring (left) + golden 5-point star (right)
    return (
      <g filter="url(#inkEyeGlow)">
        <circle cx="-26" cy="-148" r="9.4" fill="#1AD1E8" />
        <circle cx="-26" cy="-148" r="4.8" fill="#07121E" />
        <circle cx="-28.8" cy="-151" r="2.3" fill="#E6FFFF" />
        <path d={starPath(26, -148, 5, 12.6, 5.2, time * 14)} fill="#F5D327" />
        <circle cx="26" cy="-148" r="3.3" fill="#FFFDF0" />
      </g>
    );
  };

  // Sculpted articulated skeleton hand (crisp thumb + curled fingers — replaces flat circle!)
  const renderSkeletonHand = (side: -1 | 1, magicAura = false) => (
    <g transform={`scale(${side}, 1)`}>
      {magicAura && (
        <circle
          cx={4}
          cy={104}
          r={26}
          fill="none"
          stroke={brushPaintColor}
          strokeWidth={3.5}
          strokeDasharray="16 8"
          opacity={0.9}
          filter="url(#inkEyeGlow)"
        />
      )}
      <path
        d="M -11 88
           C -16 96, -18 108, -12 117
           L -6 122 L -1 114 L 3 123 L 9 121 L 11 112 L 16 116 L 19 109
           C 19 99, 15 92, 10 88 Z"
        fill="#FAF7F0"
        stroke="#0D0C12"
        strokeWidth="4.2"
        strokeLinejoin="round"
      />
      {/* Knuckle ink detail lines */}
      <line x1="-5" y1="102" x2="-3" y2="112" stroke="#0D0C12" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="2" y1="102" x2="3" y2="113" stroke="#0D0C12" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="9" y1="101" x2="10" y2="110" stroke="#0D0C12" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );

  const drip1 = (time * 0.72) % 1;
  const drip2 = (time * 0.72 + 0.45) % 1;

  return (
    <svg
      width={size}
      height={size * 1.08}
      viewBox="-290 -350 580 590"
      style={{
        overflow: 'visible',
        filter:
          monochrome > 0.01
            ? `grayscale(${(monochrome * 100).toFixed(1)}%) contrast(${(1 + monochrome * 0.16).toFixed(2)})`
            : undefined,
        transform: flipX ? 'scaleX(-1)' : undefined,
      }}
    >
      <defs>
        <filter id="inkEyeGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="skullShade" x1="0.1" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#F6F2EA" />
          <stop offset="100%" stopColor="#D4CCC0" />
        </linearGradient>

        <linearGradient id="voidBrowShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040407" stopOpacity="0.99" />
          <stop offset="64%" stopColor="#07070D" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#07070D" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="scarfGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PALETTE.scarfHighlight} />
          <stop offset="48%" stopColor={PALETTE.scarfTan} />
          <stop offset="100%" stopColor={PALETTE.scarfShadow} />
        </linearGradient>

        <linearGradient id="scarfDeepGrad" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={PALETTE.scarfTan} />
          <stop offset="100%" stopColor="#6D4E31" />
        </linearGradient>

        <linearGradient id="jacketGrad" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#8FDEEC" />
          <stop offset="52%" stopColor={PALETTE.jacketCyan} />
          <stop offset="100%" stopColor={PALETTE.jacketShadow} />
        </linearGradient>

        <linearGradient id="woodShaft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#261B14" />
          <stop offset="32%" stopColor={PALETTE.broomieWoodLight} />
          <stop offset="68%" stopColor={PALETTE.broomieWood} />
          <stop offset="100%" stopColor="#19110D" />
        </linearGradient>

        <linearGradient id="ferruleMetal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#656B78" />
          <stop offset="35%" stopColor="#ECF1FA" />
          <stop offset="72%" stopColor="#949CA9" />
          <stop offset="100%" stopColor="#454A56" />
        </linearGradient>

        <linearGradient id="prismGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1AD1E8" />
          <stop offset="33%" stopColor="#F5D327" />
          <stop offset="66%" stopColor="#F047A8" />
          <stop offset="100%" stopColor="#9B4DFF" />
        </linearGradient>
      </defs>

      <g transform={`translate(0, ${hover.toFixed(2)})`}>
        {/* Crisp subtle anime back-rim aura (clean graphic arc behind silhouette, zero muddy blur!) */}
        {rimIntensity > 0.08 && monochrome < 0.7 && (
          <ellipse
            cx={0}
            cy={-45}
            rx={135}
            ry={165}
            fill="none"
            stroke={rimColor}
            strokeWidth={2.5}
            opacity={rimIntensity * 0.35}
            strokeDasharray="24 14 8 14"
            transform={`rotate(${(time * 8).toFixed(1)}, 0, -45)`}
          />
        )}

        {/* ═══ LAYER 1: DRAMATIC ASYMMETRIC BILLOWING SCARF TAILS ═══ */}
        <g transform={`translate(0, ${(breathe * 0.4).toFixed(2)})`}>
          {/* Long hero sweeping left scarf banner (deep shadow underside) */}
          <path
            d={`M -30 -84
                C ${-108 + w1 * 0.45} ${-56 + w4 * 0.5}, ${-175 + w2 * 0.75} ${4 + w1 * 0.65}, ${-238 + w3} ${98 + w5 * 0.65}
                L ${-202 + w3 * 0.92} ${124 + w5 * 0.55}
                L ${-184 + w3 * 0.85} ${96 + w5 * 0.52}
                L ${-160 + w3 * 0.88} ${134 + w5 * 0.48}
                C ${-126 + w2 * 0.65} ${36 + w1 * 0.4}, ${-76 + w1 * 0.35} ${-24}, -10 -62 Z`}
            fill="url(#scarfGrad)"
            stroke="#0D0C12"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Cel-shaded fold shadow inside scarf */}
          <path
            d={`M -34 -76 C ${-94 + w1 * 0.4} ${-40 + w4 * 0.4}, ${-144 + w2 * 0.65} ${18 + w1 * 0.5}, ${-184 + w3 * 0.85} ${96 + w5 * 0.52}
                L ${-160 + w3 * 0.88} ${134 + w5 * 0.48}
                C ${-126 + w2 * 0.65} ${36 + w1 * 0.4}, ${-76 + w1 * 0.35} ${-24}, -10 -62 Z`}
            fill="#7D5C3B"
            opacity="0.45"
          />
          {/* Hand-inked calligraphy sketch-lines on scarf */}
          <path
            d={`M ${-94 + w1 * 0.38} ${-26 + w4 * 0.3} Q ${-142 + w2 * 0.62} ${32 + w1 * 0.4} ${-196 + w3 * 0.9} ${102 + w5 * 0.55}`}
            fill="none"
            stroke="#4E3620"
            strokeWidth="2.4"
            strokeDasharray="12 6 4 6"
            opacity="0.72"
          />

          {/* Secondary windswept right scarf ribbon (dynamic asymmetrical length) */}
          <path
            d={`M 34 -82
                C ${108 - w4 * 0.65} ${-62 + w1 * 0.45}, ${172 - w5 * 0.82} ${-12 + w2 * 0.55}, ${212 - w2 * 0.92} ${68 + w3 * 0.45}
                L ${182 - w2 * 0.85} ${86 + w3 * 0.42}
                L ${172 - w2 * 0.78} ${62 + w3 * 0.38}
                L ${152 - w2 * 0.72} ${88 + w3 * 0.36}
                C ${122 - w4 * 0.55} ${16 + w1 * 0.32}, ${78 - w4 * 0.35} ${-24}, 16 -62 Z`}
            fill="url(#scarfDeepGrad)"
            stroke="#0D0C12"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </g>

        {/* ═══ LAYER 2: LEGENDARY GIANT PAINTBRUSH "BROOMIE" ═══ */}
        <g
          transform={`translate(${poseCfg.brushX.toFixed(2)}, ${(poseCfg.brushY + breathe * 0.45).toFixed(2)}) rotate(${brushTotalRot.toFixed(2)}, 12, -20)`}
        >
          {/* Subtle paint motion-wisp behind Broomie head */}
          {monochrome < 0.7 && (
            <path
              d="M -42 -325 C -68 -365, -48 -425, 4 -442 C 42 -425, 58 -365, 36 -318"
              fill="none"
              stroke={brushPaintColor}
              strokeWidth="4.5"
              strokeLinecap="round"
              opacity="0.55"
              filter="url(#inkEyeGlow)"
            />
          )}

          {/* Tapered dark wooden shaft */}
          <path
            d="M -11 -236 L 11 -236 L 15 96 L -15 96 Z"
            fill="url(#woodShaft)"
            stroke="#0D0C12"
            strokeWidth="5.2"
            strokeLinejoin="round"
          />
          {/* Cloth grip wrap on lower shaft */}
          <path
            d="M -14 26 L 14 18 L 15 44 L -15 52 Z"
            fill="#C9A474"
            stroke="#0D0C12"
            strokeWidth="3.2"
          />
          <line x1="-14" y1="38" x2="14" y2="30" stroke="#7A5A3A" strokeWidth="2.5" />
          {/* Wood highlight */}
          <line x1="-4" y1="-220" x2="-5" y2="12" stroke="#9A7860" strokeWidth="2.2" opacity="0.5" />

          {/* Carved pommel cap */}
          <path
            d="M -17 92 L 17 92 L 13 114 L -13 114 Z"
            fill="#272226"
            stroke="#0D0C12"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Metallic Ferrule Collar */}
          <path
            d="M -16 -234 L 16 -234 L 25 -282 L -25 -282 Z"
            fill="url(#ferruleMetal)"
            stroke="#0D0C12"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <line x1="-18" y1="-250" x2="18" y2="-250" stroke="#454B57" strokeWidth="3.2" />
          <line x1="-22" y1="-268" x2="22" y2="-268" stroke="#454B57" strokeWidth="3.2" />

          {/* Sculpted Lush Giant Bristles (sweeping calligraphy tip!) */}
          <path
            d="M -25 -282
               C -50 -314, -46 -368, -6 -414
               C 4 -424, 14 -414, 26 -388
               C 50 -348, 48 -308, 25 -282 Z"
            fill={PALETTE.broomieBristle}
            stroke="#0A0A0E"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          {/* Rich glowing wet paint saturating the bristles */}
          <path
            d="M -33 -336
               C -38 -366, -24 -392, -6 -414
               C 4 -424, 14 -414, 26 -388
               C 38 -364, 38 -342, 28 -328
               C 16 -340, 8 -324, 0 -338
               C -10 -324, -22 -340, -33 -336 Z"
            fill={brushPaintColor}
            filter="url(#inkEyeGlow)"
          />
          {/* Crisp wet specular glint */}
          <path
            d="M -14 -372 Q -2 -396 10 -378"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.8"
            strokeLinecap="round"
            opacity="0.88"
          />
          {/* Animated dripping ink drops */}
          <circle
            cx={-22}
            cy={-334 + drip1 * 52}
            r={Math.max(1.5, 5.5 * (1 - drip1 * 0.72))}
            fill={brushPaintColor}
            opacity={1 - drip1 * 0.85}
          />
          <circle
            cx={18}
            cy={-340 + drip2 * 44}
            r={Math.max(1.2, 4.4 * (1 - drip2 * 0.72))}
            fill={brushPaintColor}
            opacity={1 - drip2 * 0.85}
          />
        </g>

        {/* ═══ LAYER 3: DYNAMIC CONTRAPPOSTO LOWER STANCE ═══ */}
        <g transform="translate(0, 60)">
          {/* Tapered dark brown shorts with dynamic angled stance */}
          <path
            d="M -52 0 L 52 0 L 70 76 L 16 78 L 0 40 L -16 78 L -70 76 Z"
            fill="#473830"
            stroke="#0D0C12"
            strokeWidth="5.2"
            strokeLinejoin="round"
          />
          <path d="M -52 0 L -18 0 L -32 76 L -70 76 Z" fill="#2B211C" opacity="0.58" />
          <line x1="-56" y1="24" x2="-34" y2="22" stroke={PALETTE.jacketCyan} strokeWidth="4.2" strokeLinecap="round" />
          <line x1="34" y1="22" x2="56" y2="24" stroke={PALETTE.jacketCyan} strokeWidth="4.2" strokeLinecap="round" />

          {/* Angled legs with cyan side-stripes */}
          <path d="M -52 74 L -26 74 L -32 118 L -58 118 Z" fill="#232026" stroke="#0D0C12" strokeWidth="4.5" />
          <path d="M 26 74 L 52 74 L 58 118 L 32 118 Z" fill="#232026" stroke="#0D0C12" strokeWidth="4.5" />
          <line x1="-43" y1="78" x2="-47" y2="114" stroke={PALETTE.jacketCyan} strokeWidth="4.5" />
          <line x1="43" y1="78" x2="47" y2="114" stroke={PALETTE.jacketCyan} strokeWidth="4.5" />

          {/* Sneakers planted wide */}
          <path
            d="M -72 114 L -24 114 L -22 142 L -86 142 C -89 128, -82 118, -72 114 Z"
            fill="#5C4435"
            stroke="#0D0C12"
            strokeWidth="4.8"
            strokeLinejoin="round"
          />
          <rect x="-86" y="136" width="66" height="10" rx="4" fill="#F2EDE4" stroke="#0D0C12" strokeWidth="3.8" />
          <path
            d="M 24 114 L 72 114 C 82 118, 89 128, 86 142 L 22 142 Z"
            fill="#5C4435"
            stroke="#0D0C12"
            strokeWidth="4.8"
            strokeLinejoin="round"
          />
          <rect x="20" y="136" width="66" height="10" rx="4" fill="#F2EDE4" stroke="#0D0C12" strokeWidth="3.8" />
        </g>

        {/* ═══ LAYER 4: SCULPTED TORSO, WAIST JACKET & 8-VIAL SASH ═══ */}
        <g transform={`translate(0, ${breathe.toFixed(2)}) rotate(${torsoRot.toFixed(2)}, 0, 40)`}>
          {/* Cream outer tunic with tailored taper */}
          <path
            d="M -64 -74 C -68 -18, -62 32, -54 66 L 54 66 C 62 32, 68 -18, 64 -74 Z"
            fill={PALETTE.tunicCream}
            stroke="#0D0C12"
            strokeWidth="5.2"
            strokeLinejoin="round"
          />
          {/* Cel shadow on left flank of tunic */}
          <path d="M -64 -74 L -34 -74 L -36 66 L -54 66 C -62 32, -68 -18, -64 -74 Z" fill="#CEC5B4" opacity="0.65" />

          {/* Dark brown chest vest */}
          <path
            d="M -42 -72 L 42 -72 L 34 58 L -34 58 Z"
            fill={PALETTE.tunicBrown}
            stroke="#0D0C12"
            strokeWidth="4.4"
          />

          {/* Waist-tied Cyan Hoodie with folded drapery & knot */}
          <path
            d="M -64 30 C -76 56, -74 86, -54 96 L -16 74 L 0 92 L 16 74 L 54 96 C 74 86, 76 56, 64 30 Z"
            fill="url(#jacketGrad)"
            stroke="#0D0C12"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Fold lines */}
          <path d="M -56 58 Q -38 72 -24 66" fill="none" stroke="#2D6270" strokeWidth="3" strokeLinecap="round" />
          <path d="M 56 58 Q 38 72 24 66" fill="none" stroke="#2D6270" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="0" cy="52" rx="18" ry="13" fill="#8FDEEC" stroke="#0D0C12" strokeWidth="4.4" />

          {/* Dangling knotted hoodie sleeves */}
          <path
            d="M -10 58 C -28 84, -34 108, -24 126 L -8 122 C -12 104, -6 84, 0 64 Z"
            fill="url(#jacketGrad)"
            stroke="#0D0C12"
            strokeWidth="4.4"
          />
          <path
            d="M 10 58 C 28 84, 34 108, 24 126 L 8 122 C 12 104, 6 84, 0 64 Z"
            fill="url(#jacketGrad)"
            stroke="#0D0C12"
            strokeWidth="4.4"
          />

          {/* Diagonal Leather Vial Sash */}
          <path
            d="M -56 -64 L -36 -74 L 58 34 L 40 48 Z"
            fill="#2B1F18"
            stroke="#0D0C12"
            strokeWidth="4.4"
            strokeLinejoin="round"
          />

          {/* 8 Translucent Glowing Paint Vials strapped on sash */}
          {INK_VIALS.map((vial, idx) => {
            const frac = idx / 7;
            const vx = -40 + frac * 82;
            const vy = -58 + frac * 94;
            const fillLevel = clamp(vialLevels[idx] ?? 1, 0, 1);
            const liquidH = 14 * fillLevel;
            return (
              <g key={vial.id} transform={`translate(${vx.toFixed(1)}, ${vy.toFixed(1)}) rotate(-38)`}>
                <rect
                  x="-5.4"
                  y="-11.5"
                  width="10.8"
                  height="23"
                  rx="4.4"
                  fill="rgba(225, 240, 255, 0.2)"
                  stroke="#0D0C12"
                  strokeWidth="2.4"
                />
                {fillLevel > 0.04 && (
                  <rect
                    x="-3.6"
                    y={10 - liquidH}
                    width="7.2"
                    height={liquidH}
                    rx="2.6"
                    fill={vial.hex}
                    filter={fillLevel > 0.35 ? 'url(#inkEyeGlow)' : undefined}
                  />
                )}
                <rect x="-4" y="-15" width="8" height="4.8" rx="1.4" fill="#B88E5A" stroke="#0D0C12" strokeWidth="2" />
                <line x1="-2.4" y1="-8" x2="-2.4" y2="6" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.78" />
              </g>
            );
          })}

          {/* Left Arm with tapered sleeve, shoulder wrap & articulated skeleton hand */}
          <g transform={`translate(-60, -58) rotate(${poseCfg.lArmR.toFixed(1)})`}>
            <path
              d="M -16 -8 C -28 24, -28 60, -16 90 L 10 88 C 14 56, 12 22, 12 -4 Z"
              fill="#312622"
              stroke="#0D0C12"
              strokeWidth="4.8"
              strokeLinejoin="round"
            />
            {/* Forearm cyan cuff band */}
            <path d="M -18 74 L 11 72 L 10 86 L -16 88 Z" fill={PALETTE.jacketCyan} stroke="#0D0C12" strokeWidth="3.5" />
            {/* Layered tan shoulder wrap */}
            <path
              d="M -24 -14 C -26 10, -4 18, 16 4 C 18 -14, -4 -24, -24 -14 Z"
              fill={PALETTE.scarfTan}
              stroke="#0D0C12"
              strokeWidth="4.4"
            />
            {renderSkeletonHand(-1, pose === 'overdriveAscend')}
          </g>

          {/* Right Arm with tapered sleeve, shoulder wrap & magic-casting skeleton hand */}
          <g transform={`translate(60, -58) rotate(${poseCfg.rArmR.toFixed(1)})`}>
            <path
              d="M -12 -4 C -12 22, -14 56, -10 88 L 16 90 C 28 60, 28 24, 16 -8 Z"
              fill="#312622"
              stroke="#0D0C12"
              strokeWidth="4.8"
              strokeLinejoin="round"
            />
            <path d="M -11 72 L 18 74 L 16 88 L -10 86 Z" fill={PALETTE.jacketCyan} stroke="#0D0C12" strokeWidth="3.5" />
            <path
              d="M 24 -14 C 26 10, 4 18, -16 4 C -18 -14, 4 -24, 24 -14 Z"
              fill={PALETTE.scarfTan}
              stroke="#0D0C12"
              strokeWidth="4.4"
            />
            {renderSkeletonHand(1, pose === 'conductorCast' || pose === 'overdriveAscend')}
          </g>

          {/* Chunky Layered Front Scarf Collar */}
          <path
            d="M -70 -84
               C -44 -56, 44 -56, 70 -84
               C 76 -62, 64 -34, 36 -30
               C 14 -26, -14 -26, -36 -30
               C -64 -34, -76 -62, -70 -84 Z"
            fill="url(#scarfGrad)"
            stroke="#0D0C12"
            strokeWidth="5.2"
            strokeLinejoin="round"
          />
          <path d="M -52 -56 Q 0 -40 52 -56" fill="none" stroke="#6E4E2F" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M -38 -42 Q 0 -32 38 -42" fill="none" stroke="#6E4E2F" strokeWidth="2.4" strokeLinecap="round" opacity="0.65" />

          {/* ═══ LAYER 5: SCULPTED ANIME INK!SANS SKULL ═══ */}
          <g transform={`translate(0, ${poseCfg.headY.toFixed(2)}) rotate(${headRot.toFixed(2)}, 0, -108)`}>
            {/* Cranium + Prominent Cheekbones + Sculpted Jaw */}
            <path
              d="M 0 -226
                 C 55 -226, 79 -191, 77 -148
                 C 88 -136, 87 -111, 67 -103
                 C 62 -85, 42 -76, 0 -76
                 C -42 -76, -62 -85, -67 -103
                 C -87 -111, -88 -136, -77 -148
                 C -79 -191, -55 -226, 0 -226 Z"
              fill="url(#skullShade)"
              stroke="#0D0C12"
              strokeWidth="5.8"
              strokeLinejoin="round"
            />

            {/* Crisp cel-shaded shadow under left cheekbone & jaw */}
            <path
              d="M -75 -140 C -82 -124, -78 -108, -64 -102 C -58 -87, -38 -80, 0 -79 C -26 -86, -48 -94, -56 -110 C -66 -118, -72 -128, -75 -140 Z"
              fill="#C7BEB0"
              opacity="0.72"
            />

            {/* Iconic Asymmetrical Sumi Ink Smudge on Cheek */}
            <path
              d="M 38 -123
                 C 48 -130, 62 -125, 65 -114
                 C 68 -104, 58 -98, 48 -102
                 C 40 -106, 33 -114, 38 -123 Z"
              fill="#111218"
            />
            <circle cx="57" cy="-94" r="3.4" fill="#111218" />
            <circle cx="67" cy="-102" r="2.2" fill="#111218" />

            {/* Deep Obsidian Eye Sockets */}
            <g transform={`translate(0, -148) scale(1, ${eyeScaleY.toFixed(3)}) translate(0, 148)`}>
              <path
                d="M -11 -162 C -26 -170, -49 -164, -50 -146 C -50 -129, -28 -125, -13 -136 C -7 -142, -7 -156, -11 -162 Z"
                fill="#08080D"
              />
              <path
                d="M 11 -162 C 26 -170, 49 -164, 50 -146 C 50 -129, 28 -125, 13 -136 C 7 -142, 7 -156, 11 -162 Z"
                fill="#08080D"
              />
              {renderPupils()}
            </g>

            {/* Expressive Anime Brow Ridges (confident tilt during combat!) */}
            {eyeStyle !== 'void' && poseCfg.smirk > 0.4 && (
              <g stroke="#0D0C12" strokeWidth="4.5" strokeLinecap="round" fill="none">
                <path d="M -46 -172 Q -26 -166 -12 -162" />
                <path d="M 46 -174 Q 26 -170 12 -163" />
              </g>
            )}

            {/* Triangular Nasal Cavity */}
            <path d="M 0 -132 L -8.5 -118 Q 0 -113 8.5 -118 Z" fill="#0D0C12" />

            {/* Expressive Grin vs Emotionless Void Line */}
            {eyeStyle === 'void' ? (
              <path
                d="M -38 -97 Q 0 -95 38 -97"
                fill="none"
                stroke="#0D0C12"
                strokeWidth="4.6"
                strokeLinecap="round"
              />
            ) : (
              <g>
                <path
                  d="M -52 -111 Q -26 -85 0 -85 Q 26 -85 52 -111 Q 34 -100 0 -100 Q -34 -100 -52 -111 Z"
                  fill="#FFFFFF"
                  stroke="#0D0C12"
                  strokeWidth="4.4"
                  strokeLinejoin="round"
                />
                <line x1="-26" y1="-102" x2="-26" y2="-90" stroke="#0D0C12" strokeWidth="3.6" />
                <line x1="-9" y1="-100" x2="-9" y2="-86" stroke="#0D0C12" strokeWidth="3.6" />
                <line x1="9" y1="-100" x2="9" y2="-86" stroke="#0D0C12" strokeWidth="3.6" />
                <line x1="26" y1="-102" x2="26" y2="-90" stroke="#0D0C12" strokeWidth="3.6" />
              </g>
            )}

            {/* Cascading Ink Shadow over Upper Face (Phase 3 & Act VIII Void) */}
            {(eyeStyle === 'void' || eyeStyle === 'phase3') && (
              <path
                d="M -77 -150
                   C -79 -195, -53 -226, 0 -226
                   C 53 -226, 79 -195, 77 -150
                   L 72 -135
                   Q 36 -142 0 -134
                   Q -36 -142 -72 -135 Z"
                fill="url(#voidBrowShadow)"
              />
            )}

            {eyeStyle === 'phase3' && (
              <g filter="url(#inkEyeGlow)">
                <ellipse cx="-26" cy="-148" rx="10" ry="5" fill="#FF1E42" />
                <ellipse cx="-26" cy="-148" rx="4.5" ry="2.2" fill="#FFFFFF" />
                <ellipse cx="26" cy="-148" rx="10" ry="5" fill="#FF1E42" />
                <ellipse cx="26" cy="-148" rx="4.5" ry="2.2" fill="#FFFFFF" />
              </g>
            )}
          </g>
        </g>
      </g>
    </svg>
  );
};
