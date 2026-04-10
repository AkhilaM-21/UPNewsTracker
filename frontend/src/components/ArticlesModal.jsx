import React from "react";
import "./ArticlesModal.css";

const BADGE = {
  positive: { bg: "#eaf3de", color: "#3b6d11", label: "Positive" },
  negative: { bg: "#fcebeb", color: "#a32d2d", label: "Negative" },
  neutral:  { bg: "#e6f1fb", color: "#185fa5", label: "Neutral"  },
};

export default function ArticlesModal({ source, articles, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">{source}</span>
          <span className="modal-count">{articles.length} article{articles.length !== 1 ? "s" : ""}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {articles.length === 0 && (
            <p className="modal-empty">No articles found for this source.</p>
          )}

          {articles.map((a, i) => {
            const badge = BADGE[a.sentiment] || BADGE.neutral;
            return (
              <div key={i} className="art-card">
                <div className="art-top">
                  <span className="art-title">
                    {a.url
                      ? <a href={a.url} target="_blank" rel="noreferrer" className="art-link">{a.title}</a>
                      : a.title}
                  </span>
                  <span className="art-badge" style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </div>

                {a.summary && <p className="art-summary">{a.summary}</p>}

                <div className="art-meta">
                  <span className="art-date">{a.date || "—"}</span>
                  {(a.topics || []).map((t) => (
                    <span key={t} className="art-tag">{t}</span>
                  ))}
                  {a.politically_relevant && (
                    <span className="art-tag pol">Politically Relevant</span>
                  )}
                  {a.sentiment_score !== undefined && (
                    <span className="art-score">
                      Score: {a.sentiment_score > 0 ? "+" : ""}{a.sentiment_score}
                    </span>
                  )}
                </div>

                {/* Sentiment score bar */}
                <div className="art-bar-wrap">
                  <div
                    className="art-bar-fill"
                    style={{
                      width: `${Math.round(((a.sentiment_score || 0) + 1) / 2 * 100)}%`,
                      background: a.sentiment === "positive" ? "#5a9e2f"
                                : a.sentiment === "negative" ? "#c0392b" : "#4472c4",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
