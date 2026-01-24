import React, { useState } from "react"; // Added React here
import { useAuth } from "../context/authContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Lock, Edit3, Save, X, User, Phone, 
  MapPin, Mail, ShieldCheck, Eye, EyeOff, CheckCircle2 
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
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

  if (!user) return null;

  const passwordRules = {
    length: passwordData.newPassword.length >= 8,
    upper: /[A-Z]/.test(passwordData.newPassword),
    number: /[0-9]/.test(passwordData.newPassword),
    special: /[^A-Za-z0-9]/.test(passwordData.newPassword),
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = () => {
    const isStrong = Object.values(passwordRules).every(Boolean);
    if (!isStrong) return alert("Please meet all password requirements");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Password Change:", passwordData);
    setShowPasswordModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 px-4"
    >
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER CARD */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] bg-green-600 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-green-200 overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  (user.fullName?.charAt(0) || user.username?.charAt(0)).toUpperCase()
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl cursor-pointer hover:bg-green-50 transition-colors border border-gray-100">
                <Camera size={20} className="text-green-600" />
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {user.fullName || user.username}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">@{user.username}</span>
                <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                  <Mail size={14}/> {user.email}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full sm:w-auto">
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all">
                  <Edit3 size={18}/> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(false)} className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={() => setEditMode(false)} className="flex-1 px-6 py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all">
                    <Save size={18}/> Save
                  </button>
                </div>
              )}
              <button onClick={() => setShowPasswordModal(true)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all">
                <Lock size={18}/> Security
              </button>
            </div>
          </div>
        </motion.div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileField Icon={User} label="Full Name" name="fullName" value={formData.fullName} editMode={editMode} onChange={handleProfileChange} />
          <StaticField Icon={Mail} label="Account Email" value={formData.email} />
          <ProfileField Icon={Phone} label="Phone Number" name="phone" value={formData.phone} editMode={editMode} onChange={handleProfileChange} />
          <ProfileField Icon={MapPin} label="State" name="state" value={formData.state} editMode={editMode} onChange={handleProfileChange} />
          <ProfileField Icon={MapPin} label="District" name="district" value={formData.district} editMode={editMode} onChange={handleProfileChange} />
          <ProfileField Icon={MapPin} label="Village" name="village" value={formData.village} editMode={editMode} onChange={handleProfileChange} />
        </div>

        {/* PASSWORD MODAL */}
        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPasswordModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 overflow-hidden">
                <div className="text-center mb-8">
                  <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-2xl mb-4"><ShieldCheck size={32}/></div>
                  <h3 className="text-2xl font-black text-gray-900">Update Password</h3>
                </div>

                <div className="space-y-4">
                  <input type="password" placeholder="Current Password" className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}/>
                  
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} placeholder="New Password" 
                           className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500" 
                           onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}/>
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
                      {showPass ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                  </div>

                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} placeholder="Confirm New Password" 
                           className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500" 
                           onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}/>
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
                      {showConfirm ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                    <Rule ok={passwordRules.length} label="8+ Chars" />
                    <Rule ok={passwordRules.upper} label="Uppercase" />
                    <Rule ok={passwordRules.number} label="Number" />
                    <Rule ok={passwordRules.special} label="Symbol" />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                  <button onClick={handlePasswordChange} className="flex-[2] py-4 bg-green-600 text-white font-bold rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 transition-all">Update</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* --- REFACTORED HELPER COMPONENTS --- */

const ProfileField = ({ Icon, label, name, value, editMode, onChange }) => (
  <div className="bg-white/70 backdrop-blur-md border border-white rounded-[2rem] p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-2 text-green-600">
      <Icon size={18} />
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
    </div>
    {editMode ? (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-0 py-1 bg-transparent border-b-2 border-green-500 font-bold text-gray-800 outline-none"
      />
    ) : (
      <p className="font-bold text-gray-800 text-lg ml-7">{value || "—"}</p>
    )}
  </div>
);

const StaticField = ({ Icon, label, value }) => (
  <div className="bg-gray-50/50 backdrop-blur-md border border-gray-100 rounded-[2rem] p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-2 text-gray-400">
      <Icon size={18} />
      <p className="text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
    <p className="font-bold text-gray-500 text-lg ml-7">{value}</p>
  </div>
);

const Rule = ({ ok, label }) => (
  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${ok ? "text-green-600" : "text-gray-300"}`}>
    {ok ? <CheckCircle2 size={14} /> : <div className="h-3 w-3 rounded-full border-2 border-current" />}
    {label}
  </div>
);

export default Profile;