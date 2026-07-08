import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './gym.css'
import GymConcept from './GymConcept'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GymConcept />
  </StrictMode>,
)
