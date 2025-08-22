import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSun, FiDroplet, FiThermometer,
  FiAlertCircle, FiImage, FiBarChart2,
  FiSettings, FiCalendar, FiLoader,
  FiUpload, FiCamera, FiRefreshCw
} from 'react-icons/fi';
import AOS from 'aos';
import 'aos/dist/aos.css';

let dashboardCache = {
  data: null,
  timestamp: null
};

const CACHE_EXPIRY_MS = 5 * 60 * 1000;

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiData, setApiData] = useState(dashboardCache.data);
  const [isFetching, setIsFetching] = useState(false);

  const soilData = useMemo(() => ({
    moisture: apiData?.soil || 0,
    temperature: apiData?.temperature || 0,
    humidity: apiData?.humidity || 0,
    pH: apiData?.ph || 6.8
  }), [apiData]);

  const solarData = useMemo(() => ({
    currentOutput: apiData?.solar_output || 0,
    dailyProduction: apiData?.dailyProduction || 3.2,
    efficiency: apiData?.efficiency || 82,
    batteryLevel: apiData?.batteryLevel || 75
  }), [apiData]);

  const cropHealth = useMemo(() => ({
    diseaseRisk: analysisResult?.diseaseRisk || apiData?.diseaseRisk || 0,
    growthStage: analysisResult?.growthStage || apiData?.growthStage || "Vegetative",
    lastScan: analysisResult ? "Just now" : "No recent scan",
    healthScore: analysisResult?.healthScore || apiData?.crop_health || 0
  }), [apiData, analysisResult]);

  const alerts = useMemo(() => 
    apiData?.suggestions?.map((msg, i) => ({
      id: i + 1,
      type: "system",
      message: msg,
      time: "Now",
      critical: msg.includes("⚠️") || msg.includes("🔥")
    })) || []
  , [apiData]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const loadData = async () => {
      const now = Date.now();
      const shouldRefresh = !dashboardCache.timestamp || 
                          (now - dashboardCache.timestamp) > CACHE_EXPIRY_MS;

      if (!dashboardCache.data || shouldRefresh) {
        await fetchData();
      } else {
        setApiData(dashboardCache.data);
      }
      setIsLoading(false);
    };

    loadData();

    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, []);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('http://localhost:5000/api/analyze-data', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: true }),
        credentials: "include"
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setApiData(data);
      dashboardCache = {
        data: data,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Fetch error:", error);
      if (!apiData) alert(`Failed to load data: ${error.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.includes('image')) {
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
        }
        const blob = items[i].getAsFile();
        setSelectedImage(blob);
        setPreviewImage(URL.createObjectURL(blob));
        setAnalysisResult(null);
        break;
      }
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setAnalysisResult(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setAnalysisResult(result);

      const updatedData = {
        ...apiData,
        diseaseRisk: result.diseaseRisk,
        growthStage: result.growthStage,
        crop_health: result.healthScore,
        predictedClass: result.prediction,
        confidence: result.confidence,
        recommendedAction: result.recommendedAction
      };
      
      setApiData(updatedData);
      dashboardCache = {
        data: updatedData,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysisResult({ 
        error: true,
        message: "Analysis failed. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setAnalysisResult(null);
    
    setApiData(prev => ({
      ...prev,
      diseaseRisk: 0,
      predictedClass: undefined,
      confidence: undefined,
      recommendedAction: undefined
    }));

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center" data-aos="fade-in">
          <FiLoader className="animate-spin text-5xl text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700">Loading Smart Agro Dashboard</h2>
          <p className="text-green-500 mt-2">Optimizing your farming data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 border-b border-green-200 pb-6" data-aos="fade-up">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Smart Agro-Solar Dashboard</h1>
          <p className="text-green-600">Monitoring 3.4M data points for recyclable energy optimization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <Link to="/insights/soil" className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all hover:border-green-300" data-aos="fade-up" data-aos-delay="100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <FiDroplet className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-green-500">Soil Moisture</p>
                <p className="text-2xl font-bold text-green-700">{soilData.moisture}%</p>
              </div>
            </div>
          </Link>

          <Link to="/insights/solar" className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all hover:border-green-300" data-aos="fade-up" data-aos-delay="200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <FiSun className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-green-500">Solar Output</p>
                <p className="text-2xl font-bold text-green-700">{solarData.currentOutput}W</p>
              </div>
            </div>
          </Link>

          <Link to="/insights/crop" className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all hover:border-green-300" data-aos="fade-up" data-aos-delay="300">
            <div className="flex items-center">
              <div className="p-3 bg-teal-100 rounded-full mr-4">
                <FiImage className="text-teal-600 text-xl" />
              </div>
              <div>
                <p className="text-green-500">Crop Health</p>
                <p className="text-2xl font-bold text-green-700">{cropHealth.healthScore}/100</p>
              </div>
            </div>
          </Link>

          <Link to="/insights/system" className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all hover:border-green-300" data-aos="fade-up" data-aos-delay="400">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <FiAlertCircle className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-green-500">Active Alerts</p>
                <p className="text-2xl font-bold text-green-700">{alerts.length}</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 lg:col-span-2 hover:shadow-md transition-all" data-aos="fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center text-green-700">
                <FiBarChart2 className="text-green-600 mr-2" />
                Our Monitoring Systems
              </h2>
              <Link to="/insights/soil" className="text-sm text-green-600 hover:underline">View Details</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-600 mb-1">Temperature</p>
                <p className="text-2xl font-bold text-green-700">{soilData.temperature}°C</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-600 mb-1">Humidity</p>
                <p className="text-2xl font-bold text-green-700">{soilData.humidity}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-600 mb-1">pH Level</p>
                <p className="text-2xl font-bold text-green-700">{soilData.pH}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-600 mb-1">Moisture</p>
                <p className="text-2xl font-bold text-green-700">{soilData.moisture}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="100">
            <h2 className="text-xl font-semibold flex items-center mb-6 text-green-700">
              <FiAlertCircle className="text-red-600 mr-2" />
              System Alerts
            </h2>
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${alert.critical ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                  <p className="font-medium text-green-800">{alert.message}</p>
                  <p className="text-sm text-green-600 mt-1">{alert.time}</p>
                  {alert.critical && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                      Critical
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Link to="/insights/system" className="mt-6 w-full py-2 border border-green-200 rounded-lg text-green-600 hover:bg-green-50 transition-colors flex justify-center">
              View All Alerts
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center text-green-700">
                <FiSettings className="text-yellow-600 mr-2" />
                Main Optimizers
              </h2>
              <Link to="/insights/solar" className="text-sm text-green-600 hover:underline">View Details</Link>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-green-600">Daily Production</p>
                <p className="text-2xl font-bold text-green-700">{solarData.dailyProduction}kWh</p>
              </div>
              <div>
                <p className="text-green-600">Efficiency</p>
                <p className="text-2xl font-bold text-green-700">{solarData.efficiency}%</p>
              </div>
              <div>
                <p className="text-green-600">Battery Level</p>
                <div className="w-full bg-green-100 rounded-full h-2.5 mt-2">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${solarData.batteryLevel}%` }}></div>
                </div>
                <p className="text-sm text-green-600 mt-1">{solarData.batteryLevel}% charged</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center text-green-700">
                <FiCalendar className="text-teal-600 mr-2" />
                Smart Disclosure
              </h2>
              <Link to="/insights/crop" className="text-sm text-green-600 hover:underline">View Details</Link>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-green-600">Disease Name</p>
                <p className="text-lg font-medium text-green-700">
                  {analysisResult?.prediction || apiData?.predictedClass || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-green-600">Disease Risk</p>
                <div className="w-full bg-green-100 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full" 
                    style={{ width: `${cropHealth.diseaseRisk}%` }}
                  ></div>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {cropHealth.diseaseRisk}% risk detected
                </p>
              </div>
              <div>
                <p className="text-green-600">Growth Stage</p>
                <p className="text-lg font-medium text-green-700">{cropHealth.growthStage}</p>
              </div>
              <div>
                <p className="text-green-600">Last Scan</p>
                <p className="text-lg font-medium text-green-700">{cropHealth.lastScan}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="400" onPaste={handlePaste}>
            <h2 className="text-xl font-semibold flex items-center text-green-700 mb-6">
              <FiCamera className="text-blue-600 mr-2" />
              Crop Image Analysis
            </h2>
            {previewImage ? (
              <div className="mb-4">
                <img src={previewImage} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-2" />
                {analysisResult && (
                  <div className="bg-green-50 p-4 rounded-lg mb-3">
                    <h3 className="font-semibold text-green-700 mb-1">Analysis Results</h3>
                    <p className="text-green-600">Prediction: {analysisResult.prediction || "Unknown"}</p>
                    <p className="text-green-600">Confidence: {analysisResult.confidence ? `${Math.round(analysisResult.confidence * 100)}%` : "N/A"}</p>
                    <p className="text-sm text-green-500 mt-1">{analysisResult.message || analysisResult.recommendedAction || "No additional information"}</p>
                  </div>
                )}
                <div className="flex space-x-2">
                  <button 
                    onClick={resetImage} 
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                  <button 
                    onClick={uploadImage} 
                    disabled={isUploading} 
                    className={`text-sm ${isUploading ? 'text-gray-400' : 'text-green-600 hover:underline'}`}
                  >
                    {isUploading ? 'Analyzing...' : 'Analyze Image'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center mb-4">
                <FiUpload className="text-3xl text-green-500 mx-auto mb-2" />
                <p className="text-green-600 mb-2">Upload or paste crop image</p>
                <label className="cursor-pointer text-sm text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700">
                  Browse Files
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange} 
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG (Max 5MB)</p>
              </div>
            )}
            <p className="text-xs text-gray-500">Tip: You can also paste (Ctrl+V) an image directly</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-all" data-aos="fade-up" data-aos-delay="500">
            <h2 className="text-xl font-semibold flex items-center text-green-700 mb-6">
              <FiBarChart2 className="text-purple-600 mr-2" />
              Data Management
            </h2>
            <div className="flex flex-col items-center justify-center p-4">
              <button
                onClick={fetchData}
                disabled={isFetching}
                className={`flex items-center justify-center w-full py-3 px-4 rounded-lg ${
                  isFetching ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'
                } text-white transition-colors`}
              >
                <FiRefreshCw className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Fetching Data...' : 'Fetch Data'}
              </button>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Click to fetch and update your latest agricultural data
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-green-600 rounded-xl p-8 text-center" data-aos="fade-up">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to revolutionize your farm?</h2>
          <p className="text-green-100 mb-6">Join our transformed approach with full and evergreen customers</p>
          <Link to="/contact" className="inline-block bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors">
            Contact Us Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;