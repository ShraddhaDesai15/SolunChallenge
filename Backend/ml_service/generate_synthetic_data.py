from pathlib import Path

import numpy as np
import pandas as pd

from model_utils import get_risk_level


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_PATH = DATA_DIR / "synthetic_shipments.csv"


def generate_dataset(num_samples=5000, random_seed=42):
    rng = np.random.default_rng(random_seed)

    distance_km = rng.uniform(10, 500, num_samples)
    base_duration_min = np.maximum(15, distance_km * 1.45 + rng.normal(0, 18, num_samples))
    weather_severity = rng.uniform(0, 10, num_samples)
    time_of_day = rng.integers(0, 24, num_samples)
    historical_delay_avg = np.maximum(0, rng.normal(12, 8, num_samples))

    peak_hour = np.isin(time_of_day, [8, 9, 10, 17, 18, 19, 20]).astype(float)
    weather_delay = np.where(weather_severity > 7, rng.uniform(22, 38, num_samples), 0)
    storm_delay = np.where(weather_severity > 5, rng.uniform(12, 24, num_samples), 0)
    traffic_noise = rng.uniform(0, 15, num_samples)

    traffic_duration_min = (
        base_duration_min
        + traffic_noise
        + weather_delay
        + storm_delay
        + peak_hour * rng.uniform(8, 18, num_samples)
    )

    traffic_ratio = traffic_duration_min / base_duration_min
    delay_probability = (
        (weather_severity * 5.8)
        + np.maximum(0, (traffic_ratio - 1) * 60)
        + peak_hour * 8
        + np.minimum(distance_km / 18, 24)
        + np.minimum(historical_delay_avg, 25) * 0.7
        + rng.normal(0, 4, num_samples)
    )
    delay_probability = np.clip(delay_probability, 0, 100)

    risk_level = [get_risk_level(value) for value in delay_probability]

    df = pd.DataFrame(
        {
            "distanceKm": distance_km.round(2),
            "baseDurationMin": base_duration_min.round(2),
            "trafficDurationMin": traffic_duration_min.round(2),
            "weatherSeverity": weather_severity.round(2),
            "timeOfDay": time_of_day.astype(int),
            "historicalDelayAvg": historical_delay_avg.round(2),
            "delayProbability": delay_probability.round(2),
            "riskLevel": risk_level,
        }
    )
    return df


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    dataset = generate_dataset()
    dataset.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved {len(dataset)} rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
