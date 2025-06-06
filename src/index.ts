export default {
  async fetch(request: Request, env: { ANYFLARE_ASSETS: Fetcher }, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Proxy logic
    if (url.pathname.startsWith("/proxy/")) {
      let targetPath = url.pathname.substring("/proxy/".length);
      targetPath = targetPath.replace(/^https?:\/\//, '');
      const pathParts = targetPath.split('/');

      if (pathParts.length < 1) {
        return new Response("Error: No URL provided.", { status: 400 });
      }

      const domain = pathParts[0];
      const restPath = pathParts.slice(1).join('/');
      try {
        const targetUrl = new URL(`https://${domain}/${restPath}${url.search}`);
        const modifiedRequest = new Request(targetUrl.toString(), {
          method: request.method,
          headers: {
            ...Object.fromEntries(request.headers),
            Host: targetUrl.hostname,
          },
        });

        return fetch(modifiedRequest);
      } catch (error) {
        console.error("Error processing URL:", error);
        return new Response("Error: Invalid or improperly formatted URL.", { status: 400 });
      }
    }

    const assetResponse = await env.ANYFLARE_ASSETS.fetch(request);
      return assetResponse;

  }
}
