import type { Station } from "../types";
import { estimateDetour, type GeoPoint } from "./geo";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return null;
}

function pick(row: JsonObject, keys: string[]): unknown {
  for (const key of keys) {
    if (key in row && row[key] != null && row[key] !== "") {
      return row[key];
    }
  }
  return undefined;
}

function nested(row: JsonObject, path: string[]): unknown {
  let current: unknown = row;
  for (const key of path) {
    if (!isObject(current)) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

function extractRows(payload: unknown): JsonObject[] {
  if (Array.isArray(payload)) {
    return payload.filter(isObject);
  }
  if (!isObject(payload)) {
    return [];
  }

  for (const key of ["result", "results", "stations", "data", "items", "places"]) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value.filter(isObject);
    }
  }

  return [];
}

function coordinates(row: JsonObject): GeoPoint | null {
  const position = isObject(row.position) ? row.position : null;
  const location = isObject(row.location) ? row.location : null;
  const geometry = isObject(row.geometry) ? row.geometry : null;
  const geometryLocation = geometry && isObject(geometry.location) ? geometry.location : null;

  const latitude = asNumber(
    pick(row, ["latitude", "lat"]) ??
      (position && pick(position, ["lat", "latitude"])) ??
      (location && pick(location, ["lat", "latitude"])) ??
      (geometryLocation && pick(geometryLocation, ["lat", "latitude"])) ??
      nested(row, ["coords", "lat"]),
  );
  const longitude = asNumber(
    pick(row, ["longitude", "lng", "lon"]) ??
      (position && pick(position, ["lng", "lon", "longitude"])) ??
      (location && pick(location, ["lng", "lon", "longitude"])) ??
      (geometryLocation && pick(geometryLocation, ["lng", "lon", "longitude"])) ??
      nested(row, ["coords", "lng"]),
  );

  if (latitude == null || longitude == null) {
    return null;
  }

  return { latitude, longitude };
}

function priceFromList(prices: unknown): number | null {
  if (!Array.isArray(prices)) {
    return null;
  }

  const objects = prices.filter(isObject);
  const diesel = objects.find((price) => {
    const fuelType = String(price.fuelType ?? price.type ?? price.name ?? "").toLowerCase();
    return fuelType.includes("diesel") || fuelType === "3";
  });
  const chosen = diesel ?? objects[0];
  if (!chosen) {
    return null;
  }

  const amount = asNumber(chosen.price ?? chosen.amount ?? chosen.value);
  if (amount == null) {
    return null;
  }

  const unit = String(chosen.unit ?? "").toLowerCase();
  if (unit === "l" || unit === "liter" || unit === "litre") {
    return amount * 3.785411784;
  }

  return amount;
}

function stationPrice(row: JsonObject): number | null {
  const pricesObject = isObject(row.prices) ? row.prices : null;
  const fromFields = asNumber(
    pick(row, ["diesel", "regular", "gasoline", "gas", "price", "currentPricePerGallon"]) ??
      (pricesObject && pick(pricesObject, ["diesel", "regular", "gasoline", "gas"])),
  );

  return fromFields ?? priceFromList(row.prices);
}

function stationName(row: JsonObject): string {
  return (
    asString(pick(row, ["name", "station", "station_name", "title", "brand", "vicinity"])) ??
    "Unnamed station"
  );
}

function stationId(row: JsonObject, name: string, point: GeoPoint): string {
  return (
    asString(pick(row, ["id", "station_id", "place_id", "placeId"])) ??
    `${name}-${point.latitude.toFixed(5)}-${point.longitude.toFixed(5)}`
  );
}

export function normalizeStations(payload: unknown, origin: GeoPoint): Station[] {
  const stations: Station[] = [];

  for (const row of extractRows(payload)) {
    const point = coordinates(row);
    const price = stationPrice(row);
    if (!point || price == null || price <= 0) {
      continue;
    }

    const name = stationName(row);
    const detour = estimateDetour(origin, point);

    stations.push({
      id: stationId(row, name, point),
      name,
      currentPricePerGallon: Number(price.toFixed(3)),
      latitude: point.latitude,
      longitude: point.longitude,
      detourMinutes: detour.detourMinutes,
      detourMiles: detour.detourMiles,
    });
  }

  return stations;
}
