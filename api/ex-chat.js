import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';
import { Resolver } from 'node:dns/promises';

const DEFAULT_MODEL = 'deepseek-v4-flash';
const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const MAX_PERSONA_LENGTH = 12000;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_LENGTH = 12;
const MAX_MEMORY_ITEMS = 8;
const MAX_MEMORY_ITEM_LENGTH = 160;
const REQUEST_TIMEOUT_MS = 45000;
const DIRECT_ADDRESS_TIMEOUT_MS = 12000;
const MAX_UPSTREAM_REDIRECTS = 3;
const TRUSTED_DNS_SERVERS = ['223.5.5.5', '119.29.29.29', '8.8.8.8', '1.1.1.1'];
const DEEPSEEK_FALLBACK_ADDRESSES = ['3.173.21.63'];
const DNS_CACHE_TTL_MS = 5 * 60 * 1000;
const PERSONA_SECTION_RULES = [
  { name: '基础信息', label: '档案', limit: 3, keywords: ['姓名', '常住', '职业'] },
  { name: '性格', label: '性格', limit: 1 },
  { name: '和用户的关系', label: '关系', limit: 1, keywords: ['当前状态'] },
  { name: '共同回忆', label: '回忆', limit: 1 },
  { name: '说话方式', label: '说话', limit: 1 },
];
const TLS_CERTIFICATE_ERROR_CODES = new Set([
  'CERT_HAS_EXPIRED',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
]);
const RETRYABLE_NETWORK_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
]);

const dnsCache = new Map();
const successfulAddressCache = new Map();

const THEME_ATMOS = {
  default: '深夜的城市很安静，像那些没说出口的话一样。',
  lol: '召唤师峡谷的晚风，还和那年五杀的时候一样。',
  delta: '战区的任务简报刚结束，通讯频道里只剩你我的频道还开着。',
  cs2: '烟雾刚散，耳机里还留着报点的余音，时间好像卡在了残局的最后一秒。',
  overwatch: '英雄入场的音乐响起，我忽然想起以前总说要一起上分的。',
  valorant: '特工对局刚收工，准星还没放下，就忽然想找你说说话。',
};

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  return request.body ?? {};
}

function cleanText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function readBoolean(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());
}

function isTlsCertificateError(error) {
  let current = error;

  while (current) {
    if (TLS_CERTIFICATE_ERROR_CODES.has(current.code)) return true;
    current = current.cause;
  }

  return false;
}

function isRetryableNetworkError(error) {
  let current = error;

  while (current) {
    if (RETRYABLE_NETWORK_ERROR_CODES.has(current.code)) return true;
    current = current.cause;
  }

  return false;
}

function formatHostAndPort(hostname, port) {
  return hostname.includes(':') ? `[${hostname}]:${port}` : `${hostname}:${port}`;
}

function createProxyTlsSocket(target, proxyUrl, rejectUnauthorized) {
  return new Promise((resolve, reject) => {
    const proxy = new URL(proxyUrl);
    if (!['http:', 'https:'].includes(proxy.protocol)) {
      reject(new Error('OPENAI_PROXY_URL 只支持 http:// 或 https://'));
      return;
    }

    const targetPort = target.port || '443';
    const targetAuthority = formatHostAndPort(target.hostname, targetPort);
    const transport = proxy.protocol === 'https:' ? https : http;
    const headers = {
      Host: targetAuthority,
      'Proxy-Connection': 'Keep-Alive',
    };

    if (proxy.username || proxy.password) {
      const username = decodeURIComponent(proxy.username);
      const password = decodeURIComponent(proxy.password);
      headers['Proxy-Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    }

    const connectRequest = transport.request({
      hostname: proxy.hostname,
      port: proxy.port || (proxy.protocol === 'https:' ? 443 : 80),
      method: 'CONNECT',
      path: targetAuthority,
      timeout: DIRECT_ADDRESS_TIMEOUT_MS,
      headers,
    });

    connectRequest.once('connect', (connectResponse, socket, head) => {
      connectRequest.setTimeout(0);
      socket.setTimeout(0);

      if (connectResponse.statusCode !== 200) {
        socket.destroy();
        reject(new Error(`聊天代理连接失败（HTTP ${connectResponse.statusCode || 0}）`));
        return;
      }

      if (head.length) socket.unshift(head);

      const secureSocket = tls.connect({
        socket,
        servername: target.hostname,
        rejectUnauthorized,
      });

      secureSocket.once('secureConnect', () => resolve(secureSocket));
      secureSocket.once('error', reject);
    });
    connectRequest.once('timeout', () => {
      const error = new Error('聊天代理连接超时');
      error.code = 'ETIMEDOUT';
      connectRequest.destroy(error);
    });
    connectRequest.once('error', reject);
    connectRequest.end();
  });
}

function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-MAX_HISTORY_LENGTH)
    .map((message) => ({
      role: message?.side === 'me' ? 'user' : 'assistant',
      content: cleanText(message?.text, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content);
}

function normalizeMemory(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanText(item, MAX_MEMORY_ITEM_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_MEMORY_ITEMS);
}

function compactPersona(persona) {
  const sections = new Map();
  let currentSection = '';

  for (const rawLine of persona.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^##\s+(.+)$/);

    if (heading) {
      currentSection = cleanText(heading[1], 40);
      continue;
    }

    if (!currentSection || !line.startsWith('- ')) continue;

    const item = cleanText(line.slice(2), 120);
    if (!item) continue;

    const items = sections.get(currentSection) || [];
    items.push(item);
    sections.set(currentSection, items);
  }

  if (!sections.size) return cleanText(persona, 320);

  const summary = PERSONA_SECTION_RULES.flatMap((rule) => {
    const items = sections.get(rule.name) || [];
    const selected = [];

    for (const keyword of rule.keywords || []) {
      const match = items.find((item) => item.includes(keyword) && !selected.includes(item));
      if (match) selected.push(match);
    }

    for (const item of items) {
      if (selected.length >= rule.limit) break;
      if (!selected.includes(item)) selected.push(item);
    }

    return selected.length
      ? [`${rule.label}：${selected.slice(0, rule.limit).join('；')}`]
      : [];
  });

  return cleanText(summary.join('。'), 360);
}

function buildSystemPrompt(theme, persona, memory) {
  const atmosphere = THEME_ATMOS[theme] || THEME_ATMOS.default;
  const memoryBlock = cleanText(memory.join('；'), 320) || '暂无';

  return `你是用户很久没联系的前任，按档案自然聊天：${compactPersona(persona)}。
长期记忆：${memoryBlock}。氛围：${atmosphere}
每次只回复 1～2 句简短中文，温柔克制，不用 emoji、旁白或剧本格式，不确定的事不要编造，不逼迫复合。memory 只保留用户明确说出的稳定称呼、喜好、近况、约定或关系边界，最多 ${MAX_MEMORY_ITEMS} 条。只返回 JSON：{"reply":"回复","memory":["长期记忆"]}`;
}

function parseModelOutput(content, fallbackMemory) {
  const withoutFence = cleanText(content, 12000)
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    const parsed = JSON.parse(withoutFence);
    const reply = cleanText(parsed?.reply, MAX_MESSAGE_LENGTH);
    if (!reply) return null;

    return {
      reply,
      memory: Array.isArray(parsed?.memory)
        ? normalizeMemory(parsed.memory)
        : fallbackMemory,
    };
  } catch {
    return withoutFence ? { reply: withoutFence, memory: fallbackMemory } : null;
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function requestCompletion(url, apiKey, payload) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const text = await response.text();
      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      return { response, data, text };
    } catch (error) {
      lastError = error;
      if (attempt === 0) await wait(700);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function resolveTrustedAddresses(hostname) {
  const cached = dnsCache.get(hostname);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.addresses;
  }

  const resolver = new Resolver();
  resolver.setServers(TRUSTED_DNS_SERVERS);
  const addresses = Array.from(new Set(await resolver.resolve4(hostname)));

  dnsCache.set(hostname, {
    addresses,
    expiresAt: Date.now() + DNS_CACHE_TTL_MS,
  });

  return addresses;
}

function requestCompletionWithHttps(url, apiKey, payload, options = {}, redirectCount = 0) {
  const target = new URL(url);
  const body = JSON.stringify(payload);
  const hostname = options.hostname || target.hostname;
  let agent;

  if (options.proxyUrl) {
    agent = new https.Agent({ keepAlive: false });
    agent.createConnection = (_connectionOptions, callback) => {
      createProxyTlsSocket(
        target,
        options.proxyUrl,
        options.rejectUnauthorized !== false,
      ).then(
        (socket) => callback(null, socket),
        (error) => callback(error),
      );
    };
  }

  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname,
      port: target.port || 443,
      path: `${target.pathname}${target.search}`,
      method: 'POST',
      servername: target.hostname,
      rejectUnauthorized: options.rejectUnauthorized !== false,
      timeout: options.timeoutMs || DIRECT_ADDRESS_TIMEOUT_MS,
      agent,
      headers: {
        Host: target.host,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Authorization: `Bearer ${apiKey}`,
      },
    }, (response) => {
      const chunks = [];

      response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      response.on('end', () => {
        const redirectStatus = [301, 302, 307, 308].includes(response.statusCode);

        if (redirectStatus && response.headers.location) {
          if (redirectCount >= MAX_UPSTREAM_REDIRECTS) {
            reject(new Error('too many upstream redirects'));
            return;
          }

          const redirectTarget = new URL(response.headers.location, target);
          if (redirectTarget.origin !== target.origin) {
            reject(new Error('refusing cross-origin upstream redirect'));
            return;
          }

          resolve(requestCompletionWithHttps(
            redirectTarget.toString(),
            apiKey,
            payload,
            options,
            redirectCount + 1,
          ));
          return;
        }

        const text = Buffer.concat(chunks).toString('utf8');
        let data = null;

        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        resolve({
          response: {
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
          },
          data,
          text,
        });
      });
    });

    request.on('timeout', () => request.destroy(new Error('direct address timeout')));
    request.on('error', reject);
    request.end(body);
  });
}

function requestCompletionAtAddress(url, address, apiKey, payload) {
  return requestCompletionWithHttps(url, apiKey, payload, { hostname: address });
}

async function requestCompletionWithDnsFallback(url, apiKey, payload, options = {}) {
  const target = new URL(url);

  if (options.proxyUrl) {
    if (target.protocol !== 'https:') {
      throw new Error('OPENAI_PROXY_URL 当前只支持 HTTPS 聊天接口');
    }

    let lastError;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await requestCompletionWithHttps(url, apiKey, payload, {
          proxyUrl: options.proxyUrl,
          timeoutMs: REQUEST_TIMEOUT_MS,
        });
      } catch (error) {
        lastError = error;

        if (options.allowInsecureTls && isTlsCertificateError(error)) {
          console.warn(`[ex-chat] ${target.hostname} 经代理连接时证书校验失败，按配置使用不安全 TLS 重试`);
          return requestCompletionWithHttps(url, apiKey, payload, {
            proxyUrl: options.proxyUrl,
            rejectUnauthorized: false,
            timeoutMs: REQUEST_TIMEOUT_MS,
          });
        }

        if (attempt === 0 && isRetryableNetworkError(error)) {
          await wait(700);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  if (target.protocol === 'https:' && target.hostname === 'api.deepseek.com') {
    let lastError;
    const attemptedAddresses = new Set();
    const cached = successfulAddressCache.get(target.hostname);
    const initialAddresses = Array.from(new Set([
      ...(cached && cached.expiresAt > Date.now() ? [cached.address] : []),
      ...DEEPSEEK_FALLBACK_ADDRESSES,
    ]));

    for (const address of initialAddresses) {
      attemptedAddresses.add(address);
      try {
        const result = await requestCompletionAtAddress(url, address, apiKey, payload);
        successfulAddressCache.set(target.hostname, {
          address,
          expiresAt: Date.now() + DNS_CACHE_TTL_MS,
        });
        return result;
      } catch (error) {
        lastError = error;
      }
    }

    try {
      const resolvedAddresses = await resolveTrustedAddresses(target.hostname);

      for (const address of resolvedAddresses) {
        if (attemptedAddresses.has(address)) continue;
        attemptedAddresses.add(address);

        try {
          const result = await requestCompletionAtAddress(url, address, apiKey, payload);
          successfulAddressCache.set(target.hostname, {
            address,
            expiresAt: Date.now() + DNS_CACHE_TTL_MS,
          });
          return result;
        } catch (error) {
          lastError = error;
        }
      }
    } catch (error) {
      lastError = error;
    }

    try {
      return await requestCompletion(url, apiKey, payload);
    } catch (systemDnsError) {
      successfulAddressCache.delete(target.hostname);
      throw lastError || systemDnsError;
    }
  }

  try {
    return await requestCompletion(url, apiKey, payload);
  } catch (error) {
    if (!options.allowInsecureTls || target.protocol !== 'https:' || !isTlsCertificateError(error)) {
      throw error;
    }

    console.warn(`[ex-chat] ${target.hostname} 的证书校验失败，按配置使用不安全 TLS 重试`);
    return requestCompletionWithHttps(url, apiKey, payload, {
      rejectUnauthorized: false,
      timeoutMs: REQUEST_TIMEOUT_MS,
    });
  }
}

export default async function handler(request, response, environment = process.env) {
  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { error: '只支持 POST 请求' });
    return;
  }

  const apiKey = environment.OPENAI_API_KEY || environment.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: '缺少 OPENAI_API_KEY 环境变量' });
    return;
  }

  const body = readBody(request);
  const persona = cleanText(body.persona, MAX_PERSONA_LENGTH);
  const history = normalizeHistory(body.history);
  const memory = normalizeMemory(body.memory);
  const theme = cleanText(body.theme, 32) || 'default';

  if (!persona) {
    sendJson(response, 400, { error: '人物档案不能为空' });
    return;
  }

  if (!history.length) {
    sendJson(response, 400, { error: '聊天上下文不能为空' });
    return;
  }

  const baseUrl = (environment.OPENAI_BASE_URL
    || environment.VITE_OPENAI_BASE_URL
    || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const model = environment.OPENAI_MODEL || environment.VITE_OPENAI_MODEL || DEFAULT_MODEL;
  const allowInsecureTls = readBoolean(
    environment.OPENAI_ALLOW_INSECURE_TLS || environment.VITE_OPENAI_ALLOW_INSECURE_TLS,
  );
  const proxyUrl = cleanText(
    environment.OPENAI_PROXY_URL || environment.VITE_OPENAI_PROXY_URL,
    2048,
  );
  const completionOptions = { allowInsecureTls, proxyUrl };
  const requestPayload = {
    model,
    messages: [
      { role: 'system', content: buildSystemPrompt(theme, persona, memory) },
      ...history,
    ],
    max_tokens: 180,
    response_format: { type: 'json_object' },
    ...(model.startsWith('deepseek-') ? { thinking: { type: 'disabled' } } : {}),
  };

  try {
    let result = await requestCompletionWithDnsFallback(
      `${baseUrl}/chat/completions`,
      apiKey,
      requestPayload,
      completionOptions,
    );

    if (!result.response.ok && result.response.status === 400) {
      const { response_format: ignored, ...compatiblePayload } = requestPayload;
      result = await requestCompletionWithDnsFallback(
        `${baseUrl}/chat/completions`,
        apiKey,
        compatiblePayload,
        completionOptions,
      );
    }

    if (!result.response.ok) {
      sendJson(response, 502, {
        error: result.data?.error?.message || '聊天模型请求失败',
        upstreamStatus: result.response.status,
      });
      return;
    }

    const content = result.data?.choices?.[0]?.message?.content;
    const parsed = parseModelOutput(content, memory);

    if (!parsed) {
      sendJson(response, 502, { error: '聊天模型没有返回有效内容' });
      return;
    }

    sendJson(response, 200, {
      ok: true,
      reply: parsed.reply,
      memory: parsed.memory,
    });
  } catch (error) {
    console.error('[ex-chat] request failed', error);
    const tlsCertificateError = isTlsCertificateError(error);
    sendJson(response, 502, {
      error: tlsCertificateError
        ? '聊天模型的 HTTPS 证书无效，请更换有效接口；若这是你信任的自签名代理，可设置 OPENAI_ALLOW_INSECURE_TLS=true'
        : error.name === 'AbortError'
          ? '聊天模型请求超时，请稍后重试'
          : '无法连接聊天模型，请检查网络后重试',
    });
  }
}
