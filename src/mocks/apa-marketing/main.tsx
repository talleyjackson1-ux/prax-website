/* FREE MOCK — APA Digital Marketing Group (Alex, Lee's Summit MO).
   Concept: THE ALIGNED LINE — "we only get paid when you do" drawn literally:
   the hero chart is two lines rising TOGETHER (client growth + our fee) on a
   ~6.5s grow→hold→fade loop, with no fabricated axis numbers, because the
   incentive alignment IS the brand.
   Theme v2 (2026-07-11): rebuilt around Alex's REAL logo — dark navy #0d161e
   (sampled from the logo file) + ice-blue gradient accent, Space Grotesk
   headings to match the wordmark. Mark extracted to /img/apa/apa-mark.png
   (color-keyed transparent).
   Grounding: real phone 816-844-5548 + real logo · before/after gallery =
   labeled empty slots awaiting his real campaign screenshots · NO invented
   stats, reviews, or dollar figures · email + service area still to confirm. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './apa.css'
import Apa from './Apa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Apa />
  </StrictMode>,
)
