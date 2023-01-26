import { RequestHandler } from 'express';

// ask david
export default (fn: any): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
