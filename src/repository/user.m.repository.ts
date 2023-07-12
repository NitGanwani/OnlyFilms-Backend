import { UserModel } from './user.m.model.js';
import createDebug from 'debug';
import { User } from '../entities/user.js';
import { HttpError } from '../types/http.error.js';
import { Repository } from './repository.js';
const debug = createDebug('FP:UserRepo');

export class UserRepo implements Repository<User> {
  constructor() {
    debug('Instantiated', UserModel);
  }

  async query(): Promise<User[]> {
    const allData = await UserModel.find().populate('films', { id: 0 }).exec();

    return allData;
  }

  async queryById(id: string): Promise<User> {
    const result = await UserModel.findById(id)
      .populate('films', { id: 0 })
      .exec();
    if (result === null)
      throw new HttpError(404, 'Not found', 'No user found with this id');
    return result;
  }

  async search({
    key,
    value,
  }: {
    key: string;
    value: unknown;
  }): Promise<User[]> {
    const result = await UserModel.find({ [key]: value })
      .populate('films', { id: 0 })
      .exec();
    return result;
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const newUser = await UserModel.create(data);
    return newUser;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const newUser = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();
    if (newUser === null)
      throw new HttpError(404, 'Not found', 'Bad id for the update');
    return newUser;
  }

  async delete(id: string): Promise<void> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    if (result === null)
      throw new HttpError(404, 'Not found', 'Bad id for the delete');
  }

  async count(): Promise<number> {
    return UserModel.countDocuments().exec();
  }
}
