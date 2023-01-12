import express from 'express';
import morgan from 'morgan';
import userRoute from './routes/userRoutes';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'It works! 😺',
  });
});

app.use('/api/v1/users', userRoute);

export default app;
