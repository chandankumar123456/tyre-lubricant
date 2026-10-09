# Scene 02/05 — **From Captured Tyre → Canonical Digital Surface**

This should be the **first major “how did they do that?” moment** of the website.

Scene 00 established the tyre.

Scene 01 established controlled, synchronized acquisition.

Scene 02 now answers the most important bridge question in the entire architecture:

> **How do many camera observations from a rotating, curved tyre become one precise surface representation that can actually be compared across tyres?**

The answer is not “AI makes a heatmap.”

It is:

> **Geometry + encoder position + surface registration → one canonical `(θ,s)` representation.**

The technical documentation is very explicit about this. The fundamental representation is not the raw image; observations are registered to tyre-surface coordinates, with `θ` around the circumference and `s` following the inner-surface profile.

This scene should make that idea understandable **without needing the client to understand computer vision or coordinate geometry beforehand.**

---

# 1. Scene identity

Internal name:

`scene-02-canonical-surface`

Visible title:

# **TURN THE TYRE INTO MEASURABLE SPACE**

Secondary line later:

**One tyre. One coordinate system. Every observation has a place.**

I would avoid:

**Digital Twin**

because that term brings much broader expectations than the architecture currently establishes.

I would also avoid:

**3D Reconstruction**

because the important output here is the canonical inner-surface representation, not necessarily a complete photorealistic 3D twin.

---

# 2. What Scene 02 must accomplish

By the end, the viewer should understand five things.

### 1. Raw camera images are not directly comparable

Different perspective, position, optics, sampling and geometry can make naïve pixel-to-pixel comparison unreliable.

### 2. Every observed region is attached to tyre coordinates

We know its circumferential location `θ`.

And where it lies across the inner-surface profile `s`.

### 3. The curved surface can be unwrapped

Like taking the label off a cylinder — except more carefully because a tyre's inner surface is curved.

### 4. Every tyre ends up in the same kind of coordinate space

That is what enables later comparison.

### 5. We retain more than one “image”

The canonical representation conceptually includes:

`O(θ,s)` — observation

`C(θ,s)` — confidence

`M(θ,s)` — validity

while source imagery remains traceable evidence.  

If those five ideas land, Scene 02 succeeds.

---

# 3. Where Scene 02 begins

Scene 01 ended **inside the tyre**.

We are not cutting to a chart.

The current frame should look approximately like:

```text
╭────────────────────────────────────────────╮
│                                            │
│       CURVED INNER TYRE SURFACE            │
│                                            │
│                   ●                        │
│                  region                    │
│                                            │
│             θ = reference                  │
│                                            │
╰────────────────────────────────────────────╯
```

The innerliner occupies almost the entire screen.

The last observation acquired in Scene 01 remains subtly highlighted.

Maybe that region corresponds illustratively to:

`θ ≈ 217°`

The number is just a demonstrative coordinate, not production data.

The important thing is that **the same highlighted physical patch survives into Scene 02.**

That is our continuity carrier.

---

# 4. Do not start by flattening the tyre immediately

That would be visually impressive but educationally weak.

First establish the problem:

> We captured observations — but camera frames themselves are not yet the common measurement space.

So for the first portion of the scene, we should briefly expose how the raw observations relate to the physical tyre.

---

# 5. Phase 1 — Raw observations appear in place

The viewer is still inside the tyre.

The tyre rotates slightly or the view subtly tracks along the surface.

Small photographic/optical observation regions become visible over the innerliner.

Not floating cards.

They remain **attached to the actual surface locations from which they came.**

Think:

```text
PHYSICAL INNER SURFACE

      [observation]
           ↓
╭────────────────────────────╮
│          ▧                 │
│                 ▧          │
│      ▧                     │
│                    ▧       │
╰────────────────────────────╯
```

Each region is associated with an angle.

For example:

```text
θ = 214°
θ = 215°
θ = 216°
θ = 217°
```

We do not need to display all of those numbers simultaneously.

Maybe one current position is visible while the others become small ticks.

---

# 6. First narrative line

Once the viewer sees raw observations attached to the curved surface:

# **CAPTURE IS ONLY THE BEGINNING.**

Then:

**Camera observations still depend on where and how they were seen.**

This prepares the need for registration.

No paragraph.

---

# 7. Why raw images are not enough

This is where we need a clever, fast visual explanation.

I would not show a slide with six bullet points.

Instead, choose one physical point on the innerliner.

The viewer sees it from three slightly different illustrative camera observations.

The same point appears at different pixel locations.

Something like:

```text
CAMERA VIEW A        CAMERA VIEW B        CAMERA VIEW C

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│        ●     │     │    ●         │     │          ●   │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘

             same physical surface location
```

Then those three views fade back onto the tyre.

Copy:

> **Different pixels. Same physical location.**

That is probably enough.

The documentation explicitly says camera perspective, position, lens distortion, tyre orientation, geometry and sampling density can make raw image comparison unreliable. 

---

# 8. Phase 2 — Establish `θ`

Now we build the first coordinate.

The cinematic camera slowly pulls outward just enough that we begin perceiving the tyre's circular geometry.

The currently highlighted patch stays selected.

A very subtle circular coordinate band appears around the tyre.

Not glowing.

More like a precise drafting overlay.

```text
                    0°
                    │

        270° ───── TYRE ───── 90°

                    │
                   180°
```

Then the current patch gets:

`θ = 217°`

This immediately answers:

> Where around the tyre is this observation?

---

# 9. θ should emerge from Scene 01's encoder

This is important for continuity.

Do not invent `θ` in Scene 02 as a new mathematical idea.

The angular position already existed physically in Scene 01 through the rotation encoder.

So visually:

```text
ENCODER ANGLE
     ↓
θ(t)
     ↓
SURFACE LOCATION
```

The encoder ring from Scene 01 can transform into the coordinate ring now wrapping the tyre.

That is a much stronger transition than:

“here is a new coordinate diagram.”

The viewer experiences:

> the encoder wasn't just machinery — it is what makes spatial registration possible.

---

# 10. Phase 3 — Establish `s`

`θ` alone only tells us where around the circumference we are.

Now we need the second coordinate.

This requires more care.

The detailed technical architecture defines `s` as position **along the curved inner-surface profile**, roughly from one bead region across the interior to the other. 

So we should not depict:

```text
s = vertical screen coordinate
```

or simply:

```text
s = tyre height
```

That would be misleading.

---

# 11. How to visually explain `s`

I would temporarily section the tyre.

Not with a violent exploded view.

Instead, one transparent clipping plane reveals the cross-section.

The camera rotates gently toward that cross-sectional view.

We see:

```text
               INNER SURFACE

             ╭──────────────╮
          ╭──╯              ╰──╮
        ╭─╯                    ╰─╮

       ●──────────────────────────●
     bead                        bead

        ←──── surface path s ────→
```

Then a thin line traces the actual curvature of the innerliner.

Text:

**`s` follows the inner surface.**

This should take only a few seconds of scroll.

It should feel like an engineer drawing directly onto the tyre.

---

# 12. Keep the highlighted patch

Our `θ≈217°` region is still selected.

Now within that angular slice, one point gets a second coordinate.

For example:

```text
θ = 217°
s = 0.63 L
```

But I would be careful with illustrative numeric units.

Maybe use:

`θ`

and:

`s`

without an exact numeric `s`.

The conceptual point matters more.

Now the viewer understands:

> one surface observation has two coordinates.

---

# 13. The coordinate pair

This should be one of the cleanest moments.

All other annotations disappear.

Only the selected region remains.

Next to it:

# **( θ , s )**

Then underneath:

**A location on the tyre — not merely a pixel in an image.**

That one line summarizes the architectural leap.

---

# 14. Phase 4 — Put the grid on the physical tyre

Now the `(θ,s)` concept expands across the full inner surface.

A fine coordinate grid progressively appears **on the actual curved innerliner**.

Circumferential grid lines correspond to angular positions.

Profile-direction lines correspond to `s`.

The tyre now looks like an engineering measurement surface.

But:

keep the grid sparse.

Don't turn it into Tron.

No glowing blue wireframe.

Think CAD drafting overlay with about 15–25% opacity.

---

# 15. What the viewer should see

Something conceptually like:

```text
         PHYSICAL TYRE INNERLINER

          θ → around circumference

       ╭──────────────────────────╮
     ╭─│─│─│─│─│─│─│─│─│─│─│─│─╮
    │  ──────────────────────────  │
    │  ──────────────────────────  │  s
    │  ──────────────────────────  │  ↓
     ╰─│─│─│─│─│─│─│─│─│─│─│─│─╯
       ╰──────────────────────────╯
```

Obviously the actual surface is toroidal, not rectangular.

That is precisely why the transformation is visually interesting.

---

# 16. This is where we reveal registration

The raw observation tiles from earlier now begin snapping to the coordinate grid.

Not dramatically.

They simply align.

Perspective differences disappear.

Overlaps resolve.

Each observation becomes a measured portion of one common surface.

The visual idea:

```text
RAW VIEW A  ┐
RAW VIEW B  ├── geometric registration ──→ SURFACE LOCATION
RAW VIEW C  ┘
```

But do it spatially rather than with a flowchart.

---

# 17. Do not imply perfect data

This is also the moment where we should allow slight edge irregularities or missing regions.

We don't want the transformation to look magical.

A few portions can remain visibly uncertain.

That prepares us for confidence and validity later.

The system isn't pretending every camera pixel automatically maps perfectly.

---

# 18. Phase 5 — The signature unwrapping moment

Now comes the major cinematic transformation.

This is the sequence the entire website could be remembered for.

The physical tyre is still visible.

The coordinate grid exists.

The measured surface field exists.

Now we begin turning the 3D curved surface into its canonical 2D representation.

---

# 19. How I would stage the unwrapping

Do **not** make the entire tyre physically melt into a rectangle.

That risks becoming abstract and weird.

Instead:

the exterior tyre remains in the world initially.

The **inner-surface measurement layer** separates from it by perhaps a few millimetres visually.

Think of a very thin conformal surface shell.

```text
PHYSICAL TYRE
     +
MEASUREMENT SURFACE
```

The measurement surface becomes the object we transform.

This distinction communicates:

> we're transforming the representation, not physically deforming a real tyre.

---

# 20. First separation

The coloured/neutral observation layer lifts very slightly away from the rubber.

Not like peeling wallpaper.

More like an engineering overlay becoming independent.

The tyre stays behind.

The grid remains on the measurement layer.

The highlighted `θ≈217°` region stays fixed.

---

# 21. Open the circumference

Choose a canonical seam at:

`θ = 0° / 360°`

The measurement surface subtly indicates that seam.

Then the surface begins opening there.

Imagine cutting a cylindrical label and laying it flat.

But because the tyre innerliner has a curved profile, the transformation needs to preserve `s` intelligently.

The viewer should perceive:

```text
CLOSED CIRCUMFERENCE
       ↓
OPEN AT θ = 0°
       ↓
UNROLL
```

---

# 22. Camera transformation

Simultaneously, the cinematic camera changes.

This is critical.

At the start:

perspective.

During the unroll:

focal length effectively increases / perspective distortion reduces.

At the end:

almost perfectly orthographic.

That makes the physical → mathematical transition feel natural.

The world itself doesn't suddenly become “digital.”

The **camera language becomes analytical.**

---

# 23. Transformation progression

Conceptually:

```text
0%

        curved inner shell
            ╭─────╮
         ╭──╯     ╰──╮


30%

       ╭────────────────╮
      ╱                  ╲
     ╱                    ╲


60%

   ╭────────────────────────╮
   │                        │
   ╰────────────────────────╯


100%

0°                                      360°
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│                                          │
└──────────────────────────────────────────┘
               s
```

The selected region never teleports.

The user can visually track it through the transformation.

---

# 24. The continuity test

This should be one of our explicit QA requirements.

Suppose a selected physical patch begins at:

```text
θ = 217°
s ≈ middle-inner-profile
```

After unwrapping, it must appear approximately:

```text
x = 217 / 360 of map width
y = corresponding s location
```

That should be mathematically true.

Not eyeballed.

Not hand-animated.

Not a crossfade between unrelated textures.

---

# 25. Technical implementation of that continuity

Within the planned application, the surface field should already use normalized coordinates.

Conceptually:

```ts
u = theta / (2 * Math.PI)
v = normalizedSurfaceProfilePosition
```

The innerliner mesh should use compatible UVs.

Then:

```text
3D representation
(u,v) → curved innerliner

2D representation
(u,v) → flat rectangle
```

Same data.

Different geometry.

That is the core trick.

---

# 26. Do not generate the canonical map as an image

This is important enough to state explicitly.

Do not export:

`surface-map.png`

and fake the transformation.

The canonical map needs to be rendered from the same data structure used on the tyre.

For example:

```text
SurfaceField
↓
GPU DataTexture on tyre

same SurfaceField
↓
Canvas/WebGL/SVG canonical view
```

Then continuity becomes inherent.

---

# 27. The tyre itself should remain somewhere

When the measurement layer has fully flattened, don't instantly remove the physical tyre.

For a short beat:

we see both.

Perhaps:

```text
PHYSICAL TYRE            CANONICAL SURFACE
     ◯             →     ┌──────────────────┐
                         │                  │
                         └──────────────────┘
```

This allows the client to connect the two representations.

Then the physical tyre recedes gently.

The map becomes dominant.

---

# 28. First major copy after unwrapping

# **SAME SURFACE. NEW REPRESENTATION.**

Then:

**Every tyre can now be compared in the same coordinate system.**

That sentence is strategically important.

It explains why we went through all of this.

---

# 29. Physical and normalized coordinates

The architecture preserves both physical and normalized coordinate systems.

I would not spend a huge scene explaining the mathematics.

But we can introduce this elegantly.

At the bottom of the canonical surface:

```text
PHYSICAL
θ = degrees
s = surface distance

NORMALIZED
u = 0 → 1
v = 0 → 1
```

Then a short visual shows two different illustrative tyre variants.

Their physical dimensions differ.

Their normalized maps align.

---

# 30. Variant comparison micro-sequence

This is worth maybe 8–10% of the scene.

Two simple outlines:

```text
VARIANT A                    VARIANT B

larger profile               smaller profile
      ↓                            ↓
physical map                  physical map

        \                        /
         \                      /
          ↓                    ↓

       NORMALIZED SURFACE SPACE
```

The point:

> physical measurements remain meaningful, while normalized coordinates allow structural comparison.

Do not imply that all variants have identical expected spray patterns.

Idea 1 later remains variant-specific.

---

# 31. Phase 6 — Introduce the observation map

Now the canonical map is established.

Only now should the raw optical response begin looking like the more familiar technical surface maps from the PDF.

Title:

# **OBSERVATION**

Then:

`O(θ,s)`

The map can use a restrained sequential scale.

But label it carefully:

**Illustrative measured surface response**

not:

**lubricant thickness**

unless thickness is truly what the future sensor measures.

The architecture intentionally keeps the optical measurement modality open.  

---

# 32. What `O(θ,s)` means visually

Every cell/pixel represents:

> what the inspection system observed at this surface location.

It might ultimately encode:

intensity,

colour,

texture,

reflectance,

spectral response,

multiple channels,

or a learned representation.

We do not need to show all of that.

One restrained annotation:

**Surface response — sensing modality to be validated during engineering.**

---

# 33. Then split the canonical map

The observation map remains centered.

It duplicates vertically into three aligned layers.

Not a fancy exploded animation.

A precise separation.

```text
        OBSERVATION O(θ,s)
┌────────────────────────────┐
│                            │
└────────────────────────────┘

        CONFIDENCE C(θ,s)
┌────────────────────────────┐
│                            │
└────────────────────────────┘

        VALIDITY M(θ,s)
┌────────────────────────────┐
│                            │
└────────────────────────────┘
```

This is one of the most important engineering messages in the site.

---

# 34. Observation layer

Keep the original surface pattern.

Label:

**What was observed?**

No more explanation required.

---

# 35. Confidence layer

Now we show that some regions are more reliable than others.

For example:

most map:

high confidence.

One small glare-like area:

lower confidence.

One blur region:

reduced confidence.

Important:

Do not randomly place them.

The same uncertain areas must correspond to the underlying illustrative acquisition data.

Copy:

**How reliable is the measurement here?**

This makes confidence intuitive.

---

# 36. Validity layer

Now reduce the representation to:

valid

versus

invalid / not trustworthy.

A small region maybe appears invalid.

Text:

**Was this region inspected successfully?**

This is the perfect place to reinforce a critical distinction:

> Missing data is not the same as missing lubricant.

That sentence should probably appear.

It is excellent.

---

# 37. Strong narrative line

# **NO DATA ≠ NO LUBRICANT**

Then:

**Uncertain or incomplete regions are marked as such — not silently interpreted as defects.**

That is both technically serious and easy for clients to understand.

The architecture specifically describes this because blur, glare, saturation, occlusion or poor reconstruction should not become fake lubricant defects.

---

# 38. Optional invalid-region demonstration

We can briefly show one illustrative region.

Observation:

dark / ambiguous.

Naïve interpretation might say:

**missing spray**

But then:

confidence falls,

validity becomes invalid.

The “missing spray” interpretation disappears.

Instead:

**REINSPECT / INSUFFICIENT EVIDENCE**

This is a very strong demonstration of engineering maturity.

---

# 39. Avoid turning it into a dashboard

Even though we now have multiple maps, the layout should not become:

three rounded cards side by side.

No SaaS UI.

No stat cards.

No pills.

The maps should float in a clean technical composition directly in the cinematic world.

Think:

technical plate.

Not:

dashboard.

---

# 40. Phase 7 — Traceability

Now we answer:

> if the system flags something later, can we get back to the source observation?

Select our persistent `θ≈217°` region again.

The corresponding canonical area highlights.

A thin line extends backward.

One or more source image snippets appear.

Conceptually:

```text
CANONICAL REGION
      ↓
(θ,s)
      ↓
ACQUISITION RECORD
      ↓
SOURCE OBSERVATION
```

This is important because the source documentation explicitly retains original imagery and acquisition metadata as traceable evidence. 

---

# 41. The traceability animation

I would stage it like this.

User is looking at canonical surface.

One pixel/region expands slightly.

A coordinate appears:

`θ`

`s`

Then:

`source observation`

appears off to the side.

Maybe also:

`acquisition timestamp`

`camera/view reference`

but avoid fake values.

Use labels rather than fabricated identifiers.

The point is:

> the digital map does not erase the evidence.

---

# 42. Strong copy

# **MEASURABLE DOES NOT MEAN UNTRACEABLE.**

Then:

**Every mapped region can remain linked to its source observation.**

Short.

Credible.

---

# 43. The main emotional progression of Scene 02

The scene should feel like:

```text
CURVED
↓
COMPLEX
↓
REGISTERED
↓
ORDERED
↓
COMPARABLE
```

Scene 01 had mechanical precision.

Scene 02 has mathematical elegance.

That difference in tone matters.

---

# 44. Camera language

This scene should show a clear transition from physical camera language to analytical camera language.

### Beginning

Still somewhat physical.

We are inside the tyre.

Perspective.

Small camera movement.

### Coordinate phase

Camera becomes more stable.

### Unwrapping

Camera gradually becomes orthographic.

### Final map

No cinematic drift.

Perfectly stable analytical framing.

This visually says:

> we have moved from physical reality to measurement space.

---

# 45. Do not make “digital” equal “neon”

A common mistake would be:

physical tyre = dark realistic world;

digital map = suddenly black background + blue neon.

Don't do that.

The visual language should remain one system.

Same neutral background.

Same typography.

Same lighting philosophy.

The geometry becomes abstract.

The brand world does not.

---

# 46. Background transformation

The physical inspection-cell environment should gradually lose detail.

Not crossfade out.

Instead, depth falls away.

Walls and equipment recede into pale low-contrast geometry.

By the time the map is fully flat, the background is effectively:

clean technical field.

This is analogous to the camera focusing on the representation and letting the physical room become irrelevant.

---

# 47. Scene 02 progress choreography

A strong starting timeline:

| Progress | Event |
|---:|---|
| **0.00–0.06** | Exact continuation from Scene 01, inside tyre. |
| **0.06–0.14** | Raw observations remain attached to physical regions. |
| **0.14–0.22** | Demonstrate why camera pixels alone are not a common coordinate system. |
| **0.22–0.32** | Encoder/angle becomes circumferential coordinate `θ`. |
| **0.32–0.41** | Cross-section reveals curved profile coordinate `s`. |
| **0.41–0.48** | `(θ,s)` coordinate pair established. |
| **0.48–0.57** | Coordinate grid propagates across innerliner; observations register. |
| **0.57–0.73** | Signature inner-surface unwrapping. |
| **0.73–0.78** | Physical tyre + flat representation shown together. |
| **0.78–0.84** | Physical vs normalized coordinate concept. |
| **0.84–0.89** | Observation `O(θ,s)`. |
| **0.89–0.94** | Confidence + validity layers. |
| **0.94–0.97** | Invalid-region / evidence distinction. |
| **0.97–1.00** | Traceability + transition toward “normal”. |

Again, exact values should be tuned through actual interaction testing.

---

# 48. Recommended scroll length

This is probably the longest technical transformation.

Desktop:

**420–500vh**

Tablet:

**330–400vh**

Mobile:

**270–340vh**

That sounds large, but we're not writing paragraphs.

The scroll distance is giving complex geometry enough time to be understood.

The user should never feel stuck because something meaningful keeps changing.

---

# 49. Important scroll behavior

During the actual unwrapping interval:

I would deliberately make the visual response slightly more direct.

The user's scroll should feel like they are **physically unrolling the surface**.

Before and after, we can have more smoothing.

During the signature transformation:

less lag.

More tactile.

This could be extremely satisfying.

---

# 50. Reverse scroll is especially important here

If the user scrolls backward:

the canonical map must wrap back onto the tyre.

Confidence/validity layers recombine.

Coordinate grid curves.

The surface closes.

The tyre becomes physical again.

No visual popping.

This is one of the best tests of whether the architecture is genuinely progress-driven or merely a series of one-way animations.

---

# 51. 3D implementation concept

There are two reasonable implementation strategies.

## Strategy A — Parametric surface interpolation

Have both:

curved geometry position,

and flat geometry position

for corresponding vertices.

Then interpolate:

```ts
position = mix(curvedPosition, flatPosition, unwrapProgress)
```

This is the cleanest approach if the innerliner measurement shell has known topology.

### Advantages

perfectly reversible;

GPU efficient;

same UVs;

same texture;

precise correspondence.

This is my preferred method.

---

# 52. Shader deformation

The measurement shell can carry attributes like:

```text
aCurvedPosition
aFlatPosition
uv
```

Vertex shader:

```glsl
vec3 pos = mix(
    aCurvedPosition,
    aFlatPosition,
    uUnwrapProgress
);
```

Then a carefully designed nonlinear easing field controls the transformation.

We should probably not flatten every vertex simultaneously.

A progressive `θ`-based opening could make the unroll more physically readable.

---

# 53. Progressive unroll

Instead of:

whole surface morphs equally,

use a moving unwrap front.

Conceptually:

```text
unwrap amount at vertex =
smoothstep(front - feather, front, uv.x)
```

Then as scroll progresses:

the seam opens,

flattening propagates around the circumference.

This visually resembles unwinding the surface.

Much more understandable.

---

# 54. But avoid rubber stretching aesthetics

The measurement shell should not look elastic.

No jelly.

No bouncing.

No cloth simulation.

It is an abstract coordinate transformation.

So motion should be:

precise,

smooth,

geometric.

---

# 55. Surface field implementation

Internally, use a fixed resolution such as conceptually:

```text
θ samples × s samples
```

The actual resolution should be chosen based on performance and design rather than pretending to represent final inspection resolution.

For the prototype:

maybe around:

512 × 128

or:

1024 × 256

for visual surface textures.

But this is **rendering resolution**, not claimed inspection resolution.

Document that distinction.

---

# 56. Seeded data

The illustrative observation field should be generated deterministically.

For example:

base deposition pattern;

spatial variation;

localized anomaly;

confidence irregularity;

one invalid region.

All controlled by a fixed seed.

That means:

screenshots stay identical;

tests are stable;

normal model later can use related synthetic tyres;

Idea 1 genuinely builds from the same family of data.

---

# 57. The current tyre's data must survive

The exact illustrative map generated for our hero tyre here becomes the map used later for:

Idea 1 comparison;

process-conditioned comparison;

historical tyre record.

Do not generate a new “better-looking” map in each scene.

That would break the whole premise.

---

# 58. Suggested `SurfaceField` structure

Conceptually:

```ts
type SurfaceField = {
  thetaSamples: number;
  profileSamples: number;

  observation: Float32Array;
  confidence: Float32Array;
  validity: Uint8Array;

  metadata: {
    illustrative: true;
    variantId: string;
  };
};
```

Later scenes can augment:

```ts
normalMean;
normalVariance;
normalDeviation;

processExpected;
processDeviation;
```

One tyre record.

One surface.

---

# 59. Scene 02 HUD

Keep HUD restrained.

Chapter:

**02 · DIGITAL SURFACE**

Context capsule could move through:

`REGISTER`

`COORDINATES`

`UNWRAP`

`VALIDATE`

Final state:

**CANONICAL SURFACE READY**

But don't change the capsule every three seconds.

Maybe only:

**REGISTERING SURFACE**

then:

**CANONICAL SURFACE**

---

# 60. Journey rail

Now the broad rail advances:

```text
PHYSICAL          SURFACE          INTELLIGENCE          PROCESS
████████████──────●────────────────○─────────────────────○
```

For the first time:

**SURFACE**

becomes active.

That gives the transformation additional narrative weight.

---

# 61. Mobile version

This scene is challenging on portrait screens but can be excellent if designed deliberately.

Do not try to keep the entire tyre and flat surface side by side.

Use a vertical transformation.

Start with:

top view / inner surface.

Then as it unwraps:

the map rotates toward portrait-friendly presentation.

Conceptually:

```text
PHYSICAL

      ○
     tyre

       ↓

CANONICAL

┌──────────────┐
│              │
│ surface map  │
│              │
└──────────────┘
```

The canonical map can be taller visually on mobile even though its conceptual axes remain the same.

Labels tell the correct coordinate orientation.

---

# 62. Mobile coordinate explanation

For θ:

use a ring.

For s:

use a single cross-sectional profile overlay.

Do not show both full diagrams at once.

Sequence them.

Mobile needs stronger staging:

one concept,

then next.

---

# 63. Mobile map layers

Observation/confidence/validity should not all fit simultaneously.

Stack vertically through scroll.

First:

Observation.

Then it moves slightly upward.

Confidence enters.

Then validity.

At the end:

a small three-layer summary.

That preserves readability.

---

# 64. Reduced-motion version

Reduced motion could use these static states:

### State 1

Raw observations linked to tyre locations.

### State 2

Tyre with `(θ,s)` grid.

### State 3

Side-by-side physical tyre and flat canonical map.

### State 4

Observation/confidence/validity.

### State 5

Traceability to source imagery.

No morphing required.

The conceptual path remains complete.

---

# 65. Accessibility language

The semantic description should explain:

> Captured camera observations are geometrically registered to a common coordinate system on the tyre's inner surface. Angular position is represented by theta, while s follows the inner-surface profile. The surface is then represented as a normalized map containing observation, confidence and validity information.

The full meaning must not exist only in the visual morph.

---

# 66. Scene 02 copy system

I would keep visible copy to perhaps five main beats.

### Beat 1

# **CAPTURE IS ONLY THE BEGINNING.**

**Different camera pixels can represent the same physical location.**

---

### Beat 2

# **GIVE EVERY OBSERVATION A PLACE.**

`θ` around the tyre.

`s` across the inner-surface profile.

---

### Beat 3

# **UNROLL THE SURFACE.**

**Same tyre. Same data. One comparable coordinate system.**

---

### Beat 4

# **KNOW WHAT YOU CAN TRUST.**

Observation.

Confidence.

Validity.

---

### Beat 5

# **KEEP THE EVIDENCE.**

**Every mapped region remains traceable to its source observation.**

That is enough.

---

# 67. Visual things I absolutely do not want

Reject:

a magical floating holographic tyre;

a generic mesh exploding into thousands of particles;

Matrix-style code around the tyre;

a rainbow heatmap with no legend;

a 3D globe-style coordinate system;

AI brain animation;

an exploded UI dashboard;

random floating source images;

flat map appearing via opacity crossfade;

surface map completely unrelated to physical texture;

confidence shown as random percentages;

the tyre disappearing before the user understands the relationship;

`s` incorrectly shown as image height;

map called “lubricant thickness” without evidence that thickness is measured.

---

# 68. Technical QA

We should test at least these invariants.

### Coordinate identity

A known sample:

```text
(thetaIndex, profileIndex)
```

must correspond to the same field value in:

3D texture,

flat map,

highlight interaction.

### Seam

`θ=0°`

and:

`θ≈360°`

must meet correctly.

No obvious texture jump unless the illustrative data intentionally contains one.

### Reverse transformation

`unwrapProgress = 1 → 0`

must reproduce the original curved surface.

### Resize

Changing viewport during unwrapping must not reset the field or teleport selected coordinates.

### Data persistence

The hero tyre's `SurfaceField` object must survive into Scene 03.

---

# 69. Visual QA capture points

I would capture:

```text
0.00  inside physical tyre
0.12  raw observations
0.27  theta coordinate
0.36  s coordinate
0.45  full grid
0.55  registration
0.62  early unroll
0.68  mid unroll
0.73  flat
0.84  observation map
0.91  confidence
0.94  validity
0.98  traceability
1.00  transition pose
```

The unroll should additionally be captured every ~5% through its active range because that is where geometry artifacts will appear.

---

# 70. Scene 02 → Scene 03 transition

Scene 03/05 will be:

# **LEARN WHAT NORMAL LOOKS LIKE**

Therefore Scene 02 should end with the canonical surface perfectly centered.

Everything physical has quieted.

We have:

```text
                 CURRENT TYRE

0°                                      360°
┌──────────────────────────────────────────┐
│                                          │
│             O(θ,s)                       │
│                                          │
└──────────────────────────────────────────┘
```

The confidence and validity layers recombine into a compact representation.

Source evidence retracts but remains available conceptually.

Then one line appears:

# **NOW EVERY TYRE CAN SPEAK THE SAME SPATIAL LANGUAGE.**

Pause.

Then behind the current map:

a second canonical map quietly appears.

Then a third.

Then a fourth.

Not fully revealed yet.

Just enough to create the next question:

> **If we can compare corresponding regions across tyres… what does good production normally look like?**

And **Scene 03/05** begins.

No cut.

---

# 71. Final picture in my head

We begin literally inside the tyre.

A patch captured during Scene 01 is still glowing very subtly.

We see how that surface patch corresponds to an encoder angle.

A circular coordinate emerges:

`θ`.

The tyre sections briefly.

A curved line follows the inner profile:

`s`.

The point is now no longer “some pixel in an image.”

It is:

`(θ,s)`.

That coordinate system spreads across the innerliner.

Raw observations align to it.

The camera gradually loses perspective.

The measurement shell separates gently from the tyre.

A seam appears at zero degrees.

The inner surface opens.

The selected abnormal region travels with it.

The shell continues flattening until the viewer is looking straight at a rectangular surface map.

Nothing teleported.

Nothing crossfaded.

We can still recognize the same measured surface.

Then the map separates into:

**Observation**

**Confidence**

**Validity**

One ambiguous area becomes low-confidence.

One missing area becomes invalid.

Text:

# **NO DATA ≠ NO LUBRICANT.**

A valid region is selected.

A line leads back to the original captured observation.

Then everything cleans up.

One canonical surface sits quietly in the middle of the screen.

Behind it, faintly, other tyre surfaces begin arriving.

The final message:

# **ONE COORDINATE SYSTEM. EVERY TYRE.**

And now we are ready for **Scene 03/05: Learn What Normal Looks Like.**