import request from 'supertest';
import app from '../../app';
import { Handler } from 'express';
import { getExpressHandlerMock } from '../__utils__/mocks';
import multer from 'multer';

// create a test for signup but mock what happens inside the signup function
jest.mock('../../controllers/authController', () => ({
  signup: ((req, res, next) => {
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          name: 'John',
        },
      },
    });
  }) as Handler,
  login: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  protect: jest.fn(),
  restrictTo: jest.fn().mockReturnValue(((req, res, next) => next()) as Handler),
}));

jest.mock('multer', () => {
  const multerMock: jest.MockedFunction<typeof multer> & { memoryStorage: jest.Mock } = jest
    .fn()
    .mockImplementation(() => ({
      single: jest.fn().mockImplementation((): Handler => (req, res, next) => next()),
      array: jest.fn().mockImplementation((): Handler => (req, res, next) => next()),
      // Add other methods as needed
    })) as any;
  multerMock.memoryStorage = jest.fn().mockReturnValue('memoryStorage');
  return multerMock;
});

describe('User Routes', () => {
  it('should signup a new user', async () => {
    const response = await request(app).post('/api/v1/users/signup').send({
      name: 'John',
      lastName: 'Doe',
      email: 'jamesnoria@gmail.com',
      password: '123456',
      passwordConfirm: '123456',
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.user.name).toBe('John');
  });
});
