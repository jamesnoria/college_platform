import { Response, Request, NextFunction, ErrorRequestHandler } from 'express';

const ENVIRONMENT = process.env.NODE_ENV;

export class AppError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super();
    this.code = code;
    this.message = message;
    this.stack = ENVIRONMENT === 'production' ? '' : this.stack;
  }
}

const errorHandler: ErrorRequestHandler = (error: any | AppError, req: Request, res: Response, next: NextFunction) => {
  const code = error.code || 500;
  const message = error.message;

  if (code === 11000) {
    const errorMessage = error.message;

    const value = errorMessage.match(/(["'])(\\?.)*?\1/)[0];

    const duplicatedMongoError = `Duplicate field value: ${value}. Please use another value!`;

    return res.status(500).send({
      message: duplicatedMongoError,
      success: false,
      data: null,
    });
  }

  res.status(code).send({
    message,
    success: false,
    data: null,
  });
};

export default errorHandler;
