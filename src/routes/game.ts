import express, { Request } from 'express';

import authenticate from '../lib/middleware/authenticate';
import gameHelper from '../lib/websocket/redis/gameHelper';

const router = express.Router();

router.get('/list', authenticate, async (req, res) => {
  const gameList = gameHelper
    .getAllGames()
    .filter(
      game =>
        game.gameState !== 'inGame' && !game.gameInfo.isPrivate && game.gameState === 'waiting'
    );
  res.status(200).json({ gameList });
});

router.get('/gameInfo/:gameId', authenticate, async (req: Request<{ gameId: string }>, res) => {
  const { gameId } = req.params;
  const gameInfo = gameHelper.getGame(gameId)?.gameInfo;
  const color = gameHelper.getColor(gameId);
  res.status(200).json({ gameInfo, color });
});

router.post('/create', authenticate, async (req, res) => {
  const { createGameData } = req.body;
  const gameId = await gameHelper.createGame({
    ...createGameData,
    masterId: req.user.id,
  });
  res.status(200).json({ ok: true, gameId });
});

export default router;
