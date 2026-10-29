import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { saveContributions, updateContributions } from '../scripts/update-contributions.mjs';
import { PROFILE_STATS_URL, fromProfileStats, loadContributions } from '../stats-data.mjs';

const snapshot = {
  years: [2025, 2026], values: [104, 383],
  summary: { commits: 451, pullRequests: 54, repositories: 62 },
  generatedAt: '2026-10-20',
  source: PROFILE_STATS_URL
};

const profile = {
  login: 'artur-safonov', generatedAt: '2026-10-28',
  totals: { commits: 639, pullRequests: 62, ownRepos: 74, contributions: 841 },
  perYear: { 2017: 13, 2018: 0, 2019: 19, 2020: 7, 2021: 71, 2022: 5, 2023: 96, 2024: 77, 2025: 104, 2026: 449 }
};
const response = data => ({ ok: true, json: async () => data });

function outputFile(t) {
  const dir = mkdtempSync(join(tmpdir(), 'portfolio-contributions-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'contributions.json');
  writeFileSync(file, JSON.stringify(snapshot) + '\n');
  return file;
}

test('a newer source snapshot advances the date with unchanged counts', t => {
  const file = outputFile(t);
  const next = { ...snapshot, generatedAt: '2026-10-24' };
  assert.equal(saveContributions(next, file), true);
  assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), next);
});

test('a repeat check on the same day with unchanged counts leaves the file alone', t => {
  const file = outputFile(t);
  const before = readFileSync(file, 'utf8');
  assert.equal(saveContributions(snapshot, file), false);
  assert.equal(readFileSync(file, 'utf8'), before);
});

test('changed counts are saved even when the check date is unchanged', t => {
  const file = outputFile(t);
  const next = { ...snapshot, values: [104, 406] };
  assert.equal(saveContributions(next, file), true);
  assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), next);
});

test('all displayed metrics come from the exact same profile snapshot', async t => {
  const file = outputFile(t);
  const data = await updateContributions({ output: file, fetchImpl: async (url, options) => {
    assert.equal(url, PROFILE_STATS_URL);
    assert.equal(options.cache, 'no-store');
    return response(profile);
  } });
  assert.deepEqual(data.summary, { commits: 639, pullRequests: 62, repositories: 74 });
  assert.equal(data.values.at(-1), 449);
  assert.equal(data.values.reduce((sum, value) => sum + value, 0), 841);
  assert.equal(data.generatedAt, profile.generatedAt);
  assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), data);
});

test('copying an older profile snapshot preserves its date instead of claiming a fresh collection', async t => {
  const file = outputFile(t);
  const oldProfile = { ...profile, generatedAt: '2026-10-20' };
  const data = await updateContributions({ output: file, fetchImpl: async () => response(oldProfile) });
  assert.equal(data.generatedAt, '2026-10-20');
});

test('source failures leave the saved snapshot intact and fail the job', async t => {
  const file = outputFile(t), before = readFileSync(file, 'utf8');
  for (const fetchImpl of [
    async () => { throw new Error('network failure'); },
    async () => ({ ok: false, status: 503 }),
    async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } }),
    async () => response({ ...profile, totals: { ...profile.totals, contributions: 830 } })
  ]) {
    await assert.rejects(updateContributions({ output: file, fetchImpl }));
    assert.equal(readFileSync(file, 'utf8'), before);
  }
});

test('rejects missing, inconsistent, wrong-account and invalid counts', () => {
  for (const invalid of [
    null, {}, { ...profile, login: 'other' }, { ...profile, generatedAt: '2026-02-30' },
    { ...profile, totals: { ...profile.totals, commits: -1 } },
    { ...profile, totals: { ...profile.totals, pullRequests: null } },
    { ...profile, perYear: { 2025: 104, 2026: '449' } }
  ]) assert.throws(() => fromProfileStats(invalid));
});

test('browser prefers the profile source over a stale portfolio cache', async () => {
  const calls = [];
  const data = await loadContributions(async url => { calls.push(url); return response(profile); });
  assert.deepEqual(calls, [PROFILE_STATS_URL]);
  assert.deepEqual(data, fromProfileStats(profile));
});

test('browser skips legacy owner-only caches and uses the last valid profile copy', async () => {
  const calls = [];
  const data = await loadContributions(async url => {
    calls.push(url);
    if (url === PROFILE_STATS_URL) return { ok: false, status: 503 };
    if (url.startsWith('https:')) return response({ ...snapshot, source: undefined });
    return response(snapshot);
  });
  assert.equal(calls.length, 3);
  assert.deepEqual(data, snapshot);
});

test('browser fails explicitly if all snapshots are unavailable or malformed', async () => {
  await assert.rejects(loadContributions(async () => response({ years: [2025, 2026], values: [104, 438] })), /unavailable/);
});

test('browser rejects malformed canonical data before falling back', async () => {
  const data = await loadContributions(async url => response(url === PROFILE_STATS_URL
    ? { ...profile, totals: { ...profile.totals, commits: null } } : snapshot));
  assert.deepEqual(data, snapshot);
});
