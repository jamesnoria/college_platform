import { NextFunction, Request, Response } from 'express';
import { promisify } from 'util';
import User, { IUser, hashToken } from '../models/userModel';
import { AppError } from '../utils/appError';
import CatchAsync, { ControllerFunction } from '../utils/catchAsync';
import jwt from 'jsonwebtoken';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../utils/firebase';
import Email from '../utils/email';
import { generateJwtToken } from '../utils/jwt';
import { comparePasswordHash } from '../utils/crypto';

interface IGetUserAuthInfoRequest extends Request {
  user: IUser;
}

type SignupRequestBody = {
  name: string;
  lastName: string;
  email: string;
  career: string;
  semester: number;
  password: string;
};

type SignupResponseBody = {
  status: string;
  token: string;
  user: IUser;
};

export const signup: ControllerFunction<SignupRequestBody, SignupResponseBody> = async (input) => {
  const { name, lastName, email, career, semester, password } = input.body;

  let imagSrc = 'users/default.jpeg';

  if (input.file) {
    const imgRef = ref(storage, `users/${input.file.originalname}`);
    const snapshot = await uploadBytes(imgRef, input.file.buffer);
    imagSrc = snapshot.metadata.fullPath;
  }

  const newUser = await User.create({
    name,
    lastName,
    email,
    career,
    semester,
    photo: imagSrc,
    password,
  });

  const userObject = newUser.toObject() as IUser;

  const token = generateJwtToken(userObject._id!);

  await new Email(newUser, 'Bienvenido a esta plataforma de aprendizaje', 'Correo de Bienvenida').send();

  return {
    status: 201,
    data: {
      status: 'success',
      token,
      user: newUser,
    },
  };
};

export const login: ControllerFunction<{ email: string; password: string }, { status: string; token: string }> = async (
  input
) => {
  const { email, password } = input.body;

  if (!email || !password) {
    throw new AppError(400, 'Por favor ingrese un usuario y contraseña');
  }

  const user = (await User.findOne({ email }).select('+password')) as IUser | undefined;

  if (!user) throw new AppError(401, 'Email o contraseña incorrectos');

  const correct = await comparePasswordHash(password, user.password!);

  if (!correct) throw new AppError(401, 'Email o contraseña incorrectos');

  const token = generateJwtToken(user._id!);

  return {
    status: 200,
    data: { status: 'success', token },
  };
};

export const forgotPassword: ControllerFunction<{ email: string }> = async (input) => {
  const user = await User.findOne({ email: input.body.email });
  if (!user) {
    throw new AppError(404, 'No se encontró ningun usuario con ese email');
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${input.baseUrl}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Por favor haga click en este enlace para restablecer su contraseña: \n\n ${resetURL}`;

  try {
    const email = new Email(user, message, 'Restablecer contraseña');
    await email.send();

    return {
      status: 200,
      data: { status: 'success', message: 'Email enviado' },
    };
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError(500, 'Error al enviar el email de restablecimiento de contraseña');
  }
};

export const resetPassword: ControllerFunction<{ password: string }, { status: string; token: string }> = async (
  input
) => {
  const hashedToken = hashToken(input.params.token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(400, 'Token invalido o expirado');
  }

  user.password = input.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const token = generateJwtToken(user?._id);

  return {
    status: 200,
    data: {
      status: 'success',
      token,
    },
  };
};

export const protect = CatchAsync(async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError(401, 'Ningun token ha sido enviado');
  }

  // @ts-ignore
  const decoded: Promise = await promisify(jwt.verify)(token, process.env.JWT_SECRET!);
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    throw new AppError(401, 'Usuario no encontrado');
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    throw new AppError(401, 'La contraseña ha sido cambiada');
  }

  req.user = freshUser.toObject() as IUser;

  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: IGetUserAuthInfoRequest, res: Response | any, next: NextFunction | any) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'No tienes permisos para realizar esta acción');
    }
    next();
  };
};
