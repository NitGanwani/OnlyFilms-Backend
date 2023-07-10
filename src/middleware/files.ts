import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../types/http.error.js';
import { FireBase } from '../services/firebase.js';
const debug = createDebug('FP:FileMiddleware');

export class FileMiddleware {
  constructor() {
    debug('Instantiate');
  }

  singleFileStore(fileName = 'file', fileSize = 8_000_000) {
    const upload = multer({
      storage: multer.diskStorage({
        destination: 'public/uploads',
        filename(req, file, callback) {
          const suffix = crypto.randomUUID();
          const extension = path.extname(file.originalname);
          const basename = path.basename(file.originalname, extension);
          const filename = `${basename}-${suffix}${extension}`;
          debug('Called Multer');
          callback(null, filename);
        },
      }),
      limits: {
        fileSize,
      },
    });
    const middleware = upload.single(fileName);
    return (req: Request, res: Response, next: NextFunction) => {
      const previousBody = req.body;
      middleware(req, res, next);
      req.body = { ...previousBody, ...req.body };
    };
  }

  saveDataImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      debug('Called saveImage');
      if (!req.file)
        throw new HttpError(406, 'Not Acceptable', 'Not valid image file');
      const userImage = req.file.filename;
      const firebase = new FireBase();

      const backupImage = await firebase.uploadFile(userImage);

      req.body[req.file.fieldname] = {
        urlOriginal: req.file.originalname,
        url: backupImage,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
