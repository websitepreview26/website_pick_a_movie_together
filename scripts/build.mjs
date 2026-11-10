import { mkdir, copyFile, cp, readFile, writeFile, rm } from 'node:fs/promises';

const input = process.env.SITE_URL;
if (!input) throw new Error('Set SITE_URL to the final HTTPS URL before building. See README.md.');
const url = new URL(input);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
  throw new Error('SITE_URL must be an HTTPS URL without credentials, query or fragment');
}
const siteUrl = url.href.replace(/\/$/, '') + '/';
const basePath = new URL(siteUrl).pathname;
const localPaths = html => html.replace(/(href|src)="\/(?!\/)/g, `$1="${basePath}`);
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await mkdir('dist', { recursive: true });
const html = await readFile('index.html', 'utf8');
const meta = `<link rel="canonical" href="${siteUrl}">\n  <meta property="og:url" content="${siteUrl}">\n  <meta property="og:image" content="${siteUrl}assets/social.jpg">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:alt" content="КиноКино — выберите фильм, который понравится вам обоим">`;
await writeFile('dist/index.html', localPaths(html).replace('<!-- production-meta -->', meta));
for (const file of ['styles.css', '_headers']) await copyFile(file, `dist/${file}`);
await writeFile('dist/404.html', localPaths(await readFile('404.html', 'utf8')));
await writeFile('dist/.nojekyll', '');
await cp('assets', 'dist/assets', { recursive: true });
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
console.log(`Built dist/ for ${siteUrl}. No third-party scripts or runtime dependencies.`);
