/*
  Warnings:

  - The `overall` column on the `players` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "players" ALTER COLUMN "actual_club_id" SET DEFAULT 'null',
ALTER COLUMN "owner_club_id" SET DEFAULT 'null',
DROP COLUMN "overall",
ADD COLUMN     "overall" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "sofifa_id" SET DEFAULT 'null',
ALTER COLUMN "transfermarkt_id" SET DEFAULT 'null',
ALTER COLUMN "is_kempesita" SET DEFAULT false;
