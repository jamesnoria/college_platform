import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

import errorHandler, { AppError } from './utils/appError';

import morgan from 'morgan';
import userRoute from './routes/userRoutes';

const app = express();

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en una hora',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/users', userRoute);

app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    author: 'James Noria',
    message: 'Hello World 👋',
  });
});

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `No se puede encontrar ${req.originalUrl} en este servidor!`));
});

app.use(errorHandler);

export default app;
