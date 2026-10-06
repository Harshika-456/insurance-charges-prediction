# Insurance Charge Predictor — React frontend

This UI matches the inputs in the uploaded notebook's trained LinearRegression model:
- `age` (number)
- `sex` (`male` / `female`)
- `children` (integer)
- `smoker` (`yes` / `no`)

The notebook's model predicts `charges`. This frontend does not retrain or replace that model. It sends the four input values to a Python API and displays the prediction returned by that API.

## Run the frontend

1. Install Node.js if needed.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env` if you need to change the API URL.
4. Run `npm run dev` and open the local URL Vite prints.

## API contract expected by this UI

`POST /api/predict` with JSON:

```json
{"age": 30, "sex": "female", "children": 0, "smoker": "no"}
```

Expected JSON response (any one of these numeric keys is supported):

```json
{"predicted_charges": 12345.67}
```

The backend must load the saved `model` object trained in your notebook, encode sex as female=1/male=0 and smoker as yes=1/no=0, then call `model.predict([[age, sex_encoded, children, smoker_encoded]])`. The notebook currently trains the model in memory; it does not save the trained estimator to a file. To make this work, the existing trained model must be exported from the notebook (for example with `joblib.dump(model, 'insurance_model.joblib')`) and loaded by the API. This export saves the already-trained model; it does not retrain it.

The notebook also references `y_pred` in its R² cell without defining it. That is separate from this frontend.
