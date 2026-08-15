import { useEffect, useState } from "react";

import {
    FaChartBar,
    FaBox,
    FaClipboardCheck,
    FaTrash,
    FaEye,
    FaCheck,
    FaTimes,
    FaUndo,
    FaSearch,
    FaMapMarkerAlt,
    FaUser,
    FaRupeeSign,
    FaUserShield,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaBuilding,
    FaEdit,
    FaSave,
    FaLock,
    FaKey,
    FaShieldAlt,
    FaSignOutAlt,
    FaHome,
    FaTimesCircle
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "../styles/admindashboard.css";
import "../styles/adminprofile.css";


export default function AdminDashboard() {

    const navigate = useNavigate();

    // =====================================================
    // ACTIVE SECTION
    // =====================================================

    const [activeSection, setActiveSection] = useState("dashboard");


    // =====================================================
    // DASHBOARD STATE
    // =====================================================

    const [items, setItems] = useState([]);

    const [claims, setClaims] = useState([]);

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalItems: 0,
        totalClaims: 0,
        lostItems: 0,
        foundItems: 0,
        returnedItems: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        totalRewards: 0
    });

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");


    // =====================================================
    // PROFILE STATE
    // =====================================================

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        studentId: "",
        department: "",
        role: "ADMIN"
    });

    const [profileLoading, setProfileLoading] = useState(false);

    const [editing, setEditing] = useState(false);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    // =====================================================
    // PASSWORD STATE
    // =====================================================

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    useEffect(() => {
        loadAdminData();
    }, []);


    // =====================================================
    // LOAD ADMIN DATA
    // =====================================================

    const loadAdminData = async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {

                navigate("/login", {
                    replace: true
                });

                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };


            const [
                itemsResponse,
                claimsResponse,
                statsResponse
            ] = await Promise.all([
                api.get("/admin/items", config),
                api.get("/admin/claims", config),
                api.get("/admin/stats", config)
            ]);


            console.log(
                "ITEMS:",
                itemsResponse.data
            );

            console.log(
                "CLAIMS:",
                claimsResponse.data
            );

            console.log(
                "STATS:",
                statsResponse.data
            );


            // -----------------------------
            // ITEMS
            // -----------------------------

            const receivedItems =
                Array.isArray(itemsResponse.data)
                    ? itemsResponse.data
                    : itemsResponse.data?.items || [];

            setItems(receivedItems);


            // -----------------------------
            // CLAIMS
            // -----------------------------

            const receivedClaims =
                Array.isArray(claimsResponse.data)
                    ? claimsResponse.data
                    : claimsResponse.data?.claims || [];

            setClaims(receivedClaims);


            // -----------------------------
            // STATS
            // -----------------------------

            if (statsResponse.data) {

                const receivedStats =
                    statsResponse.data.stats ||
                    statsResponse.data;

                setStats({
                    totalUsers:
                        receivedStats.totalUsers || 0,

                    totalItems:
                        receivedStats.totalItems || 0,

                    totalClaims:
                        receivedStats.totalClaims || 0,

                    lostItems:
                        receivedStats.lostItems || 0,

                    foundItems:
                        receivedStats.foundItems || 0,

                    returnedItems:
                        receivedStats.returnedItems || 0,

                    pendingClaims:
                        receivedStats.pendingClaims || 0,

                    approvedClaims:
                        receivedStats.approvedClaims || 0,

                    rejectedClaims:
                        receivedStats.rejectedClaims || 0,

                    totalRewards:
                        receivedStats.totalRewards || 0
                });
            }


        } catch (err) {

            console.error(
                "ADMIN DASHBOARD ERROR:",
                err
            );


            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                navigate("/login", {
                    replace: true
                });
            }

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // LOAD PROFILE
    // =====================================================

    const loadProfile = async () => {

        try {

            setProfileLoading(true);

            setMessage("");

            setError("");


            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login", {
                    replace: true
                });

                return;
            }


            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };


            try {

                const response =
                    await api.get(
                        "/auth/profile",
                        config
                    );


                const data =
                    response.data;


                const user =
                    data.user || data;


                setProfile({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    studentId:
                        user.studentId || "",
                    department:
                        user.department || "",
                    role:
                        user.role || "ADMIN"
                });


                localStorage.setItem(
                    "user",
                    JSON.stringify(user)
                );


            } catch (profileError) {

                console.log(
                    "Profile API unavailable. Using local user data."
                );


                const savedUser =
                    JSON.parse(
                        localStorage.getItem(
                            "user"
                        ) || "{}"
                    );


                setProfile({
                    name:
                        savedUser.name || "",
                    email:
                        savedUser.email || "",
                    phone:
                        savedUser.phone || "",
                    studentId:
                        savedUser.studentId || "",
                    department:
                        savedUser.department || "",
                    role:
                        savedUser.role || "ADMIN"
                });

            }

        } catch (err) {

            console.error(
                "PROFILE ERROR:",
                err
            );

            setError(
                "Unable to load profile."
            );

        } finally {

            setProfileLoading(false);

        }
    };


    // =====================================================
    // OPEN DASHBOARD
    // =====================================================

    const openDashboard = () => {

        setActiveSection("dashboard");

        setMessage("");

        setError("");

    };


    // =====================================================
    // OPEN PROFILE
    // =====================================================

    const openProfile = () => {

        setActiveSection("profile");

        loadProfile();

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        const confirmLogout =
            window.confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmLogout) {
            return;
        }


        localStorage.removeItem("token");

        localStorage.removeItem("role");

        localStorage.removeItem("user");


        navigate("/login", {
            replace: true
        });

    };


    // =====================================================
    // VIEW ITEM
    // =====================================================

    const handleView = (item) => {

        const userName =
            item.user?.name ||
            "Unknown User";


        const userEmail =
            item.user?.email ||
            "N/A";


        alert(
            "ITEM DETAILS\n\n" +
            "Title: " +
            (item.title || "N/A") +
            "\n\nCategory: " +
            (item.category || "N/A") +
            "\n\nDescription: " +
            (item.description || "N/A") +
            "\n\nLocation: " +
            (item.location || "N/A") +
            "\n\nStatus: " +
            (item.status || "N/A") +
            "\n\nReward: ₹" +
            (item.reward || 0) +
            "\n\nReported By: " +
            userName +
            "\n\nEmail: " +
            userEmail
        );

    };


    // =====================================================
    // DELETE ITEM
    // =====================================================

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this item?\n\nAll related claims will also be deleted."
            );


        if (!confirmDelete) {
            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            await api.delete(
                `/admin/items/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            alert(
                "Item deleted successfully."
            );


            setItems(
                previousItems =>
                    previousItems.filter(
                        item =>
                            item.id !== id
                    )
            );


            setClaims(
                previousClaims =>
                    previousClaims.filter(
                        claim =>
                            claim.itemId !== id
                    )
            );


            loadAdminData();


        } catch (err) {

            console.error(
                "DELETE ITEM ERROR:",
                err
            );


            alert(
                err.response?.data?.message ||
                "Unable to delete item."
            );

        }

    };


    // =====================================================
    // APPROVE CLAIM
    // =====================================================

    const handleApprove = async (id) => {

        const confirmApprove =
            window.confirm(
                "Are you sure you want to approve this claim?"
            );


        if (!confirmApprove) {
            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            await api.put(
                `/admin/claims/${id}/approve`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            alert(
                "Claim approved successfully."
            );


            setClaims(
                previousClaims =>
                    previousClaims.map(
                        claim =>
                            claim.id === id
                                ? {
                                    ...claim,
                                    status:
                                        "APPROVED",
                                    verified:
                                        true
                                }
                                : claim
                    )
            );


            loadAdminData();


        } catch (err) {

            console.error(
                "APPROVE CLAIM ERROR:",
                err
            );


            alert(
                err.response?.data?.message ||
                "Unable to approve claim."
            );

        }

    };


    // =====================================================
    // REJECT CLAIM
    // =====================================================

    const handleReject = async (id) => {

        const confirmReject =
            window.confirm(
                "Are you sure you want to reject this claim?"
            );


        if (!confirmReject) {
            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            await api.put(
                `/admin/claims/${id}/reject`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            alert(
                "Claim rejected successfully."
            );


            setClaims(
                previousClaims =>
                    previousClaims.map(
                        claim =>
                            claim.id === id
                                ? {
                                    ...claim,
                                    status:
                                        "REJECTED",
                                    verified:
                                        false
                                }
                                : claim
                    )
            );


            loadAdminData();


        } catch (err) {

            console.error(
                "REJECT CLAIM ERROR:",
                err
            );


            alert(
                err.response?.data?.message ||
                "Unable to reject claim."
            );

        }

    };


    // =====================================================
    // RETURN ITEM
    // =====================================================

    const handleReturn = async (id) => {

        const confirmReturn =
            window.confirm(
                "Mark this item as returned?"
            );


        if (!confirmReturn) {
            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            await api.put(
                `/admin/items/${id}/return`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            alert(
                "Item marked as returned."
            );


            setItems(
                previousItems =>
                    previousItems.map(
                        item =>
                            item.id === id
                                ? {
                                    ...item,
                                    status:
                                        "RETURNED"
                                }
                                : item
                    )
            );


            loadAdminData();


        } catch (err) {

            console.error(
                "RETURN ITEM ERROR:",
                err
            );


            alert(
                err.response?.data?.message ||
                "Unable to return item."
            );

        }

    };


    // =====================================================
    // PROFILE INPUT
    // =====================================================

    const handleProfileChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setProfile(
            previous => ({
                ...previous,
                [name]: value
            })
        );

    };


    // =====================================================
    // PASSWORD INPUT
    // =====================================================

    const handlePasswordChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setPasswordData(
            previous => ({
                ...previous,
                [name]: value
            })
        );

    };


    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const saveProfile = async () => {

        try {

            setSaving(true);

            setMessage("");

            setError("");


            const token =
                localStorage.getItem("token");


            const response =
                await api.put(
                    "/auth/profile",
                    {
                        name:
                            profile.name,

                        email:
                            profile.email,

                        phone:
                            profile.phone,

                        studentId:
                            profile.studentId,

                        department:
                            profile.department
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const updatedUser =
                response.data.user ||
                profile;


            const finalProfile = {

                name:
                    updatedUser.name || "",

                email:
                    updatedUser.email || "",

                phone:
                    updatedUser.phone || "",

                studentId:
                    updatedUser.studentId || "",

                department:
                    updatedUser.department || "",

                role:
                    updatedUser.role ||
                    profile.role ||
                    "ADMIN"

            };


            setProfile(finalProfile);


            localStorage.setItem(
                "user",
                JSON.stringify(
                    updatedUser
                )
            );


            setEditing(false);


            setMessage(
                "Profile updated successfully."
            );


        } catch (err) {

            console.error(
                "SAVE PROFILE ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to update profile."
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // CANCEL PROFILE EDIT
    // =====================================================

    const cancelEdit = () => {

        loadProfile();

        setEditing(false);

        setMessage("");

        setError("");

    };


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const changePassword = async () => {

        setMessage("");

        setError("");


        if (
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
        ) {

            setError(
                "Please fill all password fields."
            );

            return;
        }


        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {

            setError(
                "New password and confirm password do not match."
            );

            return;
        }


        if (
            passwordData.newPassword.length < 6
        ) {

            setError(
                "New password must contain at least 6 characters."
            );

            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            await api.put(
                "/auth/change-password",
                {
                    currentPassword:
                        passwordData.currentPassword,

                    newPassword:
                        passwordData.newPassword
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            setMessage(
                "Password changed successfully."
            );


            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });


        } catch (err) {

            console.error(
                "CHANGE PASSWORD ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to change password."
            );

        }

    };


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredItems =
        items.filter(item => {

            const text = [

                item.title,

                item.category,

                item.location,

                item.status,

                item.user?.name,

                item.user?.email

            ]
                .filter(Boolean)
                .join(" ");


            return text
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                );

        });


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading &&
        activeSection === "dashboard"
    ) {

        return (

            <div className="admin-loading-screen">

                <div className="loading-spinner"></div>

                <h3>
                    Loading Admin Dashboard...
                </h3>

                <p>
                    Please wait while we load
                    the data.
                </p>

            </div>

        );

    }


    // =====================================================
    // MAIN
    // =====================================================

    return (

        <div className="admin-page">


            {/* =================================================
                ADMIN NAVBAR
            ================================================= */}

            <nav className="admin-navbar">


                {/* LOGO */}

                <div className="admin-logo">

                    <div className="admin-logo-icon">

                        <FaUserShield />

                    </div>


                    <div className="admin-logo-text">

                        <h2>
                            Admin Panel
                        </h2>

                        <p>
                            AI Campus Lost & Found
                        </p>

                    </div>

                </div>


                {/* NAVIGATION */}

                <div className="admin-menu">


                    <button
                        type="button"
                        className={
                            activeSection ===
                            "dashboard"
                                ? "admin-link active"
                                : "admin-link"
                        }
                        onClick={
                            openDashboard
                        }
                    >

                        <FaChartBar />

                        <span>
                            Dashboard
                        </span>

                    </button>


                    <button
                        type="button"
                        className={
                            activeSection ===
                            "profile"
                                ? "admin-link active"
                                : "admin-link"
                        }
                        onClick={
                            openProfile
                        }
                    >

                        <FaUser />

                        <span>
                            Profile
                        </span>

                    </button>


                </div>


                {/* LOGOUT */}

                <button
                    type="button"
                    className="admin-logout"
                    onClick={logout}
                >

                    <FaSignOutAlt />

                    <span>
                        Logout
                    </span>

                </button>


            </nav>


            {/* =================================================
                PROFILE SECTION
            ================================================= */}

            {activeSection ===
                "profile" && (

                <main className="admin-profile-container">


                    {/* PROFILE HEADER */}

                    <section className="admin-profile-hero">

                        <div className="hero-profile-icon">

                            <FaUserShield />

                        </div>


                        <div className="hero-profile-content">

                            <span className="admin-label">
                                ADMINISTRATOR ACCOUNT
                            </span>

                            <h1>
                                {profile.name ||
                                    "Administrator"}
                            </h1>

                            <h2>
                                AI Campus Lost & Found
                            </h2>

                            <p>
                                Manage your administrator
                                account and monitor your
                                portal activity.
                            </p>

                        </div>


                        <div className="hero-security">

                            <FaShieldAlt />

                            Secure Admin Account

                        </div>

                    </section>


                    {/* MESSAGES */}

                    {message && (

                        <div className="admin-success-message">

                            <FaCheck />

                            {message}

                        </div>

                    )}


                    {error && (

                        <div className="admin-error-message">

                            <FaTimesCircle />

                            {error}

                        </div>

                    )}


                    {/* PROFILE OVERVIEW */}

                    <section className="admin-overview">

                        <div className="overview-avatar">

                            <FaUserShield />

                        </div>


                        <div className="overview-info">

                            <span>
                                Logged in as
                            </span>

                            <h2>
                                {profile.name ||
                                    "Administrator"}
                            </h2>

                            <p>
                                {profile.email ||
                                    "Administrator account"}
                            </p>

                        </div>


                        <div className="overview-role">

                            <FaShieldAlt />

                            <div>

                                <span>
                                    Account Role
                                </span>

                                <strong>
                                    {profile.role ||
                                        "ADMIN"}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* ACCOUNT INFORMATION */}

                    <section className="admin-card">

                        <div className="admin-card-header">

                            <div>

                                <span className="card-label">
                                    ACCOUNT INFORMATION
                                </span>

                                <h2>
                                    Administrator Profile
                                </h2>

                                <p>
                                    View and update your
                                    account information.
                                </p>

                            </div>


                            {!editing && (

                                <button
                                    type="button"
                                    className="admin-edit-btn"
                                    onClick={() =>
                                        setEditing(true)
                                    }
                                >

                                    <FaEdit />

                                    Edit Profile

                                </button>

                            )}

                        </div>


                        <div className="admin-profile-grid">


                            {/* NAME */}

                            <div className="admin-field">

                                <label>
                                    Full Name
                                </label>


                                {editing ? (

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            profile.name
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter full name"
                                    />

                                ) : (

                                    <div className="field-value">

                                        <FaUser />

                                        {profile.name ||
                                            "Not available"}

                                    </div>

                                )}

                            </div>


                            {/* EMAIL */}

                            <div className="admin-field">

                                <label>
                                    Email Address
                                </label>


                                {editing ? (

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            profile.email
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter email"
                                    />

                                ) : (

                                    <div className="field-value">

                                        <FaEnvelope />

                                        {profile.email ||
                                            "Not available"}

                                    </div>

                                )}

                            </div>


                            {/* PHONE */}

                            <div className="admin-field">

                                <label>
                                    Phone Number
                                </label>


                                {editing ? (

                                    <input
                                        type="text"
                                        name="phone"
                                        value={
                                            profile.phone
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter phone number"
                                    />

                                ) : (

                                    <div className="field-value">

                                        <FaPhone />

                                        {profile.phone ||
                                            "Not available"}

                                    </div>

                                )}

                            </div>


                            {/* ID */}

                            <div className="admin-field">

                                <label>
                                    ID / Employee ID
                                </label>


                                {editing ? (

                                    <input
                                        type="text"
                                        name="studentId"
                                        value={
                                            profile.studentId
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter ID"
                                    />

                                ) : (

                                    <div className="field-value">

                                        <FaIdCard />

                                        {profile.studentId ||
                                            "Not available"}

                                    </div>

                                )}

                            </div>


                            {/* DEPARTMENT */}

                            <div className="admin-field">

                                <label>
                                    Department
                                </label>


                                {editing ? (

                                    <input
                                        type="text"
                                        name="department"
                                        value={
                                            profile.department
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter department"
                                    />

                                ) : (

                                    <div className="field-value">

                                        <FaBuilding />

                                        {profile.department ||
                                            "Administration"}

                                    </div>

                                )}

                            </div>


                            {/* ROLE */}

                            <div className="admin-field">

                                <label>
                                    Account Role
                                </label>


                                <div className="field-value">

                                    <FaShieldAlt />

                                    {profile.role ||
                                        "ADMIN"}

                                </div>

                            </div>

                        </div>


                        {/* EDIT BUTTONS */}

                        {editing && (

                            <div className="profile-edit-actions">

                                <button
                                    type="button"
                                    className="cancel-admin-btn"
                                    onClick={
                                        cancelEdit
                                    }
                                    disabled={
                                        saving
                                    }
                                >

                                    <FaTimes />

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    className="save-admin-btn"
                                    onClick={
                                        saveProfile
                                    }
                                    disabled={
                                        saving
                                    }
                                >

                                    <FaSave />

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        )}

                    </section>


                    {/* SECURITY */}

                    <section className="admin-card security-card">

                        <div className="admin-card-header">

                            <div>

                                <span className="card-label">
                                    ACCOUNT SECURITY
                                </span>

                                <h2>
                                    Change Password
                                </h2>

                                <p>
                                    Update your administrator
                                    account password.
                                </p>

                            </div>


                            <div className="security-icon">

                                <FaLock />

                            </div>

                        </div>


                        <div className="password-grid">


                            <div className="admin-field">

                                <label>
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={
                                        passwordData.currentPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Current password"
                                />

                            </div>


                            <div className="admin-field">

                                <label>
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="newPassword"
                                    value={
                                        passwordData.newPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="New password"
                                />

                            </div>


                            <div className="admin-field">

                                <label>
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={
                                        passwordData.confirmPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Confirm new password"
                                />

                            </div>

                        </div>


                        <button
                            type="button"
                            className="change-password-btn"
                            onClick={
                                changePassword
                            }
                        >

                            <FaKey />

                            Change Password

                        </button>

                    </section>


                    {/* PROFILE FOOTER */}

                    <div className="admin-profile-footer">

                        <FaShieldAlt />

                        <div>

                            <strong>
                                Administrator Security
                            </strong>

                            <span>
                                Your administrator account
                                is protected using secure
                                authentication.
                            </span>

                        </div>

                    </div>

                </main>

            )}


            {/* =================================================
                DASHBOARD SECTION
            ================================================= */}

            {activeSection ===
                "dashboard" && (

                <main className="admin-dashboard-container">


                    {/* HERO */}

                    <section className="admin-hero">

                        <div className="hero-left">

                            <div className="hero-badge">

                                <FaChartBar />

                                ADMIN CONTROL PANEL

                            </div>


                            <h1>
                                AI Campus Lost & Found
                            </h1>


                            <h2>
                                Administrator Dashboard
                            </h2>


                            <p>
                                Manage lost items,
                                found items, claims
                                and returned items
                                from one centralized
                                dashboard.
                            </p>

                        </div>


                        <div className="hero-right">

                            <div className="hero-card">

                                <div className="hero-icon-wrapper">

                                    <FaChartBar />

                                </div>

                                <h3>
                                    Admin Panel
                                </h3>

                                <p>
                                    System management
                                    and monitoring
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* SECTION HEADER */}

                    <div className="dashboard-section-header">

                        <div>

                            <span className="section-label">
                                OVERVIEW
                            </span>

                            <h2>
                                System Statistics
                            </h2>

                            <p>
                                Current campus lost
                                and found activity.
                            </p>

                        </div>


                        <div className="live-indicator">

                            <span></span>

                            System Live

                        </div>

                    </div>


                    {/* STATISTICS */}

                    <div className="stats-grid">


                        <div className="stat-card users">

                            <div className="stat-icon">

                                <FaUser />

                            </div>

                            <div className="stat-content">

                                <span className="stat-label">
                                    TOTAL USERS
                                </span>

                                <h2>
                                    {stats.totalUsers}
                                </h2>

                                <p>
                                    Registered users
                                </p>

                            </div>

                        </div>


                        <div className="stat-card items">

                            <div className="stat-icon">

                                <FaBox />

                            </div>

                            <div className="stat-content">

                                <span className="stat-label">
                                    TOTAL ITEMS
                                </span>

                                <h2>
                                    {stats.totalItems}
                                </h2>

                                <p>
                                    Reported items
                                </p>

                            </div>

                        </div>


                        <div className="stat-card claims">

                            <div className="stat-icon">

                                <FaClipboardCheck />

                            </div>

                            <div className="stat-content">

                                <span className="stat-label">
                                    TOTAL CLAIMS
                                </span>

                                <h2>
                                    {stats.totalClaims}
                                </h2>

                                <p>
                                    Student claims
                                </p>

                            </div>

                        </div>


                        <div className="stat-card pending">

                            <div className="stat-icon">

                                <FaClipboardCheck />

                            </div>

                            <div className="stat-content">

                                <span className="stat-label">
                                    PENDING CLAIMS
                                </span>

                                <h2>
                                    {stats.pendingClaims}
                                </h2>

                                <p>
                                    Need verification
                                </p>

                            </div>

                        </div>


                        <div className="stat-card rewards">

                            <div className="stat-icon">

                                <FaRupeeSign />

                            </div>

                            <div className="stat-content">

                                <span className="stat-label">
                                    TOTAL REWARDS
                                </span>

                                <h2>
                                    ₹
                                    {Number(
                                        stats.totalRewards ||
                                            0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </h2>

                                <p>
                                    Reward amount
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* SEARCH */}

                    <div className="toolbar">

                        <div className="search-box">

                            <FaSearch />

                            <input
                                type="text"
                                placeholder="Search items..."
                                value={search}
                                onChange={
                                    e =>
                                        setSearch(
                                            e.target.value
                                        )
                                }
                            />

                        </div>

                    </div>


                    {/* ITEMS */}

                    <section className="table-section">

                        <div className="table-header">

                            <div>

                                <span className="table-label">
                                    ITEM MANAGEMENT
                                </span>

                                <h2 className="section-title">

                                    <FaBox />

                                    Reported Items

                                </h2>

                                <p>
                                    View, return and
                                    delete reported
                                    items.
                                </p>

                            </div>


                            <span className="record-count">

                                {filteredItems.length}
                                {" "}Records

                            </span>

                        </div>


                        <div className="table-container">

                            <table className="admin-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Image
                                        </th>

                                        <th>
                                            Item
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Location
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Reward
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredItems.length ===
                                    0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="empty-table-cell"
                                            >
                                                No items found.
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredItems.map(
                                            item => (

                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <td>

                                                        {item.image ? (

                                                            <img
                                                                src={
                                                                    item.image
                                                                }
                                                                alt={
                                                                    item.title ||
                                                                    "Item"
                                                                }
                                                                className="table-image"
                                                            />

                                                        ) : (

                                                            <div className="no-table-image">

                                                                <FaBox />

                                                            </div>

                                                        )}

                                                    </td>


                                                    <td>

                                                        <span className="item-title">

                                                            {
                                                                item.title ||
                                                                "Untitled Item"
                                                            }

                                                        </span>


                                                        <span className="item-user">

                                                            {
                                                                item.user?.name ||
                                                                "Unknown User"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="category-text">

                                                            {
                                                                item.category ||
                                                                "N/A"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="location-text">

                                                            <FaMapMarkerAlt />

                                                            {
                                                                item.location ||
                                                                "N/A"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                "status " +
                                                                String(
                                                                    item.status ||
                                                                        "UNKNOWN"
                                                                ).toLowerCase()
                                                            }
                                                        >

                                                            {
                                                                item.status ||
                                                                "N/A"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="reward-text">

                                                            ₹
                                                            {
                                                                item.reward ||
                                                                0
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="action-buttons">


                                                            <button
                                                                type="button"
                                                                className="view-btn"
                                                                title="View Item"
                                                                onClick={() =>
                                                                    handleView(
                                                                        item
                                                                    )
                                                                }
                                                            >

                                                                <FaEye />

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="return-btn"
                                                                title="Mark Returned"
                                                                onClick={() =>
                                                                    handleReturn(
                                                                        item.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    String(
                                                                        item.status
                                                                    ).toUpperCase() ===
                                                                    "RETURNED"
                                                                }
                                                            >

                                                                <FaUndo />

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="delete-btn"
                                                                title="Delete Item"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id
                                                                    )
                                                                }
                                                            >

                                                                <FaTrash />

                                                            </button>


                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>


                    {/* CLAIMS */}

                    <section className="table-section">

                        <div className="table-header">

                            <div>

                                <span className="table-label">
                                    CLAIM MANAGEMENT
                                </span>

                                <h2 className="section-title">

                                    <FaClipboardCheck />

                                    Claims

                                </h2>

                                <p>
                                    Approve or reject
                                    student claims.
                                </p>

                            </div>


                            <span className="record-count">

                                {claims.length}
                                {" "}Claims

                            </span>

                        </div>


                        <div className="table-container">

                            <table className="admin-table claims-table">

                                <thead>

                                    <tr>

                                        <th>
                                            User
                                        </th>

                                        <th>
                                            Item
                                        </th>

                                        <th>
                                            Message
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {claims.length ===
                                    0 ? (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="empty-table-cell"
                                            >
                                                No claims found.
                                            </td>

                                        </tr>

                                    ) : (

                                        claims.map(
                                            claim => (

                                                <tr
                                                    key={
                                                        claim.id
                                                    }
                                                >

                                                    <td>

                                                        <span className="user-name">

                                                            {
                                                                claim.user?.name ||
                                                                "Unknown User"
                                                            }

                                                        </span>


                                                        <span className="user-email">

                                                            {
                                                                claim.user?.email ||
                                                                "No email"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="claim-item">

                                                            {
                                                                claim.item?.title ||
                                                                "Unknown Item"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="message-cell">

                                                            {
                                                                claim.message ||
                                                                "No message"
                                                            }

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                "status " +
                                                                String(
                                                                    claim.status ||
                                                                        "PENDING"
                                                                ).toLowerCase()
                                                            }
                                                        >

                                                            {
                                                                claim.status ||
                                                                "PENDING"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="action-buttons">


                                                            <button
                                                                type="button"
                                                                className="approve-btn"
                                                                title="Approve Claim"
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        claim.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    String(
                                                                        claim.status
                                                                    ).toUpperCase() ===
                                                                    "APPROVED"
                                                                }
                                                            >

                                                                <FaCheck />

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="reject-btn"
                                                                title="Reject Claim"
                                                                onClick={() =>
                                                                    handleReject(
                                                                        claim.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    String(
                                                                        claim.status
                                                                    ).toUpperCase() ===
                                                                    "REJECTED"
                                                                }
                                                            >

                                                                <FaTimes />

                                                            </button>


                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>


                    {/* FOOTER */}

                    <div className="admin-profile-footer">

                        <div className="footer-icon">

                            <FaChartBar />

                        </div>


                        <div>

                            <strong>
                                AI Campus Lost & Found
                                Administration
                            </strong>

                            <span>
                                Secure administrator
                                control panel.
                            </span>

                        </div>

                    </div>

                </main>

            )}

        </div>

    );
}
