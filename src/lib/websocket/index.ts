import { Server } from 'http';
import WebSocket from 'ws';
import cookie from 'cookie';

import Session from './Session';
import gameHelper from './redis/gameHelper';
import checkUrlExist, { CheckedIncomingMessage } from '../middleware/checkUrlExist';
import validateToken from '../validation/validateToken';
import userHelper from './redis/userHelper';
import directHelper from './redis/directHelper';

interface SessionData {
  id: string;
  name: string;
  color: string;
}

export default function (server: Server) {
  const wss = new WebSocket.Server({ noServer: true });
  wss.on(
    'connection',
    async (
      socket: WebSocket,
      { gameId }: CheckedIncomingMessage,
      { id, name, color }: SessionData
    ) => {
      const session = new Session(socket, gameId, id, name, color);
      await session.enter();

      socket.on('message', message => {
        const actionData = JSON.parse(message.toString());
        session.handleMessage(actionData);
      });
      socket.on('close', function close() {
        session.leave();
      });
    }
  );

  server.on(
    'upgrade',
    checkUrlExist(async (req, socket, head) => {
      try {
        if (!req.headers.cookie) throw new Error();
        const cookies = cookie.parse(req.headers.cookie);
        const { id, name } = await validateToken(cookies[process.env.TOKEN_NAME!]);
        const userInfo = await userHelper.getUser(name, { ingame: true });

        if (userInfo?.ingame) {
          return socket.destroy();
        }
        const { accessible, reason } = gameHelper.checkGameAccessible(req.gameId);

        if (!accessible) return socket.destroy(new Error(reason));
        const color = gameHelper.getColor(req.gameId);

        wss.handleUpgrade(req, socket, head, ws => {
          wss.emit('connection', ws, req, { id, name, color });
        });
      } catch (error) {
        console.log(error);
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
    })
  );
}
