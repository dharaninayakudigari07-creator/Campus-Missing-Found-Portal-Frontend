import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaShieldAlt,
    FaRobot,
    FaMapMarkerAlt,
    FaSearch,
    FaArrowRight,
} from "react-icons/fa";

import api from "../services/api";
import "../styles/login.css";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const loginUser = async (e) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const token = response.data?.token;
            const user = response.data?.user;

            if (!token || !user) {
                setError("Invalid response from server.");
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role || "student");
            localStorage.setItem("user", JSON.stringify(user));

            if (user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }

        } catch (err) {
            console.error("Login Error:", err);

            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">

            <div className="login-card">

                {/* LEFT PANEL */}

                <section className="login-left">

                    <div className="login-brand-icon">
                        <FaShieldAlt />
                    </div>

                    <span className="login-overline">
                        AI POWERED CAMPUS PLATFORM
                    </span>

                    <h1>
                        NRI Campus
                        <span>Lost & Found</span>
                    </h1>

                    <p className="login-description">
                        A smarter way to report, discover and recover
                        lost belongings across the campus.
                    </p>


                    <div className="login-features">

                        <div className="login-feature">
                            <div>
                                <FaRobot />
                            </div>

                            <span>
                                AI Smart Item Matching
                            </span>
                        </div>


                        <div className="login-feature">
                            <div>
                                <FaMapMarkerAlt />
                            </div>

                            <span>
                                Campus Location Tracking
                            </span>
                        </div>


                        <div className="login-feature">
                            <div>
                                <FaSearch />
                            </div>

                            <span>
                                Fast Lost & Found Search
                            </span>
                        </div>

                    </div>

                </section>


                {/* RIGHT PANEL */}

                <section className="login-right">

                    <div className="login-heading">

                        <span>
                            WELCOME BACK
                        </span>

                        <h2>
                            Sign in to your account
                        </h2>

                        <p>
                            Continue to your campus recovery portal.
                        </p>

                    </div>


                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}


                    <form onSubmit={loginUser}>

                        {/* EMAIL */}

                        <div className="login-input-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="login-input">

                                <FaEnvelope />

                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="login-input-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="login-input">

                                <FaLock />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword ? (
                                        <FaEyeSlash />
                                    ) : (
                                        <FaEye />
                                    )}
                                </button>

                            </div>

                        </div>


                        <div className="login-options">

                            <Link to="/forgot-password">
                                Forgot Password?
                            </Link>

                        </div>


                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="login-spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <FaArrowRight />
                                </>
                            )}

                        </button>

                    </form>


                    <div className="login-register">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/signup">
                            Create Account
                        </Link>

                    </div>


                    <div className="login-footer">
                        © 2026 AI Enabled Campus Lost & Found Portal
                    </div>

                </section>

            </div>

        </main>
    );
}