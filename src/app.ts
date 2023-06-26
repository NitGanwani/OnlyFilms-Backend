import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { userRouter } from './routers/user.router.js';
import createDebug from 'debug';
import { handleError } from './middleware/error.js';
const debug = createDebug('FP:App');

export const app = express();

debug('Loaded Express App');

const corsOptions = {
  origin: '*',
};

app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (_req, res) => {
  res.send('API Rest Info');
});

app.use('/user', userRouter);

app.use(handleError);
