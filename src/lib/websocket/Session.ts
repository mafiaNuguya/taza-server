import { WebSocket } from 'ws';

import { ReceiveAction } from './actions/receive';
import actionCreator from './actions/send';
import subscription from './redis/subscription';
import { publishToChannel } from './redis/client';

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

  emit(data: any) {
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
      case 'createGame': {
        break;
      }
      default:
        break;
    }
  }

  async handleEnter(channel: string) {
    await this.enterChannel(channel);
    const enteredAction = actionCreator.entered(channel, this.id);
    await publishToChannel(channel, enteredAction);
  }
}

export default Session;
