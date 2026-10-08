// Vercel serverless entry: runs the same Express API used in dev (vite.config.js) and by
// server/index.js. Every /api/* request lands here with its original URL.
import express from 'express';
import { createApiRouter } from '../server/apiRouter.js';

const app = express();
app.use('/api', createApiRouter());

export default app;
