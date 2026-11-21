'use strict';
const { spawn } = require('node:child_process');
const net = require('node:net');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}
async function waitFor(url, child) {
  const until = Date.now() + 10000;
  while (Date.now() < until) {
    if (child.exitCode !== null) throw new Error('Server exited before becoming ready');
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('Timed out waiting for server health endpoint');
}
(async () => {
  const port = await freePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'accra-life-test-'));
  const child = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(port), ACCRA_DATA_DIR: dataDir },
    stdio: 'ignore'
  });
  try {
    const base = 'http://127.0.0.1:' + port;
    const health = await waitFor(base + '/health', child);
    const healthData = await health.json();
    if (!healthData.ok) throw new Error('Health endpoint did not return ok');
    const page = await fetch(base + '/babylon.html');
    if (!page.ok || !(await page.text()).includes('online.js')) throw new Error('Babylon game page was not served');
    const handshake = await fetch(base + '/socket.io/?EIO=4&transport=polling&t=smoke');
    if (!handshake.ok) throw new Error('Socket.IO polling handshake failed');
    const packet = await handshake.text();
    const match = packet.match(/^0(\{.*\})$/);
    if (!match) throw new Error('Socket.IO did not return an Engine.IO open packet');
    const sid = JSON.parse(match[1]).sid;
    const auth = { pid: 'smoke_player_123', secret: 'smoke-secret-' + 'x'.repeat(40), name: 'Smoke Test' };
    const connected = await fetch('' + base + '/socket.io/?EIO=4&transport=polling&sid=' + encodeURIComponent(sid), {
      method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8' }, body: '40' + JSON.stringify(auth)
    });
    if (!connected.ok) throw new Error('Socket.IO authentication packet was rejected');
    const messages = await fetch(base + '/socket.io/?EIO=4&transport=polling&sid=' + encodeURIComponent(sid));
    const body = await messages.text();
    if (!messages.ok || !body.includes('42["hello"')) throw new Error('Authenticated player did not receive hello event');
    console.log('Server smoke test passed: health, Babylon page, Socket.IO handshake and player authentication.');
  } finally {
    child.kill('SIGTERM');
    await new Promise(resolve => {
      if (child.exitCode !== null) return resolve();
      child.once('exit', resolve);
      setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 1500).unref();
    });
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error.stack || error); process.exit(1); });
