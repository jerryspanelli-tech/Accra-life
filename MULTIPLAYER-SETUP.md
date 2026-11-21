# Accra Life multiplayer server

The Babylon.js game can run offline without this server. Multiplayer requires the Node server in this repository; GitHub Pages alone cannot host Socket.IO.

## Run locally

1. Install Node.js 18 or newer.
2. In the repository folder, run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000/babylon.html`.

The server exposes `/health` for a basic health check. Player identity is stored in the browser and authenticated by a secret; the server stores only a SHA-256 hash of that secret. Player balances and credential hashes are written outside the public static directory to `../accra-life-data/players.json` by default.

## Deploy

Deploy this repository as a Node.js web service on a host that supports long-lived WebSocket connections. Set the start command to `npm start` and use the host-provided `PORT`. If the host provides a persistent disk, set `ACCRA_DATA_DIR` to a directory on that disk; otherwise the local JSON account store may be lost when the host restarts or replaces the instance.

If the game page and server are hosted on the same origin, the Babylon client connects to that origin automatically. If they are hosted separately, define `window.ACCRA_SERVER` to the server's HTTPS origin in a script before `online.js` loads. Set `ACCRA_ALLOWED_ORIGINS` on the server to a comma-separated list of allowed game-page origins.

## Scope and limitations

- This server handles Babylon player presence, movement updates, player identity and opt-in coarse area labels.
- Exact geolocation coordinates are converted to a broad area label in memory and are not persisted or broadcast.
- It is not an authoritative multiplayer economy, anti-cheat system, voice/video relay, or payment service. Do not treat client-side balances or gifts in the older Three.js/Firebase path as secure real-money transactions.
- Use HTTPS in production so browser WebSocket and geolocation permissions work correctly.
