import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Logger from './logger';

dotenv.config();

class Database {
  private static _database: Database;
  private constructor() {
    const dbUrl = process.env.DB_URL;
    if (dbUrl) {
      mongoose
        .connect(dbUrl)
        .then(() => Logger.info('DB connected 🌟'))
        .catch((error) => Logger.error(`DB crashed 💣 - ${error}`));
    }
  }
  static getInstance() {
    if (this._database) {
      return this._database;
    }
    this._database = new Database();
    return (this._database = new Database());
  }
}
export default Database;
