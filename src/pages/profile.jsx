import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiHash,
  FiArrowLeft,
  FiLogOut,
  FiEdit,
  FiAward,
  FiStar,
  FiDownload,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";

import Navbar from "../components/Navbar";

import "../styles/profile.css";


// =====================================================
// PROFILE
// =====================================================

function Profile() {

  const navigate = useNavigate();

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(() => {

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(
        storedUser
      );
    } catch {
      return null;
    }

  });

  // =====================================================
  // REFRESH USER DATA
  // =====================================================

  useEffect(() => {

    const refreshUser = async () => {

      /*
       * The profile first uses localStorage.
       *
       * If your backend provides /auth/me,
       * this will refresh points/certificates
       * from the database.
       *
       * If that route does not exist, the
       * localStorage information remains.
       */

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const response =
          await fetch(
            "http://localhost:5000/api/auth/me",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const freshUser =
          data.user || data;

        if (!freshUser) {
          return;
        }

        setUser(
          freshUser
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            freshUser
          )
        );

      } catch (error) {

        /*
         * Do not break the profile page
         * if /auth/me is not available.
         */

        console.log(
          "Profile refresh skipped:",
          error.message
        );

      }

    };

    refreshUser();

  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };

  // =====================================================
  // GET VALUE
  // =====================================================

  const getValue = (
    ...values
  ) => {

    for (
      const value of values
    ) {

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }

    }

    return "Not provided";
  };

  // =====================================================
  // POINTS
  // =====================================================

  const points = Math.max(
    0,
    Number(
      user?.points || 0
    )
  );

  // =====================================================
  // CERTIFICATES
  // =====================================================

  /*
   * One certificate for every
   * 50 points.
   *
   * 50  -> 1
   * 100 -> 2
   * 150 -> 3
   */

  const calculatedCertificates =
    Math.floor(
      points / 50
    );

  /*
   * Use backend certificate count
   * if available, but never show
   * fewer certificates than the
   * points actually deserve.
   */

  const certificates = Math.max(
    Number(
      user?.certificates || 0
    ),
    calculatedCertificates
  );

  // =====================================================
  // PROGRESS
  // =====================================================

  const pointsIntoCurrentLevel =
    points % 50;

  const pointsNeeded =
    pointsIntoCurrentLevel === 0
      ? 50
      : 50 - pointsIntoCurrentLevel;

  const certificateProgress =
    pointsIntoCurrentLevel === 0
      ? 100
      : (pointsIntoCurrentLevel / 50) * 100;

  // =====================================================
  // CERTIFICATE DOWNLOAD
  // =====================================================

  const downloadCertificate = (
    certificateNumber
  ) => {

    const studentName =
      getValue(
        user?.name,
        user?.fullName,
        "Student"
      );

    const studentId =
      getValue(
        user?.studentId,
        user?.rollNumber,
        user?.rollNo,
        "N/A"
      );

    const department =
      getValue(
        user?.department,
        user?.branch,
        "Computer Science"
      );

    const certificateDate =
      new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

    const certificateWindow =
      window.open(
        "",
        "_blank",
        "width=1000,height=700"
      );

    if (!certificateWindow) {

      alert(
        "Please allow pop-ups to download the certificate."
      );

      return;
    }

    certificateWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          Recovery Certificate
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 40px;
            background: #eef3f9;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .certificate {
            width: 100%;
            max-width: 950px;
            min-height: 650px;
            margin: 0 auto;
            padding: 55px;
            background: #ffffff;
            border: 10px solid #0b2a5b;
            position: relative;
            text-align: center;
          }

          .inner-border {
            position: absolute;
            top: 22px;
            left: 22px;
            right: 22px;
            bottom: 22px;
            border: 2px solid #1d5fc7;
            pointer-events: none;
          }

          .logo {
            width: 75px;
            height: 75px;
            border-radius: 50%;
            background: #0b2a5b;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 30px;
            font-weight: 700;
          }

          .institute {
            color: #0b2a5b;
            font-size: 19px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }

          .title {
            margin-top: 35px;
            color: #0b2a5b;
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 3px;
            text-transform: uppercase;
          }

          .subtitle {
            margin-top: 8px;
            color: #64748b;
            font-size: 16px;
          }

          .student {
            margin-top: 35px;
            color: #1d5fc7;
            font-size: 34px;
            font-weight: 800;
          }

          .description {
            max-width: 700px;
            margin: 18px auto;
            color: #334155;
            font-size: 17px;
            line-height: 1.7;
          }

          .achievement {
            margin: 30px auto;
            padding: 18px 30px;
            max-width: 500px;
            background: #f0f6ff;
            border: 1px solid #c9dcf8;
            color: #0b2a5b;
            font-size: 20px;
            font-weight: 700;
          }

          .achievement span {
            color: #1d5fc7;
            font-size: 28px;
          }

          .details {
            margin-top: 28px;
            color: #475569;
            font-size: 14px;
            line-height: 1.8;
          }

          .footer {
            position: absolute;
            left: 65px;
            right: 65px;
            bottom: 45px;
            display: flex;
            justify-content: space-between;
            align-items: end;
          }

          .signature {
            border-top: 1px solid #64748b;
            padding-top: 8px;
            min-width: 180px;
            color: #334155;
            font-size: 13px;
          }

          .certificate-number {
            color: #64748b;
            font-size: 12px;
          }

          @media print {

            body {
              padding: 0;
              background: white;
            }

            .certificate {
              max-width: none;
              width: 100%;
              min-height: 100vh;
              border: 10px solid #0b2a5b;
            }

          }

        </style>

      </head>

      <body>

        <div class="certificate">

          <div class="inner-border"></div>

          <div class="logo">
            NRI
          </div>

          <div class="institute">
            NRI Institute of Technology
          </div>

          <div class="title">
            Certificate of Recognition
          </div>

          <div class="subtitle">
            Campus Lost & Found Recovery Program
          </div>

          <div class="student">
            ${studentName}
          </div>

          <div class="description">

            This certificate is proudly presented to
            <strong>${studentName}</strong>
            of
            <strong>${department}</strong>
            in recognition of their valuable contribution
            to the campus Lost & Found community.

          </div>

          <div class="achievement">

            Recovery Achievement:
            <span>
              ${points} Points
            </span>

          </div>

          <div class="details">

            Student ID: <strong>${studentId}</strong>
            <br />

            Certificate No:
            <strong>
              NRI-LF-${String(
                certificateNumber
              ).padStart(3, "0")}
            </strong>

            <br />

            Date:
            <strong>
              ${certificateDate}
            </strong>

          </div>

          <div class="footer">

            <div class="signature">
              Campus Administration
            </div>

            <div class="certificate-number">
              Certificate ${certificateNumber}
            </div>

            <div class="signature">
              NRI Institute of Technology
            </div>

          </div>

        </div>

        <script>

          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };

        </script>

      </body>

      </html>
    `);

    certificateWindow.document.close();

  };

  // =====================================================
  // NO USER
  // =====================================================

  if (!user) {

    return (
      <div className="profile-page">

        <Navbar />

        <main className="profile-main">

          <section className="profile-card">

            <div className="profile-card-heading">

              <span>
                ACCOUNT
              </span>

              <h2>
                Please Login
              </h2>

              <p>
                Login to view your profile.
              </p>

            </div>

            <button
              className="profile-edit-button"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>

          </section>

        </main>

      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="profile-page">

      {/* NAVBAR */}

      <Navbar />

      {/* HEADER */}

      <header className="profile-header">

        <button
          type="button"
          className="profile-back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <FiArrowLeft />
          Dashboard
        </button>

      </header>

      {/* MAIN */}

      <main className="profile-main">

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="profile-hero">

          <div className="profile-avatar">
            <FiUser />
          </div>

          <div className="profile-hero-text">

            <span>
              STUDENT PROFILE
            </span>

            <h1>
              {getValue(
                user?.name,
                user?.fullName,
                "Student"
              )}
            </h1>

            <p>
              NRI Institute of Technology
            </p>

          </div>

          <button
            type="button"
            className="profile-edit-button"
            onClick={() =>
              alert(
                "Profile editing can be connected to your backend."
              )
            }
          >
            <FiEdit />
            Edit Profile
          </button>

        </section>

        {/* =================================================
            ACHIEVEMENT GRID
        ================================================= */}

        <section className="achievement-grid">

          {/* POINTS */}

          <div className="achievement-card points-card">

            <div className="achievement-icon">
              <FiStar />
            </div>

            <div className="achievement-content">

              <span>
                RECOVERY POINTS
              </span>

              <strong>
                {points}
              </strong>

              <p>
                Points earned by helping
                recover lost items.
              </p>

            </div>

          </div>

          {/* CERTIFICATES */}

          <div className="achievement-card certificate-card">

            <div className="achievement-icon">
              <FiAward />
            </div>

            <div className="achievement-content">

              <span>
                CERTIFICATES
              </span>

              <strong>
                {certificates}
              </strong>

              <p>
                One certificate is earned
                for every 50 recovery points.
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            CERTIFICATE SECTION
        ================================================= */}

        {certificates > 0 ? (

          <section className="certificate-section">

            <div className="certificate-section-header">

              <div className="certificate-icon-large">
                <FiAward />
              </div>

              <div>

                <span>
                  ACHIEVEMENT UNLOCKED
                </span>

                <h2>
                  Your Recovery Certificates
                </h2>

                <p>
                  Thank you for helping students
                  recover their lost belongings.
                </p>

              </div>

            </div>

            <div className="certificate-list">

              {Array.from(
                {
                  length: certificates,
                },
                (_, index) => {

                  const certificateNumber =
                    index + 1;

                  return (

                    <div
                      className="certificate-card"
                      key={
                        certificateNumber
                      }
                    >

                      <div className="certificate-card-icon">
                        <FiAward />
                      </div>

                      <div className="certificate-card-content">

                        <span>
                          CERTIFICATE
                        </span>

                        <h3>
                          Recovery Recognition
                        </h3>

                        <p>
                          Certificate #
                          {String(
                            certificateNumber
                          ).padStart(
                            3,
                            "0"
                          )}
                        </p>

                      </div>

                      <button
                        type="button"
                        className="certificate-download-btn"
                        onClick={() =>
                          downloadCertificate(
                            certificateNumber
                          )
                        }
                      >
                        <FiDownload />
                        Download
                      </button>

                    </div>

                  );

                }
              )}

            </div>

          </section>

        ) : (

          <section className="certificate-progress-card">

            <div className="certificate-progress-icon">
              <FiAward />
            </div>

            <div className="certificate-progress-content">

              <span>
                NEXT CERTIFICATE
              </span>

              <h2>
                Keep Helping Your Campus
              </h2>

              <p>
                Earn{" "}
                <strong>
                  {pointsNeeded} more points
                </strong>
                {" "}
                to unlock your first certificate.
              </p>

              <div className="certificate-progress-bar">

                <div
                  className="certificate-progress-fill"
                  style={{
                    width:
                      `${certificateProgress}%`,
                  }}
                />

              </div>

              <small>
                {points}/50 points
              </small>

            </div>

          </section>

        )}

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <section className="profile-card">

          <div className="profile-card-heading">

            <span>
              ACCOUNT INFORMATION
            </span>

            <h2>
              Personal Information
            </h2>

            <p>
              Your registered student information
            </p>

          </div>

          <div className="profile-info-grid">

            {/* NAME */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FiUser />
              </div>

              <div>

                <span>
                  Full Name
                </span>

                <strong>
                  {getValue(
                    user?.name,
                    user?.fullName
                  )}
                </strong>

              </div>

            </div>

            {/* EMAIL */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FiMail />
              </div>

              <div>

                <span>
                  Email Address
                </span>

                <strong>
                  {getValue(
                    user?.email
                  )}
                </strong>

              </div>

            </div>

            {/* PHONE */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FiPhone />
              </div>

              <div>

                <span>
                  Phone Number
                </span>

                <strong>
                  {getValue(
                    user?.phone,
                    user?.mobile
                  )}
                </strong>

              </div>

            </div>

            {/* STUDENT ID */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FiHash />
              </div>

              <div>

                <span>
                  Student ID
                </span>

                <strong>
                  {getValue(
                    user?.studentId,
                    user?.rollNumber,
                    user?.rollNo
                  )}
                </strong>

              </div>

            </div>

            {/* DEPARTMENT */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FiBookOpen />
              </div>

              <div>

                <span>
                  Department
                </span>

                <strong>
                  {getValue(
                    user?.department,
                    user?.branch
                  )}
                </strong>

              </div>

            </div>

            {/* ROLE */}

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <FiShield />
              </div>

              <div>

                <span>
                  Account Type
                </span>

                <strong>
                  {getValue(
                    user?.role,
                    "STUDENT"
                  )}
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            POINTS INFORMATION
        ================================================= */}

        <section className="points-info-card">

          <div className="points-info-icon">
            <FiAward />
          </div>

          <div className="points-info-content">

            <span>
              CAMPUS RECOGNITION
            </span>

            <h2>
              Make a Difference on Campus
            </h2>

            <p>
              Help return lost belongings to
              their rightful owners and earn
              recovery points. Every successful
              recovery gives you 10 points.
              Reach 50 points to receive a
              recognition certificate.
            </p>

          </div>

          <div className="points-mini-stats">

            <div>

              <strong>
                {points}
              </strong>

              <span>
                Points
              </span>

            </div>

            <div>

              <strong>
                {certificates}
              </strong>

              <span>
                Certificates
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <section className="profile-logout-card">

          <div>

            <span>
              ACCOUNT SECURITY
            </span>

            <h3>
              Sign out of your account
            </h3>

            <p>
              You can log in again anytime using
              your registered account.
            </p>

          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
          >
            <FiLogOut />
            Logout
          </button>

        </section>

      </main>

    </div>
  );
}

export default Profile;