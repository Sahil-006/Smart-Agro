import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    village: ""
  });

  const { login } = useAuth();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }

    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be 10 digits");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!formData.state) {
      setError("Please select a state");
      return false;
    }

    if (!formData.district) {
      setError("Please select a district");
      return false;
    }

    if (!formData.village) {
      setError("Please select a village");
      return false;
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Send signup request
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          fullName: formData.fullName,
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          state: formData.state,
          district: formData.district,
          village: formData.village
        },
        { withCredentials: true }
      );

      // Auto-login after successful signup
      const loginResult = await login({
        username: formData.username,
        password: formData.password
      });

      if (loginResult.success) {
        navigate("/dashboard");
      } else {
        setError(loginResult.error || "Login after signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">
          Smart Agro Sign Up
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSignup}>
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="block mb-1 text-sm text-gray-600">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block mb-1 text-sm text-gray-600">Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Choose a username"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm text-gray-600">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 text-sm text-gray-600">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="10-digit phone number"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm text-gray-600">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="At least 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2 right-3 text-sm text-gray-500 hover:text-green-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm text-gray-600">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Re-enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-2 right-3 text-sm text-gray-500 hover:text-green-700"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Location Fields */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">State *</label>
            <select
              name="state"
              value={formData.state}
              onChange={(e) => {
                handleChange(e);
                setFormData(prev => ({
                  ...prev,
                  district: "",
                  village: ""
                }));
              }}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">District *</label>
            <select
              name="district"
              value={formData.district}
              onChange={(e) => {
                handleChange(e);
                setFormData(prev => ({
                  ...prev,
                  village: ""
                }));
              }}
              disabled={!formData.state}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                !formData.state ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              required
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block mb-1 text-sm font-medium text-gray-700">Village *</label>
            <select
              name="village"
              value={formData.village}
              onChange={handleChange}
              disabled={!formData.district}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                !formData.district ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              required
            >
              <option value="">Select Village</option>
              {villages.map(village => (
                <option key={village} value={village}>{village}</option>
              ))}
            </select>
          </div>

          {/* Terms & Conditions */}
          <div className="sm:col-span-2 flex items-start mt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              className="mt-1 mr-2"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms" className="text-green-700 font-medium hover:underline">
                Terms & Conditions
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition font-semibold ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;