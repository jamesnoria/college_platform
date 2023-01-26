import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import CatchAsync from '../utils/catchAsync';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';
import { AppError } from '../utils/appError';

//ask david
interface IGetUserAuthInfoRequest extends Request {
  user: {
    id: string;
  };
}

//ask david
const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getAllUsers = CatchAsync(async (req: Request, res: Response) => {
  const users = await User.find();

  const usersWithImg = await Promise.all(
    users.map(async (user) => {
      const imgRef = ref(storage, user.photo);
      const imgURL = await getDownloadURL(imgRef);
      return { ...user.toJSON(), photo: imgURL };
    })
  );

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: usersWithImg,
    },
  });
});

export const getMe = CatchAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError(404, 'No user found with that ID'));
  }

  const imgRef = ref(storage, user.photo);
  const imgURL = await getDownloadURL(imgRef);

  res.status(200).json({
    status: 'success',
    data: {
      user: { ...user.toJSON(), photo: imgURL },
    },
  });
});

export const updateMe = CatchAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  if (req.body.password || req.body.passwordConfirm) {
    next(new AppError(400, 'This route is not for password updates. Please use /updateMyPassword.'));
  }

  const filteredBody = filterObj(req.body, 'name', 'lastName', 'email', 'career', 'semester');

  if (req.file) {
    const imgRef = ref(storage, `users/${req.file.originalname}`);
    const snapshot = await uploadBytes(imgRef, req.file.buffer);
    filteredBody.photo = snapshot.metadata.fullPath;
  }

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

export const deleteMe = CatchAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
