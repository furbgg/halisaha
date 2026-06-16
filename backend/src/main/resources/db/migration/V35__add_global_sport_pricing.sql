-- Set default prices for Football and Bubble Soccer globally
INSERT INTO app_settings (key, value, description)
VALUES ('price_football', '80.00', 'Stundenpreis für Fußball')
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value, description)
VALUES ('price_bubble_soccer', '160.00', 'Stundenpreis für Bubble Soccer')
ON CONFLICT (key) DO NOTHING;
