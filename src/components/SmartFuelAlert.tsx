import { IconArrowUp, IconClose } from "./icons";
import type { FuelPrediction, Recommendation, StationEvaluation } from "../types";

type Props = {
  evaluation: StationEvaluation;
  prediction: FuelPrediction;
  recommendation: Recommendation;
  onClose: () => void;
  onAddStop: () => void;
};

function money(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

export function SmartFuelAlert({
  evaluation,
  prediction,
  recommendation,
  onClose,
  onAddStop,
}: Props) {
  const firstName = evaluation.station.name.split("—")[0].trim();
  const chancePercent = Math.round(prediction.probabilityNeedFuelSoon * 100);
  const milesWindow = Math.max(1, Math.round(prediction.milesUntilLikelyRefuel));

  return (
    <article className="card card-alert">
      <div className="alert-main">
        <div className="card-head">
          <div className="kicker kicker-teal pulse-label">
            <span className="pulse">
              <span className="pulse-ring" />
              <span className="pulse-dot" />
            </span>
            Smart fuel alert
          </div>
          <button type="button" className="icon-ghost" aria-label="Dismiss" onClick={onClose}>
            <IconClose />
          </button>
        </div>
        <h1>Fill up at {firstName}</h1>
        <p className="sub">
          {recommendation === "ADD_STOP"
            ? "Best price on your route. Tankly recommends adding this stop."
            : "A stop is optional. Expected net value is below your minimum threshold."}{" "}
          Tankly predicts a {chancePercent}% chance you'll need fuel within the next {milesWindow}{" "}
          miles.
        </p>
        <button type="button" className="add-stop" onClick={onAddStop}>
          <span>
            <strong>Add stop</strong>
            <span>{evaluation.station.detourMinutes.toFixed(0)} min detour</span>
          </span>
          <IconArrowUp />
        </button>
      </div>
      <div className="alert-side">
        <div className="kicker kicker-muted">You'll save</div>
        <div className="save-hero">{money(evaluation.expectedNetValue)}</div>
        <div className="alert-rows">
          <div>
            <span>Fuel price advantage</span>
            <strong>{money(evaluation.fuelPriceSavings)}</strong>
          </div>
          <div>
            <span>Driver time cost</span>
            <strong>-{money(evaluation.driverTimeCost)}</strong>
          </div>
          <div>
            <span>Vehicle detour cost</span>
            <strong>-{money(evaluation.vehicleDetourCost)}</strong>
          </div>
          <div>
            <span>Expected net value</span>
            <strong className="net">{money(evaluation.expectedNetValue)}</strong>
          </div>
        </div>
        <p className="alert-note">
          Waiting risk adjustment {money(evaluation.waitingRiskAdjustment)}. Based on predicted
          fuel need and current route.
        </p>
      </div>
    </article>
  );
}
