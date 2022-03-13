import { WebSocket } from 'ws';

import { ReceiveAction } from './actions/receive';
import actionCreator, { SendAction } from './actions/send';
import subscription from './redis/subscription';
import { publishToChannel } from './redis/client';
import prefixer from './redis/prefixer';
import userHelper from './redis/userHelper';

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
    subscription.subscribe(prefixer.direct(id), this);
  }

  emit(data: SendAction) {
    this.socket.send(JSON.stringify(data));
  }

  informConnected(gameId: string) {
    const connectedAction = actionCreator.connected(gameId, this.id, this.name);
    this.emit(connectedAction);
  }

  disconnect() {
    this.socket.close();
  }

  private async enterChannel(channel: string) {
    const enteredSession = subscription.getSession(channel, this.id);

    if (enteredSession) {
      enteredSession.disconnect();
      this.disconnect();
      return;
    }
    await subscription.subscribe(channel, this);
    await userHelper.listChannel(channel, this);
    this.currentChannel = channel;
  }

  handleMessage(action: ReceiveAction) {
    switch (action.type) {
      case 'enter': {
        console.log(
          `receive message that user want to enter ${action.channel}`
        );
        this.handleEnter(action.channel);
        break;
      }
      case 'call': {
        console.log(`2. ${this.id}가 ${action.to}에게 전화를 겁니다.`);
        this.handleCall(action.to, action.description);
        break;
      }
      case 'answer': {
        console.log(`5. ${action.to}로 ${this.id} 가 답변을 보냅니다.`);
        this.handleAnswer(action.to, action.description);
        break;
      }
      case 'candidate': {
        console.log(`@@${this.id}가 ${action.to}에 candidate 합니다.`);
        this.handleCandidate(action.to, action.candidate);
        break;
      }
      default:
        break;
    }
  }

  async handleEnter(channel: string) {
    await this.enterChannel(channel);
    const enteredAction = actionCreator.entered(channel, this.id);
    publishToChannel(channel, enteredAction);
  }

  handleCall(to: string, description: RTCSessionDescriptionInit) {
    publishToChannel(
      prefixer.direct(to),
      actionCreator.called(this.id, description)
    );
  }

  handleAnswer(to: string, description: RTCSessionDescriptionInit) {
    publishToChannel(
      prefixer.direct(to),
      actionCreator.answered(this.id, description)
    );
  }

  handleCandidate(to: string, candidate: RTCIceCandidateInit | null) {
    publishToChannel(
      prefixer.direct(to),
      actionCreator.candidated(this.id, candidate)
    );
  }
}

export default Session;
