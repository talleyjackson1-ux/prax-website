// Sync the built APA site (../apa-website) into the SDM marketing site's mock
// preview (summit-design-mgmt/web/public/mock/apa) so Jackson can review it with
// clients inside the SDM ecosystem. The preview is flagged noindex (the real
// site at apadigitalmarketing.com is the indexable canonical). Runs after
// `build:apa`.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url)) // .../prax-website/apa-site
const projects = path.resolve(here, '../../')             // .../Projects
const SRC = path.join(projects, 'apa-website')
const DST = path.join(projects, 'summit-design-mgmt', 'web', 'public', 'mock', 'apa')

if (!fs.existsSync(path.join(SRC, 'index.html'))) {
  console.error('sync-mock: build output missing at', SRC, '— run build:apa first')
  process.exit(1)
}

fs.mkdirSync(DST, { recursive: true })
// refresh assets + img (remove stale hashed files first)
fs.rmSync(path.join(DST, 'assets'), { recursive: true, force: true })
fs.cpSync(path.join(SRC, 'assets'), path.join(DST, 'assets'), { recursive: true })
fs.cpSync(path.join(SRC, 'img'), path.join(DST, 'img'), { recursive: true })

// index.html with robots flipped to noindex (preview, not the canonical site)
let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8')
html = html.replace(
  '<meta name="robots" content="index, follow, max-image-preview:large" />',
  '<meta name="robots" content="noindex, nofollow" />',
)
fs.writeFileSync(path.join(DST, 'index.html'), html)

console.log('sync-mock: refreshed SDM preview →', DST)
