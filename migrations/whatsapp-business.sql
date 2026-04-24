-- WhatsApp Business API credentials stored per business in messaging_settings
ALTER TABLE messaging_settings
  ADD COLUMN IF NOT EXISTS whatsapp_connected         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_access_token      TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id   TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_waba_id           TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_phone_number      TEXT;
