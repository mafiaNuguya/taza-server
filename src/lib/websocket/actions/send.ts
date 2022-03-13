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

type CalledAction = {
  type: 'called';
  from: string;
  description: RTCSessionDescriptionInit;
};

type AnsweredAction = {
  type: 'answered';
  from: string;
  description: RTCSessionDescriptionInit;
};

type CandidatedAction = {
  type: 'candidated';
  from: string;
  candidate: RTCIceCandidateInit | null;
};

export type SendAction =
  | ConnectedAction
  | EnteredAction
  | CalledAction
  | AnsweredAction
  | CandidatedAction;

const actionCreator = {
  connected: (
    channel: string,
    sessionId: string,
    sessionName: string
  ): ConnectedAction => ({
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
  called: (
    from: string,
    description: RTCSessionDescriptionInit
  ): CalledAction => ({
    type: 'called',
    from,
    description,
  }),
  answered: (
    from: string,
    description: RTCSessionDescriptionInit
  ): AnsweredAction => ({
    type: 'answered',
    from,
    description,
  }),
  candidated: (
    from: string,
    candidate: RTCIceCandidateInit | null
  ): CandidatedAction => ({
    type: 'candidated',
    from,
    candidate,
  }),
};

export default actionCreator;
