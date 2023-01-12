import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.API_PORT || 3000;
const DB = process.env.DB_LOCAL!;

const DbRunner = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(DB);
    // eslint-disable-next-line no-console
    console.log('DB connected 🌟');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('DB crashed 💣 - ', error);
  }
};

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
  DbRunner();
});
