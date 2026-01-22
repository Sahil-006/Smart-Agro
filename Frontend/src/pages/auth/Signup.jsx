import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Mock location data (backend can replace later)
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
  const districts = formData.state
    ? Object.keys(locationData[formData.state])
    : [];
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

  /* ---------------- VALIDATION ---------------- */

  const validateStep1 = () => {
    if (!formData.fullName || !formData.username)
      return "Full name and username are required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return "Invalid email address";
    if (!/^\d{10}$/.test(formData.phone))
      return "Phone number must be 10 digits";
    if (formData.password.length < 8)
      return "Password must be at least 8 characters";
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
    <div className="min-h-screen pt-20 flex items-start justify-center bg-gradient-to-br from-green-100 to-green-300 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto my-8">

        {/* STEP INDICATOR */}
        <div className="flex justify-center gap-2 mb-4">
          <div className={`h-2 w-10 rounded-full ${step === 1 ? "bg-green-600" : "bg-gray-300"}`} />
          <div className={`h-2 w-10 rounded-full ${step === 2 ? "bg-green-600" : "bg-gray-300"}`} />
        </div>

        <h2 className="text-2xl font-bold text-center text-green-700 mb-1">
          Smart Agro Sign Up
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Step {step} of 2
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm">
            {error}
          </div>
        )}

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <div className="space-y-4">
            <input className="input" name="fullName" placeholder="Full Name" onChange={handleChange} />
            <input className="input" name="username" placeholder="Username" onChange={handleChange} />
            <input className="input" name="email" placeholder="Email" onChange={handleChange} />
            <input className="input" name="phone" placeholder="Phone (10 digits)" onChange={handleChange} />

            <input
              className="input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />
            <input
              className="input"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
            />

            <button
              onClick={handleNext}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Next →
            </button>

            {/* BACK TO LOGIN */}
            <p className="text-center text-sm text-gray-600 mt-3">
              Changed your mind?{" "}
              <Link to="/login" className="text-green-700 font-semibold hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <div className="space-y-4">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
