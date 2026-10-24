import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const out = new URL('../data/contributions.json', import.meta.url);

export function saveContributions(data, output = out) {
  let previous = null;
  try { previous = JSON.parse(readFileSync(output, 'utf8')); } catch {}
  // A successful daily check must advance the date even when counts stay the same.
  if (previous && previous.generatedAt === data.generatedAt
      && JSON.stringify(previous.years) === JSON.stringify(data.years)
      && JSON.stringify(previous.values) === JSON.stringify(data.values)
      && JSON.stringify(previous.summary) === JSON.stringify(data.summary)) return false;
  writeFileSync(output, JSON.stringify(data, null, 2) + '\n');
  return true;
}

function updateContributions() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub statistics were not refreshed: STATS_TOKEN is missing');
  }
  const gql = (query) => JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', 'query=' + query], {
    encoding: 'utf8',
    env: { ...process.env, GH_TOKEN: token }
  })).data.viewer;
  const me = gql('query{viewer{contributionsCollection{contributionYears}}}');
  const years = me.contributionsCollection?.contributionYears || [];
  if (!years.length) {
    throw new Error('GitHub statistics were not refreshed: no contribution years returned');
  }
  const yearsQ = years.map((year) => 'y' + year + ':contributionsCollection(from:"' + year + '-01-01T00:00:00Z",to:"' + year + '-12-31T23:59:59Z"){contributionCalendar{totalContributions}}').join(' ');
  const yrs = gql('query{viewer{' + yearsQ + '}}');
  const login = gql('query{viewer{login id}}');
  const repoInfo = gql('query{viewer{repositories(ownerAffiliations:OWNER,first:100){totalCount nodes{defaultBranchRef{target{... on Commit{history(author:{id:"' + login.id + '"}){totalCount}}}}}}}}').repositories;
  const commits = repoInfo.nodes.reduce((total, repo) => total + (repo.defaultBranchRef?.target?.history?.totalCount || 0), 0);
  const pullRequests = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', 'query=query{search(query:"author:' + login.login + ' type:pr",type:ISSUE){issueCount}}'], { encoding: 'utf8', env: { ...process.env, GH_TOKEN: token } })).data.search.issueCount;
  const yearEntries = Object.entries(yrs).filter(([key]) => /^y\d{4}$/.test(key));
  const perYear = Object.fromEntries(yearEntries.map(([key, value]) => [Number(key.slice(1)), value.contributionCalendar.totalContributions]).sort((a, b) => a[0] - b[0]));
  const data = {
    years: Object.keys(perYear).map(Number),
    values: Object.values(perYear),
    summary: {
      commits,
      pullRequests,
      repositories: repoInfo.totalCount
    },
    generatedAt: new Date().toISOString().slice(0, 10)
  };
  const changed = saveContributions(data);
  console.log(changed ? 'updated contributions' : 'contributions already checked today', data.generatedAt, data.values.at(-1));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) updateContributions();
