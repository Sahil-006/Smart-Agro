import { useState } from "react";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import api from "../components/api";
import { useTranslation } from "react-i18next";
import {
  Camera,
  Lock,
  Edit3,
  Save,
  User,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Check,
} from "lucide-react";
import GlassButton from "../components/ui/GlassButton";
import GlassInput from "../components/ui/GlassInput";
import GlassModal from "../components/ui/GlassModal";
import StatusBadge from "../components/ui/StatusBadge";
import { springSmooth } from "../constants/motion";

export function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  if (!user) return null;

  const passwordRules = {
    length: passwordData.newPassword.length >= 8,
    upper: /[A-Z]/.test(passwordData.newPassword),
    number: /[0-9]/.test(passwordData.newPassword),
    special: /[^A-Za-z0-9]/.test(passwordData.newPassword),
  };

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

    const imgFormData = new FormData();
    imgFormData.append("image", file);

    try {
      const res = await api.put("/api/user/profile-image", imgFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-16">
      {/* =========================================================================
          PROFILE HEADER CARD
          ========================================================================= */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springSmooth}
        className="glass-card p-6 sm:p-8 rounded-[32px] mb-8 border border-slate-900/10 dark:border-white/10"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Avatar Container with Camera Badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-3xl font-black shadow-2xl overflow-hidden border border-white/50">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={t("profile.altText")}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user?.fullName || user?.username || "U").charAt(0).toUpperCase()
              )}
            </div>

            <label
              className="absolute -bottom-2 -right-2 glass-pill p-2 text-emerald-800 dark:text-emerald-300 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center justify-center min-w-[38px] min-h-[38px]"
              aria-label="Upload profile image"
            >
              <Camera size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-50 tracking-tight truncate">
                {user.fullName || user.username}
              </h2>
              <StatusBadge status="online" size="sm" label="Active Farmer" />
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-400">
                @{user.username}
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 truncate">
                <Mail size={13} className="shrink-0" />
                <span className="truncate">{user.email}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
            {!editMode ? (
              <GlassButton
                variant="primary"
                size="md"
                onClick={() => setEditMode(true)}
                icon={Edit3}
              >
                {t("profile.actions.edit")}
              </GlassButton>
            ) : (
              <div className="flex gap-2">
                <GlassButton
                  variant="secondary"
                  size="md"
                  onClick={() => setEditMode(false)}
                >
                  {t("profile.actions.cancel")}
                </GlassButton>
                <GlassButton
                  variant="primary"
                  size="md"
                  onClick={handleSaveProfile}
                  icon={Save}
                >
                  {t("profile.actions.save")}
                </GlassButton>
              </div>
            )}

            <GlassButton
              variant="secondary"
              size="md"
              onClick={() => setShowPasswordModal(true)}
              icon={Lock}
            >
              {t("profile.actions.security")}
            </GlassButton>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          iOS SETTINGS GROUPED DETAILS LIST
          ========================================================================= */}
      <div className="glass-card rounded-[32px] overflow-hidden p-6 sm:p-8 border border-slate-900/10 dark:border-white/10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-5">
          Farm Operator Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileField
            Icon={User}
            label={t("profile.fields.fullName")}
            name="fullName"
            value={formData.fullName}
            editMode={editMode}
            onChange={handleProfileChange}
          />
          <StaticField Icon={Mail} label={t("profile.fields.email")} value={formData.email} />
          <ProfileField
            Icon={Phone}
            label={t("profile.fields.phone")}
            name="phone"
            value={formData.phone}
            editMode={editMode}
            onChange={handleProfileChange}
          />
          <ProfileField
            Icon={MapPin}
            label={t("profile.fields.state")}
            name="state"
            value={formData.state}
            editMode={editMode}
            onChange={handleProfileChange}
          />
          <ProfileField
            Icon={MapPin}
            label={t("profile.fields.district")}
            name="district"
            value={formData.district}
            editMode={editMode}
            onChange={handleProfileChange}
          />
          <ProfileField
            Icon={MapPin}
            label={t("profile.fields.village")}
            name="village"
            value={formData.village}
            editMode={editMode}
            onChange={handleProfileChange}
          />
        </div>
      </div>

      {/* =========================================================================
          PASSWORD CHANGE MODAL VIA PORTAL
          ========================================================================= */}
      <GlassModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Update Security Credentials"
      >
        <div className="space-y-4">
          <GlassInput
            type="password"
            label="Current Password"
            name="oldPassword"
            placeholder="••••••••"
            value={passwordData.oldPassword}
            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
            required
          />

          <GlassInput
            type="password"
            label="New Password"
            name="newPassword"
            placeholder="••••••••"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            required
          />

          <GlassInput
            type="password"
            label="Confirm New Password"
            name="confirmPassword"
            placeholder="••••••••"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            required
          />

          {passwordData.newPassword && (
            <div className="grid grid-cols-2 gap-2 glass-subtle p-3 rounded-2xl border border-white/60 dark:border-white/10 text-[11px]">
              <div className={`flex items-center gap-1.5 ${passwordRules.length ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                <Check size={12} /> <span>Min 8 chars</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordRules.upper ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                <Check size={12} /> <span>Uppercase</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordRules.number ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                <Check size={12} /> <span>Number</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordRules.special ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                <Check size={12} /> <span>Special char</span>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <GlassButton
              variant="secondary"
              size="md"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1"
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="md"
              onClick={handlePasswordChange}
              icon={ShieldCheck}
              className="flex-1"
            >
              Confirm Update
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

function ProfileField({ Icon, label, name, value, editMode, onChange }) {
  return (
    <div className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">{label}</p>
          {editMode ? (
            <input
              type="text"
              name={name}
              value={value || ""}
              onChange={onChange}
              className="glass-input mt-1 py-1.5 text-sm"
            />
          ) : (
            <p className="text-sm font-bold text-slate-950 dark:text-slate-50 truncate mt-0.5">
              {value || "—"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StaticField({ Icon, label, value }) {
  return (
    <div className="glass-subtle p-4 rounded-2xl border border-slate-900/10 dark:border-white/10 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-700 dark:text-slate-400 shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate mt-0.5">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default Profile;
