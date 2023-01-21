import { Schema, model, ObjectId } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface IUser {
  _id?: ObjectId;
  name: string;
  lastName: string;
  email: string;
  career: string;
  semester: number;
  photo: string;
  role: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: String | undefined;
  passwordResetExpires: Date | undefined;
  isModified: (path: string) => boolean;
  correctPassword: (inputPassword: string, userPassword: string) => Promise<boolean>;
  createPasswordResetToken: () => string;
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Nombre es requerido'],
  },
  lastName: {
    type: String,
    required: [true, 'Apellido es requerido'],
  },
  email: {
    type: String,
    required: [true, 'Email es requerido'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email inválido'],
  },
  career: {
    type: String,
  },
  semester: {
    type: Number,
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  password: {
    type: String,
    required: [true, 'Contraseña es requerida'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirmación de contraseña es requerida'],
    validate: {
      // @ts-ignore
      validator: function (el: string) {
        // @ts-ignore
        return el === this.password;
      },
      message: 'Las contraseñas no coinciden',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (inputPassword: string, userPassword: string) {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000) as any, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = model<IUser>('User', userSchema);

export default User;
