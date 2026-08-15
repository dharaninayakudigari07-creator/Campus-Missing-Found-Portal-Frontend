import { useState } from "react";

import {
    FaChartBar,
    FaUserCircle,
    FaSignOutAlt,
    FaUserShield,
} from "react-icons/fa";

import "../styles/adminnavbar.css";

export default function AdminNavbar({ activePage, setActivePage }) {

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    return (
        <nav className="admin-navbar">

            {/* LOGO */}
            <div className="admin-logo">

                <div className="admin-logo-icon">
                    <FaUserShield />
                </div>

                <div className="admin-logo-text">
                    <h2>Admin Panel</h2>
                    <p>AI Campus Lost & Found</p>
                </div>

            </div>


            {/* MENU */}
            <div className="admin-menu">

                <button
                    type="button"
                    className={
                        activePage === "dashboard"
                            ? "admin-link active"
                            : "admin-link"
                    }
                    onClick={() => setActivePage("dashboard")}
                >
                    <FaChartBar />
                    <span>Dashboard</span>
                </button>


                <button
                    type="button"
                    className={
                        activePage === "profile"
                            ? "admin-link active"
                            : "admin-link"
                    }
                    onClick={() => setActivePage("profile")}
                >
                    <FaUserCircle />
                    <span>Profile</span>
                </button>

            </div>


            {/* LOGOUT */}
            <button
                type="button"
                className="admin-logout"
                onClick={logout}
            >
                <FaSignOutAlt />
                <span>Logout</span>
            </button>

        </nav>
    );
}

