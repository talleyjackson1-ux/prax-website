/* FREE MOCK — Summit Auto Services LLC, Lee's Summit MO.
   Built from the /start intake (2026-07-08): family-owned 26 years, fast
   response, best work = medium collision jobs, wants online booking, style
   "Classic & trusted, Clean & light" → the engine's first LIGHT theme.
   Grounding rules: real contact details only; no fabricated stats, licenses,
   or offers; review cards are explicitly SAMPLES until real Google reviews
   or customer quotes come in; photos are placeholders until they send theirs. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../concepts/trade/trade.css'
import TradeConcept from '../../concepts/trade/TradeConcept'
import type { TradeConfig } from '../../concepts/trade/tradeConfig'

const summitAutoConfig: TradeConfig = {
  id: 'summit-auto-services',
  brand: { first: 'SUMMIT', second: 'AUTO' },
  heroWord: 'COLLISION',
  kicker: "LEE'S SUMMIT COLLISION & AUTO REPAIR · FAMILY-OWNED SINCE 2000",
  lede: 'Fender bender or full repair — a family-owned shop that picks up the phone, gives you a straight answer, and gets you back on the road fast.',
  phone: '(913) 689-8749',
  license: "Summit Auto Services LLC · Family-Owned & Operated · Lee's Summit, MO",
  ctas: { primary: 'Book Online', secondary: 'Get an Estimate' },
  stats: [
    { big: '26', label: 'years in business' },
    { big: 'FAMILY', label: 'owned & operated' },
    { big: 'FAST', label: 'response — call or text' },
  ],
  marquee: 'COLLISION REPAIR · BODY & DENT WORK · AUTO REPAIR · STRAIGHT ANSWERS · FAMILY-OWNED SINCE 2000 · ',
  images: {
    hero: '/img/auto/hero.jpg', detail: '/img/auto/engine.jpg',
    secA: '/img/auto/bodywork.jpg', secB: '/img/auto/finished.jpg',
  },
  imageAlts: {
    hero: 'Working on a vehicle in the shop', detail: 'Engine work up close',
    secA: 'Body work in progress in the repair bay', secB: 'Finished vehicle ready for pickup',
  },
  services: [
    { title: 'Collision Repair', desc: 'The work we’re known for: medium-size collision jobs done right — panels, paint match, and the details a rushed shop misses.' },
    { title: 'Body & Dent Work', desc: 'Dings, dents, scrapes, and trim. Small jobs welcome — fixed properly instead of “good enough.”' },
    { title: 'Auto Repair', desc: 'Brakes, suspension, and the everyday mechanical work that keeps your car dependable between visits.' },
    { title: 'Straight Estimates', desc: 'Send photos or swing by. You get a clear written estimate and a real timeline before any work starts.' },
  ],
  emergency: 'JUST HAD AN ACCIDENT? TEXT US PHOTOS FOR A FAST ESTIMATE',
  trust: {
    heading: 'A FAMILY SHOP, NOT A CHAIN.',
    points: [
      "26 years of collision and auto repair in Lee's Summit",
      'Family-owned and operated — you talk to the people doing the work',
      'Fast response: calls and texts answered, not sent to a queue',
      'Clear written estimates before a wrench is lifted',
    ],
  },
  financing: 'Working with insurance? We walk you through the estimate line by line so nothing gets missed.',
  reviews: [
    { name: 'Sample review', job: 'collision repair', text: 'They had my quarter panel and bumper looking factory-new, and were straight with me about the timeline the whole way.' },
    { name: 'Sample review', job: 'estimate', text: 'Called three shops. This was the only one where a person actually picked up. Had my estimate the same day.' },
    { name: 'Sample review', job: 'repeat customer', text: 'A family business that treats your car like their own. Been coming back for years.' },
  ],
  reviewBanner: 'Your Google reviews, front and center',
  areas: ["Lee's Summit", 'Greenwood', 'Raintree', 'Lakewood', 'Blue Springs', 'Raytown', 'Independence', 'Grandview', 'Lake Lotawana'],
  quoteHeading: 'BOOK YOUR VISIT ONLINE',
  quoteKicker: 'ONLINE BOOKING',
  quoteServices: ['Collision estimate', 'Body / dent work', 'Mechanical repair', 'Something else — we’ll talk'],
  closing: {
    heading: 'BACK ON THE ROAD, STRESS-FREE.',
    sub: "Family-owned. 26 years in Lee's Summit. Straight answers, fast.",
    cta: 'Call (913) 689-8749',
  },
  footer: { left: 'SUMMIT AUTO SERVICES LLC — WEBSITE PREVIEW', right: 'prepared by prax.design' },
  theme: {
    // "Classic & trusted, Clean & light": warm paper white, deep trust navy, classic red accent
    '--t-bg': '#f6f4ef', '--t-raise': '#ffffff',
    '--t-accent': '#1e3a5f', '--t-accent-hi': '#2e5688', '--t-accent2': '#b3261e',
    '--t-text': '#182634', '--t-dim': '#5b6875', '--t-line': 'rgba(24,38,52,0.15)',
    '--t-display': "'Archivo Black', sans-serif",
    '--t-bar': 'rgba(250,249,246,0.92)',
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TradeConcept cfg={summitAutoConfig} />
  </StrictMode>,
)
