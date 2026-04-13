import json
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import xgboost as xgb


BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
DATA_PATH = BASE_DIR / "data" / "synthetic_shipments.csv"
MODEL_PATH = MODELS_DIR / "delay_model.json"
METADATA_PATH = MODELS_DIR / "metadata.json"
FEATURE_IMPORTANCE_PATH = MODELS_DIR / "feature_importance.png"
PREDICTED_VS_ACTUAL_PATH = MODELS_DIR / "predicted_vs_actual.png"


def load_model_and_metadata():
    model = xgb.XGBRegressor()
    model.load_model(MODEL_PATH)

    with METADATA_PATH.open("r", encoding="utf-8") as metadata_file:
        metadata = json.load(metadata_file)

    return model, metadata


def plot_feature_importance(model, feature_columns):
    booster = model.get_booster()
    score_map = booster.get_score(importance_type="gain")

    labels = list(feature_columns)
    values = [float(score_map.get(label, 0)) for label in labels]
    pairs = sorted(zip(values, labels), reverse=True)

    sorted_values = [value for value, _ in pairs]
    sorted_labels = [label for _, label in pairs]

    plt.figure(figsize=(10, 6))
    bars = plt.barh(
        sorted_labels,
        sorted_values,
        color=["#0f766e", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"],
    )
    plt.gca().invert_yaxis()
    plt.title("XGBoost Feature Importance (Gain)")
    plt.xlabel("Importance Score")
    plt.ylabel("Features")

    for bar, value in zip(bars, sorted_values):
        plt.text(
            value,
            bar.get_y() + (bar.get_height() / 2),
            f" {value:.2f}",
            va="center",
            fontsize=9,
        )

    plt.tight_layout()
    plt.savefig(FEATURE_IMPORTANCE_PATH, dpi=180)
    plt.close()


def plot_predicted_vs_actual(model, feature_columns):
    if not DATA_PATH.exists():
        return

    dataset = pd.read_csv(DATA_PATH)
    predictions = model.predict(dataset[feature_columns]).clip(0, 100)

    plt.figure(figsize=(7, 7))
    plt.scatter(
        dataset["delayProbability"],
        predictions,
        alpha=0.25,
        color="#2563eb",
        edgecolors="none",
    )
    plt.plot([0, 100], [0, 100], color="#dc2626", linewidth=2, linestyle="--")
    plt.title("Predicted vs Actual Delay Probability")
    plt.xlabel("Actual Delay Probability")
    plt.ylabel("Predicted Delay Probability")
    plt.xlim(0, 100)
    plt.ylim(0, 100)
    plt.tight_layout()
    plt.savefig(PREDICTED_VS_ACTUAL_PATH, dpi=180)
    plt.close()


def main():
    model, metadata = load_model_and_metadata()
    feature_columns = metadata["feature_columns"]

    plot_feature_importance(model, feature_columns)
    plot_predicted_vs_actual(model, feature_columns)

    print(FEATURE_IMPORTANCE_PATH)
    print(PREDICTED_VS_ACTUAL_PATH)


if __name__ == "__main__":
    main()
