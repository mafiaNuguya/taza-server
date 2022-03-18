import JWT from 'jsonwebtoken';
import userHelper from '../websocket/redis/userHelper';

const authenticate = async (req, res, next) => {
  if (!req.cookies[process.env.TOKEN_NAME]) {
    return next();
  }

  try {
    const decoded = await JWT.verify(req.cookies[process.env.TOKEN_NAME], process.env.TOKEN_SECRET);
    const userInfo = await userHelper.getUser((decoded as any).name, {
      id: true,
      ingame: true,
    });

    if (!userInfo.id) {
      throw new Error();
    }
    req.user = {
      id: (decoded as any).id,
      name: (decoded as any).name,
      ...(userInfo.ingame && { ingame: userInfo.ingame }),
    };
    next();
  } catch (error) {
    return res.status(401).end();
  }
};

export default authenticate;
