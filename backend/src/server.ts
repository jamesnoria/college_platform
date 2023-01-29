/* eslint-disable no-console */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';

const ENVIRONMENT = process.env.NODE_ENV;
const PORT = process.env.API_PORT || 3000;
const DB = ENVIRONMENT === 'development' ? process.env.DB_REMOTE! : process.env.DB_LOCAL!;

const DbRunner = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(DB);
    console.log('DB connected 🌟');
  } catch (error) {
    console.log(`DB crashed 💣 - ${error}`);
  }
};

app.listen(PORT, () => {
  console.log(`ENVIRONMENT: ${ENVIRONMENT}`);
  console.log(`Server running on port ${PORT}`);
  DbRunner();
});
