import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
const pages = ['index.html','404.html','work/wintor/index.html','work/amsterdam-in-motion/index.html','work/marinemuseum/index.html'];
let errors = [];
for (const page of pages) {
 const source = readFileSync(resolve('dist',page),'utf8');
 if (!source.includes('<h1') || !source.includes('name="description"') || !source.includes('rel="canonical"')) errors.push(`${page}: missing page metadata or heading`);
 for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
   const url = match[1];
   if (/^(https?:|mailto:|data:)/.test(url)) continue;
   const [path, hash] = url.split('#');
   let file = path ? resolve(path.startsWith('/') ? 'dist' : dirname(resolve('dist',page)), path.replace(/^\//,'')) : resolve('dist',page);
   if (path.endsWith('/')) file = resolve(file,'index.html');
   if (!existsSync(file)) { errors.push(`${page}: missing ${url}`); continue; }
   if (hash && file.endsWith('.html') && !readFileSync(file,'utf8').includes(`id="${hash}"`)) errors.push(`${page}: missing anchor ${url}`);
 }
 if (/ShoSho|WIntor|witnor/.test(source)) errors.push(`${page}: incorrect company spelling`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Verified ${pages.length} built pages: local links, assets, anchors, metadata, and company spelling.`);
