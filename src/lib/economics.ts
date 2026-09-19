/**
 * Tankly uses US dollars and US gallons throughout.
 * currentFuelPercent is 0–100 (percent remaining), not a 0–1 fraction.
 *
 * Expected net savings (USD) =
 *   fuelPriceAdvantage
 *   − driverTimeCost
 *   − vehicleDetourCost
 *   + waitingCostAvoided
 *
 * fuelPriceAdvantage (USD) =
 *   (expectedAlternativeFuelPriceUsdPerGal − recommendedStationPriceUsdPerGal)
 *   × expectedGallonsPurchased
 *
 * driverTimeCost (USD) = (detourMinutes / 60) × driverHourlyCostUsd
 * vehicleDetourCost (USD) = detourMiles × vehicleOperatingCostPerMileUsd
 * waitingCostAvoided (USD) =
 *   probabilityNeedFuelSoon × futureOpportunityRisk
 *   × expectedGallonsPurchased × max(0, laterUsdPerGal − hereUsdPerGal)
 */
export function fuelFractionRemaining(currentFuelPercent: number): number {
  return currentFuelPercent / 100;
}

/** Gallons purchased to fill the tank from the current fuel level. */
export function expectedGallonsPurchased(
  tankCapacityGallons: number,
  currentFuelPercent: number,
): number {
  return tankCapacityGallons * (1 - fuelFractionRemaining(currentFuelPercent));
}

export function dollars(value: number): number {
  return Number(value.toFixed(2));
}

export function usd(value: number): string {
  return `$${Math.abs(value).toFixed(2)}`;
}

/** Display a USD amount with an explicit sign, e.g. +$3.83 or -$2.25. */
export function signedUsd(value: number): string {
  if (value > 0) {
    return `+$${value.toFixed(2)}`;
  }
  if (value < 0) {
    return `-$${Math.abs(value).toFixed(2)}`;
  }
  return "$0.00";
}

export type TanklyEconomicsInput = {
  /** USD per gallon at the recommended (or evaluated) station. */
  recommendedStationPriceUsdPerGal: number;
  /** USD per gallon expected if the driver skips this stop. */
  expectedAlternativeFuelPriceUsdPerGal: number;
  /** US gallons to fill from currentFuelPercent. */
  expectedGallonsPurchased: number;
  /** Detour duration in minutes. */
  detourMinutes: number;
  /** Extra distance in miles. */
  detourMiles: number;
  /** Loaded driver time cost, USD per hour. */
  driverHourlyCostUsd: number;
  /** Vehicle operating cost, USD per mile. */
  vehicleOperatingCostPerMileUsd: number;
  /** 0–1 probability the vehicle needs fuel soon. */
  probabilityNeedFuelSoon: number;
  /** 0–1 rising-price / missed-opportunity risk. */
  futureOpportunityRisk: number;
};

export type TanklyEconomicsBreakdown = {
  fuelPriceAdvantage: number;
  driverTimeCost: number;
  vehicleDetourCost: number;
  waitingCostAvoided: number;
  netValue: number;
  expectedGallonsPurchased: number;
  expectedAlternativeFuelPrice: number;
  recommendedStationPrice: number;
};

export function computeTanklyEconomics(
  input: TanklyEconomicsInput,
): TanklyEconomicsBreakdown {
  const fuelPriceAdvantageUsd =
    (input.expectedAlternativeFuelPriceUsdPerGal - input.recommendedStationPriceUsdPerGal) *
    input.expectedGallonsPurchased;
  const driverTimeCostUsd = (input.detourMinutes / 60) * input.driverHourlyCostUsd;
  const vehicleDetourCostUsd = input.detourMiles * input.vehicleOperatingCostPerMileUsd;
  const priceGapUsdPerGal = Math.max(
    0,
    input.expectedAlternativeFuelPriceUsdPerGal - input.recommendedStationPriceUsdPerGal,
  );
  const waitingCostAvoidedUsd =
    input.probabilityNeedFuelSoon *
    input.futureOpportunityRisk *
    input.expectedGallonsPurchased *
    priceGapUsdPerGal;
  const fuelPriceAdvantage = dollars(fuelPriceAdvantageUsd);
  const driverTimeCost = dollars(driverTimeCostUsd);
  const vehicleDetourCost = dollars(vehicleDetourCostUsd);
  const waitingCostAvoided = dollars(waitingCostAvoidedUsd);
  const netValue = dollars(
    fuelPriceAdvantage - driverTimeCost - vehicleDetourCost + waitingCostAvoided,
  );

  return {
    fuelPriceAdvantage,
    driverTimeCost,
    vehicleDetourCost,
    waitingCostAvoided,
    netValue,
    expectedGallonsPurchased: input.expectedGallonsPurchased,
    expectedAlternativeFuelPrice: input.expectedAlternativeFuelPriceUsdPerGal,
    recommendedStationPrice: input.recommendedStationPriceUsdPerGal,
  };
}

export function waitingReasonCopy(
  probabilityNeedFuelSoon: number,
  laterUsdPerGal: number,
  hereUsdPerGal: number,
): string {
  const needPercent = Math.round(probabilityNeedFuelSoon * 100);
  const priceGapUsdPerGal = laterUsdPerGal - hereUsdPerGal;
  if (priceGapUsdPerGal > 0 && probabilityNeedFuelSoon >= 0.35) {
    return `Predicted ${needPercent}% chance you'll need fuel soon, and the outlook later price is $${laterUsdPerGal.toFixed(2)}/gal versus $${hereUsdPerGal.toFixed(2)}/gal here.`;
  }
  if (priceGapUsdPerGal > 0) {
    return `Outlook later price $${laterUsdPerGal.toFixed(2)}/gal is higher than $${hereUsdPerGal.toFixed(2)}/gal here; waiting cost avoided scales with that gap and predicted fuel need (${needPercent}%).`;
  }
  return `No higher later price is expected ($${laterUsdPerGal.toFixed(2)}/gal vs $${hereUsdPerGal.toFixed(2)}/gal here), so waiting cost avoided is near zero.`;
}

export function driverHeadlineCopy(input: {
  shouldAddStop: boolean;
  stationShortName: string;
  hereUsdPerGal: number;
  laterUsdPerGal: number;
  isLowestPriceOnRoute: boolean;
}): string {
  const here = `$${input.hereUsdPerGal.toFixed(2)}/gal`;
  const later = `~$${input.laterUsdPerGal.toFixed(2)}/gal`;
  if (!input.shouldAddStop) {
    return `Waiting is the better move right now. Fuel is ${here} here versus ${later} expected later, so this detour is not worth taking yet.`;
  }
  const opener = input.isLowestPriceOnRoute
    ? `You're passing one of the lowest-cost stops on your route.`
    : `You're passing a lower-cost stop on your route.`;
  return `${opener} Fuel is ${here} here versus ${later} expected when you'll likely need to refuel later.`;
}

export function customerRecommendationLabel(
  shouldAddStop: boolean,
  stationShortName: string | null,
): string {
  if (shouldAddStop && stationShortName) {
    return `Fill at ${stationShortName}`;
  }
  return "Keep driving";
}

export function stationShortName(fullName: string): string {
  return fullName.split("—")[0].trim();
}
