import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

function buildUpstream(
  env: Record<string, string>,
  lat: string,
  lng: string,
): { url: string; headers: Record<string, string> } {
  const key = env.VITE_FUEL_PRICE_API_KEY ?? "";
  const base =
    env.VITE_FUEL_PRICE_API_BASE_URL ||
    "https://api.collectapi.com/gasPrice/fromCoordinates";
  const url = new URL(base);
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (url.hostname.includes("hereapi.com") || url.hostname.includes("here.com")) {
    url.searchParams.set("in", `circle:${lat},${lng};r=15000`);
    url.searchParams.set("apiKey", key);
  } else if (url.hostname.includes("rapidapi.com")) {
    url.searchParams.set("lat", lat);
    url.searchParams.set("lng", lng);
    headers["X-RapidAPI-Key"] = key;
    headers["X-RapidAPI-Host"] = url.hostname;
  } else {
    url.searchParams.set("lat", lat);
    url.searchParams.set("lng", lng);
    headers.authorization = `apikey ${key}`;
  }

  return { url: url.toString(), headers };
}

function fuelLiveProxy(env: Record<string, string>): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/api/fuel-live")) {
      next();
      return;
    }

    const incoming = new URL(req.url, "http://localhost");
    const lat = incoming.searchParams.get("lat");
    const lng = incoming.searchParams.get("lng");
    if (!lat || !lng) {
      res.statusCode = 400;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: "lat and lng are required" }));
      return;
    }

    if (!env.VITE_FUEL_PRICE_API_KEY) {
      res.statusCode = 400;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: "Missing VITE_FUEL_PRICE_API_KEY" }));
      return;
    }

    try {
      const upstream = buildUpstream(env, lat, lng);
      const response = await fetch(upstream.url, { headers: upstream.headers });
      const body = await response.text();
      res.statusCode = response.status;
      res.setHeader("content-type", response.headers.get("content-type") ?? "application/json");
      res.end(body);
    } catch (error) {
      res.statusCode = 502;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Fuel API proxy failed",
        }),
      );
    }
  };

  return {
    name: "tankly-fuel-live-proxy",
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), fuelLiveProxy(env)],
  };
});
