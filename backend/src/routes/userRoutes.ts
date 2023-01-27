import { Router } from 'express';
import upload from '../utils/multer';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';

const router = Router();

router.post('/signup', upload.single('photo'), authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);
router.patch('/updateMe', upload.single('photo'), userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe);

// Restrict all routes after this middleware to admin only
router.use(authController.restrictTo('admin'));
router.get('/', userController.getAllUsers);

export default router;
