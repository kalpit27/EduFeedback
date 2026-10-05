import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman) or web clients
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('https://localhost') || origin.startsWith('capacitor://') || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for institute app environments
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Institute Feedback & Academic Communication Platform API',
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Server] Institute Feedback API is running on http://0.0.0.0:${PORT} (all interfaces)`);
});

export default app;
