export const createGameInfo = ({
  gameId,
  roomName,
  isPrivate,
  userCount,
  gameType,
  roleInfo,
  masterId,
}): GameInfo => ({
  onGame: false,
  gameId,
  roomName,
  isPrivate,
  userCount,
  gameType,
  roleInfo,
  masterId,
  sessions: [],
});

export const createGameId = () => Math.floor(100000 + Math.random() * 900000).toString();
