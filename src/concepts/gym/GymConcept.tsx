/* IRONWORKS — tourable gym website concept for the freelance portfolio.
   The choreography (Jackson's spec):
   1. Opening: NO top bar. Logo + nav links + Join live inside the hero block
      (right side). Dumbbell rests on a shadowed floor, left side, engraved
      plate face-on. Each scroll tick advances 3-5 rotation frames.
   2. At 90° the dumbbell + its floor slide off LEFT (the only sideways motion)
      while the hero block glides to the center of the page.
   3. Continuing down, the logo/links/Join fly UP and become the fixed top bar.
   4. From there the rest of the site is normal vertical scroll. Scrolling back
      up reverses everything — bar melts back into the hero, dumbbell returns. */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createDumbbellScene } from './dumbbellScene'

gsap.registerPlugin(ScrollTrigger)

const FRAMES = 66 // fine frames; short scroll span → one wheel tick ≈ 3-5 frames

const LINKS = ['Programs', 'Locations', 'Memberships']

export default function GymConcept() {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)
  const heroLogoRef = useRef<HTMLDivElement>(null)
  const heroLinksRef = useRef<HTMLElement>(null)
  const heroJoinRef = useRef<HTMLAnchorElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const barLogoRef = useRef<HTMLDivElement>(null)
  const barLinksRef = useRef<HTMLElement>(null)
  const barJoinRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const rig = createDumbbellScene(canvasRef.current!)

    const lenis = new Lenis({ duration: 1.05 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    let tl: gsap.core.Timeline | undefined
    let killed = false

    // build after fonts load so the hero→bar measurements are final
    document.fonts.ready.then(() => {
      if (killed) return
      const stage = stageRef.current!
      const block = blockRef.current!
      const stageW = stage.clientWidth
      const blockR = block.getBoundingClientRect()
      const dxBlock = stageW / 2 - (blockR.left + blockR.width / 2)

      // hero piece → bar piece deltas (block will already be centered by then)
      const pairs = ([
        [heroLogoRef.current!, barLogoRef.current!],
        [heroLinksRef.current!, barLinksRef.current!],
        [heroJoinRef.current!, barJoinRef.current!],
      ] as [HTMLElement, HTMLElement][]).map(([h, b]) => {
        const hr = h.getBoundingClientRect()
        const br = b.getBoundingClientRect()
        return { h, b, dx: br.left - hr.left - dxBlock, dy: br.top - hr.top }
      })

      const state = { rot: 0, exit: 0 }
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=3000', // whole sequence ≈ 1-2 real scrolls
          scrub: 0.4,
          pin: true,
        },
      })

      // phase 1 — scroll-frame rotation (quantized, several frames per tick)
      tl.to(state, {
        rot: 1, duration: 0.45, ease: 'none',
        onUpdate: () => rig.setRotation((Math.round(state.rot * FRAMES) / FRAMES) * (Math.PI / 2)),
      })
      tl.to('.gc-hint', { autoAlpha: 0, duration: 0.04 }, 0.03)

      // phase 2 — dumbbell + floor exit left; hero block glides to center
      tl.add('exit', 0.47)
      tl.to(state, {
        exit: 1, duration: 0.17, ease: 'none',
        onUpdate: () => {
          rig.setShift(-11 * state.exit)
          rig.setFloorFade(1 - Math.max(0, (state.exit - 0.55) / 0.45))
        },
      }, 'exit')
      tl.to(block, { x: dxBlock, duration: 0.17, ease: 'power1.inOut' }, 'exit')

      // phase 3 — logo/links/join drift up into the fixed top bar
      // (long window on purpose: this leg reads too fast when short)
      tl.add('dock', 0.66)
      const dockTl = tl
      pairs.forEach((p, i) => {
        dockTl.to(p.h, { x: p.dx, y: p.dy, duration: 0.28, ease: 'power2.inOut' }, `dock+=${i * 0.015}`)
      })
      tl.to(barRef.current!, {
        backgroundColor: 'rgba(11,11,12,0.88)',
        borderBottomColor: 'rgba(155,160,166,0.16)',
        duration: 0.12,
      }, 'dock+=0.14')
      for (const p of pairs) {
        tl.to(p.h, { autoAlpha: 0, duration: 0.025 }, 'dock+=0.28')
        tl.to(p.b, { autoAlpha: 1, duration: 0.025 }, 'dock+=0.28')
      }
      tl.to({}, { duration: 0.04 }) // settle beat before unpin

      // vertical sections reveal
      document.querySelectorAll<HTMLElement>('[data-reveal-sec]').forEach((el) => {
        gsap.fromTo(el.children, { y: 28, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 78%' },
        })
      })
    })

    return () => {
      killed = true
      tl?.scrollTrigger?.kill()
      tl?.kill()
      ScrollTrigger.getAll().forEach((st) => st.kill())
      gsap.ticker.remove(tick)
      lenis.destroy()
      rig.dispose()
    }
  }, [])

  const navLinks = LINKS.map((l) => <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>)

  return (
    <>
      {/* fixed top bar — invisible until the hero pieces dock into it */}
      <div className="gc-bar" ref={barRef}>
        <div className="gc-logo gc-bar-piece" ref={barLogoRef}>IRON<span>WORKS</span></div>
        <nav className="gc-links gc-bar-piece" ref={barLinksRef}>{navLinks}</nav>
        <a className="gc-btn gc-btn-solid gc-join gc-bar-piece" href="#join" ref={barJoinRef}>Join Now</a>
      </div>

      {/* pinned stage: dumbbell + floor left, hero block right */}
      <div className="gc-stage" ref={stageRef}>
        <canvas className="gc-canvas" ref={canvasRef} />
        <div className="gc-heroWrap">
          <div className="gc-block" ref={blockRef}>
            <div className="gc-logo" ref={heroLogoRef}>IRON<span>WORKS</span></div>
            <div className="gc-navrow">
              <nav className="gc-links" ref={heroLinksRef}>{navLinks}</nav>
              <a className="gc-btn gc-btn-solid gc-join" href="#join" ref={heroJoinRef}>Join Now</a>
            </div>
            <div className="gc-kicker">KANSAS CITY · EST. 2019</div>
            <p className="gc-lede">Serious equipment, 24/7 doors, coaches who lift. No lunk alarms, no lock-in contracts.</p>
            <div className="gc-cta-row">
              <a className="gc-btn gc-btn-solid" href="#join">Start Training — $29/mo</a>
              <a className="gc-btn" href="#locations">Find Your Location</a>
            </div>
            <div className="gc-stats">
              <div><b>12</b><span>locations</span></div>
              <div><b>24/7</b><span>access</span></div>
              <div><b>4.9★</b><span>1,200+ reviews</span></div>
            </div>
          </div>
        </div>
        <div className="gc-hint">SCROLL<span>▼</span></div>
      </div>

      {/* marquee ticker — the seam between the 3D stage and the page */}
      <div className="gc-marquee" aria-hidden="true">
        <div className="gc-marquee-track">
          {[0, 1].map((k) => (
            <span key={k}>STRENGTH · CONDITIONING · COACHING · COMMUNITY · 24/7 ACCESS · NO CONTRACTS ·&nbsp;</span>
          ))}
        </div>
      </div>

      {/* normal vertical flow from here down */}
      <section className="gc-sec" id="programs" data-num="01" data-reveal-sec>
        <div className="gc-kicker">01 — PROGRAMS</div>
        <h2>PICK YOUR FIGHT</h2>
        <div className="gc-cards">
          <div className="gc-card"><h3>Strength</h3><p>Powerlifting platforms, comp racks, chalk allowed everywhere.</p></div>
          <div className="gc-card"><h3>Hypertrophy</h3><p>Full machine floor + dumbbells to 150lb. Built for volume.</p></div>
          <div className="gc-card"><h3>Conditioning</h3><p>Sled track, assault bikes, turf zone. In and out in 30.</p></div>
          <div className="gc-card"><h3>Coaching</h3><p>1-on-1 programming from coaches with real totals.</p></div>
        </div>
      </section>

      <section className="gc-sec" id="locations" data-num="02" data-reveal-sec>
        <div className="gc-kicker">02 — LOCATIONS</div>
        <h2>FIND YOUR FLOOR</h2>
        <div className="gc-locate">
          <input placeholder="Enter your ZIP code" />
          <button className="gc-btn gc-btn-solid">Search</button>
        </div>
        <div className="gc-cards gc-cards-3">
          <div className="gc-card"><h3>Downtown KC</h3><p>1400 Main St · open 24/7</p></div>
          <div className="gc-card"><h3>Overland Park</h3><p>9200 Metcalf Ave · open 24/7</p></div>
          <div className="gc-card"><h3>Lee's Summit</h3><p>310 SE Douglas St · open 24/7</p></div>
        </div>
      </section>

      <section className="gc-sec" id="memberships" data-num="03" data-reveal-sec>
        <div className="gc-kicker">03 — MEMBERSHIPS</div>
        <h2>NO CONTRACTS. EVER.</h2>
        <div className="gc-cards gc-cards-3">
          <div className="gc-card gc-tier"><h3>Iron</h3><div className="gc-price">$29<span>/mo</span></div><p>One location, 24/7 access.</p></div>
          <div className="gc-card gc-tier gc-tier-hot"><h3>Steel</h3><div className="gc-price">$49<span>/mo</span></div><p>All locations + guest passes.</p></div>
          <div className="gc-card gc-tier"><h3>Forged</h3><div className="gc-price">$89<span>/mo</span></div><p>Everything + monthly coaching.</p></div>
        </div>
      </section>

      <section className="gc-after" id="join">
        <h2>FIRST WEEK FREE.</h2>
        <p>Walk in, lift, decide. No card required.</p>
        <a className="gc-btn gc-btn-solid gc-btn-big" href="#join">Claim Your Week</a>
        <footer>
          <span>IRONWORKS — website concept</span>
          <span>designed &amp; built by Jackson Talley · prax.design</span>
        </footer>
      </section>
    </>
  )
}
