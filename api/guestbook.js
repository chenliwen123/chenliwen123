const DEFAULT_OWNER = 'chenliwen123';
const DEFAULT_REPO = 'chenliwen123';
const DEFAULT_LABEL = 'homepage-message';
const MAX_MESSAGE_LENGTH = 600;
const MAX_NAME_LENGTH = 40;

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
};

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', jsonHeaders['Content-Type']);
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
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

async function githubRequest(path, token, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.message ?? `GitHub request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function ensureLabel({ owner, repo, label, token }) {
  try {
    await githubRequest(`/repos/${owner}/${repo}/labels/${encodeURIComponent(label)}`, token);
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }

    await githubRequest(`/repos/${owner}/${repo}/labels`, token, {
      method: 'POST',
      body: JSON.stringify({
        name: label,
        color: 'f28b50',
        description: 'Messages submitted from the personal homepage guestbook.',
      }),
    });
  }
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { error: '只支持 POST 提交留言' });
    return;
  }

  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ISSUES_TOKEN;
  if (!token) {
    sendJson(response, 500, { error: '服务端缺少 GITHUB_TOKEN 环境变量' });
    return;
  }

  const owner = process.env.GITHUB_OWNER || DEFAULT_OWNER;
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const label = process.env.GITHUB_GUESTBOOK_LABEL || DEFAULT_LABEL;
  const body = readBody(request);
  const message = cleanText(body.message, MAX_MESSAGE_LENGTH);
  const visitor = cleanText(body.visitor || '访客', MAX_NAME_LENGTH) || '访客';
  const trap = cleanText(body.company, 120);

  if (trap) {
    sendJson(response, 200, { ok: true, ignored: true });
    return;
  }

  if (message.length < 2) {
    sendJson(response, 400, { error: '留言至少需要 2 个字符' });
    return;
  }

  try {
    await ensureLabel({ owner, repo, label, token });

    const createdAt = new Date().toISOString();
    const issue = await githubRequest(`/repos/${owner}/${repo}/issues`, token, {
      method: 'POST',
      body: JSON.stringify({
        title: `主页访客留言 · ${visitor}`,
        labels: [label],
        body: [
          '来自个人主页的访客留言：',
          '',
          message,
          '',
          '---',
          `访客：${visitor}`,
          `提交时间：${createdAt}`,
          '来源：Vercel Guestbook API',
        ].join('\n'),
      }),
    });

    sendJson(response, 201, {
      ok: true,
      issue: {
        id: issue.id,
        number: issue.number,
        title: issue.title,
        html_url: issue.html_url,
        created_at: issue.created_at,
        user: issue.user,
      },
    });
  } catch (error) {
    console.error(error);
    sendJson(response, error.status === 401 || error.status === 403 ? 502 : 500, {
      error: '留言提交失败，请稍后再试',
      detail: error.message,
    });
  }
}
