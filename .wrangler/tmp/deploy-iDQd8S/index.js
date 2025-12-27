// worker/index.js
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/ninja-api")) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-api-key"
          }
        });
      }
      const targetUrl = new URL("https://api.openwebninja.com/jsearch/company-job-salary");
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
      });
      const response = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: {
          "x-api-key": env.NINJA_API_KEY,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        cf: {
          cacheTtl: 3600,
          cacheEverything: true,
          cacheTtlByStatus: { "200-299": 3600, 404: 1, "500-599": 0 }
        }
      });
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
