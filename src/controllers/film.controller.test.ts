import { NextFunction, Request, Response } from 'express';
import { FilmRepo } from '../repository/film.m.repository';
import { UserRepo } from '../repository/user.m.repository';
import { FilmController } from './film.controller';
import { User } from '../entities/user';
import { Film } from '../entities/film';

let mockFilmRepo: FilmRepo;
let mockUserRepo: UserRepo;
let req: Request;
let res: Response;
let next: NextFunction;

describe('Given the FilmController class', () => {
  beforeEach(() => {
    mockUserRepo = {
      queryById: jest.fn(),
      update: jest.fn(),
    } as unknown as UserRepo;
    mockFilmRepo = {
      query: jest.fn(),
      queryById: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as unknown as FilmRepo;

    req = {
      query: {},
      body: {},
      params: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:7777'),
      baseUrl: '/film',
    } as unknown as Request;
    res = {
      send: jest.fn(),
      status: jest.fn(),
    } as unknown as Response;
    next = jest.fn() as NextFunction;
  });
  describe('When it is instantiated and the getAll method is used', () => {
    test('Then the query method should have been called', async () => {
      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      req.query = { page: '2' };
      await controller.getAll(req, res, next);
      expect(mockFilmRepo.query).toHaveBeenCalledWith(2, 6);
      expect(mockFilmRepo.count).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });

    test('Then the query method should be called with "genre"', async () => {
      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      req.query = { page: '2', genre: 'Action' };

      await controller.getAll(req, res, next);
      expect(mockFilmRepo.query).toHaveBeenCalledWith(2, 6, 'Action');
      expect(mockFilmRepo.count).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });

    test('Then the getById method should be used', async () => {
      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      await controller.getById(req, res, next);
      expect(res.send).toHaveBeenCalled();
      expect(mockFilmRepo.queryById).toHaveBeenCalled();
    });

    test('Then the post method should be called', async () => {
      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      const mockUser = {
        id: '1',
        userName: 'David el Terrible',
        films: [],
      } as unknown as User;

      const mockFilm = {
        id: '3',
        title: 'Avatar',
        owner: '1',
      } as unknown as Film;

      mockFilmRepo.create = jest.fn().mockResolvedValueOnce(mockFilm);
      mockUserRepo.queryById = jest.fn().mockResolvedValueOnce(mockUser);
      mockUserRepo.update = jest.fn().mockResolvedValueOnce(mockUser);

      req.body = {
        tokenPayload: { id: '1' },
        title: 'Avatar',
        owner: '',
      };

      await controller.post(req, res, next);

      expect(mockFilmRepo.create).toHaveBeenCalledWith(req.body);
      expect(mockUserRepo.queryById).toHaveBeenCalledWith('1');
      expect(mockUserRepo.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockFilm);
    });

    test('Then the patch method should be used', async () => {
      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      await controller.patch(req, res, next);
      expect(res.status).toHaveBeenCalledWith(202);
      expect(mockFilmRepo.update).toHaveBeenCalled();
    });

    test('Then the delete method should be used', async () => {
      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      await controller.deleteById(req, res, next);
      expect(res.send).toHaveBeenCalled();
      expect(mockFilmRepo.delete).toHaveBeenCalled();
    });
  });

  describe('When the methods are called with errors', () => {
    const error = new Error('error');
    const mockUserRepo = {} as unknown as UserRepo;
    const mockFilmRepo = {
      query: jest.fn().mockRejectedValue(error),
      queryById: jest.fn().mockRejectedValue(error),
      create: jest.fn().mockRejectedValue(error),
      update: jest.fn().mockRejectedValue(error),
      delete: jest.fn().mockRejectedValue(error),
    } as unknown as FilmRepo;

    const newReq = {
      params: { id: '1' },
      body: { tokenPayload: {} },
      query: { offset: '77' },
    } as unknown as Request;
    const newRes = {
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;
    const newController = new FilmController(mockFilmRepo, mockUserRepo);

    test('Then the getAll method should handle errors', async () => {
      await newController.getAll(newReq, newRes, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('Then the getById method should handle errors', async () => {
      await newController.getById(newReq, newRes, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('Then the post method should handle errors', async () => {
      await newController.post(newReq, newRes, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('Then the patch method should handle errors', async () => {
      await newController.patch(newReq, newRes, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('Then the deleteById method should handle errors', async () => {
      await newController.deleteById(newReq, newRes, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
