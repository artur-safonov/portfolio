import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { saveContributions } from '../scripts/update-contributions.mjs';

const snapshot = {
  years: [2025, 2026], values: [104, 383],
  summary: { commits: 451, pullRequests: 54, repositories: 62 },
  generatedAt: '2026-10-20'
};

function outputFile(t) {
  const dir = mkdtempSync(join(tmpdir(), 'portfolio-contributions-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'contributions.json');
  writeFileSync(file, JSON.stringify(snapshot) + '\n');
  return file;
}

test('a successful check on a later day advances the date with unchanged counts', t => {
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

test('a missing token fails the refresh instead of reporting success', () => {
  const env = { ...process.env };
  delete env.GH_TOKEN;
  delete env.GITHUB_TOKEN;
  const result = spawnSync(process.execPath,
    [fileURLToPath(new URL('../scripts/update-contributions.mjs', import.meta.url))],
    { env, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /STATS_TOKEN is missing/);
});
