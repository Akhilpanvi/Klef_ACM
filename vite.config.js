import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createApiMiddleware } from './server/apiRouter.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'live-backend-api',
      configureServer(server) {
        // Auto-redirect /KLEF-ACM-SC to /KLEF-ACM-SC/
        server.middlewares.use((req, res, next) => {
          if (req.url === '/KLEF-ACM-SC' || req.url === '/klef-acm-sc') {
            res.writeHead(302, { Location: '/KLEF-ACM-SC/' });
            res.end();
            return;
          }
          next();
        });
        // Direct local development execution of live backend router
        server.middlewares.use('/api', createApiMiddleware());
      },
    },
  ],
  base: '/KLEF-ACM-SC/',
})
