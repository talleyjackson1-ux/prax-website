import { chromium } from 'playwright'
const out = process.argv[2] ?? '.'
let browser
try { browser = await chromium.launch() } catch { browser = await chromium.launch({ channel: 'chrome' }) }
const page = await browser.newPage({ viewport: { width: 1912, height: 961 } })
await page.goto('http://localhost:5188/mock/summit-auto-services/')
await page.waitForTimeout(3200)
for (const y of [0, 900, 1500, 2100, 2700]) {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${out}/jv-${y}.jpeg`, type: 'jpeg', quality: 86 })
}
await browser.close()
console.log('done')
