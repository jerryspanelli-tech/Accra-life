/* accra-cloud.js - connects the game to the online database (Supabase).
 * Signs the player in anonymously, creates their saved player row, and sends every money change through
 * the database, which checks it. Exposes window.ACCRA_CLOUD.ready and window.ACCRA_CLOUD.pay(txId, amount, reason). */
(function () {
  try {
    const SUPABASE_URL = "https://rojzwrewmwsnzbbfkdr.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvanp3cmV3bXdzbnpiYmZma2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNDk2MDAsImV4cCI6MjEwNzkyNTYwMH0.UVBUp3HgstVyOcDD2P6qm4DJxr3C7woUjbtXWddS-LE";
    let sb = null;

    function loadLibrary() {
      return new Promise((res, rej) => {
        if (window.supabase) return res();
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
        s.onload = res; s.onerror = () => rej(new Error("database library blocked"));
        document.head.appendChild(s);
      });
    }

    const ready = (async () => {
      await loadLibrary();
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const session = await sb.auth.getSession();
      if (!session.data.session) {
        const r = await sb.auth.signInAnonymously();
        if (r.error) throw r.error;
      }
      const p = await sb.rpc("create_player", { p_name: localStorage.getItem("accra-name") || "Citizen" });
      if (p.error) throw p.error;
      console.log("Cloud player ready:", p.data);
      return p.data;
    })();

    window.ACCRA_CLOUD = {
      ready,
      // every money change goes through here; the database refuses duplicates and overdrafts
      async pay(txId, amount, reason) {
        try {
          await ready;
          const r = await sb.rpc("apply_transaction", { p_tx: txId, p_amount: amount, p_reason: reason });
          if (r.error) return { ok: false, reason: r.error.message };
          return r.data;
        } catch (e) { return { ok: false, reason: e.message || String(e) }; }
      }
    };
    ready.catch(e => {
      console.error("accra-cloud failed:", e);
      if (window.ACCRA_LIFE && window.ACCRA_LIFE.api) window.ACCRA_LIFE.api.note("Online save not connected: " + (e.message || e));
    });
  } catch (err) { console.error("accra-cloud failed to start:", err); }
})();
