import Session from '../Session';
import { globalSubscriber } from './client';
import prefixer from './prefixer';
import userHelper from './userHelper';

class Subscription {
  private clearUnListMap = new Map<string, () => any>();
  private subscriptionMap = new Map<string, Set<Session>>();

  async subscribe(channel: string, session: Session) {
    this.clearUnListMap.get(session.id)?.();
    const registered = this.getSessionSet(channel);

    if (!registered) {
      const key = prefixer.channel(channel);

      await (
        await globalSubscriber
      ).subscribe(key, (message, channelName) => {
        try {
          const parsed = JSON.parse(message);
          this.dispatch(channelName, parsed);
        } catch (error) {
          console.log(error);
        }
      });
      this.subscriptionMap.set(key, new Set());
    }
    this.addSession(channel, session);
    await userHelper.listChannel(channel, session);
  }

  async unsubscribe(channel, session) {
    this.deleteSession(channel, session);
    this.bookUnListChannel(session);
  }

  private addSession(channel: string, session: Session) {
    this.getSessionSet(channel)?.add(session);
  }

  private deleteSession(channel: string, session: Session) {
    this.getSessionSet(channel)?.delete(session);
  }

  private bookUnListChannel(session: Session) {
    const id = setTimeout(
      async () => await userHelper.unListChannel(session),
      100000
    );
    const clear = () => clearTimeout(id);
    this.clearUnListMap.set(session.id, clear);
  }

  getSessionSet(channel: string): Set<Session> {
    const key = prefixer.channel(channel);
    return this.subscriptionMap.get(key);
  }

  getSession(channel: string, sessionId: string): Session | null {
    const sessionSet = this.getSessionSet(channel);
    if (!sessionSet) return null;
    return Array.from(sessionSet).find(session => session.id === sessionId);
  }

  dispatch(key: string, message: object) {
    const sessionSet = this.subscriptionMap.get(key);

    if (!sessionSet) return;
    sessionSet.forEach(session => session.emit(message));
  }
}

const subscription = new Subscription();

export default subscription;
