// Headless screenshot helper: node tools/shoot.mjs <outdir>
import { chromium } from 'playwright'

const out = process.argv[2] ?? '.'
let browser
try {
  browser = await chromium.launch()
} catch {
  browser = await chromium.launch({ channel: 'chrome' })
}
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } })
await page.goto('http://localhost:5188/concepts/gym/')
await page.waitForTimeout(3200)

const shot = async (y, name) => {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${out}/${name}`, type: 'jpeg', quality: 90 })
}
await shot(0, 'v10-open.jpeg')
await shot(700, 'v10-midrot.jpeg')
await shot(1300, 'v10-profile.jpeg')
await browser.close()
console.log('done')
