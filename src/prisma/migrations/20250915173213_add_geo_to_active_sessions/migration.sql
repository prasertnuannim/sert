-- CreateTable
CREATE TABLE "ActiveSession" (
    "jti" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "lastGeoAt" TIMESTAMP(3),

    CONSTRAINT "ActiveSession_pkey" PRIMARY KEY ("jti")
);

-- CreateTable
CREATE TABLE "GeoIpCache" (
    "ip" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeoIpCache_pkey" PRIMARY KEY ("ip")
);

-- CreateIndex
CREATE INDEX "ActiveSession_userId_lastSeenAt_idx" ON "ActiveSession"("userId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "ActiveSession_ip_idx" ON "ActiveSession"("ip");

-- AddForeignKey
ALTER TABLE "ActiveSession" ADD CONSTRAINT "ActiveSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
