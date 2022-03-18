import * as express from 'express';
import Session from '../../lib/websocket/Session';

type Role = 'mafia' | 'police' | 'doctor' | 'civil';

type GameType = '4set' | '6set' | 'custom';

type RoleInfo = {
  [key in Role]: number;
};

declare global {
  type User = {
    id?: string;
    name?: string;
    ingame?: string;
  };

  type GameInfo = {
    onGame: boolean;
    gameId: string;
    roomName: string;
    isPrivate: boolean;
    userCount: number;
    gameType: GameType;
    roleInfo: RoleInfo;
    masterId: string;
    sessions: Session[];
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
