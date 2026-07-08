import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import instagramAuthRoutes from './routes/socialMedia/instagramAuthRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import { initSocket } from './socket/socketHandler.js';
import chatRoutes from './routes/chatRoutes.js';
import { registerInsightJobs } from './jobs/insightSyncJob.js';
import prisma from './config/prisma.js';
import { printStartupDiagnostics } from './utils/startupChecks.js';
import searchRoutes from './routes/searchRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './admin/adminRoutes.js';
import uploadRoutes from './upload/uploadRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { setupProcessHandlers } from './middleware/errorHandler.js';
import { initJobs } from './jobs/index.js';
import youtubeRoutes from './routes/socialMedia/youtubeRoutes.js';
import { startYoutubeSyncJob } from './jobs/YoutubeSyncJob.js';
import auditRoutes from './routes/fakeDetection/auditRoutes.js';

const app = express();
const server = createServer(app); // ✅ pehle server banao
const io = initSocket(server);    // ✅ phir socket attach karo

app.get('/', (req, res) => {
  res.status(200).send('Server is healthy and running!');
});

// Middleware
const allowedOrigins = [
  'http://localhost:5173',          // Your local testing site
  'https://axon-70a5c.web.app'       // Your live Firebase front-end website
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, postman, or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allows cookies or authorization headers if you use them
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']
}));
// ⚠️ Stripe webhook — raw body, specific path pehle
app.use('/api/payments/webhook/stripe',
  express.raw({ type: 'application/json' }),
  paymentRoutes
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ io sabse pehle attach karo — routes se pehle
app.use((req, res, next) => {
  req.io = io;
  next();
});
console.log('Socket.IO initialized and attached to app');
// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/auth/instagram', instagramAuthRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/v1/search', searchRoutes);



app.use('/api/payments', paymentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/youtube', youtubeRoutes);
app.use('/api/v1/audit', auditRoutes);


// ✅ 404 — sab routes ke baad
app.use(notFoundHandler);

// ✅ Global error handler — last middleware
app.use(errorHandler);


function mapDbError(err) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('password authentication failed')) {
    return { headline: 'Database credentials are invalid', detail: err.message };
  }
  if (msg.includes('econnrefused') || msg.includes('getaddrinfo') || msg.includes('enotfound')) {
    return { headline: 'No database server running under the provided hostname/port', detail: err.message };
  }
  return { headline: 'Database connection failed', detail: err.message };
}

async function startServer() {
  printStartupDiagnostics(); // ✅ pehle diagnostics run karo ye env check karega aur helpful messages dega

  try {
    await prisma.$connect();
    console.log('Prisma connected to PostgreSQL successfully.');
  } catch (err) {
    const mapped = mapDbError(err);
    console.error('========== Database Startup Error ==========');
    console.error(mapped.headline);
    console.error('Details:', mapped.detail);
    console.error('============================================');
    process.exit(1);
  }
  
  const PORT = process.env.PORT || 5000;
  
  // ✅ app.listen nahi — server.listen (kyunki createServer use kiya)
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err?.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already taken. Change PORT or stop the other process.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });

  registerInsightJobs();
  startYoutubeSyncJob();
  initJobs();
}


startServer().catch((err) => {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('generator block') || msg.includes('prisma-client-js')) {
    console.error('Run: npm install && npx prisma generate');
  }
  console.error('Startup failed:', err);
  process.exit(1);
});

export default app;