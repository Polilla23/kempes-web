/*
  Warnings:

  - You are about to drop the column `userId` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordTokenExpires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationTokenExpires` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verification_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reset_password_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `clubs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "clubs" DROP CONSTRAINT "clubs_userId_fkey";

-- DropIndex
DROP INDEX "clubs_userId_idx";

-- DropIndex
DROP INDEX "users_resetPasswordToken_key";

-- DropIndex
DROP INDEX "users_verificationToken_key";

-- AlterTable
ALTER TABLE "clubs" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isVerified",
DROP COLUMN "resetPasswordToken",
DROP COLUMN "resetPasswordTokenExpires",
DROP COLUMN "verificationToken",
DROP COLUMN "verificationTokenExpires",
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reset_password_token" TEXT,
ADD COLUMN     "reset_password_token_expires" TIMESTAMP(3),
ADD COLUMN     "verification_token" TEXT,
ADD COLUMN     "verification_token_expires" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "actual_club_id" TEXT NOT NULL,
    "owner_club_id" TEXT NOT NULL,
    "overall" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "sofifa_id" TEXT NOT NULL,
    "transfermarkt_id" TEXT NOT NULL,
    "is_kempesita" BOOLEAN NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clubs_user_id_idx" ON "clubs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_reset_password_token_key" ON "users"("reset_password_token");

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_actual_club_id_fkey" FOREIGN KEY ("actual_club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_owner_club_id_fkey" FOREIGN KEY ("owner_club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
