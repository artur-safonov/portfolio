// The profile workflow is the only collector. Both sites display its snapshot.
export const PROFILE_STATS_URL = 'https://raw.githubusercontent.com/artur-safonov/artur-safonov/main/data/stats.json';
const CACHE_URL = 'https://raw.githubusercontent.com/artur-safonov/portfolio/main/data/contributions.json';
const count = value => Number.isSafeInteger(value) && value >= 0;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export function fromProfileStats(stats) {
  const entries = Object.entries(stats?.perYear || {}).sort(([a], [b]) => Number(a) - Number(b));
  const totals = stats?.totals;
  if (stats?.login !== 'artur-safonov' || !date(stats.generatedAt) || !totals
      || entries.length < 2 || entries.some(([year, value]) => !/^\d{4}$/.test(year) || !count(value))
      || ![totals.commits, totals.pullRequests, totals.ownRepos, totals.contributions].every(count)
      || entries.reduce((sum, [, value]) => sum + value, 0) !== totals.contributions) {
    throw new Error('Incomplete or inconsistent profile statistics');
  }
  return {
    years: entries.map(([year]) => Number(year)),
    values: entries.map(([, value]) => value),
    summary: { commits: totals.commits, pullRequests: totals.pullRequests, repositories: totals.ownRepos },
    generatedAt: stats.generatedAt,
    source: PROFILE_STATS_URL
  };
}

export function validateCache(data) {
  if (data?.source !== PROFILE_STATS_URL || !Array.isArray(data.years) || !Array.isArray(data.values)
      || data.years.length < 2 || data.years.length !== data.values.length
      || data.years.some((year, i) => !Number.isInteger(year) || year < 2008 || (i > 0 && year <= data.years[i - 1]))
      || !data.values.every(count) || !date(data.generatedAt)
      || ![data.summary?.commits, data.summary?.pullRequests, data.summary?.repositories].every(count)) {
    throw new Error('Invalid profile statistics cache');
  }
  return data;
}

export async function fetchProfileStats(fetchImpl = fetch) {
  const response = await fetchImpl(PROFILE_STATS_URL, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Profile statistics request failed (HTTP ' + response.status + ')');
  return fromProfileStats(await response.json());
}

export async function loadContributions(fetchImpl = fetch) {
  try { return await fetchProfileStats(fetchImpl); } catch {}
  for (const url of [CACHE_URL, './data/contributions.json']) {
    try {
      const response = await fetchImpl(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (response.ok) return validateCache(await response.json());
    } catch {}
  }
  throw new Error('GitHub statistics unavailable');
}
