import { IncomingMessage } from 'http';
import internal from 'stream';

export interface CheckedIncomingMessage extends IncomingMessage {
  gameId: string;
}

interface NewSocketServerListener {
  (req: CheckedIncomingMessage, socket: internal.Duplex, head: Buffer): void;
}

const checkUrlExist =
  (listener: NewSocketServerListener) =>
  (req: IncomingMessage, socket: internal.Duplex, head: Buffer) => {
    const url = req.url?.substring(1);
    if (!url) return socket.destroy();
    const newReq: CheckedIncomingMessage = Object.assign(req, { gameId: url });
    listener(newReq, socket, head);
  };

export default checkUrlExist;
