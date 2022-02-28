import type { ErrorRequestHandler } from 'express';

const error: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
};

export default error;
