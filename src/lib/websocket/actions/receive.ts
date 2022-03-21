type EnterAction = {
  type: 'enter';
  gameId: string;
};

type CallAction = {
  type: 'call';
  to: string;
  description: RTCSessionDescriptionInit;
};

type AnswerAction = {
  type: 'answer';
  to: string;
  description: RTCSessionDescriptionInit;
};

type CandidateAction = {
  type: 'candidate';
  to: string;
  candidate: RTCIceCandidateInit | null;
};

type GameStartAction = {
  type: 'gameStart';
  gameId: string;
};

export type ReceiveAction =
  | EnterAction
  | CallAction
  | AnswerAction
  | CandidateAction
  | GameStartAction;
