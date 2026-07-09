// Verify the portal notification + leads wiring: open MANAGE, screenshot the
// TopStrip bell; open Business HQ, screenshot the Web Leads panel.
import { chromium } from 'playwright'

const out = process.argv[2] ?? '.'
const base = process.argv[3] ?? 'http://localhost:5175'
let browser
try { browser = await chromium.launch() } catch { browser = await chromium.launch({ channel: 'chrome' }) }
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
await page.goto(`${base}/#/manage`)
await page.waitForTimeout(6000) // let the scene mount + lead poller fire
await page.screenshot({ path: `${out}/portal-manage.jpeg`, type: 'jpeg', quality: 85 })

// open the inbox dropdown
try {
  await page.click('text=◉ inbox')
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${out}/portal-inbox.jpeg`, type: 'jpeg', quality: 85 })
} catch (e) { console.log('inbox click failed:', e.message) }

// open Business HQ
try {
  await page.click('text=▤ business')
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${out}/portal-bizhq.jpeg`, type: 'jpeg', quality: 85 })
} catch (e) { console.log('biz click failed:', e.message) }

await browser.close()
console.log('done')
