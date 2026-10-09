I would finalize the stack and architecture as follows.

---

# Final Technology Stack

| Layer | Final choice | Responsibility |
|---|---|---|
| Application | **React + TypeScript** | UI, semantic content, application composition |
| Build system | **Vite** | Fast isolated SPA build, asset pipeline, deployment bundle |
| 3D runtime | **Three.js + React Three Fiber** | Tyre, conveyor, inspection cell, camera head, physical world |
| 3D helpers | **@react-three/drei — selective use only** | GLTF loading, environment/preload utilities |
| Scroll orchestration | **GSAP + ScrollTrigger** | Pinning the experience and translating page scroll into normalized progress |
| Scroll smoothing | **Lenis — desktop only and optional** | Light smoothing, never source of truth |
| App/semantic state | **Zustand** | Scene, story beat, settings, loading, reduced motion, UI state |
| Continuous animation state | **Custom ExperienceClock** | High-frequency progress without React re-renders |
| Surface/data computation | **TypeScript + TypedArrays** | Observation, confidence, validity, fingerprint, process model, history |
| GPU surface rendering | **Three.js DataTexture + custom GLSL** | Same surface data on 3D tyre and canonical map |
| Canonical unroll | **Custom vertex shader** | Curved inner surface → flat `(θ,s)` representation |
| Technical diagrams | **SVG + normal HTML** | Axes, annotations, timelines, relationships, labels |
| Trend rendering | **SVG** | Drift graphs, operating envelope, factor relationships |
| Styling | **CSS Modules + CSS Custom Properties** | Bespoke cinematic visual system |
| 3D creation | **Blender** | Tyre, conveyor, station, camera head, manufacturing geometry |
| Runtime asset format | **GLB/glTF** | Web-friendly 3D asset format |
| Geometry compression | **Meshopt** | Reduce model weight with fast decoding |
| Texture format | **KTX2/Basis** | GPU-compressed production textures |
| Asset optimization | **glTF Transform** | Prune, deduplicate, optimize, compress |
| Unit testing | **Vitest** | Math, data generation, camera paths, scene state |
| Browser testing | **Playwright** | Full scroll journey, reverse scrolling, responsive QA |
| Accessibility testing | **axe + Playwright** | Automated accessibility checks |
| Visual regression | **Playwright screenshots** | Scene/transition image comparison |
| Deployment | **Vercel static deployment initially** | Client review + production delivery |
| Backend | **None initially** | Prototype data remains entirely illustrative and local |

And one equally important choice:

# No Tailwind. No UI component library. No Framer Motion. No separate charting framework. No second animation engine.

Those would add overlapping abstractions without helping this particular project.

---

# Overall runtime relationship

The application should conceptually work like this:

```text
                         USER SCROLL
                              │
                              ▼
                    GSAP ScrollTrigger
                              │
                              ▼
                     JourneyController
                              │
                  global progress 0 → 1
                              │
                              ▼
                       ExperienceClock
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
 CameraDirector         WorldDirector          DataDirector
        │                     │                      │
        ▼                     ▼                      ▼
 Three.js camera       Physical actors         SurfaceField
                              │                      │
                              ▼                      ▼
                        tyre / station       GPU DataTextures
                        camera / conveyor      SVG data views
        │                                            │
        └────────────────────┬───────────────────────┘
                             ▼
                       StoryDirector
                             │
                             ▼
                           Zustand
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
          Copy              HUD           Accessibility
```

This structure is what makes the website controllable.

---

# 1. React's responsibility

React should **not** be the animation engine.

That is a very important architectural rule.

React should manage:

application mounting;

DOM structure;

copy;

scene semantic states;

accessibility;

loading states;

settings;

technical annotations;

Engineering Reality section;

debug tooling during development.

React should not receive a new:

```ts
progress = 0.437294
```

through state sixty times every second.

Doing that would create unnecessary rendering and make the experience harder to optimize.

So:

```text
React = application structure

Three.js = physical visuals

ExperienceClock = continuous movement

Zustand = semantic state
```

Keep those jobs separate.

---

# 2. One React application

The entire cinematic experience is one SPA.

Conceptually:

```text
<App>
    <Experience />
    <EngineeringReality />
</App>
```

Inside `Experience`:

```text
<ExperienceShell>

    <PersistentCanvas />

    <StoryOverlay />

    <HUD />

    <JourneyProgress />

    <AccessibilityLayer />

</ExperienceShell>
```

The canvas stays mounted.

The overlay stays mounted.

Scenes do not replace either one.

---

# 3. One persistent WebGL canvas

This should be a hard rule.

Not:

```text
Scene00Canvas
Scene01Canvas
Scene02Canvas
Scene03Canvas
Scene04Canvas
Scene05Canvas
```

Instead:

```text
                ONE CANVAS

                     │
                     ▼

         Persistent Production World

    Conveyor
        │
       Tyre
        │
 Inspection Cell
        │
 Inspection Head
        │
 Process Geometry
        │
 Surface Representation
```

Some elements become invisible or abstracted when appropriate.

But the canvas itself never disappears.

---

# 4. React Three Fiber's role

R3F gives us a declarative way to organize the Three.js world.

Conceptually:

```tsx
<Canvas>
    <ProductionWorld>
        <FactoryEnvironment />
        <ConveyorSystem />
        <TyreActor />
        <InspectionCell />
        <InspectionHead />
        <ProcessGeometry />
        <SurfaceActor />
    </ProductionWorld>
</Canvas>
```

But animation still happens mostly through refs.

For example:

```ts
tyreRef.current.position.x = ...
```

or shader uniforms:

```ts
material.uniforms.uUnwrap.value = ...
```

We should not continuously change React props to animate them.

---

# 5. Actor identity is persistent

This is another non-negotiable principle.

There is one:

`TyreActor`

for the hero tyre.

The tyre used in Scene 00 is the same runtime object that enters Scene 01.

Its inner surface becomes the source for Scene 02.

Its record feeds Scene 03.

Its observation goes into Scene 04.

Its record becomes part of Scene 05.

We don't do:

```text
Scene00Tyre
Scene01Tyre
Scene02Tyre
```

We do:

```text
HeroTyre
   │
   ├── physical state
   ├── inner surface
   ├── SurfaceField
   ├── process record
   └── history record
```

This gives the entire project continuity at both the narrative and software level.

---

# 6. GSAP's exact responsibility

I would use GSAP, but very deliberately.

GSAP ScrollTrigger should primarily answer:

> **How far through the experience has the visitor scrolled?**

It should not independently animate twenty objects with unrelated timelines.

So instead of:

```text
ScrollTrigger
    ↓
animate tyre

ScrollTrigger
    ↓
animate camera

ScrollTrigger
    ↓
animate labels

ScrollTrigger
    ↓
animate map
```

we have:

```text
ScrollTrigger
       ↓
GLOBAL PROGRESS
       ↓
Everything derives from that progress
```

Much safer.

---

# 7. GSAP should not own camera choreography

This is important.

I do **not** want:

```ts
gsap.to(camera.position, {
    x: ...,
    y: ...,
    z: ...
})
```

all over the project.

Instead:

```ts
cameraPose = cameraAt(scene, localProgress)
```

Then:

```ts
camera.position.copy(cameraPose.position);
camera.quaternion.copy(cameraPose.rotation);
camera.fov = cameraPose.fov;
```

Now scrolling backward is inherently correct.

No animation needs to “undo itself”.

---

# 8. The ExperienceClock

I would build a small custom system called something like:

`ExperienceClock`

It owns:

```ts
targetProgress
renderProgress
velocity
direction
deltaTime
```

ScrollTrigger updates:

`targetProgress`

The render loop approaches it smoothly.

Something conceptually like:

```text
Scroll position
      ↓
target progress
      ↓
small damping
      ↓
visual progress
```

This creates high-quality motion without making Lenis responsible for visual state.

---

# 9. Why Lenis is secondary

Lenis may improve desktop scrolling.

But the architecture must not require it.

Therefore:

```text
Native browser scroll
        │
      Lenis
    optional
        │
ScrollTrigger
```

On:

touch devices;

reduced-motion;

low-performance devices

we can disable it entirely.

Everything must continue working.

---

# 10. Zustand's role

Zustand handles **discrete meaning**, not animation.

Example state:

```ts
type ExperienceState = {
    sceneId: SceneId;
    beatId: BeatId;

    intelligenceEnabled: boolean;

    reducedMotion: boolean;
    lowPowerMode: boolean;

    assetsReady: boolean;
    webglAvailable: boolean;
};
```

Good Zustand state:

```text
scene = canonicalSurface

beat = unwrapping

reducedMotion = false
```

Bad Zustand state:

```text
cameraX = 4.293847

tyreRotation = 2.38491

unwrap = 0.583291
```

Those values belong in the continuous runtime.

---

# 11. The JourneyController

This is the real backbone.

It translates the entire page into:

```text
scene
+
local scene progress
+
global experience progress
```

Conceptually:

```ts
resolveJourney(globalProgress) => {
    sceneId,
    localProgress,
    previousScene,
    nextScene
}
```

The scene registry could contain:

```text
00 Arrival
01 Inspection
02 Canonical Surface
03 Normal Fingerprint
04 Process Intelligence
05 Drift + RCA
```

Each gets a relative scroll weight.

Not six unrelated ScrollTriggers.

---

# 12. Scene registry

I would centralize all scene metadata:

```ts
type SceneDefinition = {
    id: SceneId;
    scrollWeight: number;

    camera: CameraSequence;
    storyBeats: StoryBeat[];

    enterState: WorldState;
    exitState: WorldState;
};
```

Then:

```ts
const scenes = [
    arrival,
    inspection,
    canonicalSurface,
    normalFingerprint,
    processAware,
    processIntelligence,
];
```

This becomes the single story definition.

---

# 13. Do not hard-code progress everywhere

Avoid this:

```ts
if (progress > 0.31) ...
if (progress > 0.41) ...
if (progress > 0.52) ...
```

throughout dozens of components.

Instead:

```text
scene
    ↓
story beats
    ↓
semantic state
```

For example:

```ts
inspection.headDeploying
inspection.headLocked
inspection.scanning
inspection.coverageValidating
inspection.complete
```

Much easier to reason about.

---

# 14. Named Story Beats

Every scene gets its own local beat definitions.

Example Scene 01:

```text
inspection.positioned
inspection.enclosureClosed
inspection.headDeploying
inspection.headLocked
inspection.illuminationActive
inspection.rotationStarted
inspection.encoderVisible
inspection.acquiring
inspection.coverageChecking
inspection.complete
inspection.enteringSurface
```

StoryDirector maps local progress to these states.

Copy responds to semantic beats.

---

# 15. CameraDirector

All camera logic belongs in one subsystem.

Not inside scene components.

Conceptually:

```text
CameraDirector
│
├── arrivalCamera()
├── inspectionCamera()
├── canonicalCamera()
├── normalCamera()
├── processCamera()
└── historyCamera()
```

Each returns:

```ts
{
    position,
    target,
    fov,
    roll
}
```

given local progress and viewport type.

---

# 16. Shared boundary poses

Every scene boundary gets one canonical camera pose.

For example:

```text
Arrival exit
      =
Inspection entry
```

And:

```text
Inspection exit
      =
Canonical entry
```

This should be tested mathematically.

Not eyeballed.

Something like:

```ts
expect(
  distance(
    arrival.cameraAt(1),
    inspection.cameraAt(0)
  )
).toBeLessThan(EPSILON);
```

That single practice will prevent many artificial transitions.

---

# 17. Desktop and mobile camera paths are different

Do not crop desktop.

CameraDirector should support:

```ts
cameraAt(
    scene,
    progress,
    viewportProfile
)
```

Where profile is something like:

```text
desktop
tablet
mobile
```

The semantic beat stays the same.

The camera composition changes.

---

# 18. WorldDirector

CameraDirector answers:

> Where is the viewer?

WorldDirector answers:

> What is the physical world doing?

It controls:

hero tyre translation;

conveyor rollers;

inspection mast;

cell doors;

rotary stage;

tyre rotation;

camera-head visibility;

process geometry;

factory abstraction;

timeline-to-conveyor finale.

---

# 19. World motion should be mathematical

Example Scene 00:

```text
tyreDistance
        ↓
rollerRotation
```

rather than animating both separately.

Likewise Scene 01:

```text
scanProgress
     ↓
theta
     │
     ├── tyre rotation
     ├── encoder
     ├── acquisition coverage
     └── SurfaceField position
```

One value.

Multiple consequences.

This is exactly what we want.

---

# 20. DataDirector

DataDirector owns the intelligence side.

It does not draw the tyre.

It owns:

the hero `SurfaceField`;

verified-acceptable synthetic population;

normal fingerprint;

normal deviation;

illustrative process model;

process expected surface;

process residual;

production-history records;

drift signals;

illustrative associations;

what-if results.

Scene visuals ask DataDirector for these outputs.

---

# 21. The most important shared object: `SurfaceField`

This is the core data structure of the experience.

Something like:

```ts
interface SurfaceField {
    width: number;
    height: number;

    observation: Float32Array;
    confidence: Float32Array;
    validity: Uint8Array;

    normalMean?: Float32Array;
    normalVariation?: Float32Array;
    normalDeviation?: Float32Array;

    processExpected?: Float32Array;
    processDeviation?: Float32Array;
    residual?: Float32Array;
}
```

And metadata:

```ts
interface SurfaceMetadata {
    variantId: string;
    illustrative: true;

    thetaRange: [number, number];
    profileRange: [number, number];
}
```

The source architecture defines the canonical surface around `O(θ,s)` plus confidence and validity, while explicitly retaining source-image traceability. Pasted text (2)

---

# 22. CPU data is the source of truth

The source of truth is:

```text
TypedArrays
```

not:

```text
PNG files
```

or:

```text
shader-generated random noise
```

Why?

Because Scene 01, Scene 02, Scene 03, Scene 04 and Scene 05 must all refer to exactly the same surface.

So:

```text
SurfaceField
    ↓
     ├───────────────→ 3D tyre texture
     │
     ├───────────────→ canonical map
     │
     ├───────────────→ normal comparison
     │
     ├───────────────→ process comparison
     │
     └───────────────→ history thumbnail
```

That's probably the single most important architectural relationship.

---

# 23. GPU representation

We don't want to send giant float arrays to React every frame.

DataDirector creates GPU-friendly texture representations.

For example:

```text
measurementTexture

R = observation
G = confidence
B = validity
A = optional
```

Another:

```text
normalTexture

R = expected mean
G = variation
B = deviation
A = validity
```

Another:

```text
processTexture

R = expected
G = process deviation
B = residual
A = support
```

The CPU arrays remain authoritative.

Textures are render representations.

---

# 24. Use RGBA8/normalized textures initially

For the cinematic prototype, we don't need 32-bit scientific GPU precision.

Our data itself can stay `Float32Array`.

For rendering, normalize it to compact textures.

That gives:

better device compatibility;

smaller GPU memory;

faster upload;

fewer WebGL edge cases.

Later, if a real engineering prototype requires higher precision rendering, we can revisit.

---

# 25. The canonical unroll

This deserves its own architecture.

The innerliner measurement shell should have corresponding:

```text
curved positions

flat positions

UV coordinates
```

For every vertex.

Conceptually:

```ts
aCurvedPosition
aFlatPosition
uv
```

Shader:

```glsl
vec3 p = mix(
    aCurvedPosition,
    aFlatPosition,
    uUnwrap
);
```

This makes Scene 02 genuinely transform one surface.

Not swap models.

---

# 26. Progressive unwrapping

Instead of flattening everything at once:

```text
θ = 0° seam
    ↓
opening front propagates
    ↓
surface progressively flattens
```

The same UV coordinates remain intact.

Therefore:

the anomaly moves with the surface automatically.

No special-case animation needed.

---

# 27. Why WebGL owns the surface map

Some 2D visuals belong in SVG.

But the canonical surface itself should remain inside WebGL during the unwrapping sequence.

Why?

Because then:

```text
curved map
→
partially unwrapped map
→
flat map
```

is literally one geometry.

After it becomes flat, DOM/SVG annotations can overlay it.

---

# 28. SVG responsibility

SVG is ideal for:

θ axis;

s axis;

annotations;

measurement callouts;

trend lines;

operating envelope;

association paths;

process timeline;

factor ranking indicators;

engineering diagrams.

SVG is not ideal for:

large dynamically deforming surface textures.

That remains WebGL.

---

# 29. HTML responsibility

Use regular HTML for:

headlines;

descriptions;

labels;

buttons;

disclaimers;

navigation;

Engineering Reality section;

accessibility equivalents.

We should never embed critical text in WebGL textures.

---

# 30. Surface coordinate relationship

Internally:

```text
u = θ / 360°

v = normalized s
```

Then:

```text
(u,v)
  │
  ├── physical innerliner UV
  │
  └── canonical rectangular coordinate
```

That is what guarantees data continuity.

The source preserves both physical and normalized representations for measurement/reporting and cross-variant comparison. Pasted text (2)

---

# 31. Synthetic prototype data

Because we don't have validated production data, DataDirector should generate seeded illustrative data.

Very importantly:

```text
random()
```

should not be used directly.

Instead:

```text
seeded RNG
```

For example:

```ts
createIllustrativeTyre({
    seed: "hero-tyre",
    variant: "A"
});
```

Every refresh produces identical results.

---

# 32. Hero tyre data lineage

The hero tyre should have a traceable data path:

```text
Hero tyre

↓ Scene 01

observation acquisition

↓ Scene 02

SurfaceField

↓ Scene 03

normalDeviation

↓ Scene 04

processExpected
processDeviation
residual

↓ Scene 05

TyreHistoryRecord
```

The software architecture mirrors the narrative.

That is exactly what we want.

---

# 33. Normal model

Prototype implementation can remain intentionally simple.

For verified-acceptable synthetic tyres:

```text
surface 1
surface 2
surface 3
...
surface N
```

calculate:

```text
mean by coordinate
variation by coordinate
```

Then:

```text
current surface
      ↓
normal model
      ↓
spatial deviation
```

But the code should call it something neutral such as:

```ts
NormalModel
```

not:

```ts
ZScoreDetector
```

because the eventual production algorithm remains open.

---

# 34. Process model

Likewise, don't name the production abstraction after a specific ML algorithm.

Use:

```ts
ProcessModel
```

Interface:

```ts
interface ProcessModel {
    predict(
        variant: TyreVariant,
        geometry: GeometryContext,
        processState: ProcessState
    ): ProcessPrediction;
}
```

Prototype implementation:

```text
IllustrativeProcessModel
```

Later:

```text
ValidatedProcessModel
```

could implement the same interface.

The detailed source intentionally leaves the eventual model class open rather than selecting regression, boosting, neural or physics-informed approaches prematurely. Pasted text (2)

---

# 35. Process State

Use an extensible structure:

```ts
interface ProcessState {
    timestamp: number;

    values: {
        pressure?: number;
        flow?: number;
        duration?: number;
        nozzlePosition?: VectorLike;
        nozzleOrientation?: VectorLike;
        rotationSpeed?: number;
        nozzleDistance?: number;
        materialCondition?: number;
    };

    stationId?: string;
}
```

Optional fields are intentional.

The project architecture explicitly says not to assume every process variable will exist. Pasted text (2)

---

# 36. Prototype data provider abstraction

I would put an interface between the application and data source from day one.

Something like:

```ts
interface ExperienceDataProvider {
    getHeroTyre(): HeroTyreRecord;
    getNormalPopulation(): SurfaceRecord[];
    getProcessHistory(): ProcessHistory;
}
```

Current implementation:

```text
PrototypeDataProvider
```

Later:

```text
APIDataProvider
```

This means if the client eventually supplies real data, we don't have to rewrite the scenes.

---

# 37. No backend initially

I would **not** create:

FastAPI;

Node server;

database;

authentication;

REST API

for the first cinematic implementation.

There is no reason.

Everything is:

illustrative;

deterministic;

presentation focused.

Adding a backend now only increases failure surface.

The app can ship as static files.

---

# 38. If real client data arrives later

Then architecture becomes:

```text
Plant / validated source
          │
          ▼
      Backend API
          │
          ▼
     APIDataProvider
          │
          ▼
     same DataDirector
          │
          ▼
       same scenes
```

The visual application doesn't need restructuring.

That's the point of the provider interface.

---

# 39. 3D asset pipeline

Final pipeline:

```text
Real-world references
        ↓
Independent modelling in Blender
        ↓
UV / materials / LOD planning
        ↓
GLB export
        ↓
glTF Transform
        │
        ├── prune
        ├── deduplicate
        ├── resize textures
        ├── Meshopt
        └── KTX2
        ↓
Production GLB
        ↓
R3F
```

This pipeline is completely independent for the Tyre Lubricant engagement.

---

# 40. Tyre asset organization

The hero tyre should not be one merged mesh.

Prefer something like:

```text
HeroTyre
│
├── tread/exterior
├── sidewall
├── bead
├── innerliner
├── measurement shell
└── optional manufacturing details
```

The **measurement shell** is particularly important.

It is what becomes our canonical surface.

---

# 41. Inspection camera asset

Create a new unbranded industrial inspection-head model specifically for this project.

Use real public industrial panoramic-inspection products as physical reference.

But:

no copied CAD unless licensed;

no logo;

no false claim of final supplier selection.

Model hierarchy:

```text
InspectionHead
│
├── housing
├── panoramic optic
├── illumination assembly
├── mounting collar
├── alignment mark
└── mast connection
```

That modularity lets us replace the optics later.

---

# 42. Scene 00 physical asset relationship

```text
ConveyorActor
    │
    └── moves HeroTyre

HeroTyre
    │
    └── enters InspectionCell
```

WorldDirector drives these.

No data intelligence yet.

---

# 43. Scene 01 relationship

```text
InspectionCell
      │
      ├── positioning
      ├── lighting
      └── mast

InspectionHead
      │
      └── fixed sensing position

HeroTyre
      │
      └── rotates

rotation
   │
   └── theta
        │
        ├── encoder UI
        ├── acquisition progress
        └── SurfaceField registration
```

This is how we keep everything synchronized.

---

# 44. Scene 02 relationship

```text
HeroTyre.innerliner
        │
        ▼
measurement shell
        │
        ├── same UV
        ├── same SurfaceField
        └── unwrap shader
                │
                ▼
          canonical map
```

This is the signature transformation.

---

# 45. Scene 03 relationship

```text
Canonical Surface
       │
       ├── current observation
       │
       └── verified acceptable population
                     │
                     ▼
                 NormalModel
                     │
            ┌────────┴────────┐
            ▼                 ▼
          mean            variation
            │                 │
            └────────┬────────┘
                     ▼
             normal fingerprint
                     │
                     ▼
              current deviation
```

---

# 46. Scene 04 relationship

```text
Current Surface
       │
       │
ProcessState
       │
TyreGeometry
       │
       ▼
ProcessModel
       │
       ▼
Process Expected Surface
       │
       ▼
Compare with observation
       │
       ▼
Process deviation / residual
```

At the same time:

```text
NormalModel
    │
    └── D_normal

ProcessModel
    │
    └── D_process
```

Both survive.

---

# 47. Scene 05 relationship

```text
TyreRecord 1
TyreRecord 2
TyreRecord 3
...
TyreRecord N
       │
       ▼
ProcessHistory
       │
       ├── temporal deviation
       ├── spatial drift
       ├── process-state history
       └── residual history
                │
                ▼
         Drift Intelligence
                │
         association analysis
                │
          what-if support
                │
          engineer review
                │
          early warning
```

Again, the narrative and software structures match.

---

# 48. Asset loading

Do not block first paint on everything.

Use staged loading.

### Priority 0

HTML/CSS.

Opening copy.

Fallback image/poster.

### Priority 1

Hero tyre.

Conveyor.

Basic factory.

Opening camera environment.

### Priority 2

Inspection station.

Inspection head.

### Priority 3

Surface shaders/data.

### Priority 4

Process geometry.

History/timeline assets.

Then:

```text
requestIdleCallback
```

or equivalent background loading can prepare later resources.

---

# 49. Suspense

R3F can use Suspense for assets, but the whole page should not be:

```tsx
<Suspense fallback={<Spinner />}>
```

Instead the 3D canvas has a stable visual fallback.

Initial layout already exists.

Once critical assets are ready:

WebGL stage gently replaces the poster frame.

No layout shift.

---

# 50. QualityController

I would add a dedicated rendering quality controller.

Possible tiers:

```text
high
medium
low
static
```

It decides things like:

DPR;

shadow quality;

environment resolution;

background detail;

number of historical tyre instances;

postprocessing;

texture resolution.

---

# 51. DPR cap

Do not run at devicePixelRatio 3 on mobile.

Something conceptually like:

```text
desktop high: <= 1.5

tablet/mobile: <= 1.25–1.5
```

Then tune by testing.

Rendering a cinema-grade scene at 3× retina resolution is generally wasted GPU work.

---

# 52. Post-processing

Very limited.

Potentially:

subtle tone mapping;

small bloom only for practical lights if needed;

very subtle vignette only if it genuinely helps.

Avoid:

heavy depth-of-field;

motion blur;

chromatic aberration;

film scratches;

glitch;

lens distortion.

Physical realism should come from:

geometry;

materials;

lighting;

composition.

Not effects.

---

# 53. Lighting

Prefer:

HDR environment;

few area/directional lights;

baked/emissive practical fixtures;

one controlled tyre contact shadow.

Not:

15 dynamic lights.

The inspection cell can have specific lights activated during Scene 01.

---

# 54. Materials

Use PBR materials:

rubber;

painted metal;

anodized aluminum;

glass;

factory floor.

Do not bake data visualization into tyre textures.

The `SurfaceField` is applied separately.

This keeps:

physical material

and

measurement representation

distinct.

---

# 55. CSS architecture

I would use:

```text
styles/
    tokens.css
    reset.css
    typography.css
    experience.css
    hud.css
    engineering.css
```

plus component CSS modules.

Design tokens:

```css
--color-physical;
--color-idea-1;
--color-idea-2;
--color-idea-3;
--color-abnormal;
--color-background;
--color-text;
```

Do not scatter arbitrary hexadecimal colors through components.

---

# 56. No Tailwind

For this project, Tailwind doesn't buy us much.

We're not rapidly assembling forms and business dashboards.

We're art-directing:

cinematic compositions;

technical overlays;

precise typography;

responsive transitions.

CSS Modules + tokens are more controllable here.

---

# 57. No Framer Motion

GSAP already owns timeline/scroll orchestration.

Adding Framer Motion creates:

two easing systems;

two animation lifecycle models;

potential race conditions;

inconsistent motion.

Use:

GSAP for DOM/scroll orchestration;

ExperienceClock for high-frequency world state;

CSS for simple hover/focus transitions.

That's enough.

---

# 58. No generic chart library

The experience only needs a handful of curated technical charts.

Using a generic chart framework often creates a recognizable dashboard aesthetic.

Use SVG directly.

Examples:

drift line;

operating envelope;

parameter relationship;

factor ranking;

history markers.

This also gives us exact animation control.

---

# 59. No video assets for primary storytelling

No generated 50-video pipeline.

No MP4 scene transitions.

No sequence of AI-generated keyframes pretending to be continuous 3D.

The primary experience remains:

real-time geometry;

deterministic procedural data;

SVG;

HTML.

Video can only be considered later for decorative secondary use.

---

# 60. TypeScript module boundaries

I would organize the application roughly like this:

```text
src/
│
├── app/
│   ├── App.tsx
│   └── bootstrap.ts
│
├── experience/
│   │
│   ├── core/
│   │   ├── JourneyController.ts
│   │   ├── ExperienceClock.ts
│   │   ├── SceneRegistry.ts
│   │   ├── StoryDirector.ts
│   │   └── QualityController.ts
│   │
│   ├── camera/
│   │   ├── CameraDirector.ts
│   │   ├── cameraMath.ts
│   │   └── cameraProfiles.ts
│   │
│   ├── world/
│   │   ├── ProductionWorld.tsx
│   │   ├── WorldDirector.ts
│   │   └── actors/
│   │       ├── HeroTyre.tsx
│   │       ├── Conveyor.tsx
│   │       ├── InspectionCell.tsx
│   │       ├── InspectionHead.tsx
│   │       └── ProcessGeometry.tsx
│   │
│   ├── surface/
│   │   ├── SurfaceField.ts
│   │   ├── SurfaceGenerator.ts
│   │   ├── SurfaceTextures.ts
│   │   ├── MeasurementShell.tsx
│   │   └── shaders/
│   │
│   ├── intelligence/
│   │   ├── NormalModel.ts
│   │   ├── ProcessModel.ts
│   │   ├── PrototypeProcessModel.ts
│   │   ├── DriftModel.ts
│   │   └── AssociationModel.ts
│   │
│   ├── history/
│   │   ├── ProcessHistory.ts
│   │   └── HistoryGenerator.ts
│   │
│   ├── scenes/
│   │   ├── scene00-arrival/
│   │   ├── scene01-inspection/
│   │   ├── scene02-canonical/
│   │   ├── scene03-normal/
│   │   ├── scene04-process/
│   │   └── scene05-drift/
│   │
│   ├── overlays/
│   │   ├── StoryCopy.tsx
│   │   ├── TechnicalAnnotations.tsx
│   │   ├── JourneyRail.tsx
│   │   └── ContextHUD.tsx
│   │
│   └── state/
│       └── experienceStore.ts
│
├── data/
│   ├── providers/
│   │   ├── ExperienceDataProvider.ts
│   │   └── PrototypeDataProvider.ts
│   │
│   └── illustrative/
│
├── engineering/
│   └── EngineeringReality.tsx
│
└── styles/
```

That's a structure I would be comfortable freezing.

---

# 61. Scene folders should remain small

Scene folders should contain things like:

```text
scene03-normal/
    normal.scene.ts
    normal.camera.ts
    normal.beats.ts
    normal.copy.ts
```

They should **not** contain duplicate tyre renderers or separate world implementations.

Scenes define:

what happens.

Core systems define:

how it happens.

---

# 62. Example scene contract

Something conceptually like:

```ts
interface Scene {
    id: SceneId;
    weight: number;

    cameraAt(progress: number, viewport: ViewportProfile): CameraPose;

    deriveWorldState(progress: number): WorldState;

    deriveDataState(progress: number): DataVisualState;

    storyBeats: StoryBeat[];
}
```

This contract forces consistency.

---

# 63. Visual state should be derived

Prefer:

```text
progress
   ↓
state
```

not:

```text
event happened
   ↓
mutate object
   ↓
hope reverse scroll works
```

For example:

wrong:

```ts
if (progress > .5) cameraHead.deploy();
```

Better:

```ts
deployment = deploymentAt(progress);
```

Now reverse scrolling naturally retracts it.

---

# 64. No irreversible timeline callbacks

Avoid critical logic using:

```text
onComplete
onEnter
onLeave
```

Those can be used for analytics or low-priority effects.

They should not determine visual truth.

Visual truth derives from progress.

---

# 65. Reduced-motion architecture

Reduced motion should not be hacked in afterward.

ExperienceClock knows:

```text
reducedMotion = true
```

Then SceneRegistry swaps:

continuous cinematic transitions

for:

semantic static states.

Same content.

Different presentation.

---

# 66. Static fallback

If:

WebGL fails;

GPU is blacklisted;

context is lost;

device performance is extremely poor

then show a designed static version.

Not:

**Your browser is unsupported.**

The narrative can still use:

poster frames;

SVG;

copy;

static technical diagrams.

---

# 67. Performance strategy

I would set these rules from the beginning:

- one canvas;
- one hero tyre;
- no per-frame React state;
- no excessive DOM;
- no dozens of shadow-casting lights;
- no unnecessary particle systems;
- no high-DPR rendering;
- instancing for repeated historical tyres;
- compressed assets;
- seeded data generated once;
- DataTextures updated only when needed;
- SVG paths reused rather than regenerated every frame;
- inactive heavy assets hidden or LOD-reduced;
- later-scene assets deferred.

---

# 68. Performance targets

Not promises, but engineering targets:

Desktop modern GPU:

**60 fps target**

Mobile:

**smooth 45–60 fps target where hardware allows**

Low tier:

degrade visual detail rather than drop interaction responsiveness.

Core input-to-motion latency matters more than maintaining every decorative effect.

---

# 69. Automatic quality degradation

If measured frame time stays poor:

reduce:

DPR;

shadow resolution;

environment detail;

secondary machinery;

history-instance count;

certain shader effects.

Never degrade:

story copy;

canonical data;

semantic meaning;

critical geometry.

---

# 70. Testing architecture

There should be four test categories.

### Unit tests

Camera math.

Surface mapping.

Seeded data.

Normal model.

Process model.

Scene ranges.

### Continuity tests

Scene exit camera = next scene entry.

Hero tyre identity persists.

SurfaceField identity persists.

Coordinate mapping remains stable.

### Browser tests

Scroll forward.

Scroll backward.

Fast scroll.

Resize.

Mobile.

Reduced motion.

WebGL fallback.

### Visual regression

Screenshot scene checkpoints.

Compare to approved baselines.

---

# 71. Specific Scene 02 test

Choose one sample:

```text
thetaIndex = 300
profileIndex = 40
```

Then verify it maps to:

the correct curved-surface UV;

the correct flat-map UV;

the same data value.

That protects the project's signature transformation.

---

# 72. Specific Scene 03 test

Normal fingerprint must actually derive from the accepted synthetic population.

If the accepted population changes:

the fingerprint must change.

The hero tyre should not be accidentally included.

---

# 73. Specific Scene 04 test

Change:

`nozzlePosition`

in the illustrative process state.

Verify:

`processExpected`

changes.

Scroll backward.

Verify:

previous expectation returns exactly.

---

# 74. Specific Scene 05 test

Create:

one abnormal tyre followed by stable tyres.

Expected:

**no persistent drift state**.

Create:

gradually increasing repeated deviation.

Expected:

drift state eventually appears.

This matches the project's central distinction between an isolated defect and persistent deterioration. Pasted text (2)

---

# 75. Accessibility architecture

All essential information stays in DOM.

WebGL is enhancement.

Canvas:

```text
aria-hidden="true"
```

unless we deliberately provide canvas interaction requiring semantics.

The semantic article underneath/alongside the canvas contains:

scene title;

main explanation;

critical technical meaning.

Keyboard users can navigate chapter links.

Reduced motion retains all information.

---

# 76. Debug mode

For development, add:

```text
?debug=1
```

Then show:

global progress;

scene;

local progress;

beat;

FPS;

quality tier;

camera coordinates;

hero tyre theta;

unwrap value;

SurfaceField coordinates.

This will save enormous time.

It must never appear in production by default.

---

# 77. Scene-jump developer menu

Debug mode should allow:

```text
00 Arrival
01 Inspection
02 Canonical
03 Normal
04 Process
05 Drift
```

Clicking one jumps directly to its scroll range.

Otherwise developers will spend hours scrolling repeatedly to Scene 05.

---

# 78. Data-inspection debug panel

Also useful:

```text
Observation

Confidence

Validity

Normal Mean

Normal Variation

Normal Deviation

Process Expected

Process Deviation

Residual

Spatial Drift
```

Developers can temporarily switch the surface shader between channels.

Excellent for debugging continuity.

---

# 79. Repository separation

Given your NDA requirement, I would make the repository from scratch:

```text
tyre-lubricant-experience/
```

New:

`package.json`

`vite.config.ts`

`tsconfig.json`

design tokens;

scene architecture;

3D models;

textures;

shaders;

test suite;

documentation.

No source import from the mining project.

No components.

No copied files.

No copied configuration.

No proprietary assets.

No copied animation values.

High-level concepts such as continuous storytelling are implemented independently.

---

# 80. Project documentation

I would create these before serious implementation:

```text
README.md

TECHNICAL_TRUTH.md
VISUAL_BIBLE.md
EXPERIENCE_ARCHITECTURE.md
SCENE_SPEC.md
DATA_MODEL.md
ASSET_PIPELINE.md
PERFORMANCE_BUDGET.md
TESTING_STRATEGY.md
IMPLEMENTATION_STATUS.md
```

Especially:

# `TECHNICAL_TRUTH.md`

Every claim gets classified:

```text
CONFIRMED

PROPOSED

ILLUSTRATIVE

OPEN

FORBIDDEN CLAIM
```

This project needs that badly because engineering decisions are deliberately still open.

---

# 81. Example truth entries

```text
Tyre rotates during controlled inspection
→ CONFIRMED architecture

Controlled illumination
→ CONFIRMED architecture

One 360° panoramic probe
→ ILLUSTRATIVE prototype configuration

Camera count
→ OPEN

Area-scan vs line-scan
→ OPEN

Exact sensing wavelength
→ OPEN

Normal fingerprint is variant-specific
→ CONFIRMED architecture

Process model algorithm
→ OPEN

Synthetic process values
→ ILLUSTRATIVE

Automatic PLC correction
→ FORBIDDEN CLAIM

Confirmed causal RCA
→ FORBIDDEN unless externally validated
```

This prevents future coding agents from accidentally turning visual decisions into engineering claims.

---

# 82. `VISUAL_BIBLE.md`

This should freeze:

hero tyre;

station layout;

camera-head visual language;

materials;

lighting;

coordinate visual language;

surface palettes;

Idea 1 blue;

Idea 2 amber;

Idea 3 green;

abnormality red;

typography;

camera framing rules;

label grammar;

illustrative-data badge;

motion rules.

Before creating a large asset library.

---

# 83. `DATA_MODEL.md`

This should define:

`SurfaceField`

`HeroTyreRecord`

`ProcessState`

`ProcessPrediction`

`NormalFingerprint`

`ProcessHistory`

`DriftState`

`AssociationResult`

along with:

what is illustrative;

what is frozen;

what may later map to production APIs.

This is extremely important.

---

# 84. Complete runtime flow

Once everything is assembled, the application behaves like this:

```text
PAGE LOAD
   │
   ▼
React mounts
   │
   ├── DOM shell immediately visible
   │
   └── AssetManager starts loading
              │
              ▼
       Critical GLB assets
              │
              ▼
        R3F world ready
              │
              ▼
         Hero stage shown
              │
              ▼
          USER SCROLL
              │
              ▼
        ScrollTrigger
              │
              ▼
      target progress
              │
              ▼
      ExperienceClock
              │
      ┌───────┼────────┬──────────┐
      ▼       ▼        ▼          ▼
   Camera   World     Data       Story
      │       │        │          │
      └───────┼────────┼──────────┘
              ▼
          final frame
```

That same loop runs for the entire experience.

---

# 85. Scene relationship to systems

| Scene | Camera | World | Surface/Data | SVG/DOM |
|---|---|---|---|---|
| **00 Arrival** | Major role | Major role | Minimal | Opening copy |
| **01 Inspection** | Major role | Major role | Acquisition begins | Encoder/coverage |
| **02 Canonical** | Major → stable | Measurement shell | Major role | Coordinates/O-C-M |
| **03 Normal** | Mostly stable | Minimal | Major role | Population/labels |
| **04 Process** | Light engineering depth | Process geometry | Major role | Process relationships |
| **05 Drift** | Analytical → physical finale | Returns strongly at end | Major role | Timeline/RCA/what-if |

This is the balance I want.

Not every scene needs to flex the 3D renderer equally.

---

# 86. Why this stack fits this specific project

The stack works because every technology has one clear job.

**React**  
owns the application.

**TypeScript**  
owns contracts and technical correctness.

**Three.js/R3F**  
owns physical space.

**GSAP ScrollTrigger**  
owns scroll interpretation.

**ExperienceClock**  
owns continuous progress.

**Zustand**  
owns semantic state.

**TypedArrays**  
own the actual illustrative scientific fields.

**DataTextures + shaders**  
connect those fields to 3D.

**SVG**  
owns precise engineering communication.

**CSS**  
owns art direction.

**Blender/glTF**  
owns physical asset production.

**Vitest/Playwright**  
prove that continuity survives implementation.

Nothing overlaps unnecessarily.

---

# 87. The relationship I would freeze above everything else

The architecture should revolve around this:

```text
                     HERO TYRE
                         │
                         ▼
                  PHYSICAL SURFACE
                         │
                         ▼
                    SurfaceField
                         │
             ┌───────────┼───────────┐
             │           │           │
             ▼           ▼           ▼
         NORMAL       PROCESS      HISTORY
          MODEL        MODEL
             │           │           │
             ▼           ▼           ▼
        D_normal      D_process     DRIFT
             │           │           │
             └───────────┼───────────┘
                         ▼
                     EVIDENCE
                         │
                         ▼
                 ENGINEER DECISION
```

And visually:

```text
SurfaceField
     │
     ├── physical tyre
     ├── canonical surface
     ├── normal fingerprint
     ├── process expected
     ├── residual
     └── spatial history
```

**One object. One coordinate system. One data lineage. Multiple levels of intelligence.**

That is the software architecture and also the story architecture.

---

# 88. One final decision I would make now

I would **not start by building all six scenes**.

The first implementation milestone should be a technical vertical slice proving the architecture:

```text
Scene 00 tyre on conveyor
        ↓
Scene 01 inspection head deployment
        ↓
tyre rotates
        ↓
theta progresses
        ↓
SurfaceField is populated
        ↓
Scene 02 innerliner unwraps
        ↓
same anomaly lands at same coordinate
```

Nothing beyond that.

If that works beautifully:

the architecture is right.

If that sequence feels artificial:

we fix the foundation before Scene 03–05 exist.

That protects us from repeating the previous failure mode of creating a huge amount of material around a weak continuity system.

---

# Final frozen stack

I would now formally freeze:

**React + TypeScript + Vite**  
for the application.

**Three.js + React Three Fiber**  
for one persistent physical world.

**GSAP + ScrollTrigger**  
for scroll measurement and narrative orchestration.

**Custom ExperienceClock**  
for smooth deterministic continuous progress.

**Zustand**  
for discrete semantic/application state only.

**TypedArrays + deterministic seeded generators**  
for the illustrative engineering data.

**Three.js DataTextures + custom GLSL**  
for physical/canonical surface continuity.

**SVG + HTML**  
for engineering communication and accessible content.

**CSS Modules + design tokens**  
for bespoke styling.

**Blender → GLB → glTF Transform → Meshopt + KTX2**  
for the independent asset pipeline.

**Vitest + Playwright + axe**  
for correctness, continuity, visual QA and accessibility.

**Static Vercel deployment initially; no backend until real data integration actually requires one.**

And the main technical principle I would put at the top of `EXPERIENCE_ARCHITECTURE.md` would be:

> **Nothing in the experience should animate because “the previous animation completed.” Every visible state must be reproducible from the current journey progress and the current underlying data.**

That is what will make forward scrolling, reverse scrolling, mobile composition, scene continuity, debugging, and investor/client presentation quality all much more reliable.