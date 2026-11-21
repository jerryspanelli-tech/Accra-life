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
  const blocks = [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)]
    .filter(match => !/\\bsrc\\s*=/.test(match[1]) && match[2].trim());
  for (let i = 0; i < blocks.length; i++) {
    try { new Function(blocks[i][2]); }
    catch (error) { failed = true; console.error(file + ' inline script ' + (i + 1) + ': ' + error.message); }
  }
}
if (failed) process.exit(1);
console.log('JavaScript syntax checks passed.');
