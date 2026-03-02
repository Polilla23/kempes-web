-- Merge name and last_name into a single name column
UPDATE players SET name = name || ' ' || last_name;

-- Drop the last_name column
ALTER TABLE "players" DROP COLUMN "last_name";
