/*
  Warnings:

  - You are about to drop the column `event` on the `LoginEvent` table. All the data in the column will be lost.
  - You are about to drop the column `ipHash` on the `LoginEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LoginEvent" DROP COLUMN "event",
DROP COLUMN "ipHash",
ADD COLUMN     "eventType" TEXT NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "userAgent" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "success" SET DEFAULT false;
