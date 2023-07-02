import createDebug from 'debug';
import { Router as createRouter } from 'express';
import { Repository } from '../repository/repository';
import { Film } from '../entities/film';
import { FilmRepo } from '../repository/film.m.repository';
import { UserRepo } from '../repository/user.m.repository';
import { FilmController } from '../controllers/film.controller';
import { AuthInterceptor } from '../middleware/auth.interceptor';

const debug = createDebug('FP:FilmRouter');

debug('Executed');

const filmRepo: Repository<Film> = new FilmRepo();
const userRepo = new UserRepo();
const controller = new FilmController(filmRepo, userRepo);
const interceptor = new AuthInterceptor(filmRepo);
export const filmRouter = createRouter();

filmRouter.get('/', controller.getAll.bind(controller));
filmRouter.get('/:id', controller.getById.bind(controller));
filmRouter.post(
  '/',
  interceptor.logged.bind(interceptor),
  controller.post.bind(controller)
);
filmRouter.patch(
  '/:id',
  interceptor.logged.bind(interceptor),
  interceptor.authorizedForFilms.bind(interceptor),
  controller.patch.bind(controller)
);
filmRouter.delete(
  '/:id',
  interceptor.logged.bind(interceptor),
  interceptor.authorizedForFilms.bind(interceptor),
  controller.deleteById.bind(controller)
);
