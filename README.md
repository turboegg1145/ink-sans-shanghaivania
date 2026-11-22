# Ink!Sans Fight — *Shanghaivania*

Full-length **3:44.7 (`13,484` frames, `1920×1080 @ 60fps`)** procedural 3D + 2D cel-shaded anime animation synced to **Valor Genesect — *Shanghaivania*** (`190.00 BPM`), built with **Remotion**, **Three.js (React Three Fiber)**, **custom GLSL shaders**, and **high-resolution original SVG/Canvas art**.

## Architecture & Original Assets

- **Deterministic Audio Intelligence (`src/core/audio.ts`, `src/core/timeline.ts`)**: Pre-extracted 60fps 5-band spectral features (RMS, Bass, Mid, High, Flux) + exact `190.00 BPM` bar/beat grid verified to single-frame accuracy across all 9 movements.
- **Custom GLSL Shaders (`src/shaders/`)**:
  - `inkWashShader.ts`: Two-stage domain-warped sumi-e fluid ink wash, Xuan paper mulberry fibers, capillary ink-bloom edge, monochrome void, and Act IX iridescent aurora spectrum.
  - `brushRibbonShader.ts`: 3D calligraphy brush ribbons with dry-brush *feibai* (飞白) bristle grooves and luminous paint-tip glow.
  - `blasterBeamShader.ts`: Volumetric Gaster Blaster plasma beam with pure incandescent core and longitudinal energy streaks.
- **Original Sculpted 3D & 2D Cel Assets (`src/assets/`)**:
  - `InkSansRig.tsx`: Multi-part anime cel-shaded Ink!Sans rig (10 morphing pupil styles, asymmetrical cheek smudge, articulated skeleton hands, windswept tattered scarf, 8 individually drainable glass vials on leather sash, giant Broomie paintbrush).
  - `GasterBlaster3D.tsx`: Procedurally sculpted horned dragon-skull 3D Gaster Blaster with inverted-hull ink outlines, articulated hinged jaw, rotating star pupils, sacred-geometry charge reticle, and volumetric beam + shock-rings.
  - `DoodleSphere3D.tsx`: 3D hemisphere of 42 floating curved sketchbook pages textured with 6 bespoke procedurally drawn ink illustrations + zero-gravity paint droplets.
  - `BattleBox3D.tsx`, `Soul3D.tsx`, `BoneAndDanmaku3D.tsx`, `BoneWheel3D.tsx`, `SacredMandala3D.tsx`: Morphing & splittable 3D Battle Box, all Undertale SOUL modes with Touhou graze sparks, sculpted bones, rotating bone pinwheels, Z-depth perspective bone corridors, and Touhou Rhodonea/logarithmic-spiral danmaku.
  - `AnimeCutInOverlay.tsx` & `DimensionalRiftLayer.tsx`: Pure sakuga close-up eye cut-in panels + Act VI surgical diagonal dimensional rift exposing retro v0.39 pixel Ink!Sans.

## Nine-Act Structure (`190.00 BPM`)

1. **Act I (`0:00.0 – 0:10.3`)** — Warm Xuan paper stillness, falling sumi teardrop, organic ink bloom, Ink!Sans emergence, Cinzel main title.
2. **Act II (`0:10.3 – 0:30.6`)** — Frame 620 paper shatter, 3D Battle Box, alternating bone waves, twin diagonal & cardinal 3D Gaster Blasters, sakuga eye cut-in.
3. **Act III (`0:30.6 – 0:40.6`)** — Quiet breath, rock-steady push-in, 8-vial translucent glass macro showcase, Cobalt/Gold Broomie dip.
4. **Act IV (`0:40.6 – 1:00.8`)** — Blue SOUL 4-wall gravity slams, flanking bone pinwheels, 6-Blaster 3D Hexagonal Ring climax.
5. **Act V (`1:00.8 – 1:41.3`)** — 32-bar Touhou × Megalovania showstopper: Rhodonea Rose danmaku, Z-depth bone tunnel, Broomie Battle Box Diagonal Split, counter-rotating spirals & 48-petal mandala.
6. **Act VI (`1:41.3 – 1:51.4`)** — Surgical Dimensional Pixel Rift tearing open to reveal retro v0.39 pixel Ink!Sans & `MISS`.
7. **Act VII (`1:51.4 – 2:41.9`)** — 40-bar Multiverse Surge: Purple silk rails, Yellow shooter counter-fire, Golden Z-tunnel, Phase 3 Crimson Awakening (`frame 8055`), crimson laser phalanx & multiverse collapse.
8. **Act VIII (`2:41.9 – 3:02.1`)** — 20-second Hollow Monochrome Void: all 8 vials visibly drain dry & crack, shadowed empty-eyed Void Ink!Sans, falling black teardrop, lone pulsing Crimson SOUL.
9. **Act IX (`3:02.1 – 3:44.7`)** — Nuclear prismatic reignition (`frame 10928`), 8-Blaster 360° Cathedral Dome (`frame 12141`), final cymbal slash (`frame 13203`), and full-circle resolution on warm Xuan paper.

## Sharded Cloud Rendering (GitHub Actions)

Trigger `.github/workflows/render.yml` via **Actions → Render Shanghaivania (1080p60 Sharded) → Run workflow**:
- Splits all `13,484` frames across **16 parallel Ubuntu runners** (`~843` frames each).
- Stitches all 16 H.264 chunks seamlessly with FFmpeg, muxes the 320kbps master `shanghaivania.mp3`, uploads the final `1080p60` MP4 artifact, and publishes a GitHub Release.
