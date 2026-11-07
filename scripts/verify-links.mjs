import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'src/app/[locale]');
const srcDir = path.join(rootDir, 'src');
const publicDir = path.join(rootDir, 'public');

function getRoutes(dir, baseRoute = '') {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
        routes = routes.concat(getRoutes(path.join(dir, entry.name), baseRoute));
      } else {
        const nextRoute = baseRoute + '/' + entry.name;
        routes.push(nextRoute);
        routes = routes.concat(getRoutes(path.join(dir, entry.name), nextRoute));
      }
    }
  }
  return routes;
}

const registeredRoutes = getRoutes(appDir);
registeredRoutes.push('/');
registeredRoutes.push('');

function getAllFiles(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(full));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

const files = getAllFiles(srcDir);
const hrefRegex = /href=[\"']([^\"'#?]+)[\"']/g;
const hrefTemplateRegex = /href=\{`([^`#?]+)`\}/g;
const objectHrefRegex = /href:\s*['"]([^'"#?]+)['"]/g;

const linksFound = new Set();
const linkSources = {};

function addLink(link, file) {
  if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:')) return;
  linksFound.add(link);
  if (!linkSources[link]) linkSources[link] = [];
  linkSources[link].push(path.relative(srcDir, file));
}

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    addLink(match[1], file);
  }
  while ((match = hrefTemplateRegex.exec(content)) !== null) {
    addLink(match[1], file);
  }
  while ((match = objectHrefRegex.exec(content)) !== null) {
    addLink(match[1], file);
  }
}

function matchRoute(link, routes) {
  let cleanLink = link.replace(/^\/(vi|en)/, '');
  if (!cleanLink.startsWith('/')) cleanLink = '/' + cleanLink;
  if (cleanLink === '/') return true;

  // If template literal contains ${...}, replace with test-id
  cleanLink = cleanLink.replace(/\$\{[^}]+\}/g, 'test-id');

  // Check static public assets
  if (fs.existsSync(path.join(publicDir, cleanLink))) {
    return true;
  }

  for (const route of routes) {
    if (!route) continue;
    const regexPattern = '^' + route.replace(/\[\w+\]/g, '[^/]+') + '$';
    if (new RegExp(regexPattern).test(cleanLink)) {
      return true;
    }
  }
  return false;
}

const invalidLinks = [];
for (const link of linksFound) {
  if (!matchRoute(link, registeredRoutes)) {
    invalidLinks.push({ link, sources: linkSources[link] });
  }
}

console.log(`Scanned ${files.length} source files.`);
console.log(`Found ${linksFound.size} unique internal links.`);

if (invalidLinks.length > 0) {
  console.error('Found invalid or broken internal links:');
  console.error(JSON.stringify(invalidLinks, null, 2));
  process.exit(1);
} else {
  console.log('All internal links point to valid registered routes.');
}
