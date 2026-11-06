
import { useState } from "react";
import "./App.css";

function App() {
  const [article, setArticle] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("truthlens-history")) || [];
    } catch {
      return [];
    }
  });

  const saveHistory = (updatedHistory) => {
    setHistory(updatedHistory);
    localStorage.setItem("truthlens-history", JSON.stringify(updatedHistory));
  };

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: article }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to analyze the article.");
      }

      setResult(data);

      const newEntry = {
        id: Date.now(),
        article: article.trim(),
        prediction: data.prediction,
        confidence: Number(data.confidence),
        date: new Date().toLocaleString(),
      };

      saveHistory([newEntry, ...history].slice(0, 20));
    } catch (err) {
      setError(
        err.message ||
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

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all analysis history?")) {
      saveHistory([]);
    }
  };

  const viewHistoryItem = (item) => {
    setArticle(item.article);
    setResult({
      prediction: item.prediction,
      confidence: item.confidence,
      probabilities: { REAL: 0, FAKE: 0 },
      message: "Previous analysis. Probability breakdown was not saved.",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                  result.prediction?.toUpperCase() === "FAKE" ? "fake" : "real"
                }`}
              >
                <div>
                  <small>MODEL PREDICTION</small>
                  <h2>{result.prediction?.toUpperCase()}</h2>
                </div>
                <div className="confidence">
                  <strong>{Number(result.confidence).toFixed(2)}%</strong>
                  <small>Model confidence</small>
                </div>
              </div>

              <div className="probability-heading">
                <h3>Prediction scores</h3>
              </div>

              {["REAL", "FAKE"].map((label) => (
                <div className="probability-row" key={label}>
                  <div className="probability-label">
                    <span>{label === "REAL" ? "Real News" : "Fake News"}</span>
                    <strong>
                      {Number(result.probabilities?.[label] ?? 0).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress ${
                        label === "REAL" ? "real-progress" : "fake-progress"
                      }`}
                      style={{
                        width: `${result.probabilities?.[label] ?? 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              <p className="disclaimer">
                {result.message ||
                  "This prediction is based on learned text patterns, not independent fact verification."}
              </p>
            </div>
          )}
        </section>

        <section className="history-section">
          <div className="history-heading">
            <div>
              <h2>Analysis History</h2>
              <p>Your recently analyzed news articles</p>
            </div>
            {history.length > 0 && (
              <button className="clear-history-btn" onClick={clearHistory}>
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              <span>◷</span>
              <h3>No analysis history yet</h3>
              <p>Your analyzed articles will appear here.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div className="history-item" key={item.id}>
                  <div className="history-content">
                    <p className="history-article">
                      {item.article.slice(0, 150)}
                      {item.article.length > 150 ? "..." : ""}
                    </p>
                    <small>{item.date}</small>
                  </div>

                  <div className="history-result">
                    <span
                      className={`history-badge ${
                        item.prediction?.toUpperCase() === "FAKE"
                          ? "fake-badge"
                          : "real-badge"
                      }`}
                    >
                      {item.prediction?.toUpperCase()}
                    </span>
                    <strong>{item.confidence.toFixed(2)}%</strong>
                    <button
                      className="view-btn"
                      onClick={() => viewHistoryItem(item)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
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
