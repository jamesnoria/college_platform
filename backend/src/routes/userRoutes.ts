import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/signup', authController.signup);

export default router;
