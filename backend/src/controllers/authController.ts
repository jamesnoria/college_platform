import { RequestHandler } from 'express';
import User from '../models/userModel';

export const signup: RequestHandler = async (req, res) => {
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
};
