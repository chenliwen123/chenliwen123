const DEFAULT_OWNER = 'chenliwen123';
const DEFAULT_REPO = 'chenliwen123';
const STATS_LABEL = 'homepage-stats';
const STATS_TITLE = 'Homepage site statistics';
const STATS_MARKER = 'homepage-stats-json';

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

async function ensureLabel({ owner, repo, token }) {
  try {
    await githubRequest(`/repos/${owner}/${repo}/labels/${encodeURIComponent(STATS_LABEL)}`, token);
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }

    await githubRequest(`/repos/${owner}/${repo}/labels`, token, {
      method: 'POST',
      body: JSON.stringify({
        name: STATS_LABEL,
        color: '69d7ff',
        description: 'Homepage visitor and like counters.',
      }),
    });
  }
}

function getTodayKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const valueMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${valueMap.year}-${valueMap.month}-${valueMap.day}`;
}

function createEmptyStats() {
  return {
    totalVisits: 0,
    dailyVisits: {},
    likes: 0,
    updatedAt: new Date().toISOString(),
  };
}

function parseStats(body) {
  const match = String(body ?? '').match(new RegExp(`<!--\\s*${STATS_MARKER}\\s*([\\s\\S]*?)\\s*-->`));
  if (!match) {
    return createEmptyStats();
  }

  try {
    return { ...createEmptyStats(), ...JSON.parse(match[1]) };
  } catch {
    return createEmptyStats();
  }
}

function pruneDailyVisits(dailyVisits) {
  return Object.fromEntries(
    Object.entries(dailyVisits ?? {})
      .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
      .slice(-45),
  );
}

function renderStatsBody(stats) {
  const safeStats = {
    ...stats,
    dailyVisits: pruneDailyVisits(stats.dailyVisits),
    updatedAt: new Date().toISOString(),
  };

  return [
    `<!-- ${STATS_MARKER}`,
    JSON.stringify(safeStats, null, 2),
    '-->',
    '',
    '# Homepage site statistics',
    '',
    'This issue is maintained automatically by the homepage Vercel API.',
    `Updated at: ${safeStats.updatedAt}`,
  ].join('\n');
}

async function getStatsIssue({ owner, repo, token }) {
  const issues = await githubRequest(`/repos/${owner}/${repo}/issues?state=open&per_page=100`, token);

  const statsIssues = Array.isArray(issues)
    ? issues
      .filter((item) => !item.pull_request)
      .filter((item) => item.title === STATS_TITLE || String(item.body ?? '').includes(STATS_MARKER))
      .sort((leftIssue, rightIssue) => leftIssue.number - rightIssue.number)
    : [];

  if (statsIssues.length) {
    return statsIssues[0];
  }

  const initialStats = createEmptyStats();
  return githubRequest(`/repos/${owner}/${repo}/issues`, token, {
    method: 'POST',
    body: JSON.stringify({
      title: STATS_TITLE,
      labels: [STATS_LABEL],
      body: renderStatsBody(initialStats),
    }),
  });
}

function toPublicStats(stats) {
  const todayKey = getTodayKey();
  return {
    totalVisits: Number(stats.totalVisits) || 0,
    todayVisits: Number(stats.dailyVisits?.[todayKey]) || 0,
    likes: Number(stats.likes) || 0,
    updatedAt: stats.updatedAt,
  };
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (!['GET', 'POST'].includes(request.method)) {
    sendJson(response, 405, { error: '只支持 GET / POST 获取或更新统计' });
    return;
  }

  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ISSUES_TOKEN;
  if (!token) {
    sendJson(response, 500, { error: '服务端缺少 GITHUB_TOKEN 环境变量' });
    return;
  }

  const owner = process.env.GITHUB_OWNER || DEFAULT_OWNER;
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const body = readBody(request);
  const action = request.method === 'GET' ? 'get' : String(body.action ?? 'get');

  try {
    await ensureLabel({ owner, repo, token });
    const issue = await getStatsIssue({ owner, repo, token });
    const stats = parseStats(issue.body);
    const todayKey = getTodayKey();

    if (action === 'visit') {
      stats.totalVisits = (Number(stats.totalVisits) || 0) + 1;
      stats.dailyVisits = {
        ...stats.dailyVisits,
        [todayKey]: (Number(stats.dailyVisits?.[todayKey]) || 0) + 1,
      };
    }

    if (action === 'like') {
      stats.likes = (Number(stats.likes) || 0) + 1;
    }

    if (['visit', 'like'].includes(action)) {
      const updatedBody = renderStatsBody(stats);
      await githubRequest(`/repos/${owner}/${repo}/issues/${issue.number}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ body: updatedBody }),
      });
      Object.assign(stats, parseStats(updatedBody));
    }

    sendJson(response, 200, {
      ok: true,
      stats: toPublicStats(stats),
      issue: {
        number: issue.number,
        html_url: issue.html_url,
      },
    });
  } catch (error) {
    console.error(error);
    sendJson(response, error.status === 401 || error.status === 403 ? 502 : 500, {
      error: '统计同步失败，请稍后再试',
      detail: error.message,
    });
  }
}
