import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db/index';
import authRoutes from './routes/auth';
import toolsRoutes from './routes/tools/index';
import executeRoutes from './routes/tools/execute';
import historyRoutes from './routes/tools/history';
import sitesRoutes from './routes/sites';

const app = express();
const PORT = process.env.PORT || 5000;
const PgSession = connectPgSimple(session);

// Trust proxy is required when behind Nginx/Cloudflare for secure cookies to work
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Allow all origins (No strict CORS)
app.use(cors({
  origin: true,
  credentials: true,
}));

// Session
app.use(session({
  store: new PgSession({
    pool,
    tableName: 'sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/tools', executeRoutes);
app.use('/api/tools', historyRoutes);
app.use('/api/sites', sitesRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
});
