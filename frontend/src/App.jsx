import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import ControlsBar from "./components/ControlsBar";
import { analyzeArticles } from "./api";
import "./App.css";

export default function App() {
  const [articles, setArticles] = useState(() => {
    const saved = sessionStorage.getItem("up_raw_articles");
    return saved ? JSON.parse(saved) : [];
  });
  const [analyzed, setAnalyzed] = useState(() => {
    const saved = sessionStorage.getItem("up_analyzed_data");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [lastQuery, setLastQuery] = useState(() => {
    return sessionStorage.getItem("up_last_query") || "";
  });

  React.useEffect(() => {
    sessionStorage.setItem("up_raw_articles",  JSON.stringify(articles));
    sessionStorage.setItem("up_analyzed_data", JSON.stringify(analyzed));
    sessionStorage.setItem("up_last_query",    lastQuery);
  }, [articles, analyzed, lastQuery]);

  async function handleAnalyze(sources, keywords, fromDate, toDate) {
    setLoading(true);
    setError("");
    setArticles([]);
    setAnalyzed([]);
    setLastQuery(keywords);

    // Clear translation cookies for fresh results
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";

    try {
      const { articles } = await analyzeArticles(sources, keywords, fromDate, toDate);
      setArticles(articles || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function onFinalAnalyze(data) {
    setAnalyzed(data);
  }

  return (
    <div className="app-shell">
      <header className="app-header notranslate">
        <h1>UP Politics Media Tracker</h1>
        <span className="app-badge">Live Google News</span>
      </header>

      <ControlsBar onAnalyze={handleAnalyze} loading={loading} />

      {error && <div className="app-error">⚠ {error}</div>}

      {loading && (
        <div className="app-loading">
          <div className="loading-card">
            <span className="spinner" />
            <div className="loading-text">
              <strong>Searching Google News…</strong>
              <span>Scanning multiple pages and filtering to your sources. This may take 1–3 minutes.</span>
              {lastQuery && <span className="loading-query">Query: <em>"{lastQuery}"</em></span>}
            </div>
          </div>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <Dashboard
          rawArticles={articles}
          analyzedArticles={analyzed}
          onFinalAnalyze={onFinalAnalyze}
        />
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="app-empty">
          <div className="empty-icon">📰</div>
          <h2 className="empty-title">Search UP Politics News</h2>
          <p>Enter a keyword in the search bar above and click <strong>Search News</strong>.</p>
          <p>Google News will be scanned broadly — only articles from your selected media sources will be returned.</p>
          <div className="empty-tips">
            <span>💡 Tips:</span>
            <ul>
              <li>Use comma for multiple queries: <code>Akhilesh Yadav, UP Budget</code></li>
              <li>Use <code>+</code> to combine words in one query: <code>Akhilesh Yadav+SP</code> → searches <em>Akhilesh Yadav SP</em></li>
              <li>Type in Hindi too: <code>योगी आदित्यनाथ</code></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
