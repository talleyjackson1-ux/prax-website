/* /start — the client context-engineering intake.
   Design rules: minimum viable context FAST (only step 1 required — LeadForge +
   their Google listing fill the rest) · presets TUNED PER TRADE (generic chips
   made an auto shop pick "Repairs"; collision/body presets get real answers) ·
   professional service voice — the builder's name appears exactly once, in the
   thank-you at the end. Optional email copy: paste a formspree ID below. */
import { useEffect, useMemo, useState } from 'react'

/* Submissions land in the PRAX Supabase (freelance_leads). The publishable key
   is public by design; RLS allows INSERT only — nobody can read leads back. */
const SUPA_URL = 'https://goaquyufqhuedrrvrzom.supabase.co'
const SUPA_KEY = 'sb_publishable_1TMdi3h3h4nJDETq950fkg_uMObwlI_'
const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID' // optional email copy — paste ID to enable
const DRAFT_KEY = 'prax_start_draft'

const TRADES = ['HVAC', 'Plumbing', 'Roofing', 'Electrical', 'Landscaping', 'Gym / Fitness', 'Auto', 'Cleaning', 'Other']

/* Per-trade presets — the chips should read like the owner's own menu, not a
   generic contractor's. Every trade keeps a write-your-own slot regardless. */
interface TradePreset { services: string[]; different: string[]; bestJob: string }
const GENERIC: TradePreset = {
  services: ['Repairs', 'Installs', 'Emergency service', 'Maintenance plans', 'Free estimates', 'Commercial work'],
  different: ['Family-owned', '24/7 availability', 'Upfront pricing', 'Licensed & certified', 'Fast response', 'Warranty-backed'],
  bestJob: 'Your highest-value kind of job',
}
const PRESETS: Record<string, TradePreset> = {
  HVAC: {
    services: ['AC repair', 'Furnace & heating', 'New system installs', 'Maintenance plans', 'Duct work', 'Emergency service'],
    different: ['Family-owned', '24/7 availability', 'Upfront pricing', 'NATE-certified', 'Fast response', 'Financing offered'],
    bestJob: 'Full system replacements',
  },
  Plumbing: {
    services: ['Emergency plumbing', 'Drain cleaning', 'Water heaters', 'Leak detection', 'Repiping', 'Fixture installs'],
    different: ['Licensed & bonded', '24/7 availability', 'Flat-rate pricing', 'Family-owned', 'Fast response', 'Camera inspections'],
    bestJob: 'Water heater replacements',
  },
  Roofing: {
    services: ['Roof replacement', 'Storm & hail repair', 'Leak repair', 'Free inspections', 'Gutters', 'Metal roofing'],
    different: ['Insurance claim help', 'Certified installers', 'Photo documentation', 'Family-owned', 'Warranty-backed', 'Local crews'],
    bestJob: 'Full replacements (insurance)',
  },
  Electrical: {
    services: ['Panel upgrades', 'Wiring & rewiring', 'Lighting', 'EV chargers', 'Emergency service', 'Inspections'],
    different: ['Licensed & insured', 'Upfront pricing', 'Family-owned', 'Fast response', 'Warranty-backed', '24/7 availability'],
    bestJob: 'Panel upgrades',
  },
  Landscaping: {
    services: ['Mowing & maintenance', 'Landscape design', 'Hardscapes & patios', 'Irrigation', 'Tree & shrub care', 'Seasonal cleanup'],
    different: ['Family-owned', 'Licensed & insured', 'Free estimates', 'Reliable schedule', 'Local crew', 'Photo portfolio'],
    bestJob: 'Full landscape installs',
  },
  'Gym / Fitness': {
    services: ['Memberships', 'Personal training', 'Group classes', '24/7 access', 'Nutrition coaching', 'Youth programs'],
    different: ['No-contract options', 'Community feel', 'Certified trainers', 'Family-owned', 'Real equipment', 'First visit free'],
    bestJob: 'Annual memberships',
  },
  Auto: {
    services: ['Collision repair', 'Body & dent work', 'Paint', 'Mechanical repair', 'Brakes & suspension', 'Diagnostics'],
    different: ['Family-owned', 'Insurance help', 'Straight estimates', 'Fast turnaround', 'Warranty-backed', 'Certified techs'],
    bestJob: 'Collision jobs',
  },
  Cleaning: {
    services: ['Residential cleaning', 'Deep cleans', 'Move-in / move-out', 'Commercial cleaning', 'Recurring service', 'Carpet & floors'],
    different: ['Background-checked staff', 'Supplies included', 'Satisfaction guarantee', 'Family-owned', 'Flexible scheduling', 'Insured & bonded'],
    bestJob: 'Recurring residential routes',
  },
}

const GOALS = ['More calls', 'Look more professional', 'Beat a specific competitor', 'Show up on Google']
const STYLES = ['Bold & dark', 'Clean & light', 'Classic & trusted']
/* tiny palette previews — taste is easier to point at than to describe */
const STYLE_SWATCH: Record<string, string[]> = {
  'Bold & dark': ['#0b0b0e', '#e8442e', '#eef2f7'],
  'Clean & light': ['#f6f4ef', '#1e3a5f', '#b3261e'],
  'Classic & trusted': ['#10233c', '#c9a44a', '#f4efe4'],
}
const EXTRAS = ['Online booking', 'Financing section', '24/7 emergency banner', 'Before & after gallery']

type Data = Record<string, string>

const empty: Data = {}

/* Chip group with a WRITE-YOUR-OWN slot — presets that don't resonate push
   people away; letting them add their own take keeps them engaged and gives
   better context than any preset could. Custom entries become removable chips. */
function Chips({ field, options, data, setData, swatch }: {
  field: string
  options: string[]
  data: Data
  setData: React.Dispatch<React.SetStateAction<Data>>
  swatch?: Record<string, string[]>
}) {
  const [draft, setDraft] = useState('')
  const values = (data[field] ?? '').split('|').filter(Boolean)
  const customs = values.filter((v) => !options.includes(v))
  const flip = (v: string) => setData((d) => {
    const cur = (d[field] ?? '').split('|').filter(Boolean)
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    return { ...d, [field]: next.join('|') }
  })
  const add = () => {
    const v = draft.trim().replace(/\|/g, '/')
    if (v && !values.includes(v)) flip(v)
    setDraft('')
  }
  return (
    <div className="sf-chips">
      {options.map((o) => (
        <button key={o} type="button" className={values.includes(o) ? 'on' : ''} onClick={() => flip(o)}>
          {swatch?.[o] && (
            <span className="sf-sw">{swatch[o].map((c) => <i key={c} style={{ background: c }} />)}</span>
          )}
          {o}
        </button>
      ))}
      {customs.map((c) => (
        <button key={c} type="button" className="on sf-chip-custom" onClick={() => flip(c)} title="tap to remove">{c} ✕</button>
      ))}
      <span className="sf-addchip">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="or write your own…"
        />
        <button type="button" onClick={add} aria-label="add">+</button>
      </span>
    </div>
  )
}

export default function StartForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Data>(() => {
    try { return { ...empty, ...JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') } } catch { return empty }
  })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)) } catch { /* ignore */ }
  }, [data])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }))

  const preset = PRESETS[data.trade ?? ''] ?? GENERIC

  const step1Valid = useMemo(
    () => !!(data.business && data.trade && data.phone && data.city),
    [data.business, data.trade, data.phone, data.city],
  )

  const submit = async () => {
    setSending(true)
    try {
      const row = {
        business: data.business, trade: data.trade, phone: data.phone, email: data.email,
        city: data.city, website: data.website, services: data.services, different: data.different,
        best_job: data.bestJob, years: data.years, license: data.license, reviews: data.reviews,
        logo: data.logo, photos: data.photos, goal: data.goal, style: data.style,
        extras: data.extras, reference: data.reference, notes: data.notes,
        must_have: data.mustHave, must_not: data.mustNot,
      }
      await fetch(`${SUPA_URL}/rest/v1/freelance_leads`, {
        method: 'POST',
        headers: {
          apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json', Prefer: 'return=minimal',
        },
        body: JSON.stringify(row),
      })
      if (!FORM_ENDPOINT.includes('YOUR_FORM_ID')) {
        await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        })
      }
      try { localStorage.setItem('prax_start_last_submission', JSON.stringify({ ...data, at: new Date().toISOString() })) } catch { /* ignore */ }
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="sf-card sf-done">
        <div className="sf-kicker">REQUEST RECEIVED</div>
        <h2>Your free mock is in the queue.</h2>
        <p>
          A homepage mock for <b>{data.business || 'your business'}</b> will be built and sent to{' '}
          <b>{data.email || data.phone}</b> within 48 hours. No calls, no pressure — you see the
          work first, then decide.
        </p>
        <div className="sf-upsell">
          <b>Like what you see?</b> The LAUNCH package is <b>$250</b> — one-page site,
          click-to-call, quote form, SEO basics, live in 7 days.
        </div>
        <p className="sf-sign">Thank you for your time. <b>— Jackson Talley</b></p>
      </div>
    )
  }

  const steps = ['The basics', 'Your business', 'Proof', 'Goals & taste', 'Say anything']

  return (
    <div className="sf-card">
      <div className="sf-progress">
        {steps.map((s, i) => (
          <button key={s} className={i === step ? 'on' : i < step ? 'done' : ''} onClick={() => setStep(i)}>
            <span>{i + 1}</span>{s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="sf-step">
          <h2>THE BASICS <em>— the only required part</em></h2>
          <div className="sf-grid">
            <label>Business name<input value={data.business ?? ''} onChange={set('business')} placeholder="Summit Air" /></label>
            <label>What kind of business?
              <select value={data.trade ?? ''} onChange={set('trade')}>
                <option value="" disabled>Pick one</option>
                {TRADES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label>Phone<input value={data.phone ?? ''} onChange={set('phone')} type="tel" placeholder="(816) 555-0142" /></label>
            <label>Email <small>(optional — where the mock gets sent)</small><input value={data.email ?? ''} onChange={set('email')} type="email" placeholder="you@business.com" /></label>
            <label>City / service area<input value={data.city ?? ''} onChange={set('city')} placeholder="Kansas City, MO" /></label>
            <label>Current website <small>(or "none")</small><input value={data.website ?? ''} onChange={set('website')} placeholder="none" /></label>
          </div>
          <div className="sf-row">
            <button className="sf-btn sf-btn-solid" disabled={!step1Valid} onClick={() => setStep(1)}>Continue — 2 more minutes</button>
            <button className="sf-btn" disabled={!step1Valid} onClick={submit}>
              {sending ? 'Sending…' : 'Short on time? Send this now — the rest gets pulled from your Google listing'}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="sf-step">
          <h2>YOUR BUSINESS <em>— all optional, all useful</em></h2>
          <div className="sf-label">Top services (pick up to 4 — or add your own)</div>
          <Chips field="services" options={preset.services} data={data} setData={setData} />
          <div className="sf-label">What makes you different? (your words beat any preset)</div>
          <Chips field="different" options={preset.different} data={data} setData={setData} />
          <div className="sf-grid">
            <label>Your most profitable kind of job<input value={data.bestJob ?? ''} onChange={set('bestJob')} placeholder={preset.bestJob} /></label>
            <label>Years in business<input value={data.years ?? ''} onChange={set('years')} placeholder="12" /></label>
            <label>License # <small>(shown on the site — builds trust)</small><input value={data.license ?? ''} onChange={set('license')} placeholder="MO #M-48210" /></label>
          </div>
          <div className="sf-row">
            <button className="sf-btn" onClick={() => setStep(0)}>Back</button>
            <button className="sf-btn sf-btn-solid" onClick={() => setStep(2)}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="sf-step">
          <h2>PROOF <em>— your reviews do the selling</em></h2>
          <div className="sf-grid">
            <label>Google reviews link or rating<input value={data.reviews ?? ''} onChange={set('reviews')} placeholder="4.8 stars / maps link" /></label>
            <label>Logo?
              <select value={data.logo ?? ''} onChange={set('logo')}>
                <option value="" disabled>Pick one</option>
                <option>I have one — will send it</option>
                <option>Need one — make me something simple</option>
              </select>
            </label>
            <label>Photos of your work / crew?
              <select value={data.photos ?? ''} onChange={set('photos')}>
                <option value="" disabled>Pick one</option>
                <option>Will send some</option>
                <option>Use professional stock for now</option>
              </select>
            </label>
          </div>
          <div className="sf-row">
            <button className="sf-btn" onClick={() => setStep(1)}>Back</button>
            <button className="sf-btn sf-btn-solid" onClick={() => setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="sf-step">
          <h2>GOALS &amp; TASTE <em>— last one</em></h2>
          <div className="sf-label">#1 goal for the site</div>
          <Chips field="goal" options={GOALS} data={data} setData={setData} />
          <div className="sf-label">Style that fits you</div>
          <Chips field="style" options={STYLES} data={data} setData={setData} swatch={STYLE_SWATCH} />
          <div className="sf-label">Want any of these?</div>
          <Chips field="extras" options={EXTRAS} data={data} setData={setData} />
          <div className="sf-grid">
            <label>A site you like (or hate)<input value={data.reference ?? ''} onChange={set('reference')} placeholder="competitor.com — hate it" /></label>
          </div>
          <div className="sf-row">
            <button className="sf-btn" onClick={() => setStep(2)}>Back</button>
            <button className="sf-btn sf-btn-solid" onClick={() => setStep(4)}>Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="sf-step">
          <h2>SAY ANYTHING <em>— your words go straight into the build</em></h2>
          <div className="sf-grid">
            <label className="sf-full">Ideas, styles, concepts — anything on your mind
              <textarea rows={3} value={data.notes ?? ''} onChange={set('notes')}
                placeholder="Slow season is winter · the owner's truck should be on the site · love the look of chrome and dark metal…" />
            </label>
            <label className="sf-full">MUST be on the website <small>(non-negotiables — these are guaranteed in)</small>
              <textarea rows={2} value={data.mustHave ?? ''} onChange={set('mustHave')}
                placeholder="Our phone number huge at the top · the 26 years · a photo of the crew" />
            </label>
            <label className="sf-full">Must NOT be on the website <small>(hard nos — these are guaranteed out)</small>
              <textarea rows={2} value={data.mustNot ?? ''} onChange={set('mustNot')}
                placeholder="No stock photos of fake smiling models · no prices listed · nothing about the old location" />
            </label>
          </div>
          <div className="sf-row">
            <button className="sf-btn" onClick={() => setStep(3)}>Back</button>
            <button className="sf-btn sf-btn-solid" disabled={!step1Valid || sending} onClick={submit}>
              {sending ? 'Sending…' : 'Send it — free mock within 48 hours'}
            </button>
          </div>
          {!step1Valid && <p className="sf-warn">Step 1 (name, type, phone, city) is the only required part.</p>}
        </div>
      )}
    </div>
  )
}
