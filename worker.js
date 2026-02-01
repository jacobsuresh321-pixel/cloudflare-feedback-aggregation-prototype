export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---- 0) Home ----
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(
        [
          "Feedback tool is running ✅",
          "",
          "POST /feedback   {\"message\":\"...\",\"source\":\"...\"}  -> stores feedback",
          "GET  /feedback   -> lists recent feedback",
          "GET  /analyze    -> AI summary + themes + sentiment of recent feedback",
        ].join("\n"),
        { headers: { "content-type": "text/plain; charset=utf-8" } }
      );
    }

    // ---- 1) Submit feedback ----
    // POST /feedback with JSON: { "message": "...", "source": "email|twitter|support|..." }
    if (request.method === "POST" && url.pathname === "/feedback") {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response('Send JSON like {"message":"...","source":"support"}', {
          status: 400,
        });
      }

      const message = (body.message || "").trim();
      const source = (body.source || "mock").trim();

      if (!message) {
        return new Response("Missing 'message' in JSON body.", { status: 400 });
      }

      await env.DB.prepare(
        "INSERT INTO feedback (message, created_at) VALUES (?, datetime('now'))"
      )
        .bind(`[${source}] ${message}`)
        .run();

      return Response.json({ ok: true, saved: { source, message } }, { status: 201 });
    }

    // ---- 2) List feedback ----
    // GET /feedback
    if (request.method === "GET" && url.pathname === "/feedback") {
      const { results } = await env.DB.prepare(
        "SELECT id, message, created_at FROM feedback ORDER BY id DESC LIMIT 20"
      ).all();

      return Response.json({ items: results });
    }

    // ---- 3) Analyze feedback with Workers AI ----
    // GET /analyze
    if (request.method === "GET" && url.pathname === "/analyze") {
      // Pull recent feedback from D1
      const { results } = await env.DB.prepare(
        "SELECT message FROM feedback ORDER BY id DESC LIMIT 20"
      ).all();

      const messages = (results || []).map((r) => r.message).filter(Boolean);

      if (messages.length === 0) {
        return new Response("No feedback found yet. POST to /feedback first.", {
          status: 400,
        });
      }

      const prompt = `
You are a product manager. Analyze the following user feedback and produce:
1) A 3-5 bullet executive summary
2) Top 3 themes (with counts)
3) Overall sentiment (positive/neutral/negative) with a short justification
4) Top 3 actionable product recommendations

Feedback:
${messages.map((m, i) => `${i + 1}. ${m}`).join("\n")}
`.trim();

      // Call Workers AI (text generation)
      // This model name should work for many accounts; if it errors, I’ll adjust based on the error message.
      const aiResult = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        prompt,
        max_tokens: 500,
      });

      // aiResult typically includes `response` (string). If your account returns a different shape,
      // the fallback below will still show something useful.
      const text =
        aiResult?.response ||
        aiResult?.result ||
        aiResult?.output ||
        JSON.stringify(aiResult);

      return new Response(text, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
