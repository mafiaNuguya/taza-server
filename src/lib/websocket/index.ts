import { Server } from 'http';
import WebSocket from 'ws';
import cookie from 'cookie';
import JWT from 'jsonwebtoken';

import Session from './Session';
import gameHelper from './redis/gameHelper';
import actionCreator from './actions/send';
import directHelper from './redis/directHelper';

export default function (server: Server) {
  const wss = new WebSocket.Server({ noServer: true });
  wss.on('connection', (socket, req, user: User) => {
    const gameId = req.url.substring(1);
    const { ingame } = user;

    if (!ingame) {
      const { accessible, reason } = gameHelper.checkGameAccessible(gameId);
      if (!accessible) {
        socket.send(JSON.stringify(actionCreator.enteredFail(gameId, reason)));
        return;
      }
    }
    const session = new Session(socket, user.id, user.name, ingame || gameId);

    socket.on('message', message => {
      const actionData = JSON.parse(message.toString());
      session.handleMessage(actionData);
    });
    socket.on('close', async function close() {
      await session.handleLeave();
    });
  });

  server.on('upgrade', async (req, socket, head) => {
    try {
      if (!req.headers.cookie) throw new Error();
      const cookies = cookie.parse(req.headers.cookie);
      const decoded = await JWT.verify(cookies[process.env.TOKEN_NAME], process.env.TOKEN_SECRET);
      const user = {
        id: (decoded as any).id,
        name: (decoded as any).name,
        ingame: (decoded as any).ingame,
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
