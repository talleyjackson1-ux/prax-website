// Fill step 1 of /start/, advance to step 2, add a custom chip, screenshot.
import { chromium } from 'playwright'

const out = process.argv[2] ?? '.'
let browser
try { browser = await chromium.launch() } catch { browser = await chromium.launch({ channel: 'chrome' }) }
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5188/start/')
await page.waitForTimeout(1200)

await page.fill('input[placeholder="Summit Air"]', 'Buckner Bros HVAC')
await page.selectOption('select', 'HVAC')
await page.fill('input[placeholder="(816) 555-0142"]', '(816) 555-9821')
await page.fill('input[placeholder="Kansas City, MO"]', 'Blue Springs, MO')
await page.click('text=Continue — 2 more minutes')
await page.waitForTimeout(400)

// preset chip + a custom write-in
await page.click('.sf-chips >> text=Emergency service')
const custom = page.locator('.sf-addchip input').first()
await custom.fill('We answer on the first ring')
await custom.press('Enter')
await page.waitForTimeout(400)
await page.screenshot({ path: `${out}/startform-step2.jpeg`, type: 'jpeg', quality: 90 })
await browser.close()
console.log('done')
