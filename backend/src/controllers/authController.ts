import { NextFunction, Request, Response } from 'express';
import { promisify } from 'util';
import User, { IUser } from '../models/userModel';
import { AppError } from '../utils/appError';
import CatchAsync from '../utils/catchAsync';
import { ObjectId } from 'mongoose';
import jwt from 'jsonwebtoken';

interface IGetUserAuthInfoRequest extends Request {
  user: IUser;
}

const signToken = (id: ObjectId | undefined) => {
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

export const login = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(400, 'Por favor ingrese un usuario y contraseña'));
  }

  const user = (await User.findOne({ email }).select('+password')) as IUser;
  const correct = await user.correctPassword(password, user!.password);

  if (!user || !correct) {
    return next(new AppError(401, 'Email o contraseña incorrectos'));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

export const protect = CatchAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(401, 'Ningun token ha sido enviado'));
  }

  // @ts-ignore
  const decoded: Promise = await promisify(jwt.verify)(token, process.env.JWT_SECRET!);
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(new AppError(401, 'Usuario no encontrado'));
  }

  // if (freshUser.changedPasswordAfter(decoded.iat)) {
  //   return next(new AppError('La contraseña ha sido cambiada', 401));
  // }

  req.user = freshUser;

  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: IGetUserAuthInfoRequest, res: Response | any, next: NextFunction | any) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'No tienes permisos para realizar esta acción'));
    }
    next();
  };
};
