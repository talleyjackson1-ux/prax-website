/* Per-trade content + theme for the shared TradeConcept engine.
   Copy is grounded in the 2026 trade-site research + the LeadForge audit run:
   phone-first, reviews above the fold, 3-5 field quote form, license/insured
   near CTAs, financing visible, 24/7 emergency band. */

export interface TradeReview { name: string; text: string; job: string }
export interface TradeService { title: string; desc: string }

export interface TradeConfig {
  id: string
  brand: { first: string; second: string }        // logo split: FIRST<span>SECOND</span>
  heroWord: string                                  // giant outlined word behind the images
  kicker: string
  lede: string
  phone: string
  license: string                                   // license line shown under the logo (research: pair trust w/ brand)
  ctas: { primary: string; secondary: string }
  stats: { big: string; label: string }[]
  marquee: string
  images: { hero: string; detail: string; secA: string; secB: string }
  imageAlts: { hero: string; detail: string; secA: string; secB: string }
  services: TradeService[]
  emergency: string
  trust: { heading: string; points: string[] }      // license/insured/financing block
  financing: string
  reviews: TradeReview[]
  reviewBanner: string
  areas: string[]
  quoteHeading: string
  quoteServices: string[]
  closing: { heading: string; sub: string; cta: string }
  theme: Record<string, string>                     // CSS custom props
}

export const hvacConfig: TradeConfig = {
  id: 'hvac',
  brand: { first: 'SUMMIT', second: 'AIR' },
  heroWord: 'COOLING',
  kicker: 'KANSAS CITY HEATING & COOLING · EST. 2012',
  lede: 'AC out in July? Furnace dead in January? We answer the phone and show up the same day.',
  phone: '(816) 555-0142',
  license: 'MO Mech. License #M-48210 · NATE-Certified · Insured',
  ctas: { primary: 'Book Same-Day Service', secondary: 'Get a Free Estimate' },
  stats: [
    { big: '4.9★', label: '2,100+ reviews' },
    { big: '24/7', label: 'emergency line' },
    { big: '0%', label: 'financing 60 mo' },
  ],
  marquee: 'AC REPAIR · FURNACE · HEAT PUMPS · SAME-DAY SERVICE · 0% FINANCING · TUNE-UP CLUB · ',
  images: {
    hero: '/img/hvac/hero.jpg', detail: '/img/hvac/gauge.jpg',
    secA: '/img/hvac/tech.jpg', secB: '/img/hvac/install.jpg',
  },
  imageAlts: {
    hero: 'Summit Air technician on the job', detail: 'Refrigerant gauges during an AC repair',
    secA: 'NATE-certified technician servicing a unit', secB: 'New system installation',
  },
  services: [
    { title: 'AC Repair', desc: 'Same-day diagnosis and repair, all makes and models. Upfront flat-rate pricing before we touch a wrench.' },
    { title: 'Furnace & Heat', desc: 'Repair, replacement, and safety inspections. Gas leak checks included on every heating call.' },
    { title: 'New Systems', desc: 'Right-sized installs with 0% financing for 60 months. We quote in writing — no surprises on install day.' },
    { title: 'Comfort Club', desc: '$14/mo: two tune-ups a year, priority scheduling, 15% off repairs. Your system lasts years longer.' },
  ],
  emergency: 'NO AC? NO HEAT? — 24/7 EMERGENCY LINE',
  trust: {
    heading: 'THE COMPANY YOUR NEIGHBORS ALREADY TRUST',
    points: [
      'NATE-certified technicians, background-checked, in marked trucks',
      'Upfront flat-rate pricing — approve the exact price before work starts',
      '0% financing for 60 months on new systems',
      'Licensed & insured · MO Mech. License #M-48210',
    ],
  },
  financing: 'New system sticker shock? 0% for 60 months, approved in minutes.',
  reviews: [
    { name: 'Dana W.', job: 'AC repair — Waldo', text: 'Called at 8am with no AC, cold air by 1pm the same day. Tech showed me the failed part and the price before fixing it.' },
    { name: 'Marcus T.', job: 'Furnace replacement — Liberty', text: 'Three quotes, Summit was the only one that measured the house. Install crew was in and out in a day, spotless.' },
    { name: 'Elaine R.', job: 'Comfort Club — Overland Park', text: 'The twice-a-year tune-up caught a capacitor about to die before summer. This membership pays for itself.' },
  ],
  reviewBanner: '4.9 stars across 2,100+ Google reviews',
  areas: ['Kansas City', 'North KC', 'Liberty', 'Gladstone', 'Overland Park', 'Lenexa', 'Independence', 'Blue Springs', "Lee's Summit"],
  quoteHeading: 'GET YOUR FREE ESTIMATE',
  quoteServices: ['AC repair', 'Heating repair', 'New system quote', 'Tune-up / Comfort Club', 'Something else'],
  closing: { heading: 'COMFORT IS ONE CALL AWAY.', sub: 'Same-day service. Upfront pricing. 2,100+ neighbors already trust us.', cta: 'Call (816) 555-0142' },
  theme: {
    '--t-bg': '#07090c', '--t-raise': '#0e1218', '--t-accent': '#2e9bff', '--t-accent-hi': '#6cbcff',
    '--t-accent2': '#ff7a2e', '--t-text': '#eef2f7', '--t-dim': '#93a0af', '--t-line': 'rgba(147,160,175,0.16)',
    '--t-display': "'Anton', sans-serif",
  },
}

export const roofingConfig: TradeConfig = {
  id: 'roofing',
  brand: { first: 'TRUE NORTH', second: 'ROOFING' },
  heroWord: 'ROOFING',
  kicker: 'KANSAS CITY ROOFING & STORM RESTORATION · EST. 2015',
  lede: 'Hail season is not the time to find out your roofer cuts corners. Free inspections, real photos, insurance claims handled.',
  phone: '(816) 555-0197',
  license: 'GAF-Certified · Fully Insured · KC Metro Licensed',
  ctas: { primary: 'Free Roof Inspection', secondary: 'Storm Damage? Start a Claim' },
  stats: [
    { big: '4.9★', label: '780+ reviews' },
    { big: '50yr', label: 'material warranty' },
    { big: '$0', label: 'inspection cost' },
  ],
  marquee: 'FREE INSPECTIONS · STORM RESTORATION · INSURANCE CLAIMS · SHINGLE & METAL · 50-YEAR WARRANTY · ',
  images: {
    hero: '/img/roofing/hero.jpg', detail: '/img/roofing/hammer.jpg',
    secA: '/img/roofing/crew.jpg', secB: '/img/roofing/ridge.jpg',
  },
  imageAlts: {
    hero: 'True North crew member securing a roof deck', detail: 'Hand-nailing ridge shingles',
    secA: 'Crew on a residential tear-off', secB: 'Finished architectural shingle roof',
  },
  services: [
    { title: 'Roof Replacement', desc: 'Full tear-off and re-deck when needed — never a cover-up job. Architectural shingle or metal, 50-year material warranty.' },
    { title: 'Storm & Hail Repair', desc: 'We document damage with drone photos, meet your adjuster on-site, and handle the insurance paperwork end to end.' },
    { title: 'Roof Repair', desc: 'Missing shingles, flashing leaks, wind damage. Photographed before and after so you see exactly what we did.' },
    { title: 'Gutters & Vents', desc: 'Seamless gutters, ridge vents, and attic airflow fixes that make the new roof actually last.' },
  ],
  emergency: 'STORM DAMAGE? TARPED WITHIN 24 HOURS — CALL NOW',
  trust: {
    heading: 'THE ROOF GETS PHOTOGRAPHED. YOU GET THE PROOF.',
    points: [
      'Every job documented: before, during, and after photos delivered to you',
      'GAF-certified installers — your warranty is real and registered',
      'We meet your insurance adjuster on-site and speak their language',
      'Fully insured crews · no subcontracted mystery labor',
    ],
  },
  financing: 'Insurance only covers part? Financing from $99/mo on full replacements.',
  reviews: [
    { name: 'Greg H.', job: 'Hail claim — Blue Springs', text: 'They found damage the first adjuster missed, met the re-inspection, and my whole roof was covered. Would never have known.' },
    { name: 'Priya S.', job: 'Full replacement — Brookside', text: 'Crew showed at 6:58am, done by 4pm, yard cleaner than they found it. The photo report at the end was impressive.' },
    { name: 'Tom & Carol B.', job: 'Repair — Raytown', text: 'Two other companies quoted a full replacement. True North fixed the flashing for a few hundred bucks. Honesty like that is rare.' },
  ],
  reviewBanner: '4.9 stars across 780+ reviews · A+ BBB',
  areas: ['Kansas City', 'Raytown', 'Blue Springs', 'Independence', "Lee's Summit", 'Grandview', 'Liberty', 'Gladstone', 'Parkville'],
  quoteHeading: 'BOOK YOUR FREE INSPECTION',
  quoteServices: ['Free inspection', 'Storm / hail damage', 'Leak repair', 'Full replacement quote', 'Gutters'],
  closing: { heading: 'KNOW WHAT YOUR ROOF IS HIDING.', sub: 'Free inspection, drone photos included, zero pressure.', cta: 'Call (816) 555-0197' },
  theme: {
    '--t-bg': '#0a0908', '--t-raise': '#141210', '--t-accent': '#d9762b', '--t-accent-hi': '#f0994f',
    '--t-accent2': '#5b8bd9', '--t-text': '#f4f0ea', '--t-dim': '#a39a8e', '--t-line': 'rgba(163,154,142,0.16)',
    '--t-display': "'Archivo Black', sans-serif",
  },
}

export const plumbingConfig: TradeConfig = {
  id: 'plumbing',
  brand: { first: 'RIVER CITY', second: 'PLUMBING' },
  heroWord: 'PLUMBING',
  kicker: 'KANSAS CITY 24/7 PLUMBERS · EST. 2010',
  lede: 'Burst pipe at 2am or a slow drain on Sunday — a licensed plumber is on the way within the hour.',
  phone: '(816) 555-0135',
  license: 'MO Master Plumber #MP-7714 · Licensed · Bonded · Insured',
  ctas: { primary: 'Emergency? Call Now', secondary: 'Book Online' },
  stats: [
    { big: '4.8★', label: '1,450+ reviews' },
    { big: '60min', label: 'avg. arrival' },
    { big: '24/7', label: 'real humans answer' },
  ],
  marquee: '24/7 EMERGENCY · DRAIN CLEANING · WATER HEATERS · LEAK DETECTION · LICENSED & BONDED · ',
  images: {
    hero: '/img/plumbing/hero.jpg', detail: '/img/plumbing/tools.jpg',
    secA: '/img/plumbing/heater.jpg', secB: '/img/plumbing/cabinet.jpg',
  },
  imageAlts: {
    hero: 'River City plumber opening a wall line', detail: 'Pipe wrenches on the truck',
    secA: 'Water heater replacement in progress', secB: 'Under-sink repair',
  },
  services: [
    { title: '24/7 Emergency', desc: 'Burst pipes, sewage backup, no water. Real dispatcher answers at 2am and a truck rolls within the hour.' },
    { title: 'Water Heaters', desc: 'Repair or same-day replacement, tank and tankless. Old unit hauled away, floor left dry.' },
    { title: 'Drain & Sewer', desc: 'Camera inspection first, so you fix the actual problem. Hydro-jetting and trenchless repair available.' },
    { title: 'Leak Detection', desc: 'Acoustic and thermal detection finds it without tearing up the whole wall. Fixed right the first time.' },
  ],
  emergency: 'WATER WHERE IT SHOULDN’T BE? — 24/7 EMERGENCY DISPATCH',
  trust: {
    heading: 'LICENSED. BONDED. ON TIME.',
    points: [
      'Master Plumber license #MP-7714 — check it, we encourage it',
      'Flat-rate pricing quoted before work begins, nights and weekends included',
      'Background-checked plumbers in marked trucks and shoe covers',
      'If we’re late past the window, the trip fee is free',
    ],
  },
  financing: 'Water heater died? Replacement financing approved over the phone.',
  reviews: [
    { name: 'Kayla M.', job: 'Emergency — Midtown', text: 'Pipe burst at 1am. Human answered on the second ring, plumber here by 1:50, water off and fixed before it hit the hardwood.' },
    { name: 'Robert J.', job: 'Water heater — Gladstone', text: 'Quoted flat price on the phone, honored it exactly, and had hot water back the same afternoon.' },
    { name: 'Ana G.', job: 'Drain — Westport', text: 'Third company I called, first one that put a camera down instead of guessing. Found roots the others would have "snaked" forever.' },
  ],
  reviewBanner: '4.8 stars across 1,450+ Google reviews',
  areas: ['Kansas City', 'Westport', 'Midtown', 'North KC', 'Gladstone', 'Liberty', 'Overland Park', 'Mission', 'Independence'],
  quoteHeading: 'GET A FLAT-RATE QUOTE',
  quoteServices: ['Emergency — call instead!', 'Water heater', 'Drain / sewer', 'Leak detection', 'Fixture install'],
  closing: { heading: 'WATER PROBLEMS DON’T WAIT. NEITHER DO WE.', sub: 'Licensed, bonded, flat-rate. On the way in 60 minutes.', cta: 'Call (816) 555-0135' },
  theme: {
    '--t-bg': '#060a0d', '--t-raise': '#0d141a', '--t-accent': '#e8442e', '--t-accent-hi': '#ff6a52',
    '--t-accent2': '#2e9bff', '--t-text': '#eef3f6', '--t-dim': '#8fa1ad', '--t-line': 'rgba(143,161,173,0.16)',
    '--t-display': "'Oswald', sans-serif",
  },
}
