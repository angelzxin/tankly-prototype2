import { useEffect, useMemo, useState } from "react";
import { MapBackground } from "./components/MapBackground";
import { NearbyFuelCard } from "./components/NearbyFuelCard";
import { OutlookCard } from "./components/OutlookCard";
import { SmartFuelAlert } from "./components/SmartFuelAlert";
import { VehicleCard } from "./components/VehicleCard";
import {
  IconApps,
  IconCar,
  IconChart,
  IconMap,
  IconSearch,
  IconSpeaker,
  TanklyMark,
} from "./components/icons";
import { googleMapsDirectionsUrl, recommendFuelStop } from "./lib/decisionEngine";
import { getDataSource, getNearbyStations, type GeoPoint } from "./lib/stations";
import type { BusinessInputs, Station, VehicleInputs } from "./types";

type Screen = "map" | "forecast" | "nearby" | "alert" | "vehicle";

const defaultVehicle: VehicleInputs = {
  currentFuelPercent: 28,
  tankCapacityGallons: 150,
  mpg: 6.5,
  emergencyFuelPercent: 15,
};

const defaultBusiness: BusinessInputs = {
  loadedLaborCostPerHour: 45,
  vehicleCostPerMile: 1.85,
  minimumSavingsThreshold: 15,
};

const defaultOrigin: GeoPoint = {
  latitude: 40.2171,
  longitude: -74.7429,
};

export default function App() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleInputs>(defaultVehicle);
  const [business, setBusiness] = useState<BusinessInputs>(defaultBusiness);
  const [origin, setOrigin] = useState<GeoPoint>(defaultOrigin);
  const [screen, setScreen] = useState<Screen>("forecast");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const dataSource = getDataSource();

  useEffect(() => {
    let cancelled = false;
    const delay = dataSource === "live" ? 400 : 0;
    const timer = window.setTimeout(() => {
      setLoadError(null);
      getNearbyStations(origin)
        .then((nextStations) => {
          if (!cancelled) {
            setStations(nextStations);
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setStations([]);
            setLoadError(error instanceof Error ? error.message : "Failed to load stations");
          }
        });
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [origin.latitude, origin.longitude, dataSource]);

  const decision = useMemo(
    () => recommendFuelStop(stations, vehicle, business),
    [stations, vehicle, business],
  );

  const selectedEvaluation =
    decision.evaluations.find((item) => item.station.id === selectedStationId) ??
    decision.bestStation;

  const fuelRangeMiles = (vehicle.currentFuelPercent / 100) * vehicle.tankCapacityGallons * vehicle.mpg;

  function openStation(stationId: string) {
    setSelectedStationId(stationId);
    setScreen("alert");
  }

  function handleAddStop() {
    if (!selectedEvaluation) {
      return;
    }
    window.open(
      googleMapsDirectionsUrl(
        selectedEvaluation.station.latitude,
        selectedEvaluation.station.longitude,
      ),
      "_blank",
      "noopener,noreferrer",
    );
  }

  const nav = screen === "alert" || screen === "nearby" ? "map" : screen;

  return (
    <main className="stage">
      <section className="carplay">
        <aside className="rail">
          <button
            type="button"
            className="logo-btn"
            aria-label="Tankly home"
            onClick={() => setScreen("forecast")}
          >
            <TanklyMark />
          </button>
          <nav className="rail-nav" aria-label="App navigation">
            <button
              type="button"
              aria-label="Map"
              className={nav === "map" ? "active" : ""}
              onClick={() => setScreen("map")}
            >
              <IconMap />
            </button>
            <button
              type="button"
              aria-label="Weekly forecast"
              className={screen === "forecast" ? "active" : ""}
              onClick={() => setScreen("forecast")}
            >
              <IconChart />
            </button>
            <button
              type="button"
              aria-label="Vehicle"
              className={screen === "vehicle" ? "active" : ""}
              onClick={() => setScreen("vehicle")}
            >
              <IconCar />
            </button>
          </nav>
          <button type="button" className="apps-btn" aria-label="All apps">
            <IconApps />
          </button>
          <div className="clock">
            <strong>9:41</strong>
            LTE
          </div>
        </aside>

        <div className="map-pane">
          <MapBackground />

          <div className="map-top-left">
            <button type="button" className="search-pill" onClick={() => setScreen("nearby")}>
              <IconSearch />
              <span>Find gas nearby</span>
            </button>
            <button type="button" className="round-pill" aria-label="Audio guidance">
              <IconSpeaker />
            </button>
          </div>

          <div className="fuel-range">
            <div>Fuel range</div>
            <div>
              <span className="dot" />
              {fuelRangeMiles.toFixed(0)} mi
            </div>
          </div>

          {screen === "forecast" && <OutlookCard onClose={() => setScreen("map")} />}
          {screen === "nearby" && (
            <NearbyFuelCard
              evaluations={decision.evaluations}
              waitingCost={decision.expectedCostOfWaiting}
              onClose={() => setScreen("map")}
              onSelect={openStation}
            />
          )}
          {screen === "alert" && selectedEvaluation && (
            <SmartFuelAlert
              evaluation={selectedEvaluation}
              waitingCost={decision.expectedCostOfWaiting}
              expectedSavings={
                decision.expectedCostOfWaiting - selectedEvaluation.expectedStopCost
              }
              mpg={vehicle.mpg}
              recommendation={
                vehicle.currentFuelPercent < vehicle.emergencyFuelPercent ||
                decision.expectedCostOfWaiting - selectedEvaluation.expectedStopCost >=
                  business.minimumSavingsThreshold
                  ? "ADD_STOP"
                  : "DO_NOT_ADD_STOP"
              }
              onClose={() => setScreen("nearby")}
              onAddStop={handleAddStop}
            />
          )}
          {screen === "vehicle" && (
            <VehicleCard
              vehicle={vehicle}
              business={business}
              origin={origin}
              onVehicleChange={setVehicle}
              onBusinessChange={setBusiness}
              onOriginChange={setOrigin}
              onClose={() => setScreen("map")}
            />
          )}

          {loadError && <p className="map-error">{loadError}</p>}

          <div className="trip-pill">
            <span className="trip-icon">
              <IconCar />
            </span>
            <div>
              <div className="trip-label">Current trip</div>
              <strong>34 min · 18.2 mi</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
