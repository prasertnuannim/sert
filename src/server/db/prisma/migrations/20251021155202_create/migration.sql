/*
  Warnings:

  - You are about to drop the column `timestamp` on the `LoginEvent` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LoginEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LoginEvent" DROP COLUMN "timestamp",
DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "event" TEXT,
ALTER COLUMN "ipHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);
