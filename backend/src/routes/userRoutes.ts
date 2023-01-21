import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/', authController.protect, authController.restrictTo('student'), userController.getAllUsers);

export default router;
