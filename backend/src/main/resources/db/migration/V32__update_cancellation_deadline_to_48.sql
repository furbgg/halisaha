-- Fix: cancellation deadline was seeded as 2 hours, should be 48 hours
UPDATE app_settings SET value = '48' WHERE key = 'cancellation_deadline_hours' AND value = '2';
