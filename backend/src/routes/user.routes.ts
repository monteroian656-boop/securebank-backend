import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.get('/', authMiddleware, userController.list);
router.get('/inactive-count', authMiddleware, userController.wouldDeactivateCount);
router.put('/:id/role', authMiddleware, requirePermission('users:write'), userController.assignRole);
router.post('/:id/revoke', authMiddleware, requirePermission('users:write'), userController.revoke);

export default router;
