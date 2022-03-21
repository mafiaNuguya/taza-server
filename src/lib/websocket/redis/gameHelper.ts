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

  private async deleteGame(gameId: string) {
    const key = prefixer.game(gameId);
    await (await globalSubscriber).unsubscribe(key);
    this.gameMemoryMap.delete(key);
  }

  checkGameAccessible(gameId: string): CheckGameResult {
    const result: CheckGameResult = { accessible: true };
    const game = this.getGameInfo(gameId);

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

  getGameInfo(gameId: string): GameInfo | undefined {
    const key = prefixer.game(gameId);
    return this.gameMemoryMap.get(key);
  }

  getAllGameInfo(): GameInfo[] {
    return Array.from(this.gameMemoryMap.values());
  }

  async enterGame(gameId: string, session: Session) {
    await directHelper.createDirect(session);
    this.getGameInfo(gameId)?.sessions.push(session);
  }

  async leaveGame(gameId: string, sessionId: string) {
    await directHelper.deleteDirect(sessionId);
    const game = this.getGameInfo(gameId);
    if (!game) return;
    if (sessionId === game.masterId) return this.deleteGame(gameId);
    game.sessions = game.sessions.filter(s => s.id !== sessionId);
  }

  gameStart(gameId: string) {
    this.getGameInfo(gameId).onGame = true;
  }
}
const gameHelper = new GameHelper();

export default gameHelper;
