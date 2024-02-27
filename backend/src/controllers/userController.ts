import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import CatchAsync, { ControllerFunction } from '../utils/catchAsync';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';
import { AppError } from '../utils/appError';

export const getAllUsers: ControllerFunction<
  undefined,
  { status: string; results: number; data: { users: IUser[] } }
> = async (input) => {
  const users = await User.find();

  // This might take more time but otherwise you can get blocked by the number of requests you can make to the server at the same time
  const usersWithImg: IUser[] = [];
  for (const user of users) {
    const userObject = user.toObject() as IUser;
    const imgRef = ref(storage, user.photo);
    const imgURL = await getDownloadURL(imgRef);
    usersWithImg.push({
      ...userObject,
      photo: imgURL,
    });
  }

  return {
    status: 200,
    data: {
      status: 'success',
      results: users.length,
      data: {
        users: usersWithImg,
      },
    },
  };
};

export const getMe: ControllerFunction<undefined, { status: string; user: IUser }> = async (input) => {
  const user = await User.findById(input.user?._id);

  if (!user) {
    throw new AppError(404, 'No user found with that ID');
  }

  const imgRef = ref(storage, user.photo);
  const imgURL = await getDownloadURL(imgRef);

  const userObject = user.toObject() as IUser;

  return {
    status: 200,
    data: {
      status: 'success',
      user: { ...userObject, photo: imgURL },
    },
  };
};

type UpdateMeRequestBody = {
  name: string;
  lastName: string;
  email: string;
  career: string;
  semester: number;
  password: string;
};

export const updateMe: ControllerFunction<UpdateMeRequestBody, { status: string; user: IUser }> = async (input) => {
  if (input.body.password) {
    throw new AppError(400, 'This route is not for password updates. Please use /updateMyPassword.');
  }

  let filteredBody: Record<string, unknown> = {
    name: input.body.name,
    lastName: input.body.lastName,
    email: input.body.email,
    career: input.body.career,
    semester: input.body.semester,
  };

  if (input.file) {
    const imgRef = ref(storage, `users/${input.file.originalname}`);
    const snapshot = await uploadBytes(imgRef, input.file.buffer);
    const photoFullPath = snapshot.metadata.fullPath;
    filteredBody = { ...filteredBody, photo: photoFullPath };
  }

  const updateUser = await User.findByIdAndUpdate(input.user?._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  return {
    status: 200,
    data: {
      status: 'success',
      user: updateUser?.toObject() as IUser,
    },
  };
};

export const deleteMe: ControllerFunction<undefined, { status: string }> = async (input) => {
  await User.findByIdAndUpdate(input.user?._id, { active: false });
  return {
    status: 204,
    data: {
      status: 'success',
    },
  };
};
