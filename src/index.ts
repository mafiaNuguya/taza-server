import 'dotenv/config';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import Cors from './lib/cors';

import handleError from './handleError';
import enterRoute from './routes/enter';
import userRoute from './routes/user';
import WebSocket from './lib/websocket';

const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(Cors);

app.use('/enter', enterRoute);
app.use('/user', userRoute);

app.use(handleError);

server.listen(process.env.PORT, () =>
  console.log(`🚀running on port: ${process.env.PORT}`)
);
WebSocket(server);
