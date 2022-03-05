import * as redis from 'redis';
import { RedisClientOptions } from 'redis';

import prefixer from './prefixer';

const createRedisClient = async (config?: RedisClientOptions) => {
  const client = redis.createClient(config);
  await client.connect();
  await client.ping();

  return client;
};

export const localRedisClient = createRedisClient();
export const globalSubscriber = createRedisClient();

export const publishToChannel = async (channel: string, json: any) =>
  (await localRedisClient).publish(prefixer.channel(channel), JSON.stringify(json));