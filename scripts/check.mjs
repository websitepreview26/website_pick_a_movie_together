import assert from 'node:assert/strict';
import { readFile, access, stat } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Expected one H1');
assert.match(html, /<html lang="ru">/);
assert.match(html, /name="description" content="[^"]+"/);
assert.ok(!/<script[^>]*src=/.test(html), 'Page must work without executable JavaScript');
const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
assert.ok(structured.length > 0);
for (const [, data] of structured) JSON.parse(data);
for (const [, path] of html.matchAll(/(?:src|href)="(\/[^"#]*)"/g)) {
  if (path !== '/') await access(`.${path}`);
}
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`), `Missing anchor: ${id}`);
const links = [...html.matchAll(/href="(https:[^"]+)"/g)].map(m => m[1]);
assert.ok(links.length === 1);
for (const link of links) assert.equal(link, 'https://t.me/MovieDuoBot?startapp');
let bytes = (await stat('index.html')).size + (await stat('styles.css')).size;
for (const asset of ['icon.webp']) bytes += (await stat(`assets/${asset}`)).size;
assert.ok(bytes < 150_000, `Initial assets exceed budget: ${bytes}`);
console.log(`Passed: HTML, structured data, local assets, anchors, bot links. Initial assets: ${(bytes / 1024).toFixed(1)} KiB uncompressed. No executable JS.`);
