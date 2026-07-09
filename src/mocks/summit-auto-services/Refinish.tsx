/* THE REFINISH — Summit Auto Services (Lee's Summit, MO).
   Its own scroll mechanic, drawn from the work:
   ACT 0  damaged panel + one sentence ("minor to medium body damage? contact me.")
   ACT 1  a real HVLP spray gun crosses R→L; everywhere it's passed shows the SAME
          panel fixed and glossy (clip-path seam glued to the nozzle). Stop halfway:
          left damaged, right flawless. The first page rides in on the fresh paint.
   ACT 2  the page peels off the bottom like masking tape → the finished car.
   Then the shop: services, family trust, reviews, online booking.
   Photos: Pexels (same photo = same piece, same angle — damage composited).
   Gun: Sketchfab CC-BY scan, re-materialed + rendered in Blender w/ alpha. */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const PHONE = '(913) 689-8749'
const TEL = 'tel:9136898749'

function upcomingDays(count = 10): string[] {
  const out: string[] = []
  const d = new Date()
  while (out.length < count) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() === 0) continue
    out.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
  }
  return out
}

export default function Refinish() {
  const [days] = useState(() => upcomingDays())
  const [picked, setPicked] = useState<string[]>([])
  const pickDay = (d: string) => setPicked((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d].slice(-2)))

  const stageRef = useRef<HTMLDivElement>(null)
  const afterRef = useRef<HTMLDivElement>(null)
  const gunRef = useRef<HTMLImageElement>(null)
  const hoseRef = useRef<HTMLImageElement>(null)
  const mistRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const peelRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const tapeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('rf-static')
      return
    }
    const lenis = new Lenis({ duration: 1.05 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const gun = gunRef.current!, after = afterRef.current!, mist = mistRef.current!, hose = hoseRef.current!

    // ACT 0+1 — the spray pass. ONE seam value (in % of viewport width) drives the
    // clip edge, the mist band center, the gun and the hose — all computed in PX
    // from the live viewport, so nothing can drift apart at any screen size.
    // Gun render metrics (measured from the PNG): nozzle at 23.5% of its width;
    // air inlet (hose connect) at ~57% width / ~90% height.
    const seam = { v: 112 }                                  // % of viewport width
    const act1 = gsap.timeline({
      scrollTrigger: { trigger: stageRef.current, start: 'top top', end: '+=3400', scrub: 0.35, pin: true },
    })
    act1.to('.rf-sentence', { autoAlpha: 0, filter: 'blur(8px)', duration: 0.1 }, 0.02)
    act1.to(seam, {
      v: -45, duration: 0.85, ease: 'none',
      onUpdate: () => {
        const W = window.innerWidth, H = window.innerHeight
        const sPx = (seam.v / 100) * W
        after.style.clipPath = `inset(0 0 0 ${Math.max(0, Math.min(100, seam.v))}%)`
        const gunH = Math.min(0.68 * H, 700), gunW = gunH     // original-size look, square render
        const gunX = sPx - 0.235 * gunW                       // nozzle glued to the seam
        const gunY = 0.16 * H + Math.sin(seam.v / 16) * 0.012 * H
        gun.style.transform = `translate3d(${gunX}px, ${gunY}px, 0)`
        gun.style.height = `${gunH}px`
        const hx = gunX + 0.58 * gunW
        hose.style.left = `${hx}px`
        hose.style.top = `${gunY + 0.9 * gunH}px`
        hose.style.width = `${Math.max(0, W - hx + 80)}px`
        mist.style.transform = `translate3d(${sPx - 0.17 * W}px, 0, 0)`   // band centered on the seam
      },
    }, 0.05)
    act1.to([mist], { autoAlpha: 1, duration: 0.04 }, 0.08)
    act1.to([mist], { autoAlpha: 0, duration: 0.1 }, 0.6)    // cloud settles once the seam is done
    act1.to([gun, hose], { autoAlpha: 0, duration: 0.08 }, 0.72)  // painter steps away
    act1.fromTo(heroRef.current, { x: '100vw' }, { x: 0, ease: 'power2.out', duration: 0.26 }, 0.74)
    // NO mist breathing — it holds its darkest, densest state (Jackson 2026-07-09)

    // ACT 2 — the tape peel: page lifts from the BOTTOM-RIGHT CORNER like a strip
    // of masking tape, diagonal edge slightly uneven, fold strip riding the line.
    const peel = { p: 0 }
    const JIT = [1.6, -2.2, 1.9, -1.2]                       // fixed unevenness along the edge
    const fold = tapeRef.current!
    gsap.timeline({
      scrollTrigger: { trigger: peelRef.current, start: 'top top', end: '+=1700', scrub: 0.35, pin: true },
    }).to(peel, {
      p: 1, ease: 'none',
      onUpdate: () => {
        const p = peel.p
        const d = 10 + 165 * p                               // how far the corner has peeled
        const A = { x: 112, y: 100 - d }                     // on/beyond the right edge
        const B = { x: 100 - d, y: 112 }                     // on/beyond the bottom edge
        const mids = JIT.map((j, i) => {
          const t = (i + 1) / (JIT.length + 1)
          const wob = j * Math.min(1, p * 2.5)
          return `${(A.x + (B.x - A.x) * t + wob).toFixed(2)}% ${(A.y + (B.y - A.y) * t + wob).toFixed(2)}%`
        }).join(', ')
        coverRef.current!.style.clipPath =
          `polygon(-10% -10%, 110% -10%, ${A.x}% ${A.y}%, ${mids}, ${B.x}% ${B.y}%, -10% 110%)`
        // the fold — tape's back riding the diagonal, shrinking shadow gap behind it
        const m = 106 - d / 2
        fold.style.left = `${m}vw`
        fold.style.top = `${m}vh`
        fold.style.width = `${Math.min(170, (d + 4) * 1.42)}vw`
        fold.style.opacity = p < 0.02 || p > 0.96 ? '0' : '1'
      },
    })

    // section reveals
    document.querySelectorAll<HTMLElement>('[data-rf-reveal]').forEach((el) => {
      gsap.fromTo(el.children, { y: 26, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 78%' },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill())
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return (
    <div className="rf">
      {/* ── ACT 0+1: damage → spray pass ── */}
      <div className="rf-stage" ref={stageRef}>
        {/* REAL pair — same panel, same angle. Placeholder until dad's own pair
            lands; whole image shown (contain) over a blurred fill so nothing is
            zoom-cropped away. Swapping photos = drop-in, the mechanic is the site. */}
        <div className="rf-layer">
          <img className="rf-photo-blur" src="/img/auto/pair-before.jpg" alt="" aria-hidden="true" />
          <img className="rf-photo-fit" src="/img/auto/pair-before.jpg" alt="Crumpled front fender — before" />
        </div>
        <div className="rf-layer rf-after" ref={afterRef}>
          <img className="rf-photo-blur" src="/img/auto/pair-after.jpg" alt="" aria-hidden="true" />
          <img className="rf-photo-fit" src="/img/auto/pair-after.jpg" alt="The same fender repaired — after" />
        </div>

        {/* BLACK paint cloud — full height, ~1/3 of the screen, holds its densest
            state (no pulsing) and rides the seam so the line is never visible */}
        <div className="rf-mistband" ref={mistRef}>
          <img className="rf-mist-col" src="/img/auto/mist-column.png" alt="" aria-hidden="true" />
          <img className="rf-mist-puff rf-mp1" src="/img/auto/mist-1.png" alt="" aria-hidden="true" />
          <img className="rf-mist-puff rf-mp2" src="/img/auto/mist-2.png" alt="" aria-hidden="true" />
        </div>
        <img className="rf-hose" ref={hoseRef} src="/img/auto/hose.png" alt="" aria-hidden="true" />
        <img className="rf-gun" ref={gunRef} src="/img/auto/gun.png" alt="Chrome HVLP paint spray gun" />

        <div className="rf-sentence">
          <h1>minor to medium body damage? contact me.</h1>
          <div className="rf-scrollcue">SCROLL<span>▼</span></div>
        </div>

        {/* the first page — arrives on the fresh paint */}
        <div className="rf-hero" ref={heroRef}>
          <div className="rf-hero-card">
            <div className="rf-logo">SUMMIT <span>AUTO</span></div>
            <div className="rf-tag">Summit Auto Services LLC · Family-Owned · Lee's Summit, MO</div>
            <p className="rf-lede">Fender bender or full repair — a family shop that picks up the phone, gives you a straight answer, and gets you back on the road fast.</p>
            <div className="rf-cta-row">
              <a className="rf-btn rf-btn-solid" href="#book">Book Online</a>
              <a className="rf-btn" href={TEL}>{PHONE}</a>
            </div>
            <div className="rf-stats">
              <div><b>26</b><span>years in business</span></div>
              <div><b>FAMILY</b><span>owned &amp; operated</span></div>
              <div><b>FAST</b><span>response — call or text</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACT 2: the masking-tape peel ── */}
      <div className="rf-peel" ref={peelRef}>
        <div className="rf-layer">
          <img className="rf-photo" src="/img/auto/glamour.jpg" alt="Finished black car, mirror gloss" />
        </div>
        <div className="rf-peel-reveal">
          <div className="rf-reveal-copy">
            <h2>WET-SANDED. POLISHED. WAXED.</h2>
            <p>The finish is the proof — 26 years of paint work you can see your face in.</p>
          </div>
        </div>
        <div className="rf-cover" ref={coverRef}>
          <div className="rf-cover-inner">
            <div>
              <span className="rf-mono">TAPE OFF · REVEAL</span>
              <h2>WE MAKE THE DAMAGE DISAPPEAR.</h2>
            </div>
          </div>
        </div>
        {/* the fold — the tape's back riding the diagonal peel edge */}
        <div className="rf-fold" ref={tapeRef} aria-hidden="true" />
      </div>

      {/* ── the shop ── */}
      <div className="rf-wrap-primer">
        <section className="rf-sec rf-sec-primer" id="services" data-rf-reveal>
          <div className="rf-kicker">01 — WHAT WE FIX</div>
          <h2>MINOR TO MEDIUM, DONE RIGHT.</h2>
          <div className="rf-cards">
            <div className="rf-card"><h3>Collision Repair</h3><p>The work we’re known for: medium-size collision jobs — panels, paint match, and the details a rushed shop misses.</p></div>
            <div className="rf-card"><h3>Body &amp; Dent Work</h3><p>Dings, dents, scrapes, and trim. Small jobs welcome — fixed properly instead of “good enough.”</p></div>
            <div className="rf-card"><h3>Paint &amp; Finish</h3><p>Wet-sand, polish, and wax by hand. The gloss in the photos above is the standard, not the exception.</p></div>
            <div className="rf-card"><h3>Straight Estimates</h3><p>Send photos or swing by. Clear written estimate and a real timeline before any work starts.</p></div>
          </div>
        </section>
      </div>

      <section className="rf-sec" data-rf-reveal>
        <div className="rf-kicker">02 — WHY US</div>
        <div className="rf-split">
          <img src="/img/auto/bodywork.jpg" alt="Body work in progress in the repair bay" />
          <div>
            <h2>A FAMILY SHOP, NOT A CHAIN.</h2>
            <ul className="rf-points">
              <li>26 years of collision and auto repair in Lee's Summit</li>
              <li>Family-owned and operated — you talk to the people doing the work</li>
              <li>Fast response: calls and texts answered, not sent to a queue</li>
              <li>Clear written estimates before a wrench is lifted</li>
            </ul>
            <div className="rf-insure">Working with insurance? We walk you through the estimate line by line so nothing gets missed.</div>
          </div>
        </div>
      </section>

      <section className="rf-sec" id="reviews" data-rf-reveal>
        <div className="rf-kicker">03 — REVIEWS</div>
        <h2>YOUR GOOGLE REVIEWS, FRONT AND CENTER</h2>
        <div className="rf-reviews">
          <div className="rf-review"><div className="rf-stars">★★★★★</div><p>“They had my quarter panel and bumper looking factory-new, and were straight with me about the timeline the whole way.”</p><b>Sample review</b><span>collision repair</span></div>
          <div className="rf-review"><div className="rf-stars">★★★★★</div><p>“Called three shops. This was the only one where a person actually picked up. Had my estimate the same day.”</p><b>Sample review</b><span>estimate</span></div>
          <div className="rf-review"><div className="rf-stars">★★★★★</div><p>“A family business that treats your car like their own. Been coming back for years.”</p><b>Sample review</b><span>repeat customer</span></div>
        </div>
      </section>

      <section className="rf-sec" id="book" data-rf-reveal>
        <div className="rf-kicker">04 — ONLINE BOOKING</div>
        <h2>BOOK YOUR VISIT ONLINE</h2>
        <form className="rf-quote" onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Name" required />
          <input placeholder="Phone" type="tel" required />
          <select defaultValue="">
            <option value="" disabled>What do you need?</option>
            <option>Collision estimate</option>
            <option>Body / dent work</option>
            <option>Mechanical repair</option>
            <option>Something else — we’ll talk</option>
          </select>
          <input placeholder="ZIP code" />
          <div className="rf-days">
            <div className="rf-days-label">Preferred day <small>(optional — pick up to two, we confirm on the call)</small></div>
            <div className="rf-days-row">
              {days.map((d) => (
                <button type="button" key={d} className={picked.includes(d) ? 'on' : ''} onClick={() => pickDay(d)}>{d}</button>
              ))}
            </div>
          </div>
          <button className="rf-btn rf-btn-solid" type="submit">
            Request My Visit{picked.length ? ` — ${picked.join(' or ')}` : ''}
          </button>
        </form>
        <p className="rf-note">Or skip the form: <a href={TEL}>{PHONE}</a> — a human answers.</p>
      </section>

      <section className="rf-sec" data-rf-reveal>
        <div className="rf-kicker">05 — SERVICE AREA</div>
        <h2>ALL OVER THE METRO EAST</h2>
        <div className="rf-chips">
          {["Lee's Summit", 'Greenwood', 'Raintree', 'Lakewood', 'Blue Springs', 'Raytown', 'Independence', 'Grandview', 'Lake Lotawana'].map((a) => <span key={a}>{a}</span>)}
        </div>
      </section>

      <section className="rf-close">
        <h2>BACK ON THE ROAD, STRESS-FREE.</h2>
        <p>Family-owned. 26 years in Lee's Summit. Straight answers, fast.</p>
        <a className="rf-btn rf-btn-solid" href={TEL} style={{ fontSize: '1.06rem', padding: '16px 34px' }}>Call {PHONE}</a>
        <footer className="rf-foot">
          <span>Summit Auto Services LLC — website preview</span>
          <span>prepared by prax.design</span>
        </footer>
      </section>
    </div>
  )
}
