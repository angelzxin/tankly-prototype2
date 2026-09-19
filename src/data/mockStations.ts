import type { Station } from "../types";

/**
 * Realistic mock stations around downtown Durham, NC.
 * Detour miles/minutes are filled at fetch time from the driver's origin.
 */
export const MOCK_STATIONS: Station[] = [
  {
    id: "circlek-foster",
    name: "Circle K — Foster St",
    currentPricePerGallon: 3.49,
    latitude: 35.99935,
    longitude: -78.90255,
    detourMinutes: 0,
    detourMiles: 0,
  },
  {
    id: "exxon-east-main",
    name: "Exxon — East Main",
    currentPricePerGallon: 3.41,
    latitude: 35.9939,
    longitude: -78.8943,
    detourMinutes: 0,
    detourMiles: 0,
  },
  {
    id: "shell-west-main",
    name: "Shell — West Main",
    currentPricePerGallon: 3.67,
    latitude: 35.99655,
    longitude: -78.91585,
    detourMinutes: 0,
    detourMiles: 0,
  },
  {
    id: "bp-broad",
    name: "BP — Broad St",
    currentPricePerGallon: 3.54,
    latitude: 36.00515,
    longitude: -78.91025,
    detourMinutes: 0,
    detourMiles: 0,
  },
  {
    id: "kangaroo-chapel-hill-rd",
    name: "Kangaroo Express — Chapel Hill Rd",
    currentPricePerGallon: 3.39,
    latitude: 35.9882,
    longitude: -78.9208,
    detourMinutes: 0,
    detourMiles: 0,
  },
  {
    id: "costco-north-pointe",
    name: "Costco Gasoline — North Pointe",
    currentPricePerGallon: 3.29,
    latitude: 36.0176,
    longitude: -78.9603,
    detourMinutes: 0,
    detourMiles: 0,
  },
];
