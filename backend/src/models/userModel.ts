import { Schema, model, ObjectId } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

export interface IUser {
  _id: ObjectId;
  name: string;
  lastName: string;
  email: string;
  career: string;
  semester: number;
  photo?: string;
  role: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: String;
  passwordResetExpires: Date;
  isModified: (path: string) => boolean;
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

const User = model<IUser>('User', userSchema);

export default User;
