import { useMemo, useState } from "react";
import { TanklyEconomics } from "./TanklyEconomics";
import {
  DEMO_FLEET_VEHICLES,
  eventsForVehicle,
  fleetMonthSummary,
  monthlySavingsForVehicle,
} from "../data/mockFleetHistory";
import { customerRecommendationLabel, stationShortName, usd } from "../lib/economics";

export function FleetDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(DEMO_FLEET_VEHICLES[0]?.id ?? null);
  const summary = useMemo(() => fleetMonthSummary(), []);
  const selected = DEMO_FLEET_VEHICLES.find((row) => row.id === selectedId) ?? null;
  const selectedEvents = selected ? eventsForVehicle(selected.id) : [];
  const selectedLatest = selectedEvents[0] ?? null;

  return (
    <article className="card card-fleet">
      <p className="kicker kicker-green">Demo · last 30 days</p>
      <h2>Fleet Manager</h2>
      <p className="fleet-note">
        Small savings on each optimized fill, added up across the fleet. This screen uses labeled
        demo history, not the live driver trip.
      </p>

      <div className="fleet-kpis">
        <Kpi label="Net savings this month" value={usd(summary.netSavings)} accent />
        <Kpi label="Fuel savings captured" value={usd(summary.fuelSavings)} />
        <Kpi label="Optimized refuels" value={String(summary.optimizedRefuels)} />
        <Kpi
          label="Average savings per optimized refuel"
          value={usd(summary.averageSavingsPerRefuel)}
        />
        <Kpi
          label="Recommendation acceptance rate"
          value={`${Math.round(summary.acceptanceRate * 100)}%`}
        />
      </div>

      <h3 className="fleet-sub">Vehicles</h3>
      <div className="fleet-table-wrap">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Fuel</th>
              <th>Status</th>
              <th>Tankly Recommendation</th>
              <th>Monthly Savings</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_FLEET_VEHICLES.map((row) => (
              <tr
                key={row.id}
                className={selectedId === row.id ? "selected" : ""}
                onClick={() => setSelectedId(row.id)}
              >
                <td>
                  <strong>{row.name}</strong>
                </td>
                <td>{row.driverName}</td>
                <td>{row.currentFuelPercent.toFixed(0)}%</td>
                <td>
                  <span className={`status-pill status-${slug(row.status)}`}>{row.status}</span>
                </td>
                <td>
                  {customerRecommendationLabel(
                    row.liveShouldAddStop,
                    stationShortName(row.liveStationName),
                  )}
                </td>
                <td>{usd(monthlySavingsForVehicle(row.id))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fleet-detail">
          <p className="kicker kicker-green">
            {selected.name} · {selected.driverName}
          </p>
          <p className="fleet-reason">
            {selected.tankCapacityGallons.toFixed(1)} gal tank · {selected.mpg.toFixed(0)} mpg ·{" "}
            {selected.status}
          </p>
          {selectedLatest && (
            <TanklyEconomics
              evaluation={{
                gallonsNeeded: selectedLatest.economics.expectedGallonsPurchased,
                expectedAlternativeFuelPrice: selectedLatest.economics.expectedAlternativeFuelPrice,
                predictedPricePerGallon: selectedLatest.economics.recommendedStationPrice,
                fuelPriceAdvantage: selectedLatest.economics.fuelPriceAdvantage,
                driverTimeCost: selectedLatest.economics.driverTimeCost,
                vehicleDetourCost: selectedLatest.economics.vehicleDetourCost,
                waitingCostAvoided: selectedLatest.economics.waitingCostAvoided,
                netValue: selectedLatest.economics.netValue,
                waitingReason: selectedLatest.waitingReason,
              }}
            />
          )}
          <h3 className="fleet-sub fleet-sub-dark">Recent Tankly decisions</h3>
          <ul className="fleet-history">
            {selectedEvents.slice(0, 8).map((event) => (
              <li key={event.id}>
                <span>
                  {formatDay(event.occurredAt)} · {stationShortName(event.stationName)} ·{" "}
                  {event.customerRecommendation}
                  {event.accepted ? " · Accepted" : event.shouldAddStop ? " · Declined" : ""}
                </span>
                <strong>{usd(event.economics.netValue)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function slug(status: string): string {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`fleet-kpi ${accent ? "accent" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
