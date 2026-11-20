import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaLeaf, FaSun, FaCloudRain, FaBolt, FaArrowRight } from "react-icons/fa6";
import { Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/authContext";
import AnimatedLogo from "../components/AnimatedLogo";
import { useTranslation } from "react-i18next";
import GlassButton from "../components/ui/GlassButton";
import StatusBadge from "../components/ui/StatusBadge";
import { springSmooth } from "../constants/motion";

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  const featureCards = [
    {
      icon: FaLeaf,
      title: t("home.features.crop.title"),
      desc: t("home.features.crop.desc"),
      glow: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-700 dark:text-emerald-400",
      tag: "AI Diagnostic",
    },
    {
      icon: FaSun,
      title: t("home.features.solar.title"),
      desc: t("home.features.solar.desc"),
      glow: "from-amber-500/20 to-yellow-500/10",
      iconColor: "text-amber-700 dark:text-amber-400",
      tag: "Clean Energy",
    },
    {
      icon: FaCloudRain,
      title: t("home.features.weather.title"),
      desc: t("home.features.weather.desc"),
      glow: "from-sky-500/20 to-blue-500/10",
      iconColor: "text-sky-700 dark:text-sky-400",
      tag: "Microclimate",
    },
    {
      icon: FaBolt,
      title: t("home.features.dashboard.title"),
      desc: t("home.features.dashboard.desc"),
      glow: "from-teal-500/20 to-emerald-500/10",
      iconColor: "text-teal-700 dark:text-teal-400",
      tag: "Telemetry Hub",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-24 max-w-7xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-14">
          {/* Left Text Column */}
          <div className="w-full lg:w-7/12 text-center lg:text-left z-10" data-aos="fade-right">
            {/* Liquid Pill Badge */}
            <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 mb-6 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              <Sparkles className="text-emerald-600 dark:text-emerald-400 text-xs animate-pulse" size={14} />
              <span>Autonomous Precision Agriculture & Clean Solar</span>
              <StatusBadge status="online" size="sm" label="Live IoT" />
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-[1.12]">
              {t("home.title")}
            </h1>

            <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-800 dark:text-slate-200 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t("home.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start w-full sm:w-auto">
              <GlassButton
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
                icon={FaArrowRight}
                className="w-full sm:w-auto"
              >
                {isAuthenticated ? t("home.goDashboard") : t("home.getStarted")}
              </GlassButton>

              <a href="#features" className="w-full sm:w-auto">
                <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto">
                  {t("home.learnMore")}
                </GlassButton>
              </a>
            </div>

            {/* Quick Micro-Stats Bar */}
            <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">98.4%</p>
                <p className="text-xs text-slate-700 dark:text-slate-400 font-semibold">Model Precision</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400">3.4 kW</p>
                <p className="text-xs text-slate-700 dark:text-slate-400 font-semibold">Peak Solar Yield</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-sky-700 dark:text-sky-400">&lt;50ms</p>
                <p className="text-xs text-slate-700 dark:text-slate-400 font-semibold">Telemetry Latency</p>
              </div>
            </div>
          </div>

          {/* Right Lottie Pedestal */}
          <div className="w-full lg:w-5/12 flex justify-center lg:justify-end z-10" data-aos="fade-left">
            <motion.div
              whileHover={{ y: -4, transition: springSmooth }}
              className="relative w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] lg:w-[380px] lg:h-[380px] rounded-[36px] glass-strong border border-white/80 dark:border-white/15 p-6 flex items-center justify-center shadow-2xl backdrop-blur-2xl"
            >
              {/* Radial specular spotlight */}
              <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent rounded-[36px] pointer-events-none" />
              <AnimatedLogo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BENTO GRID FEATURES SECTION
          ========================================================================= */}
      <section id="features" className="py-16 sm:py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" data-aos="fade-up">
            <span className="glass-pill px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 inline-block mb-3">
              Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              {t("home.featuresTitle")}
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" data-aos="fade-up">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, transition: springSmooth }}
                  className="glass-card relative overflow-hidden p-6 rounded-3xl flex flex-col justify-between group"
                >
                  {/* Subtle top background glow */}
                  <div
                    className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feat.glow} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-xl shadow-inner">
                        <Icon className={feat.iconColor} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 glass-pill px-2.5 py-0.5">
                        {feat.tag}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                      {feat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore Metric</span>
                    <FaArrowRight className="text-[10px]" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          LIQUID GLASS CTA BANNER
          ========================================================================= */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative z-10" data-aos="fade-up">
        <div className="max-w-4xl mx-auto glass-strong border border-emerald-500/30 rounded-[36px] p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
          {/* Internal ambient aura */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/15 via-teal-500/10 to-green-600/15 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-4">
              {t("home.cta.title")}
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-800 dark:text-slate-200 font-medium max-w-xl mx-auto mb-8 leading-relaxed">
              {t("home.cta.subtitle")}
            </p>

            <Link to="/contact">
              <GlassButton variant="primary" size="lg" icon={FaArrowRight}>
                {t("home.cta.button")}
              </GlassButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
