import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaLeaf, FaSun, FaCloudRain, FaBolt } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import AnimatedLogo from '../components/AnimatedLogo';
import { useTranslation } from "react-i18next";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");   // already logged in
    } else {
      navigate("/signup");      // new user
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7e9] to-[#f2f2f2] text-gray-800 overflow-x-hidden w-full">

      {/* Hero Section */}
      <section 
        className="relative flex flex-col-reverse md:flex-row items-center justify-between px-4 sm:px-8 lg:px-12 pt-28 sm:pt-36 pb-14 sm:pb-20 max-w-7xl mx-auto overflow-hidden"
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        {/* Decorative blob */}
        <div 
          className="absolute -top-40 -left-40 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-green-300 opacity-30 rounded-full mix-blend-multiply blur-xl animate-pulse z-0 pointer-events-none"
          style={{ 
            transform: 'translate3d(0,0,0)',
            willChange: 'transform, opacity'
          }}
        ></div>

        <div className="w-full md:w-1/2 text-center md:text-left z-10 mt-8 md:mt-0" data-aos="fade-right">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-green-700 leading-tight drop-shadow-md">
            {t("home.title")}
          </h1>

          <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-700 font-medium max-w-xl mx-auto md:mx-0">
            {t("home.subtitle")}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start w-full sm:w-auto">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition duration-300 font-semibold text-center flex items-center justify-center cursor-pointer active:scale-98"
            >
              {isAuthenticated ? t("home.goDashboard") : t("home.getStarted")}
            </button>

            <a 
              href="#features" 
              className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-full transition font-semibold text-center flex items-center justify-center cursor-pointer active:scale-98"
            >
              {t("home.learnMore")}
            </a>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center md:justify-end z-10" data-aos="fade-left">
          <div className="w-[220px] h-[220px] xs:w-[260px] xs:h-[260px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] max-w-full rounded-3xl shadow-xl overflow-hidden bg-white/40 backdrop-blur-sm p-2 flex items-center justify-center">
            <AnimatedLogo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14 sm:py-20 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-14 text-green-700"
            data-aos="zoom-in"
          >
            {t("home.featuresTitle")}
          </h2>

          <div className="grid gap-5 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" data-aos="fade-up">
            <FeatureCard
              icon={<FaLeaf />}
              title={t("home.features.crop.title")}
              desc={t("home.features.crop.desc")}
            />
            <FeatureCard
              icon={<FaSun />}
              title={t("home.features.solar.title")}
              desc={t("home.features.solar.desc")}
            />
            <FeatureCard
              icon={<FaCloudRain />}
              title={t("home.features.weather.title")}
              desc={t("home.features.weather.desc")}
            />
            <FeatureCard
              icon={<FaBolt />}
              title={t("home.features.dashboard.title")}
              desc={t("home.features.dashboard.desc")}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        className="py-14 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-green-600 text-white text-center" 
        data-aos="fade-up"
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            {t("home.cta.title")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 text-green-50 max-w-2xl mx-auto">
            {t("home.cta.subtitle")}
          </p>
          <Link
            to="/Contact"
            className="inline-flex items-center justify-center w-full sm:w-auto bg-white text-green-600 px-8 py-3.5 min-h-[44px] rounded-full font-bold shadow-md hover:bg-gray-100 transition active:scale-98"
          >
            {t("home.cta.button")}
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white border border-gray-100 sm:border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition duration-300 text-center flex flex-col items-center">
    <div className="text-green-600 text-4xl sm:text-5xl mb-3 sm:mb-4">{icon}</div>
    <h3 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h3>
    <p className="text-gray-600 mt-2 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Home;
