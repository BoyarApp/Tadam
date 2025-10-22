import Redis from 'ioredis';

let client: Redis | null = null;

const createRedisClient = (strapi: any) => {
  const host = process.env.REDIS_HOST;
  if (!host) {
    return null;
  }

  if (client) {
    return client;
  }

  try {
    client = new Redis({
      host,
      port: Number(process.env.REDIS_PORT ?? '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
    });

    client.on('error', (error) => {
      strapi?.log?.warn?.('Redis connection error', error);
    });
  } catch (error) {
    strapi?.log?.warn?.('Unable to initialise Redis client', error);
    client = null;
  }

  return client;
};

export const getRedisClient = (strapi: any) => createRedisClient(strapi);
