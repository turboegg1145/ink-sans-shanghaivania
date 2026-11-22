import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const shardIndex = parseInt(process.env.SHARD_INDEX ?? '0', 10);
const shardTotal = parseInt(process.env.SHARD_TOTAL ?? '16', 10);
const crf = parseInt(process.env.CRF ?? '16', 10);
const concurrency = parseInt(process.env.CONCURRENCY ?? String(Math.max(2, os.cpus().length)), 10);

async function main() {
  const outDir = path.resolve('out/shards');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`[Shard ${shardIndex}/${shardTotal}] Bundling project (concurrency=${concurrency}, crf=${crf})...`);
  const serveUrl = await bundle({
    entryPoint: path.resolve('src/index.ts'),
  });

  const composition = await selectComposition({
    serveUrl,
    id: 'Shanghaivania',
    chromiumOptions: { gl: 'angle', angleRenderer: 'swiftshader' },
  });

  const totalFrames = composition.durationInFrames;
  const framesPerShard = Math.ceil(totalFrames / shardTotal);
  const startFrame = shardIndex * framesPerShard;
  const endFrame = Math.min(totalFrames - 1, (shardIndex + 1) * framesPerShard - 1);

  if (startFrame > endFrame) {
    console.log(`[Shard ${shardIndex}] Empty range, skipping.`);
    return;
  }

  const padded = String(shardIndex).padStart(2, '0');
  const outPath = path.join(outDir, `shard_${padded}.mp4`);
  const t0 = Date.now();
  let lastLog = 0;

  console.log(`[Shard ${shardIndex}] Rendering frames ${startFrame}..${endFrame} (${endFrame - startFrame + 1} frames) -> ${outPath}`);

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    crf,
    pixelFormat: 'yuv420p',
    muted: true,
    frameRange: [startFrame, endFrame],
    outputLocation: outPath,
    concurrency,
    imageFormat: 'jpeg',
    jpegQuality: 96,
    chromiumOptions: { gl: 'angle', angleRenderer: 'swiftshader' },
    onProgress: ({ progress, renderedFrames, encodedFrames }) => {
      const now = Date.now();
      if (now - lastLog > 15000 || progress >= 1) {
        lastLog = now;
        const elapsed = ((now - t0) / 1000).toFixed(1);
        console.log(
          `[Shard ${shardIndex}] ${(progress * 100).toFixed(1)}% | rendered=${renderedFrames} encoded=${encodedFrames} | ${elapsed}s`
        );
      }
    },
  });

  console.log(`[Shard ${shardIndex}] Finished in ${((Date.now() - t0) / 1000).toFixed(1)}s!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
