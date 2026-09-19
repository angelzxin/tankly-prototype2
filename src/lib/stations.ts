import { MOCK_STATIONS } from "../data/mockStations";
import { normalizeStations } from "./normalizeStations";
import type { GeoPoint } from "./geo";
import type { Station } from "../types";

export type { GeoPoint };

const dataSource = import.meta.env.VITE_DATA_SOURCE ?? "mock";

export function getDataSource(): "mock" | "live" {
  return dataSource === "live" ? "live" : "mock";
}

function buildDirectUrl(origin: GeoPoint): { url: string; headers: HeadersInit } {
  const key = import.meta.env.VITE_FUEL_PRICE_API_KEY;
  const base =
    import.meta.env.VITE_FUEL_PRICE_API_BASE_URL ||
    "https://api.collectapi.com/gasPrice/fromCoordinates";
  const url = new URL(base);
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (url.hostname.includes("hereapi.com") || url.hostname.includes("here.com")) {
    url.searchParams.set(
      "in",
      `circle:${origin.latitude},${origin.longitude};r=15000`,
    );
    url.searchParams.set("apiKey", key);
  } else if (url.hostname.includes("rapidapi.com")) {
    url.searchParams.set("lat", String(origin.latitude));
    url.searchParams.set("lng", String(origin.longitude));
    headers["X-RapidAPI-Key"] = key;
    headers["X-RapidAPI-Host"] = url.hostname;
  } else {
    url.searchParams.set("lat", String(origin.latitude));
    url.searchParams.set("lng", String(origin.longitude));
    headers.authorization = `apikey ${key}`;
  }

  return { url: url.toString(), headers };
}

async function fetchLiveStations(origin: GeoPoint): Promise<Station[]> {
  const key = import.meta.env.VITE_FUEL_PRICE_API_KEY;
  if (!key) {
    throw new Error("Live mode needs VITE_FUEL_PRICE_API_KEY in .env");
  }
  if (!import.meta.env.VITE_FUEL_PRICE_API_BASE_URL) {
    throw new Error("Live mode needs VITE_FUEL_PRICE_API_BASE_URL in .env");
  }

  const request = import.meta.env.DEV
    ? {
        url: `/api/fuel-live?lat=${encodeURIComponent(origin.latitude)}&lng=${encodeURIComponent(origin.longitude)}`,
        headers: undefined,
      }
    : buildDirectUrl(origin);

  const response = await fetch(request.url, { headers: request.headers });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Fuel price API failed (${response.status}): ${detail.slice(0, 200) || response.statusText}`,
    );
  }

  const payload: unknown = await response.json();
  const stations = normalizeStations(payload, origin);
  if (stations.length === 0) {
    throw new Error("No stations with prices were returned for this location.");
  }

  return stations;
}

export async function getNearbyStations(origin: GeoPoint): Promise<Station[]> {
  if (getDataSource() === "mock") {
    return MOCK_STATIONS;
  }

  return fetchLiveStations(origin);
}
