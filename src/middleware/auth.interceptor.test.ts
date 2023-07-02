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
      req.get = jest.fn().mockReturnValueOnce('Authorization');
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
      (AuthServices.verifyJWTGettingPayload as jest.Mock).mockResolvedValueOnce(
        mockPayload
      );
      interceptor.logged(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('When it is instantiated', () => {
    const mockFilmRepo = {
      queryById: jest.fn(),
    } as unknown as FilmRepo;
    const mockPayload = { id: '1' } as PayloadToken;
    const mockFilmId = '2';
    const req = {
      body: { tokenPayload: mockPayload },
      params: { id: mockFilmId },
    } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn() as NextFunction;
    const authInterceptor = new AuthInterceptor(mockFilmRepo);

    test.only('Then the authorizedForFilms should be used', () => {
      authInterceptor.authorizedForFilms(req, res, next);
      expect(mockFilmRepo.queryById).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('Then the authorizedForFilms should throw an error when there is no tokenPayload in the body from request', () => {
      const error = new HttpError(
        498,
        'Token not found',
        'Token not found in Authorized interceptor'
      );

      authInterceptor.authorizedForFilms(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
