import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import guestbookHandler from '../api/guestbook.js';
import siteStatsHandler from '../api/site-stats.js';
import changelogHandler from '../api/changelog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const envPath = resolve(rootDir, '.env.local');
const port = Number(process.env.LOCAL_API_PORT || 8788);
const host = process.env.LOCAL_API_HOST || '127.0.0.1';

const handlers = new Map([
  ['/api/guestbook', guestbookHandler],
  ['/api/site-stats', siteStatsHandler],
  ['/api/changelog', changelogHandler],
]);

function parseEnvValue(rawValue) {
  let value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return value.replace(/\\n/g, '\n');
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.warn(`[local-api] 未找到 ${filePath}，将只使用当前 shell 环境变量。`);
    return [];
  }

  const loadedKeys = [];
  const envText = readFileSync(filePath, 'utf8');

  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    process.env[key] = parseEnvValue(rawValue);
    loadedKeys.push(key);
  }

  return loadedKeys;
}

async function readRequestBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  if (!chunks.length) {
    return undefined;
  }

  const text = Buffer.concat(chunks).toString('utf8');
  const contentType = request.headers['content-type'] || '';

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }

  return text;
}

function createVercelLikeResponse(serverResponse) {
  let ended = false;

  const response = {
    statusCode: 200,
    setHeader(name, value) {
      serverResponse.setHeader(name, value);
    },
    status(statusCode) {
      this.statusCode = statusCode;
      serverResponse.statusCode = statusCode;
      return this;
    },
    end(payload = '') {
      if (ended) return;
      ended = true;
      serverResponse.statusCode = this.statusCode;
      serverResponse.end(payload);
    },
  };

  return {
    response,
    isEnded: () => ended,
  };
}

function sendJson(serverResponse, statusCode, payload) {
  serverResponse.statusCode = statusCode;
  serverResponse.setHeader('Content-Type', 'application/json; charset=utf-8');
  serverResponse.end(JSON.stringify(payload));
}

const loadedKeys = loadEnvFile(envPath);

const server = createServer(async (serverRequest, serverResponse) => {
  const requestUrl = new URL(serverRequest.url, `http://${serverRequest.headers.host || `${host}:${port}`}`);
  const handler = handlers.get(requestUrl.pathname);

  if (!handler) {
    sendJson(serverResponse, 404, {
      error: '本地 API 未找到',
      path: requestUrl.pathname,
      available: Array.from(handlers.keys()),
    });
    return;
  }

  const { response, isEnded } = createVercelLikeResponse(serverResponse);

  try {
    const body = await readRequestBody(serverRequest);
    await handler({
      method: serverRequest.method,
      headers: serverRequest.headers,
      body,
      query: Object.fromEntries(requestUrl.searchParams),
      url: serverRequest.url,
    }, response);

    if (!isEnded()) {
      response.end();
    }
  } catch (error) {
    console.error('[local-api] 请求处理失败', error);
    if (!isEnded()) {
      sendJson(serverResponse, 500, {
        error: '本地 API 请求处理失败',
        detail: error.message,
      });
    }
  }
});

server.listen(port, host, () => {
  console.log(`[local-api] 已加载环境变量：${loadedKeys.length ? loadedKeys.join(', ') : '无'}`);
  console.log(`[local-api] API 服务运行中：http://${host}:${port}`);
  console.log('[local-api] 可用接口：/api/guestbook, /api/site-stats, /api/changelog');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[local-api] 端口 ${port} 已被占用，可以设置 LOCAL_API_PORT 换一个端口。`);
  } else {
    console.error('[local-api] 启动失败', error);
  }
  process.exit(1);
});
