
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import joblib
import re
import trafilatura
from urllib.parse import urlparse

# Create FastAPI application
app = FastAPI(
    title="TruthLens API",
    description="AI-Powered Fake News Detection System",
    version="1.1.0"
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

# Access pipeline components
vectorizer = model.named_steps["tfidf"]
classifier = model.named_steps["classifier"]


# Request format
class NewsRequest(BaseModel):
    text: str
class URLRequest(BaseModel):
    url: str


# Clean input text
def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    return text.strip()
# Extract main article text from a news URL
def extract_article(url):

    parsed_url = urlparse(url)

    if parsed_url.scheme not in ["http", "https"] or not parsed_url.netloc:
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid HTTP or HTTPS URL."
        )

    downloaded = trafilatura.fetch_url(url)

    if not downloaded:
        raise HTTPException(
            status_code=400,
            detail="Unable to access this webpage."
        )

    article_text = trafilatura.extract(downloaded)

    if not article_text or len(article_text.strip()) < 100:
        raise HTTPException(
            status_code=400,
            detail="Could not extract sufficient article text from this URL."
        )

    return clean_text(article_text)


# Generate word-level explanations
def explain_prediction(news, prediction, top_n=6):

    # Convert article into TF-IDF features
    transformed_text = vectorizer.transform([news])

    # Get feature names
    feature_names = vectorizer.get_feature_names_out()

    # Get Logistic Regression coefficients
    coefficients = classifier.coef_[0]

    # Get features present in the article
    indices = transformed_text.indices
    values = transformed_text.data

    # For binary classification:
    # coef_[0] represents the direction towards classes_[1]
    if prediction == classifier.classes_[1]:
        direction = 1
    else:
        direction = -1

    contributions = []

    for index, value in zip(indices, values):

        contribution = (
            float(value) *
            float(coefficients[index]) *
            direction
        )

        contributions.append({
            "word": str(feature_names[index]),
            "contribution": contribution
        })

    # Sort contributions
    supporting = sorted(
        [item for item in contributions if item["contribution"] > 0],
        key=lambda item: item["contribution"],
        reverse=True
    )[:top_n]

    opposing = sorted(
        [item for item in contributions if item["contribution"] < 0],
        key=lambda item: item["contribution"]
    )[:top_n]

    return {
        "supporting_terms": [
            {
                "word": item["word"],
                "contribution": round(item["contribution"], 5)
            }
            for item in supporting
        ],
        "opposing_terms": [
            {
                "word": item["word"],
                "contribution": round(item["contribution"], 5)
            }
            for item in opposing
        ],
        "note": (
            "These terms show learned model patterns that influenced "
            "the prediction. They do not prove whether the article is true or false."
        )
    }


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

    # Generate explanation
    explanation = explain_prediction(news, prediction)

    return {
        "prediction": prediction,
        "confidence": round(
            float(probability_dict[prediction] * 100), 2
        ),
        "probabilities": {
            "REAL": round(float(probability_dict["REAL"] * 100), 2),
            "FAKE": round(float(probability_dict["FAKE"] * 100), 2)
        },
        "explanation": explanation,
        "message": (
            "Prediction is based on learned text patterns, "
            "not independent fact verification."
        )
    }
# URL-based news prediction endpoint
@app.post("/predict-url")
def predict_news_url(request: URLRequest):

    # Extract article text from URL
    news = extract_article(request.url)

    # Predict news category
    prediction = model.predict([news])[0]

    # Calculate probabilities
    probabilities = model.predict_proba([news])[0]

    probability_dict = dict(
        zip(model.classes_, probabilities)
    )

    # Generate explanation
    explanation = explain_prediction(news, prediction)

    return {
        "source_url": request.url,
        "prediction": prediction,
        "confidence": round(
            float(probability_dict[prediction] * 100), 2
        ),
        "probabilities": {
            "REAL": round(float(probability_dict["REAL"] * 100), 2),
            "FAKE": round(float(probability_dict["FAKE"] * 100), 2)
        },
        "explanation": explanation,
        "message": (
            "Prediction is based on learned text patterns, "
            "not independent fact verification."
        )
    }