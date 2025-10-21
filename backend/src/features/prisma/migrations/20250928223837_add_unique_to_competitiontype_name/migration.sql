/*
  Warnings:

  - You are about to drop the column `jerarquy` on the `CompetitionType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `CompetitionType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hierarchy` to the `CompetitionType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompetitionType" DROP COLUMN "jerarquy",
ADD COLUMN     "hierarchy" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionType_name_key" ON "CompetitionType"("name");
