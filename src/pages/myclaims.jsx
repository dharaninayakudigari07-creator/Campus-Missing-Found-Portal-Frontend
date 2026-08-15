import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiClipboard,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiImage,
  FiMapPin,
  FiCalendar,
  FiEye,
  FiLoader,
} from "react-icons/fi";

import Navbar from "../components/Navbar";

import "../styles/myclaims.css";

const API_URL =
  "https://campus-missing-found-portal-backend.onrender.com/api";

const BACKEND_URL =
  "https://campus-missing-found-portal-backend.onrender.com";

function MyClaims() {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // CREATE CORRECT IMAGE URL
  // =====================================================

  const getImageUrl = (claim) => {
    const rawImage =
      claim?.item?.imageUrl ||
      claim?.item?.image ||
      claim?.imageUrl ||
      claim?.image ||
      null;

    if (!rawImage) {
      return null;
    }

    const image = String(rawImage).trim();

    if (!image) {
      return null;
    }

    // ---------------------------------------------------
    // Already a full HTTPS URL
    // ---------------------------------------------------

    if (image.startsWith("https://")) {
      return image;
    }

    // ---------------------------------------------------
    // HTTP URL -> convert to HTTPS
    // ---------------------------------------------------

    if (image.startsWith("http://")) {
      return image.replace(/^http:\/\//, "https://");
    }

    // ---------------------------------------------------
    // /uploads/file.jpg
    // ---------------------------------------------------

    if (image.startsWith("/uploads/")) {
      return `${BACKEND_URL}${image}`;
    }

    // ---------------------------------------------------
    // uploads/file.jpg
    // ---------------------------------------------------

    if (image.startsWith("uploads/")) {
      return `${BACKEND_URL}/${image}`;
    }

    // ---------------------------------------------------
    // /file.jpg
    // ---------------------------------------------------

    if (image.startsWith("/")) {
      return `${BACKEND_URL}/uploads${image}`;
    }

    // ---------------------------------------------------
    // Normal filename
    // Example:
    // 1786779707773.jpg
    // ---------------------------------------------------

    return `${BACKEND_URL}/uploads/${image}`;
  };

  // =====================================================
  // IMAGE ERROR HANDLER
  // =====================================================

  const handleImageError = (event) => {
    console.error(
      "CLAIM IMAGE FAILED:",
      event.currentTarget.src
    );

    event.currentTarget.style.display = "none";

    const wrapper =
      event.currentTarget.parentElement;

    if (!wrapper) {
      return;
    }

    const existingFallback =
      wrapper.querySelector(
        ".claim-image-error"
      );

    if (existingFallback) {
      return;
    }

    const fallback =
      document.createElement("div");

    fallback.className =
      "claim-image-error";

    fallback.innerHTML = `
      <span>Image unavailable</span>
    `;

    wrapper.appendChild(fallback);
  };

  // =====================================================
  // FETCH CLAIMS
  // =====================================================

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const response = await fetch(
        `${API_URL}/reports/my-claims`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // -------------------------------------------------
      // UNAUTHORIZED
      // -------------------------------------------------

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load your claims."
        );
      }

      // -------------------------------------------------
      // API CAN RETURN ARRAY
      // -------------------------------------------------

      let receivedClaims = [];

      if (Array.isArray(data)) {
        receivedClaims = data;
      } else if (
        Array.isArray(data.claims)
      ) {
        receivedClaims = data.claims;
      } else if (
        Array.isArray(data.reports)
      ) {
        receivedClaims = data.reports;
      }

      // -------------------------------------------------
      // DEBUG IMAGE URLS
      // -------------------------------------------------

      console.log(
        "MY CLAIMS RESPONSE:",
        receivedClaims
      );

      receivedClaims.forEach(
        (claim, index) => {
          console.log(
            `CLAIM ${index + 1} IMAGE DATA:`,
            {
              claimId: claim.id,
              itemId:
                claim.itemId ||
                claim.item?.id,
              image:
                claim.item?.image,
              imageUrl:
                claim.item?.imageUrl,
              finalImageUrl:
                getImageUrl(claim),
            }
          );
        }
      );

      setClaims(receivedClaims);

    } catch (err) {
      console.error(
        "GET MY CLAIMS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load your claims."
      );

    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // =====================================================
  // LOAD CLAIMS
  // =====================================================

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (claim) => {
    return (
      claim?.status ||
      "pending"
    ).toLowerCase();
  };

  // =====================================================
  // TITLE
  // =====================================================

  const getTitle = (claim) => {
    return (
      claim?.item?.title ||
      claim?.item?.name ||
      claim?.itemTitle ||
      claim?.title ||
      "Claimed Item"
    );
  };

  // =====================================================
  // DESCRIPTION
  // =====================================================

  const getDescription = (claim) => {
    return (
      claim?.item?.description ||
      claim?.description ||
      "No description available."
    );
  };

  // =====================================================
  // LOCATION
  // =====================================================

  const getLocation = (claim) => {
    return (
      claim?.item?.location ||
      claim?.location ||
      "Location not available"
    );
  };

  // =====================================================
  // DATE
  // =====================================================

  const getDate = (claim) => {
    const date =
      claim?.createdAt ||
      claim?.date ||
      claim?.claimDate;

    if (!date) {
      return "Date not available";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "Date not available";
    }
  };

  // =====================================================
  // FILTER CLAIMS
  // =====================================================

  const filteredClaims =
    claims.filter((claim) => {
      const title =
        getTitle(claim);

      const description =
        getDescription(claim);

      const status =
        getStatus(claim);

      const text =
        `${title} ${description} ${status}`
          .toLowerCase();

      const matchesSearch =
        text.includes(
          search.toLowerCase()
        );

      const matchesFilter =
        filter === "all" ||
        status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="myclaims-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="myclaims-header">

        <div className="myclaims-header-left">

          <button
            type="button"
            className="claims-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <FiArrowLeft />

            <span>
              Dashboard
            </span>
          </button>

          <div className="claims-title-wrapper">

            <div className="claims-title-icon">
              <FiClipboard />
            </div>

            <div>

              <h1>
                My Claims
              </h1>

              <p>
                Track your submitted item
                recovery claims
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="myclaims-main">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="claims-intro">

          <div>

            <span className="claims-intro-label">
              CLAIM MANAGEMENT
            </span>

            <h2>
              Your Submitted Claims
            </h2>

            <p>
              Track the status of your claims
              and view information about items
              you have requested to recover.
            </p>

          </div>

        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="claims-toolbar">

          <div className="claims-search">

            <FiSearch />

            <input
              type="text"
              placeholder="Search claims..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="claims-filters">

            <button
              type="button"
              className={`claims-filter ${
                filter === "all"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              type="button"
              className={`claims-filter ${
                filter === "pending"
                  ? "active pending"
                  : ""
              }`}
              onClick={() =>
                setFilter("pending")
              }
            >
              Pending
            </button>

            <button
              type="button"
              className={`claims-filter ${
                filter === "approved"
                  ? "active approved"
                  : ""
              }`}
              onClick={() =>
                setFilter("approved")
              }
            >
              Approved
            </button>

            <button
              type="button"
              className={`claims-filter ${
                filter === "rejected"
                  ? "active rejected"
                  : ""
              }`}
              onClick={() =>
                setFilter("rejected")
              }
            >
              Rejected
            </button>

          </div>

          <button
            type="button"
            className="claims-refresh"
            onClick={fetchClaims}
            aria-label="Refresh claims"
          >
            <FiRefreshCw />
          </button>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="claims-error">

            <FiAlertCircle />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              Close
            </button>

          </div>

        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <section className="claims-loading">

            <div className="claims-loading-icon">

              <FiLoader />

            </div>

            <h3>
              Loading your claims...
            </h3>

            <p>
              Please wait while we retrieve
              your claims.
            </p>

          </section>

        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          filteredClaims.length === 0 && (

            <section className="claims-empty">

              <div className="claims-empty-icon">

                <FiClipboard />

              </div>

              <h2>
                No Claims Found
              </h2>

              <p>
                You haven't submitted any
                claims yet, or no claims match
                your search.
              </p>

            </section>

          )}

        {/* =================================================
            CLAIMS GRID
        ================================================= */}

        {!loading &&
          filteredClaims.length > 0 && (

            <section className="claims-grid">

              {filteredClaims.map(
                (claim) => {

                  const status =
                    getStatus(claim);

                  const image =
                    getImageUrl(claim);

                  console.log(
                    "RENDER CLAIM:",
                    claim.id,
                    "IMAGE:",
                    image
                  );

                  return (

                    <article
                      className="claim-card"
                      key={claim.id}
                    >

                      {/* ===================================
                          IMAGE
                      =================================== */}

                      <div className="claim-image-wrapper">

                        {image ? (

                          <img
                            src={image}
                            alt={getTitle(claim)}
                            className="claim-image"
                            onError={
                              handleImageError
                            }
                            onLoad={() =>
                              console.log(
                                "CLAIM IMAGE LOADED:",
                                image
                              )
                            }
                          />

                        ) : (

                          <div className="claim-no-image">

                            <FiImage />

                            <span>
                              No image available
                            </span>

                          </div>

                        )}

                        <span
                          className={`claim-status claim-${status}`}
                        >
                          {status}
                        </span>

                      </div>

                      {/* ===================================
                          CONTENT
                      =================================== */}

                      <div className="claim-content">

                        <div className="claim-number">
                          CLAIM #{claim.id}
                        </div>

                        <h3>
                          {getTitle(claim)}
                        </h3>

                        <p className="claim-description">
                          {getDescription(claim)}
                        </p>

                        <div className="claim-info">

                          <FiMapPin />

                          <span>
                            {getLocation(claim)}
                          </span>

                        </div>

                        <div className="claim-info">

                          <FiCalendar />

                          <span>
                            {getDate(claim)}
                          </span>

                        </div>

                        <button
                          type="button"
                          className="view-claim-button"
                          onClick={() => {

                            const itemId =
                              claim.itemId ||
                              claim.item?.id;

                            if (itemId) {

                              navigate(
                                `/item-details/${itemId}`
                              );

                            }

                          }}
                        >

                          <FiEye />

                          View Item

                        </button>

                      </div>

                    </article>

                  );
                }
              )}

            </section>

          )}

      </main>

    </div>
  );
}

export default MyClaims;