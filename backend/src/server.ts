/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import Database from './utils/db';
import Logger from './utils/logger';
dotenv.config();

import app from './app';

const ENVIRONMENT = process.env.NODE_ENV;
const PORT = process.env.API_PORT || 3000;
const shouldConnectToDatabase = ENVIRONMENT !== 'test';

app.listen(PORT, () => {
  Logger.info(`ENVIRONMENT: ${ENVIRONMENT}`);
  Logger.info(`Server running on port ${PORT}`);
  if (shouldConnectToDatabase) Database.getInstance();
});
