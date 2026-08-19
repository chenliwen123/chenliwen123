import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import exChatHandler from './api/ex-chat.js';

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    request.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function exChatDevApi(environment) {
  return {
    name: 'ex-chat-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/ex-chat', async (request, response) => {
        try {
          const body = request.method === 'POST' ? await readJsonBody(request) : undefined;
          await exChatHandler({
            method: request.method,
            headers: request.headers,
            body,
          }, response, environment);
        } catch (error) {
          console.error('[ex-chat-dev-api] request failed', error);
          if (!response.headersSent) {
            response.statusCode = 400;
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          response.end(JSON.stringify({ error: '聊天请求格式无效' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), exChatDevApi(environment)],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-three',
                test: /node_modules[\\/](@react-three|three)[\\/]/,
                priority: 2,
                maxSize: 450 * 1024,
              },
            ],
          },
        },
      },
    },
  };
});
