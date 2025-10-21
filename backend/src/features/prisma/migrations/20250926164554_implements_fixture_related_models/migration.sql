/*
  Warnings:

  - Added the required column `category` to the `CompetitionType` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `CompetitionType` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CompetitionCategory" AS ENUM ('SENIOR', 'KEMPESITA');

-- CreateEnum
CREATE TYPE "CompetitionName" AS ENUM ('LEAGUE_A', 'LEAGUE_B', 'LEAGUE_C', 'LEAGUE_D', 'LEAGUE_E', 'KEMPES_CUP', 'GOLD_CUP', 'SILVER_CUP', 'CINDOR_CUP', 'SUPER_CUP');

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "CompetitionType" ADD COLUMN     "category" "CompetitionCategory" NOT NULL,
DROP COLUMN "name",
ADD COLUMN     "name" "CompetitionName" NOT NULL;
