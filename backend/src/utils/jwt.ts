import jwt from 'jsonwebtoken';

export const generateJwtToken = (id: string) => {
  const secret = process.env.JWT_SECRET || 'no-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  if (!process.env.JWT_SECRET && !process.env.JWT_EXPIRES_IN && process.env.NODE_ENV !== 'test') {
    throw new Error('No JWT secret provided');
  }

  return jwt.sign({ id }, secret, {
    expiresIn: expiresIn,
  });
};
