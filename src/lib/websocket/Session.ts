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
    this.informConnected(gameId);
  }

  private async informConnected(gameId: string) {
    const game = gameHelper.getGameInfo(gameId);
    const connectedAction = actionCreator.connected(game, this.id, this.name);
    this.emit(connectedAction);
  }

  emit(data: SendAction) {
    this.socket.send(JSON.stringify(data));
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
    await gameHelper.enterGame(gameId, this);
    this.currentChannel = gameId;
    publishToChannel(prefixer.game(gameId), actionCreator.entered(gameId, this.id, this.name));
  }

  async handleLeave() {
    await gameHelper.leaveGame(this.currentChannel, this.id);
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
