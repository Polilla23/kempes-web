/*
  Warnings:

  - Added the required column `stage` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "away_source_match_id" TEXT,
ADD COLUMN     "away_source_position" TEXT,
ADD COLUMN     "home_source_match_id" TEXT,
ADD COLUMN     "home_source_position" TEXT,
ADD COLUMN     "stage" "CompetitionStage" NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_home_source_match_id_fkey" FOREIGN KEY ("home_source_match_id") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_away_source_match_id_fkey" FOREIGN KEY ("away_source_match_id") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
