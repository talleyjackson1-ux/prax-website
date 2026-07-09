import { chromium } from 'playwright'
const out = process.argv[2] ?? '.'
const base = process.argv[3] ?? 'http://localhost:5175'
let browser
try { browser = await chromium.launch() } catch { browser = await chromium.launch({ channel: 'chrome' }) }
const page = await browser.newPage({ viewport: { width: 1720, height: 940 } })
const errs = []
page.on('pageerror', e => errs.push(e.message))
await page.goto(`${base}/#/manage`)
await page.waitForTimeout(2500)
await page.evaluate(() => localStorage.setItem('prax_handoff_open', '1'))
await page.waitForTimeout(4000)
await page.mouse.click(283, 300)
await page.waitForTimeout(3000)
await page.mouse.click(893, 59)
await page.waitForTimeout(4500)
await page.mouse.click(597, 18)           // TopStrip ⌸ business chip
await page.waitForTimeout(4000)
await page.screenshot({ path: `${out}/bizhq-top.jpeg`, type: 'jpeg', quality: 85 })
console.log('pageerrors:', errs.length ? errs.join(' | ') : 'none')
await browser.close()
console.log('done')
