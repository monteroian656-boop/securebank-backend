import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import tenantRoutes from './routes/tenant.routes';
import auditRoutes from './routes/audit.routes';
import roleHistoryRoutes from './routes/roleHistory.routes';
import slaRoutes from './routes/sla.routes';
import securityPolicyRoutes from './routes/securityPolicy.routes';
import sessionRoutes from './routes/session.routes';

import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/notFound.middleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/role-history', roleHistoryRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/security-policy', securityPolicyRoutes);
app.use('/api/sessions', sessionRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
