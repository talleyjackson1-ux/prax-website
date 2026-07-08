import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import WaterField from './fx/WaterField'
import RexOrb from './fx/RexOrb'

gsap.registerPlugin(ScrollTrigger)

const RING_C = 2 * Math.PI * 90 // score ring circumference

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

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // smooth-scroll anchor links through Lenis
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]')
      if (!a) return
      const el = document.querySelector(a.getAttribute('href')!)
      if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: -70 }) }
    }
    document.addEventListener('click', onClick)

    // hero entrance
    gsap.fromTo('.hero-inner > *',
      { y: 34, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.15 })

    // scroll reveals
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

    // context-score ring: scrubbed by scroll through the workflow section
    const ring = document.querySelector<SVGCircleElement>('.score-arc')
    const num = document.querySelector('.score-num b')
    if (ring && num) {
      const state = { v: 18 }
      const apply = () => {
        ring.style.strokeDashoffset = String(RING_C * (1 - state.v / 100))
        num.textContent = String(Math.round(state.v))
      }
      apply()
      gsap.to(state, {
        v: 94, ease: 'none', onUpdate: apply,
        scrollTrigger: { trigger: '#workflow', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
      })
    }

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
      <RexOrb />

      <nav className="nav glass">
        <a className="nav-logo" href="#top"><LogoMark /><b>PRAX</b></a>
        <div className="nav-links">
          <a href="#why">The Gap</a>
          <a href="#workflow">Workflow</a>
          <a href="#foundation">Foundation</a>
          <a href="#community">Community</a>
          <a href="#business">Business</a>
        </div>
        <a className="btn btn-primary" href="#join">Follow the build</a>
      </nav>

      {/* ── HERO ── */}
      <header className="hero" id="top" data-rex="right">
        <div className="hero-film" />
        <div className="hero-fade" />
        <div className="hero-inner wrap">
          <div className="mono">PRAX // creative output system</div>
          <h1>From scattered<br /><span className="accent">to shipped.</span></h1>
          <p className="hero-sub" data-rex-el>
            PRAX is a creative output platform that walks you through <b>context engineering</b> on
            a workflow built for how <b>ADHD brains</b> actually work — guided by REX, the orb on
            your right. Scroll. He'll show you around.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="#join">Follow the build <span className="soon">Patreon soon</span></a>
            <a className="btn btn-ghost" href="#join">Instagram <span className="soon">soon</span></a>
          </div>
        </div>
        <div className="hero-scroll">scroll</div>
      </header>

      <main>
        {/* ── 01 THE GAP ── */}
        <section className="section" id="why" data-rex="right">
          <div className="wrap">
            <div className="sec-head lane-right" data-reveal>
              <div className="mono">01 // the gap</div>
              <h2>The hardest part was never the idea.</h2>
              <p>
                Every creative knows the graveyard — projects that died between the spark and the
                screen. Not from lack of talent. From <b>blank starts</b>, <b>context switching</b>,
                and <b>momentum decay</b>.
              </p>
            </div>
            <div className="pain-row" data-reveal-group>
              <div className="pain">
                <div className="glyph">{'>_ empty'}</div>
                <h3>Blank starts</h3>
                <p>Every tool opens to an empty page and silently asks you to already know everything.</p>
              </div>
              <div className="pain">
                <div className="glyph">{'[][][][]'}</div>
                <h3>Context switching</h3>
                <p>Ten tabs, four apps, zero flow. Each switch taxes exactly the attention you were trying to spend.</p>
              </div>
              <div className="pain">
                <div className="glyph">{'▂▂▁▁__'}</div>
                <h3>Momentum decay</h3>
                <p>A day away becomes a week. Coming back costs more than leaving did — and the project quietly dies.</p>
              </div>
            </div>
            <p className="rex-line" data-reveal>
              <span className="rex-tag">REX</span>
              "Most tools hand you a blank page. I hand you a running start."
            </p>
          </div>
        </section>

        {/* ── 02 CONTEXT ENGINEERING ── */}
        <section className="section" id="workflow" data-rex="left">
          <div className="wrap">
            <div className="sec-head lane-left" data-reveal>
              <div className="mono">02 // context engineering</div>
              <h2>Don't start working.<br />Start knowing.</h2>
              <p>
                PRAX is designed around <b>context engineering</b> — and the workflow guides you
                through it. Before you execute, it scores how ready your context is: what's known,
                what's guessed, what's missing. The gaps become your next moves.
              </p>
            </div>
            <div className="bento" data-reveal-group>
              <div className="cell cell-score">
                <div className="mono">context confidence</div>
                <h3>One score before you build</h3>
                <p>Confidence is the inverse of what the system would have to guess.</p>
                <div className="score-stage">
                  <div className="score-ring">
                    <svg viewBox="0 0 210 210">
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8fb0ff" />
                          <stop offset="100%" stopColor="#3b73f7" />
                        </linearGradient>
                      </defs>
                      <circle cx="105" cy="105" r="90" fill="none" stroke="rgba(139,148,168,0.15)" strokeWidth="9" />
                      <circle
                        className="score-arc" cx="105" cy="105" r="90" fill="none"
                        stroke="url(#scoreGrad)" strokeWidth="9" strokeLinecap="round"
                        strokeDasharray={RING_C} strokeDashoffset={RING_C * 0.82}
                      />
                    </svg>
                    <div className="score-num"><b>18</b><span>ready</span></div>
                  </div>
                </div>
                <div className="score-caption">↕ scroll raises the score — that's the workflow</div>
              </div>
              <div className="cell cell-wide">
                <div className="mono">sessions</div>
                <h3>Guided sessions</h3>
                <p>Real starts and real ends. Sessions reconstruct themselves from real signal — commits, notes, captured ideas — never from what you remembered to log.</p>
              </div>
              <div className="cell cell-half">
                <div className="mono">gaps</div>
                <h3>The gap list</h3>
                <p>Missing context becomes a concrete to-do list instead of background anxiety.</p>
              </div>
              <div className="cell cell-third">
                <div className="mono">focus</div>
                <h3>One thing at a time</h3>
                <p>The workflow surfaces a single next action. Everything else waits its turn.</p>
              </div>
            </div>
            <div className="flow-strip" data-reveal-group>
              <div className="flow-step">
                <div className="mono">step 01</div>
                <h3>Talk it out</h3>
                <p>Start from a conversation, not a form. Say what you're trying to make.</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="mono">step 02</div>
                <h3>Score the context</h3>
                <p>PRAX measures what it would still have to guess.</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="mono">step 03</div>
                <h3>Close the gaps</h3>
                <p>Each gap is a concrete question. Answer, and the score climbs.</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="mono">step 04</div>
                <h3>Execute</h3>
                <p>Build with the full picture — and re-score any time it shifts.</p>
              </div>
            </div>
            <p className="rex-line" data-reveal>
              <span className="rex-tag">REX</span>
              "I score what I'd have to guess. Close the gaps — then we build."
            </p>
          </div>
        </section>

        {/* ── 03 ADHD FOUNDATION ── */}
        <section className="section" id="foundation" data-rex="right">
          <div className="wrap">
            <div className="sec-head lane-right" data-reveal>
              <div className="mono">03 // the foundation</div>
              <h2>Built on ADHD.<br />Not patched for it.</h2>
              <p>
                PRAX isn't a productivity app with an ADHD mode bolted on. The foundation is the
                science of attention, momentum, and dopamine — the workflow <b>assumes your brain</b>{' '}
                instead of fighting it.
              </p>
            </div>
            <div className="feat-rows" data-reveal-group>
              <div className="feat">
                <span className="n">/01</span>
                <h3>Momentum-aware</h3>
                <p>The system knows when you're depleted and changes what it asks of you.</p>
              </div>
              <div className="feat">
                <span className="n">/02</span>
                <h3>Zero manual config</h3>
                <p>If data can compute the answer, you are never asked to fill in a form.</p>
              </div>
              <div className="feat">
                <span className="n">/03</span>
                <h3>Ritual over discipline</h3>
                <p>Session start and end are rituals, not willpower checks. Showing up is the whole job.</p>
              </div>
              <div className="feat">
                <span className="n">/04</span>
                <h3>Recovery-first</h3>
                <p>Health gates the work. A sustainable pace ships more than a heroic sprint ever will.</p>
              </div>
            </div>
            <p className="rex-line" data-reveal>
              <span className="rex-tag">REX</span>
              "Your brain was never the problem. The workflow was."
            </p>
          </div>
        </section>

        {/* ── 04 COMMUNITY ── */}
        <section className="section" id="community" data-rex="left">
          <div className="wrap">
            <div className="sec-head lane-left" data-reveal>
              <div className="mono">04 // community</div>
              <h2>Aspiring game devs,<br />in one place.</h2>
              <p>
                PRAX grows into a community — a place to ask questions, share progress, and find
                collaborators building the same dream at the same stage you are.
              </p>
            </div>
            <div className="orbit-row" data-reveal-group>
              <div className="orbit-card">
                <div className="mono">share</div>
                <h3>Show the process</h3>
                <p>Devlogs, builds, breakthroughs, failures — progress is the content.</p>
              </div>
              <div className="orbit-card">
                <div className="mono">ask</div>
                <h3>Ask anything</h3>
                <p>Stuck on a shader, a system, a launch? Someone here got un-stuck last week.</p>
              </div>
              <div className="orbit-card">
                <div className="mono">team up</div>
                <h3>Build together</h3>
                <p>Find the artist to your programmer — collaborators at your stage, not gatekeepers.</p>
              </div>
            </div>
            <p className="rex-line" data-reveal>
              <span className="rex-tag">REX</span>
              "Nobody ships alone. The people are part of the system."
            </p>
          </div>
        </section>

        {/* ── 05 PROMOTION ── */}
        <section className="section" id="promotion" data-rex="right">
          <div className="wrap">
            <div className="sec-head lane-right" data-reveal>
              <div className="mono">05 // promotion</div>
              <h2>Finish it.<br />Then get it seen.</h2>
              <p>
                A dedicated promotion space is part of every PRAX — your finished work living in
                public, think <b>itch.io with a dev platform underneath it</b>. Making the thing is
                half the battle. PRAX helps with the other half.
              </p>
            </div>
            <div className="orbit-row" data-reveal-group>
              <div className="orbit-card">
                <div className="mono">shelf</div>
                <h3>Your public shelf</h3>
                <p>Every project you ship gets a home that's ready to be shared the moment it exists.</p>
              </div>
              <div className="orbit-card">
                <div className="mono">platform</div>
                <h3>Dev platform built in</h3>
                <p>Not just a storefront — the platform you built it on is the platform it launches from.</p>
              </div>
              <div className="orbit-card">
                <div className="mono">reach</div>
                <h3>Discovery</h3>
                <p>A community of players and makers who want to find exactly what you just made.</p>
              </div>
            </div>
            <p className="rex-line" data-reveal>
              <span className="rex-tag">REX</span>
              "Finishing is half the battle. Being seen is the other half — I help with both."
            </p>
          </div>
        </section>

        {/* ── 06 BUSINESS ── */}
        <section className="section" id="business" data-rex="left">
          <div className="wrap">
            <div className="sec-head lane-left" data-reveal>
              <div className="mono">06 // business</div>
              <h2>From projects<br />to businesses.</h2>
              <p>
                PRAX has a business management side — in development now and <b>dogfooded on two
                real companies</b> before it ever ships to you. When your project grows into
                something that pays, PRAX grows with it.
              </p>
            </div>
            <div className="orbit-row" data-reveal-group>
              <div className="orbit-card">
                <div className="mono">graduate</div>
                <h3>Project → venture</h3>
                <p>The same workflow that shipped the work starts running the business behind it.</p>
              </div>
              <div className="orbit-card">
                <div className="mono">proof</div>
                <h3>Dogfooded daily</h3>
                <p>Every business feature runs two real businesses before it reaches your PRAX.</p>
              </div>
              <div className="orbit-card">
                <div className="mono">one system</div>
                <h3>No eleventh app</h3>
                <p>Creative output and business ops in the same workflow, sharing the same context.</p>
              </div>
            </div>
            <p className="rex-line" data-reveal>
              <span className="rex-tag">REX</span>
              "When your project grows up, I grow with it."
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta" id="join" data-rex="right">
          <div className="cta-glow" />
          <div className="wrap">
            <div className="mono" data-reveal>built in the open</div>
            <h2 data-reveal>Follow the build.</h2>
            <p className="cta-sub" data-reveal>
              PRAX is in active development. The Patreon and Instagram are landing soon —
              this site is where it starts.
            </p>
            <div className="hero-ctas" data-reveal>
              <a className="btn btn-primary" href="#join">Patreon <span className="soon">soon</span></a>
              <a className="btn btn-ghost" href="#join">Instagram <span className="soon">soon</span></a>
            </div>

            <div className="roadmap" data-reveal-group>
              <div className="stage live">
                <div className="when">now</div>
                <h3>Creative output</h3>
                <p>Context engineering + the ADHD-first workflow, guided by REX.</p>
              </div>
              <div className="stage">
                <div className="when">next</div>
                <h3>Community</h3>
                <p>Aspiring game developers sharing, asking, and building together.</p>
              </div>
              <div className="stage">
                <div className="when">then</div>
                <h3>Promotion</h3>
                <p>Your public shelf — an itch.io-style space with a dev platform underneath.</p>
              </div>
              <div className="stage">
                <div className="when">later</div>
                <h3>Business</h3>
                <p>The management side, dogfooded on two real companies first.</p>
              </div>
            </div>

            <div className="manifesto glass" data-reveal>
              <div className="mono">the doctrine</div>
              <p>
                Craft over slop. AI in PRAX edits, arranges, and elevates <em>real work</em> —
                it never replaces the human making it.
              </p>
            </div>
          </div>
        </section>

        <footer className="wrap footer">
          <span>© 2026 JCT Developments LLC — PRAX</span>
          <div className="links">
            <a href="#top">Top</a>
            <a href="#workflow">Workflow</a>
            <a href="#join">Follow</a>
          </div>
        </footer>
      </main>
    </>
  )
}
