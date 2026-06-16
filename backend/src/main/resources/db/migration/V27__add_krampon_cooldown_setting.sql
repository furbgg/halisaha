-- Krampon cooldown: kramponlar kiralama bitisinden X saat sonra tekrar aktif olur
INSERT INTO app_settings (key, value, description) VALUES
    ('krampon_cooldown_hours', '2', 'Krampon nach Rückgabe X Stunden Abkühlzeit bevor wieder verfügbar');
