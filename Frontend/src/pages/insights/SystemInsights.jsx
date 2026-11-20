import { useState } from "react";
import { FiAlertCircle, FiCpu, FiWifi, FiCheckCircle } from "react-icons/fi";
import StatusBadge from "../../components/ui/StatusBadge";
import GlassButton from "../../components/ui/GlassButton";

export function SystemInsights() {
  const [filter, setFilter] = useState("all"); // "all" | "critical" | "resolved"

  const systemAlerts = [
    {
      id: 1,
      message: "Volumetric soil moisture depleted below 45% threshold in Sector B",
      time: "24 mins ago",
      critical: true,
      node: "Node-B12",
    },
    {
      id: 2,
      message: "Forecast radar detects precipitation (8.4mm) anticipated in 6 hours",
      time: "2 hours ago",
      critical: false,
      node: "Weather-Station",
    },
    {
      id: 3,
      message: "Solar inverter MPPT calibration routine completed successfully",
      time: "5 hours ago",
      critical: false,
      node: "Inverter-Primary",
    },
    {
      id: 4,
      message: "Firmware over-the-air update dispatched to 4 ESP32 telemetry nodes",
      time: "1 day ago",
      critical: false,
      node: "Gateway-01",
    },
  ];

  const filteredAlerts =
    filter === "critical"
      ? systemAlerts.filter((a) => a.critical)
      : systemAlerts;

  const iotNodes = [
    { name: "Rhizosphere Probe Alpha", zone: "Field A", ping: "28ms", battery: "92%", status: "online" },
    { name: "Solar MPPT Inverter", zone: "Array Array-01", ping: "14ms", battery: "100%", status: "online" },
    { name: "Canopy Humidity Sensor", zone: "Greenhouse #1", ping: "42ms", battery: "84%", status: "online" },
    { name: "Precipitation Gauge", zone: "Tower South", ping: "35ms", battery: "76%", status: "online" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="glass-pill px-3 py-0.5 text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
              Network Telemetry
            </span>
            <StatusBadge status="online" size="sm" label="Mesh Gateway Operational" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
            System Diagnostics & IoT Node Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Edge gateway latency, sensory node battery status, and automated anomaly notifications.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Mesh Latency
            </span>
            <FiWifi className="text-sky-600 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">32 ms</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">Sub-second telemetry</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Nodes Online
            </span>
            <FiCpu className="text-emerald-600 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">4 / 4</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">100% Mesh Coverage</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Packet Success
            </span>
            <FiCheckCircle className="text-emerald-600 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">99.98%</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">Zero dropouts</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Active Alerts
            </span>
            <FiAlertCircle className="text-amber-600 text-base" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-slate-50">{systemAlerts.length}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">1 Requires Attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Alerts Column */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-2 border border-slate-900/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
              <FiAlertCircle className="text-amber-600" />
              Incident & Anomaly Feed
            </h2>

            <div className="glass-pill p-1 flex items-center gap-1 select-none">
              {["all", "critical"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-0.5 text-xs font-bold uppercase rounded-full transition-all cursor-pointer ${
                    filter === f
                      ? "bg-white dark:bg-slate-700 text-slate-950 dark:text-slate-100 shadow-sm"
                      : "text-slate-700 dark:text-slate-400 hover:text-slate-950"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  alert.critical
                    ? "bg-red-500/10 border-red-500/30 text-red-950 dark:text-red-200"
                    : "glass-subtle border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-slate-100"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        alert.critical ? "bg-red-500 animate-ping" : "bg-emerald-500"
                      }`}
                    />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                      {alert.node}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold">{alert.message}</p>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-400 font-medium shrink-0 self-end sm:self-auto">
                  {alert.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Node Hardware Fleet */}
        <div className="glass-card p-6 rounded-3xl border border-slate-900/10 dark:border-white/10">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50 mb-5 flex items-center gap-2">
            <FiCpu className="text-emerald-700 dark:text-emerald-400" />
            Hardware Fleet Status
          </h2>

          <div className="space-y-3">
            {iotNodes.map((node, i) => (
              <div
                key={i}
                className="glass-subtle p-3.5 rounded-2xl border border-slate-900/10 dark:border-white/10 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-950 dark:text-slate-50">{node.name}</p>
                  <p className="text-[11px] text-slate-700 dark:text-slate-400 font-medium">{node.zone} • {node.ping}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status="online" size="sm" label={node.battery} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/10">
            <GlassButton variant="secondary" size="sm" className="w-full">
              Run Complete Diagnostic Scan
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemInsights;
