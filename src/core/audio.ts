import rawAudio from '../data/audioFeatures.json';

export interface AudioSample {
  rms: number;
  bass: number;
  mid: number;
  high: number;
  flux: number;
}

let decodedBuffer: Uint8Array | null = null;

function getBuffer(): Uint8Array {
  if (decodedBuffer) return decodedBuffer;
  const b64 = rawAudio.dataBase64;
  if (typeof Buffer !== 'undefined') {
    decodedBuffer = Uint8Array.from(Buffer.from(b64, 'base64'));
  } else {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    decodedBuffer = arr;
  }
  return decodedBuffer;
}

export function getAudioAtFrame(frame: number): AudioSample {
  const buf = getBuffer();
  const maxFrame = rawAudio.totalFrames - 1;
  const f = Math.max(0, Math.min(maxFrame, Math.round(frame)));
  const idx = f * 5;
  return {
    rms: buf[idx] / 255,
    bass: buf[idx + 1] / 255,
    mid: buf[idx + 2] / 255,
    high: buf[idx + 3] / 255,
    flux: buf[idx + 4] / 255,
  };
}

/** Smoothed energy envelope over [-radius, +radius] frames so background breathes organically instead of jittering */
export function getSmoothedAudio(frame: number, radius = 8): AudioSample {
  let rms = 0;
  let bass = 0;
  let mid = 0;
  let high = 0;
  let flux = 0;
  let wSum = 0;
  for (let d = -radius; d <= radius; d += 2) {
    const w = Math.exp(-(d * d) / (2 * (radius * 0.5) ** 2));
    const s = getAudioAtFrame(frame + d);
    rms += s.rms * w;
    bass += s.bass * w;
    mid += s.mid * w;
    high += s.high * w;
    flux += s.flux * w;
    wSum += w;
  }
  return {
    rms: rms / wSum,
    bass: bass / wSum,
    mid: mid / wSum,
    high: high / wSum,
    flux: flux / wSum,
  };
}
