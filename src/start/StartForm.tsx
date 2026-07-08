/* /start — the client context-engineering intake.
   Design rule: minimum viable context FAST. Only step 1 is required — the
   LeadForge scraper + their Google listing fill the rest. 4 steps, ~3 min.
   Wire submissions: create a form at formspree.io and paste the ID below. */
import { useEffect, useMemo, useState } from 'react'

const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID' // ← paste real ID to go live
const DRAFT_KEY = 'prax_start_draft'

const TRADES = ['HVAC', 'Plumbing', 'Roofing', 'Electrical', 'Landscaping', 'Gym / Fitness', 'Auto', 'Cleaning', 'Other']
const SERVICES_BY_DEFAULT = ['Repairs', 'Installs', 'Emergency service', 'Maintenance plans', 'Free estimates', 'Commercial work']
const DIFFERENT = ['Family-owned', '24/7 availability', 'Upfront pricing', 'Licensed & certified', 'Fast response', 'Warranty-backed']
const GOALS = ['More calls', 'Look more professional', 'Beat a specific competitor', 'Show up on Google']
const STYLES = ['Bold & dark', 'Clean & light', 'Classic & trusted']

type Data = Record<string, string>

const empty: Data = {}

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
  const toggle = (k: string, v: string) => () =>
    setData((d) => {
      const cur = (d[k] ?? '').split('|').filter(Boolean)
      const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
      return { ...d, [k]: next.join('|') }
    })
  const has = (k: string, v: string) => (data[k] ?? '').split('|').includes(v)

  const step1Valid = useMemo(
    () => !!(data.business && data.trade && data.phone && data.city),
    [data.business, data.trade, data.phone, data.city],
  )

  const submit = async () => {
    setSending(true)
    try {
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
          I'll build a homepage mock of <b>{data.business || 'your business'}</b> and send it to{' '}
          <b>{data.email || data.phone}</b> within 48 hours. No strings — if you hate it, delete it.
        </p>
        <div className="sf-upsell">
          <b>In a hurry?</b> Approve the mock and the LAUNCH package is <b>$450</b> — one-page site,
          click-to-call, quote form, SEO basics, live in 7 days.
        </div>
      </div>
    )
  }

  const steps = ['The basics', 'Your business', 'Proof', 'Goals & taste']

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
            <label>Email <small>(optional)</small><input value={data.email ?? ''} onChange={set('email')} type="email" placeholder="you@business.com" /></label>
            <label>City / service area<input value={data.city ?? ''} onChange={set('city')} placeholder="Kansas City, MO" /></label>
            <label>Current website <small>(or "none")</small><input value={data.website ?? ''} onChange={set('website')} placeholder="none" /></label>
          </div>
          <div className="sf-row">
            <button className="sf-btn sf-btn-solid" disabled={!step1Valid} onClick={() => setStep(1)}>Continue — 2 more minutes</button>
            <button className="sf-btn" disabled={!step1Valid} onClick={submit}>
              {sending ? 'Sending…' : "In a hurry? Submit now — I'll pull the rest from your Google listing"}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="sf-step">
          <h2>YOUR BUSINESS <em>— all optional, all useful</em></h2>
          <div className="sf-label">Top services (pick up to 4)</div>
          <div className="sf-chips">
            {SERVICES_BY_DEFAULT.map((s) => (
              <button key={s} className={has('services', s) ? 'on' : ''} onClick={toggle('services', s)}>{s}</button>
            ))}
          </div>
          <div className="sf-label">What makes you different?</div>
          <div className="sf-chips">
            {DIFFERENT.map((s) => (
              <button key={s} className={has('different', s) ? 'on' : ''} onClick={toggle('different', s)}>{s}</button>
            ))}
          </div>
          <div className="sf-grid">
            <label>Your most profitable kind of job<input value={data.bestJob ?? ''} onChange={set('bestJob')} placeholder="Full system replacements" /></label>
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
          <h2>PROOF <em>— reviews sell better than anything I can write</em></h2>
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
          <div className="sf-chips">
            {GOALS.map((g) => (
              <button key={g} className={has('goal', g) ? 'on' : ''} onClick={toggle('goal', g)}>{g}</button>
            ))}
          </div>
          <div className="sf-label">Style that fits you</div>
          <div className="sf-chips">
            {STYLES.map((s) => (
              <button key={s} className={has('style', s) ? 'on' : ''} onClick={toggle('style', s)}>{s}</button>
            ))}
          </div>
          <div className="sf-label">Want any of these?</div>
          <div className="sf-chips">
            {['Online booking', 'Financing section', '24/7 emergency banner'].map((s) => (
              <button key={s} className={has('extras', s) ? 'on' : ''} onClick={toggle('extras', s)}>{s}</button>
            ))}
          </div>
          <div className="sf-grid">
            <label>A site you like (or hate)<input value={data.reference ?? ''} onChange={set('reference')} placeholder="competitor.com — hate it" /></label>
          </div>
          <div className="sf-row">
            <button className="sf-btn" onClick={() => setStep(2)}>Back</button>
            <button className="sf-btn sf-btn-solid" disabled={!step1Valid || sending} onClick={submit}>
              {sending ? 'Sending…' : 'Send it — free mock in 48h'}
            </button>
          </div>
          {!step1Valid && <p className="sf-warn">Step 1 (name, type, phone, city) is the only required part.</p>}
        </div>
      )}
    </div>
  )
}
