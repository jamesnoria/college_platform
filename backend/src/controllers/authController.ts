import { NextFunction, Request, Response } from 'express';
import { promisify } from 'util';
import User, { IUser, hashToken } from '../models/userModel';
import { AppError } from '../utils/appError';
import CatchAsync from '../utils/catchAsync';
import { ObjectId } from 'mongoose';
import jwt from 'jsonwebtoken';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../utils/firebase';
import Email from '../utils/email';

interface IGetUserAuthInfoRequest extends Request {
  user: IUser;
}

const signToken = (id: ObjectId | undefined) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = CatchAsync(async (req: Request, res: Response) => {
  const { name, lastName, email, career, semester, password, passwordConfirm } = req.body;

  // TODO: create a default photo for users
  const imgRef = ref(storage, `users/${req.file!.originalname}`);
  const snapshot = await uploadBytes(imgRef, req.file!.buffer);

  const newUser = await User.create({
    name,
    lastName,
    email,
    career,
    semester,
    photo: snapshot.metadata.fullPath,
    password,
    passwordConfirm,
  });

  const token = signToken(newUser._id);

  await new Email(newUser, 'Bienvenido a la plataforma de Aprendizaje UDH', 'Correo de Bienvenida').send();

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

export const forgotPassword = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(404, 'No se encontró ningun usuario con ese email'));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Por favor haga click en este enlace para restablecer su contraseña: \n\n ${resetURL}`;

  try {
    const email = new Email(user, message, 'Restablecer contraseña');
    await email.send();

    res.status(200).json({
      status: 'success',
      message: 'Email enviado',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(500, 'Error al enviar el email de restablecimiento de contraseña'));
  }
});

export const resetPassword = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = hashToken(req.params.token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError(400, 'Token invalido o expirado'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

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

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(401, 'La contraseña ha sido cambiada'));
  }

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
