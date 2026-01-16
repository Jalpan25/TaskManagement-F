import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {getSelfDeatils } from "../api/selfDetails.api.js"
import { useEffect,useState } from "react";

import Profile from "./Profile.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const[userDetails,setUserDeatils]=useState(null);
  const[showProfile,setshowProfile]=useState(false);
  useEffect(()=>{

    const fetchUserDetails=async()=>{
    const data=await getSelfDeatils();
    setUserDeatils(data.data);
    }

    fetchUserDetails();
  },[]);
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
          onClick={() => setshowProfile((prev) => !prev)}
          className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-semibold"
        >
          {userDetails?.name?.charAt(0).toUpperCase() || "U"}
        </button>

         {/* Profile dropdown */}
        {showProfile && userDetails && (
          <Profile data={userDetails} />
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
