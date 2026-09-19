import { IconClose } from "./icons";
import type { BusinessInputs, VehicleInputs } from "../types";
import type { GeoPoint } from "../lib/geo";

type Props = {
  vehicle: VehicleInputs;
  business: BusinessInputs;
  origin: GeoPoint;
  onVehicleChange: (next: VehicleInputs) => void;
  onBusinessChange: (next: BusinessInputs) => void;
  onOriginChange: (next: GeoPoint) => void;
  onClose: () => void;
};

export function VehicleCard({
  vehicle,
  business,
  origin,
  onVehicleChange,
  onBusinessChange,
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
