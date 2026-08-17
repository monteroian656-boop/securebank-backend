import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, sessionController.list);
router.post('/close-all', authMiddleware, sessionController.closeAll);
router.delete('/:id', authMiddleware, sessionController.closeOne);

export default router;
