// Vercel serverless entry: runs the same Express API used in dev (vite.config.js) and by
// server/index.js. vercel.json rewrites every /api/* path (any depth) here; req.url keeps
// the original path, so Express routing works unchanged.
import express from 'express';
import { createApiRouter } from '../server/apiRouter.js';

const app = express();
app.use('/api', createApiRouter());

export default app;
