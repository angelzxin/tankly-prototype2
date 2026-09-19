import type { GeoPoint } from "./geo";

function coordPair(point: GeoPoint): string {
  return `${point.latitude},${point.longitude}`;
}

/**
 * Google Maps directions: current location → fuel stop → original destination.
 * Omit origin when the device location is unknown so Maps can use GPS.
 */
export function googleMapsDirectionsUrl(args: {
  origin?: GeoPoint | null;
  waypoint: GeoPoint;
  destination: GeoPoint;
}): string {
  const parts = [
    "api=1",
    args.origin ? `origin=${encodeURIComponent(coordPair(args.origin))}` : null,
    `destination=${encodeURIComponent(coordPair(args.destination))}`,
    `waypoints=${encodeURIComponent(coordPair(args.waypoint))}`,
    "travelmode=driving",
    "dir_action=navigate",
  ].filter((part): part is string => part !== null);

  return `https://www.google.com/maps/dir/?${parts.join("&")}`;
}
