-- Rename player name column to full_name (only if name exists and full_name does not yet)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='name')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='full_name')
    THEN
        ALTER TABLE players RENAME COLUMN name TO full_name;
    END IF;
END $$;
