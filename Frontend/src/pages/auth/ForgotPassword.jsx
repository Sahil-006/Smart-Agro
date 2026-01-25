import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
//NOTHING ADDED JUST TO CHECK THE GIT FOLLOW
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
    } catch (err) {
      setError(t("forgot.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-4 text-green-700">
          {t("forgot.title")}
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          {t("forgot.subtitle")}
          <br />
          <span className="text-gray-500">
            {t("forgot.note")}
          </span>
        </p>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-600">
              {t("forgot.identifierLabel")}
            </label>
            <input
              type="text"
              placeholder={t("forgot.identifierPlaceholder")}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white transition ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? t("forgot.sending") : t("forgot.submit")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>{t("forgot.oauthNote")}</p>
        </div>

        <p className="mt-4 text-center text-sm">
          <Link
            to="/login"
            className="text-green-700 font-semibold hover:underline"
          >
            {t("forgot.back")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
