import cors, { CorsOptions } from 'cors';

const whiteList = ['http://localhost:3000'];

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (whiteList.indexOf(origin!) !== -1) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed origin!'));
    }
  },
  credentials: true,
};
const Cors = cors(corsOptions);

export default Cors;
