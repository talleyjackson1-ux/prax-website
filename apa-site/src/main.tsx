import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './apa.css'
import Apa from './Apa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Apa />
  </StrictMode>,
)
