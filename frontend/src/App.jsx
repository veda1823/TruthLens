
import { useState } from "react";
import "./App.css";

function App() {
  const [article, setArticle] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [inputMode, setInputMode] = useState("text");

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
    localStorage.setItem(
      "truthlens-history",
      JSON.stringify(updatedHistory)
    );
  };

  // Analyze news using text or URL
  const analyzeNews = async () => {
    const input = inputMode === "text" ? article.trim() : articleUrl.trim();

    if (!input) {
      setError(
        inputMode === "text"
          ? "Please enter a news article first."
          : "Please enter a news article URL."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const endpoint =
        inputMode === "text"
          ? "http://127.0.0.1:8000/predict"
          : "http://127.0.0.1:8000/predict-url";

      const requestBody =
        inputMode === "text"
          ? { text: input }
          : { url: input };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to analyze the article."
        );
      }

      setResult(data);

      const newEntry = {
        id: Date.now(),
        article: input,
        inputMode: inputMode,
        prediction: data.prediction,
        confidence: Number(data.confidence),
        probabilities: data.probabilities,
        explanation: data.explanation,
        message: data.message,
        source_url: data.source_url || null,
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

  // Clear current input
  const clearArticle = () => {
    setArticle("");
    setArticleUrl("");
    setResult(null);
    setError("");
  };

  // Clear analysis history
  const clearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all analysis history?"
      )
    ) {
      saveHistory([]);
    }
  };

  // Restore a previous analysis
  const viewHistoryItem = (item) => {
    const mode = item.inputMode || "text";

    setInputMode(mode);

    if (mode === "url") {
      setArticleUrl(item.article);
      setArticle("");
    } else {
      setArticle(item.article);
      setArticleUrl("");
    }

    setResult({
      prediction: item.prediction,
      confidence: item.confidence,
      probabilities: item.probabilities || {
        REAL: 0,
        FAKE: 0,
      },
      explanation: item.explanation || null,
      source_url: item.source_url || null,
      message:
        item.message ||
        "Previous analysis. Some details may not have been saved.",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Render Explainable AI terms
  const renderTerms = (terms, type) => {
    if (!terms || terms.length === 0) {
      return (
        <p className="no-terms">
          No significant terms found.
        </p>
      );
    }

    return (
      <div className="explanation-terms">
        {terms.map((item, index) => (
          <div
            className="explanation-term"
            key={`${item.word}-${index}`}
          >
            <span>{item.word}</span>

            <strong className={type}>
              {item.contribution > 0 ? "+" : ""}
              {Number(item.contribution).toFixed(5)}
            </strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app">

      {/* Navigation */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">T</div>

          <span>
            Truth<span className="brand-highlight">Lens</span>
          </span>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          AI Analysis Platform
        </div>
      </nav>

      <main className="main-container">

        {/* Hero Section */}
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

        {/* Analysis Card */}
        <section className="analysis-card">

          <div className="card-heading">
            <div>
              <h2>Analyze News Article</h2>
              <p>
                Choose text analysis or URL analysis to get started.
              </p>
            </div>

            <div className="document-icon">▤</div>
          </div>

          {/* Input Mode Selection */}
          <div
            className="mode-switch"
            style={{
              display: "flex",
              gap: "10px",
              margin: "20px 0",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setInputMode("text");
                setResult(null);
                setError("");
              }}
              style={{
                padding: "11px 20px",
                borderRadius: "8px",
                border: "1px solid #6554c0",
                background:
                  inputMode === "text" ? "#6554c0" : "transparent",
                color:
                  inputMode === "text" ? "#ffffff" : "inherit",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ✍ Text Analysis
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode("url");
                setResult(null);
                setError("");
              }}
              style={{
                padding: "11px 20px",
                borderRadius: "8px",
                border: "1px solid #6554c0",
                background:
                  inputMode === "url" ? "#6554c0" : "transparent",
                color:
                  inputMode === "url" ? "#ffffff" : "inherit",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              🔗 URL Analysis
            </button>
          </div>

          {/* Text Input */}
          {inputMode === "text" ? (
            <>
              <label htmlFor="article">NEWS CONTENT</label>

              <textarea
                id="article"
                placeholder="Paste your news article or headline here..."
                value={article}
                onChange={(e) => setArticle(e.target.value)}
              />

              <div className="input-footer">
                <span>{article.length} characters</span>

                <button
                  className="clear-btn"
                  onClick={clearArticle}
                >
                  Clear text
                </button>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="articleUrl">
                NEWS ARTICLE URL
              </label>

              <input
                id="articleUrl"
                type="url"
                placeholder="https://example.com/news/article"
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px",
                  marginTop: "10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />

              <div className="input-footer">
                <span>
                  Enter a publicly accessible news article URL.
                </span>

                <button
                  className="clear-btn"
                  onClick={clearArticle}
                >
                  Clear URL
                </button>
              </div>
            </>
          )}

          {/* Analyze Button */}
          <button
            className="analyze-btn"
            onClick={analyzeNews}
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : inputMode === "text"
                ? "✦ Analyze Article"
                : "✦ Analyze URL"}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Analysis Result */}
          {result && (
            <div className="result-section">

              <div className="result-heading">
                <span>ANALYSIS RESULT</span>
                <span className="result-line"></span>
              </div>

              {result.source_url && (
                <p style={{ wordBreak: "break-all" }}>
                  <strong>Source URL: </strong>
                  <a
                    href={result.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {result.source_url}
                  </a>
                </p>
              )}

              {/* Prediction */}
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

              {/* Probability Scores */}
              <div className="probability-heading">
                <h3>Prediction scores</h3>
              </div>

              {["REAL", "FAKE"].map((label) => (
                <div
                  className="probability-row"
                  key={label}
                >
                  <div className="probability-label">
                    <span>
                      {label === "REAL" ? "Real News" : "Fake News"}
                    </span>

                    <strong>
                      {Number(
                        result.probabilities?.[label] ?? 0
                      ).toFixed(2)}%
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress ${
                        label === "REAL"
                          ? "real-progress"
                          : "fake-progress"
                      }`}
                      style={{
                        width: `${
                          result.probabilities?.[label] ?? 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Explainable AI */}
              {result.explanation && (
                <div className="explanation-section">

                  <div className="explanation-heading">
                    <span>✦</span>

                    <div>
                      <h3>Why this prediction?</h3>
                      <p>
                        Important words and phrases that influenced
                        the model.
                      </p>
                    </div>
                  </div>

                  <div className="explanation-group supporting-group">
                    <h4>
                      Words supporting {result.prediction}
                    </h4>

                    {renderTerms(
                      result.explanation.supporting_terms,
                      "supporting-score"
                    )}
                  </div>

                  <div className="explanation-group opposing-group">
                    <h4>
                      Words opposing {result.prediction}
                    </h4>

                    {renderTerms(
                      result.explanation.opposing_terms,
                      "opposing-score"
                    )}
                  </div>

                  <p className="explanation-note">
                    {result.explanation.note}
                  </p>

                </div>
              )}

              <p className="disclaimer">
                {result.message ||
                  "This prediction is based on learned text patterns, not independent fact verification."}
              </p>

            </div>
          )}

        </section>

        {/* Analysis History */}
        <section className="history-section">

          <div className="history-heading">
            <div>
              <h2>Analysis History</h2>
              <p>Your recently analyzed news articles</p>
            </div>

            {history.length > 0 && (
              <button
                className="clear-history-btn"
                onClick={clearHistory}
              >
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
                <div
                  className="history-item"
                  key={item.id}
                >

                  <div className="history-content">
                    <p className="history-article">
                      {item.inputMode === "url" ? "🔗 " : ""}
                      {item.article.slice(0, 150)}
                      {item.article.length > 150 ? "..." : ""}
                    </p>

                    <small>
                      {item.inputMode === "url"
                        ? "URL Analysis"
                        : "Text Analysis"}
                      {" · "}
                      {item.date}
                    </small>
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

                    <strong>
                      {Number(item.confidence).toFixed(2)}%
                    </strong>

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

        {/* Features */}
        <section className="features">

          <div className="feature">
            <span className="feature-icon">⌕</span>

            <div>
              <h3>Text & URL Analysis</h3>
              <p>
                Analyze pasted news content or extract articles
                directly from URLs.
              </p>
            </div>
          </div>

          <div className="feature">
            <span className="feature-icon">◈</span>

            <div>
              <h3>Machine Learning</h3>
              <p>
                Uses a trained TF-IDF and Logistic Regression pipeline.
              </p>
            </div>
          </div>

          <div className="feature">
            <span className="feature-icon">✦</span>

            <div>
              <h3>Explainable AI</h3>
              <p>
                Highlights words influencing the model prediction.
              </p>
            </div>
          </div>

        </section>

        {/* Footer */}
        <footer>
          <p>
            © 2026 TruthLens · AI-Powered Fake News Detection
          </p>

          <p>
            Predictions are estimates, not verified facts.
          </p>
        </footer>

      </main>
    </div>
  );
}

export default App;
