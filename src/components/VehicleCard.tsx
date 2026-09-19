import { IconClose } from "./icons";
import type { BusinessInputs, TripInputs, VehicleInputs } from "../types";
import type { GeoPoint } from "../lib/geo";

type Props = {
  vehicle: VehicleInputs;
  business: BusinessInputs;
  trip: TripInputs;
  origin: GeoPoint;
  onVehicleChange: (next: VehicleInputs) => void;
  onBusinessChange: (next: BusinessInputs) => void;
  onTripChange: (next: TripInputs) => void;
  onOriginChange: (next: GeoPoint) => void;
  onClose: () => void;
};

export function VehicleCard({
  vehicle,
  business,
  trip,
  origin,
  onVehicleChange,
  onBusinessChange,
  onTripChange,
  onOriginChange,
  onClose,
}: Props) {
  return (
    <article className="card card-vehicle">
      <div className="card-head">
        <div>
          <p className="kicker kicker-green">Your vehicle</p>
          <h2>Fleet inputs</h2>
        </div>
        <button type="button" className="close-light" aria-label="Close" onClick={onClose}>
          <IconClose />
        </button>
      </div>

      <div className="vehicle-grid">
        <Field
          label="Fuel level"
          suffix="%"
          value={vehicle.currentFuelPercent}
          onChange={(currentFuelPercent) => onVehicleChange({ ...vehicle, currentFuelPercent })}
        />
        <Field
          label="Tank"
          suffix="gal"
          value={vehicle.tankCapacityGallons}
          onChange={(tankCapacityGallons) => onVehicleChange({ ...vehicle, tankCapacityGallons })}
        />
        <Field
          label="MPG"
          suffix="mpg"
          value={vehicle.mpg}
          onChange={(mpg) => onVehicleChange({ ...vehicle, mpg })}
        />
        <Field
          label="Emergency"
          suffix="%"
          value={vehicle.emergencyFuelPercent}
          onChange={(emergencyFuelPercent) =>
            onVehicleChange({ ...vehicle, emergencyFuelPercent })
          }
        />
        <Field
          label="Labor"
          suffix="$/hr"
          value={business.loadedLaborCostPerHour}
          onChange={(loadedLaborCostPerHour) =>
            onBusinessChange({ ...business, loadedLaborCostPerHour })
          }
        />
        <Field
          label="Vehicle"
          suffix="$/mi"
          value={business.vehicleCostPerMile}
          onChange={(vehicleCostPerMile) =>
            onBusinessChange({ ...business, vehicleCostPerMile })
          }
        />
        <Field
          label="Min save"
          suffix="$"
          value={business.minimumSavingsThreshold}
          onChange={(minimumSavingsThreshold) =>
            onBusinessChange({ ...business, minimumSavingsThreshold })
          }
        />
        <Field
          label="Latitude"
          suffix="lat"
          value={origin.latitude}
          onChange={(latitude) => onOriginChange({ ...origin, latitude })}
        />
        <Field
          label="Longitude"
          suffix="lng"
          value={origin.longitude}
          onChange={(longitude) => onOriginChange({ ...origin, longitude })}
        />
      </div>

      <p className="kicker kicker-green demo-kicker">Demo controls</p>
      <h2 className="demo-title">Trip &amp; forecast</h2>
      <div className="vehicle-grid">
        <Field
          label="Miles left"
          suffix="mi"
          value={trip.remainingMiles}
          onChange={(remainingMiles) => onTripChange({ ...trip, remainingMiles })}
        />
        <Field
          label="Time left"
          suffix="min"
          value={trip.remainingMinutes}
          onChange={(remainingMinutes) => onTripChange({ ...trip, remainingMinutes })}
        />
        <Field
          label="Traffic"
          suffix="x"
          value={trip.trafficMultiplier}
          onChange={(trafficMultiplier) => onTripChange({ ...trip, trafficMultiplier })}
        />
        <Field
          label="Future price"
          suffix="$/gal"
          value={trip.expectedFuturePricePerGallon}
          onChange={(expectedFuturePricePerGallon) =>
            onTripChange({ ...trip, expectedFuturePricePerGallon })
          }
        />
        <Field
          label="Dest lat"
          suffix="lat"
          value={trip.destinationLatitude}
          onChange={(destinationLatitude) => onTripChange({ ...trip, destinationLatitude })}
        />
        <Field
          label="Dest lng"
          suffix="lng"
          value={trip.destinationLongitude}
          onChange={(destinationLongitude) => onTripChange({ ...trip, destinationLongitude })}
        />
      </div>
    </article>
  );
}

function Field({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mini-field">
      <span>{label}</span>
      <div>
        <input
          type="number"
          step="any"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <em>{suffix}</em>
      </div>
    </label>
  );
}
