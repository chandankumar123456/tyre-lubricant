## Scene 00 — **Arrival / The Tyre Enters the Line**

This scene should do one job extremely well:

> **Make the viewer care about one physical tyre before we introduce cameras, AI, heatmaps, models, or analytics.**

If Scene 00 works, everything later feels like one tyre gaining layers of intelligence.

If Scene 00 fails, the rest risks becoming a technical presentation with a nice background.

So I would treat Scene 00 almost like the opening 20–30 seconds of a premium industrial film.

The visual question is not yet:

> “How does the AI work?”

It is simply:

> **“What are we following?”**

And the answer is:

> **This tyre.**

---

# SCENE 00 — PRODUCTION FLOW

### Working title

**THE TYRE ENTERS THE LINE**

Alternative internal title:

**ARRIVAL**

The internal code name should probably remain `arrival`, because that describes the function of the scene rather than forcing visible copy.

---

# 1. Narrative objective

We establish five things without explaining them explicitly.

The tyre is a real manufactured object.

It is moving through an industrial process.

The inner surface contains something important we cannot currently see properly.

The tyre will remain our persistent protagonist.

Something ahead is going to inspect it.

There should be almost no technical explanation here.

This is deliberate.

The viewer should first experience:

**physical process**

before:

**measurement**

before:

**data**

before:

**intelligence**

That ordering will make the later scenes much easier to understand.

---

# 2. What the viewer should feel

The emotional progression should be:

```text
quiet
↓
curiosity
↓
physical presence
↓
anticipation
↓
something is about to happen
```

Not:

```text
WOW AI
↓
particles
↓
dashboard
↓
camera
↓
random technical labels
```

The opening needs restraint.

The tyre should feel heavy.

The conveyor should feel mechanical.

The factory should feel engineered.

The camera should feel deliberate.

---

# 3. Absolute rule for the opening

### Do not show the intelligence layer immediately.

No heatmap.

No segmentation.

No bounding boxes.

No computer-vision grid.

No neural-network illustration.

No fake HUD.

No percentages.

No “AI SYSTEM ACTIVE”.

No red scanning laser.

No floating panels.

The viewer should first see a tyre exactly as the manufacturing process sees it:

**just a tyre moving through production.**

The intelligence begins later.

That contrast will make the reveal much stronger.

---

# 4. Opening frame

The website loads.

For perhaps the first visual moment, the screen should be almost still.

Not a black loading screen.

Not a giant spinning logo.

Instead, the user immediately sees the industrial world.

### Composition

Desktop:

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            DISTANT INDUSTRIAL ENVIRONMENT                   │
│                                                             │
│                                                             │
│                                inspection area hinted       │
│                                          ↓                  │
│                              ┌──────────────────┐           │
│                              │                  │           │
│                              │                  │           │
│                              └──────────────────┘           │
│                                                             │
│                                                             │
│   CAMERA                                                    │
│     ↓                                                       │
│                                                             │
│══════════════════ CONVEYOR ════════════════════════════════│
│                                  ○ tyre in distance         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

The tyre is not large yet.

It is perhaps 20–25% of the viewport height.

It is visible enough to recognize instantly but distant enough that there is somewhere for the scene to travel.

---

# 5. Tyre orientation

I would begin with the tyre **lying flat on its side**.

Its rotational axis points upward.

That gives us several later advantages.

It can travel naturally on a conveyor.

It can be mechanically centered.

A central inspection head can later rise into the tyre opening.

A rotary table can rotate the tyre around its vertical axis.

The inspection geometry remains immediately understandable.

Conceptually:

```text
                TOP

                 ↓

          ╭───────────────╮
       ╭─────────────────────╮
      │        TYRE           │
       ╰─────────────────────╯

══════════════════════════════════
             CONVEYOR
```

We should not present this arrangement as the client's confirmed production-line design.

It is the **cinematic prototype configuration** used to explain the system.

That distinction should also exist internally in the project truth matrix.

---

# 6. The tyre model

The tyre is going to appear throughout the whole website.

Therefore this is probably the most important 3D asset in the entire project.

It cannot look like a generic free stock model that was chosen because it happened to exist.

### Exterior

The tyre should have:

realistic tread blocks;

subtle sidewall lettering;

small manufacturing marks;

slightly imperfect rubber roughness;

correct edge softness;

realistic inner opening;

no exaggerated sports-car styling;

no specific automotive brand unless authorized.

### Innerliner

This matters even more than the exterior because later we will enter the tyre.

The inside cannot simply be an empty smooth torus.

We need a plausible inner surface with enough geometric resolution that later we can:

apply the observation texture;

attach `(θ,s)` coordinates;

create the unrolling transformation;

highlight bead-related regions;

map data consistently.

The inner surface therefore needs to be designed **with the later canonical representation in mind from day one**.

Do not first build a beautiful tyre and later ask:

> “How can we somehow map the data onto this?”

The UV/data mapping should be part of the asset design.

---

# 7. Tyre material

The rubber should not be pure black.

Pure black destroys detail.

I would use something visually closer to:

```text
base colour: deep charcoal
roughness: high
specular: restrained
clearcoat: almost none
normal detail: subtle
```

The physical tyre should absorb most environmental light but still reveal its form under directional industrial lighting.

Sidewalls should catch soft highlights.

Tread edges should produce controlled contrast.

Inside the tyre should initially remain darker.

That darkness becomes narratively useful.

The inner surface is literally hidden.

---

# 8. Conveyor design

The conveyor should be realistic but visually restrained.

I would not build a giant complex factory line.

The conveyor exists primarily to establish production motion.

### Preferred design

Industrial roller conveyor or heavy-duty segmented belt.

I slightly prefer a **roller conveyor with an integrated central rotary section** because that later gives us a mechanically understandable transformation:

```text
normal conveyor
      ↓
positioning section
      ↓
rotary inspection cradle
```

Something like:

```text
══════════════════════════════════════════════════
||||||||||||||||||||||||||||||||||||||||||||||||||
                 ╭─────────╮
                 │ ROTARY  │
                 │  ZONE   │
                 ╰─────────╯
||||||||||||||||||||||||||||||||||||||||||||||||||
══════════════════════════════════════════════════
```

This also lets Scene 00 end with the tyre reaching its inspection datum.

---

# 9. The surrounding environment

The environment should suggest:

**high-quality automated manufacturing**

rather than:

**science-fiction laboratory**

or:

**dirty generic factory stock photo**

### Background elements

Use very few.

Perhaps:

structural columns;

machine guarding;

one distant conveyor;

overhead cable trays;

industrial light strips;

subtle safety markings;

partially visible machinery;

inspection-cell silhouette.

But these need to remain background.

The tyre is the subject.

The screen should never become visually busy enough that the viewer searches for what to look at.

---

# 10. Inspection station foreshadowing

Scene 00 should hint at what lies ahead without revealing it completely.

In the distance, we see a darker controlled enclosure.

Maybe an open portal.

Maybe two vertical light strips inside.

Maybe a circular rotary stage is barely visible.

No camera head yet.

No annotation saying:

**INSPECTION STATION**

Not yet.

The station is simply:

**where the tyre is heading.**

This creates visual causality.

The user understands movement direction without needing text.

---

# 11. Camera opening

I would begin the camera very low.

Not exactly floor level.

Maybe slightly above conveyor height.

Something like:

```text
CAMERA

      ↘

━━━━━━━━━━━━━━━━━━━━ tyre trajectory ━━━━━━━━━━━━━━━
```

The lower camera makes the tyre feel heavier.

It also creates more depth from the conveyor lines.

### Lens feeling

Do not go ultra-wide.

Ultra-wide industrial shots often look like game environments.

I would begin somewhere around the visual feeling of:

**50–65 mm full-frame equivalent**

and later move toward something slightly longer.

That produces:

compression;

premium product-photography feeling;

less distortion;

more physical weight.

---

# 12. Scroll structure for Scene 00

I would allocate approximately:

**260–320vh desktop**

for the scene.

Maybe around:

**200–240vh tablet**

and:

**170–210vh mobile**

depending on testing.

The tyre must not race across the screen.

The opening should feel confident.

---

# 13. Detailed Scene 00 scroll choreography

This is the version I would currently design.

| Scene progress | Visual event | Camera behavior | Narrative meaning |
|---:|---|---|---|
| **0.00–0.08** | Environment establishes. Tyre visible at distance. Conveyor already moving subtly. | Camera nearly still. Tiny ambient drift only. | Orient the viewer. |
| **0.08–0.18** | Tyre becomes clearly noticeable as it approaches. | Slow dolly forward begins. | Establish the hero object. |
| **0.18–0.30** | Conveyor movement becomes more perceptible. Small mechanical details pass foreground. | Camera tracks slightly sideways and forward. | The tyre belongs to a real production flow. |
| **0.30–0.42** | Tyre becomes dominant visual subject. | Camera eases closer toward a three-quarter angle. | Build physical presence. |
| **0.42–0.54** | First line of copy appears after tyre is visually established. | Camera movement reduces. | Introduce the hidden nature of the problem. |
| **0.54–0.66** | Camera moves slightly above tyre. Inner opening becomes visible for the first time. | Gentle vertical crane + forward motion. | Foreshadow the inner surface. |
| **0.66–0.77** | Tyre approaches the inspection zone. Environment subtly becomes cleaner/darker/more controlled. | Camera tracks with tyre. | We are leaving general production and entering measurement. |
| **0.77–0.86** | Inspection enclosure becomes visually dominant ahead. | Camera slightly rotates to align with station axis. | Anticipation. |
| **0.86–0.93** | Conveyor begins decelerating. Tyre enters positioning region. | Camera movement also slows. | Mechanical precision replaces general motion. |
| **0.93–1.00** | Tyre stops exactly at inspection datum. | Camera reaches shared transition pose and settles completely. | Scene 01 can begin without a cut. |

The key is:

**the camera does not arrive before the tyre.**

The tyre brings us into the station.

---

# 14. First visible text

I would keep copy extremely restrained.

Something approximately like:

## Opening

**One tyre.**

Then after some scrolling:

**The surface that matters is hidden inside.**

Then just before entering inspection:

**So how do we measure it?**

That is enough.

I would not put a paragraph here.

---

# 15. Alternative opening copy

A slightly more industrial version:

**Every tyre carries a process history.**

Then:

**Some of it is hidden on the inner surface.**

Then:

**Measurement starts here.**

Another version:

**Lubricant is applied inside the tyre.**

**Its distribution is difficult to judge from the outside.**

**Follow the tyre.**

I prefer this third direction if the client audience needs immediate context.

But stylistically, I think the strongest option is:

> **One tyre.**  
> **The surface that matters is hidden inside.**  
> **Follow it.**

Then Scene 01 starts explaining.

---

# 16. Copy placement

Do not place giant centered text over the tyre.

That immediately starts feeling like a presentation cover slide.

I would use asymmetric placement.

For example:

```text
┌────────────────────────────────────────────────┐
│                                                │
│  ONE TYRE.                                     │
│                                                │
│                                                │
│                            tyre                │
│                              ○                 │
│                                                │
│                                                │
│                                                │
│════════════════════════════════════════════════│
└────────────────────────────────────────────────┘
```

Later:

```text
                                THE SURFACE THAT
                                MATTERS IS HIDDEN
                                INSIDE.
```

Copy can change sides according to camera composition.

Never cover the tyre.

---

# 17. Typography

The typography should already establish the entire project's tone.

### Headline

Strong grotesk / technical sans.

Uppercase selectively.

Large but not billboard-large.

Tight letter spacing.

### Supporting text

Neutral humanist sans or same family at regular weight.

### Numbers later

Use tabular figures or monospaced technical secondary type.

But Scene 00 contains almost no numbers.

The typography should feel:

**automotive engineering publication**

not:

**startup landing page**

---

# 18. Lighting progression

Lighting can carry some of the transition without needing effects.

### At the beginning

Broader factory light.

Warm-neutral overhead illumination.

The tyre has soft but readable highlights.

### As tyre approaches inspection

Ambient world falls slightly darker.

Inspection enclosure ahead is more controlled.

Vertical white inspection lights become visible.

### At Scene 00 end

The tyre has entered a visual pocket of controlled illumination.

This prepares Scene 01.

The user should almost subconsciously feel:

> “Now we're going from manufacturing environment to measurement environment.”

---

# 19. Mechanical micro-animation

Tiny mechanical movement makes the environment believable.

Examples:

conveyor rollers rotating correctly;

small safety indicator blinking slowly;

subtle vibration when tyre crosses roller seams;

cable chain moving slightly;

inspection enclosure fan or ventilation detail;

occasional distant machine movement.

But these are background details.

Never add random animation because an empty part of the scene “needs something.”

---

# 20. Tyre movement

The tyre itself should not spin while travelling down the conveyor if it is lying horizontally.

It translates with the conveyor.

That distinction matters physically.

When the rotary inspection section engages later, rotation begins.

The viewer will subconsciously notice the difference:

```text
Scene 00
translation

Scene 01/02
positioning

Scene 02
controlled rotation
```

That mechanical escalation reinforces the story.

---

# 21. Tyre positioning

At roughly the final 10% of Scene 00:

the tyre approaches the inspection center.

The conveyor slows.

A pair of mechanical guides can subtly emerge.

They do not dramatically squeeze the tyre.

They establish repeatable centering.

The tyre reaches an exact reference position.

A tiny mechanical settle occurs.

Then:

**complete stillness.**

This moment of stillness is important.

Scene 00 has been movement.

Scene 01 starts controlled measurement.

---

# 22. No cut at the end

This is a hard requirement.

There should be no:

fade to black;

crossfade;

white flash;

wipe;

page scroll;

scene card transition.

The final Scene 00 camera pose should **literally be Scene 01's first pose**.

For example:

```text
SCENE 00 END

                 inspection opening

                       │
                       ▼
                ╭────────────╮
                │            │
                │    TYRE    │
                │            │
                ╰────────────╯

                  CAMERA
                      ↗
```

Then Scene 01 simply continues.

The world never disappears.

---

# 23. Scene 00 → Scene 01 transition

At exactly the boundary:

tyre stopped;

camera stopped;

conveyor stopped;

general factory noise visually quiet;

inspection enclosure occupies the upper frame;

inner tyre opening visible;

no inspection head yet.

Then Scene 01 begins:

mechanical locks engage;

inspection enclosure closes;

controlled illumination activates;

camera mast begins rising.

That is a natural cause-and-effect handoff.

---

# 24. World coordinates

From an implementation perspective, I would build Scene 00 around one stable coordinate system.

Conceptually:

```text
X = conveyor direction
Y = vertical
Z = lateral
```

Example world layout:

```text
x = -12m      tyre appears

x = -8m       production environment

x = -4m       camera overtakes / tracks

x = 0m        inspection datum

x = +4m       future conveyor / scene 10 exit
```

The actual scale is artistic.

But I strongly prefer physically sensible units in Three.js.

One world unit should roughly correspond to one meter.

That keeps:

lighting;

camera clipping;

velocity;

depth;

model scale

consistent.

---

# 25. Camera architecture

I would not animate the Three.js camera using unrelated GSAP tweens.

Scene 00 should expose a deterministic function:

```ts
cameraAtArrival(progress)
```

The camera path can be defined using several authored poses:

```text
A0  Establish
A1  Acquire tyre
A2  Track
A3  Hero tyre
A4  Reveal inner opening
A5  Approach station
A6  Align station
A7  Inspection datum
```

Then interpolate between them according to progress.

This allows:

scroll reversal;

testing;

mobile overrides;

reduced motion;

precise Scene 01 boundary matching.

---

# 26. Camera easing

Do not apply one `easeInOut` across the whole scene.

Each physical beat deserves its own acceleration profile.

For example:

Tyre approaching:
almost linear.

Camera taking interest:
smooth acceleration.

Inner-surface reveal:
very gentle deceleration.

Inspection approach:
mechanically steady.

Final positioning:
stronger deceleration into complete stillness.

The viewer should not consciously perceive easing.

They should perceive mass.

---

# 27. Conveyor speed

Conveyor velocity should be tied to scene progress.

Do not simply rotate rollers continuously while tyre translation is controlled separately.

The roller angular velocity should mathematically correspond to the belt/tyre translational movement.

This prevents one of those subtle “CGI/game engine” feelings.

Conceptually:

```text
rollerRotation = tyreDistanceTravelled / rollerRadius
```

The same progress drives both.

---

# 28. No fake physics

We don't need full rigid-body physics.

In fact, I would avoid it.

Scroll-scrubbed deterministic scenes are easier to control if motion is authored.

But authored motion should remain physically coherent.

So use:

deterministic kinematics,

not:

real-time physics simulation.

---

# 29. Scroll and actual time

Scene 00 should be scroll-driven, but not feel like dragging a timeline with the mouse.

Smooth progress slightly.

Do not create a direct 1:1 relationship where one pixel makes the tyre visibly jerk.

Something like:

```text
rawScroll
      ↓
normalized target progress
      ↓
critically damped / smoothed visual progress
      ↓
camera + world
```

But reverse response should remain quick enough that the page doesn't feel disconnected from input.

---

# 30. The initial load

The opening must load gracefully.

We should not wait for a 3D tyre model before showing anything.

Initial HTML immediately renders:

project mark;

opening copy;

lightweight poster/fallback frame;

dark industrial background.

Then the Three.js stage initializes underneath.

Once ready, stage opacity transitions very subtly from fallback to live.

No visible layout jump.

No “Loading 3D Experience… 78%” unless loading proves genuinely long enough to warrant a progress state.

---

# 31. If loading is slow

If the model takes longer than expected:

keep the static tyre poster visible.

Allow opening text to exist.

Show a tiny restrained state:

**Preparing inspection environment**

if genuinely needed.

Not:

**INITIALIZING AI ENGINE 97%**

---

# 32. Audio

I would not make sound compulsory.

Auto-playing sound can be irritating and restricted by browsers.

But we could optionally design an ambient soundtrack layer later.

If the client chooses to enable sound:

Scene 00 could use:

soft conveyor rumble;

subtle roller clicks;

distant industrial ambience;

no dramatic cinematic boom.

At the inspection boundary:

the general ambient sound lowers;

a precise mechanical engagement becomes noticeable.

But the experience must remain complete with sound off.

---

# 33. Cursor behavior

Normal cursor.

No giant custom cursor following the tyre.

No “drag to explore.”

This is a narrative experience, not a portfolio gimmick.

On desktop, a tiny “Scroll to follow the tyre” indicator can appear initially.

It should disappear quickly.

---

# 34. HUD in Scene 00

Almost nothing.

I would allow:

top-left brand/project mark;

top-right **Engineering** or **System Architecture** link;

very restrained journey progress at the bottom.

The intelligent status capsule should be dormant.

Maybe its initial state is simply:

```text
●
```

with no flashy content.

Later it gains meaning.

Scene 00 should not look like a cockpit.

---

# 35. Progress rail

I would not expose ten scenes by name immediately.

That turns the experience into a table of contents.

Instead the bottom rail might initially show broad stages:

```text
PHYSICAL        SURFACE        INTELLIGENCE        PROCESS
●───────────────○──────────────○───────────────────○
```

In Scene 00:

**PHYSICAL**

is active.

This tells the viewer there is a journey without spoiling every scene.

---

# 36. Interaction toggle

Do not expose an Intelligence ON/OFF switch in the first 20% of Scene 00.

The viewer doesn't know what “intelligence” means yet.

Either:

introduce it later,

or have it exist but disabled/dormant until the first derived visualization appears.

---

# 37. Mobile version

Mobile should not simply show the desktop camera path cropped vertically.

The phone opening needs its own composition.

### Mobile starting frame

Tyre enters from upper-middle distance.

Conveyor lines run almost vertically into depth.

Camera is somewhat higher than desktop.

This makes the tyre's circular opening visible earlier.

Copy sits in top safe region.

Conceptually:

```text
┌───────────────────┐
│ ONE TYRE.         │
│                   │
│       ○           │
│      tyre         │
│       │           │
│       │           │
│       │           │
│   conveyor        │
│       │           │
│       │           │
└───────────────────┘
```

The mobile camera should emphasize depth rather than lateral composition.

---

# 38. Mobile movement

Reduce lateral camera tracking.

Phone screens do not have enough horizontal composition space.

Mobile Scene 00 should mostly use:

forward movement;

small vertical rise;

small yaw;

station alignment.

Keep the tyre close to center.

---

# 39. Mobile text

Do not run long lines over the tyre.

Use 3–5 word beats.

For example:

**ONE TYRE.**

then:

**LOOK INSIDE.**

then:

**FOLLOW THE PROCESS.**

The desktop can afford slightly more nuanced copy.

---

# 40. Reduced-motion version

Reduced motion should still be elegant.

Instead of the tyre travelling continuously:

Frame 1:
tyre visible on production conveyor.

Scroll.

Frame 2:
tyre closer, inner opening visible.

Scroll.

Frame 3:
tyre positioned at inspection station.

The text explains the same story.

No continuous camera flight.

No continuously animated conveyor.

No constant rotation.

The experience remains visually designed rather than becoming a pile of paragraphs.

---

# 41. Accessibility

The canvas is decorative/visual representation.

The semantic DOM should contain something equivalent to:

> A tyre moves along a manufacturing conveyor toward a controlled inspection station. The next stage will inspect the tyre's inner surface.

That description should be available to assistive technologies.

Do not put essential narrative text only inside WebGL.

---

# 42. Lighting implementation

I would use relatively few real-time lights.

Potentially:

one large area/key light;

one softer opposite fill;

environment lighting/HDRI;

controlled emissive practical fixtures;

inspection-cell light sources activated later.

Avoid ten dynamic shadow-casting lights.

That will destroy performance for negligible visual benefit.

---

# 43. Shadows

Tyre needs a convincing contact shadow.

The tyre should feel heavy on the conveyor.

Use:

baked/static environmental shadows where possible;

one controlled dynamic contact shadow for the tyre;

minimal moving-shadow complexity.

The tyre should not look like it floats one centimetre above the rollers.

---

# 44. Depth of field

Very restrained.

At the opening we can use subtle depth separation.

But don't use aggressive cinematic blur.

The client needs to understand the industrial environment.

Depth-of-field should support hierarchy, not hide unfinished background assets.

---

# 45. Motion blur

I would avoid expensive real-time motion blur.

If absolutely needed, subtle shader-based treatment could be investigated.

But initially:

**no motion blur.**

The conveyor isn't moving fast enough to need it.

---

# 46. Environmental animation

The world must not freeze while the tyre moves.

But it also shouldn't look like an amusement park.

I would use tiny background signals:

one distant transport system;

one status lamp;

ventilation or fan movement;

small illumination flicker only if realistic.

Nothing calls attention away from the tyre.

---

# 47. Colour progression

Scene 00 colour composition:

### Opening

Charcoal + steel + warm industrial white.

### Approaching inspection

Background becomes slightly less warm.

White controlled illumination becomes dominant.

### At final positioning

A subtle technical blue begins entering the environment.

Not enough to feel like “AI mode.”

Just enough to visually prepare the transition toward measurement.

---

# 48. No lubricant visualization yet

This is important.

Even though the problem is lubricant distribution, I would **not reveal it during Scene 00**.

Maybe, at most, we briefly see that the inside surface exists.

But no coloured overlay.

Why?

Because Scene 03 becomes far stronger when we finally reveal:

> **this apparently ordinary dark innerliner actually contains a measurable spatial distribution.**

If we show the heatmap immediately, we lose that reveal.

---

# 49. Scene 00 asset list

For this scene alone, we need one carefully controlled asset package:

- hero tyre exterior + proper innerliner;
- conveyor module;
- rotary inspection platform hinted but mostly inactive;
- inspection enclosure exterior;
- simple factory structural kit;
- floor;
- overhead lighting;
- safety markings;
- cable/conduit details;
- guide/centering hardware;
- distant low-detail machinery;
- opening fallback/poster render.

This is enough.

Do not create fifty factory objects.

---

# 50. LOD strategy

The tyre never gets replaced with a different model.

That's important because later the user sees it close-up.

Use one hero tyre asset with sensible mesh organization.

Background machinery can have simplified geometry.

The tyre is where geometry budget should go.

---

# 51. File organization

I would probably structure the Scene 00 portion roughly like:

```text
src/
  experience/
    scenes/
      arrival/
        ArrivalScene.ts
        arrival.camera.ts
        arrival.story.ts
        arrival.motion.ts

    world/
      actors/
        TyreActor.ts
        ConveyorActor.ts
        InspectionCellActor.ts

    assets/
      models/
      textures/

    core/
      JourneyController.ts
      CameraDirector.ts
      SceneRegistry.ts
```

Not because this exact tree is sacred.

But Scene 00 should not become a giant React component containing:

camera code;

text code;

scroll math;

lighting;

tyre animation;

conveyor behavior

all mixed together.

---

# 52. Semantic story beats

Scene 00 should expose named states.

Something like:

```text
arrival.start

arrival.tyreDetected

arrival.followingTyre

arrival.heroEstablished

arrival.innerSurfaceForeshadowed

arrival.inspectionAhead

arrival.enteringStation

arrival.decelerating

arrival.positioned
```

Copy and HUD respond to these states.

They should not individually calculate:

```ts
if (progress > .432 && progress < .561)
```

all over the application.

---

# 53. Scene 00 data model

No AI data.

No synthetic production parameters.

The only state necessary is physical.

Potentially:

```text
tyrePosition
conveyorDistance
rollerAngle
cameraPose
inspectionPortalState
guidePosition
environmentLightState
storyBeat
```

That's all.

Keep the opening technically clean.

---

# 54. Visual testing

Scene 00 needs screenshots at more than one place.

At minimum:

```text
0.00
0.10
0.20
0.35
0.50
0.65
0.80
0.92
1.00
```

I especially care about:

`0.00`

because first impression matters.

`0.50`

because that's probably our hero composition.

`0.92`

because transition setup matters.

`1.00`

because it must perfectly equal Scene 01 at `0.00`.

---

# 55. Transition testing

Test:

slow downward scroll;

very fast downward scroll;

fast reverse;

scroll down halfway then reverse;

jump via scrollbar;

refresh at 70% scene position;

resize at 50%;

switch portrait/landscape;

open on mobile deep-linked near scene;

browser back/forward behavior.

The visual state must remain deterministic.

---

# 56. Things that would cause me to reject Scene 00

I would reject the implementation if any of these occur:

- tyre looks like a stock 3D model dropped into a room;
- conveyor motion doesn't physically correspond to tyre movement;
- tyre floats;
- background is more visually interesting than the tyre;
- opening immediately shows AI overlays;
- camera movement is constantly orbiting for no reason;
- camera uses huge sweeping motion just to look “cinematic”;
- Scene 00 ends with a fade/crossfade;
- text covers the hero tyre;
- inspection hardware is fully revealed too early;
- tyre geometry changes between shots;
- the interior is geometrically fake and cannot support later mapping;
- mobile is merely a cropped desktop;
- scrolling backward produces visibly different choreography;
- the tyre stops abruptly with no feeling of mass;
- page loads into an empty canvas;
- the scene feels like a 3D portfolio website instead of a manufacturing story.

---

# 57. Definition of done for Scene 00

I would not consider Scene 00 complete merely because:

> “The tyre moves down the conveyor.”

It is complete when a reviewer can watch only this scene and say:

> “I understand that I am following one physical tyre through a real industrial process, something important is hidden on the inside, and the tyre has now reached a controlled station where it is about to be inspected.”

Without needing:

a voiceover;

a dashboard;

a paragraph explaining it;

or a technical diagram.

That's the standard.

---

# 58. Final Scene 00 picture in my head

The page loads into a quiet industrial space.

Far away, a single tyre is approaching on a conveyor.

The camera doesn't rush toward it.

Instead the tyre slowly becomes important.

The conveyor geometry guides our eye forward.

We start following.

The tyre fills more of the screen.

Soft highlights reveal the rubber, tread and sidewall.

The camera rises slightly.

For the first time we can see the dark innerliner.

Text appears:

# ONE TYRE.

A few moments later:

**The surface that matters is hidden inside.**

Ahead, the inspection enclosure becomes visible.

The outside factory feels less important.

The tyre enters the controlled area.

The conveyor slows.

The camera aligns with the station.

Mechanical guides position the tyre.

The tyre stops.

Everything else settles.

No dramatic transition.

No light blast.

No black frame.

We are simply now standing in front of the inspection station with the same tyre we have been following from the beginning.

And the final Scene 00 line appears:

# HOW DO WE MEASURE WHAT WE CANNOT EASILY SEE?

Then Scene 01 begins.

The inspection cell closes.

Controlled illumination switches on.

And from beneath the tyre, the real industrial 360° inspection head starts rising.