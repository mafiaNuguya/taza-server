import { WebSocket } from 'ws';

import { ReceiveAction } from './actions/receive';
import actionCreator, { SendAction } from './actions/send';
import { publishToChannel } from './redis/client';
import prefixer from './redis/prefixer';
import gameHelper from './redis/gameHelper';
import directHelper from './redis/directHelper';
import userHelper from './redis/userHelper';

class Session {
  socket: WebSocket;
  id: string;
  name: string;
  gameId: string;
  color: string;
  leaveWorks = new Set<(() => void) | undefined>();

  constructor(socket: WebSocket, gameId: string, id: string, name: string, color: string) {
    this.socket = socket;
    this.gameId = gameId;
    this.id = id;
    this.name = name;
    this.color = color;
  }

  async enter() {
    const game = gameHelper.getGame(this.gameId);
    if (!game) return this.socket.close();
    this.leaveWorks
      .add(() => gameHelper.returnColor(this.gameId, this.color))
      .add(gameHelper.addSessionToGameMemory(this))
      .add(await directHelper.createDirect(this));
    await userHelper.saveGameInfoToToken(this);
    publishToChannel(
      prefixer.game(this.gameId),
      actionCreator.entered(game.gameInfo, this.id, this.name, this.color)
    );
  }

  leave() {
    for (const work of this.leaveWorks.values()) {
      work?.();
    }
    publishToChannel(prefixer.game(this.gameId), actionCreator.leaved(this.id));
  }

  emit(data: SendAction) {
    this.socket.send(JSON.stringify(data));
  }

  handleMessage(action: ReceiveAction) {
    switch (action.type) {
      case 'call': {
        this.handleCall(action.to, action.description, action.color);
        break;
      }
      case 'answer': {
        this.handleAnswer(action.to, action.description);
        break;
      }
      case 'candidate': {
        this.handleCandidate(action.to, action.candidate);
        break;
      }
      case 'gameStart': {
        this.handleGameStart(action.gameId);
      }
      default:
        break;
    }
  }

  private handleCall(to: string, description: RTCSessionDescriptionInit, color: string) {
    publishToChannel(
      prefixer.direct(to),
      actionCreator.called(this.id, this.name, description, color)
    );
  }

  private handleAnswer(to: string, description: RTCSessionDescriptionInit) {
    publishToChannel(prefixer.direct(to), actionCreator.answered(this.id, description));
  }

  private handleCandidate(to: string, candidate: RTCIceCandidateInit | null) {
    publishToChannel(prefixer.direct(to), actionCreator.candidated(this.id, candidate));
  }

  private handleGameStart(gameId: string) {
    gameHelper.startGame(gameId);
  }
}

export default Session;
