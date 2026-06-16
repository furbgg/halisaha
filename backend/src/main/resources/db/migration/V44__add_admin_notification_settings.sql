-- Admin notification settings
INSERT INTO app_settings (key, value, description) VALUES
    ('admin_email', '', 'E-Mail-Adresse fuer Admin-Benachrichtigungen'),
    ('admin_daily_report_hour', '23', 'Uhrzeit fuer den taeglichen Bericht (0-23)')
ON CONFLICT (key) DO NOTHING;

-- Add read column to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

