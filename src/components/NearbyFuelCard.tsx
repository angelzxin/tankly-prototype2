import { IconChevron, IconClose, IconPump } from "./icons";
import type { StationEvaluation } from "../types";

type Props = {
  evaluations: StationEvaluation[];
  waitingCost: number;
  onClose: () => void;
  onSelect: (stationId: string) => void;
};

function money(value: number) {
  return `$${Math.abs(value).toFixed(2)}`;
}

export function NearbyFuelCard({ evaluations, waitingCost, onClose, onSelect }: Props) {
  const ranked = [...evaluations].sort(
    (a, b) => a.expectedStopCost - b.expectedStopCost,
  );

  return (
    <article className="card card-nearby">
      <div className="card-head">
        <div>
          <p className="kicker kicker-green">Along your route</p>
          <h2>Nearby fuel</h2>
        </div>
        <button type="button" className="close-light" aria-label="Close" onClick={onClose}>
          <IconClose />
        </button>
      </div>
      <div className="station-list">
        {ranked.map((evaluation, index) => {
          const savings = waitingCost - evaluation.expectedStopCost;
          return (
            <button
              key={evaluation.station.id}
              type="button"
              className="station-row"
              onClick={() => onSelect(evaluation.station.id)}
            >
              <span className={`pump ${index === 0 ? "best" : ""}`}>
                <IconPump />
              </span>
              <span className="station-copy">
                <strong>
                  {evaluation.station.name.split("—")[0].trim()}{" "}
                  <span>
                    · {evaluation.station.detourMinutes.toFixed(0)} min ·{" "}
                    {evaluation.station.detourMiles.toFixed(1)} mi
                  </span>
                </strong>
                <em>Save {money(savings)}</em>
              </span>
              <b>${evaluation.predictedPricePerGallon.toFixed(2)}</b>
              <IconChevron />
            </button>
          );
        })}
      </div>
    </article>
  );
}
