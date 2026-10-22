/**
 * FreeTrade Charts — Dukascopy historical archive proxy
 * Deploy this file as a Cloudflare Worker.
 * The worker only permits the public Dukascopy XAUUSD 1-minute candle archive.
 */
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    const incoming = new URL(request.url);
    const target = incoming.searchParams.get("url");
    if (!target) {
      return new Response("Missing url parameter", { status: 400, headers: cors });
    }

    let upstreamUrl;
    try {
      upstreamUrl = new URL(target);
    } catch {
      return new Response("Invalid URL", { status: 400, headers: cors });
    }

    const allowedPath = /^\/datafeed\/XAUUSD\/\d{4}\/\d{2}\/\d{2}\/BID_candles_min_1\.bi5$/;
    if (upstreamUrl.protocol !== "https:" ||
        upstreamUrl.hostname !== "datafeed.dukascopy.com" ||
        !allowedPath.test(upstreamUrl.pathname)) {
      return new Response("Only Dukascopy XAUUSD M1 archive URLs are allowed", {
        status: 403, headers: cors
      });
    }

    try {
      const upstream = await fetch(upstreamUrl.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 FreeTradeCharts/1.0" },
        cf: { cacheTtl: 3600, cacheEverything: true }
      });
      const headers = new Headers(cors);
      headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/octet-stream");
      headers.set("Cache-Control", "public, max-age=3600");
      return new Response(upstream.body, { status: upstream.status, headers });
    } catch {
      return new Response("Could not fetch Dukascopy archive", { status: 502, headers: cors });
    }
  }
};
