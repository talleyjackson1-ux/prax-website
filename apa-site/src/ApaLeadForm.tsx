import { useMemo, useState } from 'react'
import {
  EMAIL, MAILTO_HREF, FORM_ENDPOINT, SUPABASE_URL, SUPABASE_ANON_KEY,
} from './siteConfig'

/**
 * APA native intake form — replaces the Google Form iframe. Submissions POST
 * straight to the APA app (Supabase `apa_inbound`, insert-only RLS) so Alex &
 * Parker see estimate requests in their software, not a spreadsheet. Short by
 * design — marketing sites convert on fewer fields. Optionally mirrors to an
 * email endpoint (FORM_ENDPOINT) when Parker wants a copy in his inbox too.
 */

const NEEDS = [
  'Social Media',
  'Paid Ads',
  'Lead Generation',
  'Website',
  'Everything',
  'Not sure yet',
]

const BUDGETS = [
  'Under $500 / mo',
  '$500 – $1,000 / mo',
  '$1,000 – $2,500 / mo',
  '$2,500+ / mo',
  'Not sure yet',
]

type Data = Record<string, string>

export default function ApaLeadForm() {
  const [data, setData] = useState<Data>({})
  const [needs, setNeeds] = useState<string[]>([])
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [k]: e.target.value }))

  const toggleNeed = (n: string) =>
    setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]))

  const valid = useMemo(
    () => !!(data.name?.trim() && data.email?.trim() && data.business?.trim()),
    [data.name, data.email, data.business],
  )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    setSending(true)
    setFailed(false)
    const row = {
      business: data.business?.trim() || null,
      contact_name: data.name?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      need: needs.join(', ') || null,
      budget: data.budget || null,
      message: data.message?.trim() || null,
      source: 'apa-web',
      page: typeof window !== 'undefined' ? window.location.pathname : null,
      raw: { ...data, needs },
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/apa_inbound`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(row),
      })
      if (!res.ok) throw new Error(String(res.status))
      // Optional email copy — best-effort, never blocks the success state.
      if (FORM_ENDPOINT) {
        try {
          await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(row),
          })
        } catch { /* email copy is best-effort */ }
      }
      setSent(true)
    } catch {
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="ap-form ap-form-done" role="status">
        <div className="apf-check">✓</div>
        <h3>Request received.</h3>
        <p>
          Thanks{data.name ? `, ${data.name.split(' ')[0]}` : ''} — we’ll review what
          {' '}<b>{data.business || 'your business'}</b> needs and come back with a
          straight answer on what we’d run and what it costs, usually within one
          business day.
        </p>
        <p className="apf-note">
          Prefer email? Reach us any time at <a href={MAILTO_HREF}>{EMAIL}</a>.
        </p>
      </div>
    )
  }

  return (
    <form className="ap-form" onSubmit={submit}>
      <div className="apf-head">
        <h3>Request a free estimate</h3>
        <p>No packages, no pressure — a real answer on what we’d do and what it costs.</p>
      </div>

      <div className="apf-grid">
        <label className="apf-field">
          <span>Your name</span>
          <input value={data.name ?? ''} onChange={set('name')} placeholder="First & last" autoComplete="name" required />
        </label>
        <label className="apf-field">
          <span>Business name</span>
          <input value={data.business ?? ''} onChange={set('business')} placeholder="Your company" autoComplete="organization" required />
        </label>
        <label className="apf-field">
          <span>Email</span>
          <input value={data.email ?? ''} onChange={set('email')} type="email" placeholder="you@business.com" autoComplete="email" required />
        </label>
        <label className="apf-field">
          <span>Phone <small>(optional)</small></span>
          <input value={data.phone ?? ''} onChange={set('phone')} type="tel" placeholder="(816) 555-0142" autoComplete="tel" />
        </label>
      </div>

      <div className="apf-field apf-full">
        <span>What do you need? <small>(pick any)</small></span>
        <div className="apf-chips">
          {NEEDS.map((n) => (
            <button
              key={n}
              type="button"
              className={needs.includes(n) ? 'on' : ''}
              onClick={() => toggleNeed(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="apf-grid">
        <label className="apf-field apf-full">
          <span>Monthly budget <small>(optional — helps us tailor the plan)</small></span>
          <select value={data.budget ?? ''} onChange={set('budget')}>
            <option value="">Select a range</option>
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
      </div>

      <label className="apf-field apf-full">
        <span>Anything else? <small>(optional)</small></span>
        <textarea
          value={data.message ?? ''}
          onChange={set('message')}
          rows={3}
          placeholder="What are you trying to grow? Current site or ad accounts? Timeline?"
        />
      </label>

      <button className="ap-btn ap-btn-solid apf-submit" type="submit" disabled={!valid || sending}>
        {sending ? 'Sending…' : 'Request My Free Estimate'}
      </button>
      {failed && (
        <p className="apf-warn">
          Something hiccuped sending that. Try again, or email <a href={MAILTO_HREF}>{EMAIL}</a>.
        </p>
      )}
      <p className="apf-note">We reply within one business day. No spam, ever.</p>
    </form>
  )
}
