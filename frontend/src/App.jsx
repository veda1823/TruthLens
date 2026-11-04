
import { useState } from "react";
import "./App.css";

function App() {
  const [article, setArticle] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeNews = async () => {
    if (!article.trim()) {
      setError("Please enter a news article first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: article }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to analyze the article.");
      }

      setResult(data);
    } catch (err) {
      setError(
        "Could not connect to the backend. Please check whether FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearArticle = () => {
    setArticle("");
    setResult(null);
    setError("");
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">T</div>
          <span>Truth<span className="brand-highlight">Lens</span></span>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          AI Analysis Platform
        </div>
      </nav>

      <main className="main-container">
        <section className="hero">
          <div className="hero-tag">
            <span>✦</span> AI-POWERED NEWS ANALYSIS
          </div>

          <h1>
            See Beyond the <span>Headline.</span>
          </h1>

          <p>
            Analyze news articles using machine learning.
            Discover whether an article resembles patterns found
            in real or fake news datasets.
          </p>
        </section>

        <section className="analysis-card">
          <div className="card-heading">
            <div>
              <h2>Analyze News Article</h2>
              <p>Paste the news content below to get started.</p>
            </div>
            <div className="document-icon">▤</div>
          </div>

          <label htmlFor="article">NEWS CONTENT</label>

          <textarea
            id="article"
            placeholder="Paste your news article or headline here..."
            value={article}
            onChange={(e) => setArticle(e.target.value)}
          />

          <div className="input-footer">
            <span>{article.length} characters</span>
            <button className="clear-btn" onClick={clearArticle}>
              Clear text
            </button>
          </div>

          <button
            className="analyze-btn"
            onClick={analyzeNews}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "✦  Analyze Article"}
          </button>

          {error && <div className="error-message">{error}</div>}

          {result && (
            <div className="result-section">
              <div className="result-heading">
                <span>ANALYSIS RESULT</span>
                <span className="result-line"></span>
              </div>

              <div
                className={`prediction ${
                  result.prediction?.toUpperCase() === "FAKE"
                    ? "fake"
                    : "real"
                }`}
              >
                <div>
                  <small>MODEL PREDICTION</small>
                  <h2>{result.prediction?.toUpperCase()}</h2>
                </div>
                <div className="confidence">
                  <strong>
                    {Number(result.confidence).toFixed(2)}%
                  </strong>
                  <small>Model confidence</small>
                </div>
              </div>

              <div className="probability-heading">
                <h3>Prediction scores</h3>
              </div>

              <div className="probability-row">
                <div className="probability-label">
                  <span>Real News</span>
                  <strong>
                    {Number(result.probabilities?.REAL ?? 0).toFixed(2)}%
                  </strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress real-progress"
                    style={{
                      width: `${result.probabilities?.REAL ?? 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="probability-row">
                <div className="probability-label">
                  <span>Fake News</span>
                  <strong>
                    {Number(result.probabilities?.FAKE ?? 0).toFixed(2)}%
                  </strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress fake-progress"
                    style={{
                      width: `${result.probabilities?.FAKE ?? 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <p className="disclaimer">
                {result.message ||
                  "This prediction is based on learned text patterns, not independent fact verification."}
              </p>
            </div>
          )}
        </section>

        <section className="features">
          <div className="feature">
            <span className="feature-icon">⌕</span>
            <div>
              <h3>Text Analysis</h3>
              <p>Examines article content and language patterns.</p>
            </div>
          </div>

          <div className="feature">
            <span className="feature-icon">◈</span>
            <div>
              <h3>Machine Learning</h3>
              <p>Uses a trained TF-IDF and Logistic Regression pipeline.</p>
            </div>
          </div>

          <div className="feature">
            <span className="feature-icon">◷</span>
            <div>
              <h3>Quick Results</h3>
              <p>Returns a prediction and model confidence scores.</p>
            </div>
          </div>
        </section>

        <footer>
          <p>© 2026 TruthLens · AI-Powered Fake News Detection</p>
          <p>Predictions are estimates, not verified facts.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
