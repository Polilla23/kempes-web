-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "resetPasswordTokenExpires" TIMESTAMP(3);
