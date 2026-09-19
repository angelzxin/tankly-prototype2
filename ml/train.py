"""Train a Tankly gas-price XGBoost model for price_in_24h_target.

Expected historical CSV schema (ml/data/historical_prices.csv)
--------------------------------------------------------------
observed_at                   ISO-8601 timestamp of the observation
station_id                    Stable station identifier
station_name                  Display name
latitude                      Station latitude
longitude                     Station longitude
price_per_gallon              Posted price at observation time (feature)
traffic_multiplier            Route traffic factor (>= 1.0 typical)
remaining_miles               Miles left on the active trip
remaining_minutes             Minutes left on the active trip
current_fuel_percent          Vehicle fuel level 0-100
tank_capacity_gallons         Tank size
mpg                           Vehicle miles per gallon
price_in_24h_target           Label: same station's price ~24 hours later
price_in_3d_target            Optional label for a 3-day model
price_in_7d_target            Optional label for a 7-day model

This script trains XGBRegressor on price_in_24h_target and writes
ml/models/price_in_24h.json. It exits cleanly when the CSV is missing
or has too few labeled rows — the React prototype uses a deterministic
forecast until enough history exists to serve this model over HTTP.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
from xgboost import XGBRegressor

ROOT = Path(__file__).resolve().parent
CSV_PATH = ROOT / "data" / "historical_prices.csv"
MODEL_PATH = ROOT / "models" / "price_in_24h.json"

FEATURE_COLUMNS = [
    "latitude",
    "longitude",
    "price_per_gallon",
    "traffic_multiplier",
    "remaining_miles",
    "remaining_minutes",
    "current_fuel_percent",
    "tank_capacity_gallons",
    "mpg",
]
TARGET_COLUMN = "price_in_24h_target"
MIN_TRAINING_ROWS = 50


def main() -> int:
    if not CSV_PATH.exists():
        print(f"No training CSV at {CSV_PATH}. Skipping.")
        return 0

    frame = pd.read_csv(CSV_PATH)
    labeled = frame.dropna(subset=[TARGET_COLUMN, *FEATURE_COLUMNS])
    row_count = len(labeled)

    if row_count < MIN_TRAINING_ROWS:
        print(
            f"Insufficient training rows for {TARGET_COLUMN}: "
            f"{row_count} < {MIN_TRAINING_ROWS}. Skipping XGBoost fit."
        )
        return 0

    model = XGBRegressor(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="reg:squarederror",
    )
    model.fit(labeled[FEATURE_COLUMNS], labeled[TARGET_COLUMN])

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save_model(MODEL_PATH)
    print(f"Wrote {MODEL_PATH} from {row_count} rows.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
