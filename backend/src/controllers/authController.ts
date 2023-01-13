import { Request, Response } from 'express';
import User from '../models/userModel';
import CatchAsync from '../utils/catchAsync';

export const signup = CatchAsync(async (req: Request, res: Response) => {
  const { name, lastName, email } = req.body;

  const newUser = await User.create({
    name,
    lastName,
    email,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
