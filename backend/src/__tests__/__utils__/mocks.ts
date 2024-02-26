import { Handler } from 'express';
import multer from 'multer';

export const mockMulter = () => {
  jest.mock('multer', () => {
    const originalMulter = jest.requireActual('multer');

    return {
      ...originalMulter,
      memoryStorage: jest.fn(),
    };
  });
};

export const getExpressHandlerMock = (): Handler => (req, res, next) => next();
