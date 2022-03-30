import * as express from 'express';
import Session from '../../lib/websocket/Session';

type Role = 'mafia' | 'police' | 'doctor' | 'civil';

// type Color = '#DA4E3D' | '#4F85ED' | '#57A85C' | '#F2C043';

type ColorMap = {
  [key in string]: boolean;
};

type GameType = '4set' | '6set' | 'custom';

type RoleInfo = {
  [key in Role]: number;
};

type GameState = 'inGame' | 'waiting' | 'destroy';

type GameInfo = {
  gameId: string;
  roomName: string;
  isPrivate: boolean;
  userCount: number;
  gameType: GameType;
  roleInfo: RoleInfo;
  masterId: string;
  sessions: Session[];
};

declare global {
  type User = {
    id: string;
    name: string;
    ingame?: string;
  };

  type Game = {
    gameState: GameState;
    gameInfo: GameInfo;
    colorStore: ColorMap;
  };

  type CreateGameData = {
    roomName: string;
    isPrivate: boolean;
    gameType: GameType;
    roleInfo: RoleInfo;
    userCount: number;
  };

  namespace Express {
    interface Request {
      user: User;
    }
  }
}
