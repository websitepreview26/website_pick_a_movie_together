import { mkdir, copyFile, cp, readFile, writeFile, rm } from 'node:fs/promises';

const input = process.env.SITE_URL;
if (!input) throw new Error('Set SITE_URL to the final HTTPS origin before building. See README.md.');
const url = new URL(input);
if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('SITE_URL must be an HTTPS origin, e.g. https://your-domain.by');
}
const origin = url.origin;
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await mkdir('dist', { recursive: true });
const html = await readFile('index.html', 'utf8');
const meta = `<link rel="canonical" href="${origin}/">\n  <meta property="og:url" content="${origin}/">\n  <meta property="og:image" content="${origin}/assets/social.jpg">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:alt" content="КиноКино — выберите фильм, который понравится вам обоим">`;
await writeFile('dist/index.html', html.replace('<!-- production-meta -->', meta));
for (const file of ['styles.css', '_headers', '404.html']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`);
console.log(`Built dist/ for ${origin}. No third-party scripts or runtime dependencies.`);
