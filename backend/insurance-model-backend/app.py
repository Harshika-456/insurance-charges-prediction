
from pathlib import Path

import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "insurance_model.joblib"

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
            ]
        }
    },
)


def load_bundle():
    if not MODEL_PATH.exists():
        return None
    return joblib.load(MODEL_PATH)


# Homepage route
@app.get("/")
def home():
    return jsonify({
        "status": "ok",
        "message": "Insurance prediction backend is running",
        "health_endpoint": "/api/health",
        "prediction_endpoint": "/api/predict",
    })


# Health check and model status
@app.get("/api/health")
def health():
    try:
        bundle = load_bundle()
        return jsonify({
            "status": "ok",
            "model_loaded": bundle is not None,
            "message": (
                "Model loaded"
                if bundle is not None
                else "Model file missing. Place insurance_model.joblib beside app.py."
            ),
        })
    except Exception:
        app.logger.exception("Model loading failed")
        return jsonify({
            "status": "error",
            "model_loaded": False,
            "message": "Model file could not be loaded. Check the model file and dependencies.",
        }), 500


# Insurance charge prediction
@app.post("/api/predict")
def predict():
    try:
        bundle = load_bundle()

        if bundle is None:
            return jsonify({
                "error": (
                    "Trained model file is missing. Place "
                    "insurance_model.joblib in the same folder as app.py."
                )
            }), 503

        payload = request.get_json(silent=True) or {}

        age = float(payload["age"])
        sex_text = str(payload["sex"]).strip().lower()
        children = int(payload["children"])
        smoker_text = str(payload["smoker"]).strip().lower()

        if not 0 <= age <= 120:
            raise ValueError("Age must be between 0 and 120.")

        if sex_text not in {"male", "female"}:
            raise ValueError("Sex must be male or female.")

        if children < 0:
            raise ValueError("Number of children cannot be negative.")

        if smoker_text not in {"yes", "no"}:
            raise ValueError("Smoker must be yes or no.")

        sex = 1 if sex_text == "female" else 0
        smoker = 1 if smoker_text == "yes" else 0

        features = np.array(
            [[age, sex, children, smoker]],
            dtype=float,
        )

        model = bundle["model"] if isinstance(bundle, dict) else bundle
        predicted_charges = float(model.predict(features)[0])

        return jsonify({
            "predicted_charges": round(predicted_charges, 2),
            "currency": "USD",
        })

    except KeyError as exc:
        return jsonify({
            "error": f"Missing required field: {exc.args[0]}"
        }), 400

    except (TypeError, ValueError) as exc:
        return jsonify({
            "error": str(exc) or "Invalid input."
        }), 400

    except Exception:
        app.logger.exception("Prediction failed")
        return jsonify({
            "error": (
                "Prediction failed. Check that the exported model "
                "matches the notebook's feature order."
            )
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,
        use_reloader=False,
    )