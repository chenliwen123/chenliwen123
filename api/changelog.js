const DEFAULT_OWNER = 'chenliwen123';
const DEFAULT_REPO = 'chenliwen123';

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

async function githubRequest(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
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

function simplifyCommit(commit) {
  const message = commit.commit?.message ?? '';
  const [title, ...bodyLines] = message.split('\n');

  return {
    sha: commit.sha,
    shortSha: commit.sha?.slice(0, 7),
    title: title || 'Update homepage',
    description: bodyLines.join('\n').trim(),
    author: commit.commit?.author?.name ?? commit.author?.login ?? 'unknown',
    date: commit.commit?.author?.date ?? commit.commit?.committer?.date,
    html_url: commit.html_url,
  };
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: '只支持 GET 获取更新日志' });
    return;
  }

  const owner = process.env.GITHUB_OWNER || DEFAULT_OWNER;
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ISSUES_TOKEN;

  try {
    const commits = await githubRequest(`/repos/${owner}/${repo}/commits?per_page=6`, token);
    sendJson(response, 200, {
      ok: true,
      source: `${owner}/${repo}`,
      commits: Array.isArray(commits) ? commits.map(simplifyCommit) : [],
    });
  } catch (error) {
    console.error(error);
    sendJson(response, error.status === 401 || error.status === 403 ? 502 : 500, {
      error: '更新日志同步失败，请稍后再试',
      detail: error.message,
    });
  }
}
