import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";

const ForgotPassword = () => {
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await forgotPassword(identifier);
      setMessage(t("forgot.success"));
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch {
      setError(t("forgot.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-12 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300 px-3 sm:px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4 text-green-700">
          {t("forgot.title")}
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 text-center mb-6">
          {t("forgot.subtitle")}
          <br />
          <span className="text-gray-500">
            {t("forgot.note")}
          </span>
        </p>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs sm:text-sm font-medium text-gray-700">
              {t("forgot.identifierLabel")}
            </label>
            <input
              type="text"
              placeholder={t("forgot.identifierPlaceholder")}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full min-h-[48px] py-3.5 rounded-xl text-white font-bold transition flex items-center justify-center cursor-pointer ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
            }`}
          >
            {loading ? t("forgot.sending") : t("forgot.submit")}
          </button>
        </form>

        <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
          <p>{t("forgot.oauthNote")}</p>
        </div>

        <p className="mt-4 text-center">
          <Link
            to="/login"
            className="text-green-700 font-bold hover:underline inline-flex items-center justify-center min-h-[44px] text-sm"
          >
            <ChevronLeft size={16} className="mr-1" />
            {t("forgot.back")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
