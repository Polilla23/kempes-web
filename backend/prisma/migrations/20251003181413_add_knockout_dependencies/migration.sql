-- CreateIndex
CREATE INDEX "Match_competitionId_idx" ON "Match"("competitionId");

-- CreateIndex
CREATE INDEX "Match_home_source_match_id_idx" ON "Match"("home_source_match_id");

-- CreateIndex
CREATE INDEX "Match_away_source_match_id_idx" ON "Match"("away_source_match_id");
