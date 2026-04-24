// Exchange Meta short-lived code → long-lived token, store WABA credentials in Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mhafixflyffflwjhcgfn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function sbPost(table, payload) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  });
  return r.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, site_id } = req.body || {};
  if (!code || !site_id) return res.status(400).json({ error: 'Missing code or site_id' });

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return res.status(500).json({ error: 'META_APP_ID / META_APP_SECRET not configured' });

  // Exchange short-lived code for access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`
  ).then(r => r.json());

  if (!tokenRes.access_token) {
    return res.status(400).json({ error: 'Token exchange failed', detail: tokenRes });
  }

  // Get long-lived token
  const llRes = await fetch(
    `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenRes.access_token}`
  ).then(r => r.json());

  const accessToken = llRes.access_token || tokenRes.access_token;

  // Fetch WhatsApp Business Accounts
  const wabaRes = await fetch(
    `https://graph.facebook.com/v21.0/me/businesses?fields=name,id&access_token=${accessToken}`
  ).then(r => r.json());

  let phoneNumberId = '';
  let wabaId = '';
  let wabaPhone = '';

  if (wabaRes.data && wabaRes.data.length > 0) {
    // Try each business account for a WABA with phone numbers
    for (const biz of wabaRes.data) {
      const waRes = await fetch(
        `https://graph.facebook.com/v21.0/${biz.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
      ).then(r => r.json());

      if (waRes.data && waRes.data.length > 0) {
        wabaId = waRes.data[0].id;
        const pnRes = await fetch(
          `https://graph.facebook.com/v21.0/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name&access_token=${accessToken}`
        ).then(r => r.json());

        if (pnRes.data && pnRes.data.length > 0) {
          phoneNumberId = pnRes.data[0].id;
          wabaPhone = pnRes.data[0].display_phone_number || '';
          break;
        }
      }
    }
  }

  await sbPost('messaging_settings', {
    site_id,
    whatsapp_connected: true,
    whatsapp_access_token: accessToken,
    whatsapp_phone_number_id: phoneNumberId,
    whatsapp_waba_id: wabaId,
    whatsapp_phone_number: wabaPhone,
    whatsapp_api_key: null,
    updated_at: new Date().toISOString()
  });

  return res.json({ success: true, phone_number: wabaPhone, waba_id: wabaId });
};
