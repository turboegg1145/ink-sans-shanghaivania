// Curated Ink!Sans × Sumi-e × Doodle Sphere color architecture

export const INK_VIALS = [
  { id: 'red',    hex: '#E62E4D', glow: '#FF4D6D', name: 'Red' },
  { id: 'orange', hex: '#F5821F', glow: '#FFA94D', name: 'Orange' },
  { id: 'yellow', hex: '#F5D327', glow: '#FFF066', name: 'Yellow' },
  { id: 'green',  hex: '#2ECC71', glow: '#5CE697', name: 'Green' },
  { id: 'cyan',   hex: '#1AD1E8', glow: '#66F0FF', name: 'Cyan' },
  { id: 'blue',   hex: '#2B6BFF', glow: '#6699FF', name: 'Blue' },
  { id: 'purple', hex: '#9B4DFF', glow: '#C48CFF', name: 'Purple' },
  { id: 'pink',   hex: '#F047A8', glow: '#FF80C8', name: 'Magenta' },
] as const;

export type VialId = (typeof INK_VIALS)[number]['id'];

export const PALETTE = {
  // Xuan Paper & Sumi Ink foundation
  paperWarm: '#F4EFE4',
  paperAged: '#E8DFCE',
  sumiDeep: '#09090D',
  sumiCharcoal: '#15161E',
  sumiMid: '#282A36',
  boneWhite: '#FBF9F5',
  boneShadow: '#C7C1B5',

  // Ink!Sans canonical outfit palette (refined for cinema cel-shading)
  scarfTan: '#C9A474',
  scarfShadow: '#8B6843',
  scarfHighlight: '#E6CB9F',
  jacketCyan: '#6CC4D4',
  jacketShadow: '#397B8C',
  tunicCream: '#EAE2D2',
  tunicBrown: '#5B4334',
  broomieWood: '#4B362A',
  broomieWoodLight: '#735542',
  broomieFerrule: '#B5BAC4',
  broomieBristle: '#1D1818',

  // SOUL colors
  soulRed: '#FF1F3D',
  soulBlue: '#1F6BFF',
  soulYellow: '#FFE629',
  soulPurple: '#B83DFF',
  soulCyan: '#29F0FF',
  soulOrange: '#FF8C1A',
  soulGreen: '#29E668',
  soulWhite: '#FFFFFF',
} as const;

export function hexToRgbNormalized(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
