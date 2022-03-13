import express from 'express';
import JWT from 'jsonwebtoken';
import subscription from '../lib/websocket/redis/subscription';

import userHelper from '../lib/websocket/redis/userHelper';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name } = req.body;
  const addedUser = await userHelper.loginUser(name);

  if (!addedUser) {
    return res.status(200).json({
      ok: false,
    });
  }

  const token = await JWT.sign(addedUser, process.env.TOKEN_SECRET);

  return res.status(200).json({
    ok: true,
    token,
  });
});

export default router;
