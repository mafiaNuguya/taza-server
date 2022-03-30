import { RequestHandler } from 'express';
import validateToken from '../validation/validateToken';
import userHelper from '../websocket/redis/userHelper';

const authenticate: RequestHandler = async (req, res, next) => {
  if (!req.cookies[process.env.TOKEN_NAME!]) return next();

  try {
    const { id, name } = await validateToken(req.cookies[process.env.TOKEN_NAME!]);
    const userInfo = await userHelper.getUser(name, { ingame: true });

    if (!userInfo) throw new Error();
    if (req.url === '/list') await userHelper.deleteGameInfoFromToken(name);
    req.user = { id, name };
    next();
  } catch (error) {
    return res.status(401).end();
  }
};

export default authenticate;
