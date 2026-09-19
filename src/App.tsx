import { useEffect, useMemo, useState } from "react";
import { FleetDashboard } from "./components/FleetDashboard";
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
  IconSliders,
  IconSearch,
  IconSpeaker,
  TanklyMark,
} from "./components/icons";
import { recommendFuelStop, recommendationForStop, shouldShowAddStopCta } from "./lib/decisionEngine";
import { mockGasPriceForecast } from "./lib/gasPriceForecast";
import { googleMapsDirectionsUrl } from "./lib/maps";
import { getDataSource, getNearbyStations, type GeoPoint } from "./lib/stations";
import { DRIVER_DEMO_TRIP, DRIVER_DEMO_VEHICLE } from "./data/mockFleet";
import type { BusinessInputs, Station, TripInputs, VehicleInputs } from "./types";

type Screen = "map" | "forecast" | "nearby" | "alert" | "vehicle";
type DemoRole = "driver" | "fleet";

const defaultVehicle: VehicleInputs = DRIVER_DEMO_VEHICLE;
const defaultTrip: TripInputs = DRIVER_DEMO_TRIP;
const defaultBusiness: BusinessInputs = {
  minimumSavingsThreshold: 1,
};

const defaultOrigin: GeoPoint = {
  latitude: 35.99403,
  longitude: -78.89862,
};

export default function App() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleInputs>(defaultVehicle);
  const [business, setBusiness] = useState<BusinessInputs>(defaultBusiness);
  const [origin, setOrigin] = useState<GeoPoint>(defaultOrigin);
  const [trip, setTrip] = useState<TripInputs>(defaultTrip);
  const [screen, setScreen] = useState<Screen>("map");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [opportunityDismissed, setOpportunityDismissed] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"loading" | "ready">("loading");
  const [hasDeviceLocation, setHasDeviceLocation] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [demoRole, setDemoRole] = useState<DemoRole>("driver");
  const dataSource = getDataSource();

  useEffect(() => {
    if (!navigator.geolocation) {
      setHasDeviceLocation(false);
      setLocationStatus("ready");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setHasDeviceLocation(true);
        setLocationStatus("ready");
      },
      () => {
        setHasDeviceLocation(false);
        setLocationStatus("ready");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

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

  const forecast = useMemo(
    () =>
      mockGasPriceForecast({
        stations,
        expectedFuturePricePerGallon: trip.expectedFuturePricePerGallon,
        trafficMultiplier: trip.trafficMultiplier,
      }),
    [stations, trip.expectedFuturePricePerGallon, trip.trafficMultiplier],
  );

  const decision = useMemo(
    () => recommendFuelStop(stations, vehicle, business, trip, forecast),
    [stations, vehicle, business, trip, forecast],
  );

  useEffect(() => {
    setOpportunityDismissed(false);
    if (decision.bestStation) {
      setSelectedStationId(decision.bestStation.station.id);
    }
  }, [
    decision.bestStation?.station.id,
    vehicle.currentFuelPercent,
    vehicle.mpg,
    vehicle.tankCapacityGallons,
    vehicle.driverHourlyCost,
    vehicle.vehicleOperatingCostPerMile,
    business.minimumSavingsThreshold,
    trip.remainingMiles,
    trip.remainingMinutes,
    trip.trafficMultiplier,
    trip.expectedFuturePricePerGallon,
  ]);

  const selectedEvaluation =
    decision.evaluations.find((item) => item.station.id === selectedStationId) ??
    decision.bestStation;

  const fuelRangeMiles =
    (vehicle.currentFuelPercent / 100) * vehicle.tankCapacityGallons * vehicle.mpg;

  const selectedRecommendation = recommendationForStop(
    selectedEvaluation,
    vehicle,
    business,
  );

  const showDrivingAlert =
    demoRole === "driver" &&
    locationStatus === "ready" &&
    Boolean(selectedEvaluation) &&
    !opportunityDismissed &&
    (screen === "map" || screen === "alert");

  function openStation(stationId: string) {
    setSelectedStationId(stationId);
    setOpportunityDismissed(false);
    setScreen("alert");
  }

  function handleAddStop() {
    if (!selectedEvaluation || !shouldShowAddStopCta(selectedRecommendation)) {
      return;
    }
    window.open(
      googleMapsDirectionsUrl({
        origin: hasDeviceLocation ? origin : null,
        waypoint: {
          latitude: selectedEvaluation.station.latitude,
          longitude: selectedEvaluation.station.longitude,
        },
        destination: {
          latitude: trip.destinationLatitude,
          longitude: trip.destinationLongitude,
        },
      }),
      "_blank",
      "noopener,noreferrer",
    );
  }

  const nav = screen === "alert" || screen === "nearby" ? "map" : screen;

  return (
    <main className="stage">
      <div className="role-switch" role="tablist" aria-label="Demo role">
        <button
          type="button"
          role="tab"
          aria-selected={demoRole === "driver"}
          className={demoRole === "driver" ? "on" : ""}
          onClick={() => {
            setDemoRole("driver");
            setScreen("map");
          }}
        >
          Driver
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={demoRole === "fleet"}
          className={demoRole === "fleet" ? "on" : ""}
          onClick={() => setDemoRole("fleet")}
        >
          Fleet Manager
        </button>
      </div>

      <section className="carplay">
        <aside className="rail">
          <button
            type="button"
            className="logo-btn"
            aria-label="Tankly home"
            onClick={() => {
              setOpportunityDismissed(false);
              setScreen("map");
            }}
          >
            <TanklyMark />
          </button>
          {demoRole === "driver" && (
            <nav className="rail-nav" aria-label="App navigation">
              <button
                type="button"
                aria-label="Map"
                className={nav === "map" ? "active" : ""}
                onClick={() => {
                  setOpportunityDismissed(false);
                  setScreen("map");
                }}
              >
                <IconMap />
              </button>
              {developerMode && (
                <>
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
                    aria-label="Model inputs"
                    className={screen === "vehicle" ? "active" : ""}
                    onClick={() => setScreen("vehicle")}
                  >
                    <IconSliders />
                  </button>
                </>
              )}
            </nav>
          )}
          <button type="button" className="apps-btn" aria-label="All apps">
            <IconApps />
          </button>
          {demoRole === "driver" && (
            <button
              type="button"
              className={`dev-toggle ${developerMode ? "on" : ""}`}
              aria-pressed={developerMode}
              onClick={() => {
                setDeveloperMode((current) => {
                  const next = !current;
                  if (!next && (screen === "vehicle" || screen === "forecast")) {
                    setScreen("map");
                  }
                  return next;
                });
              }}
            >
              Developer
            </button>
          )}
          <div className="clock">
            <strong>9:41</strong>
            LTE
          </div>
        </aside>

        <div className="map-pane">
          {demoRole === "fleet" ? (
            <FleetDashboard />
          ) : (
            <>
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

              {screen === "forecast" && developerMode && (
                <OutlookCard forecast={forecast} onClose={() => setScreen("map")} />
              )}
              {screen === "nearby" && (
                <NearbyFuelCard
                  evaluations={decision.evaluations}
                  onClose={() => setScreen("map")}
                  onSelect={openStation}
                />
              )}
              {showDrivingAlert && selectedEvaluation && (
                <SmartFuelAlert
                  evaluation={selectedEvaluation}
                  recommendation={selectedRecommendation}
                  isLowestPriceOnRoute={decision.evaluations.every(
                    (item) =>
                      item.predictedPricePerGallon >= selectedEvaluation.predictedPricePerGallon,
                  )}
                  onClose={() => {
                    setOpportunityDismissed(true);
                    setScreen("map");
                  }}
                  onAddStop={handleAddStop}
                />
              )}
              {developerMode && screen === "vehicle" && (
                <VehicleCard
                  vehicle={vehicle}
                  business={business}
                  trip={trip}
                  origin={origin}
                  onVehicleChange={setVehicle}
                  onBusinessChange={setBusiness}
                  onTripChange={setTrip}
                  onOriginChange={setOrigin}
                  onClose={() => setScreen("map")}
                />
              )}

              {locationStatus === "loading" && (
                <p className="location-status">Finding your location…</p>
              )}
              {loadError && <p className="map-error">{loadError}</p>}

              <div className="trip-pill">
                <span className="trip-icon">
                  <IconCar />
                </span>
                <div>
                  <div className="trip-label">{trip.destinationName}</div>
                  <strong>Current trip</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
