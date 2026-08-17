import { Router } from 'express';
import { roleController } from '../controllers/role.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.get('/', authMiddleware, roleController.list);
router.post('/', authMiddleware, requirePermission('roles:write'), roleController.create);
router.put('/:id', authMiddleware, requirePermission('roles:write'), roleController.update);

export default router;
