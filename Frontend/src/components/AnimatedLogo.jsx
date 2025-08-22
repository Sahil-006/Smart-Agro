import Lottie from "lottie-react";
import animationData from "../assets/logo.json";

const AnimatedLogo = () => (
  <Lottie animationData={animationData} loop={true} />
);

export default AnimatedLogo;