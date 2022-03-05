import * as express from 'express';

type User = {
  id?: string;
  name?: string;
  channel?: string;
};

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
