/* eslint-disable no-unused-vars */
import createDebug from 'debug';
import { Controller } from './controller.js';
import { Film } from '../entities/film.js';
import { FilmRepo } from '../repository/film.m.repository.js';
import { UserRepo } from '../repository/user.m.repository.js';
import { NextFunction, Request, Response } from 'express';
import { PayloadToken } from '../services/auth.js';

const debug = createDebug('FP:FilmController');

export class FilmController extends Controller<Film> {
  constructor(protected filmRepo: FilmRepo, private userRepo: UserRepo) {
    super();
    debug('Instantiated');
  }

  async post(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = req.body.tokenPayload as PayloadToken;
      const user = await this.userRepo.queryById(userId);
      delete req.body.tokenPayload;
      req.body.owner = userId;
      const newFilm = await this.filmRepo.create(req.body);
      user.films.push(newFilm);
      this.userRepo.update(user.id, user);
      res.status(201);
      res.send(newFilm);
    } catch (error) {
      next(error);
    }
  }
}
