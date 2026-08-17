import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.get('/', authMiddleware, requirePermission('audit:read'), auditController.list);
router.get('/export', authMiddleware, requirePermission('audit:read'), auditController.exportSigned);

export default router;
