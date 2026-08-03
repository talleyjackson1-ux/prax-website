/* APA Digital Marketing Group — apadigitalmarketing.com
   THE ALIGNED LINE: "we only get paid when you do" drawn literally — the hero
   chart is two lines rising TOGETHER (client growth + our fee) on a ~6.5s
   grow→hold→fade loop, no fabricated axis numbers, because the incentive
   alignment IS the brand. Reconstructed as editable source 2026-08-03 to match
   the live build; the estimate form is now a native on-site intake (ApaLeadForm)
   that posts to the APA app, replacing the old Google Form iframe.
   Motion: Lenis + GSAP reveals. */
import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import ApaLeadForm from './ApaLeadForm'
import { EMAIL, MAILTO_HREF, INSTAGRAM } from './siteConfig'
import apaMark from './apa-mark.png'

gsap.registerPlugin(ScrollTrigger)

function Brand({ className = '' }: { className?: string }) {
  return (
    <a className={`ap-brand ${className}`} href="#top">
      <img src={apaMark} alt="APA triangle mark" />
      <span className="ap-brand-text">
        <b>APA</b>
        <em>DIGITAL MARKETING GROUP</em>
      </span>
    </a>
  )
}

/* The growth line + fee line as SVG paths (shared by the draw + the sheen). */
const REV_D = 'M 20 282 C 110 276, 170 252, 250 226 C 330 200, 380 168, 450 128 C 505 97, 560 66, 622 44'
const FEE_D = 'M 20 296 C 110 293, 180 282, 260 268 C 340 254, 400 238, 470 216 C 520 200, 570 184, 622 166'

/* Two lines rising together — the performance model, drawn. Unlabeled axes on
   purpose: shape only, no fabricated numbers. Loops: draw ~3.4s → a bright sheen
   sweeps the growth line during the hold → fade. */
function AlignedChart() {
  const revRef = useRef<SVGPathElement>(null)
  const feeRef = useRef<SVGPathElement>(null)
  const sheenRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rev = revRef.current!, fee = feeRef.current!, sheen = sheenRef.current!
    const revLen = rev.getTotalLength(), feeLen = fee.getTotalLength()
    const sheenLen = sheen.getTotalLength()
    gsap.set(rev, { strokeDasharray: revLen })
    gsap.set(fee, { strokeDasharray: feeLen })
    gsap.set(sheen, { strokeDasharray: `26 ${sheenLen}`, autoAlpha: 0 })
    gsap.set('.ap-chart-label, .ap-chart-dot, .ap-chart-fill', { autoAlpha: 0 })
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5, delay: 0.4 })
    tl.set([rev, fee], { autoAlpha: 1 }, 0)
    tl.fromTo(rev, { strokeDashoffset: revLen }, { strokeDashoffset: 0, duration: 3.4, ease: 'power1.inOut' }, 0)
    tl.fromTo(fee, { strokeDashoffset: feeLen }, { strokeDashoffset: 0, duration: 3.4, ease: 'power1.inOut' }, 0.35)
    tl.fromTo('.ap-chart-fill', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: 'none' }, 1.3)
    tl.fromTo('.ap-chart-label, .ap-chart-dot', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.1 }, 3.0)
    // sheen: a short bright segment travels start→end along the growth line
    tl.set(sheen, { autoAlpha: 1 }, 3.2)
    tl.fromTo(sheen, { strokeDashoffset: sheenLen }, { strokeDashoffset: -26, duration: 1.5, ease: 'power1.inOut' }, 3.2)
    tl.set(sheen, { autoAlpha: 0 }, 4.7)
    tl.to({}, { duration: 0.2 })                                   // hold at full
    tl.to([rev, fee, '.ap-chart-fill', '.ap-chart-label', '.ap-chart-dot'], { autoAlpha: 0, duration: 0.7 })
    return () => { tl.kill() }
  }, [])

  return (
    <svg className="ap-chart" viewBox="0 0 640 330" fill="none" aria-label="Two lines rising together — your growth and our fee move as one">
      <defs>
        <linearGradient id="ap-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2177b5" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2177b5" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ap-rev" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3f8fd0" />
          <stop offset="100%" stopColor="#d0ecfd" />
        </linearGradient>
      </defs>
      {[70, 140, 210, 280].map((y) => (
        <line key={y} x1="20" y1={y} x2="622" y2={y} stroke="#d0ecfd" strokeOpacity="0.07" />
      ))}
      <path className="ap-chart-fill"
        d="M 20 282 C 110 276, 170 252, 250 226 C 330 200, 380 168, 450 128 C 505 97, 560 66, 622 44 L 622 330 L 20 330 Z"
        fill="url(#ap-fill)" />
      <path ref={revRef} className="ap-chart-rev" d={REV_D}
        stroke="url(#ap-rev)" strokeWidth="3.5" strokeLinecap="round" />
      <path ref={feeRef} className="ap-chart-fee" d={FEE_D}
        stroke="#2f7fc0" strokeWidth="2.5" strokeLinecap="round" />
      <path ref={sheenRef} className="ap-chart-sheen" d={REV_D}
        stroke="#eaf6ff" strokeWidth="3.6" strokeLinecap="round" />
      <circle className="ap-chart-dot" cx="622" cy="44" r="5" fill="#d0ecfd" />
      <circle className="ap-chart-dot" cx="622" cy="166" r="4.5" fill="#2f7fc0" />
      <text className="ap-chart-label" x="612" y="26" textAnchor="end" fill="#d0ecfd">your growth</text>
      <text className="ap-chart-label ap-chart-label-fee" x="368" y="278" textAnchor="start" fill="#5fa3d9">our fee — a share of it</text>
    </svg>
  )
}

/* One before/after slot. Deliberately empty — real screenshots drop in;
   inventing numbers here would break the whole pitch. */
function ResultSlot({ title, note }: { title: string; note: string }) {
  return (
    <figure className="ap-slot">
      <div className="ap-slot-panes">
        <div className="ap-slot-pane"><span>BEFORE</span></div>
        <div className="ap-slot-pane ap-slot-after"><span>AFTER</span></div>
      </div>
      <figcaption>
        <b>{title}</b>
        <small>{note}</small>
        <em className="ap-mono">AWAITING REAL CAMPAIGN ASSETS</em>
      </figcaption>
    </figure>
  )
}

export default function Apa() {
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── scrollspy: highlight the current section in the nav (motion-independent)
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.ap-links a'))
    const linkFor = (id: string) => links.find((l) => l.getAttribute('href') === `#${id}`)
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove('on'))
          linkFor((e.target as HTMLElement).id)?.classList.add('on')
        }
      }),
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    ;['services', 'why', 'promise', 'how'].forEach((id) => {
      const s = document.getElementById(id)
      if (s) spy.observe(s)
    })

    if (reduce) {
      document.body.classList.add('ap-static')
      document.querySelectorAll('[data-ap-reveal]').forEach((el) => el.classList.add('is-in'))
      return () => spy.disconnect()
    }

    const ctx = gsap.context(() => {
      // hero intro cascade — kicker → headline words → lede → CTAs → strip → chart
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.ap-hero .ap-kicker', { y: 16, autoAlpha: 0, duration: 0.5 })
        .from('.ap-hero h1 .ap-w', { y: 26, autoAlpha: 0, duration: 0.6, stagger: 0.055 }, '-=0.2')
        .from('.ap-lede', { y: 18, autoAlpha: 0, duration: 0.5 }, '-=0.3')
        .from('.ap-cta-row .ap-btn', { y: 14, autoAlpha: 0, duration: 0.45, stagger: 0.09 }, '-=0.25')
        .from('.ap-hero-strip', { autoAlpha: 0, duration: 0.45 }, '-=0.15')
        .from('.ap-hero-visual', { autoAlpha: 0, y: 22, duration: 0.7 }, '-=0.65')

      // section reveals — drift + slight scale, and draw the heading underline
      gsap.utils.toArray<HTMLElement>('[data-ap-reveal]').forEach((el) => {
        gsap.fromTo(el.children,
          { y: 26, autoAlpha: 0, scale: 0.985 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out', transformOrigin: 'center top',
            scrollTrigger: { trigger: el, start: 'top 80%', onEnter: () => el.classList.add('is-in') } })
      })

      // gentle scroll parallax on the hero chart
      gsap.to('.ap-chart', {
        yPercent: -9, ease: 'none',
        scrollTrigger: { trigger: '.ap-hero', start: 'top top', end: 'bottom top', scrub: true },
      })
    })

    const lenis = new Lenis({ duration: 1.05 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      spy.disconnect()
      ctx.revert()
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return (
    <div className="ap">
      {/* ── nav ── */}
      <header className="ap-nav">
        <Brand />
        <nav className="ap-links">
          <a href="#services">Services</a>
          <a href="#why">Why APA</a>
          <a href="#promise">The Promise</a>
          <a href="#how">How It Works</a>
        </nav>
        <div className="ap-nav-cta">
          <a className="ap-btn ap-btn-solid" href="#book">Get a Free Estimate</a>
        </div>
      </header>

      {/* ── 1 · hero ── */}
      <section className="ap-hero" id="top">
        <div className="ap-hero-copy">
          <div className="ap-kicker">NATIONWIDE · FOUNDED IN LEE'S SUMMIT, MO</div>
          <h1>
            <span className="ap-w">We</span> <span className="ap-w">only</span>{' '}
            <span className="ap-w">get</span> <span className="ap-w">paid</span><br />
            <span className="ap-w">when</span> <span className="ap-w"><i>you</i></span>{' '}
            <span className="ap-w">do.</span>
          </h1>
          <p className="ap-lede">
            Lead generation, customer acquisition, and sales growth for small businesses —
            built on clear strategy and performance-aligned marketing. No confusing packages,
            no campaigns that don't produce.
          </p>
          <div className="ap-cta-row">
            <a className="ap-btn ap-btn-solid" href="#book">Get a Free Estimate</a>
            <a className="ap-btn" href={MAILTO_HREF}>Email Us</a>
          </div>
          <div className="ap-hero-strip ap-mono">SOCIAL · PAID ADS · LEAD GEN · WEBSITES · SALES GROWTH</div>
        </div>
        <div className="ap-hero-visual">
          <AlignedChart />
          <p className="ap-chart-note">When your revenue climbs, so does ours. Our pay comes out of the growth we create — so the only way we win is by making you win first.</p>
        </div>
      </section>

      {/* ── 2 · what we do ── */}
      <section className="ap-sec" id="services" data-ap-reveal>
        <div className="ap-kicker">01 — WHAT WE DO</div>
        <h2>Five ways we grow your business.</h2>
        <div className="ap-cards">
          <div className="ap-card">
            <h3>Social Media Management</h3>
            <p>Your brand shows up consistently where your customers already spend their time — content and community managed so your presence never goes quiet.</p>
          </div>
          <div className="ap-card">
            <h3>Paid Advertising Strategy</h3>
            <p>Ads written, designed, launched, and managed end-to-end — creative that sells and campaigns watched daily, not set and forgotten.</p>
          </div>
          <div className="ap-card">
            <h3>Lead Generation Campaigns</h3>
            <p>Campaigns built around one number that matters: new customers reaching out to you — not vanity clicks.</p>
          </div>
          <div className="ap-card">
            <h3>Customer Acquisition &amp; Sales Growth</h3>
            <p>The full path from first impression to closed sale, managed as one system — every piece pulling in the same direction.</p>
          </div>
          <div className="ap-card">
            <h3>Website &amp; Landing Page Support</h3>
            <p>Sites and landing pages built to convert the traffic your ads bring in — and kept fast, current, and working long after launch.</p>
          </div>
        </div>
      </section>

      {/* ── 3 · why APA ── */}
      <section className="ap-sec" id="why" data-ap-reveal>
        <div className="ap-kicker">02 — WHY APA</div>
        <h2>Growth should be measurable.</h2>
        <p className="ap-sub">
          APA Digital Marketing Group was started by a team passionate about helping small
          businesses grow in a market where attention is harder than ever to earn. After seeing
          how many owners struggle with inconsistent leads, a weak online presence, and agencies
          that don't feel invested in their success, we built APA around one simple idea: growth
          should be measurable.
        </p>
        <div className="ap-cards">
          <div className="ap-card">
            <h3>Measurable growth</h3>
            <p>We focus on the numbers that move a business — leads, customers, and sales — not vanity metrics that look good in a report and change nothing.</p>
          </div>
          <div className="ap-card">
            <h3>Clear, constant communication</h3>
            <p>No confusing packages or jargon. Straightforward strategy and consistent updates, so you always know what we're running and why.</p>
          </div>
          <div className="ap-card">
            <h3>No long-term pressure</h3>
            <p>We're not here to lock you into campaigns that don't produce. Not happy with the direction, communication, or performance? A clear cancellation option is built into every agreement.</p>
          </div>
        </div>
        <p className="ap-owners">Founded by <b>Alex Keeting</b> and <b>Parker Katamura</b>.</p>
      </section>

      {/* ── 4 · the performance promise ── */}
      <section className="ap-sec ap-sec-promise" id="promise" data-ap-reveal>
        <div className="ap-kicker">03 — THE PERFORMANCE PROMISE</div>
        <h2>We benefit when you benefit.</h2>
        <p className="ap-sub">
          Most agencies charge the same retainer whether your campaigns work or not. We work
          performance-aligned — our pay comes out of the growth we create, so the only way we
          win is by making you win first.
        </p>
        <div className="ap-compare">
          <div className="ap-comp ap-comp-them">
            <div className="ap-comp-head ap-mono">A TRADITIONAL AGENCY</div>
            <ul>
              <li>Flat monthly retainer — paid the same whether it works or not</li>
              <li>Locked into long contracts before you've seen results</li>
              <li>Office hours, ticket queues, days to hear back</li>
            </ul>
          </div>
          <div className="ap-comp ap-comp-us">
            <div className="ap-comp-head ap-mono">THE APA MODEL</div>
            <ul>
              <li>Our fee is tied to your results — we grow when you grow</li>
              <li>No long-term pressure; cancel per your agreement if it isn't working</li>
              <li>24/7 support for active clients — a real person, not a queue</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5 · results gallery ── */}
      <section className="ap-sec" id="results" data-ap-reveal>
        <div className="ap-kicker">04 — RESULTS</div>
        <h2>Before &amp; after, in real numbers.</h2>
        <p className="ap-sub">
          We're just getting started — and every figure that lands on this page will be real,
          pulled straight from live campaign and site screenshots. Nothing invented, ever.
        </p>
        <div className="ap-slots">
          <ResultSlot title="Ad campaign performance" note="Cost and click-through, before vs. after takeover" />
          <ResultSlot title="Website rebuild" note="The old site vs. the site built to convert" />
          <ResultSlot title="Lead flow" note="Calls and form fills, before vs. after" />
        </div>
        <div className="ap-featured">
          <div className="ap-mono">FEATURED CASE — SALES-GENERATION CAMPAIGN</div>
          <p>Our proudest work: a campaign built purely to generate sales — the full story, with the client's real screenshots, goes here as soon as it's live.</p>
        </div>
      </section>

      {/* ── 6 · how it works ── */}
      <section className="ap-sec ap-sec-how" id="how" data-ap-reveal>
        <div className="ap-kicker">05 — HOW IT WORKS</div>
        <h2>Three steps, no surprises.</h2>
        <div className="ap-steps">
          <div className="ap-step">
            <span className="ap-step-num">01</span>
            <h3>Free Estimate</h3>
            <p>Tell us about your business and your goals. You get a straight answer on what we'd run, what we'd build, and what it costs — before anything starts.</p>
          </div>
          <div className="ap-step">
            <span className="ap-step-num">02</span>
            <h3>Launch</h3>
            <p>We build the creative, set up the campaigns, and take everything live — ads, site, and tracking working as one system from day one.</p>
          </div>
          <div className="ap-step">
            <span className="ap-step-num">03</span>
            <h3>Grow</h3>
            <p>We manage, optimize, and report — and our pay scales with your results. Growth is the plan for both of us.</p>
          </div>
        </div>
        <div className="ap-how-cta">
          <a className="ap-btn ap-btn-solid" href="#book">Start with a Free Estimate</a>
        </div>
      </section>

      {/* ── 7 · get started (native form + contact) ── */}
      <section className="ap-sec ap-sec-book" id="book" data-ap-reveal>
        <div className="ap-kicker">06 — GET STARTED</div>
        <h2>Tell us about your business.</h2>
        <p className="ap-sub">
          Fill out a quick intake and we'll come back with a straight answer on what we'd run,
          what we'd build, and what it would cost — before anything starts.
        </p>
        <div className="ap-book">
          <ApaLeadForm />
          <div className="ap-contact">
            <div className="ap-mono">CONTACT</div>
            <a className="ap-contact-email" href={MAILTO_HREF}>{EMAIL}</a>
            <ul className="ap-contact-list">
              <li><span>Hours</span><b>Mon–Fri, 7am–8pm CT</b></li>
              <li><span>Support</span><b>24/7 for active clients</b></li>
              <li><span>Based in</span><b>Lee's Summit, Missouri</b></li>
              <li><span>Serving</span><b>Businesses nationwide</b></li>
            </ul>
            <a className="ap-btn" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="ap-foot">
        <div className="ap-foot-main">
          <Brand className="ap-brand-foot" />
          <a className="ap-foot-email" href={MAILTO_HREF}>{EMAIL}</a>
          <p>Performance-aligned digital marketing — founded in Lee's Summit, Missouri, serving businesses nationwide.</p>
          <div className="ap-chips">
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram</a>
            <span>Social Media</span>
            <span>Paid Ads</span>
            <span>Lead Gen</span>
            <span>Websites</span>
            <span>Sales Growth</span>
          </div>
        </div>
        <div className="ap-foot-meta">
          <span>© 2026 APA Digital Marketing Group</span>
          <span>apadigitalmarketing.com</span>
        </div>
      </footer>
    </div>
  )
}
