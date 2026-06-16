-- Remove legacy demo/seed data that should never stay in customer production DBs.
-- Safe and idempotent: running multiple times keeps the same end state.

-- Delete child rows first (FK-safe order).
DELETE FROM equipment_rentals er
USING reservations r
WHERE er.reservation_id = r.id
  AND (r.confirmation_code LIKE 'RES-%'
       OR r.confirmation_code LIKE 'T-%'
       OR r.confirmation_code LIKE 'M-%');

DELETE FROM notifications n
USING reservations r
WHERE n.reservation_id = r.id
  AND (r.confirmation_code LIKE 'RES-%'
       OR r.confirmation_code LIKE 'T-%'
       OR r.confirmation_code LIKE 'M-%');

DELETE FROM payments p
USING reservations r
WHERE p.reservation_id = r.id
  AND (r.confirmation_code LIKE 'RES-%'
       OR r.confirmation_code LIKE 'T-%'
       OR r.confirmation_code LIKE 'M-%');

DELETE FROM reservations
WHERE confirmation_code LIKE 'RES-%'
   OR confirmation_code LIKE 'T-%'
   OR confirmation_code LIKE 'M-%';

-- Remove known demo/admin seed users from early migrations.
UPDATE audit_log
SET user_id = NULL
WHERE user_id IN (
    SELECT id
    FROM users
    WHERE display_id IN ('HS-2025-001', 'HS-2025-010', 'HS-2025-011', 'HS-2025-012', 'HS-2025-013', 'HS-2025-014', 'HS-2025-015')
       OR lower(email) IN (
           'admin@halisaha.at',
           'ali.karagoz@gmail.com',
           'emre.demir@hotmail.com',
           'stefan.gruber@gmx.at',
           'mehmet.yildiz@outlook.at',
           'markus.bauer@a1.net',
           'hasan.ozkan@icloud.com'
       )
);

DELETE FROM users
WHERE display_id IN ('HS-2025-001', 'HS-2025-010', 'HS-2025-011', 'HS-2025-012', 'HS-2025-013', 'HS-2025-014', 'HS-2025-015')
   OR lower(email) IN (
       'admin@halisaha.at',
       'ali.karagoz@gmail.com',
       'emre.demir@hotmail.com',
       'stefan.gruber@gmx.at',
       'mehmet.yildiz@outlook.at',
       'markus.bauer@a1.net',
       'hasan.ozkan@icloud.com'
   );

-- Performance index for stale-pending cleanup job.
CREATE INDEX IF NOT EXISTS idx_reservations_pending_cleanup
    ON reservations(status, payment_status, created_at);
