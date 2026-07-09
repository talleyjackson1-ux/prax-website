# TRADE CONCEPT STYLES — every trade gets its own mechanic
2026-07-09 · The law (Jackson): **no more shared gym mechanics.** Each example site is its own style,
and the signature scroll mechanic comes FROM the work itself. One mechanic per trade, photoreal, one
sentence on the opening screen, scroll cue, then the mechanic tells the story.

Shared engine bones stay (GSAP ScrollTrigger pinned acts + Lenis + the conversion furniture: phone
CTA, booking/quote form, reviews, trust, areas) — but the SKIN and the ACT choreography are
per-trade originals. AUTO is spec'd in full in `2026-07-09-1537-auto-concept-buildplan.md`.

---

## HVAC — "THE AIRFLOW"
**Metaphor: the site cools down as the AC kicks on. You are the air.**
- ACT 0: heat. A shimmering summer street / sweating glass, hot amber grade, heat-haze distortion
  (subtle displacement loop). One sentence: *"92° inside? we answer today."* + scroll cue.
- ACT 1: the system kicks on. A visible **cool-air current** (soft volumetric gradient stream, blue)
  sweeps in from a vent at frame right; the current **carries the content in** — headline, cards,
  stats drift IN along the streamline (staggered bezier paths, eased like objects in moving air),
  dust motes riding the flow.
- Persistent mechanic: a **thermostat dial** scrubs 92° → 72° with scroll; the whole color grade
  slides amber → arctic as you descend. At 72°, frost crystallizes along section edges (SVG frost
  growth on reveal).
- Sections arrive "blown in" (x-drift + settle). Emergency band = the only hot-amber element left.
- Palette journey: #ff9a3c heat → #bfe3ff cool. Display font: something engineered/ducted
  (e.g. 'Industry'-flavored: Archivo Expanded).
- Assets: heat-haze loop (shader or alpha video), vent macro photo, dust-mote particles, frost SVGs.
- Difficulty: MEDIUM. All CSS/SVG/canvas — no pre-rendered sequences required.

## ROOFING — "THE OVERLAY"
**Metaphor: the page shingles itself, course by course, the way a real crew lays a roof.**
- ACT 0: bare deck. Underlayment/OSB texture full-bleed, chalk-line cross faint. One sentence:
  *"your roof has a deadline: the next storm."* + scroll cue.
- ACT 1: the build. As you scroll, **architectural shingle courses lay themselves across the
  viewport bottom-to-top**, staggered left-to-right like a roofer works — each shingle a photoreal
  sprite with drop shadow, landing with a tiny settle (translate+rotate ease). The hero content sits
  ON the finished courses.
- Signature beat: a **chalk line SNAPS** (SVG line + chalk-puff particle) to underline each section
  heading as it enters.
- Storm act (mid-page): sky darkens one beat, hail streaks (fast diagonal strokes), ONE shingle pops
  loose — and is replaced in the next scroll beat. The repair promise, made visceral, five seconds.
- Palette: cedar + slate + copper accent on a deep overcast blue. Display: Archivo Black stays solid
  here (it earned it in the shipped concept) but the MECHANIC is entirely new.
- Assets: 1 great shingle macro (build the sprite set from it), OSB/underlayment texture, chalk dust.
- Difficulty: MEDIUM-LOW. Sprite grid + ScrollTrigger batch; very reusable component.

## PLUMBING — "THE FLOW" (Jackson's flush concept)
**Metaphor: you get flushed into the plumbing and travel the system.**
- ACT 0: inside the porcelain. Looking up from inside a pristine white bowl — macro porcelain
  curvature, waterline ring refracting light, kept CLASSY (bright, clinical, almost Apple-bathroom).
  A chrome **flush handle top-left**. One sentence: *"water where it shouldn't be?"* + scroll cue.
- THE FLUSH: hitting the handle (or first scroll) flushes you — viewport content vortexes (rotation
  + radial blur + scale-down), water-rush alpha overlay, half-second of dark — then a **pipe transit**:
  rings/joints whoosh past (repeated ring sprites scaling toward camera) and you LAND in the main
  site. It's the site's front door; nobody forgets it.
- Navigation mechanic: moving between sections = short 400ms pipe transits (direction-aware). A
  **pressure gauge** needle = scroll progress indicator.
- Section materials: copper pipe, PVC white, brushed brass fittings; water caustic light loops in
  section backgrounds. Emergency band = a burst-pipe strip with real urgency.
- Palette: porcelain white + copper + deep water blue. Display: heavy rounded-industrial (Oswald
  retired for this one — try 'Bricolage'/'Anton' alternates in mock).
- Assets: porcelain macro, chrome handle (photo or quick Blender), water-rush alpha video (Vecteezy),
  pipe-interior frames (Blender tube + 20-frame loop), caustics loop.
- Difficulty: HIGH (the flush transit is the work). Build LAST of the three; the payoff is the most
  shareable site of the set.

---

## Production principles (all trades)
1. **One sentence openings.** The mechanic is the pitch; copy stays out of its way.
2. **Photoreal or don't.** Pro stock near-4K (Pexels/Unsplash), client's real photos when possible,
   Blender renders for anything that must sit in the foreground (the auto spray gun rule).
3. **Pre-render what physics can't fake** — image sequences with alpha, scrubbed on canvas
   (GSAP imageSequenceScrub, snap:'index', DPR-corrected). CSS/SVG for everything else.
4. **One timeline per act** — gun/clip/mist (or stream/dial/frost) share one progress value so
   nothing desyncs.
5. **Reduced-motion + mobile fallbacks are part of the concept**, not an afterthought: each mechanic
   defines its static poster state (auto: 50/50 before|after split).
6. Every concept still lands the conversion furniture the LeadForge audits flagged: phone-first,
   reviews above the fold, short quote/booking form, license/trust near CTAs.

## Order of build
1. **AUTO** (dad — after his new form round + integration pass; full plan in its own doc)
2. ROOFING (cheapest new mechanic, replaces the shared-engine concept as portfolio piece)
3. HVAC (the color-journey is strong demo material for `prax.design`)
4. PLUMBING (the flagship stunt — build when there's breathing room to do it right)
