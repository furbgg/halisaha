-- V25: Saha fiyatlarini guncelle
-- Futbol: 80 EUR/Stunde, Bubble Soccer: 160 EUR/Stunde

UPDATE fields SET hourly_price = 80.00 WHERE type = 'FOOTBALL';
UPDATE fields SET hourly_price = 160.00 WHERE type = 'BUBBLE';
