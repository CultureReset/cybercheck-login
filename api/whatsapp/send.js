// Send a WhatsApp notification using the business's connected WABA credentials.
// Tries free-form text first; falls back to hello_world template outside 24h window.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xbptmkpbiqzvxptjkfoi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { site_id, to_phone, message } = req.body || {};
  if (!site_id || !to_phone || !message) return res.status(400).json({ error: 'Missing site_id, to_phone, or message' });

  // Fetch WABA credentials from Supabase
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/messaging_settings?site_id=eq.${encodeURIComponent(site_id)}&select=whatsapp_access_token,whatsapp_phone_number_id,whatsapp_connected,notification_phone`,
    { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY } }
  );
  const rows = await r.json();
  const creds = Array.isArray(rows) ? rows[0] : null;

  if (!creds || !creds.whatsapp_connected || !creds.whatsapp_access_token || !creds.whatsapp_phone_number_id) {
    return res.status(400).json({ error: 'WhatsApp not connected for this site' });
  }

  // Use provided to_phone or fall back to the notification number stored on file (e.g. the 601 number for CircleBoat)
  const destPhone = (to_phone || creds.notification_phone || '').replace(/[^\d]/g, '');
  if (!destPhone) return res.status(400).json({ error: 'No destination phone — set a notification number in dashboard' });
  const e164 = destPhone.length === 10 ? '1' + destPhone : destPhone;

  const sendMsg = async (payload) => {
    const resp = await fetch(`https://graph.facebook.com/v21.0/${creds.whatsapp_phone_number_id}/messages`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + creds.whatsapp_access_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return resp.json();
  };

  // Try free-form text first
  let result = await sendMsg({
    messaging_product: 'whatsapp',
    to: e164,
    type: 'text',
    text: { body: message, preview_url: false }
  });

  if (result.error) {
    // Outside 24h session — fall back to hello_world template
    result = await sendMsg({
      messaging_product: 'whatsapp',
      to: e164,
      type: 'template',
      template: { name: 'hello_world', language: { code: 'en_US' } }
    });
  }

  return result.error ? res.status(400).json({ error: result.error }) : res.json({ success: true });
};
