import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiBookOpen,
  FiShield,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import api from "../services/api";
import "../styles/signup.css";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    studentId: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.phone ||
      !form.studentId ||
      !form.department
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        studentId: form.studentId,
        department: form.department,
      });

      alert(res.data.message || "Signup Successful");
      navigate("/login");
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-card">

        {/* ================= LEFT SIDE ================= */}

        <div className="signup-left">

          <div className="signup-brand-icon">
            <FiShield />
          </div>

          <div className="signup-overline">
            NRI INSTITUTE OF TECHNOLOGY
          </div>

          <h1>
            Join the
            <span>Lost & Found</span>
            Community
          </h1>

          <p className="signup-description">
            Create your student account and help make
            your campus a safer and smarter place to
            recover lost belongings.
          </p>

          <div className="signup-features">

            <div className="signup-feature">
              <div>
                <FiCheckCircle />
              </div>

              <span>
                AI-powered lost & found matching
              </span>
            </div>

            <div className="signup-feature">
              <div>
                <FiShield />
              </div>

              <span>
                Secure student authentication
              </span>
            </div>

            <div className="signup-feature">
              <div>
                <FiBookOpen />
              </div>

              <span>
                Designed for campus students
              </span>
            </div>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="signup-right">

          <div className="signup-heading">

            <span>CREATE ACCOUNT</span>

            <h2>
              Create your account
            </h2>

            <p>
              Enter your student details to get started.
            </p>

          </div>

          <form
            onSubmit={handleSignup}
            className="signup-form"
          >

            {/* NAME */}

            <div className="signup-input-group">

              <label>Full Name</label>

              <div className="signup-input">

                <FiUser />

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="signup-input-group">

              <label>College Email</label>

              <div className="signup-input">

                <FiMail />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your college email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

              </div>

            </div>

            {/* PHONE */}

            <div className="signup-input-group">

              <label>Phone Number</label>

              <div className="signup-input">

                <FiPhone />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />

              </div>

            </div>

            {/* STUDENT ID */}

            <div className="signup-input-group">

              <label>Student ID</label>

              <div className="signup-input">

                <FiBookOpen />

                <input
                  type="text"
                  name="studentId"
                  placeholder="Enter your student ID"
                  value={form.studentId}
                  onChange={handleChange}
                  autoComplete="off"
                />

              </div>

            </div>

            {/* DEPARTMENT */}

            <div className="signup-input-group">

              <label>Department</label>

              <div className="signup-input">

                <FiBookOpen />

                <input
                  type="text"
                  name="department"
                  placeholder="Enter your department"
                  value={form.department}
                  onChange={handleChange}
                  autoComplete="organization-title"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="signup-input-group">

              <label>Password</label>

              <div className="signup-input">

                <FiLock />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="signup-input-group">

              <label>Confirm Password</label>

              <div className="signup-input">

                <FiLock />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>

              </div>

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              className="signup-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="signup-spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}

            </button>

          </form>

          <div className="signup-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

          <div className="signup-footer">
            © 2026 AI Campus Lost & Found
          </div>

        </div>

      </div>

    </div>
  );
}

export default Signup;

