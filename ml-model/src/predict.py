
import re
import joblib
from pathlib import Path

# 1. Locate the saved model
BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "truthlens_model.pkl"

# 2. Load trained model
model = joblib.load(MODEL_PATH)

print("\n===================================")
print("       TRUTHLENS NEWS ANALYZER")
print("===================================")

# 3. Clean the input text
def clean_text(text):
    text = str(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# 4. Get news article from user
news = input("\nEnter your news article or headline:\n")

news = clean_text(news)

if not news:
    print("\nPlease enter some news text.")
else:
    # 5. Predict the news category
    prediction = model.predict([news])[0]

    # 6. Get estimated model probabilities
    probabilities = model.predict_proba([news])[0]

    class_probabilities = dict(
        zip(model.classes_, probabilities)
    )

    estimated_score = class_probabilities[prediction] * 100

    # 7. Display result
    print("\n========== ANALYSIS RESULT ==========")

    print("Prediction:", prediction)

    print(f"Estimated model probability: {estimated_score:.2f}%")

    print("\nClass probabilities:")

    print(
        f"FAKE: {class_probabilities['FAKE'] * 100:.2f}%"
    )

    print(
        f"REAL: {class_probabilities['REAL'] * 100:.2f}%"
    )

    print("\nNote: This is a text-pattern prediction,")
    print("not independent verification of factual accuracy.")
