// Accra Life multiplayer server (Node 18+)
'use strict';
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const allowed = (process.env.ACCRA_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const io = new Server(httpServer, {
  cors: allowed.length ? { origin: allowed, methods: ['GET', 'POST'] } : undefined,
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 16 * 1024
});
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.ACCRA_DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'players.json');
const players = new Map();
const active = new Map();

function readStore() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    Object.entries(data).forEach(([id, value]) => {
      if (value && typeof value.secretHash === 'string') players.set(id, {
        secretHash: value.secretHash,
        balance: Number.isFinite(value.balance) ? Math.max(0, value.balance) : 200
      });
    });
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Could not read player store:', err.message);
  }
}
let saveTimer = null;
function saveStore() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const out = {};
      players.forEach((v, k) => { out[k] = { secretHash: v.secretHash, balance: v.balance }; });
      const tmp = DATA_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(out), { mode: 0o600 });
      fs.renameSync(tmp, DATA_FILE);
    } catch (err) { console.error('Could not save player store:', err.message); }
  }, 150);
}
readStore();

const cleanName = v => String(v || 'Citizen').replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 20) || 'Citizen';
const number = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const safeLook = v => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  const out = {};
  for (const k of ['skin', 'hair', 'hcol', 'top', 'pants', 'style', 'acc', 'shoe']) {
    const n = Math.round(number(v[k], 0));
    out[k] = Math.max(0, Math.min(20, n));
  }
  return out;
};
function publicPlayer(p) {
  return { id: p.id, name: p.name, x: p.x, z: p.z, ry: p.ry, sp: p.sp, drv: p.drv, look: p.look, area: p.area || null };
}
function coarseArea(lat, lon) {
  // Approximate Accra neighbourhood labels; coordinates are never stored or broadcast.
  const boxes = [
    ['Osu', 5.535, 5.565, -0.190, -0.155],
    ['Labadi', 5.545, 5.585, -0.145, -0.105],
    ['Airport City', 5.590, 5.625, -0.180, -0.145],
    ['East Legon', 5.620, 5.665, -0.155, -0.105],
    ['Makola', 5.535, 5.570, -0.225, -0.190],
    ['Tema', 5.600, 5.750, -0.030, 0.050]
  ];
  const match = boxes.find(([, a, b, c, d]) => lat >= a && lat <= b && lon >= c && lon <= d);
  return match ? match[0] : 'Accra area';
}
app.get('/health', (_req, res) => res.json({ ok: true, service: 'accra-life-multiplayer' }));
app.use(express.static(__dirname, { extensions: ['html'] }));

io.use((socket, next) => {
  const auth = socket.handshake.auth || {};
  const id = String(auth.pid || '');
  const secret = String(auth.secret || '');
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(id) || secret.length < 24 || secret.length > 200) {
    return next(new Error('Invalid player credentials'));
  }
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  const saved = players.get(id);
  if (saved && !crypto.timingSafeEqual(Buffer.from(saved.secretHash, 'hex'), Buffer.from(hash, 'hex'))) {
    return next(new Error('Player authentication failed'));
  }
  if (!saved) {
    players.set(id, { secretHash: hash, balance: 200 });
    saveStore();
  }
  socket.data.player = {
    id, name: cleanName(auth.name), x: 0, z: 0, ry: 0, sp: 0, drv: 0, look: {}, area: null,
    lastMove: 0, lastLocation: 0
  };
  next();
});

io.on('connection', socket => {
  const p = socket.data.player;
  const account = players.get(p.id);
  active.set(p.id, socket.id);
  socket.emit('hello', { balance: account.balance });
  socket.emit('currentPlayers', Object.fromEntries([...active.keys()]
    .filter(id => id !== p.id)
    .map(id => { const s = io.sockets.sockets.get(active.get(id)); return [id, s ? publicPlayer(s.data.player) : null]; })
    .filter(([, value]) => value)));
  socket.broadcast.emit('playerJoined', publicPlayer(p));

  socket.on('playerMove', data => {
    const now = Date.now();
    if (now - p.lastMove < 80 || !data || typeof data !== 'object') return;
    p.lastMove = now;
    const x = number(data.x, NaN), z = number(data.z, NaN), ry = number(data.ry, NaN);
    if (![x, z, ry].every(Number.isFinite) || Math.abs(x) > 30000 || Math.abs(z) > 30000) return;
    p.x = x; p.z = z; p.ry = Math.max(-Math.PI * 4, Math.min(Math.PI * 4, ry));
    p.sp = Math.max(0, Math.min(20, number(data.sp, 0)));
    p.drv = data.drv ? 1 : 0;
    p.look = safeLook(data.look);
    socket.broadcast.emit('playerMoved', publicPlayer(p));
  });

  socket.on('setLocation', data => {
    if (Date.now() - p.lastLocation < 5000 || !data) return;
    p.lastLocation = Date.now();
    const lat = number(data.lat, NaN), lon = number(data.lon, NaN);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return;
    p.area = coarseArea(lat, lon);
    socket.emit('areaSet', p.area);
    socket.broadcast.emit('playerMoved', publicPlayer(p));
  });
  socket.on('clearLocation', () => {
    p.area = null;
    socket.emit('areaSet', null);
    socket.broadcast.emit('playerMoved', publicPlayer(p));
  });

  socket.on('disconnect', () => {
    if (active.get(p.id) === socket.id) active.delete(p.id);
    socket.broadcast.emit('playerLeft', p.id);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('Accra Life server listening on port ' + PORT);
});
