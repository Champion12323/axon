import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export const BUCKET = process.env.CLOUDFLARE_R2_BUCKET;
export const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

// File type configs
export const UPLOAD_CONFIGS = {
  avatar: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB:    5,
    folder:       'avatars',
  },
  campaign_media: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSizeMB:    10,
    folder:       'campaigns',
  },
  milestone_submission: {
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/quicktime',
      'application/pdf',
    ],
    maxSizeMB:    100,
    folder:       'submissions',
  },
  contract_doc: {
    allowedTypes: ['application/pdf'],
    maxSizeMB:    10,
    folder:       'contracts',
  },
};