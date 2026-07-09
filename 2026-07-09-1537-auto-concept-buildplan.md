# THE REFINISH — Summit Auto Services concept, production build plan
2026-07-09 · status: **v1 BUILT same day** (Jackson greenlit stock build; dad's new form round feeds
a content/photo pass later). Live at /mock/summit-auto-services/. Before/after = ONE Pexels photo
(damage composited in Blender numpy — same piece, same angle, guaranteed); gun = CC-BY Sketchfab
scan re-rendered w/ alpha; mist + tape = procedural. Upgrade paths still valid below (esp. dad's
real before/after pair + a higher-grade gun render).

The concept in one line: **the site repairs and repaints itself as you scroll — because that's the
work.** Photoreal, near-4K, zero cartoon.

---

## ACT MAP (scroll choreography)

### ACT 0 — the damage (pinned opening)
- Full-bleed near-4K photo of a **damaged body panel** (minor/medium: dented quarter, scuffed bumper).
- ONE sentence, nothing else: **"minor to medium body damage? contact me."**
- Down arrow + `SCROLL` cue (existing tc-hint pattern).
- No nav, no logo yet — the damage owns the screen.

### ACT 1 — the spray wipe (pinned, scrub ≈ 2800px)
The signature. A photoreal **paint spray gun enters from the RIGHT, exits LEFT**, spraying a
full-height mist band. Everywhere it has passed (to its right) shows the **fixed, painted, glossy**
panel. Stop scrolling mid-way → **left = damaged, right = flawless**. The gun paints the site into
existence.

Layer stack (bottom → top):
1. `damaged.jpg` — full-bleed base
2. `fixed.jpg` — identical framing, clipped `inset(0 0 0 X%)` where **X = gun progress** (reveal
   grows from the right edge, left-moving seam)
3. **Mist band** — 4–6 alpha spray-mist sprites clustered at the seam, opacity/scale/drift loops,
   slight lag behind the gun (paint hangs in the air)
4. **The gun** — pre-rendered **Blender image sequence with alpha** (~66 frames, the dumbbell
   pipeline's quantized-rotation trick reused): slight forward cant, trigger squeezed, hose trailing
   off-right; scrubbed on `<canvas>` via GSAP's official imageSequenceScrub helper, `snap: 'index'`,
   DPR-corrected canvas
5. Faint paint-fog vignette during the pass

Timing on one timeline (progress 0→1): gun x `110vw → -30vw` · clip X `100% → 0%` (seam glued to
nozzle) · mist follows seam · **at gun ≈ 50%, the hero page slides in from the RIGHT** (x `100vw → 0`,
riding the freshly painted half) — logo, phone, Book Online, over the glossy finish.

### ACT 2 — the masking-tape peel (section transition)
Hero page peels off the screen **from the bottom, like masking tape coming off a fresh paint job**:
- Pinned scrub: the hero content layer lifts at its bottom edge — SVG mask rolls up + a pre-rendered
  **tape-curl edge strip** (PNG, slight shadow + adhesive sheen) rides the peel line
- Revealed BEHIND it: the professional finished car (dad's wet-sand/polish glamour shot)
- Section 2 arrives with a **sanded-primer texture** background (the in-between state of real work —
  damage → sand → paint → polish is the site's whole material story)
- Graceful fallback (mobile / reduced-motion): straight upward mask slide, no curl

### ACTS 3+ — the shop (normal flow, light "clean & trusted" theme from the shipped mock)
Services (collision featured) · family/26-years trust · reviews · **online booking** · service area ·
closing + phone. Section backgrounds alternate: sanded texture ↔ glossy finish photography.
Material-stage motif carries the whole page: **damaged → sanded → painted → polished.**

---

## ASSETS (sourced)

| Asset | Source | Notes |
|---|---|---|
| Damaged panel (4K) | [Pexels — damaged car](https://www.pexels.com/search/damaged%20car/) · [dent repair](https://www.pexels.com/search/dent%20repair/) | **PREFERRED: dad shoots a real before photo** (see questions) |
| Fixed glossy panel (4K) | same-angle after shot — **dad's wet-sand/polish work IS the asset** | stock fallback: same-color panel macro; the before/after only sings if framing matches |
| Spray gun 3D | [Sketchfab spray gun (Rozumnyi)](https://sketchfab.com/3d-models/spray-gun-bbeebeb544e44045aa721f652ba2033a) · [paint gun (Pro Ivanov)](https://sketchfab.com/3d-models/paint-gun-b5061e3e7a3447e9bb8a1082a548ed82) · [paint gun (jdawgbuildz)](https://sketchfab.com/3d-models/paint-gun-8437a2edf83e49359547cd1cf78bb034) | check per-model license (free ≈ CC-BY → credit in CREDITS.md); re-material in Blender (satin metal body, correct cup); render 66-frame alpha WebP seq @1600px |
| Spray mist | [Vecteezy spray-mist PNGs](https://www.vecteezy.com/free-png/spray-mist) · [alpha videos](https://www.vecteezy.com/free-videos/spray-mist) · [ResourceBoy 200 spray textures 4K](https://resourceboy.com/textures/spray-paint-textures/) | build 4–6 puff sprites; tint toward the paint color |
| Sanded primer texture | ResourceBoy + Pexels "sanded primer car" | doubles as section background |
| Masking tape edge | Pexels "masking tape" macro → cut a curl strip | one good strip is enough |

**Ask dad (feeds the pre-flight questions list):**
1. Can he shoot a real **before/after pair from the same tripod position** on the next job? (This
   single pair upgrades the whole site from stock-real to REAL-real.)
2. What gun does he actually run (SATA/DeVilbiss/Iwata)? Rendering *his* gun = the detail pros notice.
3. A finished-car glamour shot he's proud of (post wet-sand + wax).
4. Paint color for the reveal — his signature work, his pick.

## TECH
- GSAP ScrollTrigger (pin + scrub) + [official imageSequenceScrub helper](https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub/) on `<canvas>`, `snap:'index'`, DPR-matched canvas (retina-sharp)
- Lenis smooth scroll (engine parity with shipped concepts)
- The wipe = `clip-path: inset()` on the fixed layer — same progress value drives gun x, clip %, mist; one timeline, nothing can desync
- Images: AVIF/WebP `srcset`, 2560px top tier; ACT-0 photo preloaded (LCP); gun sequence lazy after first paint (~4–6MB budget, 66 × ~70KB WebP)
- `prefers-reduced-motion`: static 50/50 before|after split + content, zero scrub
- Mobile: gun sequence at 900px tier, shorter scrub (~1600px), tape peel → mask slide

## BUILD PHASES (when dad's new form round lands)
P0 assets (dad questions out first — his photos gate the hero) → P1 static sections on the light
theme → P2 spray wipe with photos + clip-path only → P3 gun sequence + mist on top → P4 tape peel →
P5 mobile/reduced-motion/perf → P6 Playwright scroll-stop QA + pixel review.

## v2 round (2026-07-09 eve — Jackson's feedback, all landed)
- REAL pair replaces composited damage: crumpled→fixed fender (Shutterstock 1948581235 crop =
  **PLACEHOLDER — buy the ~$15 license or shoot dad's own pair before this goes to anyone**)
- BLACK mist: full-height column ~1/3 screen wide riding the seam — transition line never visible
  (this also means pairs don't need pixel alignment)
- Gun v4: gravity cup on top, dark polished chrome matched to scene light, air hose off-frame right
- Tape peel v2: diagonal corner peel from BOTTOM-RIGHT, ragged jittered edge, tape-back fold strip
- Hero card enlarged/bolded

## PARKED PRODUCT IDEA — dynamic booking calendar (dad, 2026-07-09)
Booksy-style but OWN software: dad publishes availability windows; clients pick a slot that works
against his real schedule (no back-and-forth); optional no-show fee + small reschedule fee (needs
card-on-file → Stripe). Build trigger per the crew-app rule: pilot on dad's site first as the
booking widget v2, generalize if clients ask. Pairs with the growth stack (missed-call textback).
