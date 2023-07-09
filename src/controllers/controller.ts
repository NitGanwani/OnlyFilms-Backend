import { NextFunction, Request, Response } from 'express';
import { Repository } from '../repository/repository.js';
import { ApiResponse } from '../types/response.api.js';

export abstract class Controller<T extends { id: string | number }> {
  public repo!: Repository<T>;

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await this.repo.query();
      const response: ApiResponse = {
        items: items.items,
        page: 1,
        count: 0,
      };
      res.send(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.send(await this.repo.queryById(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  async patch(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(202);
      res.send(await this.repo.update(req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(204);
      res.send(await this.repo.delete(req.params.id));
    } catch (error) {
      next(error);
    }
  }
}
