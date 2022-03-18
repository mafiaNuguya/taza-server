import * as redis from 'redis';
import { RedisClientOptions } from 'redis';
import { SendAction } from '../actions/send';

const createRedisClient = async (config?: RedisClientOptions) => {
  const client = redis.createClient(config);
  await client.connect();
  await client.ping();
  return client;
};

export const localRedisClient = createRedisClient();
export const globalSubscriber = createRedisClient();

export const publishToChannel = async (key: string, json: SendAction) =>
  (await localRedisClient).publish(key, JSON.stringify(json));
