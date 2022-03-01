import JWT from 'jsonwebtoken';

const authenticate = async (req, res, next) => {
  if (!req.cookies[process.env.TOKEN_NAME]) {
    return next();
  }

  try {
    const decoded = await JWT.verify(
      req.cookies[process.env.TOKEN_NAME],
      process.env.TOKEN_SECRET
    );
    req.user = {
      id: (decoded as any).id,
      name: (decoded as any).name,
    };
    next();
  } catch (error) {
    return res.status(401).end();
  }
};

export default authenticate;
