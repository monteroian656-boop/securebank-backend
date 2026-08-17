import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/reset-password', authController.requestPasswordReset);
router.post('/reset-password/confirm', authController.confirmPasswordReset);
router.get('/me', authMiddleware, authController.me);

export default router;
