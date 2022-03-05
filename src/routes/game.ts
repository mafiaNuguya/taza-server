import express from 'express';

import authenticate from '../lib/middleware/authenticate';
import Game from '../lib/websocket/Game';

const router = express.Router();

const gameMap = new Map<string, Game>();

router.get('/rooms', authenticate, async (req, res) => {
  const gameRooms = gameMap.values();
  res.status(200).json({ gameRooms: Array.from(gameRooms) });
});

router.post('/create', authenticate, (req, res) => {
  const { createGameData } = req.body;
  const { roomName, isPrivate, gameType, roleCounts } = createGameData;
  const gameId = Math.floor(100000 + Math.random() * 900000).toString();

  const createdGame = new Game(gameId, roomName, isPrivate, gameType, roleCounts, req.user.id);
  gameMap.set(gameId, createdGame);

  return res.status(200).json({ ok: true, gameId });
});

export default router;
