import { useState, useMemo } from "react";
import { FiDroplet, FiClock, FiActivity, FiLayers } from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import StatusBadge from "../../components/ui/StatusBadge";
import { useTheme } from "../../hooks/useTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function SoilInsights() {
  const [timeframe, setTimeframe] = useState("24h"); // "24h" | "7d" | "30d"
  const { isDark } = useTheme();

  const hourlyData = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        moisture: Math.floor(Math.sin(i / 3) * 8 + 64),
        temperature: Math.floor(Math.cos(i / 4) * 4 + 26),
        pH: Number((6.7 + Math.sin(i) * 0.2).toFixed(1)),
      })),
    []
  );

  const weeklyData = useMemo(
    () =>
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
        label: day,
        moisture: Math.floor(Math.sin(i) * 6 + 65),
        temperature: Math.floor(Math.cos(i) * 3 + 27),
        pH: Number((6.8 + (i % 2) * 0.1).toFixed(1)),
      })),
    []
  );

  const activeDataset = timeframe === "24h" ? hourlyData : weeklyData;

  const chartData = {
    labels: activeDataset.map((d) => d.label),
    datasets: [
      {
        label: "Moisture (%)",
        data: activeDataset.map((d) => d.moisture),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
      {
        label: "Temperature (°C)",
        data: activeDataset.map((d) => d.temperature),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.05)",
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderDash: [4, 4],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDark ? "#cbd5e1" : "#0f172a",
          font: { family: "-apple-system, sans-serif", size: 12, weight: 600 },
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(15, 23, 42, 0.9)",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? "#94a3b8" : "#334155", font: { size: 11, weight: 500 } },
      },
      y: {
        grid: { color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)" },
        ticks: { color: isDark ? "#94a3b8" : "#334155", font: { size: 11, weight: 500 } },
      },
    },
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="glass-pill px-3 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Telemetry Suite
            </span>
            <StatusBadge status="online" size="sm" label="4 Nodes Active" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Soil Moisture & Subsurface Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Real-time volumetric water content, rhizosphere temperature, and chemical alkalinity trends.
          </p>
        </div>

        {/* Timeframe Segmented Control */}
        <div className="glass-pill p-1 flex items-center gap-1 self-start sm:self-auto select-none">
          {["24h", "7d"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`px-3.5 py-1 text-xs font-bold uppercase rounded-full transition-all cursor-pointer ${
                timeframe === t
                  ? "bg-white dark:bg-slate-700 text-emerald-950 dark:text-emerald-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Mean Moisture
            </span>
            <FiDroplet className="text-emerald-700 dark:text-emerald-400 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">65.2%</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">Optimal Range (60% - 70%)</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Rhizosphere Temp
            </span>
            <FiActivity className="text-amber-700 dark:text-amber-400 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">27.4°C</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">Equilibrium for root growth</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Chemical Alkalinity
            </span>
            <FiLayers className="text-teal-700 dark:text-teal-400 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">6.8 pH</p>
          <p className="text-xs text-teal-700 dark:text-teal-400 font-bold mt-1">Slightly Acidic (Ideal)</p>
        </div>
      </div>

      {/* Chart.js Graph Container */}
      <div className="glass-card p-6 md:p-8 rounded-3xl mb-8 border border-slate-900/10 dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
            <FiClock className="text-emerald-700 dark:text-emerald-400" />
            Dynamic Moisture & Temperature Curve
          </h2>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Sensor Array #104</span>
        </div>

        <div className="w-full h-72 sm:h-84">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Historical Telemetry Table in Liquid Glass */}
      <div className="glass-card p-6 rounded-3xl overflow-hidden border border-slate-900/10 dark:border-white/10">
        <h3 className="text-base font-bold text-slate-950 dark:text-slate-50 mb-4">
          Sensor Log Records ({timeframe === "24h" ? "Hourly Intervals" : "Daily Averages"})
        </h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Moisture</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">pH Reading</th>
                <th className="py-3 px-4">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-xs text-slate-800 dark:text-slate-200 font-medium">
              {activeDataset.slice(0, 8).map((d, i) => (
                <tr key={i} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-950 dark:text-slate-50">
                    {d.label}
                  </td>
                  <td className="py-3 px-4 font-black text-emerald-700 dark:text-emerald-400">
                    {d.moisture}%
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{d.temperature}°C</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{d.pH}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status="online" size="sm" label="Nominal" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SoilInsights;
