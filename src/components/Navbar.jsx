import { NavLink, useNavigate } from "react-router-dom";

import {
  FiHome,
  FiPlusCircle,
  FiPackage,
  FiClipboard,
  FiUser,
  FiLogOut,
  FiCpu,
} from "react-icons/fi";

import "./../styles/navbar.css";
function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="student-navbar">

      {/* =====================================
          BRAND
      ====================================== */}

      <div
        className="navbar-brand"
        onClick={() => navigate("/dashboard")}
      >
        <div className="navbar-brand-icon">
          <FiCpu />
        </div>

        <div className="navbar-brand-text">
          <h2>NRI Lost &amp; Found</h2>

          <span>
            AI Enabled Campus Portal
          </span>
        </div>
      </div>


      {/* =====================================
          NAVIGATION
      ====================================== */}

      <nav className="navbar-navigation">

        {/* DASHBOARD */}

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <FiHome />

          <span>
            Dashboard
          </span>
        </NavLink>


        {/* REPORT LOST */}

        <NavLink
          to="/report-lost"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <FiPlusCircle />

          <span>
            Report Lost
          </span>
        </NavLink>


        {/* REPORT FOUND */}

        <NavLink
          to="/report-found"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <FiPlusCircle />

          <span>
            Report Found
          </span>
        </NavLink>


        {/* MY ITEMS */}

        <NavLink
          to="/my-items"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <FiPackage />

          <span>
            My Items
          </span>
        </NavLink>


        {/* MY CLAIMS */}

        <NavLink
          to="/my-claims"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <FiClipboard />

          <span>
            My Claims
          </span>
        </NavLink>


        {/* PROFILE */}

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <FiUser />

          <span>
            Profile
          </span>
        </NavLink>


        {/* PROFILE CIRCLE */}

        <button
          type="button"
          className="navbar-profile-circle"
          onClick={() => navigate("/profile")}
          aria-label="Profile"
        >
          <FiUser />
        </button>


        {/* LOGOUT */}

        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
        >
          <FiLogOut />

          <span>
            Logout
          </span>
        </button>

      </nav>
    </header>
  );
}

export default Navbar;


