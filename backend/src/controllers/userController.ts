import { Request, Response } from 'express';
import User from '../models/userModel';
import CatchAsync from '../utils/catchAsync';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';

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
