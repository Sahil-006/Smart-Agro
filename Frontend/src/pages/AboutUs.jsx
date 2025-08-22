import React, { useEffect, useRef, useState } from 'react';
import shabbirImg from '../assets/shabbir.jpg';
import sahilImg from '../assets/sahil.jpg';
import tahirImg from '../assets/tahirdon.jpg';
import ykImg from '../assets/yk.jpg';
import AkashDaveImg from '../assets/akashdave.jpg';

const AboutUs = () => {
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
        rootMargin: '-100px 0px -100px 0px',
        threshold: 0.1
      }
    );

    elementsRef.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
      elementsRef.current.forEach(el => {
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
    <div className="font-sans text-[#111] bg-[#ecfdf5] overflow-x-hidden min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-[#d1fae5] text-center py-24 px-6 min-h-[70vh] flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, #bbf7d0, #ecfdf5)',
          transform: 'translate3d(0,0,0)',
          willChange: 'transform'
        }}
      >
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 
            ref={el => addToRefs(el, 'title')}
            className={`text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#16a34a] mb-4 transition-all duration-1000 ease-out ${
              visibleElements['title'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            About Smart Agro-Solar
          </h1>
          <p 
            ref={el => addToRefs(el, 'subtitle')}
            className={`text-lg md:text-xl text-[#444] max-w-2xl mx-auto transition-all duration-1000 ease-out delay-200 ${
              visibleElements['subtitle'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            Harnessing the power of AI and IoT to revolutionize farming efficiency and sustainability.
          </p>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-20 px-6 bg-[#ecfdf5]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          {[
            {
              id: 'mission',
              title: "Our Mission",
              desc: "To empower farmers with intelligent crop monitoring and solar energy optimization tools for a greener future.",
            },
            {
              id: 'vision',
              title: "Our Vision",
              desc: "A future where technology and agriculture work together to solve climate and food challenges.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              ref={el => addToRefs(el, item.id)}
              className={`bg-white bg-opacity-60 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-xl transition-all duration-700 ease-out ${
                visibleElements[item.id] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transform: 'translate3d(0,0,0)', willChange: 'transform, opacity' }}
            >
              <h3 className="text-2xl font-bold text-[#16a34a] mb-2">{item.title}</h3>
              <p className="text-[#333]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-10 text-center">
          {[
            { id: 'farmers', label: "Farmers Helped", value: 1200 },
            { id: 'crops', label: "Crops Monitored", value: 4300 },
            { id: 'energy', label: "Energy Saved (kWh)", value: 8600 },
          ].map((stat, idx) => (
            <div 
              key={idx} 
              ref={el => addToRefs(el, stat.id)}
              className={`p-6 bg-[#d1fae5] rounded-xl shadow-md transition-all duration-700 ease-out ${
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
              <h2 className="text-4xl font-bold text-[#16a34a]">{stat.value}+</h2>
              <p className="text-[#444] mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-[#ecfdf5]">
        <h2 
          ref={el => addToRefs(el, 'journey-title')}
          className={`text-3xl font-bold text-center text-[#16a34a] mb-12 transition-all duration-700 ease-out ${
            visibleElements['journey-title'] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          Our Journey
        </h2>
        <div className="relative max-w-4xl mx-auto">
          {[
            { id: '2023', year: "2023", event: "Started the idea of Smart Agro-Solar" },
            { id: '2024', year: "2024", event: "Built MVP and tested with local farms" },
            { id: '2025', year: "2025", event: "Launched full platform with AI dashboard" },
          ].map((item, idx) => (
            <div key={idx} className={`mb-10 flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div
                ref={el => addToRefs(el, item.id)}
                className={`bg-white bg-opacity-60 backdrop-blur-lg border border-white/40 px-6 py-4 rounded-xl w-80 shadow-lg transition-all duration-700 ease-out ${
                  visibleElements[item.id] 
                    ? 'opacity-100 translate-x-0' 
                    : idx % 2 === 0 ? 'opacity-0 -translate-x-20' : 'opacity-0 translate-x-20'
                }`}
                style={{ 
                  transform: 'translate3d(0,0,0)', 
                  willChange: 'transform, opacity',
                  transitionDelay: `${idx * 200}ms`
                }}
              >
                <h3 className="text-xl font-semibold text-[#16a34a]">{item.year}</h3>
                <p className="text-[#444]">{item.event}</p>
              </div>
            </div>
          ))}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#16a34a]/30 rounded-full"
            style={{ transform: 'translate3d(-50%,0,0)' }}
          ></div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <h2 
          ref={el => addToRefs(el, 'team-title')}
          className={`text-3xl font-bold text-center text-[#16a34a] mb-12 transition-all duration-700 ease-out ${
            visibleElements['team-title'] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          Meet the Team
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {[
            {
              id: 'shabbir',
              name: "Shabbir Shaikh",
              role: "Frontend Developer",
              img: shabbirImg,
            },
            {
              id: 'sahil',
              name: "Sahil Shaikh",
              role: "Backend Developer",
              img: sahilImg,
            },
            {
              id: 'tahir',
              name: "TAHIR MIYA ",
              role: "IoT Specialist",
              img: tahirImg,
            },
            {
              id: 'yash',
              name: "Yash Kulkarni",
              role: "IoT Specialist",
              img: ykImg, 
            },
            {
              id: 'aakash',
              name: "Dr Aakash Dave",
              role: "Mentor and Researcher",
              img: AkashDaveImg, 
            },
          ].map((person, i) => (
            <div
              key={i}
              ref={el => addToRefs(el, person.id)}
              className={`bg-[#d1fae5] rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-700 ease-out ${
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
                className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-4 border-[#bbf7d0]"
                style={{ transform: 'translate3d(0,0,0)' }}
              />
              <h3 className="text-lg font-semibold text-center text-[#16a34a]">{person.name}</h3>
              <p className="text-sm text-gray-600 text-center">{person.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-[#16a34a] text-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2023 Smart Agro-Solar System. All rights reserved.</p>
          <p className="mt-2 text-white/80 text-sm">
            Sustainable farming solutions for the modern age
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;