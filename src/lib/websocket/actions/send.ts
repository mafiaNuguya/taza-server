import { GameInfo } from '../../../@types/express';

type EnteredAction = {
  type: 'entered';
  gameInfo: GameInfo;
  enteredId: string;
  enteredName: string;
  color: string;
};

type LeavedAction = {
  type: 'leaved';
  leavedId: string;
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
  color: string;
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
  | EnteredAction
  | LeavedAction
  | EnteredFailAction
  | CalledAction
  | AnsweredAction
  | CandidatedAction;

const actionCreator = {
  entered: (
    gameInfo: GameInfo,
    enteredId: string,
    enteredName: string,
    color: string
  ): EnteredAction => ({
    type: 'entered',
    gameInfo,
    enteredId,
    enteredName,
    color,
  }),
  leaved: (id: string): LeavedAction => ({
    type: 'leaved',
    leavedId: id,
  }),
  enteredFail: (gameId: string, reason: string): EnteredFailAction => ({
    type: 'enteredFail',
    gameId,
    reason,
  }),
  called: (
    from: string,
    name: string,
    description: RTCSessionDescriptionInit,
    color: string
  ): CalledAction => ({
    type: 'called',
    from,
    name,
    description,
    color,
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
