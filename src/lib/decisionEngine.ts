import {
  computeTanklyEconomics,
  customerRecommendationLabel,
  driverHeadlineCopy,
  expectedGallonsPurchased,
  stationShortName,
  waitingReasonCopy,
} from "./economics";
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
  TanklyDecision,
  TripInputs,
  VehicleInputs,
} from "../types";

export function gallonsNeededForFill(
  tankCapacityGallons: number,
  currentFuelPercent: number,
): number {
  return expectedGallonsPurchased(tankCapacityGallons, currentFuelPercent);
}

function decisionReason(
  recommendation: DecisionResult["recommendation"],
  evaluation: StationEvaluation | null,
): string {
  if (!evaluation) {
    return "No nearby stations to evaluate.";
  }
  if (recommendation === "ADD_STOP") {
    return `Stopping now has a net value of $${evaluation.netValue.toFixed(2)} after detour costs.`;
  }
  return `Waiting is better: net value of this stop is $${evaluation.netValue.toFixed(2)}, below the savings threshold.`;
}

export function evaluateStation(
  station: Station,
  prediction: FuelPrediction,
  vehicle: VehicleInputs,
): StationEvaluation {
  const recommendedStationPriceUsdPerGal = predictFuelPrice(station);
  const expectedGallons = prediction.estimatedGallonsNeeded;
  const economics = computeTanklyEconomics({
    recommendedStationPriceUsdPerGal,
    expectedAlternativeFuelPriceUsdPerGal: prediction.expectedFuturePricePerGallon,
    expectedGallonsPurchased: expectedGallons,
    detourMinutes: station.detourMinutes,
    detourMiles: station.detourMiles,
    driverHourlyCostUsd: vehicle.driverHourlyCost,
    vehicleOperatingCostPerMileUsd: vehicle.vehicleOperatingCostPerMile,
    probabilityNeedFuelSoon: prediction.probabilityNeedFuelSoon,
    futureOpportunityRisk: prediction.futureOpportunityRisk,
  });
  const fuelCostUsd = recommendedStationPriceUsdPerGal * expectedGallons;

  return {
    station,
    predictedPricePerGallon: recommendedStationPriceUsdPerGal,
    gallonsNeeded: expectedGallons,
    fuelCost: fuelCostUsd,
    fuelPriceAdvantage: economics.fuelPriceAdvantage,
    fuelPriceSavings: economics.fuelPriceAdvantage,
    driverTimeCost: economics.driverTimeCost,
    vehicleDetourCost: economics.vehicleDetourCost,
    waitingCostAvoided: economics.waitingCostAvoided,
    waitingRiskAdjustment: economics.waitingCostAvoided,
    expectedNetValue: economics.netValue,
    netValue: economics.netValue,
    expectedStopCost: dollarsStop(fuelCostUsd + economics.driverTimeCost + economics.vehicleDetourCost),
    expectedAlternativeFuelPrice: economics.expectedAlternativeFuelPrice,
    waitingReason: waitingReasonCopy(
      prediction.probabilityNeedFuelSoon,
      prediction.expectedFuturePricePerGallon,
      recommendedStationPriceUsdPerGal,
    ),
  };
}

function dollarsStop(value: number): number {
  return Number(value.toFixed(2));
}

function toTanklyDecision(
  evaluation: StationEvaluation | null,
  prediction: FuelPrediction,
  recommendation: DecisionResult["recommendation"],
  evaluations: StationEvaluation[],
): TanklyDecision {
  const here = evaluation?.predictedPricePerGallon ?? 0;
  const isLowestPriceOnRoute =
    Boolean(evaluation) &&
    evaluations.every((item) => item.predictedPricePerGallon >= here);
  const shortName = evaluation ? stationShortName(evaluation.station.name) : "";
  const shouldAddStop = recommendation === "ADD_STOP";

  return {
    fuelPriceAdvantage: evaluation?.fuelPriceAdvantage ?? 0,
    driverTimeCost: evaluation?.driverTimeCost ?? 0,
    vehicleDetourCost: evaluation?.vehicleDetourCost ?? 0,
    waitingCostAvoided: evaluation?.waitingCostAvoided ?? 0,
    netValue: evaluation?.netValue ?? 0,
    recommendedStation: evaluation?.station ?? null,
    reason: decisionReason(recommendation, evaluation),
    headline: evaluation
      ? driverHeadlineCopy({
          shouldAddStop,
          stationShortName: shortName,
          hereUsdPerGal: here,
          laterUsdPerGal: prediction.expectedFuturePricePerGallon,
          isLowestPriceOnRoute,
        })
      : "No nearby stations to evaluate.",
    shouldAddStop,
    expectedGallonsPurchased: prediction.estimatedGallonsNeeded,
    expectedAlternativeFuelPrice: prediction.expectedFuturePricePerGallon,
    recommendedStationPrice: here,
    waitingReason: evaluation?.waitingReason ?? "No station evaluated.",
    customerRecommendation: customerRecommendationLabel(shouldAddStop, shortName || null),
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
  const evaluations = stations.map((station) => evaluateStation(station, prediction, vehicle));

  const bestStation =
    evaluations.length === 0
      ? null
      : evaluations.reduce((best, current) =>
          current.netValue > best.netValue ? current : best,
        );

  const expectedCostOfWaiting = estimateCostOfWaiting({
    gallonsNeeded: prediction.estimatedGallonsNeeded,
    futurePricePerGallon: futurePriceForHorizon(forecast, trip.remainingMinutes),
  });
  const expectedSavings = bestStation?.netValue ?? 0;
  const recommendation = recommendationForStop(bestStation, vehicle, business);
  const tankly = toTanklyDecision(bestStation, prediction, recommendation, evaluations);

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
      tankly,
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
    tankly,
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
  if (evaluation.netValue >= business.minimumSavingsThreshold) {
    return "ADD_STOP";
  }
  return "DO_NOT_ADD_STOP";
}
