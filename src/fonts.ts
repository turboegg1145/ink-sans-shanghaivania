import { continueRender, delayRender, staticFile } from 'remotion';

let loaded = false;

export function ensureFontsLoaded(): void {
  if (loaded || typeof window === 'undefined' || typeof FontFace === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading custom fonts');

  const specs = [
    { family: 'Silkscreen', file: 'fonts/Silkscreen-Regular.ttf', weight: '400' },
    { family: 'Silkscreen', file: 'fonts/Silkscreen-Bold.ttf', weight: '700' },
    { family: 'VT323', file: 'fonts/VT323-Regular.ttf', weight: '400' },
    { family: 'Cinzel', file: 'fonts/Cinzel-Variable.ttf', weight: '400 900' },
    { family: 'Cormorant Garamond', file: 'fonts/CormorantGaramond-Variable.ttf', weight: '400 700' },
  ];

  Promise.all(
    specs.map(async (s) => {
      try {
        const ff = new FontFace(s.family, `url(${staticFile(s.file)})`, { weight: s.weight });
        const loadedFace = await ff.load();
        document.fonts.add(loadedFace);
      } catch (err) {
        console.warn('Font load warning:', s.family, err);
      }
    })
  ).finally(() => {
    continueRender(handle);
  });
}
