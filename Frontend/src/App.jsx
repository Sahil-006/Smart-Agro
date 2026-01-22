import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/landing";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import GitHubCallback from "./pages/auth/GitHubCallBack";

import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import SoilInsights from "./pages/insights/SoilInsights";
import SolarInsights from "./pages/insights/SolarInsights";
import CropInsights from "./pages/insights/CropInsights";
import SystemInsights from "./pages/insights/SystemInsights";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/github/callback" element={<GitHubCallback />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/insights/soil"
            element={
              <ProtectedRoute>
                <SoilInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights/solar"
            element={
              <ProtectedRoute>
                <SolarInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights/crop"
            element={
              <ProtectedRoute>
                <CropInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights/system"
            element={
              <ProtectedRoute>
                <SystemInsights />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
