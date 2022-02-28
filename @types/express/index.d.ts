import * as express from 'express';

type User = {
  id: string;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
