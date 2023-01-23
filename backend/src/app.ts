import express, { Request, Response, NextFunction } from 'express';

import errorHandler, { AppError } from './utils/appError';

import morgan from 'morgan';
import userRoute from './routes/userRoutes';

const app = express();

app.use(express.json());
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

app.all('*', (req, res, next) => {
  throw new AppError(404, `${req.originalUrl} no es un endpoint válido`);
});

app.use(errorHandler);

export default app;
