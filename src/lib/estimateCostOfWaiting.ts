import type { StationEvaluation } from "../types";

export type WaitingCostContext = {
  gallonsNeeded: number;
  evaluations: StationEvaluation[];
};

/**
 * Placeholder for a future model of "what filling later is likely to cost."
 * Isolated so it can be replaced without changing the decision engine.
 *
 * Mock rule: waiting means filling at the highest nearby posted price,
 * with no detour (you are already on route / at a default stop later).
 */
export function estimateCostOfWaiting(context: WaitingCostContext): number {
  if (context.evaluations.length === 0) {
    return 0;
  }

  const highestPostedPrice = Math.max(
    ...context.evaluations.map((evaluation) => evaluation.predictedPricePerGallon),
  );

  return highestPostedPrice * context.gallonsNeeded;
}
