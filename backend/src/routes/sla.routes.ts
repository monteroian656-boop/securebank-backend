import { Router } from 'express';
import { slaController } from '../controllers/sla.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, slaController.current);
router.get('/trend', authMiddleware, slaController.trend);

export default router;
