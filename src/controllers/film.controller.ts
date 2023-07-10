/* eslint-disable no-unused-vars */
import createDebug from 'debug';
import { Controller } from './controller.js';
import { Film } from '../entities/film.js';
import { FilmRepo } from '../repository/film.m.repository.js';
import { UserRepo } from '../repository/user.m.repository.js';
import { NextFunction, Request, Response } from 'express';
import { PayloadToken } from '../services/auth.js';
import { ApiResponse } from '../types/response.api.js';

const debug = createDebug('FP:FilmController');

export class FilmController extends Controller<Film> {
  constructor(public repo: FilmRepo, private userRepo: UserRepo) {
    super();
    debug('Instantiated');
  }

  async post(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId } = req.body.tokenPayload as PayloadToken;
      const user = await this.userRepo.queryById(userId);
      delete req.body.tokenPayload;
      req.body.owner = userId;
      const newFilm = await this.repo.create(req.body);
      user.films.push(newFilm);
      this.userRepo.update(user.id, user);
      res.status(201);
      res.send(newFilm);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page as string) || 1;
      const limit = 6;
      const genre = req.query.genre as string;

      let items: Film[] = [];
      let next = null;
      let previous = null;
      let baseUrl = '';

      if (genre) {
        items = await this.repo.query(page, limit, genre);

        const totalCount = await this.repo.count(genre);

        const totalPages = Math.ceil(totalCount / limit);

        baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

        if (page < totalPages) {
          next = `${baseUrl}?genre=${genre}&page=${page + 1}`;
        }

        if (page > 1) {
          previous = `${baseUrl}?genre=${genre}&page=${page - 1}`;
        }

        const response: ApiResponse = {
          items,
          count: await this.repo.count(genre),
          previous,
          next,
        };
        res.send(response);
      } else {
        items = await this.repo.query(page, limit);
        const totalCount = await this.repo.count();

        const totalPages = Math.ceil(totalCount / limit);

        baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

        if (page < totalPages) {
          next = `${baseUrl}?page=${page + 1}`;
        }

        if (page > 1) {
          previous = `${baseUrl}?page=${page - 1}`;
        }

        const response: ApiResponse = {
          items,
          count: await this.repo.count(),
          previous,
          next,
        };
        res.send(response);
      }
    } catch (error) {
      next(error);
    }
  }
}
