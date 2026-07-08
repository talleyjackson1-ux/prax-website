/* Shared trade-concept engine — same choreography grammar as the gym concept:
   1. Opening: NO top bar. Logo + links + call button live inside the hero
      block (right). LEFT side is a stack of real photos over a giant outlined
      trade word, each layer parallax-drifting.
   2. Scroll: the photo layers slide off LEFT at staggered speeds (the only
      sideways motion) while the hero block glides to center.
   3. Continuing: logo/links/call dock into the fixed top bar. Reversible.
   4. Vertical flow: sections whose photos MOVE IN AND OUT of the screen as
      you scroll (scrubbed x-transit), emergency band, trust, reviews, quote
      form — content grounded in the trade-site research + LeadForge audits. */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import type { TradeConfig } from './tradeConfig'

gsap.registerPlugin(ScrollTrigger)

export default function TradeConcept({ cfg }: { cfg: TradeConfig }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)
  const heroLogoRef = useRef<HTMLDivElement>(null)
  const heroLinksRef = useRef<HTMLElement>(null)
  const heroCallRef = useRef<HTMLAnchorElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const barLogoRef = useRef<HTMLDivElement>(null)
  const barLinksRef = useRef<HTMLElement>(null)
  const barCallRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.05 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    let tl: gsap.core.Timeline | undefined
    let killed = false

    document.fonts.ready.then(() => {
      if (killed) return
      const stage = stageRef.current!
      const block = blockRef.current!
      const stageW = stage.clientWidth
      const blockR = block.getBoundingClientRect()
      const dxBlock = stageW / 2 - (blockR.left + blockR.width / 2)

      const pairs = ([
        [heroLogoRef.current!, barLogoRef.current!],
        [heroLinksRef.current!, barLinksRef.current!],
        [heroCallRef.current!, barCallRef.current!],
      ] as [HTMLElement, HTMLElement][]).map(([h, b]) => {
        const hr = h.getBoundingClientRect()
        const br = b.getBoundingClientRect()
        return { h, b, dx: br.left - hr.left - dxBlock, dy: br.top - hr.top }
      })

      const t = gsap.timeline({
        scrollTrigger: {
          trigger: stage, start: 'top top', end: '+=2600', scrub: 0.4, pin: true,
        },
      })
      tl = t

      // phase 1 — photo layers exit LEFT at staggered speeds; word drifts after
      t.to('.tc-img-main', { xPercent: -145, duration: 0.5, ease: 'none' }, 0.05)
      t.to('.tc-img-detail', { xPercent: -230, duration: 0.5, ease: 'none' }, 0.05)
      t.to('.tc-word', { xPercent: -60, autoAlpha: 0, duration: 0.5, ease: 'none' }, 0.08)
      t.to('.tc-hint', { autoAlpha: 0, duration: 0.04 }, 0.03)

      // phase 2 — hero block glides to center
      t.to(block, { x: dxBlock, duration: 0.18, ease: 'power1.inOut' }, 0.42)

      // phase 3 — logo/links/call drift up into the fixed top bar (slow leg)
      t.add('dock', 0.64)
      pairs.forEach((p, i) => {
        t.to(p.h, { x: p.dx, y: p.dy, duration: 0.3, ease: 'power2.inOut' }, `dock+=${i * 0.015}`)
      })
      t.to(barRef.current!, {
        backgroundColor: 'rgba(8,10,13,0.9)',
        borderBottomColor: 'var(--t-line)',
        duration: 0.12,
      }, 'dock+=0.15')
      for (const p of pairs) {
        t.to(p.h, { autoAlpha: 0, duration: 0.025 }, 'dock+=0.3')
        t.to(p.b, { autoAlpha: 1, duration: 0.025 }, 'dock+=0.3')
      }
      t.to({}, { duration: 0.04 })

      // vertical flow — photos transit the viewport as you scroll (in and out)
      document.querySelectorAll<HTMLElement>('[data-drift]').forEach((el) => {
        const dir = el.dataset.drift === 'right' ? 1 : -1
        gsap.fromTo(el, { x: `${dir * -26}vw` }, {
          x: `${dir * 10}vw`, ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
        })
      })
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
    }
  }, [])

  const links = ['Services', 'Reviews', 'Areas'].map((l) => (
    <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>
  ))
  const tel = `tel:${cfg.phone.replace(/[^\d]/g, '')}`

  return (
    <div className="tc" style={cfg.theme as React.CSSProperties}>
      {/* fixed top bar — invisible until the hero pieces dock into it */}
      <div className="tc-bar" ref={barRef}>
        <div className="tc-logo tc-bar-piece" ref={barLogoRef}>{cfg.brand.first}<span>{cfg.brand.second}</span></div>
        <nav className="tc-links tc-bar-piece" ref={barLinksRef}>{links}</nav>
        <a className="tc-btn tc-btn-solid tc-bar-piece" href={tel} ref={barCallRef}>{cfg.phone}</a>
      </div>

      {/* pinned stage */}
      <div className="tc-stage" ref={stageRef}>
        <div className="tc-word" aria-hidden="true">{cfg.heroWord}</div>
        <div className="tc-img tc-img-main"><img src={cfg.images.hero} alt={cfg.imageAlts.hero} /></div>
        <div className="tc-img tc-img-detail"><img src={cfg.images.detail} alt={cfg.imageAlts.detail} /></div>

        <div className="tc-heroWrap">
          <div className="tc-block" ref={blockRef}>
            <div className="tc-logo" ref={heroLogoRef}>{cfg.brand.first}<span>{cfg.brand.second}</span></div>
            <div className="tc-license">{cfg.license}</div>
            <div className="tc-navrow">
              <nav className="tc-links" ref={heroLinksRef}>{links}</nav>
              <a className="tc-btn tc-btn-solid" href={tel} ref={heroCallRef}>{cfg.phone}</a>
            </div>
            <div className="tc-kicker">{cfg.kicker}</div>
            <p className="tc-lede">{cfg.lede}</p>
            <div className="tc-cta-row">
              <a className="tc-btn tc-btn-solid" href="#quote">{cfg.ctas.primary}</a>
              <a className="tc-btn" href="#quote">{cfg.ctas.secondary}</a>
            </div>
            <div className="tc-stats">
              {cfg.stats.map((s) => <div key={s.label}><b>{s.big}</b><span>{s.label}</span></div>)}
            </div>
          </div>
        </div>
        <div className="tc-hint">SCROLL<span>▼</span></div>
      </div>

      {/* marquee seam */}
      <div className="tc-marquee" aria-hidden="true">
        <div className="tc-marquee-track">
          {[0, 1].map((k) => <span key={k}>{cfg.marquee}{cfg.marquee}</span>)}
        </div>
      </div>

      {/* services */}
      <section className="tc-sec" id="services" data-num="01" data-reveal-sec>
        <div className="tc-kicker">01 — SERVICES</div>
        <h2>WHAT WE FIX</h2>
        <div className="tc-cards">
          {cfg.services.map((s) => (
            <div className="tc-card" key={s.title}><h3>{s.title}</h3><p>{s.desc}</p></div>
          ))}
        </div>
      </section>

      {/* emergency band */}
      <a className="tc-emergency" href={tel}>
        <span>{cfg.emergency}</span><b>{cfg.phone}</b>
      </a>

      {/* trust + transit photo */}
      <section className="tc-sec tc-sec-split" data-num="02">
        <div className="tc-drift" data-drift="left">
          <img src={cfg.images.secA} alt={cfg.imageAlts.secA} />
        </div>
        <div className="tc-split-copy" data-reveal-sec>
          <div className="tc-kicker">02 — WHY US</div>
          <h2>{cfg.trust.heading}</h2>
          <ul className="tc-points">
            {cfg.trust.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <div className="tc-financing">{cfg.financing}</div>
        </div>
      </section>

      {/* reviews */}
      <section className="tc-sec" id="reviews" data-num="03" data-reveal-sec>
        <div className="tc-kicker">03 — REVIEWS</div>
        <h2>{cfg.reviewBanner.toUpperCase()}</h2>
        <div className="tc-cards tc-cards-3">
          {cfg.reviews.map((r) => (
            <div className="tc-card tc-review" key={r.name}>
              <div className="tc-starline">★★★★★</div>
              <p>“{r.text}”</p>
              <div className="tc-reviewer"><b>{r.name}</b><span>{r.job}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* areas + transit photo */}
      <section className="tc-sec tc-sec-split tc-sec-split-rev" id="areas" data-num="04">
        <div className="tc-drift" data-drift="right">
          <img src={cfg.images.secB} alt={cfg.imageAlts.secB} />
        </div>
        <div className="tc-split-copy" data-reveal-sec>
          <div className="tc-kicker">04 — SERVICE AREA</div>
          <h2>ALL OVER THE METRO</h2>
          <div className="tc-chips">
            {cfg.areas.map((a) => <span key={a}>{a}</span>)}
          </div>
        </div>
      </section>

      {/* quote form — the lead capture the LeadForge audits kept flagging */}
      <section className="tc-sec" id="quote" data-reveal-sec>
        <div className="tc-kicker">05 — FREE QUOTE</div>
        <h2>{cfg.quoteHeading}</h2>
        <form className="tc-quote" onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Name" required />
          <input placeholder="Phone" type="tel" required />
          <select defaultValue="">
            <option value="" disabled>What do you need?</option>
            {cfg.quoteServices.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input placeholder="ZIP code" />
          <button className="tc-btn tc-btn-solid" type="submit">Request My Quote</button>
        </form>
        <p className="tc-quote-note">Or skip the form: <a href={tel}>{cfg.phone}</a> — a human answers.</p>
      </section>

      {/* closing CTA + footer */}
      <section className="tc-after">
        <h2>{cfg.closing.heading}</h2>
        <p>{cfg.closing.sub}</p>
        <a className="tc-btn tc-btn-solid tc-btn-big" href={tel}>{cfg.closing.cta}</a>
        <footer>
          <span>{cfg.brand.first} {cfg.brand.second} — website concept</span>
          <span>designed &amp; built by Jackson Talley · prax.design</span>
        </footer>
      </section>
    </div>
  )
}
