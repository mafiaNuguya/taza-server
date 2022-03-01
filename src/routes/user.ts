import express from 'express';

import authenticate from '../lib/middleware/authenticate';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
