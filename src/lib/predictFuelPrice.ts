import type { Station } from "../types";

/**
 * Placeholder for a future XGBoost (or similar) price model.
 * Isolated on purpose: swap the body later without changing callers.
 *
 * For the mock prototype this returns the station's current posted price.
 */
export function predictFuelPrice(station: Station): number {
  return station.currentPricePerGallon;
}
