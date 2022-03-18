import Session from '../Session';
import { globalSubscriber } from './client';
import prefixer from './prefixer';

class DirectHelper {
  private directMap = new Map<string, Session>();

  async createDirect(session: Session) {
    const key = prefixer.direct(session.id);

    if (this.directMap.get(key)) return;
    await (
      await globalSubscriber
    ).subscribe(key, (message, channelName) => {
      try {
        const parsed = JSON.parse(message);
        this.directMap.get(channelName).emit(parsed);
      } catch (error) {
        console.log(error);
      }
    });
    this.directMap.set(key, session);
  }

  deleteDirect(sessionId: string) {
    const key = prefixer.direct(sessionId);
    this.directMap.delete(key);
  }
}

const directHelper = new DirectHelper();

export default directHelper;
