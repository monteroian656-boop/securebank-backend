import { Router } from 'express';
import { roleHistoryController } from '../controllers/roleHistory.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

router.get('/', authMiddleware, requirePermission('audit:read'), roleHistoryController.list);

export default router;
