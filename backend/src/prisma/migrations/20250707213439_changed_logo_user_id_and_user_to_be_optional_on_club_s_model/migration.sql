/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `clubs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "logo" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "players" ALTER COLUMN "sofifa_id" DROP NOT NULL,
ALTER COLUMN "transfermarkt_id" DROP NOT NULL,
ALTER COLUMN "overall" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clubs_user_id_key" ON "clubs"("user_id");
