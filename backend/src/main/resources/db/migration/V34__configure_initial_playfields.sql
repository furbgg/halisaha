-- Update Field 1 to be PLATZ 1 and support both FOOTBALL and BUBBLE_SOCCER
UPDATE fields 
SET 
    name = 'PLATZ 1',
    supported_sports = ARRAY['FOOTBALL', 'BUBBLE_SOCCER']::character varying[],
    updated_at = NOW()
WHERE id = 1;

-- Update Field 5 to be PLATZ 2 and support both FOOTBALL and BUBBLE_SOCCER
UPDATE fields 
SET 
    name = 'PLATZ 2',
    supported_sports = ARRAY['FOOTBALL', 'BUBBLE_SOCCER']::character varying[],
    updated_at = NOW()
WHERE id = 5;
