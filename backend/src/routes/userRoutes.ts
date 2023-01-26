import { Router } from 'express';
import upload from '../utils/multer';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';

const router = Router();

router.post('/signup', upload.single('photo'), authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMe', authController.protect, upload.single('photo'), userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.get('/me', authController.protect, userController.getMe);

router.get('/', authController.protect, authController.restrictTo('admin'), userController.getAllUsers);

export default router;
