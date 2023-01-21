import multer from 'multer';

const storage = multer.memoryStorage();

interface IFile extends Express.Multer.File {
  buffer: Buffer;
}

const multerFileFilter = (req: Express.Request, file: IFile, cb: any) => {
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
