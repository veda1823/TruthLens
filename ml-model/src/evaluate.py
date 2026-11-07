import pandas as pd
import re
import joblib

from pathlib import Path
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# Project paths
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
MODEL_PATH = BASE_DIR / "models" / "truthlens_model.pkl"

# Load trained model
print("Loading TruthLens model...")
model = joblib.load(MODEL_PATH)

# Load datasets
true_news = pd.read_csv(DATA_DIR / "True.csv")
fake_news = pd.read_csv(DATA_DIR / "Fake.csv")

true_news["label"] = "REAL"
fake_news["label"] = "FAKE"

data = pd.concat([true_news, fake_news], ignore_index=True)

# Prepare article content
data["content"] = (
    data["title"].fillna("") + " " +
    data["text"].fillna("")
)

def clean_text(text):
    text = str(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

data["content"] = data["content"].apply(clean_text)

# Remove empty articles
data = data[data["content"] != ""]

# Remove duplicate articles within each label
data = data.drop_duplicates(subset=["content", "label"])

# Remove articles appearing under conflicting labels
label_counts = data.groupby("content")["label"].nunique()
conflicting = label_counts[label_counts > 1].index
data = data[~data["content"].isin(conflicting)]

# Evaluate model on all cleaned articles
X = data["content"]
y = data["label"]

print("\nEvaluating TruthLens...")
predictions = model.predict(X)

print("\n========== EVALUATION RESULTS ==========")
print(f"Total articles: {len(data)}")

print(f"\nAccuracy: {accuracy_score(y, predictions) * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(
    y,
    predictions,
    labels=["FAKE", "REAL"],
    zero_division=0
))

print("\nConfusion Matrix:")
print(confusion_matrix(
    y,
    predictions,
    labels=["FAKE", "REAL"]
))