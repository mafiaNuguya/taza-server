import { v4 } from 'uuid';

import { User } from '../../../@types/express';
import Session from '../Session';
import { localRedisClient } from './client';
import prefixer from './prefixer';

const userHelper = {
  async getUser(
    name: string,
    { id, channel }: { id?: boolean; channel?: boolean }
  ): Promise<User> {
    const userInfo: User = {};

    if (id) {
      userInfo.id = await (
        await localRedisClient
      ).hGet(prefixer.user(name), 'id');
    }
    if (channel) {
      userInfo.channel = await (
        await localRedisClient
      ).hGet(prefixer.user(name), 'channel');
    }

    return userInfo;
  },
  async loginUser(name: string): Promise<User | null> {
    const userInfo = await this.getUser(name, { id: true });

    if (userInfo.id) {
      return null;
    }

    const id = v4();
    await (await localRedisClient).hSet(prefixer.user(name), 'id', id);

    return {
      id,
      name,
    };
  },
  async logoutUser(session: Session) {
    await (
      await localRedisClient
    ).hDel(prefixer.user(session.name), ['id', 'channel']);
  },
  async listChannel(channel: string, session: Session) {
    await (
      await localRedisClient
    ).hSet(prefixer.user(session.name), 'channel', channel);
  },
  async unListChannel(session: Session) {
    await (await localRedisClient).hDel(prefixer.user(session.name), 'channel');
  },
};

export default userHelper;
