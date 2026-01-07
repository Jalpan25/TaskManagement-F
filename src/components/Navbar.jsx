import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-lg font-bold">
        TaskManager
      </Link>

      <div className="flex gap-4 items-center">
        {user?.role === "ADMIN" && (
          <Link to="/admin" className="hover:underline">
            Admin Dashboard
          </Link>
        )}

        {user?.role === "USER" && (
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
