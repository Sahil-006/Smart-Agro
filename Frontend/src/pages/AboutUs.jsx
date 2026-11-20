import shabbirImg from "../assets/shabbir.jpg";
import sahilImg from "../assets/sahil.jpg";
import tahirImg from "../assets/tahirdon.jpg";
import ykImg from "../assets/yk.jpg";
import sunitImg from "../assets/sunit.jpg";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaLeaf, FaSun } from "react-icons/fa6";
import StatusBadge from "../components/ui/StatusBadge";
import { springSmooth } from "../constants/motion";

export function AboutUs() {
  const { t } = useTranslation();

  const teamMembers = [
    { id: "shabbir", name: "Shabbir Shaikh", role: t("about.roles.frontend"), img: shabbirImg },
    { id: "sahil", name: "Sahil Shaikh", role: t("about.roles.backend"), img: sahilImg },
    { id: "tahir", name: "Tahir Miya", role: t("about.roles.iot"), img: tahirImg },
    { id: "yash", name: "Yash Kulkarni", role: t("about.roles.iot"), img: ykImg },
    { id: "sunit", name: "Prof. Sunit Parmar", role: t("about.roles.mentor"), img: sunitImg },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="text-center py-12 sm:py-20 relative">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass-pill px-4 py-1 mb-6 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
            <FaLeaf className="text-emerald-600 text-xs" />
            <span>Mission & Vision</span>
            <StatusBadge status="online" size="sm" label="Agritech Innovation" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-slate-50 tracking-tight leading-tight mb-5">
            {t("about.title")}
          </h1>

          <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* =========================================================================
          MISSION & VISION CARDS
          ========================================================================= */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <motion.div
            whileHover={{ y: -4, transition: springSmooth }}
            className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-900/10 dark:border-white/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xl mb-4">
              <FaLeaf />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-slate-100 mb-2">
              {t("about.missionTitle")}
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {t("about.missionDesc")}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: springSmooth }}
            className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-900/10 dark:border-white/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-700 dark:text-amber-400 text-xl mb-4">
              <FaSun />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-slate-100 mb-2">
              {t("about.visionTitle")}
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {t("about.visionDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          STATS CARDS
          ========================================================================= */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { label: t("about.stats.farmers"), value: "1,200+" },
            { label: t("about.stats.crops"), value: "4,300+" },
            { label: t("about.stats.energy"), value: "8,600+ kWh" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl text-center border border-slate-900/10 dark:border-white/10">
              <h2 className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400">
                {stat.value}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          JOURNEY TIMELINE
          ========================================================================= */}
      <section className="mb-20">
        <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-950 dark:text-slate-50 mb-12">
          {t("about.journeyTitle")}
        </h2>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute top-0 left-4 sm:left-6 md:left-1/2 md:-translate-x-1/2 h-full w-0.5 bg-emerald-500/30 rounded-full" />

          {[
            { year: "2023", event: t("about.journey.2023") },
            { year: "2024", event: t("about.journey.2024") },
            { year: "2025", event: t("about.journey.2025") },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`mb-8 pl-10 sm:pl-14 md:pl-0 flex ${
                idx % 2 === 0 ? "md:justify-start" : "md:justify-end"
              }`}
            >
              <div className="glass-card p-5 sm:p-6 rounded-3xl w-full md:w-80 relative border border-slate-900/10 dark:border-white/10">
                <div className="md:hidden absolute -left-10 sm:-left-14 top-6 w-3 h-3 rounded-full bg-emerald-600 shadow-sm" />
                <span className="glass-pill px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2 inline-block">
                  {item.year}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {item.event}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          TEAM MEMBERS
          ========================================================================= */}
      <section className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-950 dark:text-slate-50 mb-12">
          {t("about.teamTitle")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {teamMembers.map((person, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, transition: springSmooth }}
              className="glass-card rounded-3xl p-6 text-center flex flex-col items-center border border-slate-900/10 dark:border-white/10"
            >
              <div className="relative mb-4">
                <img
                  src={person.img}
                  alt={person.name}
                  loading="lazy"
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-white/60 dark:border-white/10 shadow-lg"
                />
              </div>
              <h3 className="text-base font-bold text-slate-950 dark:text-slate-100">
                {person.name}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-400 font-semibold mt-0.5">
                {person.role}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
