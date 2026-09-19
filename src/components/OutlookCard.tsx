import { IconClose } from "./icons";

const DAYS = [
  { label: "MON", height: 12, value: "$3.79", active: true },
  { label: "TUE", height: 16, value: "+3¢", active: false },
  { label: "WED", height: 20, value: "+6¢", active: false },
  { label: "THU", height: 24, value: "+9¢", active: false },
  { label: "FRI", height: 28, value: "+12¢", active: false },
  { label: "SAT", height: 32, value: "+15¢", active: false },
  { label: "SUN", height: 36, value: "+18¢", active: false },
];

type Props = {
  onClose: () => void;
};

export function OutlookCard({ onClose }: Props) {
  return (
    <article className="card card-outlook">
      <div className="card-head">
        <div>
          <p className="kicker kicker-teal">7-day outlook</p>
          <h2>Fill today, before 6 PM</h2>
          <p className="sub">Local prices may rise 14–19¢ by Thursday.</p>
        </div>
        <button type="button" className="icon-ghost" aria-label="Close" onClick={onClose}>
          <IconClose />
        </button>
      </div>
      <div className="forecast-grid">
        {DAYS.map((day) => (
          <div key={day.label} className={`forecast-day ${day.active ? "active" : ""}`}>
            <div className="forecast-label">{day.label}</div>
            <div className="forecast-bar">
              <span style={{ height: day.height }} />
            </div>
            <div className="forecast-value">{day.value}</div>
          </div>
        ))}
      </div>
    </article>
  );
}
