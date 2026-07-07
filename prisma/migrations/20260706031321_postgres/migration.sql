/*
  Warnings:

  - Added the required column `updatedAt` to the `influencer_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('PAID_POST', 'STORY', 'REEL', 'YOUTUBE', 'TIKTOK', 'MULTI_PLATFORM');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'SHORTLISTED', 'REJECTED', 'HIRED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SENT', 'NEGOTIATING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_NEEDED', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('RAZORPAY', 'STRIPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('MILESTONE_PAYMENT', 'PLATFORM_FEE', 'REFUND');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MESSAGE', 'CAMPAIGN', 'CONTRACT', 'PAYMENT', 'SYSTEM', 'REVIEW');

-- CreateEnum
CREATE TYPE "ReviewerRole" AS ENUM ('BRAND', 'INFLUENCER');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "influencer_profiles" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "niches" TEXT[],
ADD COLUMN     "pricePerPost" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "rating" SET DEFAULT 0,
ALTER COLUMN "total_followers" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "avatarKey" TEXT,
ADD COLUMN     "averageRating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SavedInfluencer" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedInfluencer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "budgetMin" DOUBLE PRECISION NOT NULL,
    "budgetMax" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "minFollowers" INTEGER NOT NULL DEFAULT 1000,
    "maxFollowers" INTEGER,
    "platforms" TEXT[],
    "niche" TEXT[],
    "targetLocations" TEXT[],
    "minEngagementRate" DOUBLE PRECISION,
    "deliverables" TEXT NOT NULL,
    "contentGuidelines" TEXT,
    "hashtags" TEXT[],
    "brandMentions" TEXT[],
    "applicationDeadline" TIMESTAMP(3) NOT NULL,
    "campaignStartDate" TIMESTAMP(3) NOT NULL,
    "campaignEndDate" TIMESTAMP(3) NOT NULL,
    "briefFileUrl" TEXT,
    "sampleContentUrl" TEXT,
    "totalApplications" INTEGER NOT NULL DEFAULT 0,
    "totalHired" INTEGER NOT NULL DEFAULT 0,
    "maxInfluencers" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mediaUrl" TEXT,
    "mediaKey" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "proposedRate" DOUBLE PRECISION,
    "coverLetter" TEXT,
    "portfolioUrls" TEXT[],
    "brandNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "isFromInvite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "influencerPayout" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "revisionLimit" INTEGER NOT NULL DEFAULT 2,
    "contentRights" TEXT,
    "exclusivity" BOOLEAN NOT NULL DEFAULT false,
    "exclusivityDays" INTEGER,
    "negotiationNotes" TEXT,
    "brandResponse" TEXT,
    "brandSignedAt" TIMESTAMP(3),
    "influencerSignedAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancelReason" TEXT,
    "disputeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentUrl" TEXT,
    "documentKey" TEXT,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "submissionNote" TEXT,
    "submissionUrls" TEXT[],
    "submissionKeys" TEXT[],
    "reviewedAt" TIMESTAMP(3),
    "revisionNote" TEXT,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL DEFAULT 'MILESTONE_PAYMENT',
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "currency" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "influencerPayout" DOUBLE PRECISION NOT NULL,
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "providerSignature" TEXT,
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "payoutAt" TIMESTAMP(3),
    "refundId" TEXT,
    "refundReason" TEXT,
    "refundedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "fileName" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inAppMessage" BOOLEAN NOT NULL DEFAULT true,
    "inAppCampaign" BOOLEAN NOT NULL DEFAULT true,
    "inAppContract" BOOLEAN NOT NULL DEFAULT true,
    "inAppPayment" BOOLEAN NOT NULL DEFAULT true,
    "inAppSystem" BOOLEAN NOT NULL DEFAULT false,
    "emailDigest" BOOLEAN NOT NULL DEFAULT true,
    "emailPayment" BOOLEAN NOT NULL DEFAULT true,
    "emailContract" BOOLEAN NOT NULL DEFAULT true,
    "emailCampaign" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "reviewerRole" "ReviewerRole" NOT NULL,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignInvite" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtube_accounts" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "channelHandle" TEXT,
    "channelThumb" TEXT,
    "channelUrl" TEXT,
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "totalViews" BIGINT NOT NULL DEFAULT 0,
    "videoCount" INTEGER NOT NULL DEFAULT 0,
    "avgViewsPerVideo" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "youtube_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtube_videos" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "publishedAt" TIMESTAMP(3),
    "duration" TEXT,
    "viewCount" BIGINT NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedMinutesWatched" BIGINT NOT NULL DEFAULT 0,
    "averageViewDuration" INTEGER NOT NULL DEFAULT 0,
    "averageViewPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtube_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_youtube_videos" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "viewsAtTracking" BIGINT NOT NULL DEFAULT 0,
    "trackedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" TEXT,
    "userId" TEXT,

    CONSTRAINT "campaign_youtube_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencer_audits" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'PENDING',
    "triggeredBy" TEXT,
    "fakeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "authenticScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "platformResults" JSONB,
    "signals" JSONB,
    "verdict" TEXT,
    "flags" TEXT[],
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencer_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedInfluencer_brandId_idx" ON "SavedInfluencer"("brandId");

-- CreateIndex
CREATE INDEX "SavedInfluencer_influencerId_idx" ON "SavedInfluencer"("influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedInfluencer_brandId_influencerId_key" ON "SavedInfluencer"("brandId", "influencerId");

-- CreateIndex
CREATE INDEX "Campaign_brandId_idx" ON "Campaign"("brandId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_type_idx" ON "Campaign"("type");

-- CreateIndex
CREATE INDEX "Application_campaignId_idx" ON "Application"("campaignId");

-- CreateIndex
CREATE INDEX "Application_influencerId_idx" ON "Application"("influencerId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_campaignId_influencerId_key" ON "Application"("campaignId", "influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_applicationId_key" ON "Contract"("applicationId");

-- CreateIndex
CREATE INDEX "Contract_brandId_idx" ON "Contract"("brandId");

-- CreateIndex
CREATE INDEX "Contract_influencerId_idx" ON "Contract"("influencerId");

-- CreateIndex
CREATE INDEX "Contract_campaignId_idx" ON "Contract"("campaignId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Milestone_contractId_idx" ON "Milestone"("contractId");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_milestoneId_key" ON "Payment"("milestoneId");

-- CreateIndex
CREATE INDEX "Payment_contractId_idx" ON "Payment"("contractId");

-- CreateIndex
CREATE INDEX "Payment_brandId_idx" ON "Payment"("brandId");

-- CreateIndex
CREATE INDEX "Payment_influencerId_idx" ON "Payment"("influencerId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_brandId_influencerId_campaignId_key" ON "Conversation"("brandId", "influencerId", "campaignId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "Review_revieweeId_idx" ON "Review"("revieweeId");

-- CreateIndex
CREATE INDEX "Review_campaignId_idx" ON "Review"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_contractId_reviewerId_key" ON "Review"("contractId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "CampaignInvite_influencerId_idx" ON "CampaignInvite"("influencerId");

-- CreateIndex
CREATE INDEX "CampaignInvite_campaignId_idx" ON "CampaignInvite"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignInvite_campaignId_influencerId_key" ON "CampaignInvite"("campaignId", "influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_accounts_influencerId_key" ON "youtube_accounts"("influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_accounts_channelId_key" ON "youtube_accounts"("channelId");

-- CreateIndex
CREATE INDEX "youtube_accounts_influencerId_idx" ON "youtube_accounts"("influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_videos_videoId_key" ON "youtube_videos"("videoId");

-- CreateIndex
CREATE INDEX "youtube_videos_accountId_idx" ON "youtube_videos"("accountId");

-- CreateIndex
CREATE INDEX "youtube_videos_publishedAt_idx" ON "youtube_videos"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_youtube_videos_campaignId_videoId_key" ON "campaign_youtube_videos"("campaignId", "videoId");

-- CreateIndex
CREATE INDEX "influencer_audits_influencerId_idx" ON "influencer_audits"("influencerId");

-- CreateIndex
CREATE INDEX "influencer_audits_riskLevel_idx" ON "influencer_audits"("riskLevel");

-- CreateIndex
CREATE INDEX "influencer_audits_fakeScore_idx" ON "influencer_audits"("fakeScore");

-- AddForeignKey
ALTER TABLE "SavedInfluencer" ADD CONSTRAINT "SavedInfluencer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedInfluencer" ADD CONSTRAINT "SavedInfluencer_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "influencer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtube_accounts" ADD CONSTRAINT "youtube_accounts_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "youtube_videos" ADD CONSTRAINT "youtube_videos_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "youtube_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_youtube_videos" ADD CONSTRAINT "campaign_youtube_videos_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_youtube_videos" ADD CONSTRAINT "campaign_youtube_videos_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "youtube_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_youtube_videos" ADD CONSTRAINT "campaign_youtube_videos_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "youtube_videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_youtube_videos" ADD CONSTRAINT "campaign_youtube_videos_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_youtube_videos" ADD CONSTRAINT "campaign_youtube_videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencer_audits" ADD CONSTRAINT "influencer_audits_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
