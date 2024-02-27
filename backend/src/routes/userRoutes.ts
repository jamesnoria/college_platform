import { Router, RequestHandler } from 'express';
import upload from '../utils/multer';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import { unwrap } from '../utils/catchAsync';

const router = Router();

router.post('/signup', upload.single('photo'), unwrap(authController.signup));
router.post('/login', unwrap(authController.login));

router.post('/forgotPassword', unwrap(authController.forgotPassword));
router.patch('/resetPassword/:token', unwrap(authController.resetPassword));

// Protect all routes after this middleware
router.use(authController.protect);
router.patch('/updateMe', upload.single('photo'), unwrap(userController.updateMe));
router.delete('/deleteMe', unwrap(userController.deleteMe));
router.get('/me', unwrap(userController.getMe));

// Restrict all routes after this middleware to admin only
router.use(authController.restrictTo('admin'));
router.get('/', unwrap(userController.getAllUsers));

export default router;
