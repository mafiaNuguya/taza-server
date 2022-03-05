import type { GameType, RoleCounts } from './actions/receive';
import Session from './Session';

class Game {
  gameId: string;
  onGame: boolean;
  roomName: string;
  isPrivate: boolean;
  gameType: GameType;
  roleCounts: RoleCounts;
  masterId: string;
  sessions: Session[] = [];

  constructor(
    gameId: string,
    roomName: string,
    isPrivate: boolean,
    gameType: GameType,
    roleCounts: RoleCounts,
    masterId: string
  ) {
    this.gameId = gameId;
    this.onGame = false;
    this.roomName = roomName;
    this.isPrivate = isPrivate;
    this.gameType = gameType;
    this.roleCounts = roleCounts;
    this.masterId = masterId;
  }

  join(session: Session) {
    console.log(`${this.gameId}에 들어왔습니다.`);
  }
}

export default Game;
