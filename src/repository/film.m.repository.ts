import createDebug from 'debug';
import { Repository } from './repository.js';
import { Film } from '../entities/film.js';
import { FilmModel } from './film.m.model.js';
import { HttpError } from '../types/http.error.js';
import { ApiResponse } from '../types/response.api.js';

const debug = createDebug('FP:FilmRepo');

export class FilmRepo implements Repository<Film> {
  constructor() {
    debug('Instantiated');
  }

  async count(): Promise<number> {
    const pageCount = await FilmModel.find().count();
    return pageCount;
  }

  async query(offset = 0): Promise<ApiResponse> {
    const limit = 6;

    const items = await FilmModel.find()
      .populate('owner', { films: 0 })
      .skip(offset * limit)
      .limit(limit)
      .exec();

    const count = await this.count();

    const response = {
      items,
      page: offset + 1,
      count,
    };

    return response as ApiResponse;
  }

  async queryById(id: string): Promise<Film> {
    const result = await FilmModel.findById(id)
      .populate('owner', { films: 0 })
      .exec();
    if (result === null)
      throw new HttpError(404, 'Not found', 'Wrong id for the query');
    return result;
  }

  async search({
    key,
    value,
  }: {
    key: string;
    value: unknown;
  }): Promise<Film[]> {
    const result = await FilmModel.find({ [key]: value })
      .populate('owner', { films: 0 })
      .exec();
    return result;
  }

  async create(data: Omit<Film, 'id'>): Promise<Film> {
    const newFilm = await FilmModel.create(data);
    return newFilm;
  }

  async update(id: string, data: Partial<Film>): Promise<Film> {
    const newFilm = await FilmModel.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate('owner', { films: 0 })
      .exec();
    if (newFilm === null)
      throw new HttpError(404, 'Not found', 'Wrong id for the update');
    return newFilm;
  }

  async delete(id: string): Promise<void> {
    const result = await FilmModel.findByIdAndDelete(id).exec();
    if (result === null)
      throw new HttpError(404, 'Not found', 'Wrong id for the delete');
  }
}
