/* THE ALIGNED LINE — APA Digital Marketing Group site preview.
   Section order per the intake plan: hero (value prop + phone + estimate CTA) →
   what we do (4 services, no prices) → the performance promise (commission
   model vs traditional agency, 24/7) → results gallery (labeled slots for REAL
   before/afters — nothing invented) → how it works (estimate → launch → grow) →
   book a consultation (real calendar embeds here) → contact/footer.
   Motion: Lenis + GSAP reveals; hero chart loops grow→hold→fade (~6.5s). */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const PHONE = '816-844-5548'
const TEL = 'tel:8168445548'

function Brand({ className = '' }: { className?: string }) {
  return (
    <a className={`ap-brand ${className}`} href="#top">
      <img src="/img/apa/apa-mark.png" alt="APA triangle mark" />
      <span className="ap-brand-text">
        <b>APA</b>
        <em>DIGITAL MARKETING GROUP</em>
      </span>
    </a>
  )
}

/* Two lines rising together — the commission model, drawn. Unlabeled axes on
   purpose: shape only, no fabricated numbers. Loops: draw ~3.4s → hold → fade. */
function AlignedChart() {
  const revRef = useRef<SVGPathElement>(null)
  const feeRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rev = revRef.current!, fee = feeRef.current!
    const revLen = rev.getTotalLength(), feeLen = fee.getTotalLength()
    gsap.set(rev, { strokeDasharray: revLen })
    gsap.set(fee, { strokeDasharray: feeLen })
    gsap.set('.ap-chart-label, .ap-chart-dot, .ap-chart-fill', { autoAlpha: 0 })
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5, delay: 0.4 })
    tl.set([rev, fee], { autoAlpha: 1 }, 0)
    tl.fromTo(rev, { strokeDashoffset: revLen }, { strokeDashoffset: 0, duration: 3.4, ease: 'power1.inOut' }, 0)
    tl.fromTo(fee, { strokeDashoffset: feeLen }, { strokeDashoffset: 0, duration: 3.4, ease: 'power1.inOut' }, 0.35)
    tl.fromTo('.ap-chart-fill', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: 'none' }, 1.3)
    tl.fromTo('.ap-chart-label, .ap-chart-dot', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, stagger: 0.1 }, 3.0)
    tl.to({}, { duration: 1.7 })                                   // hold at full
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
      <path ref={revRef} className="ap-chart-rev"
        d="M 20 282 C 110 276, 170 252, 250 226 C 330 200, 380 168, 450 128 C 505 97, 560 66, 622 44"
        stroke="url(#ap-rev)" strokeWidth="3.5" strokeLinecap="round" />
      <path ref={feeRef} className="ap-chart-fee"
        d="M 20 296 C 110 293, 180 282, 260 268 C 340 254, 400 238, 470 216 C 520 200, 570 184, 622 166"
        stroke="#2f7fc0" strokeWidth="2.5" strokeLinecap="round" />
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
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('ap-static')
      return
    }
    const lenis = new Lenis({ duration: 1.05 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    document.querySelectorAll<HTMLElement>('[data-ap-reveal]').forEach((el) => {
      gsap.fromTo(el.children, { y: 24, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill())
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
          <a href="#promise">The Promise</a>
          <a href="#results">Results</a>
          <a href="#how">How It Works</a>
        </nav>
        <div className="ap-nav-cta">
          <a className="ap-phone" href={TEL}>{PHONE}</a>
          <a className="ap-btn ap-btn-solid" href="#book">Get a Free Estimate</a>
        </div>
      </header>

      {/* ── 1 · hero ── */}
      <section className="ap-hero" id="top">
        <div className="ap-hero-copy">
          <div className="ap-kicker">LEE'S SUMMIT · KANSAS CITY METRO</div>
          <h1>We only get paid<br />when <i>you</i> do.</h1>
          <p className="ap-lede">
            Performance-driven ad management and websites for growing local businesses.
            No bloated retainers — our fee is tied to the results we generate for you.
          </p>
          <div className="ap-cta-row">
            <a className="ap-btn ap-btn-solid" href="#book">Get a Free Estimate</a>
            <a className="ap-btn" href={TEL}>Call {PHONE}</a>
          </div>
          <div className="ap-hero-strip ap-mono">ADS · WEBSITES · LEAD GENERATION · SALES GROWTH</div>
        </div>
        <div className="ap-hero-visual">
          <AlignedChart />
          <p className="ap-chart-note">When your revenue climbs, so does ours. When it doesn't, we don't get paid. That's the whole model.</p>
        </div>
      </section>

      {/* ── 2 · what we do ── */}
      <section className="ap-sec" id="services" data-ap-reveal>
        <div className="ap-kicker">01 — WHAT WE DO</div>
        <h2>Four ways we grow your business.</h2>
        <div className="ap-cards">
          <div className="ap-card">
            <h3>Ad Creative &amp; Management</h3>
            <p>Ads written, designed, launched, and managed end-to-end — creative that sells and campaigns that are watched daily, not set and forgotten.</p>
          </div>
          <div className="ap-card">
            <h3>Website Creation &amp; Management</h3>
            <p>A site built to convert the traffic your ads bring in — and kept fast, current, and working long after launch.</p>
          </div>
          <div className="ap-card">
            <h3>Lead Generation &amp; Customer Acquisition</h3>
            <p>Campaigns built around one number that matters: new customers walking in your door — not vanity clicks.</p>
          </div>
          <div className="ap-card">
            <h3>Sales Growth</h3>
            <p>The full path from first impression to closed sale, managed as one system — ads, site, and follow-through pulling in the same direction.</p>
          </div>
        </div>
      </section>

      {/* ── 3 · the performance promise ── */}
      <section className="ap-sec ap-sec-promise" id="promise" data-ap-reveal>
        <div className="ap-kicker">02 — THE PERFORMANCE PROMISE</div>
        <h2>We benefit when you benefit.</h2>
        <p className="ap-sub">
          Most agencies charge the same retainer whether your campaigns work or not.
          We work on commission — our pay comes out of the growth we create, so the
          only way we win is by making you win first.
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
            <div className="ap-comp-head ap-mono">THE PERFORMANCE MODEL</div>
            <ul>
              <li>Our fee is tied to your results — we only get paid when you do</li>
              <li>We earn the work every month; the results are the contract</li>
              <li>Available 24/7 — call or text, a person answers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4 · results gallery ── */}
      <section className="ap-sec" id="results" data-ap-reveal>
        <div className="ap-kicker">03 — RESULTS</div>
        <h2>Before &amp; after, in your numbers.</h2>
        <p className="ap-sub">
          Every figure on this page will be real — pulled straight from live campaign
          and site screenshots. Nothing invented, ever.
        </p>
        <div className="ap-slots">
          <ResultSlot title="Ad campaign performance" note="Cost and click-through, before vs. after takeover" />
          <ResultSlot title="Website rebuild" note="The old site vs. the site built to convert" />
          <ResultSlot title="Lead flow" note="Calls and form fills, before vs. after" />
        </div>
        <div className="ap-featured">
          <div className="ap-mono">FEATURED CASE — SALES-GENERATION CAMPAIGN</div>
          <p>The proudest job: an ad campaign built purely to generate sales — the full story, with the client's real screenshots, goes here.</p>
        </div>
      </section>

      {/* ── 5 · how it works ── */}
      <section className="ap-sec ap-sec-how" id="how" data-ap-reveal>
        <div className="ap-kicker">04 — HOW IT WORKS</div>
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

      {/* ── 6 · book a consultation ── */}
      <section className="ap-sec ap-sec-book" id="book" data-ap-reveal>
        <div className="ap-kicker">05 — BOOK A CONSULTATION</div>
        <h2>Put a time on the calendar.</h2>
        <div className="ap-book">
          {/* the client's real booking calendar (Calendly/etc.) embeds in this pane */}
          <div className="ap-book-embed">
            <span className="ap-mono">YOUR BOOKING CALENDAR EMBEDS HERE</span>
            <p>Live scheduling drops straight into this pane — clients pick a slot without the phone tag.</p>
          </div>
          <form className="ap-book-form" onSubmit={(e) => e.preventDefault()}>
            <input placeholder="Name" required />
            <input placeholder="Phone" type="tel" required />
            <input placeholder="Business name" />
            <select defaultValue="">
              <option value="" disabled>What do you need?</option>
              <option>Ad management</option>
              <option>A website</option>
              <option>Both — the full system</option>
              <option>Not sure yet — let's talk</option>
            </select>
            <button className="ap-btn ap-btn-solid" type="submit">Request My Free Estimate</button>
            <p className="ap-book-note">Or skip the form — call or text <a href={TEL}>{PHONE}</a>, 24/7.</p>
          </form>
        </div>
      </section>

      {/* ── 7 · contact / footer ── */}
      <footer className="ap-foot">
        <div className="ap-foot-main">
          <Brand className="ap-brand-foot" />
          <a className="ap-foot-phone" href={TEL}>{PHONE}</a>
          <p>Serving Lee's Summit and the Kansas City metro.</p>
          <div className="ap-chips">
            {["Lee's Summit", 'Blue Springs', 'Independence', 'Raytown', 'Grandview', 'Kansas City'].map((a) => <span key={a}>{a}</span>)}
          </div>
        </div>
        <div className="ap-foot-meta">
          <span>website preview — email &amp; service area confirmed by client</span>
          <span>prepared by prax.design</span>
        </div>
      </footer>
    </div>
  )
}
