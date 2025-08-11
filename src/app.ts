import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import os from 'os';
import { notFound } from './app/middleware/notFound';
import router from './app/routes';
import { globalErrorHandler } from './app/middleware/globalErrorHandler';
import logsRoute from '../src/Logger/logs.route';
const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);

// Routes
app.use('/api/v1', router);
app.use('/logs', logsRoute);
// Root route
app.get('/', (req: Request, res: Response) => {
  const currentDateTime = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();

  res.send({
    success: true,
    message: 'Welcome to Tamplate Server',
    version: '1.0.0',
    clientDetails: {
      ipAddress: clientIp,
      accessedAt: currentDateTime,
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 3600)} hours ${Math.floor(
        (serverUptime / 60) % 60
      )} minutes`,
    },
    developerContact: {
      email: [
        'robayatfarsit@gmail.com',
      ],
    },
  });
});

// Error handling
app.use(globalErrorHandler);
app.use(notFound);

export default app;
