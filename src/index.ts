// ...existing code...
import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    const db = env.DB;

    const getRemain = async () => {
      const stmt = db.prepare("SELECT COUNT(*) AS cnt FROM votekeys WHERE used IS NULL");
      const { results } = await stmt.all();
      return results[0]?.cnt ?? 0;
    };

    const getRandomCandidate = async () => {
      const stmt = db.prepare("SELECT id FROM votekeys WHERE used IS NULL ORDER BY RANDOM() LIMIT 1");
      const { results } = await stmt.all();
      return results[0]?.id ?? null;
    };

    if (request.method === "GET") {
      const remain = await getRemain();
      const candidate = await getRandomCandidate();

      // Render HTML as before, embedding the JSON result for the client-side render
      const payload = { remain, candidate };
      const html = renderHtml(payload);

      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    if (request.method === "POST") {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "bad request" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      // Narrow the unknown to the expected shape before accessing uuid
      const uuid =
        typeof body === "object" && body !== null && "uuid" in body
          ? (body as any).uuid
          : undefined;
      if (!uuid || typeof uuid !== "string") {
        return new Response(JSON.stringify({ error: "bad request" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      // Try to atomically mark the provided id as used only if it's still null
      const upd = db.prepare("UPDATE votekeys SET used = CURRENT_TIMESTAMP WHERE id = ? AND used IS NULL");
      const updRes = await upd.bind(uuid).run();
      const changed = updRes?.meta?.changes ?? 0;

      const remain = await getRemain();

      if (changed === 0) {
        // Candidate was already used (or does not exist)
        const candidate = await getRandomCandidate();
        return new Response(JSON.stringify({ error: "bad candidate", remain, candidate }), {
          headers: { "content-type": "application/json" },
        });
      }

      // Successfully marked as used — return the votekey value, remain and candidate
      const sel = db.prepare("SELECT votekey FROM votekeys WHERE id = ?");
      const { results } = await sel.bind(uuid).all();
      const votekey = results[0]?.votekey ?? null;

      return new Response(JSON.stringify({ votekey, remain, candidate: uuid }), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("method not allowed", { status: 405 });
  },
} satisfies ExportedHandler<Env>;
// ...existing code...