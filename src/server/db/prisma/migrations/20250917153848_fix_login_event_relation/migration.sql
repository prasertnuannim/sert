-- CreateEnum
CREATE TYPE "LoginAction" AS ENUM ('SIGNIN', 'SIGNOUT', 'ATTEMPT');

-- AlterTable
ALTER TABLE "LoginEvent" ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "action" "LoginAction" NOT NULL DEFAULT 'SIGNIN',
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AddForeignKey
ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
