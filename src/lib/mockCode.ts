/* Shared mock-code resolver — used by the /mocks gate page and the homepage
   "have a code?" popup. Codes resolve through a security-definer RPC so the
   public key can't enumerate the mock_codes table. */
export const SUPA_URL = 'https://goaquyufqhuedrrvrzom.supabase.co'
export const SUPA_KEY = 'sb_publishable_1TMdi3h3h4nJDETq950fkg_uMObwlI_'

export async function slugForCode(code: string): Promise<string | null> {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/rpc/mock_slug_for_code`, {
      method: 'POST',
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_code: code }),
    })
    const v = await r.json() as string | null
    return typeof v === 'string' && v ? v : null
  } catch { return null }
}
