import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import { AppError } from '../utils/appError';
import CatchAsync from '../utils/catchAsync';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongoose';

const signToken = (id: ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = CatchAsync(async (req: Request, res: Response) => {
  const { name, lastName, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({
    name,
    lastName,
    email,
    password,
    passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// export const login = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return next(new AppError(400, 'Por favor ingrese un usuario y contraseña'));
//   }

//   const user = await User.findOne({ email }).select('+password');
//   const correct = await user.correctPassword(password, user.password);

//   if (!user || !correct) {
//     return next(new AppError('Email o contraseña incorrectos', 401));
//   }

//   const token = signToken(user._id);

//   res.status(200).json({
//     status: 'success',
//     token
//   });
// });
