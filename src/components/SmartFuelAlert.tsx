import { IconArrowUp, IconClose } from "./icons";
import type { StationEvaluation } from "../types";

type Props = {
  evaluation: StationEvaluation;
  waitingCost: number;
  expectedSavings: number;
  mpg: number;
  recommendation: "ADD_STOP" | "DO_NOT_ADD_STOP";
  onClose: () => void;
  onAddStop: () => void;
};

function money(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

export function SmartFuelAlert({
  evaluation,
  waitingCost,
  expectedSavings,
  mpg,
  recommendation,
  onClose,
  onAddStop,
}: Props) {
  const extraFuelCost =
    mpg > 0
      ? (evaluation.station.detourMiles / mpg) * evaluation.predictedPricePerGallon
      : evaluation.vehicleDetourCost;
  const grossSave = waitingCost - evaluation.fuelCost;
  const netSave = waitingCost - evaluation.expectedStopCost;
  const firstName = evaluation.station.name.split("—")[0].trim();

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
            ? "Best price on your route. Prices are likely to rise tomorrow."
            : "A stop is optional. Savings are below your minimum threshold."}
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
        <div className="save-hero">{money(expectedSavings > 0 ? expectedSavings : grossSave)}</div>
        <div className="alert-rows">
          <div>
            <span>Price</span>
            <strong>${evaluation.predictedPricePerGallon.toFixed(2)} / gal</strong>
          </div>
          <div>
            <span>Extra fuel</span>
            <strong>-{money(extraFuelCost)}</strong>
          </div>
          <div>
            <span>Net savings</span>
            <strong className="net">{money(netSave)}</strong>
          </div>
        </div>
        <p className="alert-note">Based on your vehicle costs and current route.</p>
      </div>
    </article>
  );
}
