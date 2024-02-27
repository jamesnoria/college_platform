import { RequestHandler } from 'express';
import { IUser } from '../models/userModel';

export default (fn: any): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export type ControllerInput<B = undefined> = {
  body: B;
  params: Record<string, string>;
  user?: IUser;
  file?: Express.Multer.File;
  baseUrl: string;
};

export type ControllerOutput<T = undefined> = {
  status: number;
  data: T;
};

type DefaultOutput = { status: string; message: string };

export type ControllerFunction<I = undefined, O = DefaultOutput> = (
  input: ControllerInput<I>
) => Promise<ControllerOutput<O>>;

export function unwrap<I, O>(fn: ControllerFunction<I, O>): RequestHandler {
  return (req, res, next) => {
    const { body } = req;
    let user: IUser | undefined;
    let file: Express.Multer.File | undefined;
    if ('user' in req) {
      user = req.user as IUser;
    }
    if ('file' in req) {
      file = req.file;
    }
    fn({
      body,
      params: req.params,
      user,
      file,
      baseUrl: `${req.protocol}://${req.get('host')}`,
    })
      .then((output) => {
        res.status(output.status).json(output.data);
      })
      .catch(next);
  };
}
