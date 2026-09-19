import { signedUsd } from "../lib/economics";
import type { StationEvaluation } from "../types";

type Props = {
  evaluation: Pick<
    StationEvaluation,
    | "gallonsNeeded"
    | "expectedAlternativeFuelPrice"
    | "predictedPricePerGallon"
    | "fuelPriceAdvantage"
    | "driverTimeCost"
    | "vehicleDetourCost"
    | "waitingCostAvoided"
    | "netValue"
    | "waitingReason"
  >;
};

export function TanklyEconomics({ evaluation }: Props) {
  const gallons = evaluation.gallonsNeeded;
  const later = evaluation.expectedAlternativeFuelPrice;
  const here = evaluation.predictedPricePerGallon;

  return (
    <>
      <div className="alert-rows">
        <div>
          <span>Fuel price advantage</span>
          <strong>{signedUsd(evaluation.fuelPriceAdvantage)}</strong>
        </div>
        <div>
          <span>Driver time cost</span>
          <strong>{signedUsd(-evaluation.driverTimeCost)}</strong>
        </div>
        <div>
          <span>Vehicle detour cost</span>
          <strong>{signedUsd(-evaluation.vehicleDetourCost)}</strong>
        </div>
        <div>
          <span>Waiting cost avoided</span>
          <strong className="net">{signedUsd(evaluation.waitingCostAvoided)}</strong>
        </div>
        <div>
          <span>Expected net savings</span>
          <strong className="net">{signedUsd(evaluation.netValue)}</strong>
        </div>
      </div>
      <details className="why-block">
        <summary>Why?</summary>
        <p>
          Fuel price advantage = (expected future fuel price − current station price) × expected
          gallons purchased
        </p>
        <p>
          (${later.toFixed(2)} − ${here.toFixed(2)}) × {gallons.toFixed(2)} gal ={" "}
          {signedUsd(evaluation.fuelPriceAdvantage)}
        </p>
        <p>
          {signedUsd(evaluation.fuelPriceAdvantage)} fuel price advantage
          <br />
          {signedUsd(-evaluation.driverTimeCost)} driver time cost
          <br />
          {signedUsd(-evaluation.vehicleDetourCost)} vehicle detour cost
          <br />
          {signedUsd(evaluation.waitingCostAvoided)} waiting cost avoided
          <br />
          = {signedUsd(evaluation.netValue)} expected net savings
        </p>
        <p>{evaluation.waitingReason}</p>
      </details>
    </>
  );
}
