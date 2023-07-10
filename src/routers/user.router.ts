import { Router as createRouter } from 'express';
import createDebug from 'debug';
import { UserRepo } from '../repository/user.m.repository.js';
import { UserController } from '../controllers/user.controller.js';

const debug = createDebug('FP:UserRouter');

debug('Executed');
const repo: UserRepo = new UserRepo();
const controller = new UserController(repo);

export const userRouter = createRouter();

userRouter.get('/', controller.getAll.bind(controller));
userRouter.post('/register', controller.register.bind(controller));
userRouter.patch('/login', controller.login.bind(controller));
