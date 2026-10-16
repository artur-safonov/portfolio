import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const out = new URL('../data/contributions.json', import.meta.url);
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!token) {
  console.log('No GitHub token; chart data left unchanged');
  process.exit(0);
}
const gql = (query) => JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', 'query=' + query], {
  encoding: 'utf8',
  env: { ...process.env, GH_TOKEN: token }
})).data.viewer;
const me = gql('query{viewer{contributionsCollection{contributionYears}}}');
const years = me.contributionsCollection?.contributionYears || [];
if (!years.length) {
  console.log('No contribution years for this token; chart data left unchanged');
  process.exit(0);
}
const yearsQ = years.map((year) => 'y' + year + ':contributionsCollection(from:"' + year + '-01-01T00:00:00Z",to:"' + year + '-12-31T23:59:59Z"){contributionCalendar{totalContributions}}').join(' ');
const yrs = gql('query{viewer{' + yearsQ + '}}');
const perYear = Object.fromEntries(Object.entries(yrs).map(([key, value]) => [Number(key.slice(1)), value.contributionCalendar.totalContributions]).sort((a, b) => a[0] - b[0]));
const data = {
  years: Object.keys(perYear).map(Number),
  values: Object.values(perYear),
  generatedAt: new Date().toISOString().slice(0, 10)
};
let previous = null;
try { previous = JSON.parse(readFileSync(out, 'utf8')); } catch {}
if (previous && JSON.stringify(previous.years) === JSON.stringify(data.years) && JSON.stringify(previous.values) === JSON.stringify(data.values)) {
  console.log('contributions unchanged', data.values.at(-1));
  process.exit(0);
}
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
console.log('updated contributions', data.generatedAt, data.values.at(-1));
