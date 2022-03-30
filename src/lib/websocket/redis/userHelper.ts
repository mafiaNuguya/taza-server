import type Session from '../Session';

import { v4 } from 'uuid';

import { localRedisClient } from './client';
import prefixer from './prefixer';

type GetUserReturnType = {
  id: string;
  ingame?: string;
};

const userHelper = {
  async getUser(
    name: string,
    { ingame }: { ingame?: boolean }
  ): Promise<GetUserReturnType | undefined> {
    const id = await (await localRedisClient).hGet(prefixer.user(name), 'id');

    if (!id) return;
    const userInfo: GetUserReturnType = { id };

    if (ingame) {
      userInfo.ingame = await (await localRedisClient).hGet(prefixer.user(name), 'ingame');
    }
    return userInfo;
  },
  async loginUser(name: string): Promise<User | null> {
    const userInfo = await this.getUser(name, {});

    if (userInfo) return null;
    const id = v4();
    await (await localRedisClient).hSet(prefixer.user(name), 'id', id);
    return { id, name };
  },
  async logoutUser(session: Session) {
    await (await localRedisClient).hDel(prefixer.user(session.name), ['id', 'ingame']);
  },
  async saveGameInfoToToken(session: Session) {
    await (await localRedisClient).hSet(prefixer.user(session.name), 'ingame', session.gameId);
  },
  async deleteGameInfoFromToken(name: string) {
    await (await localRedisClient).hDel(prefixer.user(name), 'ingame');
  },
};

export default userHelper;
