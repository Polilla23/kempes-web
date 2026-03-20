-- Merge name and last_name into a single name column (only if both columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='name')
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='last_name')
    THEN
        UPDATE players SET name = name || ' ' || last_name;
        ALTER TABLE players DROP COLUMN last_name;
    END IF;
END $$;
