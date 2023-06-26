import { Router as createRouter } from 'express';
import createDebug from 'debug';
import { User } from '../entities/user.js';
import { UserRepo } from '../repository/user.m.repository.js';
import { UserController } from '../controllers/user.controller.js';
import { Repository } from '../repository/repository.js';
const debug = createDebug('FP:UserRouter');

debug('Executed');
const repo: Repository<User> = new UserRepo() as Repository<User>;
const controller = new UserController(repo);

export const userRouter = createRouter();

userRouter.get('/', controller.getAll.bind(controller));
userRouter.post('/register', controller.register.bind(controller));
userRouter.patch('/login', controller.login.bind(controller));
