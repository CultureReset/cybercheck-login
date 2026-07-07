const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mkepugvdlktfsossumox.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const site_id = req.query.site_id;
  if (!site_id) return res.status(400).json({ error: 'Missing site_id' });

  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/messaging_settings?site_id=eq.${encodeURIComponent(site_id)}&select=whatsapp_connected,whatsapp_phone_number,whatsapp_waba_id,whatsapp_phone_number_id`,
    { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY } }
  );
  const rows = await r.json();
  const data = Array.isArray(rows) ? rows[0] : null;

  res.json({
    connected: !!(data && data.whatsapp_connected),
    phone_number: (data && data.whatsapp_phone_number) || '',
    waba_id: (data && data.whatsapp_waba_id) || '',
    phone_number_id: (data && data.whatsapp_phone_number_id) || ''
  });
};
