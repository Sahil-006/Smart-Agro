import { useMemo } from "react";
import { FiSun, FiTrendingUp, FiZap, FiBatteryCharging, FiShield } from "react-icons/fi";
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

export function SolarInsights() {
  const { isDark } = useTheme();

  const solarHourly = useMemo(
    () => [
      { time: "06:00", output: 140, efficiency: 72 },
      { time: "08:00", output: 320, efficiency: 78 },
      { time: "10:00", output: 460, efficiency: 84 },
      { time: "12:00", output: 540, efficiency: 88 },
      { time: "14:00", output: 510, efficiency: 86 },
      { time: "16:00", output: 390, efficiency: 80 },
      { time: "18:00", output: 180, efficiency: 74 },
    ],
    []
  );

  const chartData = {
    labels: solarHourly.map((d) => d.time),
    datasets: [
      {
        label: "Solar Generation (Watts)",
        data: solarHourly.map((d) => d.output),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: "Panel Efficiency (%)",
        data: solarHourly.map((d) => d.efficiency * 5), // Scaled for multi-axis view
        borderColor: "#10b981",
        backgroundColor: "transparent",
        borderDash: [5, 5],
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 2,
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
        },
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(15, 23, 42, 0.9)",
        cornerRadius: 12,
        padding: 10,
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
            <span className="glass-pill px-3 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Renewable Microgrid
            </span>
            <StatusBadge status="online" size="sm" label="Inverter Connected" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
            Solar Harvest & Energy Microgrid
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Photovoltaic output monitoring, MPPT tracking efficiency, and battery reserve storage.
          </p>
        </div>
      </div>

      {/* Metrics Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Daily Generation
            </span>
            <FiZap className="text-amber-600 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">3.4 kWh</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">+14% vs 7-day average</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Array Efficiency
            </span>
            <FiTrendingUp className="text-emerald-700 dark:text-emerald-400 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">84.5%</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">MPPT Optimal Curve</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Lithium Storage
            </span>
            <FiBatteryCharging className="text-sky-600 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">78%</p>
          <div className="w-full bg-slate-300/60 dark:bg-slate-700/60 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-600 dark:bg-emerald-500 h-1.5 rounded-full" style={{ width: "78%" }} />
          </div>
        </div>
      </div>

      {/* Solar Curve Graph */}
      <div className="glass-card p-6 md:p-8 rounded-3xl mb-8 border border-slate-900/10 dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
            <FiSun className="text-amber-600" />
            Diurnal Solar Generation Curve (Watts vs Time)
          </h2>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Bifacial Monocrystalline Array</span>
        </div>

        <div className="w-full h-72 sm:h-84">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Production Log */}
      <div className="glass-card p-6 rounded-3xl border border-slate-900/10 dark:border-white/10">
        <h3 className="text-base font-bold text-slate-950 dark:text-slate-50 mb-4">
          Hourly Harvest Telemetry
        </h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <th className="py-3 px-4">Time Interval</th>
                <th className="py-3 px-4">Instantaneous Power</th>
                <th className="py-3 px-4">Efficiency</th>
                <th className="py-3 px-4">Grid Offset</th>
                <th className="py-3 px-4">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-xs text-slate-800 dark:text-slate-200 font-medium">
              {solarHourly.map((d, i) => (
                <tr key={i} className="hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-950 dark:text-slate-50">
                    {d.time}
                  </td>
                  <td className="py-3 px-4 font-black text-amber-700 dark:text-amber-400">
                    {d.output} W
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{d.efficiency}%</td>
                  <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">100% Clean</td>
                  <td className="py-3 px-4">
                    <StatusBadge status="online" size="sm" label="Harvesting" />
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

export default SolarInsights;
