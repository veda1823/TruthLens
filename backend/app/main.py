
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import joblib
import re

# Create FastAPI application
app = FastAPI(
    title="TruthLens API",
    description="AI-Powered Fake News Detection System",
    version="1.0.0"
)

# Allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Locate the trained model
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "ml-model" / "models" / "truthlens_model.pkl"

# Load trained ML model
model = joblib.load(MODEL_PATH)


# Request format
class NewsRequest(BaseModel):
    text: str


# Clean input text
def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to TruthLens API",
        "status": "Backend is running successfully"
    }


# Health endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}


# News prediction endpoint
@app.post("/predict")
def predict_news(request: NewsRequest):

    news = clean_text(request.text)

    if not news:
        raise HTTPException(
            status_code=400,
            detail="Please enter news text."
        )

    # Predict news category
    prediction = model.predict([news])[0]

    # Calculate estimated probabilities
    probabilities = model.predict_proba([news])[0]

    probability_dict = dict(
        zip(model.classes_, probabilities)
    )

    return {
        "prediction": prediction,
        "confidence": round(
            float(probability_dict[prediction] * 100), 2
        ),
        "probabilities": {
            "REAL": round(float(probability_dict["REAL"] * 100), 2),
            "FAKE": round(float(probability_dict["FAKE"] * 100), 2)
        },
        "message": "Prediction is based on learned text patterns, not independent fact verification."
    }
