import request from 'supertest';
import app from '../../app';
import { Handler, RequestHandler } from 'express';
import * as authController from '../../controllers/authController';
import multer from 'multer';
import { IUser } from '../../models/userModel';

jest.mock('multer', () => {
  const multerMock: jest.MockedFunction<typeof multer> & { memoryStorage: jest.Mock } = jest
    .fn()
    .mockImplementation(() => ({
      single: jest.fn().mockImplementation((): Handler => (req, res, next) => next()),
      array: jest.fn().mockImplementation((): Handler => (req, res, next) => next()),
    })) as any;
  multerMock.memoryStorage = jest.fn().mockReturnValue('memoryStorage');
  return multerMock;
});

jest.mock('../../controllers/authController', () => ({
  signup: jest.fn(),
  protect: jest.fn().mockImplementation((req, res, next) => next()),
  restrictTo: jest.fn().mockImplementation((): RequestHandler => (req, res, next) => next()),
}));

describe('User Routes', () => {
  it('should signup a new user', async () => {
    const signupMock = authController.signup as jest.MockedFunction<typeof authController.signup>;
    signupMock.mockResolvedValue({
      status: 201,
      data: {
        status: 'success',
        token: 'thisIsAToken',
        user: {
          name: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.org',
        } as unknown as IUser,
      },
    });

    const response = await request(app).post('/api/v1/users/signup').send({
      name: 'John',
      lastName: 'Doe',
      email: 'jamesnoria@gmail.com',
      password: '123456789',
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.user.name).toBe('John');
    expect(response.body.token).toBeDefined();

    signupMock.mockRestore();
  });
});
