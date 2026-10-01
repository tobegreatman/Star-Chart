import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchEastMoney, fetchIndices } from './src/lib/eastmoney';

// 开发期：Vite 中间件直接服务端代理东财 API，规避 CORS 与浏览器 UA 限制
function eastmoneyProxyPlugin(): Plugin {
  return {
    name: 'eastmoney-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        try {
          if (url.startsWith('/api/base')) {
            const data = await fetchEastMoney('base');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
            return;
          }
          if (url.startsWith('/api/quote')) {
            const data = await fetchEastMoney('quote');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
            return;
          }
          if (url.startsWith('/api/indices')) {
            const data = await fetchIndices();
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
            return;
          }
        } catch (err) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: String(err) }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), eastmoneyProxyPlugin()],
  server: {
    port: 8888,
    host: true,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
