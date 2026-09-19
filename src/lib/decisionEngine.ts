import { estimateCostOfWaiting } from "./estimateCostOfWaiting";
import { futurePriceForHorizon, type GasPriceForecast } from "./gasPriceForecast";
import { predictFuelNeed } from "./predictionEngine";
import { predictFuelPrice } from "./predictFuelPrice";
import type {
  BusinessInputs,
  DecisionResult,
  FuelPrediction,
  Station,
  StationEvaluation,
  TripInputs,
  VehicleInputs,
} from "../types";

export function gallonsNeededForFill(
  tankCapacityGallons: number,
  currentFuelPercent: number,
): number {
  const fractionRemaining = currentFuelPercent / 100;
  return tankCapacityGallons * (1 - fractionRemaining);
}

export function evaluateStation(
  station: Station,
  prediction: FuelPrediction,
  business: BusinessInputs,
): StationEvaluation {
  const predictedPricePerGallon = predictFuelPrice(station);
  const gallonsNeeded = prediction.estimatedGallonsNeeded;
  const fuelCost = predictedPricePerGallon * gallonsNeeded;
  const fuelPriceSavings =
    (prediction.expectedFuturePricePerGallon - predictedPricePerGallon) * gallonsNeeded;
  const driverTimeCost =
    (station.detourMinutes / 60) * business.loadedLaborCostPerHour;
  const vehicleDetourCost = station.detourMiles * business.vehicleCostPerMile;
  const waitingRiskAdjustment =
    prediction.futureOpportunityRisk *
    gallonsNeeded *
    Math.max(0, prediction.expectedFuturePricePerGallon - predictedPricePerGallon);
  const expectedNetValue =
    fuelPriceSavings - driverTimeCost - vehicleDetourCost + waitingRiskAdjustment;

  return {
    station,
    predictedPricePerGallon,
    gallonsNeeded,
    fuelCost,
    fuelPriceSavings,
    driverTimeCost,
    vehicleDetourCost,
    waitingRiskAdjustment,
    expectedNetValue,
    expectedStopCost: fuelCost + driverTimeCost + vehicleDetourCost,
  };
}

export function recommendFuelStop(
  stations: Station[],
  vehicle: VehicleInputs,
  business: BusinessInputs,
  trip: TripInputs,
  forecast: GasPriceForecast,
): DecisionResult {
  const prediction = predictFuelNeed(vehicle, trip, stations, forecast);
  const evaluations = stations.map((station) =>
    evaluateStation(station, prediction, business),
  );

  const bestStation =
    evaluations.length === 0
      ? null
      : evaluations.reduce((best, current) =>
          current.expectedNetValue > best.expectedNetValue ? current : best,
        );

  const expectedCostOfWaiting = estimateCostOfWaiting({
    gallonsNeeded: prediction.estimatedGallonsNeeded,
    futurePricePerGallon: futurePriceForHorizon(forecast, trip.remainingMinutes),
  });
  const expectedSavings = bestStation?.expectedNetValue ?? 0;
  const recommendation = recommendationForStop(bestStation, vehicle, business);

  if (!bestStation) {
    return {
      recommendation: "DO_NOT_ADD_STOP",
      stationName: "No stations nearby",
      gasPrice: 0,
      detourMinutes: 0,
      detourMiles: 0,
      expectedStopCost: 0,
      expectedSavings: 0,
      latitude: 0,
      longitude: 0,
      gallonsNeeded: prediction.estimatedGallonsNeeded,
      expectedCostOfWaiting: 0,
      bestStation: null,
      evaluations: [],
      prediction,
    };
  }

  return {
    recommendation,
    stationName: bestStation.station.name,
    gasPrice: bestStation.predictedPricePerGallon,
    detourMinutes: bestStation.station.detourMinutes,
    detourMiles: bestStation.station.detourMiles,
    expectedStopCost: bestStation.expectedStopCost,
    expectedSavings,
    latitude: bestStation.station.latitude,
    longitude: bestStation.station.longitude,
    gallonsNeeded: prediction.estimatedGallonsNeeded,
    expectedCostOfWaiting,
    bestStation,
    evaluations,
    prediction,
  };
}

export function shouldShowAddStopCta(
  recommendation: DecisionResult["recommendation"],
): boolean {
  return recommendation === "ADD_STOP";
}

export function recommendationForStop(
  evaluation: StationEvaluation | null,
  vehicle: VehicleInputs,
  business: BusinessInputs,
): DecisionResult["recommendation"] {
  if (!evaluation) {
    return "DO_NOT_ADD_STOP";
  }
  if (vehicle.currentFuelPercent < vehicle.emergencyFuelPercent) {
    return "ADD_STOP";
  }
  if (evaluation.expectedNetValue >= business.minimumSavingsThreshold) {
    return "ADD_STOP";
  }
  return "DO_NOT_ADD_STOP";
}
