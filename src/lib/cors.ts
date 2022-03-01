import cors from 'cors';

const whiteList = ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, cb) => {
    if (whiteList.indexOf(origin) !== -1) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed origin!'));
    }
  },
};
const Cors = cors(corsOptions);

export default Cors;
