import Lottie from "lottie-react";
import animationData from "../assets/logo.json";

// Support both ESM default export and CJS module interop
const LottieComponent = typeof Lottie === "function" ? Lottie : Lottie?.default;

const AnimatedLogo = () => {
  if (typeof LottieComponent === "function") {
    return (
      <LottieComponent
        animationData={animationData}
        loop={true}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-green-600 font-bold p-4 text-center">
      <span className="text-5xl">🌱</span>
      <span className="text-xl mt-2 font-black tracking-wide text-green-700">Smart-Agro</span>
    </div>
  );
};

export default AnimatedLogo;
