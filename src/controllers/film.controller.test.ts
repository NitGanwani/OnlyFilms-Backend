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

    test('Then it should calculate the next page URL if there are more pages', async () => {
      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      req.query = { page: '1' };

      mockFilmRepo.count = jest.fn().mockResolvedValue(8);
      mockFilmRepo.query = jest
        .fn()
        .mockResolvedValue([{}, {}, {}, {}, {}, {}]);

      await controller.getAll(req, res, next);

      expect(mockFilmRepo.query).toHaveBeenCalledWith(1, 6);
      expect(mockFilmRepo.count).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();

      const response = (res.send as jest.Mock).mock.calls[0][0];
      expect(response.next).toEqual('http://localhost:7777/film?page=2');
    });

    test('Then it should calculate the next page URL if there are more pages', async () => {
      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      const genre = 'Comedy';
      req.query = { page: '1', genre };

      mockFilmRepo.count = jest.fn().mockResolvedValue(8);
      mockFilmRepo.query = jest
        .fn()
        .mockResolvedValue([{}, {}, {}, {}, {}, {}]);

      await controller.getAll(req, res, next);

      expect(mockFilmRepo.query).toHaveBeenCalledWith(1, 6, genre);
      expect(mockFilmRepo.count).toHaveBeenCalledWith(genre);
      expect(res.send).toHaveBeenCalled();

      const response = (res.send as jest.Mock).mock.calls[0][0];
      expect(response.next).toEqual(
        `http://localhost:7777/film?genre=${genre}&page=2`
      );
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
      const mockUser = {
        id: '2',
        userName: 'Joseba',
        films: [{ id: '1' }],
      } as unknown as User;

      mockFilmRepo.delete = jest.fn();
      mockUserRepo.queryById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepo.update = jest.fn().mockResolvedValue(mockUser);

      req.body = {
        tokenPayload: { id: '2' },
      };
      req.params = {
        id: '1',
      };

      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      await controller.deleteById(req, res, next);

      expect(mockFilmRepo.delete).toHaveBeenCalledWith('1');
      expect(mockUserRepo.queryById).toHaveBeenCalledWith('2');
      expect(mockUserRepo.update).toHaveBeenCalledWith('2', {
        ...mockUser,
        films: [],
      });

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    test('Then the delete method should throw an error when the token payload is missing', async () => {
      req.body = {
        tokenPayload: undefined,
      };
      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      await controller.deleteById(req, res, next);

      expect(mockFilmRepo.delete).not.toHaveBeenCalled();
      expect(mockUserRepo.queryById).not.toHaveBeenCalled();
      expect(mockUserRepo.update).not.toHaveBeenCalled();

      expect(next).toHaveBeenCalledWith(expect.any(Error));
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
  });

  describe('When it is instantiated and addComment method is called', () => {
    test('Then it should add a comment to a film and return the updated film', async () => {
      const mockUser: User = {
        id: '1',
        userName: 'Kevin',
        createdFilm: [],
      } as unknown as User;

      const mockFilm: Film = {
        id: '1',
        title: 'Scarface',
        owner: '2',
        comments: [],
      } as unknown as Film;

      mockUserRepo.queryById = jest.fn().mockResolvedValue(mockUser);
      mockFilmRepo.queryById = jest.fn().mockResolvedValue(mockFilm);
      mockFilmRepo.update = jest.fn().mockResolvedValue(mockFilm);

      req.body = {
        tokenPayload: { id: '1' },
        comment: 'I want the world chico',
      };
      req.params = {
        id: '1',
      };

      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      await controller.addComment(req, res, next);

      expect(mockUserRepo.queryById).toHaveBeenCalledWith('1');
      expect(mockFilmRepo.queryById).toHaveBeenCalledWith('1');
      expect(mockFilmRepo.update).toHaveBeenCalledWith('1', mockFilm);

      expect(res.send).toHaveBeenCalledWith(mockFilm);
    });

    test('Then it should throw an error when the user token is missing', async () => {
      req.body = {
        userToken: undefined,
      };

      const controller = new FilmController(mockFilmRepo, mockUserRepo);
      await controller.addComment(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
