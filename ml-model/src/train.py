
import pandas as pd
import re
import joblib

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# 1. Define project paths
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

# 2. Load datasets
true_news = pd.read_csv(DATA_DIR / "True.csv")
fake_news = pd.read_csv(DATA_DIR / "Fake.csv")

true_news["label"] = "REAL"
fake_news["label"] = "FAKE"

# 3. Combine datasets
data = pd.concat(
    [true_news, fake_news],
    ignore_index=True
)

# 4. Combine title and article text
data["content"] = (
    data["title"].fillna("") + " " +
    data["text"].fillna("")
)

# 5. Clean text
def clean_text(text):
    text = str(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

data["content"] = data["content"].apply(clean_text)

# 6. Remove empty articles
data = data[data["content"] != ""]

# 7. Remove duplicate articles within each label
data = data.drop_duplicates(
    subset=["content", "label"]
)

# 8. Remove articles that have conflicting labels
label_counts = data.groupby("content")["label"].nunique()
conflicting_texts = label_counts[label_counts > 1].index

print("Conflicting articles found:", len(conflicting_texts))

data = data[~data["content"].isin(conflicting_texts)]

data = data.reset_index(drop=True)

print("\nTotal articles for training:", len(data))
print(data["label"].value_counts())

# 9. Separate input and output
X = data["content"]
y = data["label"]

# 10. Split into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining articles:", len(X_train))
print("Testing articles:", len(X_test))

# 11. Create ML pipeline
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

# 12. Train the model
print("\nTraining TruthLens model...")

model.fit(X_train, y_train)

print("Training completed!")

# 13. Make predictions
y_pred = model.predict(X_test)

# 14. Evaluate model
accuracy = accuracy_score(y_test, y_pred)

print("\n========== MODEL EVALUATION ==========")

print(f"\nAccuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        labels=["FAKE", "REAL"],
        zero_division=0
    )
)

print("\nConfusion Matrix:")
print(
    confusion_matrix(
        y_test,
        y_pred,
        labels=["FAKE", "REAL"]
    )
)

# 15. Save trained model
model_path = MODEL_DIR / "truthlens_model.pkl"

joblib.dump(model, model_path)

print("\nModel saved successfully!")
print("Saved location:", model_path)
