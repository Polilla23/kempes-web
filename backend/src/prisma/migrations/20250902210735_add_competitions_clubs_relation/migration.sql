-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDIENTE', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "CompetitionFormat" AS ENUM ('LEAGUE', 'CUP');

-- CreateEnum
CREATE TYPE "CompetitionStage" AS ENUM ('ROUND_ROBIN', 'KNOCKOUT');

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "system" "CompetitionStage" NOT NULL,
    "seasonId" TEXT NOT NULL,
    "competitionTypeId" TEXT NOT NULL,
    "parentCompetitionId" TEXT,
    "rules" JSONB NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" "CompetitionFormat" NOT NULL,

    CONSTRAINT "CompetitionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "matchdayOrder" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDIENTE',
    "homeClubId" TEXT,
    "awayClubId" TEXT,
    "homePlaceholder" TEXT,
    "awayPlaceHolder" TEXT,
    "homeClubGoals" INTEGER NOT NULL DEFAULT 0,
    "awayClubGoals" INTEGER NOT NULL DEFAULT 0,
    "competitionId" TEXT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompetitionTeams" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompetitionTeams_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_number_key" ON "Season"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_parentCompetitionId_key" ON "Competition"("parentCompetitionId");

-- CreateIndex
CREATE INDEX "_CompetitionTeams_B_index" ON "_CompetitionTeams"("B");

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_parentCompetitionId_fkey" FOREIGN KEY ("parentCompetitionId") REFERENCES "Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_competitionTypeId_fkey" FOREIGN KEY ("competitionTypeId") REFERENCES "CompetitionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeClubId_fkey" FOREIGN KEY ("homeClubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayClubId_fkey" FOREIGN KEY ("awayClubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionTeams" ADD CONSTRAINT "_CompetitionTeams_A_fkey" FOREIGN KEY ("A") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionTeams" ADD CONSTRAINT "_CompetitionTeams_B_fkey" FOREIGN KEY ("B") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
