/* /mocks — the code-gated mock viewer. Clients get a code with their free mock
   email; entering it opens THEIR mock fullscreen (small back arrow top-left).
   No browsing, no gallery listing — the code is the only door. Codes resolve
   through a security-definer RPC so the public key can't enumerate the table. */
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../start/start.css'

const SUPA_URL = 'https://goaquyufqhuedrrvrzom.supabase.co'
const SUPA_KEY = 'sb_publishable_1TMdi3h3h4nJDETq950fkg_uMObwlI_'

async function slugForCode(code: string): Promise<string | null> {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/rpc/mock_slug_for_code`, {
      method: 'POST',
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_code: code }),
    })
    const v = await r.json() as string | null
    return typeof v === 'string' && v ? v : null
  } catch { return null }
}

function MockGate() {
  const [code, setCode] = useState(() => sessionStorage.getItem('prax_mock_code') ?? '')
  const [slug, setSlug] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'checking' | 'bad'>('idle')

  const open = async (c: string) => {
    const v = c.trim().toUpperCase()
    if (!v) return
    setState('checking')
    const s = await slugForCode(v)
    if (s) {
      sessionStorage.setItem('prax_mock_code', v)
      setSlug(s); setState('idle')
    } else setState('bad')
  }
  // a code in the URL (?c=ABC123) opens straight through — the email can deep-link
  useEffect(() => {
    const c = new URLSearchParams(location.search).get('c')
    if (c) { setCode(c.toUpperCase()); void open(c) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (slug) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
        <iframe src={`/mock/${slug}/`} title="your website mock"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />
        <button onClick={() => setSlug(null)} title="back"
          style={{
            position: 'fixed', top: 14, left: 14, width: 40, height: 40, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(5,7,13,0.72)', color: '#e8ecf5',
            fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(8px)', lineHeight: 1,
          }}>‹</button>
      </div>
    )
  }

  return (
    <div className="sf-page">
      <header className="sf-head">
        <a className="sf-brand" href="/">prax<span>.design</span></a>
        <span className="sf-mono">PRIVATE MOCK VIEWER</span>
      </header>
      <main style={{ display: 'grid', placeItems: 'center' }}>
        <div className="sf-card" style={{ width: 'min(460px, 92vw)', textAlign: 'center' }}>
          <div className="sf-kicker">VIEW YOUR MOCK</div>
          <h2 style={{ margin: '12px 0 10px', fontSize: '1.4rem' }}>Enter the code from your email.</h2>
          <p style={{ color: 'var(--s-dim)', fontSize: '0.9rem', marginBottom: 20 }}>
            Every mock is private — the code opens yours and only yours.
          </p>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setState('idle') }}
            onKeyDown={(e) => e.key === 'Enter' && void open(code)}
            placeholder="E.G. 7KFQ2M"
            maxLength={10}
            style={{
              width: '100%', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1.3rem', letterSpacing: '0.35em', padding: '14px 10px',
              background: 'var(--s-bg)', border: `1px solid ${state === 'bad' ? '#e8442e' : 'var(--s-line)'}`,
              borderRadius: 10, color: 'var(--s-text)', outline: 'none', marginBottom: 14,
            }}
          />
          {state === 'bad' && <p style={{ color: '#ff7a66', fontSize: '0.85rem', marginBottom: 12 }}>That code didn't match — check the email or reply to it and ask.</p>}
          <button className="sf-btn sf-btn-solid" style={{ width: '100%' }} disabled={state === 'checking' || !code.trim()} onClick={() => void open(code)}>
            {state === 'checking' ? 'Checking…' : 'Open my mock'}
          </button>
        </div>
      </main>
      <footer className="sf-foot">
        <span>mocks are free — you see the work, then decide</span>
        <span>prax.design/start</span>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MockGate />
  </StrictMode>,
)
