import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './start.css'
import StartForm from './StartForm'

function StartPage() {
  return (
    <div className="sf-page">
      <header className="sf-head">
        <a className="sf-brand" href="/">JACKSON TALLEY <span>· prax.design</span></a>
        <span className="sf-mono">WEBSITES FOR TRADES · INDIE PRICES · KC</span>
      </header>
      <main>
        <div className="sf-intro">
          <div className="sf-kicker">FREE HOMEPAGE MOCK — 48 HOURS</div>
          <h1>Tell me about your business.<br />I'll show you what your site should look like.</h1>
          <p>Three minutes, only the first step required. No calls, no pressure — you get a real
          mock of <i>your</i> homepage, then decide.</p>
        </div>
        <StartForm />
      </main>
      <footer className="sf-foot">
        <span>full effort on every project — that's the guarantee</span>
        <span>launch $250 · growth sites $800 · care $99/mo</span>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StartPage />
  </StrictMode>,
)
