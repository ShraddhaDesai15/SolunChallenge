from pathlib import Path
import os

from flask import Flask, jsonify, request

from model_utils import (
    FEATURE_COLUMNS,
    build_explanation,
    build_feature_row,
    get_risk_level,
    load_artifacts,
    predict_delay_probability,
    
)


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "delay_model.json"
METADATA_PATH = BASE_DIR / "models" / "metadata.json"

app = Flask(__name__)

model = None
metadata = None


def refresh_model():
    global model, metadata
    model, metadata = load_artifacts(MODEL_PATH, METADATA_PATH)


def ensure_model_loaded(force_refresh=False):
    global model, metadata

    if force_refresh or model is None:
        refresh_model()

    return model, metadata or {}


refresh_model()


@app.get("/health")
def health():
    _, current_metadata = ensure_model_loaded()
    return jsonify(
        {
            "status": "ok",
            "service": "shipment-ml",
            "modelLoaded": model is not None,
            "modelVersion": current_metadata.get("model_version"),
            "artifactError": current_metadata.get("artifact_error"),
        }
    )


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    missing = [field for field in FEATURE_COLUMNS if field not in payload]
    if missing:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing)}"}),
            400,
        )

    try:
        current_model, current_metadata = ensure_model_loaded()
        features = build_feature_row(payload)
        delay_probability = predict_delay_probability(current_model, features)
        risk_level = get_risk_level(delay_probability)

        response = {
            "delayProbability": delay_probability,
            "riskLevel": risk_level,
            "modelVersion": current_metadata.get("model_version"),
            "explanation": build_explanation(features, delay_probability, risk_level),
            "features": features,
        }
        return jsonify(response)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {exc}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
