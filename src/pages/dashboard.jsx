import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiHome,
  FiPlusCircle,
  FiPackage,
  FiClipboard,
  FiUser,
  FiLogOut,
  FiMapPin,
  FiGift,
  FiCpu,
  FiSearch,
  FiCheckCircle,
  FiArrowRight,
  FiRefreshCw,
  FiClock,
  FiShield,
  FiActivity,
  FiChevronRight,
} from "react-icons/fi";

import api from "../services/api";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("User loading error:", error);
    }
  }, []);

  /* =====================================================
     FETCH ITEMS
  ===================================================== */

  const fetchItems = async () => {
    try {
      setLoadingItems(true);

      const response = await api.get("/items");

      const data =
        response.data?.items ||
        response.data?.data ||
        response.data ||
        [];

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =====================================================
     STATUS
  ===================================================== */

  const getStatus = (item) =>
    String(item?.status || "").toUpperCase();

  /* =====================================================
     IMAGE URL
  ===================================================== */

  const getImageUrl = (image) => {
    if (!image) return null;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `https://campus-missing-found-portal-backend.onrender.com/uploads/${image}`;
  };

  /* =====================================================
     COUNTS
  ===================================================== */

  const lostCount = items.filter(
    (item) => getStatus(item) === "LOST"
  ).length;

  const foundCount = items.filter(
    (item) => getStatus(item) === "FOUND"
  ).length;

  const returnedCount = items.filter(
    (item) => getStatus(item) === "RETURNED"
  ).length;

  const myItemsCount = items.filter(
    (item) =>
      currentUser &&
      Number(item.userId) === Number(currentUser.id)
  ).length;

  const myClaimsCount = items
    .flatMap((item) => item.reports || [])
    .filter(
      (report) =>
        currentUser &&
        Number(report.userId) === Number(currentUser.id)
    ).length;

  /* =====================================================
     SORT ITEMS
  ===================================================== */

  const displayedItems = [...items].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  /* =====================================================
     ITEM DETAILS
  ===================================================== */

  const handleViewDetails = (id) => {
    navigate(`/item-details/${id}`);
  };

  /* =====================================================
     FIRST NAME
  ===================================================== */

  const getFirstName = () => {
    if (!currentUser?.name) return "Student";

    return currentUser.name.split(" ")[0];
  };

  return (
    <div className="dashboard-page">

      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="dashboard-navbar">

        <div className="navbar-inner">

          {/* BRAND */}

          <div
            className="dashboard-brand"
            onClick={() => navigate("/dashboard")}
          >

            <div className="brand-logo">
              <FiCpu />
            </div>

            <div className="brand-content">
              <h2>NRI Lost &amp; Found</h2>
              <span>AI Enabled Campus Portal</span>
            </div>

          </div>

          {/* NAVIGATION */}

          <nav className="dashboard-nav">

            <button
              className="nav-item active"
              onClick={() => navigate("/dashboard")}
            >
              <FiHome />
              <span>Dashboard</span>
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/report-lost")}
            >
              <FiPlusCircle />
              <span>Report Lost</span>
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/report-found")}
            >
              <FiPackage />
              <span>Report Found</span>
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/my-items")}
            >
              <FiPackage />
              <span>My Items</span>
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/my-claims")}
            >
              <FiClipboard />
              <span>My Claims</span>
            </button>

            <button
              className="nav-item"
              onClick={() => navigate("/profile")}
            >
              <FiUser />
              <span>Profile</span>
            </button>

          </nav>

          {/* RIGHT */}

          <div className="navbar-right">

            <div className="user-mini">

              <div className="user-avatar">
                {getFirstName().charAt(0).toUpperCase()}
              </div>

              <div className="user-mini-info">
                <strong>{getFirstName()}</strong>
                <span>Student</span>
              </div>

            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <FiLogOut />
            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="dashboard-hero">

          <div className="hero-left">

            <div className="hero-label">
              <span className="hero-label-dot"></span>
              AI POWERED CAMPUS RECOVERY
            </div>

            <h1>
              Find What You Lost.
              <br />
              <span>Return What You Found.</span>
            </h1>

            <p>
              Welcome back, <strong>{getFirstName()}</strong>.
              Manage lost and found items across the NRI
              Institute of Technology campus with intelligent
              AI-powered matching.
            </p>

            <div className="hero-actions">

              <button
                className="hero-primary"
                onClick={() => navigate("/report-lost")}
              >
                <FiPlusCircle />
                Report Lost Item
                <FiArrowRight />
              </button>

              <button
                className="hero-secondary"
                onClick={() => navigate("/report-found")}
              >
                <FiPackage />
                Report Found Item
              </button>

            </div>

            <div className="hero-trust">

              <div>
                <FiShield />
                <span>Secure Student Portal</span>
              </div>

              <div>
                <FiCpu />
                <span>AI Matching Enabled</span>
              </div>

              <div>
                <FiActivity />
                <span>Live Campus Reports</span>
              </div>

            </div>

          </div>

          {/* AI CARD */}

          <div className="hero-right">

            <div className="ai-panel">

              <div className="ai-panel-glow"></div>

              <div className="ai-top">

                <div className="ai-icon">
                  <FiCpu />
                </div>

                <span>SMART MATCHING</span>

              </div>

              <h3>
                AI finds possible
                <br />
                matches for you.
              </h3>

              <p>
                Our intelligent matching system compares
                item descriptions, categories, images and
                locations to help connect lost items with
                found reports.
              </p>

              <div className="ai-process">

                <div className="ai-process-item">
                  <div>01</div>
                  <span>Analyze</span>
                </div>

                <div className="ai-line"></div>

                <div className="ai-process-item">
                  <div>02</div>
                  <span>Match</span>
                </div>

                <div className="ai-line"></div>

                <div className="ai-process-item">
                  <div>03</div>
                  <span>Recover</span>
                </div>

              </div>

              <button
                onClick={() => navigate("/my-claims")}
                className="ai-button"
              >
                View My Claims
                <FiChevronRight />
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="statistics-section">

          <div className="statistics-heading">

            <div>
              <span>PORTAL OVERVIEW</span>
              <h2>Campus Activity</h2>
            </div>

            <button
              className="stats-refresh"
              onClick={fetchItems}
              disabled={loadingItems}
            >
              <FiRefreshCw
                className={loadingItems ? "rotate" : ""}
              />
              Refresh
            </button>

          </div>

          <div className="statistics-grid">

            <div className="stat-card">

              <div className="stat-icon lost">
                <FiSearch />
              </div>

              <div>
                <span>LOST ITEMS</span>
                <strong>{lostCount}</strong>
                <small>Currently reported</small>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon found">
                <FiCheckCircle />
              </div>

              <div>
                <span>FOUND ITEMS</span>
                <strong>{foundCount}</strong>
                <small>Reported on campus</small>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon personal">
                <FiPackage />
              </div>

              <div>
                <span>MY ITEMS</span>
                <strong>{myItemsCount}</strong>
                <small>Your reports</small>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon claims">
                <FiClipboard />
              </div>

              <div>
                <span>MY CLAIMS</span>
                <strong>{myClaimsCount}</strong>
                <small>Claims submitted</small>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon returned">
                <FiGift />
              </div>

              <div>
                <span>RETURNED</span>
                <strong>{returnedCount}</strong>
                <small>Successfully recovered</small>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            RECENT ITEMS
        ================================================= */}

        <section className="items-section">

          <div className="section-header">

            <div>

              <div className="section-overline">
                CAMPUS REPORTS
              </div>

              <h2>Recently Reported Items</h2>

              <p>
                Explore the latest lost and found reports
                from students across the campus.
              </p>

            </div>

            <button
              className="view-all-button"
              onClick={() => navigate("/my-items")}
            >
              View My Items
              <FiArrowRight />
            </button>

          </div>

          {/* LOADING */}

          {loadingItems && (

            <div className="items-loading">

              <div className="loading-spinner"></div>

              <p>
                Loading latest campus reports...
              </p>

            </div>

          )}

          {/* EMPTY */}

          {!loadingItems &&
            displayedItems.length === 0 && (

              <div className="items-empty">

                <div className="empty-icon">
                  <FiPackage />
                </div>

                <h3>No campus reports yet</h3>

                <p>
                  Lost or found items reported by students
                  will appear here.
                </p>

                <button
                  onClick={() => navigate("/report-lost")}
                >
                  Report an Item
                  <FiArrowRight />
                </button>

              </div>

            )}

          {/* ITEMS */}

          {!loadingItems &&
            displayedItems.length > 0 && (

              <div className="items-grid">

                {displayedItems
                  .slice(0, 6)
                  .map((item) => {

                    const status = getStatus(item);
                    const image = getImageUrl(item.image);

                    return (

                      <article
                        className="item-card"
                        key={item.id}
                      >

                        {/* IMAGE */}

                        <div className="item-image-wrapper">

                          {image ? (

                            <img
                              src={image}
                              alt={item.title || "Campus item"}
                              className="item-image"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";

                                const fallback =
                                  e.currentTarget
                                    .parentElement
                                    .querySelector(
                                      ".item-image-fallback"
                                    );

                                if (fallback) {
                                  fallback.style.display =
                                    "flex";
                                }
                              }}
                            />

                          ) : null}

                          <div
                            className="item-image-fallback"
                            style={{
                              display: image
                                ? "none"
                                : "flex",
                            }}
                          >
                            <FiPackage />
                          </div>

                          <span
                            className={`item-status ${status.toLowerCase()}`}
                          >
                            {status || "REPORTED"}
                          </span>

                        </div>

                        {/* BODY */}

                        <div className="item-card-body">

                          <div className="item-category">
                            {item.category || "GENERAL"}
                          </div>

                          <h3>
                            {item.title || "Untitled Item"}
                          </h3>

                          <p className="item-description">

                            {item.description
                              ? item.description.length > 90
                                ? item.description.substring(
                                    0,
                                    90
                                  ) + "..."
                                : item.description
                              : "No description available."}

                          </p>

                          <div className="item-meta">

                            <div>
                              <FiMapPin />
                              <span>
                                {item.location ||
                                  "Unknown location"}
                              </span>
                            </div>

                            <div>
                              <FiClock />
                              <span>
                                {item.createdAt
                                  ? new Date(
                                      item.createdAt
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "-"}
                              </span>
                            </div>

                          </div>

                          <div className="item-bottom">

                            <div className="item-user">

                              <div className="small-avatar">
                                {(item.user?.name ||
                                  "S")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span>
                                {item.user?.name ||
                                  "Student"}
                              </span>

                            </div>

                            {Number(item.reward) > 0 && (

                              <div className="item-reward">
                                <FiGift />
                                ₹{item.reward}
                              </div>

                            )}

                          </div>

                          <button
                            className="item-details-button"
                            onClick={() =>
                              handleViewDetails(item.id)
                            }
                          >
                            View Details
                            <FiArrowRight />
                          </button>

                        </div>

                      </article>

                    );

                  })}

              </div>

            )}

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="actions-section">

          <div className="section-header action-header">

            <div>

              <div className="section-overline">
                QUICK ACCESS
              </div>

              <h2>What would you like to do?</h2>

              <p>
                Access important portal features quickly.
              </p>

            </div>

          </div>

          <div className="actions-grid">

            <button
              className="action-card action-blue"
              onClick={() => navigate("/report-lost")}
            >

              <div className="action-icon">
                <FiSearch />
              </div>

              <div className="action-content">
                <h3>Report Lost Item</h3>
                <p>
                  Tell the campus community about something
                  you have lost.
                </p>
              </div>

              <FiArrowRight className="action-arrow" />

            </button>

            <button
              className="action-card action-green"
              onClick={() => navigate("/report-found")}
            >

              <div className="action-icon">
                <FiPackage />
              </div>

              <div className="action-content">
                <h3>Report Found Item</h3>
                <p>
                  Help another student recover their
                  belongings.
                </p>
              </div>

              <FiArrowRight className="action-arrow" />

            </button>

            <button
              className="action-card action-purple"
              onClick={() => navigate("/my-items")}
            >

              <div className="action-icon">
                <FiClipboard />
              </div>

              <div className="action-content">
                <h3>Manage My Items</h3>
                <p>
                  View and manage all your reported items.
                </p>
              </div>

              <FiArrowRight className="action-arrow" />

            </button>

            <button
              className="action-card action-orange"
              onClick={() => navigate("/my-claims")}
            >

              <div className="action-icon">
                <FiCheckCircle />
              </div>

              <div className="action-content">
                <h3>Track My Claims</h3>
                <p>
                  Monitor the status of your submitted
                  claims.
                </p>
              </div>

              <FiArrowRight className="action-arrow" />

            </button>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="dashboard-footer">

        <div className="footer-inner">

          <div className="footer-brand">

            <div className="footer-logo">
              <FiCpu />
            </div>

            <div>
              <strong>NRI Lost &amp; Found</strong>
              <span>
                AI Enabled Campus Portal
              </span>
            </div>

          </div>

          <p>
            © {new Date().getFullYear()} NRI Institute of
            Technology. All rights reserved.
          </p>

          <span className="footer-status">
            <i></i>
            Portal Online
          </span>

        </div>

      </footer>

    </div>
  );
}

export default Dashboard;

