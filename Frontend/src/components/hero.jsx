// src/components/Hero.jsx
const Hero = () => {
  return (
    <section className="w-full h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-green-50 to-green-100 pt-20">
      <h1 className="text-4xl md:text-6xl font-extrabold text-green-700">
        Smart Agro-Solar Platform
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-xl">
        AI-powered crop monitoring and solar energy optimization for the future of farming.
      </p>
      <button className="mt-6 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition">
        Get Started
      </button>
    </section>
  );
};

export default Hero;
