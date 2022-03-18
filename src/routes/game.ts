import express from 'express';

import authenticate from '../lib/middleware/authenticate';
import gameHelper from '../lib/websocket/redis/gameHelper';

const router = express.Router();

router.get('/list', authenticate, async (req, res) => {
  const gameList = gameHelper.getAllGames().filter(game => !game.onGame && !game.isPrivate);
  res.status(200).json({ gameList });
});

router.post('/create', authenticate, async (req, res) => {
  const { createGameData } = req.body;
  const { gameId } = await gameHelper.createGame({
    ...createGameData,
    masterId: req.user.id,
  });
  res.status(200).json({ ok: true, gameId });
});

export default router;
