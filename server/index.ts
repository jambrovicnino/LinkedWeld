import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/projects.routes.js';
import workerRoutes from './routes/workers.routes.js';
import expenseRoutes from './routes/expenses.routes.js';
import documentRoutes from './routes/documents.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import reportRoutes from './routes/reports.routes.js';
import adminRoutes from './routes/admin.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use(errorHandler);

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`LinkedWeld server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
