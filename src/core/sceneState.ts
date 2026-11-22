import { BoneItem, DanmakuOrb } from '../assets/BoneAndDanmaku3D';
import { BoneTunnelCue, BoneWheelCue } from '../assets/BoneWheel3D';
import { GasterBlaster3DProps } from '../assets/GasterBlaster3D';
import { InkEyeStyle, InkPose } from '../assets/InkSansRig';
import { SacredMandala3DProps } from '../assets/SacredMandala3D';
import { SoulMode } from '../assets/Soul3D';
import { AudioSample } from './audio';

export interface RibbonCue {
  id: string;
  points: readonly [number, number, number][];
  width: number;
  progress: number;
  tail: number;
  inkColor: string;
  tipColor: string;
  opacity: number;
}

export interface SplashCue {
  id: string;
  progress: number;
  cx: number;
  cy: number;
  color: string;
  secondaryColor?: string;
  seed: number;
  scale?: number;
}

export interface BlasterCue extends Omit<GasterBlaster3DProps, 'time'> {
  id: string;
}

export interface MandalaCue extends Omit<SacredMandala3DProps, 'time'> {
  id: string;
}

export interface CutInCue {
  progress: number;
  eyeStyle: InkEyeStyle;
  accentColor: string;
  secondaryColor?: string;
  angleDeg?: number;
  flip?: boolean;
}

export interface SceneFrameState {
  // 3D Camera Rig (smooth cinema dollies/cranes + single-impulse damped recoil ONLY on heavy hits)
  camPos: [number, number, number];
  camLookAt: [number, number, number];
  camRoll: number;
  camFov: number;

  // Custom GLSL Sumi-e Ink Wash Backdrop
  paperMix: number;
  monochrome: number;
  inkBloom: number;
  bloomCenter: [number, number];
  colorA: string;
  colorB: string;
  spectrum: number;
  backdropEnergy: number;

  // 3D Doodle Sphere
  doodleOpacity: number;
  doodleTurbulence: number;

  // Original Cel/Sumi-e Ink!Sans Character Layer
  inkOpacity: number;
  inkX: number;        // viewport percentage [0..100]
  inkY: number;        // viewport percentage [0..100]
  inkScale: number;
  inkPose: InkPose;
  inkEye: InkEyeStyle;
  brushPaintColor: string;
  vialLevels: readonly number[];
  blink: number;
  brushAngleOffset: number;
  headTilt: number;
  flipX: boolean;
  rimColor: string;
  rimIntensity: number;

  // 3D Battle Stage Elements
  blasters: BlasterCue[];
  ribbons: RibbonCue[];
  bones: BoneItem[];
  danmaku: DanmakuOrb[];
  mandalas: MandalaCue[];
  boneWheels: BoneWheelCue[];
  boneTunnel?: BoneTunnelCue;

  // 3D Morphing Battle Box
  boxOpacity: number;
  boxPos: [number, number, number];
  boxRot: [number, number, number];
  boxWidth: number;
  boxHeight: number;
  boxBorderColor: string;
  boxFillOpacity: number;
  boxSplit: number;
  gravityWall: 'none' | 'bottom' | 'top' | 'left' | 'right';
  boxOrnament: number;

  // 3D Glowing SOUL
  soulOpacity: number;
  soulPos: [number, number, number];
  soulMode: SoulMode;
  soulScale: number;
  soulTrail: [number, number, number][];
  soulGraze: number;
  soulPulse: number;

  // Bespoke 2D Graphic Centerpieces
  inkDropRipple?: {
    progress: number;
    cx: number;
    cy: number;
    color: string;
  };
  vialMacro?: {
    opacity: number;
    activeIndex: number;
    levels: readonly number[];
    shatter: number;
  };
  dimensionalRift?: {
    openAmount: number;
    showMiss: boolean;
    angleDeg: number;
  };
  cutIn?: CutInCue;
  splashes: SplashCue[];

  // Sparse, authentic editorial / diegetic overlays (ZERO AI-slop mini-titles!)
  titleOpacity: number;
  titleText: string;
  titleTrackingEm: number;
  titleYPercent: number;
  titleColor: string;

  hudOpacity: number;
  hudHp: number;
  hudKr: number;

  // Sakuga Compositor
  impactFlash: number;
  whiteFlash: number;
  letterboxPx: number;
  slashProgress: number;
  slashAngleDeg: number;
  slashColor: string;
  fadeBlack: number;
}

export interface ActContext {
  frame: number;
  localFrame: number;
  duration: number;
  progress: number; // [0..1]
  time: number;     // global seconds
  localTime: number;
  beat: number;
  bar: number;
  beatPulse: number;
  audio: AudioSample;
  smoothAudio: AudioSample;
}

export function createDefaultSceneState(): SceneFrameState {
  return {
    camPos: [0, 0.35, 11.5],
    camLookAt: [0, -0.25, 0],
    camRoll: 0,
    camFov: 42,

    paperMix: 0,
    monochrome: 0,
    inkBloom: 0,
    bloomCenter: [0.5, 0.5],
    colorA: '#1AD1E8',
    colorB: '#F5D327',
    spectrum: 0,
    backdropEnergy: 0.3,

    doodleOpacity: 0.8,
    doodleTurbulence: 0.15,

    inkOpacity: 1,
    inkX: 50,
    inkY: 32,
    inkScale: 0.72,
    inkPose: 'idle',
    inkEye: 'classic',
    brushPaintColor: '#1AD1E8',
    vialLevels: [1, 1, 1, 1, 1, 1, 1, 1],
    blink: 0,
    brushAngleOffset: 0,
    headTilt: 0,
    flipX: false,
    rimColor: '#1AD1E8',
    rimIntensity: 0.4,

    blasters: [],
    ribbons: [],
    bones: [],
    danmaku: [],
    mandalas: [],
    boneWheels: [],

    boxOpacity: 0,
    boxPos: [0, -1.55, 0],
    boxRot: [0, 0, 0],
    boxWidth: 5.2,
    boxHeight: 2.9,
    boxBorderColor: '#FAF7F0',
    boxFillOpacity: 0.76,
    boxSplit: 0,
    gravityWall: 'none',
    boxOrnament: 1,

    soulOpacity: 0,
    soulPos: [0, -1.55, 0.28],
    soulMode: 'red',
    soulScale: 0.34,
    soulTrail: [],
    soulGraze: 0,
    soulPulse: 0,

    splashes: [],

    titleOpacity: 0,
    titleText: '',
    titleTrackingEm: 0.26,
    titleYPercent: 84,
    titleColor: '#FAF7F0',

    hudOpacity: 0,
    hudHp: 92,
    hudKr: 0,

    impactFlash: 0,
    whiteFlash: 0,
    letterboxPx: 54,
    slashProgress: 0,
    slashAngleDeg: -16,
    slashColor: '#1AD1E8',
    fadeBlack: 0,
  };
}
