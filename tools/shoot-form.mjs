// /start overhaul check: Auto trade → trade-tuned chips (step 2), swatches +
// notes (step 4), intro shell. node tools/shoot-form.mjs <outdir>
import { chromium } from 'playwright'

const out = process.argv[2] ?? '.'
let browser
try { browser = await chromium.launch() } catch { browser = await chromium.launch({ channel: 'chrome' }) }
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5188/start/')
await page.waitForTimeout(1200)
await page.evaluate(() => localStorage.removeItem('prax_start_draft'))
await page.reload(); await page.waitForTimeout(1000)
await page.screenshot({ path: `${out}/startform-intro.jpeg`, type: 'jpeg', quality: 90 })

await page.fill('input[placeholder="Summit Air"]', 'Summit Auto Services LLC')
await page.selectOption('select', 'Auto')
await page.fill('input[placeholder="(816) 555-0142"]', '(913) 689-8749')
await page.fill('input[placeholder="Kansas City, MO"]', "Lee's Summit, MO")
await page.click('text=Continue — 2 more minutes')
await page.waitForTimeout(400)

// trade-tuned preset + a custom write-in
await page.click('.sf-chips >> text=Collision repair')
await page.click('.sf-chips >> text=Body & dent work')
const custom = page.locator('.sf-addchip input').first()
await custom.fill('Classic car restoration')
await custom.press('Enter')
await page.waitForTimeout(400)
await page.screenshot({ path: `${out}/startform-step2.jpeg`, type: 'jpeg', quality: 90 })

await page.click('text=Next'); await page.waitForTimeout(300)
await page.click('text=Next'); await page.waitForTimeout(300)
await page.click('.sf-chips >> text=Clean & light')
await page.fill('textarea', 'Owner wants his 1969 Chevelle project car featured on the site.')
await page.waitForTimeout(300)
await page.screenshot({ path: `${out}/startform-step4.jpeg`, type: 'jpeg', quality: 90 })
await browser.close()
console.log('done')
