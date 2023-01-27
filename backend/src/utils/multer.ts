import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

interface IFileFilterCallback extends FileFilterCallback {
  (error: Error | null, acceptFile: boolean): void;
}

const multerFileFilter = (req: Request, file: Express.Multer.File, cb: IFileFilterCallback) => {
  if (!file.mimetype.startsWith('image')) {
    cb(new Error('Not an image! Please upload an image.'), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter: multerFileFilter,
});

export default upload;
