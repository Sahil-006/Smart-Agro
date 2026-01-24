import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, ChevronRight, ChevronLeft, User, Mail, Phone, Lock, MapPin } from "lucide-react";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Visibility states for passwords
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

  const { login, handleOAuthLogin } = useAuth();
  const navigate = useNavigate();

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
  const villages = formData.district ? locationData[formData.state][formData.district] : [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordRules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.username) return "Name and username are required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email address";
    if (!/^\d{10}$/.test(formData.phone)) return "Phone must be 10 digits";
    if (!passwordRules.length || !passwordRules.upper || !passwordRules.special) return "Password is too weak";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) return setError(err);
    setStep(2);
  };

  const handleSignup = async () => {
    if (!formData.state || !formData.district || !formData.village) return setError("Location required");
    if (!agreeTerms) return setError("Please agree to terms");

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, formData, { withCredentials: true });
      const loginRes = await login({ username: formData.username, password: formData.password });
      if (loginRes.success) navigate("/dashboard");
      else navigate("/login");
    } catch {
      setError("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white w-full max-w-lg"
      >
        {/* STEP INDICATOR */}
        <div className="flex justify-center gap-3 mb-8">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? "bg-green-600 w-24" : "bg-gray-200 w-12"}`} />
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? "bg-green-600 w-24" : "bg-gray-200 w-12"}`} />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Smart Agro</h2>
          <p className="text-gray-500 font-medium">Step {step}: {step === 1 ? "Personal Details" : "Location Details"}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-semibold">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center">
                <GoogleLogin text="signup_with" shape="pill" />
                <div className="flex items-center w-full my-6">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Or use email</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithIcon icon={<User size={18}/>} name="fullName" placeholder="Full Name" onChange={handleChange} />
                <InputWithIcon icon={<User size={18}/>} name="username" placeholder="Username" onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithIcon icon={<Mail size={18}/>} name="email" type="email" placeholder="Email Address" onChange={handleChange} />
                <InputWithIcon icon={<Phone size={18}/>} name="phone" placeholder="Phone Number" onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Main Password */}
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    className="w-full pl-11 pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    className="w-full pl-11 pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {formData.password && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                  <Rule ok={passwordRules.length} label="8+ Characters" />
                  <Rule ok={passwordRules.upper} label="Uppercase" />
                  <Rule ok={passwordRules.number} label="Number" />
                  <Rule ok={passwordRules.special} label="Special Char" />
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Next Step <ChevronRight size={20} />
              </button>

              <p className="text-center text-sm text-gray-500 font-medium pt-2">
                Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline">Login</Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <SelectWithIcon icon={<MapPin size={18}/>} name="state" onChange={handleChange}>
                  <option value="">Select State</option>
                  {states.map(s => <option key={s}>{s}</option>)}
                </SelectWithIcon>

                <SelectWithIcon icon={<MapPin size={18}/>} name="district" onChange={handleChange}>
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d}>{d}</option>)}
                </SelectWithIcon>

                <SelectWithIcon icon={<MapPin size={18}/>} name="village" onChange={handleChange}>
                  <option value="">Select Village</option>
                  {villages.map(v => <option key={v}>{v}</option>)}
                </SelectWithIcon>
              </div>

              <label className="flex items-start text-sm text-gray-600 cursor-pointer group p-2">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                />
                <span>I agree to the <span className="text-green-600 font-bold">Privacy Policy</span> and <span className="text-green-600 font-bold">Terms of Service</span>.</span>
              </label>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-1"
                >
                  <ChevronLeft size={20}/> Back
                </button>
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-100 hover:bg-green-700 transition-all"
                >
                  {loading ? "Creating Account..." : "Complete Signup"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* --- HELPER COMPONENTS FOR CLEANER CODE --- */

const InputWithIcon = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
      {icon}
    </div>
    <input
      {...props}
      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50 placeholder:text-gray-400"
    />
  </div>
);

const SelectWithIcon = ({ icon, children, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none">
      {icon}
    </div>
    <select
      {...props}
      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50 appearance-none"
    >
      {children}
    </select>
  </div>
);

const Rule = ({ ok, label }) => (
  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${ok ? "text-green-600" : "text-gray-300"}`}>
    <div className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.5)]" : "bg-gray-300"}`} />
    {label}
  </div>
);

export default Signup;