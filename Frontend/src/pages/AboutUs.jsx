import React, { useEffect, useRef, useState } from 'react';
import shabbirImg from '../assets/shabbir.jpg';
import sahilImg from '../assets/sahil.jpg';
import tahirImg from '../assets/tahirdon.jpg';
import ykImg from '../assets/yk.jpg';
import sunitImg from '../assets/sunit.jpg';
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();
  const [visibleElements, setVisibleElements] = useState({});
  const elementsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => ({
              ...prev,
              [entry.target.dataset.id]: true
            }));
          } else {
            setVisibleElements(prev => ({
              ...prev,
              [entry.target.dataset.id]: false
            }));
          }
        });
      },
      {
        rootMargin: '-50px 0px -50px 0px',
        threshold: 0.1
      }
    );

    const currentElements = elementsRef.current;
    currentElements.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
      currentElements.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const addToRefs = (el, id) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
      el.dataset.id = id;
    }
  };

  return (
    <div className="font-sans text-[#111] bg-[#ecfdf5] overflow-x-hidden min-h-screen w-full">
      {/* Hero Section */}
      <section 
        className="relative bg-[#d1fae5] text-center pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 min-h-[50vh] sm:min-h-[70vh] flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, #bbf7d0, #ecfdf5)',
          transform: 'translate3d(0,0,0)',
          willChange: 'transform'
        }}
      >
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 
            ref={el => addToRefs(el, 'title')}
            className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#16a34a] mb-4 transition-all duration-1000 ease-out ${
              visibleElements['title'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            {t("about.title")}
          </h1>
          <p 
            ref={el => addToRefs(el, 'subtitle')}
            className={`text-base sm:text-lg md:text-xl text-[#444] max-w-2xl mx-auto transition-all duration-1000 ease-out delay-200 ${
              visibleElements['subtitle'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-[#ecfdf5]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          {[
            {
              id: 'mission',
              title: t("about.missionTitle"),
              desc: t("about.missionDesc"),
            },
            {
              id: 'vision',
              title: t("about.visionTitle"),
              desc: t("about.visionDesc"),
            },
          ].map((item, idx) => (
            <div
              key={idx}
              ref={el => addToRefs(el, item.id)}
              className={`bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-700 ease-out ${
                visibleElements[item.id] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transform: 'translate3d(0,0,0)', willChange: 'transform, opacity' }}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-[#16a34a] mb-2">{item.title}</h3>
              <p className="text-[#333] text-sm sm:text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 text-center">
          {[
            { id: 'farmers', label: t("about.stats.farmers"), value: 1200 },
            { id: 'crops', label: t("about.stats.crops"), value: 4300 },
            { id: 'energy', label: t("about.stats.energy"), value: 8600 },
          ].map((stat, idx) => (
            <div 
              key={idx} 
              ref={el => addToRefs(el, stat.id)}
              className={`p-5 sm:p-6 bg-[#d1fae5] rounded-xl shadow-md transition-all duration-700 ease-out ${
                visibleElements[stat.id] 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-90'
              }`}
              style={{ 
                transform: 'translate3d(0,0,0)', 
                willChange: 'transform, opacity',
                transitionDelay: `${idx * 150}ms`
              }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#16a34a]">{stat.value}+</h2>
              <p className="text-[#444] mt-2 font-medium text-sm sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 bg-[#ecfdf5] overflow-hidden">
        <h2 
          ref={el => addToRefs(el, 'journey-title')}
          className={`text-2xl sm:text-3xl font-bold text-center text-[#16a34a] mb-10 sm:mb-14 transition-all duration-700 ease-out ${
            visibleElements['journey-title'] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          {t("about.journeyTitle")}
        </h2>
        
        {/* Responsive Timeline Container:
            On mobile: left-aligned timeline with vertical line on left (left-4 sm:left-6)
            On desktop (md:): centered timeline with alternating cards around center line
        */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line: left-aligned on mobile, centered on md: */}
          <div 
            className="absolute top-0 left-4 sm:left-6 md:left-1/2 md:-translate-x-1/2 h-full w-1 bg-[#16a34a]/30 rounded-full"
            style={{ transform: 'translate3d(0,0,0)' }}
          ></div>

          {[
            { id: '2023', year: "2023", event: t("about.journey.2023") },
            { id: '2024', year: "2024", event: t("about.journey.2024") },
            { id: '2025', year: "2025", event: t("about.journey.2025") },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`mb-8 sm:mb-10 pl-10 sm:pl-14 md:pl-0 flex ${
                idx % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
              }`}
            >
              <div
                ref={el => addToRefs(el, item.id)}
                className={`bg-white/90 backdrop-blur-lg border border-white/60 p-5 sm:p-6 rounded-2xl w-full md:w-80 shadow-lg transition-all duration-700 ease-out relative ${
                  visibleElements[item.id] 
                    ? 'opacity-100 translate-x-0' 
                    : idx % 2 === 0 ? 'opacity-0 -translate-x-10 md:-translate-x-20' : 'opacity-0 translate-x-10 md:translate-x-20'
                }`}
                style={{ 
                  transform: 'translate3d(0,0,0)', 
                  willChange: 'transform, opacity',
                  transitionDelay: `${idx * 200}ms`
                }}
              >
                {/* Node dot on line for mobile */}
                <div className="md:hidden absolute -left-10 sm:-left-14 top-6 w-3.5 h-3.5 rounded-full bg-[#16a34a] border-2 border-white shadow"></div>
                
                <h3 className="text-xl font-bold text-[#16a34a] mb-1">{item.year}</h3>
                <p className="text-[#444] text-sm leading-relaxed">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-14 sm:py-20 bg-white px-4 sm:px-6">
        <h2 
          ref={el => addToRefs(el, 'team-title')}
          className={`text-2xl sm:text-3xl font-bold text-center text-[#16a34a] mb-10 sm:mb-14 transition-all duration-700 ease-out ${
            visibleElements['team-title'] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
         {t("about.teamTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 max-w-6xl mx-auto">
          {[
            {
              id: 'shabbir',
              name: "Shabbir Shaikh",
              role: t("about.roles.frontend"),
              img: shabbirImg,
            },
            {
              id: 'sahil',
              name: "Sahil Shaikh",
              role: t("about.roles.backend"),
              img: sahilImg,
            },
            {
              id: 'tahir',
              name: "TAHIR MIYA ",
              role: t("about.roles.iot"),
              img: tahirImg,
            },
            {
              id: 'yash',
              name: "Yash Kulkarni",
              role: t("about.roles.iot"),
              img: ykImg, 
            },
            {
              id: 'sunit',
              name: "Prof. Sunit Parmar",
              role: t("about.roles.mentor"),
              img: sunitImg, 
            },
          ].map((person, i) => (
            <div
              key={i}
              ref={el => addToRefs(el, person.id)}
              className={`bg-[#d1fae5] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-700 ease-out flex flex-col items-center text-center ${
                visibleElements[person.id] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ 
                transform: 'translate3d(0,0,0)',
                willChange: 'transform, opacity, box-shadow',
                transitionDelay: `${i * 100}ms`
              }}
            >
              <img
                src={person.img}
                alt={person.name}
                loading="lazy"
                className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-4 border-[#bbf7d0] shadow-sm"
                style={{ transform: 'translate3d(0,0,0)' }}
              />
              <h3 className="text-lg font-bold text-[#16a34a]">{person.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{person.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Tagline Banner */}
      <div className="py-8 bg-[#16a34a] text-white text-center px-4">
        <div className="max-w-4xl mx-auto">
          <p className="font-semibold text-base sm:text-lg">{t("about.footer.rights")}</p>
          <p className="mt-1 text-white/80 text-xs sm:text-sm">
           {t("about.footer.tagline")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
