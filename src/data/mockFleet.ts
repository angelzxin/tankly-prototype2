import type { TripInputs, VehicleInputs } from "../types";

/** Live Driver demo vehicle only — not the Fleet Manager 30-day history. */
export const DRIVER_DEMO_VEHICLE: VehicleInputs = {
  currentFuelPercent: 25,
  tankCapacityGallons: 15,
  mpg: 28,
  emergencyFuelPercent: 10,
  driverHourlyCost: 30,
  vehicleOperatingCostPerMile: 0.2,
};

export const DRIVER_DEMO_TRIP: TripInputs = {
  destinationName: "Raleigh, NC",
  destinationLatitude: 35.7796,
  destinationLongitude: -78.6382,
  remainingMiles: 22.4,
  remainingMinutes: 32,
  trafficMultiplier: 1.15,
  expectedFuturePricePerGallon: 3.79,
};
