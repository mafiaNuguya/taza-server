import { WebSocket } from 'ws';

import { ReceiveAction } from './actions/receive';
import actionCreator, { SendAction } from './actions/send';
import gameHelper from './redis/gameHelper';
import { publishToChannel } from './redis/client';
import prefixer from './redis/prefixer';
import directHelper from './redis/directHelper';

class Session {
  socket: WebSocket;
  id: string;
  name: string;
  currentChannel?: string;

  constructor(socket: WebSocket, id: string, name: string, gameId: string) {
    this.socket = socket;
    this.id = id;
    this.name = name;
    this.connected(gameId);
  }

  emit(data: SendAction) {
    this.socket.send(JSON.stringify(data));
  }

  async connected(gameId: string) {
    await directHelper.createDirect(this);
    const game = gameHelper.getGame(gameId);
    const connectedAction = actionCreator.connected(game, this.id, this.name);
    this.emit(connectedAction);
  }

  disconnect() {
    this.socket.close();
  }

  private async enterGame(gameId: string) {
    // => 게임이 없거나 이미진행 중이면 없는게임이라고 클라이언트에 알려야함
    // const foundSession = gameHelper.findSessionInGame(gameId, this.id);

    // if (foundSession) {
    //   foundSession.disconnect();
    //   this.disconnect();
    //   return;
    // }
    gameHelper.addSessionToGameMemory(gameId, this);
    this.currentChannel = gameId;
  }

  handleMessage(action: ReceiveAction) {
    switch (action.type) {
      case 'enter': {
        this.handleEnter(action.gameId);
        break;
      }
      case 'call': {
        this.handleCall(action.to, action.description);
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
      default:
        break;
    }
  }

  async handleEnter(gameId: string) {
    await this.enterGame(gameId);
    const enteredAction = actionCreator.entered(gameId, this.id, this.name);
    publishToChannel(prefixer.game(gameId), enteredAction);
  }

  handleCall(to: string, description: RTCSessionDescriptionInit) {
    publishToChannel(prefixer.direct(to), actionCreator.called(this.id, this.name, description));
  }

  handleAnswer(to: string, description: RTCSessionDescriptionInit) {
    publishToChannel(prefixer.direct(to), actionCreator.answered(this.id, description));
  }

  handleCandidate(to: string, candidate: RTCIceCandidateInit | null) {
    publishToChannel(prefixer.direct(to), actionCreator.candidated(this.id, candidate));
  }
}

export default Session;
