# TruthLens – AI-Powered Fake News Detection System

TruthLens is an AI-powered web application designed to analyze news articles and identify whether their textual patterns resemble real or fake news using Natural Language Processing (NLP) and Machine Learning.

The system uses text preprocessing, TF-IDF feature extraction, and machine learning classification to analyze submitted news content and generate a prediction with an estimated confidence score.

> **Note:** TruthLens is a machine-learning-based text classifier, not an independent fact-checking system. Its predictions are estimates based on patterns learned from its training dataset and should not be treated as proof of factual accuracy.

---

## 🎯 Project Objectives

- Develop an AI-based system for fake news text classification.
- Apply Natural Language Processing techniques to news articles.
- Train and evaluate machine learning classification models.
- Provide an easy-to-use interface for analyzing news content.
- Display prediction results and model confidence estimates.

## ✨ Planned Features

- **News Text Analysis:** Enter or submit news article text for analysis.
- **Fake News Classification:** Classify submitted content as REAL or FAKE based on learned textual patterns.
- **Confidence Score:** Display the model's estimated prediction confidence.
- **Text Preprocessing:** Clean and transform news content before classification.
- **Analysis History:** Maintain a history of previous analyses.
- **Dashboard:** Present useful information about news analysis and prediction results.

*Features will be implemented progressively during development.*

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Python, FastAPI |
| Machine Learning | Scikit-learn |
| NLP | TF-IDF Vectorization |
| Classification Algorithm | Logistic Regression |
| Data Processing | Pandas, NumPy |
| Model Serialization | Joblib |
| API Server | Uvicorn |
| Version Control | Git, GitHub |

## 🏗️ Project Architecture

```text
TruthLens/
│
├── frontend/
│   └── React application (planned)
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── requirements.txt
│   └── venv/
│
├── ml-model/
│   ├── data/
│   ├── models/
│   └── src/
│       ├── train.py
│       └── predict.py
│
├── .gitignore
└── README.md
```

## ⚙️ How It Works

1. The user submits a news article or headline through the frontend.
2. The backend receives the submitted text through a REST API.
3. The text is preprocessed and converted into numerical features using TF-IDF.
4. The trained machine learning model analyzes the extracted features.
5. The system returns a predicted label (REAL or FAKE) and an estimated confidence score.
6. The frontend displays the analysis result.

## 🧠 Machine Learning Approach

The planned machine learning pipeline consists of:

- **Data Collection:** Obtain labelled real and fake news articles.
- **Text Preprocessing:** Clean and prepare article content.
- **Feature Extraction:** Convert text into numerical representations using TF-IDF.
- **Model Training:** Train a Logistic Regression classifier.
- **Model Evaluation:** Evaluate using accuracy, precision, recall, F1-score and a confusion matrix.
- **Prediction:** Use the trained model to classify new text.

## 📊 Dataset

The project plans to use the **ISOT Fake News Dataset**, which contains real and fake news articles.

Dataset source: [University of Victoria – ISOT Fake News Dataset](https://onlineacademiccommunity.uvic.ca/isot/2022/11/27/fake-news-detection-datasets/)

The dataset is intended for research and educational purposes. Dataset files will be stored locally and excluded from GitHub.

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or later
- Node.js and npm (for the frontend)
- Git
- Visual Studio Code (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/veda1823/TruthLens.git
cd TruthLens
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Run the Backend

```bash
uvicorn app.main:app --reload
```

The backend will run at:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

Health check:

`http://127.0.0.1:8000/health`

*The machine learning