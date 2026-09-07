// ============================================================================
// STALE — THIS IS NOT THE SOURCE OF THE LIVE APA SITE. (audit note, 2026-09-07)
//
// The live apadigitalmarketing.com is built from `summit-design-mgmt/web` with
// VITE_BRAND=apa and deployed by the Vercel project `summit-design-mgmt`. This
// directory is a SECOND, older copy of the same site, and `npm run build:apa`
// from the repo root compiles it over `../apa-website/`.
//
// The Supabase ref below is the OLD, PRE-CUTOVER project. The APA app moved to
// `ldsddiotiabsnlbtnjzu` on 2026-09-05. Building and deploying this would send
// every estimate-form lead into the rollback database, silently: the form would
// confirm, the row would be written, and nobody would ever see the lead.
//
// NOTE: this repository is PUBLIC. The key below is an `anon` key, which is
// public by design and cannot read anything back (RLS returns zero rows) — but
// it CAN insert, so it is also a spam vector into that old database.
//
// Whether this duplicate should exist at all is an open decision; see
// design/GUIDE.md in summit-design-mgmt. Do not "fix" it by swapping the ref —
// that would make a second live path to production, which is the actual problem.
// ============================================================================
/**
 * APA Digital Marketing Group — single source of truth for contact + wiring.
 * The site is public (apadigitalmarketing.com); these values are safe to ship.
 */
export const PHONE = ''; // no public phone yet — email is the contact channel
export const EMAIL = 'contact@apadigitalmarketing.com';
export const MAILTO_HREF = `mailto:${EMAIL}`;
export const INSTAGRAM = 'https://www.instagram.com/apadigitalmarketinggroup/';

/**
 * Optional email copy of each submission (Web3Forms / Formspree / Basin).
 * SCAFFOLDED, OFF by default: the form posts to the APA app (Supabase) regardless.
 * When Parker wants an email copy too, drop the endpoint URL here and rebuild —
 * the form will POST the same payload to it best-effort. Nothing else changes.
 */
export const FORM_ENDPOINT = '';

// SDM Supabase project (shared) — inbound estimate requests land in `apa_inbound`
// (insert-only RLS; the anon key is public by design, nobody can read leads back).
export const SUPABASE_URL = 'https://yjclksdawbigkowtjhmj.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY2xrc2Rhd2JpZ2tvd3RqaG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMDIwOTksImV4cCI6MjA5OTg3ODA5OX0.iuZagTOSDuZS39LT_MMUjWUF2TSZvmRfzGtFyMWJEkM';

export const OWNERS = 'Alex Keeting and Parker Katamura';
export const LOCATION = "Lee's Summit, Missouri";
