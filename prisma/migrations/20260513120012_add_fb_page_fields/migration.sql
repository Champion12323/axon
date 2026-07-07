-- AlterTable
ALTER TABLE "influencer_profiles" ADD COLUMN     "fbPageId" TEXT,
ADD COLUMN     "fbPageName" TEXT,
ADD COLUMN     "igAccessToken" TEXT,
ADD COLUMN     "igConnectedAt" TIMESTAMP(3),
ADD COLUMN     "igTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "igUserId" TEXT;
