import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 12);
};

export const comparePasswordHash = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};
