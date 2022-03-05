type ConnectedAction = {
  type: 'connected';
  channel: string;
  sessionId: string;
  sessionName: string;
};

type EnteredAction = {
  type: 'entered';
  channel: string;
  sessionId: string;
};

export type SendAction = ConnectedAction;

const actionCreator = {
  connected: (channel: string, sessionId: string, sessionName: string): ConnectedAction => ({
    type: 'connected',
    channel,
    sessionId,
    sessionName,
  }),
  entered: (channel: string, sessionId: string): EnteredAction => ({
    type: 'entered',
    channel,
    sessionId,
  }),
};

export default actionCreator;
