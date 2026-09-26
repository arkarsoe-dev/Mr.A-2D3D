import fs from 'node:fs';

const dataPath = 'public/data.json';
const apiUrl = 'https://api.2dboss.com/api/v2/v1/2dstock/threed-result';
const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const byDate = new Map(existing.map((row) => [row.date, { date: row.date, number: row.number || '' }]));

try {
  const response = await fetch(`${apiUrl}?_=${Date.now()}`, { headers: { Accept: 'application/json', 'User-Agent': 'MrA-2D3D-GitHub-Sync/1.0' } });
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const payload = await response.json();
  for (const item of Array.isArray(payload.data) ? payload.data : []) {
    const date = String(item.datetime || item.date || '').slice(0, 10);
    const number = String(item.result || item.number || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{3}$/.test(number)) byDate.set(date, { date, number });
  }
  console.log(`Merged API results into ${byDate.size} calendar records.`);
} catch (error) {
  console.warn(`3D sync skipped; preserving existing data.json: ${error.message}`);
}

const sorted = [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
fs.writeFileSync(dataPath, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Wrote ${sorted.length} records to ${dataPath}.`);
