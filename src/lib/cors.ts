import cors from 'cors';

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
};
const Cors = cors(corsOptions);

export default Cors;
