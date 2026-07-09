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
await page.mouse.click(597, 18)
await page.waitForTimeout(4000)
// click the Summit Auto lead row in the strip (the thing Jackson couldn't click)
await page.click('.biz-hq >> text=Summit Auto Services LLC')
await page.waitForTimeout(1200)
await page.screenshot({ path: `${out}/bizhq-v2.jpeg`, type: 'jpeg', quality: 85 })
// run the domain check (pre-flight)
try {
  await page.click('text=◫ check domains')
  await page.waitForTimeout(9000)
  await page.screenshot({ path: `${out}/bizhq-domains.jpeg`, type: 'jpeg', quality: 85 })
} catch (e) { console.log('domains:', e.message) }
// open the comms hub via the orb (top-left)
await page.mouse.click(120, 51)
await page.waitForTimeout(1500)
await page.screenshot({ path: `${out}/commshub.jpeg`, type: 'jpeg', quality: 85 })
console.log('pageerrors:', errs.length ? errs.join(' | ') : 'none')
await browser.close()
console.log('done')
