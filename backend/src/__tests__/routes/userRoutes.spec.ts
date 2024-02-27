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
  login: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  protect: jest.fn().mockImplementation((req, res, next) => next()),
  restrictTo: jest.fn().mockImplementation((): RequestHandler => (req, res, next) => next()),
}));

describe('User Routes', () => {
  describe('POST /api/v1/users/signup', () => {
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

    it('should signup a new user', async () => {
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
      expect(signupMock).toHaveBeenCalledTimes(1);

      signupMock.mockRestore();
    });
  });

  describe('POST /api/v1/users/login', () => {
    const loginMock = authController.login as jest.MockedFunction<typeof authController.login>;

    loginMock.mockResolvedValue({
      status: 200,
      data: {
        status: 'success',
        token: 'thisIsAToken',
      },
    });

    it('should login a user', async () => {
      const response = await request(app).post('/api/v1/users/login').send({
        email: 'john.doe@example.org',
        password: '123456789',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(loginMock).toHaveBeenCalledTimes(1);

      loginMock.mockRestore();
    });
  });

  describe('POST /api/v1/users/forgotPassword', () => {
    const forgotPasswordMock = authController.forgotPassword as jest.MockedFunction<
      typeof authController.forgotPassword
    >;

    forgotPasswordMock.mockResolvedValue({
      status: 200,
      data: {
        status: 'success',
        message: 'Password reset link sent to email',
      },
    });

    it('should send a password reset link', async () => {
      const response = await request(app).post('/api/v1/users/forgotPassword').send({
        email: 'john.doe@example.org',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(forgotPasswordMock).toHaveBeenCalledTimes(1);

      forgotPasswordMock.mockRestore();
    });
  });

  describe('PATCH /api/v1/users/resetPassword/:token', () => {
    const resetPasswordMock = authController.resetPassword as jest.MockedFunction<typeof authController.resetPassword>;

    resetPasswordMock.mockResolvedValue({
      status: 200,
      data: {
        status: 'success',
        token: 'thisIsAToken',
      },
    });

    it('should reset a user password', async () => {
      const response = await request(app).patch('/api/v1/users/resetPassword/123456').send({
        password: 'newPassword',
        passwordConfirm: 'newPassword',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(resetPasswordMock).toHaveBeenCalledTimes(1);

      resetPasswordMock.mockRestore();
    });
  });
});
