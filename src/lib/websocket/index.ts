import { Server } from 'http';
import WebSocket from 'ws';

export default function (server: Server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (socket, req) => {
    socket.on('message', data => {
      socket.send(data);
    });
  });
}
