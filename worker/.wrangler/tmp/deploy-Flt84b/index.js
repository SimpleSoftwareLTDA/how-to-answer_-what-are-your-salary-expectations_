// index.js
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          // You can restrict this to your domain later
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
        // Cache successful responses for 1 hour (3600 seconds)
        cacheTtl: 3600,
        // Ensure everything is cached regardless of origin headers
        cacheEverything: true,
        // Specific TTLs based on status codes
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
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
