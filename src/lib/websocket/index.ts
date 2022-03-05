import { Server } from 'http';
import WebSocket from 'ws';
import cookie from 'cookie';
import JWT from 'jsonwebtoken';

import Session from './Session';
import userHelper from './redis/userHelper';
import subscription from './redis/subscription';

interface User {
  id: string;
  name: string;
}

export default function (server: Server) {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (socket, req, user: User) => {
    const gameId = req.url.substr(1);
    const session = new Session(socket, user.id, user.name, gameId);

    socket.on('message', message => {
      const actionData = JSON.parse(message.toString());
      session.handleMessage(actionData);
    });
    socket.on('close', async function close() {
      await subscription.unsubscribe(session.currentChannel, session);
      console.log(`disconnected: ${session.name}`);
    });
  });

  server.on('upgrade', async (req, socket, head) => {
    const cookies = cookie.parse(req.headers.cookie);

    try {
      const decoded = await JWT.verify(
        cookies[process.env.TOKEN_NAME],
        process.env.TOKEN_SECRET
      );
      const user = {
        id: (decoded as any).id,
        name: (decoded as any).name,
      };

      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit('connection', ws, req, user);
      });
    } catch (error) {
      console.log(error);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
  });
}
