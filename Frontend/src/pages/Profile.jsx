import { useAuth } from "../context/authContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* HEADER CARD */}
      <div className="relative bg-white/70 backdrop-blur-lg border border-gray-200 shadow-xl rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">

          {/* AVATAR */}
          <div className="w-24 h-24 rounded-full bg-green-600 text-white flex items-center justify-center text-4xl font-bold shadow-md">
            {user.fullName?.charAt(0).toUpperCase() ||
              user.username?.charAt(0).toUpperCase()}
          </div>

          {/* BASIC INFO */}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800">
              {user.fullName || "User"}
            </h2>
            <p className="text-gray-500">@{user.username}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            disabled
            className="px-5 py-2 rounded-md bg-green-600 text-white opacity-80 cursor-not-allowed"
          >
            Edit Profile (Coming Soon)
          </button>

          <button
            disabled
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-600 opacity-70 cursor-not-allowed"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ProfileCard label="Username" value={user.username} />
        <ProfileCard label="Email" value={user.email} />
        <ProfileCard label="Phone" value={user.phone || "Not provided"} />
        <ProfileCard label="Location" value={
          user.village
            ? `${user.village}, ${user.district}, ${user.state}`
            : "Not provided"
        } />
        <ProfileCard label="Role" value={user.role || "Farmer"} />
        <ProfileCard label="Language" value={user.language || "English"} />
      </div>
    </div>
  );
};

const ProfileCard = ({ label, value }) => (
  <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-xl p-5 shadow-md">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);

export default Profile;
