/*
  Warnings:

  - You are about to drop the column `awayPlaceHolder` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "awayPlaceHolder",
ADD COLUMN     "awayPlaceholder" TEXT;
