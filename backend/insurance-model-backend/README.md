# Insurance Prediction API

This Flask API serves the **existing trained LinearRegression model** from the uploaded Colab notebook. It does not train or replace the model. The model file is intentionally not included because the notebook did not save its in-memory model to disk.

## 1. Export the already-trained model from Colab

In the same Colab runtime where the notebook's `model.fit(X_train, y_train)` cell has already run, execute this new cell. It saves the existing `model` object; it does not call `.fit()` or retrain it.

```python
import joblib
from google.colab import files

joblib.dump({"model": model, "feature_order": ["age", "sex", "children", "smoker"]}, "insurance_model.joblib")
files.download("insurance_model.joblib")
```

Download the file and place it in this backend folder next to `app.py`.

## 2. Install and run the API

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`.

## 3. Endpoints

- `GET /api/health` — checks whether the model file is present.
- `POST /api/predict` — accepts JSON like:

```json
{"age": 35, "sex": "female", "children": 1, "smoker": "no"}
```

The response includes `predicted_charges` in the dataset's currency (typically USD).

## Notes

- Inputs match the notebook: `age`, `sex`, `children`, and `smoker`.
- Encoding matches the notebook: female=1, male=0; yes smoker=1, no smoker=0.
- The saved model must come from the same notebook/model training session. Only load model files you created and trust.
