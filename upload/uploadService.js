import prisma from '../config/prisma.js';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { r2Client, BUCKET, PUBLIC_URL, UPLOAD_CONFIGS } from './uploadConfig.js';

function badRequest(msg) { return Object.assign(new Error(msg), { statusCode: 400 }); }
function notFound(msg)   { return Object.assign(new Error(msg), { statusCode: 404 }); }

// ─────────────────────────────────────────────
// GENERATE PRESIGNED URL
// Frontend isko call karega → R2 pe directly upload karega
// ─────────────────────────────────────────────

export async function getPresignedUploadUrl({ uploadType, fileName, contentType, userId }) {
  const config = UPLOAD_CONFIGS[uploadType];
  if (!config) throw badRequest(`Invalid upload type: ${uploadType}`);

  // Content type validate karo
  if (!config.allowedTypes.includes(contentType)) {
    throw badRequest(
      `File type "${contentType}" not allowed for ${uploadType}. ` +
      `Allowed: ${config.allowedTypes.join(', ')}`
    );
  }

  // Unique key generate karo
  const ext      = fileName.split('.').pop().toLowerCase();
  const key      = `${config.folder}/${userId}/${uuid()}.${ext}`;
  const publicUrl = `${PUBLIC_URL}/${key}`;

  // Presigned PUT URL — 5 min valid
  const command = new PutObjectCommand({
    Bucket:        BUCKET,
    Key:           key,
    ContentType:   contentType,
    ContentLength: config.maxSizeMB * 1024 * 1024, // max size hint
    Metadata: {
      userId,
      uploadType,
      originalName: encodeURIComponent(fileName),
    },
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

  return {
    uploadUrl,   // Frontend isko use karega PUT request ke liye
    publicUrl,   // DB mein save karo — final file URL
    key,         // Delete karne ke liye store karo
    expiresIn:   300,
  };
}

// ─────────────────────────────────────────────
// DELETE FILE
// ─────────────────────────────────────────────

export async function deleteFile(key) {
  if (!key) throw badRequest('File key is required');

  await r2Client.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key:    key,
  }));

  return { deleted: true };
}

// ─────────────────────────────────────────────
// CONFIRM UPLOAD + SAVE TO DB
// Frontend upload ke baad yeh call karega
// ─────────────────────────────────────────────


export async function confirmUpload({ uploadType, publicUrl, key, meta, userId }) {
  switch (uploadType) {

    case 'avatar': {
      // Old avatar delete karo
      const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { avatar: true, avatarKey: true },
      });
      if (user?.avatarKey) {
        await deleteFile(user.avatarKey).catch(() => {}); // silent fail
      }

      return prisma.user.update({
        where: { id: userId },
        data:  { avatar: publicUrl, avatarKey: key },
        select: { id: true, avatar: true },
      });
    }

    case 'campaign_media': {
      const { campaignId } = meta;
      if (!campaignId) throw badRequest('campaignId required for campaign_media');

      // Verify ownership
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) throw notFound('Campaign not found');
      if (campaign.brandId !== userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });

      return prisma.campaign.update({
        where: { id: campaignId },
        data:  { mediaUrl: publicUrl, mediaKey: key },
        select: { id: true, mediaUrl: true },
      });
    }

    case 'milestone_submission': {
      const { milestoneId } = meta;
      if (!milestoneId) throw badRequest('milestoneId required for milestone_submission');

      // Append to existing submission URLs
      const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
      if (!milestone) throw notFound('Milestone not found');

      return prisma.milestone.update({
        where: { id: milestoneId },
        data:  {
          submissionUrls: {
            push: publicUrl,
          },
          submissionKeys: {
            push: key,
          },
        },
        select: { id: true, submissionUrls: true },
      });
    }

    case 'contract_doc': {
      const { contractId } = meta;
      if (!contractId) throw badRequest('contractId required for contract_doc');

      const contract = await prisma.contract.findUnique({ where: { id: contractId } });
      if (!contract) throw notFound('Contract not found');
      if (contract.brandId !== userId && contract.influencerId !== userId) {
        throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
      }

      return prisma.contract.update({
        where: { id: contractId },
        data:  { documentUrl: publicUrl, documentKey: key },
        select: { id: true, documentUrl: true },
      });
    }

    default:
      throw badRequest(`Unknown uploadType: ${uploadType}`);
  }
}