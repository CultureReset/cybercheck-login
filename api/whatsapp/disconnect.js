const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mhafixflyffflwjhcgfn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { site_id } = req.body || {};
  if (!site_id) return res.status(400).json({ error: 'Missing site_id' });

  await fetch(`${SUPABASE_URL}/rest/v1/messaging_settings?site_id=eq.${encodeURIComponent(site_id)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      whatsapp_connected: false,
      whatsapp_access_token: null,
      whatsapp_phone_number_id: null,
      whatsapp_waba_id: null,
      whatsapp_phone_number: null,
      updated_at: new Date().toISOString()
    })
  });

  res.json({ success: true });
};
