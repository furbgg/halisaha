-- Coupons (Gutscheine) table
CREATE TABLE coupons (
    id               BIGSERIAL PRIMARY KEY,
    code             VARCHAR(50) UNIQUE NOT NULL,
    discount_type    VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
    discount_value   DECIMAL(10,2) NOT NULL,
    max_uses         INT NOT NULL DEFAULT 0,
    current_uses     INT NOT NULL DEFAULT 0,
    min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    valid_from       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    valid_until      TIMESTAMP WITH TIME ZONE NOT NULL,
    active           BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add coupon tracking to reservations
ALTER TABLE reservations ADD COLUMN coupon_code VARCHAR(50);
ALTER TABLE reservations ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
