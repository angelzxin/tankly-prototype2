import type { Station } from "../types";

export type DailyPriceForecast = {
  dayOffset: number;
  label: string;
  price: number;
  changeCents: number;
};

export type GasPriceForecast = {
  currentPrice: number;
  predictedPrice24h: number;
  predictedPrice3d: number;
  predictedPrice7d: number;
  dailyForecast: DailyPriceForecast[];
  confidence: number;
};

export type GasPriceForecastInput = {
  stations: Station[];
  expectedFuturePricePerGallon?: number;
  trafficMultiplier?: number;
};

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const BACKEND_URL = import.meta.env.VITE_GAS_PRICE_FORECAST_URL ?? "";

function roundPrice(value: number): number {
  return Number(value.toFixed(3));
}

function averageStationPrice(stations: Station[]): number {
  if (stations.length === 0) {
    return 0;
  }
  const total = stations.reduce((sum, station) => sum + station.currentPricePerGallon, 0);
  return total / stations.length;
}

function dayLabel(from: Date, offset: number): string {
  const date = new Date(from);
  date.setDate(date.getDate() + offset);
  return DAY_LABELS[date.getDay()];
}

/**
 * Deterministic prototype forecast.
 * Replace `loadGasPriceForecast()`'s mock fallback with a trained XGBoost
 * HTTP backend later — OutlookCard and decisionEngine only consume this type.
 */
export function mockGasPriceForecast(input: GasPriceForecastInput): GasPriceForecast {
  const currentPrice =
    averageStationPrice(input.stations) || input.expectedFuturePricePerGallon || 0;
  const traffic = Math.max(input.trafficMultiplier ?? 1, 0.2);
  const sevenDayTarget =
    input.expectedFuturePricePerGallon && input.expectedFuturePricePerGallon > 0
      ? input.expectedFuturePricePerGallon
      : currentPrice * (1 + 0.012 * traffic);

  const predictedPrice24h = roundPrice(
    currentPrice + ((sevenDayTarget - currentPrice) * 1) / 7,
  );
  const predictedPrice3d = roundPrice(
    currentPrice + ((sevenDayTarget - currentPrice) * 3) / 7,
  );
  const predictedPrice7d = roundPrice(sevenDayTarget);

  const now = new Date();
  const dailyForecast: DailyPriceForecast[] = Array.from({ length: 7 }, (_, dayOffset) => {
    const price = roundPrice(
      currentPrice + ((sevenDayTarget - currentPrice) * dayOffset) / 7,
    );
    return {
      dayOffset,
      label: dayLabel(now, dayOffset),
      price,
      changeCents: Number(((price - currentPrice) * 100).toFixed(0)),
    };
  });

  const confidence = Math.min(0.72, 0.28 + input.stations.length * 0.07);

  return {
    currentPrice: roundPrice(currentPrice),
    predictedPrice24h,
    predictedPrice3d,
    predictedPrice7d,
    dailyForecast,
    confidence,
  };
}

export function normalizeGasPriceForecast(
  payload: unknown,
  fallbackInput: GasPriceForecastInput,
): GasPriceForecast {
  const mock = mockGasPriceForecast(fallbackInput);
  if (!payload || typeof payload !== "object") {
    return mock;
  }

  const row = payload as Record<string, unknown>;
  const daily = Array.isArray(row.dailyForecast) ? row.dailyForecast : mock.dailyForecast;

  return {
    currentPrice: Number(row.currentPrice) || mock.currentPrice,
    predictedPrice24h: Number(row.predictedPrice24h) || mock.predictedPrice24h,
    predictedPrice3d: Number(row.predictedPrice3d) || mock.predictedPrice3d,
    predictedPrice7d: Number(row.predictedPrice7d) || mock.predictedPrice7d,
    dailyForecast: daily.length === 7 ? (daily as DailyPriceForecast[]) : mock.dailyForecast,
    confidence: Number(row.confidence) || mock.confidence,
  };
}

/**
 * Single entry point for UI and the optimizer.
 * When VITE_GAS_PRICE_FORECAST_URL is set, this POSTs to the Python XGBoost
 * service. Otherwise it uses the deterministic mock.
 */
export async function loadGasPriceForecast(
  input: GasPriceForecastInput,
): Promise<GasPriceForecast> {
  if (!BACKEND_URL) {
    return mockGasPriceForecast(input);
  }

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return mockGasPriceForecast(input);
    }
    return normalizeGasPriceForecast(await response.json(), input);
  } catch {
    return mockGasPriceForecast(input);
  }
}

/**
 * Price of waiting, taken from the same 7-day outlook curve.
 * Use the highest forecast in the window so a rising week (the outlook story)
 * is what ADD_STOP is scored against — not a 24h slice that is almost today's price.
 */
export function futurePriceForHorizon(forecast: GasPriceForecast, remainingMinutes: number): number {
  const byTripLength =
    remainingMinutes <= 24 * 60
      ? forecast.predictedPrice24h
      : remainingMinutes <= 3 * 24 * 60
        ? forecast.predictedPrice3d
        : forecast.predictedPrice7d;

  return Math.max(
    byTripLength,
    forecast.predictedPrice24h,
    forecast.predictedPrice3d,
    forecast.predictedPrice7d,
  );
}
