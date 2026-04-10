import React, { useState } from "react";
import "./ControlsBar.css";

const ALL_SOURCES = [
  { id: "aaj_tak",      label: "Aaj Tak",             cat: "Hindi TV" },
  { id: "abp_news",     label: "ABP News",            cat: "Hindi TV" },
  { id: "zee_news",     label: "Zee News",            cat: "Hindi TV" },
  { id: "news18_india", label: "News18 India",        cat: "Hindi TV" },
  { id: "india_tv",     label: "India TV",            cat: "Hindi TV" },
  { id: "ndtv",         label: "NDTV",                cat: "English TV" },
  { id: "dainik_jagran",label: "Dainik Jagran",       cat: "Hindi Print" },
  { id: "amar_ujala",   label: "Amar Ujala",          cat: "Hindi Print" },
  { id: "hindustan",    label: "Hindustan",           cat: "Hindi Print" },
  { id: "nbt",          label: "Navbharat Times",     cat: "Hindi Digital" },
  { id: "toi",          label: "Times of India",      cat: "English Print" },
  { id: "ht",           label: "Hindustan Times",     cat: "English Print" },
  { id: "ie",           label: "Indian Express",      cat: "English Print" },
  { id: "lallantop",    label: "The Lallantop",       cat: "Digital" },
  { id: "newsclick",    label: "NewsClick",           cat: "Digital" },
  { id: "the_quint",    label: "The Quint",           cat: "Digital" },
  { id: "scroll",       label: "Scroll.in",           cat: "Digital" },
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
  { id: "db",           label: "Dainik Bhaskar",      cat: "Hindi Print" },
  { id: "patrika",      label: "Patrika News",        cat: "Hindi Print" },
  { id: "ani",          label: "ANI News",            cat: "News Agency" },
  { id: "ians",         label: "IANS",                cat: "News Agency" },
  { id: "pti",          label: "PTI",                 cat: "News Agency" },
  { id: "the_hindu",    label: "The Hindu",           cat: "English Print" },
  { id: "deccan",       label: "Deccan Herald",       cat: "English Print" },
  { id: "fpj",          label: "Free Press Journal",  cat: "English Print" },
  { id: "et",           label: "Economic Times",      cat: "English Print" },
  { id: "india_today",  label: "India Today",         cat: "English TV" },
  { id: "tv9",          label: "TV9 Bharatvarsh",     cat: "Hindi TV" },
  { id: "the_print",    label: "The Print",           cat: "Digital" },
];

const CATEGORIES = [...new Set(ALL_SOURCES.map((s) => s.cat))];

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
  const [toDate,   setToDate]   = useState(() => {
    return sessionStorage.getItem("up_tracker_to") || "";
  });

  // Persist to session storage
  React.useEffect(() => {
    sessionStorage.setItem("up_tracker_selected", JSON.stringify([...selected]));
    sessionStorage.setItem("up_tracker_keywords", keywords);
    sessionStorage.setItem("up_tracker_from",     fromDate);
    sessionStorage.setItem("up_tracker_to",       toDate);
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
    if (fromDate && toDate && fromDate > toDate) {
      alert("'From' date cannot be after 'To' date."); return;
    }
    onAnalyze(srcs, keywords, fromDate || null, toDate || null);
  }

  return (
    <div className="cb-wrap notranslate">
      <div className="cb-top">
        <span className="cb-label">Media Sources</span>
        <div className="cb-cats">
          {CATEGORIES.map((cat) => {
            const ids = ALL_SOURCES.filter((s) => s.cat === cat).map((s) => s.id);
            const on  = ids.every((id) => selected.has(id));
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

      <div className="cb-pills">
        {ALL_SOURCES.map((s) => (
          <button key={s.id} className={`pill ${selected.has(s.id) ? "on" : ""}`} onClick={() => toggleSource(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="cb-bottom">
        <input
          className="cb-keywords"
          type="text"
          placeholder="Extra keywords (e.g. Akhilesh Yadav, UP Budget)…"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <div className="cb-date-group">
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

        <span className="cb-count">{selected.size}/{ALL_SOURCES.length} sources</span>
        <button className="cb-run notranslate" onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="btn-spin" /> Fetching…</> : "▶ Analyze"}
        </button>
      </div>
    </div>
  );
}
