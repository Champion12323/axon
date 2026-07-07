import { Queue } from 'bullmq';
import { redisConnection } from '../../config/redis.js';

export const campaignQueue = new Queue('campaign-jobs', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts:    3,
    backoff: {
      type:  'exponential',
      delay: 5000,           // 5s, 10s, 20s
    },
    removeOnComplete: { count: 100 },  // last 100 completed jobs rakho
    removeOnFail:     { count: 50  },  // last 50 failed jobs rakho
  },
});

// Job types
export const JOB_TYPES = {
  CLOSE_DEADLINE_CAMPAIGNS:  'close-deadline-campaigns',
  COMPLETE_ENDED_CAMPAIGNS:  'complete-ended-campaigns',
  NOTIFY_TOKEN_EXPIRY:       'notify-token-expiry',
  CANCEL_EXPIRED_INVITES:    'cancel-expired-invites',
};