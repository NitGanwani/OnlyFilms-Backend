import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
// Import { userRouter } from './routers/user.router.js';

import createDebug from 'debug';
// Import { errorHandler } from './middleware/error.js';
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

// App.use('/user', userRouter);

// app.use(errorHandler);
