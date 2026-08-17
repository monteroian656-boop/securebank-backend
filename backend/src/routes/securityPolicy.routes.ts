import { Router } from 'express';
import { securityPolicyController } from '../controllers/securityPolicy.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.get('/:tenantId', authMiddleware, requirePermission('roles:write'), securityPolicyController.get);
router.put('/:tenantId', authMiddleware, requirePermission('roles:write'), securityPolicyController.update);

export default router;
