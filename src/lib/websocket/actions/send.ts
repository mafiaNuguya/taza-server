type ConnectedAction = {
  type: 'connected';
  gameInfo: GameInfo;
  sessionId: string;
  sessionName: string;
};

type EnteredAction = {
  type: 'entered';
  gameId: string;
  enteredId: string;
  enteredName: string;
};

type EnteredFailAction = {
  type: 'enteredFail';
  gameId: string;
  reason: string;
};

type CalledAction = {
  type: 'called';
  from: string;
  name: string;
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
  | EnteredFailAction
  | CalledAction
  | AnsweredAction
  | CandidatedAction;

const actionCreator = {
  connected: (gameInfo: GameInfo, sessionId: string, sessionName: string): ConnectedAction => ({
    type: 'connected',
    gameInfo,
    sessionId,
    sessionName,
  }),
  entered: (gameId: string, enteredId: string, enteredName: string): EnteredAction => ({
    type: 'entered',
    gameId,
    enteredId,
    enteredName,
  }),
  enteredFail: (gameId: string, reason: string): EnteredFailAction => ({
    type: 'enteredFail',
    gameId,
    reason,
  }),
  called: (from: string, name: string, description: RTCSessionDescriptionInit): CalledAction => ({
    type: 'called',
    from,
    name,
    description,
  }),
  answered: (from: string, description: RTCSessionDescriptionInit): AnsweredAction => ({
    type: 'answered',
    from,
    description,
  }),
  candidated: (from: string, candidate: RTCIceCandidateInit | null): CandidatedAction => ({
    type: 'candidated',
    from,
    candidate,
  }),
};

export default actionCreator;
