import type { Station } from "../types";

/**
 * Mock nearby stations + posted prices + detours.
 * Replace this module with live fuel-price and routing API clients later.
 */
export const MOCK_STATIONS: Station[] = [
  {
    id: "pilot-i95",
    name: "Pilot Travel Center — I-95",
    currentPricePerGallon: 3.49,
    latitude: 40.2171,
    longitude: -74.7429,
    detourMinutes: 6,
    detourMiles: 2.4,
  },
  {
    id: "loves-exit7",
    name: "Love's — Exit 7",
    currentPricePerGallon: 3.41,
    latitude: 40.2612,
    longitude: -74.5291,
    detourMinutes: 14,
    detourMiles: 6.8,
  },
  {
    id: "shell-route1",
    name: "Shell — US-1",
    currentPricePerGallon: 3.67,
    latitude: 40.3499,
    longitude: -74.659,
    detourMinutes: 3,
    detourMiles: 1.1,
  },
  {
    id: "costco-fleet",
    name: "Costco Fuel — Fleet Lane",
    currentPricePerGallon: 3.29,
    latitude: 40.2979,
    longitude: -74.0507,
    detourMinutes: 18,
    detourMiles: 9.2,
  },
];
