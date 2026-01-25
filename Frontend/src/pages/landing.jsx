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
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");   // already logged in
    } else {
      navigate("/signup");      // new user
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7e9] to-[#f2f2f2] text-gray-800 overflow-x-hidden">

      {/* Hero Section */}
      <section 
        className="relative flex flex-col-reverse md:flex-row items-center justify-between px-6 sm:px-10 py-20 max-w-7xl mx-auto overflow-hidden"
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        {/* Decorative blob */}
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-green-300 opacity-30 rounded-full mix-blend-multiply blur-xl animate-pulse z-0"
          style={{ 
            transform: 'translate3d(0,0,0)',
            willChange: 'transform, opacity'
          }}
        ></div>

        <div className="md:w-1/2 text-center md:text-left z-10" data-aos="fade-right">
          <h1 className="text-4xl md:text-6xl font-extrabold text-green-700 leading-tight drop-shadow-md">
            {t("home.title")}
          </h1>

          <p className="mt-4 text-lg md:text-xl text-gray-700 font-medium">
            {t("home.subtitle")}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={handleGetStarted}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition duration-300 font-semibold text-center"
            >
              {isAuthenticated ? t("home.goDashboard") : t("home.getStarted")}
            </button>

            <a 
              href="#features" 
              className="px-6 py-3 border border-green-600 text-green-700 hover:bg-green-50 rounded-full transition font-medium"
            >
              {t("home.learnMore")}
            </a>
          </div>
        </div>

        <div className="md:w-1/2 mb-10 md:mb-0 z-10" data-aos="fade-left">
          <div className="w-[300px] h-[300px] mx-auto md:ml-[180px] rounded-3xl shadow-xl overflow-hidden">
            <AnimatedLogo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-14 text-green-700"
            data-aos="zoom-in"
          >
            {t("home.featuresTitle")}
          </h2>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4" data-aos="fade-up">
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
        className="py-20 bg-gradient-to-r from-green-500 to-green-600 text-white text-center" 
        data-aos="fade-up"
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          {t("home.cta.title")}
        </h2>
        <p className="text-lg md:text-xl mb-6">
          {t("home.cta.subtitle")}
        </p>
        <Link
          to="/Contact"
          className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-gray-100 transition"
        >
          {t("home.cta.button")}
        </Link>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition duration-300 text-center">
    <div className="text-green-600 text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    <p className="text-gray-600 mt-2 text-sm">{desc}</p>
  </div>
);

export default Home;
