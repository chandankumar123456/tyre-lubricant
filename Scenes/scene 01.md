# Scene 01/05 — **Enter the Inspection Cell**

This is where the experience stops being “a tyre moving through a factory” and becomes **a measurement system**.

Scene 00 ended with the tyre centred and motionless at the inspection datum. Scene 01 begins from that exact same physical state—no cut, no fade, no environment swap.

The purpose of Scene 01 is to make the client understand, almost entirely through motion:

> **The tyre is brought into controlled conditions, the inspection head enters the cavity, the tyre rotates around a fixed sensing position, and every observation is tied to a real angular location.**

The project documents freeze that principle: controlled illumination, tyre rotation, encoder synchronization, complete inner-surface acquisition and coordinate registration. They deliberately do **not** freeze camera count, final optics, or area-scan versus line-scan. 

So visually we can be decisive, but the experience must explicitly present the camera arrangement as an **illustrative inspection concept**, not the final production hardware.

---

## 1. Scene title

Internally:

`scene-01-inspection`

Visible chapter title:

# **MEASURE THE HIDDEN SURFACE**

Secondary line, introduced later:

**Controlled. Synchronized. Complete.**

I would not begin the scene by saying “360° AI inspection.”

The engineering sequence itself should explain why the scan is meaningful.

---

# 2. Exact starting frame

Scene 00 ended here:

```text
                     CONTROLLED CELL

                │                 │
                │                 │

                    ╭─────────╮
                 ╭───────────────╮
                │      TYRE       │
                 ╰───────────────╯
                    ╰─────────╯

                         ●
                   rotary datum

════════════════════════════════════════
               CONVEYOR
```

The tyre is completely still.

The camera is slightly above conveyor level, looking diagonally toward the station.

The tyre opening is clearly visible.

Nothing has yet entered the tyre.

This is Scene 01 at `progress = 0`.

That shared frame is mandatory.

---

# 3. First change: isolate the measurement environment

The first motion should **not** be the camera head rising.

Give the inspection environment a moment to establish itself.

The conveyor stops.

Mechanical centring guides finish engaging.

Then the inspection enclosure begins to isolate the tyre.

This could be:

transparent safety doors sliding closed,

or

a lightweight guarding enclosure settling into position.

It should not look like a futuristic vault.

It is simply an industrial inspection station creating controlled conditions.

### As this happens

The broader factory illumination reduces slightly.

The cell's engineered lighting becomes dominant.

The environment goes from:

```text
factory
```

to:

```text
measurement environment
```

without changing location.

That is important.

---

# 4. The central visual idea

Now the inspection head rises.

But the movement needs to feel **mechanical**, not cinematic.

From below the centre of the tyre:

a telescopic mast begins extending upward.

At the top is the industrial panoramic inspection head.

It enters through the tyre opening.

Slowly.

Precisely.

No wobble.

No hovering.

No autonomous robot-arm movement.

Something closer to:

```text
                    ┌────────────┐
                    │            │
                    │    TYRE    │
                    │            │
                    └────────────┘
                           ▲
                           │
                         [◉]
                           │
                           │
                      telescopic
                         mast
```

The viewer immediately understands:

> We are putting an optical measurement device inside the tyre.

---

# 5. Camera-head visual design

This asset needs to look like something that could genuinely exist.

It should not resemble:

a GoPro;

an Insta360 consumer camera;

a CCTV dome;

a sci-fi orb;

a lidar turret from an autonomous car.

It should look like **industrial machine vision instrumentation**.

The physical language I would use:

cylindrical anodized-aluminium body;

black optical barrel;

small panoramic/360° optical element;

machined mounting collar;

integrated lighting ring or clearly separated lighting module;

industrial cabling routed into mast;

small alignment/index marks;

no glowing RGB strips.

The industrial probe concept is only an explanatory configuration. The actual architecture still leaves the optical arrangement unresolved. 

I would include a tiny annotation when the head is fully visible:

**Illustrative inspection head**  
*Final optical configuration subject to engineering validation.*

Small.

Not a disclaimer dominating the visual.

---

# 6. Camera rises in three mechanical stages

I would avoid one uniform vertical movement.

The mechanism should behave like actual automation.

### Stage A — Deploy

The mast lifts quickly enough to feel engineered.

### Stage B — Approach

As the optical head nears the required position, motion slows.

### Stage C — Locate

A final short precise movement.

Then:

**lock.**

A small mechanical collar can settle into position.

No bounce.

No cinematic overshoot.

That moment tells the viewer:

> The sensing geometry is now known and repeatable.

---

# 7. Do not rotate the camera head dramatically

This is where I would resist a tempting visual.

Do **not** make the “360° camera” spin wildly inside the tyre.

That would unintentionally communicate:

> the camera has to rotate around to inspect the tyre.

But the current physical foundation is built around the tyre rotating while imaging is synchronized to its position.

So:

**inspection head enters**

→ **inspection head becomes stationary**

→ **tyre rotates**

That distinction should be obvious.

---

# 8. Lighting activation

Once the camera head locks:

inspection lighting activates in a controlled sequence.

Not flashing.

Not turning the whole room blue.

I would use perhaps three physical illumination changes.

First:

soft overhead chamber light.

Then:

internal diffuse lighting becomes visible inside the tyre.

Then:

the inspection head's relevant illumination activates.

This makes the innerliner suddenly readable.

The viewer sees detail that was previously swallowed in darkness.

That is the first visual expression of:

> engineered observation.

The documentation deliberately freezes repeatable engineered illumination while leaving wavelength/modality open. 

Therefore the light should visually remain neutral.

Don't make it infrared red.

Don't make it UV purple.

Don't make it green structured light.

Those would imply a sensing modality that is not finalized.

---

# 9. First technical annotation

Only after the hardware has visually explained itself should text appear.

Something like:

### **CONTROL THE OBSERVATION**

Then three small labels anchor directly to real objects:

**Fixed inspection position**

**Controlled illumination**

**Repeatable tyre positioning**

Avoid generic feature cards.

The annotation lines should originate from the objects themselves.

---

# 10. The tyre begins rotating

Now we reach the main physical event of Scene 01.

The rotary cradle underneath begins moving.

At first:

very slowly.

Then reaches a stable inspection speed.

The tyre rotates about its vertical axis.

The optical head remains fixed.

This needs to be extremely readable.

I would actually hold the external camera almost completely still during the first 30–45° of tyre rotation.

Because if:

our cinematic camera moves,

the tyre rotates,

the conveyor environment parallax moves,

and HUD graphics appear

at the same time,

the viewer will struggle to understand which component is physically doing what.

So here:

> **Stop the cinematic camera. Let the machine demonstrate itself.**

---

# 11. Encoder reveal

Once the tyre has visibly rotated a little, introduce the encoder concept.

Do not immediately show a giant diagram.

Start physically.

Near the rotary stage, a subtle encoder/index element becomes highlighted.

Then a clean ring appears around the base:

```text
                 0°

                 │
          315°   │   45°
              ╲  │  ╱
               ╲ │ ╱
        270° ─── TYRE ─── 90°
               ╱ │ ╲
              ╱  │  ╲
          225°   │   135°
                 │

                180°
```

Keep it restrained.

Initially perhaps only:

`0°`

`90°`

`180°`

`270°`

are visible.

The current position indicator moves according to actual tyre rotation.

---

# 12. Why this moment matters

This is where Scene 01 needs to communicate one of the strongest ideas in the whole architecture.

The system doesn't merely take pictures while a tyre happens to rotate.

It knows:

> **where on the tyre each observation came from.**

The architecture explicitly treats the encoder as essential because approximate frame-rate/RPM inference would introduce positional uncertainty. 

So after the encoder appears, we can reveal the line:

# **EVERY OBSERVATION GETS A LOCATION.**

Then underneath:

`θ(t)`

Very small.

No mathematical lecture yet.

---

# 13. The first captured observation

Now we visually demonstrate synchronization.

At perhaps `θ = 32°`:

one very subtle moment occurs.

A small section of the inner surface is highlighted.

At exactly the same instant:

a small captured observation appears off to one side.

Not a giant photograph card.

Something more like:

```text
TYRE

        highlighted band
             ↓
      ┌─────────────┐
      │ innerliner  │
      └─────────────┘

             θ = 32°
```

Then the tyre continues.

At:

`θ = 33°`

another observation.

`34°`

another.

We don't need to literally show hundreds.

After three or four, the viewer understands the mechanism.

---

# 14. Observations should stay spatially connected

Do not have captured frames fly outward randomly like photographs.

That destroys the spatial concept.

Instead, the observations should accumulate along a **measurement strip** associated with angular progress.

Conceptually:

```text
TYRE ROTATION

0° ━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━ 360°
                   ↑
                 current θ


CAPTURED SURFACE

██████████████████░░░░░░░░░░░░░░░░░░░░░░░
                  ↑
             observed region
```

As rotation progresses, measured coverage grows.

This prepares the visitor for the canonical map later.

---

# 15. Do not reveal the final heatmap yet

This is important.

At this stage, captured data should look like:

grayscale/raw optical observations,

or

neutral technical surface texture.

Not the final lubricant heatmap.

Why?

Because we are still explaining **acquisition**.

If the heatmap appears immediately, the viewer may assume:

> the camera directly produces the finished intelligence map.

But the next scenes need to explain registration and reconstruction.

So Scene 01 output is:

**observations**

not:

**interpretation**.

---

# 16. Camera choreography during the scan

Once the viewer understands tyre rotation, our cinematic camera can begin moving again.

I would use a very slow arc.

Starting from the three-quarter exterior view:

the camera rises.

Moves slightly inward.

Begins looking more directly down into the tyre.

While the tyre continues rotating.

The camera therefore gradually gives us access to the inner cavity.

But the cinematic camera must never move fast enough to confuse it with the industrial inspection camera.

These are two completely different cameras:

**the viewer camera**

versus

**the inspection camera**.

That conceptual distinction must stay visually obvious.

---

# 17. Scan progress

At around 25% of rotation, introduce a small persistent status:

**SURFACE ACQUISITION**

and beneath:

`0° → 360°`

I would not show:

`47%`

unless necessary.

Angular coverage communicates the physics better.

At 90°:

quarter of the angular rail fills.

At 180°:

half.

At 270°:

three quarters.

At 360°:

closed.

---

# 18. But 360° does not automatically mean “valid”

This is a subtle but very good place to plant the seed for later validity/confidence logic.

When the tyre reaches 360°, do not instantly flash:

**SCAN SUCCESSFUL**

Instead:

rotation finishes.

Then one additional short beat:

**Verifying coverage…**

The rail is checked.

A few small overlapping region markers resolve.

Then:

### **Complete surface coverage confirmed**

This matches the architecture's explicit requirement that one rotation should not simply be assumed to equal successful inspection; acquisition coverage needs validation. 

That's a small detail, but an engineer watching the site will notice the seriousness.

---

# 19. Illustrative failure glimpse

I would add one tiny optional educational moment before coverage confirms.

For perhaps half a second of scroll:

a small segment of the coverage ring appears incomplete.

Label:

**coverage gap**

Then the acquisition logic resolves/reacquires it.

This subtly communicates:

> the system knows when it hasn't seen something.

Do not dramatize it as a fault alarm.

This prepares us for the future validity mask.

---

# 20. Scan completion state

When acquisition is complete:

the tyre slows.

Stops precisely.

The inspection head remains inside.

The coverage rail is now complete.

The environment becomes very still again.

Now show:

# **ONE FULL INNER-SURFACE OBSERVATION**

Not:

**AI RESULT**

because AI has not yet happened.

---

# 21. What we have produced

At this point we can introduce a very restrained three-part output:

```text
SYNCHRONIZED OBSERVATIONS

ANGULAR POSITION

ACQUISITION METADATA
```

That's it.

Do not yet show:

normality,

defect,

severity,

drift,

root cause.

The story needs to earn those concepts sequentially.

---

# 22. The camera count issue

Because our scene visually contains one central panoramic head, we have to protect ourselves from unintentionally contradicting the system architecture.

I would handle this through two mechanisms.

First, the visual hardware is intentionally labelled:

**Illustrative inspection concept**

Second, near the end of the scene, one small line can appear:

> **Final camera count and imaging configuration remain subject to tyre geometry, visibility, resolution and production requirements.**

That is enough.

No giant legal disclaimer.

And it accurately reflects the technical notes, which explicitly leave camera count and line-scan/area-scan unresolved. 

---

# 23. What the real 360° camera is doing narratively

We should be precise about this.

The panoramic inspection head is doing three jobs in the **visual prototype**:

**making internal inspection physically understandable;**

**giving us a credible object to insert into the tyre;**

**creating a strong continuous transition into the inner-surface scene.**

It is not proof that one panoramic camera can satisfy all final production requirements.

That still requires engineering validation around:

working distance;

field of view;

curved/toroidal surface geometry;

occlusion;

optical visibility;

spatial resolution;

inspection cycle time.

The website itself should not make claims beyond that.

---

# 24. The crucial transition into the next scene

This is where Scene 01 can become truly memorable.

We've finished the rotation.

The central inspection head is still sitting inside the tyre.

Our cinematic camera is now above the tyre, looking down.

Slowly:

the camera begins descending toward the central opening.

The inspection head grows larger.

The physical tyre surrounds the viewport.

The outer factory starts disappearing beyond the bead.

We're moving from:

```text
looking at the tyre
```

to:

```text
being inside the measurement
```

No cut.

No page transition.

No camera portal.

---

# 25. The inspection lens becomes our visual bridge

I would use the camera lens itself as part of the transition.

Not as a cheesy:

> fly through the camera lens into cyberspace

effect.

Instead:

as we descend toward the optical head,

its glass catches the innerliner as a reflection.

That reflected inner surface becomes increasingly important.

Then focus shifts beyond the camera onto the actual tyre interior.

The inspection hardware moves out of frame beneath us.

Now the viewer is inside the tyre.

That's extremely natural.

---

# 26. Scene 01 ending composition

Near the scene end:

```text
┌──────────────────────────────────────┐
│                                      │
│        DARK CURVED INNERLINER        │
│                                      │
│     subtle surface texture visible   │
│                                      │
│                     one measurement  │
│                     region indicated │
│                                      │
└──────────────────────────────────────┘
```

Almost the entire viewport is tyre interior.

The factory is no longer visible.

The camera head is barely visible at the bottom or completely outside the frame.

One subtle coordinate indicator still survives:

`θ = current reference`

This is our continuity carrier.

---

# 27. Last line of Scene 01

I'd use something like:

# **WE HAVE CAPTURED THE SURFACE.**

Then, smaller:

**Now it has to become measurable.**

That naturally launches the canonical-surface transformation.

Another stronger option:

> **A picture is not enough. We need to know where every observation belongs.**

I actually prefer this because it directly creates the next question.

---

# 28. Scene progress choreography

A good initial timing model would be:

| Progress | Event |
|---:|---|
| **0.00–0.08** | Same tyre and camera pose inherited from Scene 00. Silence/stillness. |
| **0.08–0.18** | Enclosure isolates tyre; ambient lighting transitions. |
| **0.18–0.30** | Inspection mast rises. |
| **0.30–0.36** | Head reaches calibrated position and locks. |
| **0.36–0.43** | Controlled illumination activates. |
| **0.43–0.50** | Tyre rotation begins; viewer camera stays nearly static. |
| **0.50–0.60** | Encoder concept appears; angular position becomes visible. |
| **0.60–0.72** | Synchronized observations accumulate. |
| **0.72–0.82** | Camera slowly rises toward inner opening while acquisition continues. |
| **0.82–0.89** | `360°` reached. Rotation decelerates. |
| **0.89–0.93** | Coverage validation. |
| **0.93–0.96** | Acquisition confirmed; output state revealed. |
| **0.96–1.00** | Viewer camera descends toward inner surface; transition into next scene. |

Those values are not sacred.

They are a starting choreography for testing.

---

# 29. Recommended scene length

I would make this one of the longer physical scenes.

Approximately:

**Desktop: 350–420vh**

**Tablet: 280–330vh**

**Mobile: 230–280vh**

The inspection sequence contains several pieces of cause-and-effect.

If compressed too much, it becomes:

camera up → spin → done.

We need enough scroll distance that the client actually understands synchronization.

---

# 30. Scroll speed zones

Not all progress should consume equal scroll distance.

The important beats deserve more.

For example:

camera rise can be relatively quick.

Encoder synchronization deserves more dwell.

Coverage completion can be quicker.

The physical-to-inner-surface transition deserves more dwell again.

Conceptually:

```text
DEPLOY       ███████
LOCK         ███
ILLUMINATE   ███
ROTATE       ████████████████
SYNC         ████████████████████
VALIDATE     █████
ENTER TYRE   █████████████
```

The scroll allocation should follow comprehension, not animation duration.

---

# 31. HUD behavior

Scene 00 HUD was mostly dormant.

Scene 01 begins waking it up.

Top/bottom contextual identity can become:

**01 · PHYSICAL INSPECTION**

The contextual capsule can progress through states:

`MEASUREMENT`

then

`ROTATION SYNCHRONIZED`

then

`360° COVERAGE`

then

`SURFACE CAPTURED`

But don't constantly flash status changes.

Maybe only three meaningful states.

---

# 32. Progress rail

At the broader-journey level:

```text
PHYSICAL          SURFACE          INTELLIGENCE          PROCESS
██████████●────────○────────────────○─────────────────────○
```

The user is still in **PHYSICAL**.

We're not yet in the digital surface chapter.

---

# 33. Sound design, if later enabled

This scene could benefit from optional sound more than Scene 00.

Potential cues:

soft servo deployment;

mechanical lock;

relay-like illumination activation;

low motor sound during rotation;

small precision tone at successful coverage validation.

No sci-fi scanner sound.

No sonar ping.

No laser zap.

The equipment should sound expensive because it is precise, not because it sounds futuristic.

---

# 34. Mobile treatment

Mobile should emphasize the central geometry.

The inspection head entering the circular tyre is naturally well suited to portrait.

We can move toward a more top-down composition earlier.

Conceptually:

```text
┌─────────────────────┐
│                     │
│     INSPECTION      │
│                     │
│      ╭───────╮      │
│    ╭───────────╮    │
│   │    TYRE     │   │
│    ╰───────────╯    │
│         [◉]         │
│          │          │
│          │          │
│                     │
└─────────────────────┘
```

The camera mast is central.

Annotations live above/below rather than around the tyre.

---

# 35. Mobile encoder

Don't try to put a full circular engineering diagram next to the tyre.

Use a small compact angular strip near the bottom:

```text
0° ━━━━━━━●━━━━━━━━━━━━━━ 360°
          112°
```

Same concept.

Better readability.

---

# 36. Reduced-motion version

Reduced motion can use four static states.

First:

tyre positioned inside controlled cell.

Second:

inspection head inserted.

Third:

fixed inspection head + rotating tyre explanation represented diagrammatically.

Fourth:

completed angular coverage + captured observations.

Then move to the inner-surface static view.

The user should still understand every engineering concept.

---

# 37. Scene-specific 3D assets

This scene introduces:

inspection enclosure interior;

central mast;

inspection head;

lighting modules;

rotary support;

encoder/index assembly;

mechanical centring elements.

All must be independently created for the Tyre Lubricant project.

No borrowed industrial assets from the mining client work.

No copied scene composition.

No adapted proprietary model.

---

# 38. Camera-head asset hierarchy

I would build the inspection probe as modular parts:

```text
InspectionHead
│
├── outer housing
├── panoramic optics
├── lighting assembly
├── mounting collar
├── alignment marker
├── mast coupling
└── cable path
```

Why modular?

Because if later engineering review says:

> this should look more like multiple area-scan cameras,

or:

> the optics need to change,

we can swap the inspection module without rebuilding the whole environment.

That's exactly what we want while hardware remains unresolved.

---

# 39. Important technical implementation

The rotary angle needs to be a real shared value.

Something conceptually like:

```ts
theta = scanProgress * Math.PI * 2
```

Then the same `theta` should control:

tyre rotation;

encoder needle;

angular status;

surface acquisition position;

measurement-strip growth;

later canonical mapping.

That creates one authoritative angle.

Do not separately animate each element until they merely look synchronized.

They should **be mathematically synchronized**.

---

# 40. Acquisition map

Even before the real canonical map appears, internally the software can start filling the actual `SurfaceField`.

Something like:

```text
for every sampled θ
    mark observed surface range
    store illustrative observation
    mark acquisition valid
```

Then Scene 02/next scene uses the same data.

This prevents a visual discontinuity where Scene 01 “captured” one thing and Scene 02 suddenly invents another map.

---

# 41. The current tyre identity

From this point onward, the tyre should receive an internal identity.

For example:

```text
tyreRecord.id = "TYRE-DEMO-001"
```

Don't necessarily show that yet.

But all later illustrative intelligence should belong to that same record.

That matters when the tyre eventually joins the production-history timeline.

---

# 42. What NOT to do

This scene will fail if it becomes a sci-fi scan animation.

Specifically avoid:

laser beams bouncing around the inside;

bright holographic mesh immediately appearing;

panoramic camera spinning dramatically;

animated neural-network nodes;

“AI analyzing…” progress bars;

fake FPS displays;

fake confidence values;

lots of particles coming off the tyre;

red/green pass-fail immediately;

generic camera shutter effects every few degrees;

random image tiles flying out of the tyre;

showing a final heatmap before reconstruction;

claiming this exact hardware configuration is finalized.

---

# 43. Accuracy copy library

I would pre-author exact language agents/components are allowed to use.

Good:

**Illustrative inspection configuration**

**Encoder-synchronized acquisition**

**Controlled illumination**

**Complete inner-surface coverage**

**Angular position θ**

**Coverage validation**

**Imaging configuration subject to engineering validation**

Avoid:

**360° AI camera automatically detects every defect**

**Precision 99.9% inspection**

**Real-time defect detection**

**Patented scan technology**

**Final camera configuration**

unless future project evidence actually supports them.

---

# 44. Scene 01 continuity carrier

From Scene 00 into Scene 01:

**same tyre**

From Scene 01 into the next scene:

**same tyre + same angular coordinate + same captured observation**

That last part is extremely important.

One particular captured region can become the seed of our next transition.

For example:

at `θ = 217°`

we see a specific inner-surface region.

As the camera enters the tyre:

that same `217°` observation stays highlighted.

Then the next scene uses it to explain:

> how does this physical region become a location on the digital surface?

That makes the narrative almost self-explanatory.

---

# 45. Acceptance criteria for Scene 01/05

I would call this scene ready only when all of the following are true:

- The Scene 00 → 01 boundary is visually seamless.
- The inspection head looks like plausible industrial machine-vision equipment.
- It is clearly marked illustrative rather than the final selected hardware.
- The head rises mechanically and stops.
- The tyre, not the viewer's camera, clearly performs the inspection rotation.
- The encoder value and tyre rotation are mathematically synchronized.
- Captured observations clearly correspond to angular position.
- 360° rotation and acquisition-quality validation are presented as separate concepts.
- Controlled illumination looks physically plausible and modality-neutral.
- The final output is raw/synchronized observation, not a finished AI defect result.
- Mobile clearly communicates the same mechanism.
- Reduced motion communicates the same mechanism.
- Reverse scrolling retracts/reverses everything correctly.
- There is no scene cut at either boundary.
- No unsupported numbers are shown.
- No final camera configuration is falsely claimed.
- The next scene begins from the exact same captured tyre surface, not a newly invented texture.

The viewer should leave **Scene 01/05** understanding one simple but crucial thing:

> **We are not simply photographing a tyre. We are creating a controlled, position-aware measurement of its complete inner surface.** 

And the natural next question becomes:

> **Now that the surface has been captured, how do those observations become one precise, comparable digital tyre surface?**

That is what **Scene 02/05** should answer.