import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/navbar";
import Login from './pages/auth/login';
import Signup from './pages/auth/Signup';
import Landing from './pages/landing';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import SoilInsights from './pages/insights/SoilInsights';
import SolarInsights from './pages/insights/SolarInsights';
import CropInsights from './pages/insights/CropInsights';
import SystemInsights from './pages/insights/SystemInsights';
import AOS from 'aos';
import 'aos/dist/aos.css';
import GitHubCallback from './pages/auth/GitHubCallBack';
import Footer from './components/footer';
import { useEffect } from 'react';

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
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/insights/soil" element={
            <ProtectedRoute>
              <SoilInsights />
            </ProtectedRoute>
          } />
          <Route path="/insights/solar" element={
            <ProtectedRoute>
              <SolarInsights />
            </ProtectedRoute>
          } />
          <Route path="/insights/crop" element={
            <ProtectedRoute>
              <CropInsights />
            </ProtectedRoute>
          } />
          <Route path="/insights/system" element={
            <ProtectedRoute>
              <SystemInsights />
            </ProtectedRoute>
          } />
          
          <Route path="/github/callback" element={<GitHubCallback />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;