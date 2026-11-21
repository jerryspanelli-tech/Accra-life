'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const jsFiles = [
  'server.js', 'online.js', 'accra-life.js', 'accra-world.js', 'landmarks.js',
  'accra-airport.js', 'phone.js', 'accra-assets.js', 'accra-figure.js',
  'accra-start.js', 'accra-upgrade.js', 'patch3.js', 'patch4.js'
];
let failed = false;
for (const file of jsFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  try { new Function(fs.readFileSync(full, 'utf8')); }
  catch (error) { failed = true; console.error(file + ': ' + error.message); }
}
for (const file of ['index.html', 'babylon.html']) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  let cursor = 0, index = 0;
  while (true) {
    const start = html.indexOf('<script', cursor);
    if (start < 0) break;
    const tagEnd = html.indexOf('>', start);
    const end = html.indexOf('</script>', tagEnd);
    if (tagEnd < 0 || end < 0) break;
    const attrs = html.slice(start + 7, tagEnd).toLowerCase();
    const source = html.slice(tagEnd + 1, end);
    cursor = end + 9;
    if (attrs.includes('src=') || !source.trim()) continue;
    index++;
    try { new Function(source); }
    catch (error) { failed = true; console.error(file + ' inline script ' + index + ': ' + error.message); }
  }
}
if (failed) process.exit(1);
console.log('JavaScript syntax checks passed.');
