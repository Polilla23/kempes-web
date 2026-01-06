-- Create EventTypeName enum
DO $$ BEGIN
    CREATE TYPE "EventTypeName" AS ENUM ('GOAL', 'YELLOW_CARD', 'RED_CARD', 'INJURY', 'MVP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create event_types table
CREATE TABLE IF NOT EXISTS "event_types" (
    "id" TEXT NOT NULL,
    "name" "EventTypeName" NOT NULL,
    "display_name" TEXT NOT NULL,
    "icon" TEXT DEFAULT '⚽',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- Create unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS "event_types_name_key" ON "event_types"("name");

-- Add foreign key to Event table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "Event" ADD CONSTRAINT "Event_typeId_fkey" 
    FOREIGN KEY ("typeId") REFERENCES "event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

