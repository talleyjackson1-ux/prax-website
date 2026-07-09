/* prax.design — Jackson Talley's freelance site.
   Deliberately minimal: the form, the examples, the pricing. Nothing else.
   (PRAX/REX live on their own site — this one is purely for clients.) */
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import WaterField from './fx/WaterField'

gsap.registerPlugin(ScrollTrigger)

function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="lg" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#bcd2ff" />
          <stop offset="45%" stopColor="#3b73f7" />
          <stop offset="100%" stopColor="#0a1230" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="15" fill="url(#lg)" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="#3b73f7" strokeOpacity="0.55" strokeWidth="2.5" strokeDasharray="5 8" />
    </svg>
  )
}

const WORK = [
  {
    id: 'gym', name: 'IRONWORKS', trade: 'Gym / fitness', href: '/concepts/gym/', shot: '/shots/gym.jpg',
    line: 'A 3D dumbbell you scroll through — engraved headline, real shadows, then the whole page slides out of its way.',
    tags: ['Three.js hero', 'scroll choreography', 'Blender-built model'],
  },
  {
    id: 'hvac', name: 'SUMMIT AIR', trade: 'HVAC', href: '/concepts/hvac/', shot: '/shots/hvac.jpg',
    line: 'Built for a stressed homeowner with a dead AC: click-to-call everywhere, same-day promise, financing up front.',
    tags: ['emergency-first', '0% financing block', 'quote form + day picker'],
  },
  {
    id: 'roofing', name: 'TRUE NORTH ROOFING', trade: 'Roofing', href: '/concepts/roofing/', shot: '/shots/roofing.jpg',
    line: 'Free-inspection funnel with storm-claim support — trust badges, photo-documented jobs, insurance language.',
    tags: ['free inspection CTA', 'insurance claims', 'real photography'],
  },
  {
    id: 'plumbing', name: 'RIVER CITY PLUMBING', trade: 'Plumbing', href: '/concepts/plumbing/', shot: '/shots/plumbing.jpg',
    line: 'Urgency done right: 24/7 above the fold, license number under the logo, a human answers at 2am.',
    tags: ['24/7 emergency', 'license-forward trust', '60-min arrival'],
  },
]

const TIERS = [
  {
    name: 'LAUNCH', price: '$250',
    line: 'One-page site, live in 7 days.',
    items: ['Mobile-first, loads in under 2s', 'Click-to-call + 4-field quote form', 'Reviews & trust badges', 'On-page SEO basics (meta, schema)'],
  },
  {
    name: 'GROWTH SITE', price: '$800', hot: true,
    line: 'The local-SEO machine.',
    items: ['5–7 pages — one per service', 'Google Business Profile optimization', 'Financing / emergency blocks', 'Full schema + speed pass, 2 revisions'],
  },
  {
    name: 'CARE', price: '$99/mo',
    line: 'It keeps working after launch.',
    items: ['Hosting, edits, updates', 'Monthly report with real numbers', 'Cancel anytime — no contracts'],
  },
]

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]')
      if (!a) return
      const el = document.querySelector(a.getAttribute('href')!)
      if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: -70 }) }
    }
    document.addEventListener('click', onClick)

    gsap.fromTo('.hero-inner > *',
      { y: 34, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.15 })

    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      gsap.fromTo(el, { y: 30, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      })
    })
    document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach(group => {
      gsap.fromTo(group.children, { y: 26, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 82%' },
      })
    })

    return () => {
      document.removeEventListener('click', onClick)
      ScrollTrigger.getAll().forEach(s => s.kill())
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <div className="site-field" aria-hidden="true"><WaterField /></div>

      <nav className="nav glass">
        <a className="nav-logo" href="#top"><LogoMark /><b>prax.design</b></a>
        <div className="nav-links">
          <a href="#work">The Work</a>
          <a href="#pricing">Pricing</a>
        </div>
        <a className="btn btn-primary" href="/start/">Get your free mock</a>
      </nav>

      {/* ── HERO — the form is the front door ── */}
      <header className="hero" id="top">
        <div className="hero-film" />
        <div className="hero-fade" />
        <div className="hero-inner wrap">
          <div className="mono">JACKSON TALLEY // websites that get local businesses more customers</div>
          <h1>Your customers are<br /><span className="accent">already searching.</span></h1>
          <p className="hero-sub">
            I build fast, conversion-first websites for trades and local businesses — HVAC, plumbing,
            roofing, gyms — at indie prices. Tell me about your business in <b>3 minutes</b> and I'll
            send you a <b>free mock of your homepage</b> in 48 hours.
          </p>
          <a className="cta-panel glass" href="/start/">
            <div>
              <div className="mono">THE 3-MINUTE FORM</div>
              <b>Get your free homepage mock →</b>
              <span>Only the first step is required. No calls, no pressure — you see the work, then decide.</span>
            </div>
            <div className="cta-badge">$0</div>
          </a>
          <div className="hero-ctas">
            <a className="btn btn-ghost" href="#work">Or tour the work first ↓</a>
          </div>
        </div>
        <div className="hero-scroll">scroll</div>
      </header>

      <main>
        {/* ── 01 THE WORK — each concept gets its own row ── */}
        <section className="section" id="work">
          <div className="wrap">
            <div className="sec-head lane-left" data-reveal>
              <div className="mono">01 // the work</div>
              <h2>Tourable, not screenshots.</h2>
              <p>
                Every site below is <b>live — click in and scroll it</b>. Each one is built for how that
                trade's customers actually buy: phone in hand, in a hurry, looking for a reason to trust you.
              </p>
            </div>
            <div className="work-list">
              {WORK.map((w, i) => (
                <a className={`work-row glass ${i % 2 ? 'flip' : ''}`} href={w.href} key={w.id} data-reveal>
                  <div className="work-shot"><img src={w.shot} alt={`${w.name} website concept`} loading="lazy" /></div>
                  <div className="work-copy">
                    <div className="mono">{w.trade}</div>
                    <h3>{w.name}</h3>
                    <p>{w.line}</p>
                    <div className="work-tags">{w.tags.map(t => <span key={t}>{t}</span>)}</div>
                    <span className="work-cta">Tour it →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── 02 PRICING ── */}
        <section className="section" id="pricing">
          <div className="wrap">
            <div className="sec-head lane-right" data-reveal>
              <div className="mono">02 // pricing</div>
              <h2>Agency look. Indie prices.<br />No hourly billing, ever.</h2>
              <p>
                Fixed prices, quoted before work starts. The free mock comes first either way —
                you never pay to find out what you'd be getting.
              </p>
            </div>
            <div className="tier-row" data-reveal-group>
              {TIERS.map(t => (
                <div className={`tier glass ${t.hot ? 'tier-hot' : ''}`} key={t.name}>
                  <div className="mono">{t.name}</div>
                  <div className="tier-price">{t.price}</div>
                  <p className="tier-line">{t.line}</p>
                  <ul>{t.items.map(i => <li key={i}>{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLOSING CTA ── */}
        <section className="section" id="join">
          <div className="wrap closing" data-reveal>
            <div className="mono">READY WHEN YOU ARE</div>
            <h2>Three minutes. Free mock.<br />Your call after that.</h2>
            <a className="btn btn-primary btn-big" href="/start/">Start the form →</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap foot-inner">
          <span className="mono">JACKSON TALLEY · JCT DEVELOPMENTS LLC · KANSAS CITY · PRAX.DESIGN</span>
        </div>
      </footer>
    </>
  )
}
