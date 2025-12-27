export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 1. Route API requests (path starting with /ninja-api)
        if (url.pathname.startsWith("/ninja-api")) {
            // Handle CORS Preflight (OPTIONS)
            if (request.method === "OPTIONS") {
                return new Response(null, {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
                    },
                });
            }

            // Prepare the target URL
            const targetUrl = new URL("https://api.openwebninja.com/jsearch/company-job-salary");
            // Forward search params
            url.searchParams.forEach((value, key) => {
                targetUrl.searchParams.set(key, value);
            });

            // Fetch from upstream
            const response = await fetch(targetUrl.toString(), {
                method: "GET",
                headers: {
                    "x-api-key": env.NINJA_API_KEY,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
                cf: {
                    cacheTtl: 3600,
                    cacheEverything: true,
                    cacheTtlByStatus: { "200-299": 3600, 404: 1, "500-599": 0 }
                }
            });

            // Re-wrap response with CORS
            const newHeaders = new Headers(response.headers);
            newHeaders.set("Access-Control-Allow-Origin", "*");

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders,
            });
        }

        // 2. Fallback: Serve Static Assets (Angular App)
        // required for SPA to work on non-API routes
        return env.ASSETS.fetch(request);
    },
};
