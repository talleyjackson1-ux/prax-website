// Headless screenshot helper: node tools/shoot.mjs <outdir> [path] [prefix] [ys...]
import { chromium } from 'playwright'

const out = process.argv[2] ?? '.'
const path = process.argv[3] ?? '/concepts/gym/'
const prefix = process.argv[4] ?? 'shot'
const ys = process.argv.slice(5).map(Number)
const stops = ys.length ? ys : [0, 700, 1300]

let browser
try {
  browser = await chromium.launch()
} catch {
  browser = await chromium.launch({ channel: 'chrome' })
}
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } })
await page.goto(`http://localhost:5188${path}`)
await page.waitForTimeout(3200)

for (const y of stops) {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${out}/${prefix}-${y}.jpeg`, type: 'jpeg', quality: 88 })
}
await browser.close()
console.log('done')
