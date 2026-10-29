import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { fetchProfileStats } from '../stats-data.mjs';

const out = new URL('../data/contributions.json', import.meta.url);

export function saveContributions(data, output = out) {
  let previous = null;
  try { previous = JSON.parse(readFileSync(output, 'utf8')); } catch {}
  // Preserve the collector's date; copying a snapshot does not refresh its data.
  if (JSON.stringify(previous) === JSON.stringify(data)) return false;
  writeFileSync(output, JSON.stringify(data, null, 2) + '\n');
  return true;
}

export async function updateContributions({ fetchImpl = fetch, output = out } = {}) {
  const data = await fetchProfileStats(fetchImpl);
  const changed = saveContributions(data, output);
  console.log(changed ? 'copied profile snapshot' : 'profile snapshot unchanged', data.generatedAt, data.values.at(-1));
  return data;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await updateContributions();
}
