import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import ControlsBar from "./components/ControlsBar";
import { analyzeArticles } from "./api";
import "./App.css";

export default function App() {
  const [articles, setArticles]   = useState(() => {
    const saved = sessionStorage.getItem("up_tracker_articles");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState("");
  const [runDate,  setRunDate]    = useState(() => {
    return sessionStorage.getItem("up_tracker_rundate") || "";
  });

  // Persist to session storage
  React.useEffect(() => {
    sessionStorage.setItem("up_tracker_articles", JSON.stringify(articles));
    sessionStorage.setItem("up_tracker_rundate", runDate);
  }, [articles, runDate]);

  async function handleAnalyze(sources, keywords, fromDate, toDate) {
    setLoading(true);
    setError("");
    setArticles([]);
    try {
      const { articles } = await analyzeArticles(sources, keywords, fromDate, toDate);
      setArticles(articles || []);
      setRunDate(new Date().toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header notranslate">
        <h1>UP Politics Media Tracker {runDate ? `— ${runDate}` : ""}</h1>
        <span className="app-badge">No API Key Required</span>
      </header>

      <ControlsBar onAnalyze={handleAnalyze} loading={loading} />

      {error && <div className="app-error">⚠ {error}</div>}

      {loading && (
        <div className="app-loading">
          <span className="spinner" />
          Fetching RSS feeds and running sentiment analysis… (10–30 seconds)
        </div>
      )}

      {!loading && articles.length > 0 && <Dashboard articles={articles} />}

      {!loading && !error && articles.length === 0 && (
        <div className="app-empty">
          <div className="empty-icon">📰</div>
          <p>Select media sources and click <strong>Analyze</strong> to fetch live UP politics news.</p>
          <p className="empty-sub">Powered by Google News RSS — no API key needed.</p>
        </div>
      )}
    </div>
  );
}
