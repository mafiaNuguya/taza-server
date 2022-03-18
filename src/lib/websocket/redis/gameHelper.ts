import type Session from '../Session';

import prefixer from './prefixer';
import { globalSubscriber } from './client';
import directHelper from './directHelper';
import { createGameInfo, createGameId } from '../../game';

interface CreateGameProps extends CreateGameData {
  masterId: string;
}

interface CheckGameResult {
  accessible: boolean;
  reason?: string;
}

class GameHelper {
  private gameMemoryMap = new Map<string, GameInfo>();

  getGame(gameId: string): GameInfo | undefined {
    const key = prefixer.game(gameId);
    return this.gameMemoryMap.get(key);
  }

  async createGame(createGameData: CreateGameProps): Promise<GameInfo> {
    const { roomName, isPrivate, gameType, roleInfo, userCount, masterId } = createGameData;
    const gameId = createGameId();
    const key = prefixer.game(gameId);

    if (this.gameMemoryMap.get(key)) return;
    await (
      await globalSubscriber
    ).subscribe(key, (message, channelName) => {
      try {
        const parsed = JSON.parse(message);
        this.gameMemoryMap.get(channelName).sessions.forEach(session => session.emit(parsed));
      } catch (error) {
        console.log(error);
      }
    });
    const createdGame = createGameInfo({
      gameId,
      roomName,
      isPrivate,
      userCount,
      gameType,
      roleInfo,
      masterId,
    });
    this.gameMemoryMap.set(key, createdGame);
    return createdGame;
  }

  checkGameAccessible(gameId: string): CheckGameResult {
    const result: CheckGameResult = { accessible: true };
    const game = this.getGame(gameId);

    if (!game) {
      result.accessible = false;
      result.reason = '존재하지 않는 게임입니다.';
    } else if (game.onGame) {
      result.accessible = false;
      result.reason = '이미 시작된 게임입니다.';
    } else if (game.userCount === game.sessions.length) {
      result.accessible = false;
      result.reason = '제한 인원이 꽉찼습니다.';
    }
    return result;
  }

  deleteGame(gameId: string) {
    const key = prefixer.game(gameId);
    this.gameMemoryMap.delete(key);
  }

  getAllGames(): GameInfo[] {
    return Array.from(this.gameMemoryMap.values());
  }

  addSessionToGameMemory(gameId: string, session: Session) {
    this.getGame(gameId)?.sessions.push(session);
  }

  quitGame(gameId: string, sessionId: string) {
    const game = this.getGame(gameId);
    if (!game) return;

    if (game.onGame) {
      directHelper.deleteDirect(sessionId);
    }
    if (sessionId === game.masterId) {
      return this.deleteGame(gameId);
    }
    const lastSessions = game.sessions.filter(s => s.id !== sessionId);
    game.sessions = lastSessions;
  }

  findSessionInGame(gameId: string, sessionId: string): Session | undefined {
    return this.getGame(gameId)?.sessions.find(s => s.id === sessionId);
  }

  // private bookUnListChannel(session: Session) {
  //   const id = setTimeout(async () => await userHelper.deleteUserIngame(session), 100000);
  //   const clear = () => clearTimeout(id);
  //   this.clearUnListMap.set(session.id, clear);
  // }
}
const gameHelper = new GameHelper();

export default gameHelper;
