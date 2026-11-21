import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiSun,
  FiDroplet,
  FiAlertCircle,
  FiImage,
  FiBarChart2,
  FiSettings,
  FiCalendar,
  FiUpload,
  FiCamera,
  FiRefreshCw,
  FiClipboard,
  FiShield,
  FiActivity,
  FiCheckCircle,
  FiInfo,
  FiArrowRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import GlassButton from "../components/ui/GlassButton";
import StatusBadge from "../components/ui/StatusBadge";
import GlassSkeleton from "../components/ui/GlassSkeleton";
import { API_BASE_URL as apiUrl } from "../components/api";
import { springSmooth } from "../constants/motion";

let dashboardCache = {
  data: null,
  timestamp: null,
};

const CACHE_EXPIRY_MS = 5 * 60 * 1000;

export function Dashboard() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiData, setApiData] = useState(dashboardCache.data);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "treatment" | "prevention"

  useEffect(() => {
    const savedAnalysis = sessionStorage.getItem("lastLeafAnalysis");
    if (savedAnalysis) {
      setAnalysisResult(JSON.parse(savedAnalysis));
    }
  }, []);

  const soilData = useMemo(
    () => ({
      moisture: apiData?.soil || 0,
      temperature: apiData?.temperature || 0,
      humidity: apiData?.humidity || 0,
      pH: apiData?.ph || 6.8,
    }),
    [apiData]
  );

  const solarData = useMemo(
    () => ({
      currentOutput: apiData?.solar_output || 0,
      dailyProduction: apiData?.dailyProduction || 3.2,
      efficiency: apiData?.efficiency || 82,
      batteryLevel: apiData?.batteryLevel || 75,
    }),
    [apiData]
  );

  const cropHealth = useMemo(
    () => ({
      diseaseRisk: analysisResult?.diseaseRisk || apiData?.diseaseRisk || 0,
      growthStage: analysisResult?.growthStage || apiData?.growthStage || t("dashboard.growthStageValue"),
      lastScan: analysisResult ? t("dashboard.alerts.timeMinsAgo") : t("dashboard.alerts.timeToday"),
      healthScore: analysisResult?.healthScore || apiData?.crop_health || 0,
    }),
    [apiData, analysisResult, t]
  );

  const alerts = useMemo(() => {
    if (apiData?.suggestions && apiData.suggestions.length > 0) {
      return apiData.suggestions.map((msg, i) => ({
        id: i + 1,
        type: "system",
        message: msg,
        time: t("dashboard.alerts.timeToday"),
        critical: msg.includes("⚠️") || msg.includes("🔥"),
      }));
    }
    return [
      {
        id: 1,
        type: "moisture",
        message: t("dashboard.alerts.soilDepleted"),
        time: t("dashboard.alerts.timeMinsAgo"),
        critical: true,
      },
      {
        id: 2,
        type: "weather",
        message: t("dashboard.alerts.rainForecast"),
        time: t("dashboard.alerts.timeHoursAgo"),
        critical: false,
      },
      {
        id: 3,
        type: "solar",
        message: t("dashboard.alerts.batteryReplenished"),
        time: t("dashboard.alerts.timeToday"),
        critical: false,
      },
    ];
  }, [apiData, t]);

  const recommendation = useMemo(() => {
    if (!analysisResult?.recommendation) return null;
    return {
      description: analysisResult.recommendation.description || "",
      treatment: analysisResult.recommendation.treatment || [],
      prevention: analysisResult.recommendation.prevention || [],
    };
  }, [analysisResult]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const loadData = async () => {
      const now = Date.now();
      const shouldRefresh =
        !dashboardCache.timestamp || now - dashboardCache.timestamp > CACHE_EXPIRY_MS;

      if (!dashboardCache.data || shouldRefresh) {
        await fetchData();
      } else {
        setApiData(dashboardCache.data);
      }
      setIsLoading(false);
    };

    loadData();

    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`${apiUrl}/api/analyze-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: true }),
        credentials: "include",
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setApiData(data);
      dashboardCache = {
        data: data,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Fetch error:", error);
      if (!apiData) alert(`Failed to load data: ${error.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.includes("image")) {
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
        }
        const blob = items[i].getAsFile();
        setSelectedImage(blob);
        setPreviewImage(URL.createObjectURL(blob));
        setAnalysisResult(null);
        break;
      }
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch(`${apiUrl}/api/leaf-detect`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const result = await response.json();
      setAnalysisResult(result);
      sessionStorage.setItem("lastLeafAnalysis", JSON.stringify(result));

      const updatedData = {
        ...apiData,
        diseaseRisk: result.diseaseRisk,
        growthStage: result.growthStage,
        crop_health: result.healthScore,
        predictedClass: result.prediction,
        confidence: result.confidence,
      };

      setApiData(updatedData);
      dashboardCache = {
        data: updatedData,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysisResult({
        error: true,
        message: "Analysis failed. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setAnalysisResult(null);
    sessionStorage.removeItem("lastLeafAnalysis");

    setApiData((prev) => ({
      ...prev,
      diseaseRisk: 0,
      predictedClass: undefined,
      confidence: undefined,
    }));

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
  };

  const severity = useMemo(() => {
    const risk = cropHealth.diseaseRisk;
    if (risk === 0)
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-500/30",
        label: t("dashboard.severity.optimalHealth"),
      };
    if (risk < 30)
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-500/30",
        label: t("dashboard.severity.lowRisk"),
      };
    if (risk < 60)
      return {
        bg: "bg-orange-500/10",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-500/30",
        label: t("dashboard.severity.moderateRisk"),
      };
    return {
      bg: "bg-red-500/10",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-500/30",
      label: t("dashboard.severity.highRisk"),
    };
  }, [cropHealth.diseaseRisk, t]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100dvh-120px)] flex items-center justify-center p-4">
        <div className="glass-strong border border-slate-900/10 dark:border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <GlassSkeleton variant="circular" width="60px" height="60px" className="mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-950 dark:text-slate-50 mb-2">
            {t("dashboard.connectingTelemetry")}
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {t("dashboard.streamingIot")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* =========================================================================
          DASHBOARD HEADER & REAL-TIME CONTROLS
          ========================================================================= */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4" data-aos="fade-up">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="glass-pill px-3 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {t("dashboard.telemetryNode")}
            </span>
            <StatusBadge status="online" size="sm" label={t("dashboard.liveAtlasSync")} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <GlassButton
            variant="secondary"
            size="md"
            onClick={fetchData}
            isLoading={isFetching}
            icon={FiRefreshCw}
          >
            {isFetching ? t("dashboard.syncing") : t("dashboard.syncSensors")}
          </GlassButton>
        </div>
      </div>

      {/* =========================================================================
          KEY TELEMETRY METRIC WIDGETS (4-COLUMN GRID)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {/* Soil Moisture Card */}
        <Link to="/insights/soil" className="group">
          <motion.div
            whileHover={{ y: -3, transition: springSmooth }}
            className="glass-card p-5 rounded-3xl h-full flex flex-col justify-between"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
                <FiDroplet className="text-xl" />
              </div>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                {t("dashboard.insights")} <FiArrowRight />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t("dashboard.soilMoisture")}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-950 dark:text-slate-50">
                  {soilData.moisture}%
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">{t("dashboard.idealRange")}</span>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Solar Output Card */}
        <Link to="/insights/solar" className="group">
          <motion.div
            whileHover={{ y: -3, transition: springSmooth }}
            className="glass-card p-5 rounded-3xl h-full flex flex-col justify-between"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-800 dark:text-amber-400">
                <FiSun className="text-xl" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                {t("dashboard.insights")} <FiArrowRight />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t("dashboard.solarGeneration")}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-950 dark:text-slate-50">
                  {solarData.currentOutput}W
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">{solarData.dailyProduction} {t("dashboard.kwhPerDay")}</span>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Crop Health Card */}
        <Link to="/insights/crop" className="group">
          <motion.div
            whileHover={{ y: -3, transition: springSmooth }}
            className="glass-card p-5 rounded-3xl h-full flex flex-col justify-between"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-800 dark:text-teal-400">
                <FiImage className="text-xl" />
              </div>
              <span className="text-[11px] font-bold text-teal-800 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                {t("dashboard.insights")} <FiArrowRight />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t("dashboard.cropHealthIndex")}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-950 dark:text-slate-50">
                  {cropHealth.healthScore}
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">/ 100</span>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Active Alerts Card */}
        <Link to="/insights/system" className="group">
          <motion.div
            whileHover={{ y: -3, transition: springSmooth }}
            className="glass-card p-5 rounded-3xl h-full flex flex-col justify-between"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-800 dark:text-red-400">
                <FiAlertCircle className="text-xl" />
              </div>
              <span className="text-[11px] font-bold text-red-800 dark:text-red-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                {t("dashboard.system")} <FiArrowRight />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t("dashboard.activeAlerts")}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-950 dark:text-slate-50">
                  {alerts.length}
                </span>
                <span className="text-xs text-red-700 dark:text-red-400 font-bold">{t("dashboard.priorityItems")}</span>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* =========================================================================
          PRIMARY 2-COLUMN SECTION: LEAF SCANNER & TELEMETRY SYSTEMS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* LEFT / CENTER: LEAF SCANNER (DROPZONE + LASER BEAM) */}
        <div
          className="glass-card p-6 rounded-3xl flex flex-col justify-between"
          data-aos="fade-up"
          onPaste={handlePaste}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-950 dark:text-slate-50 flex items-center gap-2">
                <FiCamera className="text-emerald-700 dark:text-emerald-400" />
                {t("dashboard.aiFoliageDiagnosis")}
              </h2>
              <span className="glass-pill px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {t("dashboard.visionEngine")}
              </span>
            </div>

            {previewImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-900/10 dark:border-white/10 shadow-lg mb-4">
                <img
                  src={previewImage}
                  alt="Leaf Specimen Preview"
                  className="w-full h-56 object-cover select-none"
                />

                {/* Laser Scanning Radar Beam during upload / inference */}
                {isUploading && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laser-scan" />
                    <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px]" />
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-emerald-600/30 dark:border-emerald-500/30 rounded-2xl p-6 text-center mb-4 glass-subtle transition-colors hover:border-emerald-600">
                <div className="w-12 h-12 rounded-full glass mx-auto flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xl mb-3 shadow-inner">
                  <FiUpload />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t("dashboard.dropLeaf")}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 mb-4 font-medium">
                  {t("dashboard.orPaste")}
                </p>

                <label className="cursor-pointer">
                  <span className="glass-button glass-button-primary text-xs px-4 py-2">
                    {t("dashboard.browseSpecimen")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Action Row */}
          {previewImage && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={resetImage}
                disabled={isUploading}
                className="text-red-700 dark:text-red-400 font-bold"
              >
                {t("dashboard.clear")}
              </GlassButton>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={uploadImage}
                isLoading={isUploading}
                className="flex-1"
              >
                {isUploading ? t("dashboard.scanningLeaf") : t("dashboard.runDiagnosis")}
              </GlassButton>
            </div>
          )}
        </div>

        {/* RIGHT: REAL-TIME SENSORY TELEMETRY */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-2" data-aos="fade-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-950 dark:text-slate-50 flex items-center gap-2">
              <FiBarChart2 className="text-emerald-700 dark:text-emerald-400" />
              {t("dashboard.soilMicroclimate")}
            </h2>
            <Link to="/insights/soil">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline">
                {t("dashboard.viewGraphs")} &rarr;
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            <div className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                {t("dashboard.temperature")}
              </p>
              <p className="text-2xl font-black text-slate-950 dark:text-slate-50 mt-1">
                {soilData.temperature}°C
              </p>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">{t("dashboard.ambientSensor")}</span>
            </div>

            <div className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                {t("dashboard.relativeHumidity")}
              </p>
              <p className="text-2xl font-black text-slate-950 dark:text-slate-50 mt-1">
                {soilData.humidity}%
              </p>
              <span className="text-[10px] text-sky-800 dark:text-sky-400 font-bold">{t("dashboard.vaporBalance")}</span>
            </div>

            <div className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                {t("dashboard.soilPh")}
              </p>
              <p className="text-2xl font-black text-slate-950 dark:text-slate-50 mt-1">
                {soilData.pH}
              </p>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">{t("dashboard.neutralAlkalinity")}</span>
            </div>

            <div className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                {t("dashboard.moistureReserve")}
              </p>
              <p className="text-2xl font-black text-slate-950 dark:text-slate-50 mt-1">
                {soilData.moisture}%
              </p>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">{t("dashboard.volumetricWater")}</span>
            </div>
          </div>

          {/* Clean Energy & Solar Telemetry Breakdown */}
          <div className="p-4 rounded-2xl glass-subtle border border-slate-900/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center text-lg">
                <FiSun />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-950 dark:text-slate-100">
                  {t("dashboard.solarArrayHealth")}: {solarData.efficiency}% {t("dashboard.efficiency")}
                </p>
                <p className="text-[11px] text-slate-700 dark:text-slate-400 font-medium">
                  {t("dashboard.batteryStorage")}: {solarData.batteryLevel}% {t("dashboard.charged")}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-48 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${solarData.batteryLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DIAGNOSIS RECOMMENDATION CARD (INTERACTIVE SEGMENTED TABS)
          ========================================================================= */}
      <div className="glass-card p-6 md:p-8 rounded-3xl mb-8" data-aos="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/50 dark:border-white/10">
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-slate-50 tracking-tight flex items-center gap-2">
              <FiClipboard className="text-emerald-700 dark:text-emerald-400" />
              {t("dashboard.diagnosisPrescriptions")}
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
              {t("dashboard.treatmentStepsDesc")}
            </p>
          </div>

          {/* iOS Segmented Control Tabs */}
          {recommendation && (
            <div className="glass-pill p-1 flex items-center gap-1 select-none self-start sm:self-auto">
              {["overview", "treatment", "prevention"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-3.5 py-1 text-xs font-bold capitalize rounded-full transition-all cursor-pointer ${
                    activeTab === tab
                      ? "text-emerald-950 dark:text-emerald-100 font-extrabold"
                      : "text-slate-700 dark:text-slate-400 hover:text-slate-950 font-bold"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="rec-tab-pill"
                      transition={springSmooth}
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-full shadow-sm border border-slate-900/10 dark:border-white/10 -z-10"
                    />
                  )}
                  {t(`dashboard.tabsLabel.${tab}`) || tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {recommendation ? (
          <div className="space-y-6">
            {/* Specimen Detection Banner */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${severity.bg} ${severity.border}`}
            >
              <div className="flex items-center gap-3">
                <FiActivity className={`text-2xl shrink-0 ${severity.text}`} />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                    {t("dashboard.detectedPathogen")}
                  </p>
                  <p className={`text-base font-extrabold ${severity.text}`}>
                    {analysisResult?.prediction?.replace(/___/g, " — ").replace(/_/g, " ") ||
                      t("dashboard.specimenAnalyzed")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <StatusBadge
                  status={cropHealth.diseaseRisk > 50 ? "danger" : "online"}
                  label={severity.label}
                  size="md"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t("dashboard.confidence")}:{" "}
                  {analysisResult?.confidence
                    ? `${Math.round(analysisResult.confidence * 100)}%`
                    : "94%"}
                </span>
              </div>
            </div>

            {/* TAB CONTENT */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div className="glass-subtle p-5 rounded-2xl border border-slate-900/10 dark:border-white/10 flex items-start gap-3">
                    <FiInfo className="text-emerald-700 dark:text-emerald-400 text-lg shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-1">
                        {t("dashboard.diseaseSummary")}
                      </h4>
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                        {recommendation.description ||
                          t("dashboard.defaultSummary")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {t("dashboard.growthStage")}
                      </p>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                        {cropHealth.growthStage}
                      </p>
                    </div>
                    <div className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {t("dashboard.inspectionTimestamp")}
                      </p>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                        {cropHealth.lastScan}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "treatment" && (
                <motion.div
                  key="treatment"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  {recommendation.treatment.length > 0 ? (
                    recommendation.treatment.map((step, idx) => (
                      <div
                        key={idx}
                        className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {step}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 glass-subtle rounded-2xl border border-slate-900/10 dark:border-white/10">
                      <FiCheckCircle className="text-3xl text-emerald-700 dark:text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {t("dashboard.noTreatmentRequired")}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "prevention" && (
                <motion.div
                  key="prevention"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  {recommendation.prevention.length > 0 ? (
                    recommendation.prevention.map((tip, idx) => (
                      <div
                        key={idx}
                        className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10 flex items-start gap-3"
                      >
                        <FiShield className="text-emerald-700 dark:text-emerald-400 text-base shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {tip}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 glass-subtle rounded-2xl border border-slate-900/10 dark:border-white/10">
                      <FiCheckCircle className="text-3xl text-emerald-700 dark:text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {t("dashboard.maintainIrrigation")}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 glass-subtle rounded-2xl border border-slate-900/10 dark:border-white/10">
            <div className="w-16 h-16 rounded-full glass mx-auto flex items-center justify-center text-slate-600 dark:text-slate-400 text-2xl mb-3 shadow-inner">
              <FiClipboard />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {t("dashboard.noDiagnosis")}
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 max-w-sm mx-auto font-medium">
              {t("dashboard.uploadPrompt")}
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          BOTTOM SYSTEM ALERTS & HARDWARE STATUS
          ========================================================================= */}
      <div className="glass-card p-6 rounded-3xl" data-aos="fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-950 dark:text-slate-50 flex items-center gap-2">
            <FiAlertCircle className="text-amber-700 dark:text-amber-400" />
            {t("dashboard.telemetryNotifications")}
          </h2>
          <Link to="/insights/system">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline">
              {t("dashboard.inspectSensors")} &rarr;
            </span>
          </Link>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                alert.critical
                  ? "bg-red-500/10 border-red-500/30 text-red-950 dark:text-red-200"
                  : "glass-subtle border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${alert.critical ? "bg-red-600" : "bg-emerald-600"}`} />
                <p className="text-xs sm:text-sm font-semibold">{alert.message}</p>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold shrink-0">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
