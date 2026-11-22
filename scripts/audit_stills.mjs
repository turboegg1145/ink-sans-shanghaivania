import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const OUT_DIR = path.resolve('out/audit');
fs.mkdirSync(OUT_DIR, { recursive: true });

const AUDIT_FRAMES = [
  { frame: 390,   name: '01_act1_overture' },
  { frame: 1012,  name: '02_act2_blasters' },
  { frame: 1234,  name: '03_act2_cutin' },
  { frame: 2140,  name: '04_act3_vial_macro' },
  { frame: 3525,  name: '05_act4_hex_climax' },
  { frame: 3920,  name: '06_act5_touhou_rose' },
  { frame: 4920,  name: '07_act5_split_box' },
  { frame: 6320,  name: '08_act6_pixel_rift' },
  { frame: 8072,  name: '09_act7_phase3_cutin' },
  { frame: 8320,  name: '10_act7_phase3_phalanx' },
  { frame: 10420, name: '11_act8_hollow_void' },
  { frame: 12650, name: '12_act9_cathedral_finale' },
];

async function main() {
  console.log('Bundling Remotion project...');
  const serveUrl = await bundle({
    entryPoint: path.resolve('src/index.ts'),
  });

  const composition = await selectComposition({
    serveUrl,
    id: 'Shanghaivania',
    chromiumOptions: { gl: 'angle', angleRenderer: 'swiftshader' },
  });

  for (const item of AUDIT_FRAMES) {
    const outPath = path.join(OUT_DIR, `${item.name}_f${item.frame}.png`);
    const t0 = Date.now();
    await renderStill({
      composition,
      serveUrl,
      output: outPath,
      frame: item.frame,
      imageFormat: 'png',
      chromiumOptions: { gl: 'angle', angleRenderer: 'swiftshader' },
    });
    console.log(`Rendered ${item.name} (frame ${item.frame}) in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
  }
  console.log('All 12 audit stills rendered cleanly!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
