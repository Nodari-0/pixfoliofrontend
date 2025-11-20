import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black text-white border-b-2 border-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-2xl font-black uppercase tracking-tighter">
              PIXFOLIO
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className={`font-bold uppercase text-sm tracking-wider transition-colors ${
                    isActive("/")
                      ? "text-white border-b-2 border-white pb-1"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Explore
                </Link>
                <Link
                  to="/favorites"
                  className={`font-bold uppercase text-sm tracking-wider transition-colors flex items-center space-x-1 ${
                    isActive("/favorites")
                      ? "text-white border-b-2 border-white pb-1"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill={isActive("/favorites") ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>Favorites</span>
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="text-white font-bold uppercase text-xs tracking-wider">{user?.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white text-black hover:bg-gray-200 font-bold uppercase text-xs tracking-wider transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:text-gray-300 font-bold uppercase text-sm tracking-wider transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-white text-black hover:bg-gray-200 font-bold uppercase text-sm tracking-wider transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
