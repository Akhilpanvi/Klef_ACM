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
        // Old links: /KLEF-ACM-SC/... -> /...
        server.middlewares.use((req, res, next) => {
          const m = req.url.match(/^\/klef-acm-sc(\/.*)?$/i);
          if (m) { res.writeHead(301, { Location: m[1] || '/' }); res.end(); return; }
          next();
        });
        // Direct local development execution of live backend router
        server.middlewares.use('/api', createApiMiddleware());
      },
    },
  ],
  base: '/',
})
