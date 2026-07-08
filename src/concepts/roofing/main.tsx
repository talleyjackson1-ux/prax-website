import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../trade/trade.css'
import TradeConcept from '../trade/TradeConcept'
import { roofingConfig } from '../trade/tradeConfig'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TradeConcept cfg={roofingConfig} />
  </StrictMode>,
)
