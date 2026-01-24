-- Fix CompetitionType format for GOLD_CUP and KEMPES_CUP
-- These were incorrectly set to 'LEAGUE' instead of 'CUP'

-- 1. Fix GOLD_CUP format
UPDATE "CompetitionType"
SET format = 'CUP'
WHERE name = 'GOLD_CUP' AND format = 'LEAGUE';

-- 2. Fix KEMPES_CUP format
UPDATE "CompetitionType"
SET format = 'CUP'
WHERE name = 'KEMPES_CUP' AND format = 'LEAGUE';

-- 3. Fix "Copa Kempes - Fase de Grupos" to use KEMPES_CUP instead of SILVER_CUP
-- First, get the KEMPES_CUP id and update the competition
UPDATE "Competition"
SET "competitionTypeId" = (
    SELECT id FROM "CompetitionType" WHERE name = 'KEMPES_CUP' LIMIT 1
)
WHERE name LIKE 'Copa Kempes - Fase de Grupos%';

-- 4. Fix SUPER_CUP category from SENIOR to MIXED
-- The Supercopa is a mixed competition (both Mayores and Kempesitas can participate)
UPDATE "CompetitionType"
SET category = 'MIXED'
WHERE name = 'SUPER_CUP' AND category = 'SENIOR';

-- Verify the changes
SELECT id, name, format, category FROM "CompetitionType" WHERE name IN ('GOLD_CUP', 'KEMPES_CUP', 'SILVER_CUP', 'SUPER_CUP');
SELECT id, name, "competitionTypeId" FROM "Competition";
