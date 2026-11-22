import React from 'react';
import { Composition } from 'remotion';
import { LookDevShowcase } from './LookDevShowcase';
import { ShanghaivaniaMaster } from './ShanghaivaniaMaster';
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from './core/timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Shanghaivania"
        component={ShanghaivaniaMaster}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="LookDev"
        component={LookDevShowcase}
        durationInFrames={4}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
