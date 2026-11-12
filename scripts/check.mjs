import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const pages = ['index.html', '404.html', 'work/wintor/index.html', 'work/amsterdam-in-motion/index.html', 'work/marinemuseum/index.html'];
const errors = [];
for (const page of pages) {
  const source = readFileSync(resolve('dist', page), 'utf8');
  const pageURL = new URL(page === 'index.html' ? '/' : `/${page}`, 'https://mojiostad.github.io');
  if (!source.includes('<h1') || !source.includes('name="description"') || !source.includes('rel="canonical"')) errors.push(`${page}: missing metadata or heading`);
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${page}: duplicate IDs`);
  for (const match of source.matchAll(/(href|src|content)="([^"]+)"/g)) {
    const value = match[2];
    if (match[1] === 'content' && !value.startsWith('https://mojiostad.github.io/')) continue;
    if (!/^(\/|\?|#|https:\/\/mojiostad\.github\.io\/)/.test(value)) continue;
    const url = new URL(value, pageURL);
    if (url.origin !== pageURL.origin) continue;
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = resolve('dist', `.${pathname}`);
    if (!existsSync(file)) { errors.push(`${page}: missing ${value}`); continue; }
    if (url.hash && pathname.endsWith('.html') && !readFileSync(file, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) errors.push(`${page}: missing anchor ${value}`);
  }
  if (/ShoSho|WIntor|witnor/.test(source)) errors.push(`${page}: company spelling`);
}
const home = readFileSync('dist/index.html', 'utf8');
for (const id of ['projects', 'tools', 'about', 'contact', 'object-index', 'contact-title', 'exploration', 'platform-work', 'experience-work', 'hero-title', 'work-title']) if (!home.includes(`id="${id}"`)) errors.push(`Missing production anchor: ${id}`);
if (/noindex|Local design study|Local design prototype/.test(home)) errors.push('Prototype metadata leaked into the homepage');
if (existsSync('dist/room/index.html')) errors.push('Prototype route must not be part of the production build');
if (/<script[^>]*src="[^"]*exhibition-room/.test(home)) errors.push('3D must be lazy-loaded');
for (const asset of ['ggjg.png', 'unity.png', 'shosho.png', 'wintor.png', 'glass-garden.png', 'northern-farm.png', 'tactics.png', 'svelte.svg', 'python.svg', 'plesk.svg', 'git.svg', 'githubactions.svg', 'vite.svg', 'npm.svg']) {
  if (!existsSync(resolve('dist/room', asset))) errors.push(`Missing room asset: ${asset}`);
}
for (const text of ['I’m from Iran', 'Global Game Jam Groningen', 'Azure', 'ongoing development', 'Glass Garden', 'Northern Farm', 'Tactics']) if (!home.includes(text)) errors.push(`Missing readable fallback: ${text}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Verified ${pages.length} production pages: metadata, links, assets, contact and legacy anchors, readable stories, and lazy 3D entry.`);
