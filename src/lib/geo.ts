export type GeoPoint = {
  latitude: number;
  longitude: number;
};

const EARTH_MILES = 3958.8;
const LOCAL_DETOUR_MPH = 35;

export function milesBetween(from: GeoPoint, to: GeoPoint): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_MILES * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function estimateDetour(origin: GeoPoint, station: GeoPoint): {
  detourMiles: number;
  detourMinutes: number;
} {
  const detourMiles = milesBetween(origin, station);
  const detourMinutes = (detourMiles / LOCAL_DETOUR_MPH) * 60;

  return {
    detourMiles: Number(detourMiles.toFixed(1)),
    detourMinutes: Number(detourMinutes.toFixed(0)),
  };
}
