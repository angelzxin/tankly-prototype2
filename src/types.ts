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

export type VehicleInputs = {
  currentFuelPercent: number;
  tankCapacityGallons: number;
  mpg: number;
  emergencyFuelPercent: number;
};

export type BusinessInputs = {
  loadedLaborCostPerHour: number;
  vehicleCostPerMile: number;
  minimumSavingsThreshold: number;
};

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

export type StationEvaluation = {
  station: Station;
  predictedPricePerGallon: number;
  gallonsNeeded: number;
  fuelCost: number;
  fuelPriceSavings: number;
  driverTimeCost: number;
  vehicleDetourCost: number;
  waitingRiskAdjustment: number;
  expectedNetValue: number;
  expectedStopCost: number;
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
};
