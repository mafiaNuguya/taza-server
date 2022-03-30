import { GameType, RoleInfo } from '../@types/express';

export const createGameItem = ({
  gameId,
  roomName,
  isPrivate,
  userCount,
  gameType,
  roleInfo,
  masterId,
}: {
  gameId: string;
  roomName: string;
  isPrivate: boolean;
  userCount: number;
  gameType: GameType;
  roleInfo: RoleInfo;
  masterId: string;
}): Game => ({
  gameState: 'waiting',
  gameInfo: {
    gameId,
    roomName,
    isPrivate,
    userCount,
    gameType,
    roleInfo,
    masterId,
    sessions: [],
  },
  colorStore: {
    '#4F85ED': false,
    '#57A85C': false,
    '#DA4E3D': false,
    '#F2C043': false,
  },
});

export const createGameId = () => Math.floor(100000 + Math.random() * 900000).toString();
