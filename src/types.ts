export type Recommendation = "ADD_STOP" | "DO_NOT_ADD_STOP";

export type Station = {
  id: string;
  name: string;
  currentPricePerGallon: number;
  latitude: number;
  longitude: number;
  detourMinutes: number;
  detourMiles: number;
};

export type VehicleClass = "sedan" | "suv" | "van";

export type VehicleInputs = {
  currentFuelPercent: number;
  tankCapacityGallons: number;
  mpg: number;
  emergencyFuelPercent: number;
  /** USD per hour of driver time. */
  driverHourlyCost: number;
  /** USD per mile of vehicle operating cost. */
  vehicleOperatingCostPerMile: number;
};

export type BusinessInputs = {
  minimumSavingsThreshold: number;
};

export type FleetVehicleStatus =
  | "Driving"
  | "Stop recommended"
  | "Refueling"
  | "No action needed";

export type TripInputs = {
  destinationName: string;
  destinationLatitude: number;
  destinationLongitude: number;
  remainingMiles: number;
  remainingMinutes: number;
  trafficMultiplier: number;
  expectedFuturePricePerGallon: number;
};

export type FuelPrediction = {
  probabilityNeedFuelSoon: number;
  milesUntilLikelyRefuel: number;
  estimatedGallonsNeeded: number;
  expectedFuturePricePerGallon: number;
  futureOpportunityRisk: number;
};

/** Canonical Tankly economics for one recommended stop. All money fields are USD. */
export type TanklyDecision = {
  fuelPriceAdvantage: number;
  driverTimeCost: number;
  vehicleDetourCost: number;
  waitingCostAvoided: number;
  netValue: number;
  recommendedStation: Station | null;
  reason: string;
  headline: string;
  customerRecommendation: string;
  shouldAddStop: boolean;
  expectedGallonsPurchased: number;
  expectedAlternativeFuelPrice: number;
  recommendedStationPrice: number;
  waitingReason: string;
};

export type StationEvaluation = {
  station: Station;
  predictedPricePerGallon: number;
  gallonsNeeded: number;
  fuelCost: number;
  fuelPriceAdvantage: number;
  fuelPriceSavings: number;
  driverTimeCost: number;
  vehicleDetourCost: number;
  waitingCostAvoided: number;
  waitingRiskAdjustment: number;
  expectedNetValue: number;
  netValue: number;
  expectedStopCost: number;
  expectedAlternativeFuelPrice: number;
  waitingReason: string;
};

export type DecisionResult = {
  recommendation: Recommendation;
  stationName: string;
  gasPrice: number;
  detourMinutes: number;
  detourMiles: number;
  expectedStopCost: number;
  expectedSavings: number;
  latitude: number;
  longitude: number;
  gallonsNeeded: number;
  expectedCostOfWaiting: number;
  bestStation: StationEvaluation | null;
  evaluations: StationEvaluation[];
  prediction: FuelPrediction;
  tankly: TanklyDecision;
};
