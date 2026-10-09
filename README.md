# Tyre Lubricant experience

Independent, static React/TypeScript/Vite application for an illustrative manufacturing-intelligence story. Project source documents and reference media remain in their original folders; none of the reference videos are bundled into the runtime.

## Run locally

- `npm install`
- `npm run dev` (http://127.0.0.1:5173)
- `npm test` (single-worker deterministic unit contracts)
- `npm run build`
- `npm run test:journey` (Playwright Chromium must be installed)
- PowerShell: `$env:FULL_JOURNEY_QA='1'; npm run test:journey` enables later-chapter QA after the vertical-slice gate.

The `dist` directory is a static deployable site. No backend, authentication or machine-control connection is present. `?fallback` selects the accessible static story. The Read the story control also selects static presentation; OS reduced-motion preference selects it automatically.

In the development server, `?debug=1` opens the progress/camera/frame inspector, chapter jumps and ten CPU data channels at a selected surface coordinate. The inspector is excluded from production presentation. Production preview: `npm run preview` (http://127.0.0.1:4173).

See `docs/implementation-report.md` for the completed architecture, validation record and remaining production limitations.

## Source responsibilities

`SceneRegistry` contains six weighted chapters and named beats. GSAP ScrollTrigger writes one target progress into `ExperienceClock`. R3F consumes rendered progress; `JourneyController`, `CameraDirector`, `WorldDirector` and `StoryDirector` derive camera, actors and discrete meaning. Zustand contains semantic/preferences state only.

`DataDirector` owns one provider-created hero, its canonical SurfaceField and same-reference history record. CPU typed arrays feed RGBA8 GPU data. A progressive vertex transformation opens the measurement shell at the seam and retains UVs; it does not melt the rubber tyre or replace it with a picture.

Prototype normal/process/history models are algorithm-neutral illustrations. Final sensors, optical modality, production thresholds and model family remain open. See `docs/truth-ledger.md`, `docs/context-audit.md`, `docs/scene-requirements.md` and `docs/procedural-assets.md` for source context and limitations.

## Client separation

All implementation code and procedural geometry are independently created inside this project. No unrelated client code, shaders, assets or configuration were read or reused.
