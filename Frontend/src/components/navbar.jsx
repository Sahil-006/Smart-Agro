import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call your logout function from auth context
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-gray-200 dark:border-white/10 shadow-xl rounded-full px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-700">
          SmartAgro
        </Link>

        <nav className="flex gap-6 font-medium items-center">
          <Link to="/">Home</Link>
          {isAuthenticated && <Link to="/dashboard" className="hover:text-green-700">Dashboard</Link>}
          <Link to="/about" className="hover:text-green-700">About Us</Link>
          <Link to="/contact" className="hover:text-green-700">Contact Us</Link>
          
          {isAuthenticated ? (
            <>
              <span className="text-green-700">Welcome, {user?.username}</span>
              <button 
                onClick={handleLogout}
                className="hover:text-green-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-700">Login</Link>
              <Link to="/signup" className="hover:text-green-700">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;