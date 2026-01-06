/*
  Warnings:

  - Added the required column `jerarquy` to the `CompetitionType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompetitionType" ADD COLUMN     "jerarquy" INTEGER NOT NULL;
