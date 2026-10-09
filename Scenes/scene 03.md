# Scene 03/05 — **Learn What Normal Looks Like**

This is the first scene where the experience becomes genuinely **intelligent**.

Scene 00 gave us the tyre.

Scene 01 measured it.

Scene 02 turned that measurement into a canonical surface.

Scene 03 now asks the first real intelligence question:

# **IS THIS TYRE NORMAL?**

But there is a very important storytelling decision here:

> **Do not begin Scene 03 by showing a defect. First teach the viewer what “normal” actually means.**

If we immediately show a red abnormal region, the audience will reduce the whole system to conventional defect detection.

That would undersell the idea.

The more interesting concept is:

> **The system learns the spatial behaviour of verified acceptable production—including natural variation—and then asks how the current tyre differs from that population.**

The source architecture explicitly defines the fingerprint as variant-specific and as a distribution of expected behaviour and variation, not one perfect reference image.

So Scene 03 should feel less like:

**“AI detects bad tyre.”**

and more like:

**“We now have a mathematical definition of what acceptable production normally looks like across the entire surface.”**

---

# Scene identity

Internal name:

`scene-03-normal-fingerprint`

Visible chapter:

# **LEARN WHAT NORMAL LOOKS LIKE**

Later, once the model exists:

# **NOW COMPARE THIS TYRE.**

The scene's emotional progression should be:

**many acceptable examples → structure emerges → variation is preserved → current tyre enters → deviation becomes visible**

---

# Exact starting frame

Scene 02 ended with one canonical representation centered in a calm analytical space.

We have our hero tyre's measured surface:

```text
                     CURRENT TYRE

       θ = 0°                           360°
       ┌──────────────────────────────────┐
       │                                  │
       │             O(θ,s)               │
       │                                  │
       └──────────────────────────────────┘
                   surface profile s
```

This is still the **same tyre** we followed from the conveyor.

No new map.

No fresh synthetic image.

No scene reset.

The physical tyre is no longer dominant, but conceptually it remains attached to this record.

The current surface should sit alone for a moment.

Then the scene asks:

# **BUT WHAT SHOULD THIS SURFACE LOOK LIKE?**

That is the opening question.

---

# 1. Do not begin with “AI”

I would deliberately avoid words like:

**machine learning**

**AI model**

**neural network**

during the first part of this scene.

First explain the manufacturing logic.

The viewer already understands that corresponding regions across tyres can now be compared.

So the next visual idea is simple:

> **Bring in tyres that production has already verified as acceptable.**

The intelligence emerges naturally from that.

---

# 2. The current tyre moves aside

The hero tyre's map moves slightly forward or to one side.

Not into a rounded card.

Just enough room is created behind it.

Then a second canonical surface appears.

Then a third.

Then another.

All are aligned to exactly the same `(θ,s)` coordinate frame.

The surfaces should never appear scattered at arbitrary rotations or sizes.

That would destroy the point.

Instead:

```text
                 VERIFIED ACCEPTABLE PRODUCTION

        TYRE A
        ┌──────────────────────────────────┐
        │                                  │
        └──────────────────────────────────┘

        TYRE B
        ┌──────────────────────────────────┐
        │                                  │
        └──────────────────────────────────┘

        TYRE C
        ┌──────────────────────────────────┐
        │                                  │
        └──────────────────────────────────┘

        TYRE D
        ┌──────────────────────────────────┐
        │                                  │
        └──────────────────────────────────┘
```

But visually they should have depth rather than looking like spreadsheet rows.

Perhaps they arrive as a layered stack receding slightly in Z.

---

# 3. Use “verified acceptable,” not merely “good”

In casual narration, “good tyre” is understandable.

But for this client-facing experience, I would prefer:

**VERIFIED ACCEPTABLE TYRES**

because it implies that the AI is not autonomously declaring its own training examples good.

The underlying architecture specifically states that only tyres satisfying established quality criteria should contribute to the initial normal model. 

That is an important governance idea without needing a governance lecture.

Small annotation:

**Quality-verified production examples**

That's enough.

---

# 4. Each tyre must be similar, but not identical

This is crucial visually.

If every acceptable tyre has exactly the same surface map, the viewer learns the wrong lesson:

> “Normal means one exact perfect spray pattern.”

The documentation explicitly rejects that idea. Natural production variation must be represented rather than treated as a defect. 

So the illustrative dataset should contain controlled variation.

For example, all verified-acceptable surfaces may share a broad overall deposition tendency, but differ slightly in:

local response intensity;

edge distribution;

small spatial fluctuations;

minor bead-region behavior;

local smooth variation.

These differences should remain subtle.

None should contain the obvious anomaly we gave the hero tyre.

---

# 5. First important visual comparison

Show perhaps four accepted maps simultaneously.

The audience should be able to notice:

> They are related—but not identical.

Then show the line:

# **NORMAL IS NOT ONE PERFECT PATTERN.**

Below:

**Manufacturing naturally varies.**

That is one of the most important messages in the whole scene.

---

# 6. Variant identity enters now

Before aggregating the acceptable tyres, briefly reveal a variant identifier.

Something like:

**TYRE VARIANT A**

or a neutral prototype label:

**VARIANT α — ILLUSTRATIVE**

Do not use a fake commercial tyre SKU that looks real.

Then show:

**Fingerprint selected by tyre variant**

The underlying design is explicitly variant-specific because geometry, dimensions, spray requirements, acceptable coverage, bead characteristics and expected deposition can differ across variants.

We need the viewer to understand this without derailing the scene.

So this should be perhaps a 5–8 second narrative beat, not a subsection.

---

# 7. Brief variant mismatch demonstration

A very elegant micro-animation could make the point clear.

The acceptable maps currently belong to:

**Variant A**

For perhaps one scroll beat, switch the label to:

**Variant B**

The expected field changes shape/distribution slightly.

Then switch back to:

**Current tyre → Variant A → corresponding fingerprint**

This visually establishes:

> the system does not compare every tyre against one universal template.

Do not dwell on it.

---

# 8. Now align the population

The accepted surface maps move toward the same spatial plane.

Imagine transparent technical layers.

Each has the exact same axes.

As they overlap:

corresponding surface locations line up.

One persistent coordinate from earlier—perhaps our `θ≈217°` region—can be used again.

We can see that the same location exists across all samples.

This is the payoff from Scene 02.

The site is silently demonstrating:

> **Without the canonical surface, this population comparison would not make sense.**

---

# 9. Do not average immediately

If the stack simply becomes an average image, the viewer may conclude that the system is creating one golden template.

Instead, build two concepts separately:

**expected behaviour**

and

**natural variation**

The source architecture expresses these conceptually as `μ(θ,s)` and `σ(θ,s)`. 

This should become one of Scene 03's signature visuals.

---

# 10. Reveal `μ(θ,s)` — expected behaviour

The stack of acceptable maps remains visible.

Then slowly the individual surfaces reduce in opacity while a new derived surface appears at the centre.

Label:

# **EXPECTED BEHAVIOUR**

Then:

`μ(θ,s)`

Small.

This new surface is not a photograph.

It is clearly a statistical/derived representation.

It can use a smooth sequential colour field.

Copy:

**What response is typically expected at each surface location?**

That is all the mathematics the client needs.

---

# 11. Reveal `σ(θ,s)` — natural variation

Now the expected field remains.

A second derived layer emerges.

Not another “image card.”

Maybe a translucent band or a secondary map underneath.

Label:

# **NATURAL VARIATION**

`σ(θ,s)`

Copy:

**How much does acceptable production normally vary here?**

This is where the viewer realizes:

two regions may have completely different acceptable tolerances.

---

# 12. Spatial variation should be visually obvious

Choose two locations:

### Region A

Expected response relatively stable.

Variation narrow.

### Region B

Expected behavior more variable.

Variation wider.

Then show something like:

```text
REGION A                  REGION B

expected                  expected
   │                         │
 ──┼──                     ────────
   │                      broader range
narrow range
```

But don't turn this into a statistics lecture.

The visual conclusion should be:

> **A deviation of the same numerical size may be normal in one region and unusual in another.**

That is why one global threshold is insufficient. The source explicitly describes normality as spatially dependent and warns against treating every inner-surface region identically. 

---

# 13. Strong line

I would use:

# **DIFFERENT REGIONS. DIFFERENT EXPECTATIONS.**

Then:

**The model learns the spatial envelope of acceptable production.**

That's much more powerful than saying:

“AI calculates mean and standard deviation.”

---

# 14. The acceptable operating envelope

Now merge:

`μ(θ,s)`

and

`σ(θ,s)`

into one conceptual representation:

# **NORMAL SPRAY FINGERPRINT**

This is where the term finally enters prominently.

The map should communicate:

expected spatial behavior;

acceptable variation.

Not just a mean field.

Visually, perhaps the center field represents expectation and subtle translucent “breathing” or envelope bands represent allowable natural variation.

No exaggerated animation.

---

# 15. The fingerprint should feel stable

Once constructed, the visual system should calm down.

The background population of accepted tyres retreats.

The normal fingerprint remains centered.

No constant pulsing.

No glowing.

No AI sparkles.

We have produced a reference population model.

Treat it like an engineering artifact.

---

# 16. Carefully communicate controlled model evolution

This is not the main story, but I want one tiny visual cue because it prevents an important misunderstanding.

Do not show:

```text
new tyre → automatically learns → updates normal
```

That would be wrong.

Instead, perhaps a small side annotation appears briefly:

```text
NEW VERIFIED PRODUCTION
        ↓
QUALITY VALIDATION
        ↓
MODEL UPDATE / APPROVAL
```

Then disappears.

Copy:

**Normality does not update blindly.**

The architecture explicitly requires controlled validation so gradual deterioration does not get absorbed into the definition of normal.

This does not need more than a few seconds.

But it adds enormous credibility.

---

# 17. Now bring back our hero tyre

The normal fingerprint shifts slightly backward.

The hero tyre's observed surface—captured in Scenes 01 and 02—returns.

We should make this unmistakable.

Maybe its subtle identity follows it:

**CURRENT TYRE**

not another randomly generated map.

Now we have:

```text
         CURRENT TYRE                 NORMAL FINGERPRINT

       OBSERVED O(θ,s)           EXPECTED + VARIATION
┌───────────────────────────┐   ┌───────────────────────────┐
│                           │   │                           │
└───────────────────────────┘   └───────────────────────────┘
```

No cards.

No dashboard.

Just two aligned analytical surfaces.

---

# 18. The question changes

The scene's title can transform from:

**LEARN WHAT NORMAL LOOKS LIKE**

to:

# **HOW FAR DOES THIS TYRE DEVIATE?**

This is the transition from building the model to using the model.

---

# 19. Align observed with expected

Do not immediately produce the deviation map.

Let the viewer see the comparison.

The observed map and normal fingerprint approach one another.

They share the same coordinates.

Axis labels line up:

`θ`

`s`

Then perhaps the normal field moves behind the observed field.

This reinforces that we're comparing **corresponding locations**.

---

# 20. The subtraction moment

The representation becomes:

```text
OBSERVED
   −
EXPECTED BEHAVIOUR
   ↓
SPATIAL DEVIATION
```

I would not literally use arithmetic subtraction unless our actual definition later is confirmed to be a simple difference everywhere.

The detailed architecture intentionally describes:

`D(θ,s) = Deviation(Observed, Expected)`

rather than requiring one specific formula.

So visible language should be:

**Compare**

not necessarily:

**subtract**.

Internally, prototype data may use a standardized residual for visualization.

---

# 21. Deviation map colour grammar

This is where colour gains meaning.

Until now:

surface quantity used a sequential palette.

Now:

use a diverging palette.

Conceptually:

```text
less than expected  ←  expected  →  more than expected
```

Do not necessarily label that as:

**too little lubricant / too much lubricant**

unless the observation modality and calibration support that direct interpretation.

For the illustrative prototype, use careful language:

**lower-than-expected surface response**

**within expected range**

**higher-than-expected surface response**

Then where appropriate, defect characterization can interpret those patterns.

---

# 22. Make “normal” visually quiet

Most of the deviation map should become almost neutral.

Only meaningful departures should attract attention.

This is important.

Don't create an entire colourful psychedelic surface.

The power comes from:

> almost everything settles into normality—and then one region remains.

Our hero anomaly emerges.

The same region we may have subtly seeded in earlier scenes.

---

# 23. Persistent anomaly continuity

If our illustrative abnormal region began around:

`θ≈217°`

during acquisition,

then it must appear at the same corresponding location now.

This gives a beautiful long-range payoff:

Scene 01:

camera saw it.

Scene 02:

coordinates located it.

Scene 03:

population comparison tells us whether it is unusual.

That is the storytelling continuity we want.

---

# 24. First anomaly reveal

Everything quiets.

One abnormal region remains.

A thin outline draws around it.

Then three labels appear one at a time:

**LOCATION**

**EXTENT**

**MAGNITUDE**

No score yet.

Then perhaps:

**SHAPE**

This reflects the source design, where deviation is multi-dimensional rather than being reduced to one number. It may include magnitude, area, angular span, surface position, concentration, dry-region extent, shape, number of abnormal regions and persistence. 

---

# 25. Do not collapse the entire tyre into one anomaly score

This is a major design rule.

No:

**Tyre health = 72**

No:

**Anomaly score = 0.87**

No giant gauge.

Those are visually convenient but conceptually flatten the intelligence.

The spatial map itself is the hero.

This system's value is precisely that it knows **where** and **how** the tyre deviates.

---

# 26. Defect characterization comes after deviation

This ordering matters.

Do not start with:

“AI found Lower-Bead Accumulation.”

Instead:

**Deviation appears**

→ analyze spatial characteristics

→ determine whether the pattern corresponds to a known defect family.

That follows the architecture: the five defects sit above the canonical representation as patterns of deviation rather than independent primary classes. 

---

# 27. Visual characterization

Keep the deviation map centered.

Around the highlighted region, show three compact observations:

```text
shape
location
spatial intensity
```

These converge into:

**PATTERN CHARACTERIZATION**

Then the system asks:

**Does this resemble a known pattern?**

---

# 28. Show the five known patterns elegantly

Do not make five feature cards.

Instead, create a small technical pattern strip below the main map.

For example:

```text
01 Local Excess        ●

02 Lower-Bead          ▃▃▃

03 Multiple-Line       ┃   ┃   ┃

04 Single-Point        •

05 Missing Spray       ░░░░
```

Each has a tiny simplified glyph.

The glyphs should be derived from canonical-map geometry.

No icons such as warning triangles or spray bottles.

These are spatial signatures.

---

# 29. Known pattern names

Use the source terminology accurately:

**Local Excess Material**

**Lower-Bead Accumulation**

**Multiple-Line Concentration**

**Single-Point Concentration**

**Insufficient or Missing Spray** 

If space is limited, UI labels can shorten while tooltips/detail copy retains the full term.

---

# 30. Unknown anomaly is equally important

After showing the five families:

add a sixth understated outcome:

# **UNKNOWN ANOMALY**

This should not look like an error state.

It is a deliberate capability.

The architecture avoids forcing every significant deviation into the current taxonomy. 

Copy:

**Significant deviation does not have to match a predefined class.**

This is a surprisingly powerful client message.

It prevents the system from sounding brittle.

---

# 31. Hero tyre classification

For the prototype, we need one illustrative pattern for our hero tyre.

I would currently choose either:

**Local Excess Material**

or:

**Lower-Bead Accumulation**

Why?

They are visually intuitive and later allow plausible process reasoning.

My preference is:

# **Lower-Bead Accumulation**

because it gives us a strong spatial relationship to tyre geometry.

The region can appear near the lower-bead part of the canonical profile.

Later, Scene 04 can investigate whether process-state changes are associated with that pattern.

But this is just illustrative.

We should visibly label the data:

**Illustrative example**

---

# 32. Do not hard-code production thresholds

The actual decision boundaries remain dependent on validated production data and engineering quality requirements. 

So do not show:

`Deviation > 12.4 = fail`

or:

`Area > 42 mm² = defect`

unless later supplied by the client.

Prototype characterization can be rule-driven internally, but not presented as validated limits.

---

# 33. Severity

The architecture treats defect type and severity as separate concepts. 

I would introduce this gently.

Once the pattern is characterized:

**Pattern:** Lower-Bead Accumulation

Then:

**Extent**

**Magnitude**

**Affected region**

Those combine into:

**SEVERITY — ILLUSTRATIVE**

But I would avoid:

Low / Medium / High

unless there's a compelling reason.

Maybe instead simply say:

**Severity depends on validated manufacturing limits.**

That is more honest at this stage.

---

# 34. The scene should distinguish “different” from “bad”

Another subtle point.

A tyre can deviate statistically without automatically being a production reject.

We are not yet freezing quality limits.

So avoid:

**FAIL**

when the deviation map first appears.

Instead:

**ABNORMAL DEVIATION DETECTED**

or:

**OUTSIDE EXPECTED BEHAVIOUR**

Then characterization.

Actual pass/fail belongs to validated quality rules later.

---

# 35. Confidence from Scene 02 must still matter

We should not forget the confidence/validity logic we carefully introduced.

Before comparing against normal:

invalid regions should be masked.

Low-confidence areas should contribute cautiously.

We can communicate this with one small line:

**Only trusted surface regions contribute to interpretation.**

No need to re-teach the full confidence map.

But the system should visibly respect it.

For example, an invalid region can appear hatched and excluded from the deviation field.

---

# 36. Scene 03 data architecture

This scene should not use pre-rendered fingerprint images.

It should genuinely compute its illustrative outputs from synthetic canonical surfaces.

Conceptually:

```text
verified acceptable SurfaceFields
              ↓
variant filter
              ↓
validity / confidence filtering
              ↓
normal model
              ↓
expected behaviour
              +
natural variation
              ↓
hero tyre comparison
              ↓
deviation field
```

The prototype model can be simple.

The website is not the production ML implementation.

But its internal logic should be coherent.

---

# 37. Prototype statistical model

For the deterministic visual prototype, a simple location-wise model is enough.

For every canonical surface location:

```text
μ(θ,s) = mean of verified acceptable observations

σ(θ,s) = spread / variation of verified acceptable observations
```

Then for the hero tyre, a standardized illustrative deviation could conceptually derive from:

```text
Observed - μ
────────────
 local variation
```

But do not expose a specific Z-score formula in client copy unless we deliberately want to explain it.

The production architecture has not frozen the exact statistical method.

The site should convey the idea, not prematurely select the algorithm.

---

# 38. Seeded acceptable population

The synthetic population should be created from a shared generative function.

Something conceptually like:

```ts
generateAcceptableSurface({
  variant: "A",
  seed,
  naturalVariation: true,
  defect: null
})
```

Then our hero tyre:

```ts
generateSurface({
  variant: "A",
  seed: heroSeed,
  anomaly: {
    type: "lower-bead",
    ...
  }
})
```

This ensures:

all tyres belong to the same synthetic process family;

the normal model genuinely captures that family;

the anomaly genuinely differs.

Much better than painting attractive random maps.

---

# 39. Population size in visuals versus data

We may internally generate dozens or hundreds of synthetic samples for smooth statistics.

But visually show perhaps:

6–10 representative surfaces.

This is important.

Don't imply the production system requires exactly six tyres.

And don't visually overwhelm the viewer with 100 tiny maps.

A label can simply say:

**Verified acceptable production population**

No number required.

---

# 40. Transition from individual maps into statistics

The actual transformation should be elegant.

I picture:

the acceptable maps are layered in depth.

As scroll progresses:

their noisy/local differences remain visible for a moment.

Then corresponding cells begin visually converging.

The stack compresses.

A smooth expected field forms.

But instead of all variation vanishing, a second translucent field emerges representing spread.

So the visual says:

> averaging finds the centre, but we deliberately keep the variation.

This is exactly what we need.

---

# 41. Camera language

Scene 03 should have the calmest camera so far.

Scene 00 had physical tracking.

Scene 01 had inspection choreography.

Scene 02 transitioned from physical to analytical.

Scene 03 should be almost entirely:

**stable orthographic analytical space.**

The data moves.

Not the camera.

Perhaps there is a tiny, very slow depth change during population stacking.

But no orbiting.

No dramatic zooms.

This is the “understanding” portion of the experience.

---

# 42. Background

Now we are fully in the analytical visual language.

Use:

warm/off-white or pale neutral technical field;

very subtle grid or coordinate texture;

low-contrast physical-tyre silhouette occasionally in the background if needed.

Do not enter a dark sci-fi void.

The experience should still feel connected to the manufacturing system.

---

# 43. Progress choreography

A strong starting structure would be:

| Progress | Main event |
|---:|---|
| **0.00–0.07** | Current tyre remains centered from Scene 02. Ask what normal should look like. |
| **0.07–0.17** | Verified acceptable tyre surfaces begin arriving. |
| **0.17–0.26** | Viewer sees natural variation among acceptable examples. |
| **0.26–0.33** | Variant-specific selection is established. |
| **0.33–0.44** | Canonical surfaces align spatially. |
| **0.44–0.54** | Expected behaviour `μ(θ,s)` emerges. |
| **0.54–0.63** | Natural variation `σ(θ,s)` remains visible. |
| **0.63–0.68** | Normal spray fingerprint / operating envelope is established. |
| **0.68–0.72** | Brief controlled-update concept. |
| **0.72–0.79** | Hero tyre re-enters against normal fingerprint. |
| **0.79–0.87** | Spatial comparison generates deviation field. |
| **0.87–0.92** | Region/extent/magnitude/shape localize. |
| **0.92–0.97** | Known-pattern / unknown-anomaly characterization. |
| **0.97–1.00** | Current deviation remains while process-state context begins entering for Scene 04. |

This is longer because we are effectively telling the complete Idea 1 story.

---

# 44. Recommended scene length

Desktop:

**460–540vh**

Tablet:

**360–430vh**

Mobile:

**300–360vh**

Scene 03 contains multiple conceptual transformations.

Don't compress it into a 150vh animation because “the website is too long.”

The objective is understanding.

However, every ~10–15% of scroll must produce meaningful change so it never feels artificially stretched.

---

# 45. Semantic beats

I would give this scene explicit states such as:

```text
normal.awaitingReference
normal.populationArrives
normal.variationVisible
normal.variantSelected
normal.populationAligned
normal.expectationBuilt
normal.variationBuilt
normal.fingerprintReady
normal.currentTyreReturns
normal.comparing
normal.deviationVisible
normal.regionLocalized
normal.characterizing
normal.knownPattern
normal.unknownPossible
```

The exact names can differ.

The point is to make the story semantic rather than hardcoded into dozens of arbitrary `progress > 0.347` checks.

---

# 46. HUD behavior

Chapter identity:

**03 · NORMAL PROCESS**

or perhaps:

**03 · SPRAY FINGERPRINT**

I prefer:

**03 · NORMAL PROCESS**

because it is easier for the client.

The contextual capsule can use the main question:

# **IS IT NORMAL?**

Then later:

**EXPECTED BEHAVIOUR LEARNED**

Finally:

**SPATIAL DEVIATION FOUND**

Keep these changes sparse.

---

# 47. Journey rail

Broad journey:

```text
PHYSICAL          SURFACE          INTELLIGENCE          PROCESS
████████████████████████████████──●──────────────────────○
```

We now enter:

**INTELLIGENCE**

for the first time.

That should feel significant.

Potentially the broad rail's intelligence section subtly activates blue.

---

# 48. Idea 1 identity colour

This is where the first semantic colour becomes persistent.

Use restrained blue.

Not neon.

Not full-screen blue background.

Perhaps:

coordinate accents;

fingerprint label;

expected-field annotation;

chapter indicator.

When we later enter Idea 2, the semantic accent can transition toward amber.

---

# 49. Visible copy

I would restrict the scene to roughly these major text beats:

### Beat A

# **WHAT DOES ACCEPTABLE PRODUCTION LOOK LIKE?**

**Start with tyres already verified as acceptable.**

### Beat B

# **NORMAL IS NOT ONE PERFECT PATTERN.**

**Natural manufacturing variation must remain part of the model.**

### Beat C

# **DIFFERENT REGIONS. DIFFERENT EXPECTATIONS.**

**Normality is spatial.**

### Beat D

# **NOW COMPARE THIS TYRE.**

**Where—and by how much—does it differ?**

### Beat E

# **DEVIATION HAS A SHAPE.**

**Location, extent and spatial pattern help characterize what changed.**

This is enough.

---

# 50. Mobile layout

Mobile should not show ten acceptable surfaces simultaneously.

Use a stacked flow.

First:

current tyre map.

Then it shrinks upward.

Verified accepted maps arrive one at a time behind it.

Then the stack visually compresses.

Expected field becomes full-width.

Variation field follows.

Then current tyre returns.

Comparison happens vertically:

```text
OBSERVED

──────────

EXPECTED

──────────

DEVIATION
```

Then deviation expands into full screen.

This is much more readable than desktop-style side-by-side comparisons.

---

# 51. Mobile characterization

Known defect families should use a horizontally scrollable or sequential strip only if interaction is necessary.

But because this is scroll storytelling, I would rather show them sequentially through progress:

Local Excess → tiny glyph

Lower-Bead → tiny glyph

Multiple-Line → tiny glyph

Single-Point → tiny glyph

Missing Spray → tiny glyph

Unknown → ?

Then settle on the illustrative hero pattern.

No manual carousel needed.

---

# 52. Reduced-motion version

Reduced motion can use five static technical plates:

**Plate 1:** verified acceptable canonical surfaces.

**Plate 2:** expected behavior + natural variation.

**Plate 3:** normal fingerprint.

**Plate 4:** current tyre versus normal.

**Plate 5:** deviation + characterization.

Everything stays understandable without continuous aggregation or morphing.

---

# 53. Accessibility

Semantic content should communicate that:

> A normal-process model is derived from quality-verified tyres of the relevant variant. The model represents expected spatial behaviour and natural variation across the canonical inner surface. A new tyre is compared with this model to identify where and how strongly it differs. Deviations may correspond to known spatial defect patterns or remain classified as unknown abnormalities.

That information must not exist only in colour or animation.

---

# 54. Do not make the model “learn live”

This deserves another hard rule.

Avoid visuals such as:

**Learning 32%...**

**Training neural network...**

**AI training completed.**

We are not showing training infrastructure.

We are explaining an architectural concept.

The normal fingerprint can be visually constructed from the accepted population without implying this exact website animation represents the eventual production algorithm.

---

# 55. Do not show an “AI brain”

No brain icon.

No neural-network node sphere.

No generic chip icon.

No LLM-esque magic.

The intelligence is visible in the relationship between the data.

That's enough.

---

# 56. Accuracy labels

All synthetic data in this scene should have a persistent but unobtrusive label:

**Illustrative prototype data**

or:

**Illustrative surface data**

Preferably one global label rather than repeating it on every map.

If the user hovers/taps it:

> Visual values demonstrate the proposed architecture and do not represent validated production thresholds or measured client data.

This is important for the client presentation.

---

# 57. Do not claim “good” from the visual model itself

The accepted population should arrive already tagged:

**quality verified**

This avoids the circular logic:

AI learns good tyres by deciding which tyres are good.

The site should visually communicate that manufacturing/quality validation precedes model construction.

---

# 58. Traceability remains alive

The source-imagery concept from Scene 02 should not dominate Scene 03.

But if an anomaly region is selected, the UI can retain an understated:

**view source observation**

affordance.

That helps preserve the idea that the fingerprint/deviation system doesn't destroy evidence.

---

# 59. Controlled model updates

I would include this visually, but avoid making it feel like a whole extra scene.

Maybe after fingerprint construction:

a future production map approaches.

Instead of merging automatically, a small gate appears:

**QUALITY VALIDATION**

Only after a check mark does it become a **candidate model update**.

Then the sequence disappears.

Five seconds of scroll.

Huge conceptual value.

---

# 60. QA invariants

There are several things we should test programmatically.

The normal population should contain only the hero tyre's variant.

The hero tyre must **not** accidentally be included in the accepted population if it contains the illustrative anomaly.

The expected map must actually derive from the accepted synthetic samples.

The variation map must not be hard-coded independently.

Changing the accepted population should change the fingerprint.

The hero anomaly must produce the deviation at the same `(θ,s)` coordinates established previously.

Invalid hero regions should not magically produce strong deviation values.

The scene must reconstruct identically after reverse scrolling.

---

# 61. Screenshot checkpoints

I would capture roughly:

`0.00` — single current tyre

`0.12` — acceptable population arriving

`0.22` — natural variation visible

`0.32` — variant selection

`0.43` — surfaces aligned

`0.50` — expected behavior

`0.59` — natural variation

`0.66` — normal fingerprint

`0.76` — current tyre vs fingerprint

`0.83` — comparison

`0.88` — deviation field

`0.93` — localized anomaly

`0.97` — characterization

`1.00` — Scene 04 boundary

The 0.44–0.65 aggregation sequence deserves tighter captures because this is the scene's primary transformation.

---

# 62. What would make me reject Scene 03

I would reject it if:

the normal fingerprint looks like one arbitrary perfect heatmap;

all “good” tyres are visually identical;

the scene starts with an AI/neural-network graphic;

one global threshold is shown as if every surface region has the same expectation;

the hero tyre's anomaly moves location between scenes;

the variant-specific nature of the model is omitted;

“unknown anomaly” disappears;

invalid/low-confidence data is treated as a confirmed defect;

random fake confidence/health percentages appear;

the scene says `FAIL` before validated quality thresholds exist;

synthetic data is not clearly identified as illustrative;

the update animation implies uncontrolled online self-learning;

the scene turns into a dashboard of cards;

the camera keeps flying around while statistical concepts are being explained.

---

# 63. The Scene 03 → Scene 04 transition

This transition matters because Scene 04 will ask the **second** intelligence question:

# **DOES THE PROCESS EXPLAIN IT?**

Scene 03 should end with:

the hero tyre's deviation map centered.

One abnormal region is clearly localized.

Perhaps we have characterized it illustratively as:

**Lower-Bead Accumulation**

But instead of finishing with:

**Problem solved**

the scene asks:

# **WE KNOW WHAT IS DIFFERENT.**

Then:

# **BUT WHY DID IT HAPPEN?**

Now something changes around the surface.

At the edge of the screen, the first pieces of manufacturing context appear:

**pressure**

**flow**

**rotation**

**nozzle position**

Not as cards.

As process signals entering the analytical space.

The blue Idea-1 accent begins shifting toward restrained amber.

The deviation map remains in place.

This is the continuity carrier.

Scene 04 starts from the exact question Scene 03 cannot answer:

> **Idea 1 tells us that this tyre differs from normal.  
> Now we need the manufacturing process itself to help explain what we observed.**

The source architecture makes exactly that distinction: Idea 1 evaluates whether a tyre is consistent with the expected production population, while Idea 2 introduces the actual process conditions under which the tyre was produced.

---

# Final picture in my head

We begin with one canonical surface.

Other quality-verified tyres quietly arrive behind it.

At first they seem almost the same.

Then the viewer notices small differences.

Text:

# **NORMAL IS NOT ONE PERFECT PATTERN.**

They align.

The layers converge.

An expected field appears.

But the differences aren't thrown away.

A second representation shows natural variation.

Those two become the:

# **NORMAL SPRAY FINGERPRINT**

The accepted population recedes.

Our original tyre returns.

The two surfaces align perfectly.

Most of the comparison becomes neutral.

One region does not.

The deviation remains.

We zoom—not with the camera, but analytically—into what makes that region unusual:

location;

extent;

magnitude;

shape.

The spatial signature is compared with the known pattern family.

An unknown route remains available.

Then the screen becomes quiet.

Only the deviation survives.

Text:

# **WE KNOW WHAT CHANGED.**

A pause.

Then:

# **NOW ASK WHY.**

From the edges of the frame, manufacturing process signals begin entering.

And **Scene 04/05 begins.**