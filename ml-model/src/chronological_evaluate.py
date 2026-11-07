import pandas as pd
import re

from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# 1. Project paths
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

# 2. Load datasets
true_news = pd.read_csv(DATA_DIR / "True.csv")
fake_news = pd.read_csv(DATA_DIR / "Fake.csv")

true_news["label"] = "REAL"
fake_news["label"] = "FAKE"

data = pd.concat([true_news, fake_news], ignore_index=True)

# 3. Prepare article content
data["content"] = (
    data["title"].fillna("") + " " +
    data["text"].fillna("")
)

def clean_text(text):
    text = str(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

data["content"] = data["content"].apply(clean_text)

# 4. Parse dates
data["date"] = pd.to_datetime(
    data["date"],
    format="mixed",
    errors="coerce"
)

# 5. Remove empty content and invalid dates
data = data[
    (data["content"] != "") &
    (data["date"].notna())
].copy()

# 6. Remove exact duplicates across the full dataset
data = data.drop_duplicates(subset=["content"])

# 7. Chronological split
cutoff_date = pd.Timestamp("2017-04-30")
test_end_date = pd.Timestamp("2017-08-31")

train_data = data[data["date"] <= cutoff_date].copy()

test_data = data[
    (data["date"] > cutoff_date) &
    (data["date"] <= test_end_date)
].copy()

X_train = train_data["content"]
y_train = train_data["label"]

X_test = test_data["content"]
y_test = test_data["label"]

print("========== DATA SPLIT ==========")
print("\nTraining articles:")
print(y_train.value_counts())

print("\nTesting articles:")
print(y_test.value_counts())

# 8. Build a fresh ML pipeline
model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            stop_words="english",
            max_features=50000,
            ngram_range=(1, 2),
            min_df=2,
            sublinear_tf=True
        )
    ),
    (
        "classifier",
        LogisticRegression(max_iter=1000)
    )
])

# 9. Train only on earlier articles
print("\nTraining chronological model...")
model.fit(X_train, y_train)

print("Training completed!")

# 10. Test on later articles
predictions = model.predict(X_test)

# 11. Evaluate
print("\n========== CHRONOLOGICAL RESULTS ==========")

print(
    f"\nAccuracy: "
    f"{accuracy_score(y_test, predictions) * 100:.2f}%"
)

print("\nClassification Report:")

print(classification_report(
    y_test,
    predictions,
    labels=["FAKE", "REAL"],
    zero_division=0
))

print("\nConfusion Matrix:")

print(confusion_matrix(
    y_test,
    predictions,
    labels=["FAKE", "REAL"]
))