export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, service: "multiplayer-game" }), {
        headers: { "content-type": "application/json" }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
