import type { GasPriceForecast } from "../lib/gasPriceForecast";
import { IconClose } from "./icons";

type Props = {
  forecast: GasPriceForecast;
  onClose: () => void;
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function signedCents(changeCents: number) {
  if (changeCents === 0) {
    return "0¢";
  }
  const sign = changeCents > 0 ? "+" : "";
  return `${sign}${changeCents}¢`;
}

function outlookCopy(forecast: GasPriceForecast) {
  const thursday = forecast.dailyForecast.find((day) => day.label === "THU");
  const horizon = thursday ?? forecast.dailyForecast[3] ?? forecast.dailyForecast.at(-1);
  const riseCents = horizon?.changeCents ?? 0;
  const rising = forecast.predictedPrice24h > forecast.currentPrice;
  const headline = rising ? "Fill today, before 6 PM" : "Waiting may be cheaper";
  const sub =
    riseCents === 0
      ? `Local prices look stable (confidence ${Math.round(forecast.confidence * 100)}%).`
      : `Local prices may ${riseCents > 0 ? "rise" : "fall"} ${Math.abs(riseCents)}¢ by ${horizon?.label ?? "week's end"}.`;

  return { headline, sub };
}

export function OutlookCard({ forecast, onClose }: Props) {
  const { headline, sub } = outlookCopy(forecast);
  const maxAbsChange = Math.max(
    1,
    ...forecast.dailyForecast.map((day) => Math.abs(day.changeCents)),
  );

  return (
    <article className="card card-outlook">
      <div className="card-head">
        <div>
          <p className="kicker kicker-teal">7-day outlook</p>
          <h2>{headline}</h2>
          <p className="sub">{sub}</p>
        </div>
        <button type="button" className="icon-ghost" aria-label="Close" onClick={onClose}>
          <IconClose />
        </button>
      </div>
      <div className="forecast-grid">
        {forecast.dailyForecast.map((day, index) => {
          const height = 12 + (Math.abs(day.changeCents) / maxAbsChange) * 24;
          return (
            <div key={`${day.label}-${day.dayOffset}`} className={`forecast-day ${index === 0 ? "active" : ""}`}>
              <div className="forecast-label">{day.label}</div>
              <div className="forecast-bar">
                <span style={{ height }} />
              </div>
              <div className="forecast-value">
                {index === 0 ? money(day.price) : signedCents(day.changeCents)}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
