/* eslint-disable no-unused-vars */
import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { FileMiddleware } from './files';
import { HttpError } from '../types/http.error';

type MockMulter = jest.Mock & { diskStorage: jest.Mock };

jest.mock('multer', () => {
  const multer: MockMulter = jest.fn().mockImplementation(() => ({
    single: jest.fn(),
  })) as MockMulter;

  multer.diskStorage = jest.fn().mockImplementation(
    (options: {
      destination: 'folder';

      filename: (req: object, file: object, cb: () => void) => void;
    }) => {
      options.filename({}, { originalname: '' }, () => null);
    }
  );
  return multer;
});

describe('Given a FileMiddleware class', () => {
  describe('When the singleFileStore method is used', () => {
    test('Then it should call multer to store a single file', () => {
      const filesMiddleware = new FileMiddleware();

      filesMiddleware.singleFileStore();

      expect(multer).toHaveBeenCalled();
      expect(multer.diskStorage).toHaveBeenCalled();
    });
  });

  describe('When method saveImage is used with valid data', () => {
    const req = {
      body: {},
      file: { filename: 'image.jpg', originalname: 'image.jpg' },
    } as Request;
    const resp = {} as unknown as Response;
    const next = jest.fn() as NextFunction;

    test('Then it should call next without parameters', async () => {
      const filesMiddleware = new FileMiddleware();
      await filesMiddleware.saveDataImage(req, resp, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('When method saveImage is used with NOT valid data', () => {
    const req = {} as Request;
    const resp = {} as unknown as Response;
    const next = jest.fn() as NextFunction;

    test('Then it should call next with the error', () => {
      const error = new HttpError(
        406,
        'Not Acceptable',
        'Not valid image file'
      );
      const filesMiddleware = new FileMiddleware();
      filesMiddleware.saveDataImage(req, resp, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
