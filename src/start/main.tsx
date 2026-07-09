import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './start.css'
import StartForm from './StartForm'

function StartPage() {
  return (
    <div className="sf-page">
      <header className="sf-head">
        <a className="sf-brand" href="/">prax<span>.design</span></a>
        <span className="sf-mono">WEBSITES FOR TRADES &amp; LOCAL BUSINESSES · KANSAS CITY</span>
      </header>
      <main>
        <div className="sf-intro">
          <div className="sf-kicker">FREE HOMEPAGE MOCK — 48 HOURS</div>
          <h1>See what your website should look like<br />— before you spend a dollar.</h1>
          <p>Three minutes, only the first step required. No calls, no pressure — a real mock
          of <i>your</i> homepage lands in your inbox within 48 hours, then you decide.</p>
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
