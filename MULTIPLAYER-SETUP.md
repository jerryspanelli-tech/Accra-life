# Accra Life multiplayer server

The Babylon.js game can run offline without this server. Multiplayer requires the Node server in this repository; GitHub Pages alone cannot host Socket.IO.

## Free test deployment on Render

This repository includes `render.yaml` for a free Render web service in Frankfurt. To deploy it:

1. Open [Render Blueprint](https://dashboard.render.com/blueprints).
2. Connect GitHub if asked, then select `jerryspanelli-tech/Accra-life`.
3. Choose the branch `fix/accra-life-audit-repairs` while testing this repair branch.
4. Review the service and select the Free instance plan, then create the Blueprint.
5. Wait for the service to become Live and open `https://YOUR-SERVICE.onrender.com/health`. It should return JSON with `ok: true`.
6. Open `https://YOUR-SERVICE.onrender.com/babylon.html` to use the game with the multiplayer server on the same origin.

Use the Render-hosted `babylon.html` URL for multiplayer. If you open the GitHub Pages copy instead, its default same-origin connection points back to GitHub Pages, not the Render server.

The free Render service is suitable for testing, not reliable production hosting:
- It spins down after 15 minutes without inbound HTTP requests or WebSocket messages and can take about a minute to wake.
- The free filesystem is ephemeral. The local JSON account store is lost on restarts, spin-downs and redeploys.
- Render may restart a free service at any time.
- The server currently keeps only a lightweight player ID/secret hash and a demo balance; it is not a persistent player-account/economy backend.

## Run locally

1. Install Node.js 18 or newer.
2. In the repository folder, run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000/babylon.html`.

The server exposes `/health` for a basic health check. Player identity is stored in the browser and authenticated by a secret; the server stores only a SHA-256 hash of that secret. Player records are written outside the public static directory to `../accra-life-data/players.json` by default when running on a persistent local filesystem.

## Deploy elsewhere

Deploy this repository as a Node.js web service on a host that supports long-lived WebSocket connections. Set the start command to `npm start` and use the host-provided `PORT`. If the host provides a persistent disk, set `ACCRA_DATA_DIR` to a directory on that disk; otherwise the local JSON account store may be lost when the host restarts or replaces the instance.

If the game page and server are hosted on the same origin, the Babylon client connects to that origin automatically. If they are hosted separately, define `window.ACCRA_SERVER` to the server's HTTPS origin in a script before `online.js` loads. Set `ACCRA_ALLOWED_ORIGINS` on the server to a comma-separated list of allowed game-page origins.

## Scope and limitations

- This server handles Babylon player presence, movement updates, player identity and opt-in coarse area labels.
- Exact geolocation coordinates are converted to a broad area label in memory and are not persisted or broadcast.
- It is not an authoritative multiplayer economy, anti-cheat system, voice/video relay, or payment service. Do not treat client-side balances or gifts in the older Three.js/Firebase path as secure real-money transactions.
- Use HTTPS in production so browser WebSocket and geolocation permissions work correctly.
