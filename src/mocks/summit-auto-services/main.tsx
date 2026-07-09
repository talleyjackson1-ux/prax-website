/* FREE MOCK — Summit Auto Services LLC, Lee's Summit MO.
   v2 (2026-07-09): THE REFINISH — its own scroll experience (spray-gun wipe,
   masking-tape peel), replacing the shared trade engine per Jackson's law:
   every trade concept gets a style drawn from the work itself.
   Grounding: real contact details only · sample-marked reviews · before/after =
   the SAME Pexels photo (damage composited in Blender) · gun = CC-BY Sketchfab
   scan re-rendered with alpha. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './refinish.css'
import Refinish from './Refinish'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Refinish />
  </StrictMode>,
)
