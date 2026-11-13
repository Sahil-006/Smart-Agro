import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../components/api";
import { useTranslation } from "react-i18next";
import { 
  Camera, Lock, Edit3, Save, X, User, Phone, 
  MapPin, Mail, ShieldCheck, Eye, EyeOff, CheckCircle2 
} from "lucide-react";

const Profile = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    state: user?.state || "",
    district: user?.district || "",
    village: user?.village || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* 🔒 Close modal on escape key */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowPasswordModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!user) return null;

  // --- Logic Helpers ---
  const passwordRules = {
    length: passwordData.newPassword.length >= 8,
    upper: /[A-Z]/.test(passwordData.newPassword),
    number: /[0-9]/.test(passwordData.newPassword),
    special: /[^A-Za-z0-9]/.test(passwordData.newPassword),
  };

  /* ---------------- HANDLERS ---------------- */

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
        if (!/^\d*$/.test(value)) return; 
        if (value.length > 10) return;   
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (formData.phone && formData.phone.length !== 10) {
      alert(t("profile.validation.phone_length"));
      return;
    }

    try {
      const { fullName, phone, state, district, village } = formData;

      await api.put("/api/user/profile", {
        fullName,
        phone,
        state,
        district,
        village,
      });

      const authRes = await api.get("/api/auth/check");
      if (authRes.data.authenticated) {
        setUser(authRes.data.user);
      }

      setEditMode(false);
      alert(t("profile.validation.update_success"));

    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.response?.data?.message || t("profile.validation.update_fail"));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.put(
        "/api/user/profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser((prev) => ({
        ...prev,
        profileImage: res.data.profileImage,
      }));

      alert(t("profile.validation.image_success"));
    } catch (err) {
      console.error("Image upload error:", err);
      alert(err.response?.data?.message || t("profile.validation.image_fail"));
    }
  };

  const handlePasswordChange = async () => {
    const isStrong = Object.values(passwordRules).every(Boolean);
    if (!isStrong) return alert(t("profile.validation.password_reqs"));

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t("profile.validation.password_mismatch"));
      return;
    }

    try {
      await api.put("/api/user/change-password", passwordData);
      alert(t("profile.validation.password_success"));
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error:", err);
      alert(err.response?.data?.message || t("profile.validation.password_fail"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-28 sm:pt-36 pb-16 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 px-3 sm:px-6 w-full"
    >
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER CARD */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl sm:rounded-[2rem] bg-green-600 text-white flex items-center justify-center text-3xl sm:text-4xl font-black shadow-2xl shadow-green-200 overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={t("profile.altText")} className="w-full h-full object-cover" />
                ) : (
                  ((user?.fullName || user?.username || "U").charAt(0)).toUpperCase()
                )}
              </div>
              <label 
                className="absolute -bottom-2 -right-2 bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl cursor-pointer hover:bg-green-50 transition-colors border border-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Upload profile image"
              >
                <Camera size={18} className="text-green-600" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </label>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight truncate">
                {user.fullName || user.username}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mt-2">
                <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">@{user.username}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-1 truncate max-w-full">
                  <Mail size={14} className="shrink-0"/> <span className="truncate">{user.email}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
              {!editMode ? (
                <button 
                  onClick={() => setEditMode(true)} 
                  className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all cursor-pointer active:scale-98"
                >
                  <Edit3 size={18}/> {t("profile.actions.edit")}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditMode(false)} 
                    className="flex-1 px-4 py-3 min-h-[44px] rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer active:scale-98"
                  >
                    {t("profile.actions.cancel")}
                  </button>
                  <button 
                    onClick={handleSaveProfile} 
                    className="flex-1 px-6 py-3 min-h-[44px] rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <Save size={18}/> {t("profile.actions.save")}
                  </button>
                </div>
              )}
              <button 
                onClick={() => setShowPasswordModal(true)} 
                className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer active:scale-98"
              >
                <Lock size={18}/> {t("profile.actions.security")}
              </button>
            </div>
          </div>
        </motion.div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ProfileField Icon={User} label={t("profile.fields.fullName")} name="fullName" value={formData.fullName} editMode={editMode} onChange={handleProfileChange} />
          <StaticField Icon={Mail} label={t("profile.fields.email")} value={formData.email} />
          <ProfileField Icon={Phone} label={t("profile.fields.phone")} name="phone" value={formData.phone} editMode={editMode} onChange={handleProfileChange} />
          <ProfileField Icon={MapPin} label={t("profile.fields.state")} name="state" value={formData.state} editMode={editMode} onChange={handleProfileChange} />
          <ProfileField Icon={MapPin} label={t("profile.fields.district")} name="district" value={formData.district} editMode={editMode} onChange={handleProfileChange} />
          <ProfileField Icon={MapPin} label={t("profile.fields.village")} name="village" value={formData.village} editMode={editMode} onChange={handleProfileChange} />
        </div>

        {/* PASSWORD MODAL (Accessible & Scrollable on mobile) */}
        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowPasswordModal(false)} 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer" 
                aria-hidden="true"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                className="relative bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-md p-5 sm:p-8 max-h-[90dvh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="security-modal-title"
              >
                {/* Close X button */}
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>

                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-2xl mb-3"><ShieldCheck size={28}/></div>
                  <h3 id="security-modal-title" className="text-xl sm:text-2xl font-black text-gray-900">{t("profile.security.title")}</h3>
                </div>

                <div className="space-y-4">
                  <input 
                    type="password" 
                    placeholder={t("profile.security.placeholders.current")} 
                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 text-base" 
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  />
                  
                  <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"} 
                      placeholder={t("profile.security.placeholders.new")} 
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 pr-12 text-base" 
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPass(!showPass)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors w-10 h-10 flex items-center justify-center"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>

                  <div className="relative">
                    <input 
                      type={showConfirm ? "text" : "password"} 
                      placeholder={t("profile.security.placeholders.confirm")} 
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 pr-12 text-base" 
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirm(!showConfirm)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors w-10 h-10 flex items-center justify-center"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 bg-green-50/50 p-3 sm:p-4 rounded-2xl border border-green-100">
                    <Rule ok={passwordRules.length} label={t("profile.security.rules.length")} />
                    <Rule ok={passwordRules.upper} label={t("profile.security.rules.upper")} />
                    <Rule ok={passwordRules.number} label={t("profile.security.rules.number")} />
                    <Rule ok={passwordRules.special} label={t("profile.security.rules.symbol")} />
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex gap-3">
                  <button 
                    onClick={() => setShowPasswordModal(false)} 
                    className="flex-1 py-3.5 min-h-[44px] font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all cursor-pointer"
                  >
                    {t("profile.security.buttons.cancel")}
                  </button>
                  <button 
                    onClick={handlePasswordChange} 
                    className="flex-[2] py-3.5 min-h-[44px] bg-green-600 text-white font-bold rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 transition-all cursor-pointer"
                  >
                    {t("profile.security.buttons.update")}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* --- HELPER COMPONENTS --- */

const ProfileField = ({ Icon, label, name, value, editMode, onChange }) => (
  <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 shadow-sm">
    <div className="flex items-center gap-2.5 mb-2 text-green-600">
      <Icon size={18} className="shrink-0" />
      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
    </div>
    {editMode ? (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        maxLength={name === "phone" ? 10 : undefined} 
        className="w-full px-0 py-1 bg-transparent border-b-2 border-green-500 font-bold text-gray-800 outline-none text-base sm:text-lg"
      />
    ) : (
      <p className="font-bold text-gray-800 text-base sm:text-lg ml-6 sm:ml-7 break-words">{value || "—"}</p>
    )}
  </div>
);

const StaticField = ({ Icon, label, value }) => (
  <div className="bg-gray-50/70 backdrop-blur-md border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 shadow-sm">
    <div className="flex items-center gap-2.5 mb-2 text-gray-400">
      <Icon size={18} className="shrink-0" />
      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
    <p className="font-bold text-gray-500 text-base sm:text-lg ml-6 sm:ml-7 break-words">{value}</p>
  </div>
);

const Rule = ({ ok, label }) => (
  <div className={`flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${ok ? "text-green-600" : "text-gray-400"}`}>
    {ok ? <CheckCircle2 size={14} className="shrink-0" /> : <div className="h-3 w-3 rounded-full border-2 border-current shrink-0" />}
    <span className="truncate">{label}</span>
  </div>
);

export default Profile;
