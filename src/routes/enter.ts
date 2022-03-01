import type { User } from '../@types/express';

import express from 'express';
import JWT from 'jsonwebtoken';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name } = req.body;
  const addedUser = await findOrAddUser(name);

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

async function findOrAddUser(name: string): Promise<User | null> {
  if (name === '123') {
    return null;
  }
  return {
    id: 'id',
    name,
  };
}
