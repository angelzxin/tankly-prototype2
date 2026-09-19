export type WaitingCostContext = {
  gallonsNeeded: number;
  futurePricePerGallon: number;
};

/**
 * Cost of filling later at the forecasted future price, with no detour.
 */
export function estimateCostOfWaiting(context: WaitingCostContext): number {
  return context.futurePricePerGallon * context.gallonsNeeded;
}
