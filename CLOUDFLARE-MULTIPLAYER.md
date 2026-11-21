# Accra Life — Cloudflare multiplayer

This is the always-connectable free-tier alternative to the Render test server. It uses a Cloudflare Worker and one SQLite-backed Durable Object room. The Worker does not sleep on a Render-style 15-minute timer, and the Durable Object uses the WebSocket Hibernation API so idle connections can remain connected without keeping the object active in memory.

## Important limits

Cloudflare's free plan currently includes 100,000 Durable Object requests/messages per day, 13,000 GB-seconds of duration per day, 100,000 Worker requests per day, and 10 ms CPU per Worker invocation. Exceeding a free Durable Object limit causes further operations of that type to fail until the daily reset. This is a small multiplayer test/early-access allowance, not unlimited capacity. Review the current [Durable Objects pricing and limits](https://developers.cloudflare.com/durable-objects/platform/pricing/) before launch.

Player IDs, SHA-256 secret hashes and the demo balance are stored in Durable Object SQLite storage. Live player position is held in WebSocket attachments and is not written as a permanent location history. Exact geolocation is converted to a broad area label and is never stored.

## Deploy

1. Create or sign in to a Cloudflare account and open the Workers & Pages dashboard.
2. On a laptop, install Node.js 20 or newer and clone this repository.
3. Check out the `feat/cloudflare-multiplayer` branch.
4. From the repository root run:
   ```sh
   npm install
   npx wrangler login
   npx wrangler deploy
   ```
5. Open the deployed Worker URL plus `/health`. It should return `{"ok":true,"service":"accra-life-cloudflare-multiplayer"}`.
6. In a script loaded before `online.js`, configure:
   ```js
   window.ACCRA_TRANSPORT = "cloudflare";
   window.ACCRA_SERVER = "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev";
   ```
7. Host the game files on HTTPS (for example, the existing GitHub Pages site) and open the game on two separate browsers/devices to test player presence and movement.

## Protocol and security

The Cloudflare client uses native WebSockets and a small JSON event protocol. It is not Socket.IO; the existing Node/Socket.IO server remains available as the fallback when `window.ACCRA_TRANSPORT` is not set to `cloudflare`. The Durable Object validates player IDs and secrets, stores only SHA-256 hashes, bounds movement values, rate-limits movement, and never broadcasts exact geolocation coordinates.

This backend is a presence/movement prototype. It is not an authoritative economy, anti-cheat system, voice/video relay, or payment service. The displayed balance remains a demo value. Do not use it for real-money transactions or as the sole identity provider for valuable player accounts.

## Local checks

Run `npm test` and `npm run test:server` for the existing Node server checks. Deploy to a Cloudflare test Worker and verify two-client WebSocket behaviour before making it the default multiplayer endpoint.
