# Flask ML Service

This service trains and serves a shipment delay model using `XGBoostRegressor`.

## Endpoints

- `GET /health`
- `POST /predict`

## Request shape

```json
{
  "distanceKm": 148,
  "trafficDurationMin": 210,
  "weatherSeverity": 6,
  "timeOfDay": 17,
  "historicalDelayAvg": 15
}
```

## Response shape

```json
{
  "delayProbability": 78.42,
  "riskLevel": "High",
  "modelVersion": "xgboost-regressor-v1",
  "explanation": "High risk with 78.42% delay probability due to rain exposure, heavy traffic, peak-hour travel.",
  "features": {
    "distanceKm": 148.0,
    "trafficDurationMin": 210.0,
    "weatherSeverity": 6.0,
    "timeOfDay": 17,
    "historicalDelayAvg": 15.0
  }
}
```

## Setup

```powershell
cd Backend\ml_service
python -m pip install -r requirements.txt
python generate_synthetic_data.py
python train_model.py
python plot_model_graphs.py
python app.py
```

The API will run on `http://localhost:8000`.
