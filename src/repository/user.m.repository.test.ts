import { User } from '../entities/user.js';
import { HttpError } from '../types/http.error.js';
import { UserModel } from './user.m.model.js';
import { UserRepo } from './user.m.repository.js';

jest.mock('./user.m.model');

describe('Given the UserRepo class', () => {
  const repo = new UserRepo();
  describe('When it has been instantiated', () => {
    test('Then the query method should be used', async () => {
      const mockData = [{}];

      const exec = jest.fn().mockResolvedValueOnce(mockData);
      UserModel.find = jest.fn().mockReturnValueOnce({ exec });

      const result = await repo.query();
      expect(UserModel.find).toHaveBeenCalled();
      expect(exec).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    test('Then the queryById method should be used', async () => {
      const mockId = '1';
      const mockUser = {
        id: '1',
        userName: 'Nitin',
        email: 'nitin@email.com',
        password: '',
      };

      const exec = jest.fn().mockResolvedValueOnce(mockUser);
      UserModel.findById = jest.fn().mockReturnValueOnce({ exec });

      const result = await repo.queryById(mockId);
      expect(UserModel.findById).toHaveBeenCalledWith(mockId);
      expect(exec).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    test('Then the create method should be used', async () => {
      const mockUser = {
        userName: 'Nitin',
        email: 'nitin@email.com',
        password: '',
      };

      UserModel.create = jest.fn().mockReturnValueOnce(mockUser);
      const result = await repo.create(mockUser);
      expect(UserModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    test('Then the update method should be used', async () => {
      const mockId = '1';
      const mockUser = { id: '1', userName: 'Nitin' };
      const updatedUser = { id: '1', userName: 'Marco' };
      const exec = jest.fn().mockResolvedValueOnce(updatedUser);
      UserModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce({
        exec,
      });
      const result = await repo.update(mockId, mockUser);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    test('Then the search method should be used', async () => {
      const mockUsers = [{ id: '1', userName: 'Nitin' }];

      const exec = jest.fn().mockResolvedValueOnce(mockUsers);
      UserModel.find = jest.fn().mockReturnValueOnce({
        exec,
      });
      const result = await repo.search({ key: 'userName', value: 'Nitin' });
      expect(UserModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    test('Then the delete method should be used', async () => {
      const mockId = '1';
      const exec = jest.fn();
      UserModel.findByIdAndDelete = jest.fn().mockReturnValueOnce({
        exec,
      });
      await repo.delete(mockId);
      expect(UserModel.findByIdAndDelete).toHaveBeenCalled();
    });
  });

  describe('When it is instantiated and queryById method is called but the id is not found', () => {
    test('Then it should throw an error', async () => {
      const repo = new UserRepo();
      const error = new HttpError(
        404,
        'Not found',
        'No user found with this id'
      );
      const mockId = '1';

      const exec = jest.fn().mockResolvedValue(null);
      UserModel.findById = jest.fn().mockReturnValueOnce({
        exec,
      });

      await expect(repo.queryById(mockId)).rejects.toThrowError(error);
      expect(UserModel.findById).toHaveBeenCalled();
    });
  });

  describe('When it is instantiated and update method is called but the new user equals to null', () => {
    test('Then it should throw an error', async () => {
      const repo = new UserRepo();
      const error = new HttpError(404, 'Not found', 'Bad id for the update');
      const mockId = '1';
      const mockUser = {} as Partial<User>;

      const exec = jest.fn().mockResolvedValue(null);
      UserModel.findByIdAndUpdate = jest.fn().mockReturnValueOnce({
        exec,
      });

      await expect(repo.update(mockId, mockUser)).rejects.toThrowError(error);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('When it is instantiated and delete method is called but the id is not found', () => {
    test('Then it should throw an error', async () => {
      const repo = new UserRepo();
      const error = new HttpError(404, 'Not found', 'Bad id for the delete');
      const mockId = '1';
      const exec = jest.fn().mockResolvedValueOnce(null);
      UserModel.findByIdAndDelete = jest.fn().mockReturnValueOnce({
        exec,
      });
      await expect(repo.delete(mockId)).rejects.toThrowError(error);
      expect(UserModel.findByIdAndDelete).toHaveBeenCalled();
    });
  });
});
