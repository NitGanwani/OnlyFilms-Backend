import { NextFunction, Request, Response } from 'express';
import { AuthServices, PayloadToken } from '../services/auth';
import { AuthInterceptor } from './auth.interceptor';
import { FilmRepo } from '../repository/film.m.repository';
import { HttpError } from '../types/http.error';

jest.mock('../services/auth');

describe('Given the AuthInterceptor middleware', () => {
  describe('When it is instantiated', () => {
    const mockRepo = {} as unknown as FilmRepo;
    const mockPayload = {} as PayloadToken;
    const req = {
      body: { tokenPayload: mockPayload },
    } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn() as NextFunction;
    const interceptor = new AuthInterceptor(mockRepo);

    test('Then the logged method should be used', () => {
      req.get = jest.fn().mockReturnValueOnce('Bearer test');
      (AuthServices.verifyJWTGettingPayload as jest.Mock).mockResolvedValueOnce(
        mockPayload
      );
      interceptor.logged(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('Then the logged method should throw an error when there is no authHeader', () => {
      const error = new HttpError(
        401,
        'Not Authorized',
        'Not Authorization header'
      );
      (AuthServices.verifyJWTGettingPayload as jest.Mock).mockResolvedValueOnce(
        mockPayload
      );
      interceptor.logged(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('Then the logged method should throw an error when authHeader does not start with Bearer', () => {
      const error = new HttpError(
        401,
        'Not Authorized',
        'Not Bearer in Authorization header'
      );
      req.get = jest.fn().mockReturnValueOnce('No Bearer');
      (AuthServices.verifyJWTGettingPayload as jest.Mock).mockResolvedValueOnce(
        mockPayload
      );
      interceptor.logged(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('When it is instantiated', () => {
    const mockFilmRepo = {
      queryById: jest.fn().mockResolvedValue({ owner: { id: '6' } }),
    } as unknown as FilmRepo;
    const mockPayload = { id: '6' } as PayloadToken;
    const mockFilmId = '2';
    const req = {
      body: { tokenPayload: mockPayload },
      params: { id: mockFilmId },
    } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn() as NextFunction;
    const authInterceptor = new AuthInterceptor(mockFilmRepo);

    test('Then the authorizedForFilms method should be used', async () => {
      authInterceptor.authorizedForFilms(req, res, next);
      await expect(mockFilmRepo.queryById).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('Then the authorizedForFilms method should throw an error when there is no token in the body', () => {
      const error = new HttpError(
        498,
        'Token not found',
        'Token not found in Authorized interceptor'
      );
      const mockPayload = null;
      const req = {
        body: { tokenPayload: mockPayload },
      } as unknown as Request;

      authInterceptor.authorizedForFilms(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('Then the authorizedForFilms method should throw an error when the film owner id does not match with the id from the request params', async () => {
      const error = new HttpError(401, 'Not authorized', 'Not authorized');
      const mockUserId = { id: '7' };
      const mockFilmId = { id: '3', owner: { id: '6' } };
      const req = {
        body: { tokenPayload: mockUserId },
        params: mockFilmId,
      } as unknown as Request;

      authInterceptor.authorizedForFilms(req, res, next);
      await expect(mockFilmRepo.queryById).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
