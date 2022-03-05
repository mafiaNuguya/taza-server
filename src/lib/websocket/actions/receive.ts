type Role = 'mafia' | 'police' | 'doctor' | 'civil';

export type RoleCounts = {
  [key in Role]: number;
};

export type GameType = '4set' | '6set' | 'custom';

export type CreateGameData = {
  roomName: string;
  isPrivate: boolean;
  gameType: GameType;
  roleCounts: RoleCounts;
};

type EnterAction = {
  type: 'enter';
  channel: string;
};

type CreateGameAction = {
  type: 'createGame';
  gameData: CreateGameData;
};

export type ReceiveAction = EnterAction | CreateGameAction;
