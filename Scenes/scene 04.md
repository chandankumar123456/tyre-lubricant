# Scene 04/05 — **Understand What the Process Should Have Produced**

Scene 04 is where the experience makes its biggest conceptual jump.

Until now, we have only looked at the **product**.

Scene 00: one tyre entered the line.  
Scene 01: we measured its inner surface.  
Scene 02: we converted that measurement into `(θ,s)` space.  
Scene 03: we learned normal production and discovered that our current tyre differs from it.

At the end of Scene 03, we know:

> **Something about this tyre is unusual.**

Scene 04 asks the much more valuable manufacturing question:

# **GIVEN WHAT THE MACHINE WAS DOING, DOES THIS RESULT MAKE SENSE?**

This is what elevates the concept beyond vision inspection.

The source architecture explicitly defines Idea 2 as a second, complementary expectation: Idea 1 asks whether the tyre resembles historically acceptable production, while Idea 2 asks what surface should be expected given the tyre variant, geometry, and actual process state. 

This scene should therefore feel like the moment when the **factory enters the intelligence model**.

---

# 1. Scene identity

Internal name:

`scene-04-process-aware`

Visible chapter title:

# **UNDERSTAND THE PROCESS**

The main question shown once the scene settles:

# **SHOULD THE MACHINE HAVE PRODUCED THIS?**

Idea identity:

**IDEA 2 · PROCESS + PHYSICS + VISION**

Colour identity:

restrained amber/orange.

Scene 03's blue should not suddenly disappear.

Instead, blue remains attached to the historical normal fingerprint while amber gradually enters with the process-conditioned model.

That visual distinction matters because the two models are complementary rather than replacements.

---

# 2. Exact starting frame

Scene 03 ends with our hero tyre's deviation map occupying the centre.

Something like:

```text
                     CURRENT TYRE

              DEVIATION FROM NORMAL

0°                                               360°
┌──────────────────────────────────────────────────┐
│                                                  │
│                   ░░░░                           │
│              ▓▓▓▓▓▓                              │
│                                                  │
└──────────────────────────────────────────────────┘

            illustrative abnormal region
```

We may have characterized its spatial form illustratively as something resembling:

**Lower-Bead Accumulation**

or another agreed example.

But the scene does **not** end by claiming why it happened.

Instead the final Scene 03 statement remains:

# **WE KNOW WHAT IS DIFFERENT.**

Then:

# **BUT WHAT WAS THE PROCESS DOING?**

Nothing disappears.

Scene 04 begins from that exact frame.

---

# 3. The deviation map must stay on screen

This is the continuity carrier.

Do not clear the screen and show a new machine animation.

The current deviation remains visible throughout the early part of Scene 04.

That is important because the viewer needs to understand that all process information we are about to introduce belongs to **this exact tyre**.

Not production in general.

Not hypothetical machinery elsewhere.

This tyre.

---

# 4. First new element: the tyre record acquires a production context

A subtle identity strip emerges near the surface representation.

Not a dashboard card.

More like a technical record header:

```text
CURRENT TYRE

Variant      [illustrative variant]
Station      [illustrative station]
Production   timestamp-linked record
Inspection   canonical surface available
```

Do not invent realistic-looking serial numbers unless necessary.

Do not show fake factory IDs that could be mistaken for client data.

A global label should still say:

**Illustrative prototype data**

The conceptual message is:

> The surface measurement belongs to a specific manufactured tyre with a specific production context.

---

# 5. Time alignment enters early

Before we show process parameters, establish one fundamental relationship:

```text
TYRE PRODUCTION
      │
      ▼
PROCESS STATE AT THAT TIME
      │
      ▼
TYRE INSPECTION
```

Or more directly:

```text
TYRE RECORD
     │
     ├── Surface observation
     ├── Variant
     ├── Production timestamp
     ├── Process state
     └── Station context
```

The technical architecture requires visual observations and manufacturing state to be time-aligned for the same tyre; that paired record is also what later enables process-history analysis in Idea 3.

This is a quiet but important beat.

---

# 6. Strong copy

Once the link is visually clear:

# **A SURFACE DOES NOT EXIST IN ISOLATION.**

Then:

**It was produced under a particular process state.**

That's the conceptual bridge.

---

# 7. Bring the physical manufacturing process back

Scene 03 was almost entirely analytical.

Scene 04 should reintroduce **just enough physical geometry** to remind the viewer where the process variables come from.

Do not return to the entire cinematic factory.

Instead, create a simplified engineering representation:

```text
                       SPRAY SYSTEM

                           ↓
                        nozzle
                          \│/
                           ▼

                  ╭────────────────╮
                ╭─╯                ╰─╮
               │        TYRE          │
                ╰─╮                ╭─╯
                  ╰────────────────╯
                         ↻
```

It should feel like a technical model of the actual manufacturing relationship.

Not another full cinematic scene.

---

# 8. The process representation should reuse tyre geometry

This should not be a random generic tyre diagram.

Use simplified geometry derived from the same hero tyre.

The viewer should subconsciously recognize it.

The representation can become more diagrammatic:

outline;

profile;

spray geometry;

rotation axis;

surface relationship.

But its dimensions and silhouette should remain consistent with the project's tyre asset.

---

# 9. Do not show a finalized machine design

We do not know the client's exact process hardware configuration from the provided documents.

So this physical representation needs a quiet label:

**Illustrative process geometry**

That is enough.

Do not create an elaborate spray machine with detailed motors, pumps and nozzle assemblies and accidentally imply:

> this is the client's exact production station.

We only need enough geometry to explain the variables.

---

# 10. Process parameters begin entering

Now we introduce `P`, the process state.

The source architecture says the interface should accommodate variables such as pressure, flow, spray duration, nozzle position/orientation, rotation speed, nozzle-to-tyre distance, timing, material conditions, station and variant—but it explicitly warns against assuming that every parameter is available.
So the UI should say:

# **AVAILABLE PROCESS STATE**

not:

# **THE SYSTEM MEASURES ALL OF THESE**

And perhaps a small note:

**Exact signals depend on machine integration.**

---

# 11. Process parameters should belong to physical objects

Do not show nine horizontal slider cards.

Instead, attach parameters spatially to their source.

For example:

```text
                         Pressure
                            │
                            ▼
                       ┌────────┐
                       │ Nozzle │ ◀──── Orientation
                       └────────┘
                          │
               Flow ──────┤
                          │
                          ▼
                      spray zone


          Distance ↕


                 ╭─────────────╮
                │     TYRE      │
                 ╰─────────────╯
                       ↻
                 Rotation speed


           Timing / duration
              associated
              with cycle
```

That instantly communicates more than nine parameter cards.

---

# 12. Parameters I would actually animate

Do not animate every possible process variable.

That would become noise.

For the cinematic prototype I would choose **two primary variables** to demonstrate process conditioning.

For example:

**Nozzle position**

and

**spray pressure**

or:

**Nozzle position**

and

**flow**

I slightly prefer:

### Nozzle position

because it has obvious spatial meaning.

### Pressure / flow

because it has an intuitive relationship with deposition magnitude.

Everything else can remain present but quiet.

---

# 13. Important accuracy label

The moment process values appear:

**Illustrative process conditions — not validated client production data**

This can live unobtrusively beneath the engineering view.

Do not show fake readings such as:

`Pressure 4.7 bar`

`Flow 1.82 L/min`

unless the project later receives real values.

Use normalized or qualitative representations.

For example:

```text
Pressure      nominal region
Flow          nominal region
Nozzle pos.   shifted from reference
Rotation      reference region
```

Even those remain illustrative.

---

# 14. Do not use green/red too early

A process parameter slightly different from historical behaviour is not necessarily automatically “bad”.

So don't use:

green = good;

red = bad

for every parameter.

Use neutral line positions and amber emphasis.

Actual abnormality can be introduced later through comparison.

---

# 15. Build the process-state vector conceptually

Once the physical parameter annotations are understood, they collapse into one cleaner representation:

# **PROCESS STATE — P**

Conceptually:

```text
P = [
    pressure,
    flow,
    timing,
    nozzle geometry,
    rotation,
    ...
]
```

Don't turn this into a programming array on screen.

Use the equation very briefly.

The purpose is to say:

> these conditions together describe the machine state associated with this tyre.

---

# 16. Tyre geometry becomes an explicit input

Now the tyre outline remains beside the process state.

Label:

**Tyre geometry / variant**

Then we visually establish:

```text
TYRE VARIANT + GEOMETRY
             +
       PROCESS STATE
             ↓
       ?
```

This question mark is useful.

We are about to ask what surface distribution should be expected.

---

# 17. Bring in physics carefully

This is where the scene could easily overclaim.

Do **not** suddenly launch a beautiful Navier–Stokes CFD simulation.

That would look impressive but would communicate the wrong architecture.

The documentation explicitly says the concept does not assume a complete exact CFD solution. Physical understanding provides constraints and relationships while production data can learn what remains difficult to model directly.

So visually, show **relationships**, not full simulated fluid physics.

---

# 18. What “physics” should look like

A few restrained geometrical overlays are enough:

spray direction cone;

nozzle orientation;

distance to tyre surface;

relative motion;

coverage region;

tyre rotation direction.

Something like:

```text
                    nozzle
                       │
                    ╲  │  ╱
                     ╲ │ ╱
                      ╲│╱
                       ▼
                  spray geometry

                      ↓

                curved tyre surface
              ╭────────────────╮
              │                │
              ╰────────────────╯
                     ↻
```

The visual says:

> Geometry and process relationships constrain what deposition should be plausible.

That is all.

---

# 19. Strong line

# **NOT PERFECT PHYSICS. NOT A BLACK BOX.**

Then perhaps:

**Physical constraints + learned production behaviour.**

I really like this line for the scene because it expresses the hybrid modelling philosophy very clearly.

A softer client-facing version could be:

# **COMBINE WHAT WE KNOW WITH WHAT PRODUCTION TEACHES US.**

Then underneath:

**Physical relationships + observed manufacturing behaviour**

This may be more polished.

---

# 20. Historical paired examples enter

To explain the “learned production behaviour” part, introduce a few historical paired examples.

Not as dozens of cards.

As a stream:

```text
PROCESS STATE A  ─────────→  SURFACE A

PROCESS STATE B  ─────────→  SURFACE B

PROCESS STATE C  ─────────→  SURFACE C

             ...

PROCESS STATE N  ─────────→  SURFACE N
```

Because Scene 02 gave us canonical surface maps, every surface here uses the same coordinate language.

This is important.

We don't need to explain machine learning algorithms.

The relationship itself is enough.

---

# 21. The scene now constructs the process-conditioned model

The inputs visually converge:

```text
           TYRE VARIANT
                +
              GEOMETRY
                +
           PROCESS STATE
                +
     PHYSICAL RELATIONSHIPS
                +
   LEARNED PRODUCTION BEHAVIOUR
                │
                ▼
       PROCESS-CONDITIONED
         EXPECTED SURFACE
```

This should be the main conceptual centrepiece of Scene 04.

---

# 22. Avoid the “AI black box” visual

Do not put a glowing rectangular box labelled:

`AI MODEL`

between inputs and output.

That is lazy visual storytelling.

Instead, let the inputs physically influence the expected surface.

Nozzle position shifts slightly.

The expected deposition region moves.

Pressure/flow changes.

Expected field intensity changes.

Rotation relationship changes.

Expected distribution responds.

The audience will understand the model through cause and effect.

---

# 23. Generate an expected surface

The process-conditioned expected surface materializes.

Label:

# **EXPECTED UNDER THIS PROCESS STATE**

or more technically:

`S_expected(θ,s | variant, P)`

The equation can appear small.

The title is what matters.

The resulting surface uses the same coordinate system as:

historical fingerprint;

observed tyre;

deviation map.

Everything should align perfectly.

---

# 24. This map must differ from historical normal

This is one of the most important visual moments.

Scene 03 gave us:

**historically normal expectation**

Scene 04 gives us:

**what is expected given these specific machine conditions**

Those are not necessarily identical.

Show both briefly:

```text
HISTORICAL NORMAL              PROCESS-CONDITIONED EXPECTED

┌──────────────────────┐       ┌──────────────────────┐
│                      │       │                      │
│        BLUE          │       │       AMBER          │
│                      │       │                      │
└──────────────────────┘       └──────────────────────┘
```

The difference should be subtle but visible.

This communicates the entire reason Idea 2 exists.

---

# 25. Strong copy

# **TWO DIFFERENT QUESTIONS.**

Blue:

**What does acceptable production usually look like?**

Amber:

**What should this specific process state have produced?**

That's an excellent explanatory beat.

---

# 26. Our hero tyre returns to the centre

Now we have three related representations:

```text
                 CURRENT TYRE
                    OBSERVED
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
 HISTORICAL NORMAL           PROCESS EXPECTED
       BLUE                       AMBER
```

Do not turn this into a three-card dashboard.

Use alignment and depth.

Observed surface sits forward.

The two expectations sit behind it, slightly separated laterally.

---

# 27. Compare observed vs process-conditioned expected

Now perform the second key comparison.

Scene 03 produced:

`D_normal`

Scene 04 produces:

`D_process`

Use the wording:

# **PROCESS-CONDITIONED DEVIATION**

The source architecture describes this as the difference between observed and process-expected distribution.

Again, the exact production formula remains open even though the architectural concept is clear.

---

# 28. The visual colour language

Historical-normal comparison:

**blue**

Process-conditioned comparison:

**amber**

The actual deviation field can still use the same diverging data scale.

But its border, axis accent or chapter identity can indicate which comparison we're viewing.

Never change the mathematical meaning of colours just because we changed ideas.

---

# 29. The key explanatory example

This is where we can demonstrate why Idea 2 adds value.

Our hero tyre has an abnormal region.

Scene 03 says:

> This differs from historical normal.

Now suppose our **illustrative** process state includes a small nozzle displacement.

The process-conditioned expected surface also shifts toward that region.

Then the comparison may show:

> some of the observed abnormal spatial pattern is consistent with the current machine state.

This should be phrased as:

# **THE OBSERVATION IS CONSISTENT WITH THIS PROCESS CONDITION.**

Not:

**Nozzle position caused the defect.**

That causal distinction matters enormously.

---

# 30. Two cases should be demonstrated

I would actually make Scene 04 contain two short conceptual cases.

Not two different hero tyres.

One can be a brief explanatory split.

### Case A — Process explains part of what we see

```text
Historical normal:       unusual

Process state:           shifted

Process expectation:     predicts similar shift

Observed:                similar spatial change
```

Result:

**Observed behaviour is consistent with current process conditions.**

### Case B — Process does not explain it

```text
Historical normal:       unusual

Process state:           apparently normal

Process expectation:     normal-ish

Observed:                abnormal
```

Result:

**Unexplained residual remains.**

This second case is incredibly important because it prevents the system from pretending the currently monitored variables explain everything.

The architecture explicitly keeps this possibility open and lists unmonitored variables, equipment degradation, optical issues, material variation or mechanical factors as possible reasons for unexplained residual behaviour.

---

# 31. But do not change the hero story

For our actual persistent hero tyre, choose one outcome and maintain it.

I recommend:

> **The process state explains part—but not all—of the observed deviation.**

Why?

Because that sets up Scene 05 beautifully.

If process variables explain everything perfectly, root-cause/drift intelligence feels too easy.

If they explain nothing, Idea 2 feels weak.

A partial explanation is richer:

```text
observed anomaly
      │
      ├── process-consistent component
      │
      └── unexplained residual
```

This feels realistic and creates investigation value.

---

# 32. Residual becomes the hero

After comparison, most explained variation can visually quiet down.

What remains highlighted is:

# **UNEXPLAINED RESIDUAL**

Not necessarily “defect”.

Residual means:

> what the current process-conditioned model did not explain.

This is a much more intelligent concept.

---

# 33. Visual treatment of residual

Imagine the observed map and expected process map temporarily overlay.

Areas where they agree settle into neutral.

The remaining region stays visible.

Something like:

```text
OBSERVED
   │
   ├──────── matches expectation ───────→ fades quiet
   │
   └──────── unexplained difference ────→ remains
```

No flashy subtraction explosion.

The visual should feel analytical.

---

# 34. Strong line

# **WHAT THE PROCESS CANNOT EXPLAIN BECOMES EVIDENCE.**

This may be my favourite line in Scene 04.

It naturally sets up the final intelligence layer.

---

# 35. Process-model confidence

Now introduce another important engineering concept.

The source architecture says a process-conditioned prediction should distinguish well-supported operating conditions from parameter combinations with limited historical support.

Do not show:

`Confidence = 92.6%`

unless justified.

Instead, show something like:

**Historical support**

`Established operating region`

or:

`Limited historical support`

For our hero example, choose:

**Supported operating region**

if we want the expected map to have interpretive weight.

---

# 36. A small out-of-distribution demonstration

Briefly move one illustrative process parameter outside the historically observed envelope.

The expected map becomes slightly muted.

A message appears:

**Limited support for this process combination**

Then restore the hero state.

This communicates:

> the model knows when it is being asked about unfamiliar conditions.

Very useful.

Keep it short.

---

# 37. Do not introduce model architecture names

The documentation leaves model selection open, potentially ranging from statistical regression and boosted methods through probabilistic, neural or physics-informed approaches, depending on actual data and operational needs.

Therefore do not animate:

Random Forest;

XGBoost;

CNN;

Transformer;

Physics-Informed Neural Network.

They are implementation possibilities, not architectural commitments.

Visible copy:

**Model class selected after data and validation requirements are known.**

This may live only in the Engineering Reality section rather than the cinematic scene.

---

# 38. What “AI” looks like in this scene

Nothing.

And that's good.

The AI is the changing relationship:

```text
PROCESS STATE
      ↓
EXPECTED SURFACE
      ↓
COMPARE TO OBSERVED
      ↓
RESIDUAL
```

That is much more credible than a network animation.

---

# 39. Product evidence vs process evidence

Near the end of the scene, summarize the distinction.

On the left:

### PRODUCT EVIDENCE

**What actually happened on the tyre?**

The observed canonical surface.

On the right:

### PROCESS EVIDENCE

**What was the manufacturing system doing when it happened?**

Process state + expected surface.

Then in the centre:

### PROCESS-AWARE INTERPRETATION

The source architecture explicitly frames Idea 2 as the move from vision-based inspection toward process-aware inspection. 

---

# 40. This should not look like two dashboard cards

Use the physical causal relationship.

Perhaps:

```text
                   CURRENT TYRE
                  observed surface
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
       PRODUCT SIDE           PROCESS SIDE
     what happened?        what was happening?
             │                     │
             └──────────┬──────────┘
                        ▼
                 COMBINED EVIDENCE
```

Think technical editorial composition.

Not product UI.

---

# 41. Process anomaly vs product anomaly

This distinction deserves one compact visual beat.

### Scenario A

Machine/process state looks ordinary.

Tyre still deviates.

Potential meaning:

**Product anomaly not explained by monitored process state.**

### Scenario B

Machine/process state is outside its expected region.

Observed tyre behaviour is consistent with it.

Potential meaning:

**Process abnormality reflected in the product.**

The technical architecture explicitly distinguishes these situations because they matter later for investigation.

Don't spend 20 seconds here.

A clean split animation is enough.

---

# 42. One crucial language rule

Never show:

**ROOT CAUSE FOUND**

during Scene 04.

We're not there yet.

Scene 04 can say:

**consistent with**

**associated with**

**explained by current process model**

**unexplained residual**

**process condition worth investigating**

But not:

**confirmed cause**

Scene 05 owns the temporal/root-cause intelligence layer.

Even there, causal claims remain carefully qualified.

---

# 43. We now convert the current tyre into a complete production record

This is the transition toward Scene 05.

The screen currently contains:

hero surface;

historical normal deviation;

process-conditioned deviation;

process state;

residual;

timestamp context.

These now consolidate.

Something like:

```text
                     TYRE RECORD

                  CURRENT TYRE
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    SURFACE          PROCESS        RESULT
   BEHAVIOUR          STATE
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                    TIMESTAMP
```

This is exactly the object Scene 05 needs.

---

# 44. Do not introduce a traditional database UI

No table rows.

No SQL aesthetic.

No folders.

No “Record ID” cards.

The tyre itself simply becomes one temporal observation.

That is enough.

---

# 45. The first timeline hint

Our single tyre record moves slightly left.

A faint line extends horizontally.

For the first time we sense:

**there were tyres before this one**

and

**there will be tyres after it.**

Maybe one ghosted record appears before it.

Then another after.

But do not reveal the full drift timeline yet.

That is Scene 05's entrance.

---

# 46. Scene 04 final question

The screen should eventually contain our current tyre as one process-aware record.

Then copy:

# **ONE TYRE CAN TELL US WHAT HAPPENED.**

Pause.

Then:

# **WHAT IF THE SAME SIGNAL KEEPS CHANGING?**

That's the handoff.

---

# 47. Exact Scene 04 → Scene 05 transition

I would make this transition particularly strong.

Our current tyre record is centered.

Then it moves slightly to the left as another tyre record appears to its right.

Then another.

Then another.

The camera doesn't cut.

The analytical space simply expands.

Our single process-aware comparison becomes:

```text
T₁        T₂        T₃        T₄        T₅ ...
│         │         │         │         │
tyre      tyre      tyre      tyre      tyre
```

Process traces begin connecting underneath them.

Now:

one inspection

has become:

**production history**.

Scene 05 begins.

---

# 48. Camera language

Scene 04 should remain mostly analytical.

However, it can reintroduce a little controlled 3D depth when showing the process geometry.

I would use three camera phases.

### Phase A — Carryover

Orthographic canonical surface from Scene 03.

### Phase B — Process model

Very small perspective depth appears as tyre/nozzle geometry enters.

Not a full cinematic camera.

More like an engineering model floating in analytical space.

### Phase C — Comparison

Return to nearly orthographic.

Expected maps and residual are easier to understand without perspective.

### Phase D — Timeline preparation

Very subtle zoom-out.

Not movement for spectacle.

Movement because we're about to expand from one tyre to many.

---

# 49. Background behaviour

Keep the same neutral analytical field.

When physical process geometry appears, do not restore the entire factory background.

The viewer shouldn't feel that we went backwards.

Use a ghosted process-stage silhouette or technical sectional representation.

This scene is no longer about touring machinery.

It's about understanding manufacturing relationships.

---

# 50. Proposed progress choreography

| Progress | Event |
|---:|---|
| **0.00–0.06** | Exact Scene 03 deviation map remains. |
| **0.06–0.13** | Ask what the process was doing; production context attaches to tyre. |
| **0.13–0.20** | Timestamp/process alignment is established. |
| **0.20–0.29** | Simplified process geometry enters. |
| **0.29–0.39** | Available process variables attach to physical relationships. |
| **0.39–0.45** | Process state `P` consolidates. |
| **0.45–0.54** | Geometry + physical constraints + historical paired behavior converge. |
| **0.54–0.64** | Process-conditioned expected surface is built. |
| **0.64–0.70** | Historical-normal expectation vs process-conditioned expectation. |
| **0.70–0.79** | Hero observed surface compares against process expectation. |
| **0.79–0.86** | Process-conditioned deviation / residual emerges. |
| **0.86–0.90** | Supported vs limited process-model confidence concept. |
| **0.90–0.94** | Product evidence + process evidence combine. |
| **0.94–0.97** | Current tyre becomes full time-aligned record. |
| **0.97–1.00** | Record moves into beginning of production timeline. |

This should be tuned later through actual interaction testing.

---

# 51. Recommended scene length

Desktop:

**480–560vh**

Tablet:

**380–450vh**

Mobile:

**310–380vh**

This is conceptually dense.

But again, scroll distance shouldn't be thought of as “page length.”

It's our timeline for comprehension.

The scene must have enough room for:

process context;

expected deposition;

second comparison;

residual;

timeline transition.

---

# 52. Semantic beats

The implementation should define meaningful states such as:

```text
process.currentDeviation
process.contextRequested
process.timeAligned
process.geometryVisible
process.inputsVisible
process.stateFormed
process.constraintsVisible
process.historicalPairsVisible
process.expectationBuilding
process.expectationReady
process.twoExpectations
process.comparingObserved
process.deviationVisible
process.residualVisible
process.supportState
process.combinedEvidence
process.recordComplete
process.historyBeginning
```

Again, exact naming isn't sacred.

The semantic separation is.

---

# 53. Scene copy

I would keep the main visible copy to approximately six beats.

### Beat 1

# **WE KNOW WHAT CHANGED.**

**Now ask what the process was doing.**

### Beat 2

# **EVERY TYRE HAS A PROCESS STATE.**

**Its surface can be linked to the manufacturing conditions under which it was produced.**

### Beat 3

# **WHAT SHOULD THESE CONDITIONS HAVE PRODUCED?**

**Geometry + process state + physical relationships + learned production behaviour.**

### Beat 4

# **TWO EXPECTATIONS.**

**Historical normal. Process-conditioned expected.**

### Beat 5

# **WHAT THE PROCESS CANNOT EXPLAIN BECOMES EVIDENCE.**

**Residual behaviour remains available for investigation.**

### Beat 6

# **ONE TYRE IS ONE MOMENT IN THE PROCESS.**

**Now look across time.**

Then Scene 05.

---

# 54. Mobile layout

This scene needs to be redesigned vertically rather than compressed.

Start:

deviation map full width.

Then scroll down into:

**process geometry**

Then:

process variables arrange around it.

Then:

geometry collapses.

Next screen:

**process-conditioned expected map**

Then vertically:

```text
OBSERVED

────────────

PROCESS EXPECTED

────────────

RESIDUAL
```

Then:

historical normal and process expected can be shown as a toggle-like scroll transformation—not an interactive toggle unless needed.

Finally:

tyre record shrinks into timeline.

---

# 55. Mobile process variables

Do not try to place nine labels around a tiny nozzle illustration.

Show the physical core:

**Nozzle geometry**

**Pressure / flow**

**Rotation**

Then underneath:

**Timing · distance · material condition · station context · other available signals**

The message is architecture, not parameter cataloguing.

---

# 56. Reduced-motion version

The reduced-motion sequence can use static plates.

**Plate 1:** current deviation + associated tyre record.

**Plate 2:** process geometry with representative possible inputs.

**Plate 3:** expected deposition under process state.

**Plate 4:** observed vs process expected.

**Plate 5:** residual and combined product/process evidence.

**Plate 6:** current tyre becomes one historical record.

No continuously changing parameter animation is necessary.

---

# 57. Accessibility

Semantic explanation should communicate something close to:

> The process-aware model combines the tyre variant and geometry with available time-aligned manufacturing parameters to estimate what lubricant distribution would be expected under those conditions. This expectation is compared with the measured surface. Differences form a process-conditioned deviation or residual. The process-aware model complements rather than replaces the historical normal-process model.

This is supported directly by the technical architecture. 

---

# 58. Illustrative-data architecture

We should not hand-author a pretty process expected map.

Create a deterministic illustrative forward relationship.

It does not need to represent real fluid dynamics.

It simply needs to demonstrate causally coherent visual relationships.

Conceptually:

```text
baseExpected(variant)
       +
nozzleOffsetEffect
       +
pressureEffect
       +
flowEffect
       +
rotationEffect
       =
illustrativeProcessExpected
```

Every effect should be explicitly a **prototype visual model**, not production science.

---

# 59. A possible synthetic forward model

For example, purely for presentation:

`baseExpected(θ,s)`

comes from our normal-model family.

A nozzle lateral offset could:

shift deposition along `s`.

A timing phase offset could:

shift distribution along `θ`.

Relative pressure/flow could:

scale broad deposition response.

Rotation variation could:

change angular spread.

This gives process variables visually understandable consequences.

But we must document internally:

> These relationships are illustrative and do not constitute validated tyre-lubricant physics.

That's essential.

---

# 60. The model must be deterministic

If nozzle position changes from A to B and then the user scrolls backward:

the expected map must mathematically return to A.

No randomly regenerated textures.

No noise changing every render.

Use seeded fields.

---

# 61. Process confidence implementation

For the prototype, define a simple illustrative support envelope around the synthetic historical process-state population.

If the current state lies inside that region:

**well-supported**

If far outside:

**limited support**

No percentage.

This accurately demonstrates the architectural concept without inventing calibration.

---

# 62. Do not over-animate sliders

We could easily ruin the scene by turning process parameters into a motion-design playground.

Avoid:

pressure needle bouncing;

flow slider animating constantly;

nozzle oscillating;

rotation gauge spinning;

timing graphs flashing.

Choose one controlled parameter intervention at a time.

The process model should feel scientific, not gamified.

---

# 63. One optional micro-demonstration

I would keep one particularly educational interaction.

The nozzle representation shifts slightly along its permitted geometry.

At the same time:

the expected deposition field shifts spatially.

Then the nozzle returns.

Expected field returns.

No text necessary initially.

Then:

**Process conditions change what we should expect.**

That visual alone can explain Idea 2.

---

# 64. What not to show

I would reject Scene 04 if it contains:

a full CFD simulation presented as reality;

animated fluid particles implying validated spray physics;

a neural-network brain;

an LLM-style reasoning panel;

fake real-time PLC tags;

fake bar/flow/temperature readings;

a statement that every listed process variable is already available;

one universal process model regardless of variant;

“root cause confirmed” language;

a process model replacing Idea 1 instead of complementing it;

confidence represented by arbitrary percentages;

a complex dashboard of machine telemetry;

a new hero tyre map inconsistent with Scene 03;

process data not tied to the same tyre/timestamp;

autonomous machine adjustment.

---

# 65. Technical QA invariants

The same hero observation field must survive unchanged.

The same `D_normal` from Scene 03 must remain available.

`processExpected` must derive from:

hero variant + illustrative process state.

`D_process` must derive from:

hero observation vs process expected.

Changing an illustrative process parameter should deterministically alter the expected map.

Reversing the scroll should restore the previous expected surface exactly.

If the hero process state is flagged as low-support, that state must affect interpretation rather than merely showing a warning icon.

No invalid surface region from Scene 02 should suddenly become trusted because we're now in Scene 04.

---

# 66. Visual QA captures

Capture at minimum:

`0.00` — carried-over Scene 03 deviation

`0.10` — tyre process record context

`0.18` — time alignment

`0.27` — process geometry

`0.35` — process variables

`0.43` — process state formed

`0.50` — physics/data relationship

`0.59` — process expected map

`0.67` — two expectations

`0.74` — observed vs process expected

`0.82` — residual

`0.88` — support/confidence concept

`0.93` — combined evidence

`0.97` — complete tyre record

`1.00` — beginning of history

The 0.50–0.85 range deserves extra review because that is where the conceptual model could become visually confusing.

---

# 67. Scene 04 must answer one sentence

If I show this scene to a client and ask:

> “What did you just learn?”

The ideal answer is:

> **We don't only compare the tyre against historical normal. We can also use the machine conditions and tyre geometry to estimate what should have happened under that specific process state, then see what the process does and doesn't explain.**

If they say:

> “There was some AI dashboard with pressure and a heatmap.”

then we failed.

---

# 68. Final picture in my head

Scene 03 ends with a blue deviation field.

We know where this tyre differs from acceptable production.

The map does not disappear.

Instead, a production timestamp quietly attaches to it.

From one side enters a simplified spray nozzle and tyre geometry.

Pressure.

Flow.

Nozzle position.

Rotation.

Timing.

They don't arrive as dashboard widgets.

They attach themselves to the physical process.

Then the physical geometry becomes cleaner.

The process state consolidates.

Historical process/surface pairs appear for a moment.

Physical relationships constrain the geometry.

Production history supplies learned behaviour.

Together they build:

# **EXPECTED UNDER THIS PROCESS STATE**

The amber expected surface appears.

For a moment the screen holds two expectations:

blue:

**historically acceptable**

amber:

**expected from this machine state**

Then our actual measured tyre sits between them.

We compare.

Some of the abnormal pattern is consistent with the process-conditioned expectation.

That part goes quiet.

But one residual region remains.

Text:

# **WHAT THE PROCESS CANNOT EXPLAIN BECOMES EVIDENCE.**

The tyre surface, process state, residual and timestamp collapse into one production record.

That record moves left.

Another tyre record appears.

Then another.

A horizontal line starts extending through them.

The camera slowly pulls back.

One tyre has become the beginning of a manufacturing history.

And the final question appears:

# **IS THIS AN ISOLATED EVENT—OR IS THE PROCESS CHANGING?**

That is where **Scene 05/05** begins.