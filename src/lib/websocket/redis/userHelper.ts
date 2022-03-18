import type Session from '../Session';

import { v4 } from 'uuid';

import { localRedisClient } from './client';
import prefixer from './prefixer';

const userHelper = {
  async getUser(name: string, { id, ingame }: { id?: boolean; ingame?: boolean }): Promise<User> {
    const userInfo: User = {};

    if (id) {
      userInfo.id = await (await localRedisClient).hGet(prefixer.user(name), 'id');
    }
    if (ingame) {
      userInfo.ingame = await (await localRedisClient).hGet(prefixer.user(name), 'ingame');
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
    await (await localRedisClient).hDel(prefixer.user(session.name), ['id', 'ingame']);
  },
  async saveUserIngame(gameId: string, session: Session) {
    await (await localRedisClient).hSet(prefixer.user(session.name), 'ingame', gameId);
  },
  async deleteUserIngame(session: Session) {
    await (await localRedisClient).hDel(prefixer.user(session.name), 'ingame');
  },
};

export default userHelper;
