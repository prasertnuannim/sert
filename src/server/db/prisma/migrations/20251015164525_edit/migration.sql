/*
  Warnings:

  - You are about to drop the `ActiveSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GeoIpCache` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoginEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActiveSession" DROP CONSTRAINT "ActiveSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "LoginEvent" DROP CONSTRAINT "LoginEvent_userId_fkey";

-- DropTable
DROP TABLE "ActiveSession";

-- DropTable
DROP TABLE "GeoIpCache";

-- DropTable
DROP TABLE "LoginEvent";

-- DropEnum
DROP TYPE "LoginAction";
