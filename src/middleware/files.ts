import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
// Import sharp from 'sharp';
import { HttpError } from '../types/http.error.js';
const debug = createDebug('FP:FileMiddleware');

// Const optionsSets: {
//   [key: string]: {
//     width: number;
//     height: number;
//     fit: keyof sharp.FitEnum;
//     position: string;
//     quality: number;
//   };
// } = {
//   film: {
//     width: 400,
//     height: 600,
//     fit: 'cover',
//     position: 'top',
//     quality: 100,
//   },
// };

export class FileMiddleware {
  constructor() {
    debug('Instantiate');
  }

  singleFileStore(fileName = 'file', fileSize = 8_000_000) {
    const upload = multer({
      storage: multer.diskStorage({
        destination: 'uploads',
        filename(req, file, callback) {
          console.log({ file });
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
    return middleware;
  }

  // Async optimization(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     if (!req.file) {
  //       throw new HttpError(406, 'Not Acceptable', 'Not valid image file');
  //     }

  //     const options = optionsSets.sighting;
  //     const fileName = req.file.filename;
  //     const baseFileName = `${path.basename(fileName, path.extname(fileName))}`;

  //     const imageData = await sharp(path.join('uploads', fileName))
  //       .resize(options.width, options.height, {
  //         fit: options.fit,
  //         position: options.position,
  //       })
  //       .webp({ quality: options.quality })
  //       .toFormat('webp')
  //       .toFile(path.join('uploads', `${baseFileName}_1.webp`));

  //     req.file.originalname = req.file.path;
  //     req.file.filename = `${baseFileName}.${imageData.format}`;
  //     req.file.mimetype = `image/${imageData.format}`;
  //     req.file.path = path.join('uploads', req.file.filename);
  //     req.file.size = imageData.size;

  //     next();
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  saveDataImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      debug('Called saveImage');
      if (!req.file)
        throw new HttpError(406, 'Not Acceptable', 'Not valid image file');
      const userImage = req.file.filename;
      const imagePath = path.join('uploads', userImage);

      req.body[req.file.fieldname] = {
        urlOriginal: req.file.originalname,
        url: imagePath,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
