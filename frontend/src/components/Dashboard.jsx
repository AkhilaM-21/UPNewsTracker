import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SourceTable from "./SourceTable";
import SentimentDonut from "./SentimentDonut";
import SentimentByDate from "./SentimentByDate";
import TrendingTopics from "./TrendingTopics";
import ArticlesModal from "./ArticlesModal";
import ArticlesTable from "./ArticlesTable";
import "./Dashboard.css";

export default function Dashboard({ rawArticles, analyzedArticles, onFinalAnalyze }) {
  const [modalSrc, setModalSrc] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const dashRef = useRef(null);

  // Use analyzed articles if available, otherwise just handle the table
  const showDashboard = analyzedArticles && analyzedArticles.length > 0;
  const displayArticles = showDashboard ? analyzedArticles : [];

  const srcMap = {};
  displayArticles.forEach((a) => {
    if (!srcMap[a.source]) srcMap[a.source] = { pos: 0, neg: 0, neu: 0, articles: [] };
    if (a.sentiment === "positive") srcMap[a.source].pos++;
    else if (a.sentiment === "negative") srcMap[a.source].neg++;
    else srcMap[a.source].neu++;
    srcMap[a.source].articles.push(a);
  });

  const totPos = displayArticles.filter((a) => a.sentiment === "positive").length;
  const totNeg = displayArticles.filter((a) => a.sentiment === "negative").length;
  const totNeu = displayArticles.filter((a) => a.sentiment === "neutral").length;


  const dateMap = {};
  displayArticles.forEach((a) => {
    if (!a.date) return;
    
    let key = "Unknown";
    const dStr = a.date.toLowerCase();

    // Helper for local ISO date YYYY-MM-DD
    const toISODate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (a.date.match(/^\d{4}-\d{2}-\d{2}/)) {
      // Manual/ISO: YYYY-MM-DD...
      key = a.date.slice(0, 10);
    } else if (dStr.includes("ago") || dStr.includes("yesterday")) {
      const now = new Date();
      const d = new Date(now);
      const hMatch = dStr.match(/(\d+)\s+hrs?\s+ago/i);
      const mMatch = dStr.match(/(\d+)\s+mins?\s+ago/i);
      const dMatch = dStr.match(/(\d+)\s+days?\s+ago/i);

      if (hMatch) d.setHours(now.getHours() - parseInt(hMatch[1]));
      else if (mMatch) d.setMinutes(now.getMinutes() - parseInt(mMatch[1]));
      else if (dMatch) d.setDate(now.getDate() - parseInt(dMatch[1]));
      else if (dStr.includes("yesterday")) d.setDate(now.getDate() - 1);
      
      key = toISODate(d);
    } else {
      const parsed = new Date(a.date);
      if (!isNaN(parsed.getTime())) {
        key = toISODate(parsed);
      } else {
        key = a.date;
      }
    }
    
    if (!dateMap[key]) dateMap[key] = { pos: 0, neg: 0 };
    if (a.sentiment === "positive") dateMap[key].pos++;
    else if (a.sentiment === "negative") dateMap[key].neg++;
  });

  const topicCount = {};
  displayArticles.forEach((a) => (a.topics || []).forEach((t) => { topicCount[t] = (topicCount[t] || 0) + 1; }));
  const sortedTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 16);

  async function handleDownloadPDF() {
    if (!dashRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const element = dashRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // 2 is enough for high-res mm based PDF
        useCORS: true,
        backgroundColor: "#ffffff",
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.offsetWidth,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          // Extra safety: ensure the cloned element is definitely visible and right-sized
          const clonedDash = clonedDoc.querySelector(".dash.is-exporting");
          if (clonedDash) {
            clonedDash.style.width = "1280px";
            clonedDash.style.minWidth = "1280px";
          }
        }
      });
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 297;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF("l", "mm", [pdfWidth, pdfHeight]);
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Analysis-Snapshot-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
    } finally { setIsExporting(false); }
  }

  return (
    <div className={`dash ${isExporting ? "is-exporting" : ""}`} ref={dashRef}>
      
      {/* ── REPORT HEADER (ONLY VISIBLE IN PDF) ── */}
      <div className="dash-report-header">
        <h1>UP Politics Media Tracker</h1>
        <div className="report-sub">Media Analysis Snaphot • {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </div>

      {/* ── SELECTION TABLE (ALWAYS ON TOP) ── */}
      <ArticlesTable
        articles={rawArticles}
        onAnalyze={onFinalAnalyze}
        isAnalyzed={showDashboard}
      />

      {showDashboard && (
        <div className={`dash-results-section ${isExporting ? "" : "fade-in"}`}>
          <div className="dash-header notranslate">
            <h2 className="dash-title">Media Analytics Breakdown</h2>
            <button className="dash-download-btn" onClick={handleDownloadPDF} disabled={isExporting}>
              {isExporting ? "Generating..." : "Download Report (PDF)"}
            </button>
          </div>

          <div className="dash-summary">
            {[
              { label: "Analyzed Articles", val: displayArticles.length, cls: "" },
              { label: "Positive", val: totPos, cls: "pos" },
              { label: "Negative", val: totNeg, cls: "neg" },
              { label: "Neutral", val: totNeu, cls: "neu" },

            ].map((s) => (
              <div key={s.label} className="sum-card">
                <span className={`sum-num ${s.cls}`}>{s.val}</span>
                <span className="sum-label notranslate">{s.label}</span>
              </div>
            ))}
          </div>

          <div className={`dash-grid ${Object.keys(srcMap).length > 10 ? "is-large" : "is-compact"}`}>
            <div className="dash-cell-source">
              <SourceTable srcMap={srcMap} totals={{ pos: totPos, neg: totNeg, neu: totNeu }} onSourceClick={setModalSrc} />
            </div>
            <div className="dash-cell-donut">
              <SentimentDonut pos={totPos} neg={totNeg} neu={totNeu} total={displayArticles.length} isExporting={isExporting} />
            </div>

            <div className="dash-cell-date">
              <SentimentByDate dateMap={dateMap} isExporting={isExporting} />
            </div>
            <div className="dash-cell-topics">
              <TrendingTopics topics={sortedTopics} isExporting={isExporting} />
            </div>
          </div>
        </div>
      )}

      {modalSrc && (
        <ArticlesModal
          source={modalSrc}
          articles={srcMap[modalSrc]?.articles || []}
          onClose={() => setModalSrc(null)}
        />
      )}
    </div>
  );
}


