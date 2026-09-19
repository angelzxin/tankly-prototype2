import { estimateCostOfWaiting } from "./estimateCostOfWaiting";
import { predictFuelPrice } from "./predictFuelPrice";
import type {
  BusinessInputs,
  DecisionResult,
  Station,
  StationEvaluation,
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
  gallonsNeeded: number,
  business: BusinessInputs,
): StationEvaluation {
  const predictedPricePerGallon = predictFuelPrice(station);
  const fuelCost = predictedPricePerGallon * gallonsNeeded;
  const driverTimeCost =
    (station.detourMinutes / 60) * business.loadedLaborCostPerHour;
  const vehicleDetourCost = station.detourMiles * business.vehicleCostPerMile;

  return {
    station,
    predictedPricePerGallon,
    gallonsNeeded,
    fuelCost,
    driverTimeCost,
    vehicleDetourCost,
    expectedStopCost: fuelCost + driverTimeCost + vehicleDetourCost,
  };
}

export function recommendFuelStop(
  stations: Station[],
  vehicle: VehicleInputs,
  business: BusinessInputs,
): DecisionResult {
  const gallonsNeeded = gallonsNeededForFill(
    vehicle.tankCapacityGallons,
    vehicle.currentFuelPercent,
  );

  const evaluations = stations.map((station) =>
    evaluateStation(station, gallonsNeeded, business),
  );

  const bestStation =
    evaluations.length === 0
      ? null
      : evaluations.reduce((best, current) =>
          current.expectedStopCost < best.expectedStopCost ? current : best,
        );

  const expectedCostOfWaiting = estimateCostOfWaiting({
    gallonsNeeded,
    evaluations,
  });

  const bestExpectedStopCost = bestStation?.expectedStopCost ?? 0;
  const expectedSavings = expectedCostOfWaiting - bestExpectedStopCost;

  const isEmergency = vehicle.currentFuelPercent < vehicle.emergencyFuelPercent;
  const recommendation: DecisionResult["recommendation"] =
    isEmergency || expectedSavings >= business.minimumSavingsThreshold
      ? "ADD_STOP"
      : "DO_NOT_ADD_STOP";

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
      gallonsNeeded,
      expectedCostOfWaiting: 0,
      bestStation: null,
      evaluations: [],
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
    gallonsNeeded,
    expectedCostOfWaiting,
    bestStation,
    evaluations,
  };
}

export function googleMapsDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
