import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, ChartDataLabels);

export default function SentimentByDate({ dateMap, isExporting }) {
  const dates = Object.keys(dateMap).sort();

  const fmt = (d) => {
    if (!d || !d.includes("-")) return d; // Return relative strings as is
    const parts = d.split("-");
    if (parts.length < 3) return d;
    const [y, m, day] = parts;
    return `${parseInt(day).toString().padStart(2,"0")}/${m}/${y.slice(2)}`;
  };

  const data = {
    labels: dates.map(fmt),
    datasets: [
      { label: "Positive", data: dates.map((d) => dateMap[d].pos), backgroundColor: "#0e6d37", barPercentage: 0.65 },
      { label: "Negative", data: dates.map((d) => dateMap[d].neg), backgroundColor: "#ed1d24", barPercentage: 0.65 },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { font: { size: 9 }, maxRotation: 45, autoSkip: false }, grid: { display: false } },
      y: { ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: "rgba(0,0,0,0.06)" } },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: !isExporting },
      datalabels: {
        anchor: "center",
        align: "center",
        color: "#fff",
        formatter: (val) => val > 0 ? val : "",
        font: { weight: "800", size: 10 },
      }
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-title">Sentiment by Date</div>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 8 }}>
        {[{ color: "#0e6d37", label: "Positive" }, { color: "#ed1d24", label: "Negative" }].map((l) => (
          <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      <div className="chart-wrap date-wrap">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
