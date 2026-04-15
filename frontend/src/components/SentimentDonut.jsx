import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./Dashboard.css";

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

export default function SentimentDonut({ pos, neg, neu, total, isExporting }) {

  const data = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [{
      data: [pos, neg, neu],
      backgroundColor: ["#0e6d37", "#ed1d24", "#64748b"],
      borderColor: "#fff",
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "58%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: !isExporting, callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } },
      datalabels: {
        color: "#fff",
        formatter: (value, ctx) => {
          if (!value) return "";
          const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = Math.round((value / sum) * 100);
          return pct > 0 ? pct + "%" : ""; 
        },
        font: { weight: "800", size: 10 },
      }
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-title">Sentiment of Articles</div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 8 }}>
        {[{ color: "#0e6d37", label: "Pos" }, { color: "#ed1d24", label: "Neg" }, { color: "#64748b", label: "Neu" }].map((l) => (
          <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: "600", color: "#666" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      <div className="chart-wrap donut-wrap">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
