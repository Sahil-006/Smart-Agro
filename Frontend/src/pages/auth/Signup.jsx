import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    village: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  /* ---------------- MOCK LOCATION DATA ---------------- */
  const locationData = {
    Gujarat: {
      Ahmedabad: ["Village1", "Village2"],
      Surat: ["Village3", "Village4"],
    },
    Maharashtra: {
      Pune: ["Village5", "Village6"],
      Nagpur: ["Village7", "Village8"],
    },
  };

  const states = Object.keys(locationData);
  const districts = formData.state ? Object.keys(locationData[formData.state]) : [];
  const villages = formData.district
    ? locationData[formData.state][formData.district]
    : [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ---------------- PASSWORD RULES ---------------- */
  const passwordRules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  /* ---------------- VALIDATION ---------------- */
  const validateStep1 = () => {
    if (!formData.fullName || !formData.username)
      return "Full name and username are required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return "Invalid email address";
    if (!/^\d{10}$/.test(formData.phone))
      return "Phone number must be 10 digits";
    if (!passwordRules.length) return "Password must be at least 8 characters";
    if (!passwordRules.upper) return "Password must contain one uppercase letter";
    if (!passwordRules.lower) return "Password must contain one lowercase letter";
    if (!passwordRules.number) return "Password must contain one number";
    if (!passwordRules.special) return "Password must contain one special character";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.state || !formData.district || !formData.village)
      return "Please complete location details";
    if (!agreeTerms) return "You must agree to the terms";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) return setError(err);
    setStep(2);
  };

  const handleSignup = async () => {
    const err = validateStep2();
    if (err) return setError(err);

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          state: formData.state,
          district: formData.district,
          village: formData.village,
        },
        { withCredentials: true }
      );

      const loginRes = await login({
        username: formData.username,
        password: formData.password,
      });

      if (loginRes.success) navigate("/dashboard");
      else navigate("/login");
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 flex items-start justify-center bg-gradient-to-br from-green-100 to-green-300 px-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto my-8"
      >

        {/* STEP INDICATOR */}
        <div className="flex justify-center gap-2 mb-4">
          <div className={`h-2 w-10 rounded-full ${step === 1 ? "bg-green-600" : "bg-gray-300"}`} />
          <div className={`h-2 w-10 rounded-full ${step === 2 ? "bg-green-600" : "bg-gray-300"}`} />
        </div>

        <h2 className="text-2xl font-bold text-center text-green-700 mb-1">
          Smart Agro Sign Up
        </h2>
        <p className="text-center text-sm text-gray-500 mb-5">
          Step {step} of 2
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ---------------- STEP 1 ---------------- */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <input className="input" name="fullName" placeholder="Full Name" onChange={handleChange} />
              <input className="input" name="username" placeholder="Username" onChange={handleChange} />
              <input className="input" name="email" placeholder="Email" onChange={handleChange} />
              <input className="input" name="phone" placeholder="Phone (10 digits)" onChange={handleChange} />

              <input className="input" type="password" name="password" placeholder="Password" onChange={handleChange} />
              <input className="input" type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />

              {/* 🔐 COLLAPSIBLE PASSWORD RULES */}
              <AnimatePresence>
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-50 border rounded-md p-3 text-xs space-y-1 overflow-hidden"
                  >
                    <p className="font-semibold text-gray-600 mb-1">Password requirements:</p>
                    <Rule ok={passwordRules.length} label="At least 8 characters" />
                    <Rule ok={passwordRules.upper} label="One uppercase letter" />
                    <Rule ok={passwordRules.lower} label="One lowercase letter" />
                    <Rule ok={passwordRules.number} label="One number" />
                    <Rule ok={passwordRules.special} label="One special character" />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleNext}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
              >
                Next →
              </button>

              <p className="text-center text-sm text-gray-600 mt-3">
                Changed your mind?{" "}
                <Link to="/login" className="text-green-700 font-semibold hover:underline">
                  Back to Login
                </Link>
              </p>
            </motion.div>
          )}

          {/* ---------------- STEP 2 ---------------- */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <select className="input" name="state" onChange={handleChange}>
                <option value="">Select State</option>
                {states.map((s) => <option key={s}>{s}</option>)}
              </select>

              <select className="input" name="district" onChange={handleChange}>
                <option value="">Select District</option>
                {districts.map((d) => <option key={d}>{d}</option>)}
              </select>

              <select className="input" name="village" onChange={handleChange}>
                <option value="">Select Village</option>
                {villages.map((v) => <option key={v}>{v}</option>)}
              </select>

              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                />
                I agree to the Terms & Conditions
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/2 border border-gray-300 py-2 rounded-md"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-1/2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* ---------------- RULE COMPONENT ---------------- */
const Rule = ({ ok, label }) => (
  <div className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-gray-400"}`}>
    <span>{ok ? "✔" : "•"}</span>
    <span>{label}</span>
  </div>
);

export default Signup;
