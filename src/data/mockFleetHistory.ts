import {
  computeTanklyEconomics,
  customerRecommendationLabel,
  dollars,
  driverHeadlineCopy,
  expectedGallonsPurchased,
  waitingReasonCopy,
  type TanklyEconomicsBreakdown,
} from "../lib/economics";
import type { FleetVehicleStatus, VehicleClass } from "../types";

/**
 * DEMO ONLY — not live GPS, not the Driver in-route session.
 * Each event's dollars are produced by computeTanklyEconomics()
 * (the same formula decisionEngine uses).
 */
export type DemoFleetVehicle = {
  id: string;
  name: string;
  vehicleClass: VehicleClass;
  driverName: string;
  tankCapacityGallons: number;
  currentFuelPercent: number;
  mpg: number;
  driverHourlyCost: number;
  vehicleOperatingCostPerMile: number;
  emergencyFuelPercent: number;
  status: FleetVehicleStatus;
  liveStationName: string;
  liveShouldAddStop: boolean;
};

export type DemoFleetEvent = {
  id: string;
  vehicleId: string;
  occurredAt: string;
  stationName: string;
  accepted: boolean;
  shouldAddStop: boolean;
  detourMinutes: number;
  detourMiles: number;
  headline: string;
  waitingReason: string;
  customerRecommendation: string;
  economics: TanklyEconomicsBreakdown;
};

const STATION_NAMES = [
  "Exxon — East Main",
  "Circle K — Foster St",
  "Costco Gasoline — North Pointe",
  "Kangaroo Express — Chapel Hill Rd",
  "BP — Broad St",
  "Shell — West Main",
  "QuikTrip — Durham-Chapel Hill",
  "Sam's Club — Miami Blvd",
];

const DRIVERS = [
  "Maya Chen",
  "Luis Ortega",
  "Priya Shah",
  "Jordan Blake",
  "Ava Patel",
  "Noah Kim",
  "Sofia Alvarez",
  "Ethan Brooks",
  "Hannah Cole",
  "Marcus Reid",
  "Leila Hassan",
  "Owen Park",
  "Riley Nguyen",
  "Camila Torres",
  "Jack Brennan",
  "Amelia Shaw",
  "Diego Ruiz",
  "Grace Lin",
  "Theo Walker",
  "Nina Volkov",
  "Eli Johnson",
  "Sara Bennet",
  "Omar Farouk",
  "Chloe Martin",
  "Ben Adler",
  "Yuki Tanaka",
  "Ivy Ross",
  "Sam Okonkwo",
  "Nora Feldman",
  "Chris Delgado",
];

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, items: T[]): T {
  return items[Math.floor(random() * items.length)];
}

function range(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

type ClassProfile = {
  vehicleClass: VehicleClass;
  label: string;
  tank: [number, number];
  mpg: [number, number];
  hourly: [number, number];
  perMile: [number, number];
};

const CLASS_ROTATION: ClassProfile[] = [
  {
    vehicleClass: "van",
    label: "Van",
    tank: [18, 25],
    mpg: [16, 22],
    hourly: [28, 36],
    perMile: [0.28, 0.4],
  },
  {
    vehicleClass: "sedan",
    label: "Sedan",
    tank: [13, 16],
    mpg: [28, 36],
    hourly: [22, 30],
    perMile: [0.18, 0.26],
  },
  {
    vehicleClass: "suv",
    label: "SUV",
    tank: [16, 20],
    mpg: [20, 26],
    hourly: [24, 32],
    perMile: [0.22, 0.34],
  },
];

function buildVehicles(random: () => number): DemoFleetVehicle[] {
  return DRIVERS.map((driverName, index) => {
    const profile = CLASS_ROTATION[index % CLASS_ROTATION.length];
    const unit = String(index + 1).padStart(2, "0");
    const tankCapacityGallons = roundTo(range(random, profile.tank[0], profile.tank[1]), 1);
    let status: FleetVehicleStatus = "Driving";
    let currentFuelPercent = roundTo(range(random, 28, 72), 0);
    let liveShouldAddStop = false;
    const liveStationName = pick(random, STATION_NAMES);

    if (index === 0 || index === 7) {
      status = "Stop recommended";
      currentFuelPercent = roundTo(range(random, 16, 26), 0);
      liveShouldAddStop = true;
    } else if (index === 3 || index === 18) {
      status = "Refueling";
      currentFuelPercent = roundTo(range(random, 8, 14), 0);
      liveShouldAddStop = true;
    } else if (index % 5 === 2) {
      status = "No action needed";
      currentFuelPercent = roundTo(range(random, 58, 86), 0);
      liveShouldAddStop = false;
    }

    return {
      id: `${profile.vehicleClass}-${unit}`,
      name: `${profile.label} ${unit}`,
      vehicleClass: profile.vehicleClass,
      driverName,
      tankCapacityGallons,
      currentFuelPercent,
      mpg: roundTo(range(random, profile.mpg[0], profile.mpg[1]), 1),
      driverHourlyCost: roundTo(range(random, profile.hourly[0], profile.hourly[1]), 2),
      vehicleOperatingCostPerMile: roundTo(range(random, profile.perMile[0], profile.perMile[1]), 2),
      emergencyFuelPercent: 10,
      status,
      liveStationName,
      liveShouldAddStop,
    };
  });
}

function buildEvents(
  vehicles: DemoFleetVehicle[],
  random: () => number,
  now: Date,
): DemoFleetEvent[] {
  const events: DemoFleetEvent[] = [];
  let eventIndex = 0;

  for (const vehicle of vehicles) {
    const fillCount = 16 + Math.floor(random() * 7);
    for (let i = 0; i < fillCount; i += 1) {
      const daysAgo = 1 + Math.floor(random() * 29);
      const occurred = new Date(now);
      occurred.setDate(now.getDate() - daysAgo);
      occurred.setHours(7 + Math.floor(random() * 11), Math.floor(random() * 60), 0, 0);

      const fuelPercent = roundTo(range(random, 14, 38), 0);
      const gallons = expectedGallonsPurchased(vehicle.tankCapacityGallons, fuelPercent);
      const hereUsdPerGal = roundTo(range(random, 3.12, 3.42), 2);
      const laterUsdPerGal = roundTo(hereUsdPerGal + range(random, 0.14, 0.32), 2);
      const detourMinutes = roundTo(range(random, 2, 7), 1);
      const detourMiles = roundTo(range(random, 0.6, 2.4), 1);
      const probabilityNeedFuelSoon = roundTo(range(random, 0.22, 0.55), 2);
      const futureOpportunityRisk = roundTo(range(random, 0.12, 0.4), 2);
      const stationName = pick(random, STATION_NAMES);
      const shortName = stationName.split("—")[0].trim();

      const economics = computeTanklyEconomics({
        recommendedStationPriceUsdPerGal: hereUsdPerGal,
        expectedAlternativeFuelPriceUsdPerGal: laterUsdPerGal,
        expectedGallonsPurchased: gallons,
        detourMinutes,
        detourMiles,
        driverHourlyCostUsd: vehicle.driverHourlyCost,
        vehicleOperatingCostPerMileUsd: vehicle.vehicleOperatingCostPerMile,
        probabilityNeedFuelSoon,
        futureOpportunityRisk,
      });

      const shouldAddStop = economics.netValue >= 1 || fuelPercent < vehicle.emergencyFuelPercent;
      const accepted = shouldAddStop && random() < 0.78;

      events.push({
        id: `evt-${eventIndex}`,
        vehicleId: vehicle.id,
        occurredAt: occurred.toISOString(),
        stationName,
        accepted,
        shouldAddStop,
        detourMinutes,
        detourMiles,
        headline: driverHeadlineCopy({
          shouldAddStop,
          stationShortName: shortName,
          hereUsdPerGal,
          laterUsdPerGal,
          isLowestPriceOnRoute: hereUsdPerGal <= 3.22,
        }),
        waitingReason: waitingReasonCopy(
          probabilityNeedFuelSoon,
          laterUsdPerGal,
          hereUsdPerGal,
        ),
        customerRecommendation: customerRecommendationLabel(shouldAddStop, shortName),
        economics,
      });
      eventIndex += 1;
    }
  }

  return events.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
}

const random = mulberry32(20260919);
export const DEMO_FLEET_VEHICLES: DemoFleetVehicle[] = buildVehicles(random);
export const DEMO_FLEET_EVENTS: DemoFleetEvent[] = buildEvents(
  DEMO_FLEET_VEHICLES,
  random,
  new Date("2026-09-19T12:00:00"),
);

export function eventsForVehicle(vehicleId: string): DemoFleetEvent[] {
  return DEMO_FLEET_EVENTS.filter((event) => event.vehicleId === vehicleId);
}

export function monthlySavingsForVehicle(vehicleId: string): number {
  return dollars(
    eventsForVehicle(vehicleId)
      .filter((event) => event.accepted && event.shouldAddStop)
      .reduce((sum, event) => sum + event.economics.netValue, 0),
  );
}

export function fleetMonthSummary() {
  const recommended = DEMO_FLEET_EVENTS.filter((event) => event.shouldAddStop);
  const optimized = recommended.filter((event) => event.accepted);
  const netSavings = dollars(
    optimized.reduce((sum, event) => sum + event.economics.netValue, 0),
  );
  const fuelSavings = dollars(
    optimized.reduce((sum, event) => sum + event.economics.fuelPriceAdvantage, 0),
  );
  const average = optimized.length === 0 ? 0 : dollars(netSavings / optimized.length);
  const acceptanceRate =
    recommended.length === 0 ? 0 : optimized.length / recommended.length;

  return {
    netSavings,
    fuelSavings,
    optimizedRefuels: optimized.length,
    averageSavingsPerRefuel: average,
    acceptanceRate,
    recommendedCount: recommended.length,
  };
}
