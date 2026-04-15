import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, ChartDataLabels);

export default function TrendingTopics({ topics, isExporting }) {
  const data = {
    labels: topics.map(([t]) => t),
    datasets: [{
      data: topics.map(([, c]) => c),
      backgroundColor: "#0e6d37",
      borderRadius: 2,
      barPercentage: 0.72,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { font: { size: 10 }, maxRotation: 30, autoSkip: false }, grid: { display: false } },
      y: { ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: "rgba(0,0,0,0.06)" } },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: !isExporting, callbacks: { label: (ctx) => ` ${ctx.raw} articles` } },
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
      <div className="chart-title">Trending Topics</div>
      <div className="chart-wrap topics-wrap">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
