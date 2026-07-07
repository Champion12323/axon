import { Redis } from 'ioredis';

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD ?? undefined,
  maxRetriesPerRequest: null, // BullMQ requirement
  retryStrategy(times) {
    if (times > 3) {
      console.error('Redis: giving up after 3 retries');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redisConnection.on('connect', () => console.log('Redis connected'));
redisConnection.on('error', (err) => console.error('Redis error:', err.message));