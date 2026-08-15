import { useEffect, useState } from "react";

import {
    FaUserShield,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaBuilding,
    FaEdit,
    FaSave,
    FaTimes,
    FaLock,
    FaShieldAlt,
    FaKey,
    
    FaBoxOpen,
    FaClipboardCheck,
    FaMoneyBillWave,
    FaCheckCircle
} from "react-icons/fa";

import AdminNavbar from "../components/AdminNavbar";

import api from "../services/api";

import "../styles/adminprofile.css";


export default function AdminProfile() {

    /* =========================================
       STATE
    ========================================= */

    const [, setUser] = useState(
        JSON.parse(
            localStorage.getItem("user") || "{}"
        )
    );


    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        studentId: "",
        department: "",
        role: ""
    });


    const [statistics, setStatistics] = useState({
        items: 0,
        claims: 0,
        rewards: 0,
        aiMatches: 0
    });


    const [editing, setEditing] = useState(false);


    const [, setLoading] = useState(true);


    const [saving, setSaving] = useState(false);


    const [message, setMessage] = useState("");


    const [error, setError] = useState("");


    const [passwordData, setPasswordData] =
        useState({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });


    


    /* =========================================
       INPUT CHANGE
    ========================================= */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setProfile(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

    };


    /* =========================================
       SAVE PROFILE
    ========================================= */

    const saveProfile = async () => {

        try {

            setSaving(true);

            setMessage("");

            setError("");


            const res =
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
                    }
                );


            const updatedUser =
                res.data.user ||
                profile;


            setProfile({

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

            });


            setUser(updatedUser);


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

            console.error(err);


            setError(
                err.response?.data?.message ||
                "Unable to update profile."
            );
            setSaving(false);

        }

    };


    /* =========================================
       CANCEL EDIT
    ========================================= */

    const cancelEdit = () => {

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


        setEditing(false);

        setMessage("");

        setError("");

    };


    /* =========================================
       PASSWORD INPUT
    ========================================= */

    const handlePasswordChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setPasswordData(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

    };


    /* =========================================
       CHANGE PASSWORD
    ========================================= */

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

            await api.put(
                "/auth/change-password",
                {
                    currentPassword:
                        passwordData.currentPassword,

                    newPassword:
                        passwordData.newPassword
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

            console.error(err);


            setError(
                err.response?.data?.message ||
                "Unable to change password."
            );

        }

    };


    /* =========================================
       LOAD PROFILE
    ========================================= */

    const loadProfile = async () => {

        try {

            setLoading(true);

            setError("");


            const res =
                await api.get("/auth/profile");


            const data =
                res.data;


            const profileUser =
                data.user || data;


            setProfile({

                name:
                    profileUser.name || "",

                email:
                    profileUser.email || "",

                phone:
                    profileUser.phone || "",

                studentId:
                    profileUser.studentId || "",

                department:
                    profileUser.department || "",

                role:
                    profileUser.role || "ADMIN"

            });


            setStatistics({

                items:
                    data.items || 0,

                claims:
                    data.claims || 0,

                rewards:
                    data.rewards || 0,

                aiMatches:
                    data.aiMatches || 0

            });


            setUser(profileUser);


            localStorage.setItem(
                "user",
                JSON.stringify(
                    profileUser
                )
            );


        } catch (err) {

            console.error(err);

            setError(
                "Unable to load profile."
            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        Promise.resolve().then(() => loadProfile());
    }, []);
    


    return (
        <div className="admin-profile-page">

            <AdminNavbar />

            <main>

                {/* =================================
                    MESSAGES
                ================================= */}

                {message && (

                    <div className="admin-success-message">

                        <FaCheckCircle />

                        {message}

                    </div>

                )}


                {error && (

                    <div className="admin-error-message">

                        <FaTimes />

                        {error}

                    </div>

                )}


                {/* =================================
                    PROFILE OVERVIEW
                ================================= */}

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


                {/* =================================
                    PERSONAL INFORMATION
                ================================= */}

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
                                        handleChange
                                    }
                                    placeholder="Enter full name"
                                />

                            ) : (

                                <div className="field-value">

                                    <FaUserShield />

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
                                        handleChange
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
                                        handleChange
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


                        {/* STUDENT ID */}

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
                                        handleChange
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
                                        handleChange
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


                            <div className="field-value role-value">

                                <FaShieldAlt />

                                {profile.role ||
                                "ADMIN"}

                            </div>

                        </div>

                    </div>


                    {/* EDIT ACTIONS */}

                    {editing && (

                        <div className="profile-edit-actions">


                            <button
                                className="cancel-admin-btn"
                                onClick={
                                    cancelEdit
                                }
                                disabled={saving}
                            >

                                <FaTimes />

                                Cancel

                            </button>


                            <button
                                className="save-admin-btn"
                                onClick={
                                    saveProfile
                                }
                                disabled={saving}
                            >

                                <FaSave />

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"
                                }

                            </button>

                        </div>

                    )}

                </section>


                {/* =================================
                    STATISTICS
                ================================= */}

                <section className="admin-stat-grid">


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">

                            <FaBoxOpen />

                        </div>

                        <div>

                            <span>
                                Items Reported
                            </span>

                            <strong>
                                {statistics.items}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">

                            <FaClipboardCheck />

                        </div>

                        <div>

                            <span>
                                Claims
                            </span>

                            <strong>
                                {statistics.claims}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">

                            <FaMoneyBillWave />

                        </div>

                        <div>

                            <span>
                                Rewards
                            </span>

                            <strong>
                                ₹{statistics.rewards}
                            </strong>

                        </div>

                    </div>


                </section>


                {/* =================================
                    SECURITY
                ================================= */}

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
                        className="change-password-btn"
                        onClick={
                            changePassword
                        }
                    >

                        <FaKey />

                        Change Password

                    </button>

                </section>


                {/* =================================
                    FOOTER
                ================================= */}

                <div className="admin-profile-footer">

                    <FaShieldAlt />

                    <div>

                        <strong>

                            Administrator Security

                        </strong>

                        <span>

                            Your administrator account
                            is protected using secure
                            authentication and encrypted
                            password storage.

                        </span>

                    </div>

                </div>


            </main>

        </div>

    );

}