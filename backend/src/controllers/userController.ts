import { Request, Response } from 'express';
import User from '../models/userModel';
import CatchAsync from '../utils/catchAsync';

export const getAllUsers = CatchAsync(async (req: Request, res: Response) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});
