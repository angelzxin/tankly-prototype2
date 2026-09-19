import { IconArrowUp, IconClose } from "./icons";
import { TanklyEconomics } from "./TanklyEconomics";
import { shouldShowAddStopCta } from "../lib/decisionEngine";
import { driverHeadlineCopy, usd } from "../lib/economics";
import type { Recommendation, StationEvaluation } from "../types";

type Props = {
  evaluation: StationEvaluation;
  recommendation: Recommendation;
  isLowestPriceOnRoute: boolean;
  onClose: () => void;
  onAddStop: () => void;
};

export function SmartFuelAlert({
  evaluation,
  recommendation,
  isLowestPriceOnRoute,
  onClose,
  onAddStop,
}: Props) {
  const firstName = evaluation.station.name.split("—")[0].trim();
  const showAddStop = shouldShowAddStopCta(recommendation);
  const detourMinutes = evaluation.station.detourMinutes;
  const headline = driverHeadlineCopy({
    shouldAddStop: showAddStop,
    stationShortName: firstName,
    hereUsdPerGal: evaluation.predictedPricePerGallon,
    laterUsdPerGal: evaluation.expectedAlternativeFuelPrice,
    isLowestPriceOnRoute,
  });

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
        <h1>{showAddStop ? `Fill up at ${firstName}` : `Skip ${firstName} for now`}</h1>
        <p className="sub">{headline}</p>
        <div className="rec-highlights">
          <div>
            <span>Save</span>
            <strong>{usd(evaluation.netValue)}</strong>
          </div>
          <div>
            <span>Detour</span>
            <strong>{detourMinutes.toFixed(0)} min</strong>
          </div>
        </div>
        {showAddStop ? (
          <button type="button" className="add-stop" onClick={onAddStop}>
            <span>
              <strong>Add stop</strong>
              <span>{detourMinutes.toFixed(0)} min detour</span>
            </span>
            <IconArrowUp />
          </button>
        ) : (
          <p className="keep-driving">Keep driving — this stop is not the better economic choice.</p>
        )}
      </div>
      <div className="alert-side">
        <div className="kicker kicker-muted">You'll save</div>
        <div className="save-hero">{usd(evaluation.netValue)}</div>
        <TanklyEconomics evaluation={evaluation} />
      </div>
    </article>
  );
}
