import type Session from '../Session';

import prefixer from './prefixer';
import { globalSubscriber } from './client';
import { createGameItem, createGameId } from '../../game';

interface CreateGameProps extends CreateGameData {
  masterId: string;
}

interface CheckGameResult {
  accessible: boolean;
  reason?: string;
}

class GameHelper {
  gameMemoryMap = new Map<string, Game>();

  async createGame(createGameData: CreateGameProps): Promise<string | undefined> {
    const { roomName, isPrivate, gameType, roleInfo, userCount, masterId } = createGameData;
    const gameId = createGameId();
    const key = prefixer.game(gameId);

    if (this.gameMemoryMap.get(key)) return;
    await (
      await globalSubscriber
    ).subscribe(key, (message, channelName) => {
      try {
        const parsed = JSON.parse(message);
        this.gameMemoryMap
          .get(channelName)
          ?.gameInfo.sessions.forEach(session => session.emit(parsed));
      } catch (error) {
        console.log(error);
      }
    });
    const createdGame = createGameItem({
      gameId,
      roomName,
      isPrivate,
      userCount,
      gameType,
      roleInfo,
      masterId,
    });
    this.gameMemoryMap.set(key, createdGame);
    return gameId;
  }

  private async deleteGame(gameId: string) {
    const key = prefixer.game(gameId);
    await (await globalSubscriber).unsubscribe(key);
    this.gameMemoryMap.delete(key);
  }

  checkGameAccessible(gameId: string): CheckGameResult {
    const result: CheckGameResult = { accessible: true };
    const game = this.getGame(gameId);

    if (!game) {
      result.accessible = false;
      result.reason = '존재하지 않는 게임입니다.';
    } else if (game.gameState === 'inGame') {
      result.accessible = false;
      result.reason = '이미 시작된 게임입니다.';
    } else if (game.gameInfo.userCount === game.gameInfo.sessions.length) {
      result.accessible = false;
      result.reason = '제한 인원이 꽉찼습니다.';
    }
    return result;
  }

  getGame(gameId: string) {
    const key = prefixer.game(gameId);
    return this.gameMemoryMap.get(key);
  }

  getAllGames(): Game[] {
    return Array.from(this.gameMemoryMap.values());
  }

  startGame(gameId: string) {
    const game = this.getGame(gameId);
    if (!game) return;
    game.gameState = 'inGame';
  }

  addSessionToGameMemory(session: Session) {
    const game = this.getGame(session.gameId);
    if (!game) return;
    game.gameInfo.sessions.push(session);

    return () => {
      if (game.gameInfo.masterId === session.id) {
        game.gameState = 'destroy';
      }
      if (game.gameInfo.sessions.length === 1) return this.deleteGame(session.gameId);
      game.gameInfo.sessions = game.gameInfo.sessions.filter(s => s.id !== session.id);
    };
  }

  getColor(gameId: string) {
    const game = this.getGame(gameId);
    if (!game) return;
    const colorName = Object.entries(game.colorStore).find(state => !state[1])?.[0];
    if (!colorName) return;
    game.colorStore[colorName] = true;
    return colorName;
  }

  returnColor(gameId: string, colorName: string) {
    const game = this.getGame(gameId);
    if (!game) return;
    game.colorStore[colorName] = false;
  }
}
const gameHelper = new GameHelper();

export default gameHelper;
