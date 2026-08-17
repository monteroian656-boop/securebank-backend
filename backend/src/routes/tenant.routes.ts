import { Router } from 'express';
import { tenantController } from '../controllers/tenant.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.get('/', authMiddleware, tenantController.list);
router.post('/', authMiddleware, requirePermission('users:write'), tenantController.create);

export default router;
