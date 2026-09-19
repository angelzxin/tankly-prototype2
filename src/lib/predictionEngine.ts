import { expectedGallonsPurchased } from "./economics";
import { futurePriceForHorizon, type GasPriceForecast } from "./gasPriceForecast";
import type { FuelPrediction, Station, TripInputs, VehicleInputs } from "../types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function averageStationPrice(stations: Station[]): number {
  if (stations.length === 0) {
    return 0;
  }
  const total = stations.reduce((sum, station) => sum + station.currentPricePerGallon, 0);
  return total / stations.length;
}

/**
 * Deterministic stand-in for a future XGBoost fuel-need / price model.
 * Swap this file later without changing the optimizer.
 */
export function predictFuelNeed(
  vehicle: VehicleInputs,
  trip: TripInputs,
  stations: Station[],
  forecast: GasPriceForecast,
): FuelPrediction {
  const trafficMultiplier = Math.max(trip.trafficMultiplier, 0.2);
  const effectiveMpg = vehicle.mpg / trafficMultiplier;
  const currentGallons = vehicle.tankCapacityGallons * (vehicle.currentFuelPercent / 100);
  const milesUntilLikelyRefuel = Math.max(0, currentGallons * effectiveMpg);
  const estimatedGallonsNeeded = expectedGallonsPurchased(
    vehicle.tankCapacityGallons,
    vehicle.currentFuelPercent,
  );

  const rangeRatio = trip.remainingMiles / Math.max(milesUntilLikelyRefuel, 1);
  const emergencyGap = (vehicle.emergencyFuelPercent - vehicle.currentFuelPercent) / 100;
  const probabilityNeedFuelSoon = clamp(
    0.12 + 0.5 * Math.min(rangeRatio, 1.35) + emergencyGap * 0.8 + (trafficMultiplier - 1) * 0.15,
    0.04,
    0.97,
  );

  const expectedFuturePricePerGallon = futurePriceForHorizon(forecast, trip.remainingMinutes);
  const avgPrice = averageStationPrice(stations);
  const priceGap = Math.max(0, expectedFuturePricePerGallon - avgPrice);
  const futureOpportunityRisk = clamp(
    probabilityNeedFuelSoon * (priceGap / Math.max(avgPrice, 0.5)) * 1.4,
    0,
    1,
  );

  return {
    probabilityNeedFuelSoon,
    milesUntilLikelyRefuel,
    estimatedGallonsNeeded,
    expectedFuturePricePerGallon,
    futureOpportunityRisk,
  };
}
