
from pathlib import Path

import joblib
import numpy as np
import streamlit as st

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "insurance_model.joblib"

st.set_page_config(
    page_title="Insurance Charges Prediction",
    page_icon="💰",
    layout="centered",
)


@st.cache_resource
def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}"
        )

    bundle = joblib.load(MODEL_PATH)

    if isinstance(bundle, dict):
        return bundle["model"]

    return bundle


st.title("Insurance Charges Prediction")
st.write(
    "Enter your details to estimate medical insurance charges "
    "using your trained machine learning model."
)

try:
    model = load_model()
except Exception as exc:
    st.error(f"Could not load the trained model: {exc}")
    st.stop()

with st.form("insurance_prediction_form"):
    age = st.number_input(
        "Age",
        min_value=0,
        max_value=120,
        value=25,
        step=1,
    )

    sex = st.selectbox(
        "Sex",
        ["female", "male"],
    )

    children = st.number_input(
        "Number of children",
        min_value=0,
        max_value=20,
        value=0,
        step=1,
    )

    smoker = st.selectbox(
        "Are you a smoker?",
        ["no", "yes"],
    )

    submitted = st.form_submit_button(
        "Predict Insurance Charges",
        type="primary",
        use_container_width=True,
    )

if submitted:
    sex_value = 1 if sex == "female" else 0
    smoker_value = 1 if smoker == "yes" else 0

    features = np.array(
        [[age, sex_value, children, smoker_value]],
        dtype=float,
    )

    try:
        predicted_charges = float(model.predict(features)[0])

        st.success("Prediction completed!")
        st.metric(
            "Estimated Insurance Charges",
            f"${predicted_charges:,.2f} USD",
        )

        st.caption(
            "This is a machine-learning estimate, not an actual "
            "insurance quote. Actual charges may differ."
        )

    except Exception as exc:
        st.error(f"Prediction failed: {exc}")