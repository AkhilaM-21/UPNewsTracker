import React, { useState } from "react";
import "./ControlsBar.css";

const ALL_SOURCES = [
  { id: "aaj_tak",      label: "Aaj Tak",             cat: "Hindi TV" },
  { id: "abp_news",     label: "ABP News",            cat: "Hindi TV" },
  { id: "zee_news",     label: "Zee News",            cat: "Hindi TV" },
  { id: "news18_india", label: "News18 India",        cat: "Hindi TV" },
  { id: "india_tv",     label: "India TV",            cat: "Hindi TV" },
  { id: "tv9",          label: "TV9 Bharatvarsh",     cat: "Hindi TV" },
  { id: "ndtv",         label: "NDTV",                cat: "English TV" },
  { id: "india_today",  label: "India Today",         cat: "English TV" },
  { id: "times_now",    label: "Times Now",           cat: "English TV" },
  { id: "republic",     label: "Republic",            cat: "English TV" },
  { id: "bharat_exp",   label: "Bharat Express",      cat: "English TV" },
  { id: "dainik_jagran",label: "Dainik Jagran",       cat: "Hindi Print" },
  { id: "amar_ujala",   label: "Amar Ujala",          cat: "Hindi Print" },
  { id: "hindustan",    label: "Hindustan",           cat: "Hindi Print" },
  { id: "db",           label: "Dainik Bhaskar",      cat: "Hindi Print" },
  { id: "patrika",      label: "Patrika News",        cat: "Hindi Print" },
  { id: "jansatta",     label: "Jansatta",            cat: "Hindi Print" },
  { id: "toi",          label: "Times of India",      cat: "English Print" },
  { id: "ht",           label: "Hindustan Times",     cat: "English Print" },
  { id: "ie",           label: "Indian Express",      cat: "English Print" },
  { id: "the_hindu",    label: "The Hindu",           cat: "English Print" },
  { id: "deccan",       label: "Deccan Herald",       cat: "English Print" },
  { id: "fpj",          label: "Free Press Journal",  cat: "English Print" },
  { id: "et",           label: "Economic Times",      cat: "English Print" },
  { id: "statesman",    label: "The Statesman",       cat: "English Print" },
  { id: "tribune",      label: "The Tribune",         cat: "English Print" },
  { id: "deccan_chron", label: "Deccan Chronicle",    cat: "English Print" },
  { id: "millennium",   label: "Millennium Post",     cat: "English Print" },
  { id: "telegraph",    label: "Telegraph India",     cat: "English Print" },
  { id: "nbt",          label: "Navbharat Times",     cat: "Digital" },
  { id: "lallantop",    label: "The Lallantop",       cat: "Digital" },
  { id: "newsclick",    label: "NewsClick",           cat: "Digital" },
  { id: "the_quint",    label: "The Quint",           cat: "Digital" },
  { id: "scroll",       label: "Scroll.in",           cat: "Digital" },
  { id: "the_print",    label: "The Print",           cat: "Digital" },
  { id: "the_wire",     label: "The Wire",            cat: "Digital" },
  { id: "bar_bench",    label: "Bar and Bench",       cat: "Digital" },
  { id: "the_federal",  label: "The Federal",         cat: "Digital" },
  { id: "news_arena",   label: "News Arena India",    cat: "Digital" },
  { id: "mint",         label: "Mint",                cat: "Digital" },
  { id: "money_control",label: "Money Control",       cat: "Digital" },
  { id: "dna_india",    label: "DNA India",           cat: "Digital" },
  { id: "news18_up",    label: "News18 UP/UK",        cat: "UP Regional" },
  { id: "zee_up",       label: "Zee UP/UK",           cat: "UP Regional" },
  { id: "abp_ganga",    label: "ABP Ganga",           cat: "UP Regional" },
  { id: "aaj_tak_up",   label: "Aaj Tak UP",          cat: "UP Regional" },
  { id: "jagran_up",    label: "Dainik Jagran (UP)",  cat: "UP Regional" },
  { id: "ujala_up",     label: "Amar Ujala (UP)",     cat: "UP Regional" },
  { id: "hindustan_up", label: "Hindustan (UP)",      cat: "UP Regional" },
  { id: "up_tak",       label: "UP Tak",              cat: "UP Regional" },
  { id: "bharat_sam",   label: "Bharat Samachar",     cat: "UP Regional" },
  { id: "etv_bharat",   label: "ETV Bharat",          cat: "UP Regional" },
  { id: "ani",          label: "ANI News",            cat: "News Agency" },
  { id: "ians",         label: "IANS",                cat: "News Agency" },
  { id: "pti",          label: "PTI",                 cat: "News Agency" },
  { id: "hind_samachar",label: "Hindustan Samachar",  cat: "News Agency" },
  { id: "dd_news",      label: "DD News",             cat: "Official" },
  { id: "news_on_air",  label: "News On Air",         cat: "Official" },
];

const CATEGORIES = [...new Set(ALL_SOURCES.map((s) => s.cat))];

// Quick-pick query suggestions
const SUGGESTIONS = [
  "Yogi Adityanath",
  "Akhilesh Yadav",
  "UP Budget 2025",
  "Samajwadi Party",
  "BJP Uttar Pradesh",
  "UP Election",
  "Lucknow News",
  "UP Police",
];

export default function ControlsBar({ onAnalyze, loading }) {
  const [selected, setSelected] = useState(() => {
    const saved = sessionStorage.getItem("up_tracker_selected");
    return saved ? new Set(JSON.parse(saved)) : new Set(ALL_SOURCES.map((s) => s.id));
  });
  const [keywords, setKeywords] = useState(() => {
    return sessionStorage.getItem("up_tracker_keywords") || "";
  });
  const [fromDate, setFromDate] = useState(() => {
    return sessionStorage.getItem("up_tracker_from") || "";
  });
  const [toDate, setToDate] = useState(() => {
    return sessionStorage.getItem("up_tracker_to") || "";
  });
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const [isEnglish, setIsEnglish] = useState(() => {
    return document.cookie.includes("googtrans=/auto/en") || document.cookie.includes("googtrans=/en/en");
  });

  const toggleTranslation = () => {
    const newVal = !isEnglish;
    setIsEnglish(newVal);

    if (newVal) {
      document.cookie = "googtrans=/auto/en; path=/";
      document.cookie = "googtrans=/auto/en; domain=" + window.location.hostname + "; path=/";
      window.location.reload();
    } else {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
      window.location.reload();
    }
  };

  // Persist to session storage
  React.useEffect(() => {
    sessionStorage.setItem("up_tracker_selected", JSON.stringify([...selected]));
    sessionStorage.setItem("up_tracker_keywords", keywords);
    sessionStorage.setItem("up_tracker_from", fromDate);
    sessionStorage.setItem("up_tracker_to", toDate);
  }, [selected, keywords, fromDate, toDate]);

  function toggleSource(id) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleCategory(cat) {
    const ids = ALL_SOURCES.filter((s) => s.cat === cat).map((s) => s.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => (allOn ? n.delete(id) : n.add(id)));
      return n;
    });
  }

  function toggleAll() {
    setSelected(selected.size === ALL_SOURCES.length ? new Set() : new Set(ALL_SOURCES.map((s) => s.id)));
  }

  function handleSubmit() {
    const srcs = ALL_SOURCES.filter((s) => selected.has(s.id)).map((s) => s.label);
    if (!srcs.length) { alert("Select at least one source."); return; }
    if (!keywords.trim()) { alert("Please enter a search query."); return; }
    if (fromDate && toDate && fromDate > toDate) {
      alert("'From' date cannot be after 'To' date."); return;
    }
    onAnalyze(srcs, keywords, fromDate || null, toDate || null);
  }

  return (
    <div className="cb-wrap notranslate">

      {/* ── HERO SEARCH BAR ─────────────────────────────────────── */}
      <div className="cb-search-hero">
        <div className="cb-search-label">
          <div className="cb-label-left">
            <span className="cb-search-icon">🔍</span>
            Search Query
          </div>
          
          <div className="trans-toggle-wrap">
            <span className={`trans-label ${!isEnglish ? 'active' : ''}`}>हिन्दी</span>
            <label className="trans-switch">
              <input type="checkbox" checked={isEnglish} onChange={toggleTranslation} />
              <span className="trans-slider"></span>
            </label>
            <span className={`trans-label ${isEnglish ? 'active' : ''}`}>ENG</span>
          </div>
        </div>

        <div className="cb-search-row">
          <input
            id="main-search-input"
            className="cb-search-input"
            type="text"
            placeholder="e.g. Akhilesh Yadav, UP Budget, Akhilesh+SP, योगी आदित्यनाथ…"
            value={keywords}
            autoComplete="off"
            onChange={(e) => setKeywords(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            id="analyze-btn"
            className="cb-run notranslate"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><span className="btn-spin" /> Fetching…</>
              : <><span className="run-icon">▶</span> Search News</>
            }
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="cb-suggestions">
          <span className="cb-sugg-label">Quick picks:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className={`cb-sugg-pill ${keywords === s ? "active" : ""}`}
              onClick={() => setKeywords(s)}
            >
              {s}
            </button>
          ))}
          {keywords && (
            <button className="cb-sugg-clear" onClick={() => setKeywords("")}>✕ Clear</button>
          )}
        </div>

        {/* Date filters inline */}
        <div className="cb-date-row">
          <span className="cb-date-hint">Date range (optional):</span>
          <label className="cb-date-label">From</label>
          <input
            id="date-from"
            className="cb-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <label className="cb-date-label">To</label>
          <input
            id="date-to"
            className="cb-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          {(fromDate || toDate) && (
            <button
              className="cb-date-clear"
              title="Clear date filter"
              onClick={() => { setFromDate(""); setToDate(""); }}
            >✕</button>
          )}
        </div>
      </div>

      {/* ── SOURCES COLLAPSIBLE ──────────────────────────────────── */}
      <div className="cb-sources-toggle" onClick={() => setSourcesOpen((o) => !o)}>
        <span className="cb-sources-toggle-label">
          📺 Media Sources
          <span className="cb-sources-count">{selected.size}/{ALL_SOURCES.length} selected</span>
        </span>
        <span className={`cb-chevron ${sourcesOpen ? "open" : ""}`}>▾</span>
      </div>

      {sourcesOpen && (
        <div className="cb-sources-panel">
          {/* Category filter buttons */}
          <div className="cb-top">
            <div className="cb-cats">
              {CATEGORIES.map((cat) => {
                const ids = ALL_SOURCES.filter((s) => s.cat === cat).map((s) => s.id);
                const on = ids.every((id) => selected.has(id));
                return (
                  <button key={cat} className={`cb-cat ${on ? "on" : ""}`} onClick={() => toggleCategory(cat)}>
                    {cat}
                  </button>
                );
              })}
              <button className="cb-cat cb-all" onClick={toggleAll}>
                {selected.size === ALL_SOURCES.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          {/* Source pills grid */}
          <div className="cb-pills">
            {ALL_SOURCES.map((s) => (
              <button key={s.id} className={`pill ${selected.has(s.id) ? "on" : ""}`} onClick={() => toggleSource(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
