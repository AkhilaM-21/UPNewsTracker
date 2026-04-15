import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import "./ArticlesTable.css";

const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:4000";



function formatDateDisplay(dateStr) {
  if (!dateStr) return "—";
  
  const dStr = dateStr.toLowerCase();
  let targetDate = null;

  // 1. Check if it's already a standard ISO/Manual date (YYYY-MM-DD)
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    targetDate = new Date(dateStr.slice(0, 10));
  } 
  // 2. Handle relative strings from Google News (X hrs ago, yesterday, etc.)
  else if (dStr.includes("ago") || dStr.includes("yesterday")) {
    const now = new Date();
    const d = new Date(now);
    const hMatch = dStr.match(/(\d+)\s+hrs?\s+ago/i);
    const mMatch = dStr.match(/(\d+)\s+mins?\s+ago/i);
    const dMatch = dStr.match(/(\d+)\s+days?\s+ago/i);

    if (hMatch) d.setHours(now.getHours() - parseInt(hMatch[1]));
    else if (mMatch) d.setMinutes(now.getMinutes() - parseInt(mMatch[1]));
    else if (dMatch) d.setDate(now.getDate() - parseInt(dMatch[1]));
    else if (dStr.includes("yesterday")) d.setDate(now.getDate() - 1);
    
    targetDate = d;
  } 
  // 3. Try fallback parsing
  else {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  if (!targetDate || isNaN(targetDate.getTime())) return dateStr;

  const day = String(targetDate.getDate()).padStart(2, "0");
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const year = String(targetDate.getFullYear()).slice(-2);
  
  return `${day}/${month}/${year}`;
}

export default function ArticlesTable({ articles, onAnalyze, isAnalyzed }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => {
    const saved = sessionStorage.getItem("up_tracker_selected_ids");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [localData, setLocalData] = useState({});


  const [customArticles, setCustomArticles] = useState(() => {
    const saved = sessionStorage.getItem("up_custom_articles");
    return saved ? JSON.parse(saved) : [];
  });
  const [isEnglish, setIsEnglish] = useState(() => {
    // Load translation state from sessionStorage if available
    const saved = sessionStorage.getItem("up_is_english");
    return saved ? JSON.parse(saved) : false;
  });

  // Save translation state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("up_is_english", JSON.stringify(isEnglish));
  }, [isEnglish]);

  // ── Manual entry state ──────────────────────────────────────────────────────
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualSource, setManualSource] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualDate, setManualDate] = useState("");
  const urlInputRef = useRef(null);

  // Sync selections to session
  useEffect(() => {
    sessionStorage.setItem("up_tracker_selected_ids", JSON.stringify([...selectedIds]));
  }, [selectedIds]);

  // Focus URL input when modal opens
  useEffect(() => {
    if (showManualForm && urlInputRef.current) {
      setTimeout(() => urlInputRef.current?.focus(), 100);
    }
  }, [showManualForm]);

  // Clear translation cookies on mount to show articles in original language
  useEffect(() => {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
  }, []);

  // Reset state whenever a new search result (articles prop) arrives
  useEffect(() => {
    const map = {};
    articles.forEach((a, index) => {
      map[index] = {
        ...a,
        sentiment: a.sentiment || "neutral"
      };
    });
    setLocalData(map);
    setSelectedIds(new Set()); // Reset selections for new search
    sessionStorage.removeItem("up_tracker_selected_ids");
    setCustomArticles([]); // Clear manual entries for new search
    sessionStorage.removeItem("up_custom_articles");
    setCurrentPage(1); // Back to page 1

    // Clear translation cookies to show original language
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
    setIsEnglish(false); // Reset to original language
    sessionStorage.removeItem("up_is_english"); // Clear saved translation state
  }, [articles]);

  // Sync custom articles to session
  useEffect(() => {
    sessionStorage.setItem("up_custom_articles", JSON.stringify(customArticles));
  }, [customArticles]);

  // Update localData when customArticles change
  useEffect(() => {
    if (customArticles.length === 0) return;
    setLocalData(prev => {
      const next = { ...prev };
      customArticles.forEach((a, i) => {
        const idx = articles.length + i;
        if (!next[idx]) {
          next[idx] = { ...a, sentiment: "neutral" };

        }
      });
      return next;
    });
  }, [customArticles, articles.length]);

  const toggleTranslation = () => {
    const newVal = !isEnglish;
    setIsEnglish(newVal);
    
    if (newVal) {
      // Enable English translation using Google Translate cookie
      document.cookie = 'googtrans=/hi/en; path=/';
      // Reload to apply translation
      setTimeout(() => window.location.reload(), 300);
    } else {
      // Clear translation - show original Hindi
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      // Reload to restore original
      setTimeout(() => window.location.reload(), 300);
    }
  };

  const PAGE_SIZE = 50;

  // Pagination slice
  const baseArticles = [...articles, ...customArticles];
  const allArticles = baseArticles;
  const totalCount = allArticles.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;


  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageArticles = allArticles.slice(startIndex, startIndex + PAGE_SIZE);

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const all = new Set(baseArticles.map((_, i) => i));
      setSelectedIds(all);
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const updateSentiment = (id, val) => {
    setLocalData(prev => ({
      ...prev,
      [id]: { ...prev[id], sentiment: val }
    }));
  };

  // removed togglePolitical

  // ── Manual add article ──────────────────────────────────────────────────────
  function handleAddManual() {
    if (!manualTitle.trim()) {
      alert("Please enter an article title.");
      return;
    }
    if (!manualSource.trim()) {
      alert("Please enter a source.");
      return;
    }
    
    const newArticle = {
      title: manualTitle.trim(),
      source: manualSource.trim(),
      url: manualUrl.trim() || "",
      date: manualDate || new Date().toISOString().slice(0, 10),
      sentiment: "neutral"
    };
    
    setCustomArticles(prev => [...prev, newArticle]);
    
    // Reset form
    setManualTitle("");
    setManualSource("");
    setManualUrl("");
    setManualDate("");
    setShowManualForm(false); // Close modal
  }


  const handleAnalyzeClick = () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one article to analyze.");
      return;
    }
    const filtered = Array.from(selectedIds).map(id => localData[id]);
    onAnalyze(filtered);

    // Scroll to results
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const exportToExcel = () => {
    const dataToExport = allArticles.map((a, i) => ({
      ID: i + 1,
      Title: a.title,
      Source: a.source,
      URL: a.url,
      Date: a.date,
      Sentiment: localData[i]?.sentiment || a.sentiment || "neutral",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sentiment Analysis");
    XLSX.writeFile(workbook, `UP_Tracker_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="at-wrap manual-mode">
      <div className="at-header">
        <div className="at-header-top">
          <div className="at-header-left">
            <span className="at-title"> Analysis Dashboard</span>
            <span className="at-count notranslate">
              {selectedIds.size} selected for analysis
            </span>
          </div>




          <div className="at-pagination-row">
            <button className="at-header-export-btn notranslate" title="Export to Excel" onClick={exportToExcel}>
              Excel Download
            </button>
            <div className="trans-toggle-wrap notranslate">
              <span className={`trans-label ${!isEnglish ? 'active' : ''}`}>हिन्दी</span>
              <label className="trans-switch">
                <input type="checkbox" checked={isEnglish} onChange={toggleTranslation} />
                <span className="trans-slider"></span>
              </label>
              <span className={`trans-label ${isEnglish ? 'active' : ''}`}>ENG</span>
            </div>

            <div className="at-pagination notranslate">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="pag-btn"
              >
                ← Prev
              </button>
              <span className="pag-info">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="pag-btn"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        <div className="at-manual-adder-btn notranslate">
          <button 
            className="add-article-btn" 
            onClick={() => setShowManualForm(true)}
            title="Add custom article "
          >
            ➕ ADD CUSTOM ARTICLE 
          </button>
        </div>

        {/* Manual Article Entry Modal */}
        {showManualForm && (
          <div className="modal-overlay" onClick={() => setShowManualForm(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">Manual Article Entry</span>
                <button className="modal-close" onClick={() => setShowManualForm(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="manual-form-modal">
                  <div className="form-group">
                    <label>Article Title</label>
                    <input
                      type="text"
                      placeholder="Article Title"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Article URL</label>
                    <input
                      ref={urlInputRef}
                      type="url"
                      placeholder="Article URL"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>News Source Name</label>
                    <input
                      type="text"
                      placeholder="News Source Name"
                      value={manualSource}
                      onChange={(e) => setManualSource(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date & Time</label>
                    <input
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Sentiment</label>
                    <select className="form-input" value="neutral" disabled>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button onClick={() => setShowManualForm(false)} className="btn-cancel">Cancel</button>
                    <button onClick={handleAddManual} className="btn-add">Add to Table</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import modal removed */}
      </div>

      <div className="at-table-wrap">
        <table className="at-table">


          <thead>
            <tr className="notranslate">
              <th className="notranslate" style={{ width: 40, textAlign: "center" }}>
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}

                  checked={selectedIds.size > 0 && selectedIds.size === allArticles.length}
                />
              </th>
              <th style={{ width: 45, textAlign: "left" }}>#</th>
              <th>Article Title & Source</th>
              <th style={{ width: 100 }}>Date</th>
              <th style={{ width: 110 }}>Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {pageArticles.map((rawA, i) => {
              const globalIdx = startIndex + i;
              const a = localData[globalIdx] || rawA;
              if (!a) return null;
              return (
                <tr key={globalIdx} className={selectedIds.has(globalIdx) ? "is-selected" : ""}>
                  <td className="notranslate" style={{ textAlign: "center", width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(globalIdx)}
                      onChange={() => toggleSelect(globalIdx)}
                    />
                  </td>
                  <td className="idx notranslate" style={{ width: 45 }}>{globalIdx + 1}</td>

                  <td>
                    <div className="at-cell-title">
                      <a href={a.url} target="_blank" rel="noreferrer" className="at-link">
                        {a.title}
                      </a>
                      <span className="at-source-tag">{a.source}</span>
                    </div>
                  </td>
                  <td style={{ width: 100 }}>
                    <span className="at-date-cell">{formatDateDisplay(a.date)}</span>
                  </td>
                  <td className="notranslate" style={{ width: 110 }}>
                    <select
                      className={`at-select ${a.sentiment}`}
                      value={a.sentiment}
                      onChange={(e) => updateSentiment(globalIdx, e.target.value)}
                    >
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                    </select>
                  </td>



                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="at-footer">
        <button
          className="at-analyze-btn"
          onClick={handleAnalyzeClick}
          disabled={selectedIds.size === 0}
        >
          {isAnalyzed ? "Re-generate Dashboard" : "Generate Analytics Dashboard"}
        </button>
      </div>
    </div>
  );
}
