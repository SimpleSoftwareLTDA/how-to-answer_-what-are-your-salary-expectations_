export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 1. Handle CORS Preflight (OPTIONS)
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*", // You can restrict this to your domain later
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
                },
            });
        }

        // 2. Prepare the target URL
        // Forward all query parameters (job_title, company, etc.)
        const targetUrl = new URL("https://api.openwebninja.com/jsearch/company-job-salary");
        url.searchParams.forEach((value, key) => {
            targetUrl.searchParams.set(key, value);
        });

        // 3. Make the request to OpenWeb Ninja
        const response = await fetch(targetUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": env.NINJA_API_KEY, // Injected from Cloudflare Secrets
            },
        });

        // 4. Return response with CORS headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Access-Control-Allow-Origin", "*");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
        });
    },
};
