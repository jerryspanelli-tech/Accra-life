// Cloudflare Durable Objects multiplayer backend for Accra Life.
const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "content-type": "application/json; charset=utf-8" }
});
const cleanName = value => String(value || "Citizen").replace(/[^\p{L}\p{N} _.-]/gu, "").trim().slice(0, 20) || "Citizen";
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const safeLook = value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const key of ["skin", "hair", "hcol", "top", "pants", "style", "acc", "shoe"]) {
    out[key] = Math.max(0, Math.min(20, Math.round(num(value[key], 0))));
  }
  return out;
};
function publicPlayer(player) {
  return { id: player.id, name: player.name, x: player.x, z: player.z, ry: player.ry,
    sp: player.sp, drv: player.drv, look: player.look, area: player.area || null };
}
function coarseArea(lat, lon) {
  const boxes = [
    ["Osu",5.535,5.565,-0.190,-0.155],["Labadi",5.545,5.585,-0.145,-0.105],
    ["Airport City",5.590,5.625,-0.180,-0.145],["East Legon",5.620,5.665,-0.155,-0.105],
    ["Makola",5.535,5.570,-0.225,-0.190],["Tema",5.600,5.750,-0.030,0.050]
  ];
  const match = boxes.find(([,a,b,c,d]) => lat >= a && lat <= b && lon >= c && lon <= d);
  return match ? match[0] : "Accra area";
}
async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "accra-life-cloudflare-multiplayer" });
    if (url.pathname !== "/ws") return new Response("Accra Life multiplayer is online. Connect using /ws.", { status: 200 });
    if (request.headers.get("Upgrade") !== "websocket") return new Response("WebSocket upgrade required", { status: 426 });
    const id = env.GAME_ROOM.idFromName("accra-life-global-room");
    return env.GAME_ROOM.get(id).fetch(request);
  }
};

export class GameRoom {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") return new Response("WebSocket upgrade required", { status: 426 });
    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ authenticated: false });
    return new Response(null, { status: 101, webSocket: client });
  }

  sockets() { return this.ctx.getWebSockets(); }
  send(ws, event, data) {
    try { ws.send(JSON.stringify({ event, data })); } catch {}
  }
  broadcast(event, data, except) {
    for (const ws of this.sockets()) {
      if (ws !== except && ws.deserializeAttachment()?.authenticated) this.send(ws, event, data);
    }
  }
  players(except) {
    const out = {};
    for (const ws of this.sockets()) {
      if (ws === except) continue;
      const a = ws.deserializeAttachment();
      if (a?.authenticated && a.player) out[a.player.id] = publicPlayer(a.player);
    }
    return out;
  }

  async webSocketMessage(ws, message) {
    let packet;
    try { packet = JSON.parse(typeof message === "string" ? message : new TextDecoder().decode(message)); }
    catch { ws.close(1003, "Invalid message"); return; }
    const a = ws.deserializeAttachment() || { authenticated: false };
    if (!a.authenticated) {
      if (packet.event !== "auth" || !packet.data || typeof packet.data !== "object") {
        ws.close(1008, "Authentication required"); return;
      }
      const { pid, secret, name } = packet.data;
      if (!/^[A-Za-z0-9_-]{8,80}$/.test(String(pid || "")) || String(secret || "").length < 24 || String(secret).length > 200) {
        ws.close(1008, "Invalid player credentials"); return;
      }
      const secretHash = await sha256(String(secret));
      const key = "player:" + pid;
      const saved = await this.ctx.storage.get(key);
      if (saved && saved.secretHash !== secretHash) { ws.close(1008, "Player authentication failed"); return; }
      const account = saved || { secretHash, balance: 200 };
      if (!saved) await this.ctx.storage.put(key, account);
      const player = { id: pid, name: cleanName(name), x: 0, z: 0, ry: 0, sp: 0, drv: 0, look: {}, area: null, lastMove: 0, lastLocation: 0 };
      // A new login replaces an older connection for the same player ID.
      for (const other of this.sockets()) {
        if (other === ws) continue;
        const old = other.deserializeAttachment();
        if (old?.authenticated && old.player?.id === pid) other.close(4001, "Reconnected elsewhere");
      }
      ws.serializeAttachment({ authenticated: true, player });
      this.send(ws, "hello", { balance: account.balance });
      this.send(ws, "currentPlayers", this.players(ws));
      this.broadcast("playerJoined", publicPlayer(player), ws);
      return;
    }

    const player = a.player;
    if (!player || !packet || typeof packet.event !== "string") return;
    if (packet.event === "playerMove") {
      const now = Date.now(), data = packet.data;
      if (now - (player.lastMove || 0) < 80 || !data || typeof data !== "object") return;
      const x = num(data.x, NaN), z = num(data.z, NaN), ry = num(data.ry, NaN);
      if (![x,z,ry].every(Number.isFinite) || Math.abs(x) > 30000 || Math.abs(z) > 30000) return;
      player.lastMove = now; player.x = x; player.z = z;
      player.ry = Math.max(-Math.PI * 4, Math.min(Math.PI * 4, ry));
      player.sp = Math.max(0, Math.min(20, num(data.sp, 0)));
      player.drv = data.drv ? 1 : 0; player.look = safeLook(data.look);
      ws.serializeAttachment({ ...a, player });
      this.broadcast("playerMoved", publicPlayer(player), ws);
    } else if (packet.event === "setLocation") {
      const data = packet.data;
      if (Date.now() - (player.lastLocation || 0) < 5000 || !data) return;
      const lat = num(data.lat, NaN), lon = num(data.lon, NaN);
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return;
      player.lastLocation = Date.now(); player.area = coarseArea(lat, lon);
      ws.serializeAttachment({ ...a, player });
      this.send(ws, "areaSet", player.area);
      this.broadcast("playerMoved", publicPlayer(player), ws);
    } else if (packet.event === "clearLocation") {
      player.area = null; ws.serializeAttachment({ ...a, player });
      this.send(ws, "areaSet", null);
      this.broadcast("playerMoved", publicPlayer(player), ws);
    }
  }

  webSocketClose(ws) {
    const a = ws.deserializeAttachment();
    if (a?.authenticated && a.player) {
      const stillConnected = this.sockets().some(other => {
        if (other === ws) return false;
        const current = other.deserializeAttachment();
        return current?.authenticated && current.player?.id === a.player.id;
      });
      if (!stillConnected) this.broadcast("playerLeft", a.player.id, ws);
    }
    ws.close();
  }
  webSocketError(ws) {
    const a = ws.deserializeAttachment();
    if (a?.authenticated && a.player) {
      const stillConnected = this.sockets().some(other => {
        if (other === ws) return false;
        const current = other.deserializeAttachment();
        return current?.authenticated && current.player?.id === a.player.id;
      });
      if (!stillConnected) this.broadcast("playerLeft", a.player.id, ws);
    }
  }
}
