import { useAuth } from "../context/authContext";
import { useState } from "react";
import { FaCamera, FaLock, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const { user } = useAuth();

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

  /* ---------------- HANDLERS ---------------- */

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    console.log("Updated Profile:", formData); // backend later
    setEditMode(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log("Profile Image:", file); // backend later
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Password Change:", passwordData); // backend later
    setShowPasswordModal(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-[#f4fbf7] to-[#eef5f1]"
    >
      <div className="max-w-5xl mx-auto px-4">

        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative bg-white/80 backdrop-blur-xl border border-gray-200 shadow-xl rounded-3xl p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="w-28 h-28 rounded-full bg-green-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.fullName?.charAt(0) || user.username?.charAt(0)).toUpperCase()
                )}
              </div>

              {/* Upload overlay */}
              <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow cursor-pointer opacity-0 group-hover:opacity-100 transition">
                <FaCamera className="text-green-600 text-sm" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </motion.div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-800">
                {user.fullName || user.username}
              </h2>
              <p className="text-gray-500">@{user.username}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!editMode ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                >
                  <FaEdit /> Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    <FaSave /> Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setEditMode(false)}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-300"
                  >
                    <FaTimes /> Cancel
                  </motion.button>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                <FaLock /> Change Password
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ================= DETAILS ================= */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <AnimatedField label="Full Name" name="fullName" value={formData.fullName} editMode={editMode} onChange={handleProfileChange} />
          <StaticField label="Email" value={formData.email} />
          <AnimatedField label="Phone" name="phone" value={formData.phone} editMode={editMode} onChange={handleProfileChange} />
          <AnimatedField label="State" name="state" value={formData.state} editMode={editMode} onChange={handleProfileChange} />
          <AnimatedField label="District" name="district" value={formData.district} editMode={editMode} onChange={handleProfileChange} />
          <AnimatedField label="Village" name="village" value={formData.village} editMode={editMode} onChange={handleProfileChange} />
          <StaticField label="Role" value={user.role || "Farmer"} />
          <StaticField label="Language" value={user.language || "English"} />
        </motion.div>

        {/* ================= PASSWORD MODAL ================= */}
        <AnimatePresence>
          {showPasswordModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold mb-4">Change Password</h3>

                <div className="space-y-3">
                  <input type="password" placeholder="Current Password" className="w-full px-4 py-2 border rounded-md" onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}/>
                  <input type="password" placeholder="New Password" className="w-full px-4 py-2 border rounded-md" onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}/>
                  <input type="password" placeholder="Confirm New Password" className="w-full px-4 py-2 border rounded-md" onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}/>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 border rounded-md">
                    Cancel
                  </button>
                  <button onClick={handlePasswordChange} className="px-4 py-2 bg-green-600 text-white rounded-md">
                    Update Password
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const AnimatedField = ({ label, name, value, editMode, onChange }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.3 }}
    className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl p-5 shadow-md"
  >
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    {editMode ? (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
      />
    ) : (
      <p className="font-semibold text-gray-800">{value || "Not provided"}</p>
    )}
  </motion.div>
);

const StaticField = ({ label, value }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.3 }}
    className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl p-5 shadow-md"
  >
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </motion.div>
);

export default Profile;
