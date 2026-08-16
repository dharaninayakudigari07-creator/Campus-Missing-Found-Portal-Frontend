import {
  API_BASE_URL,
  getImageUrl,
} from "../config";

import {
  useEffect,
  useState,
  useCallback,
} from "react";

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

// =====================================================
// MY CLAIMS
// =====================================================

function MyClaims() {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [claims, setClaims] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  // ===================================================
  // GET TOKEN
  // ===================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ===================================================
  // GET CLAIM IMAGE
  // ===================================================

  const getClaimImageUrl = (claim) => {
    const rawImage =
      claim?.item?.imageUrl ||
      claim?.item?.image ||
      claim?.imageUrl ||
      claim?.image ||
      null;

    return getImageUrl(rawImage);
  };

  // ===================================================
  // IMAGE ERROR
  // ===================================================

  const handleImageError = (event) => {
    console.error(
      "CLAIM IMAGE FAILED:",
      event.currentTarget.src
    );

    event.currentTarget.style.display =
      "none";

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

  // ===================================================
  // FETCH MY CLAIMS
  // ===================================================

  const fetchClaims =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        // ---------------------------------------------
        // LOGIN CHECK
        // ---------------------------------------------

        if (!token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        // ---------------------------------------------
        // API URL
        // ---------------------------------------------

        const url =
          `${API_BASE_URL}/reports/my-claims`;

        console.log(
          "GET MY CLAIMS URL:",
          url
        );

        // ---------------------------------------------
        // REQUEST
        // ---------------------------------------------

        const response =
          await fetch(url, {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          });

        console.log(
          "MY CLAIMS STATUS:",
          response.status
        );

        // ---------------------------------------------
        // UNAUTHORIZED
        // ---------------------------------------------

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "role"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        const data =
          await response.json();

        console.log(
          "MY CLAIMS RESPONSE:",
          data
        );

        // ---------------------------------------------
        // API ERROR
        // ---------------------------------------------

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load your claims."
          );
        }

        // ---------------------------------------------
        // NORMALIZE RESPONSE
        // ---------------------------------------------

        let receivedClaims = [];

        if (
          Array.isArray(data)
        ) {
          receivedClaims = data;
        } else if (
          Array.isArray(data.claims)
        ) {
          receivedClaims =
            data.claims;
        } else if (
          Array.isArray(data.reports)
        ) {
          receivedClaims =
            data.reports;
        }

        // ---------------------------------------------
        // IMAGE DEBUG
        // ---------------------------------------------

        receivedClaims.forEach(
          (claim, index) => {
            const image =
              getClaimImageUrl(
                claim
              );

            console.log(
              `CLAIM ${index + 1}:`,
              {
                claimId:
                  claim?.id,

                itemId:
                  claim?.itemId ||
                  claim?.item?.id,

                rawImage:
                  claim?.item?.image,

                imageUrl:
                  claim?.item?.imageUrl,

                finalImageUrl:
                  image,
              }
            );
          }
        );

        setClaims(
          receivedClaims
        );

      } catch (err) {
        console.error(
          "GET MY CLAIMS ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to load your claims."
        );

      } finally {
        setLoading(false);
      }
    }, [navigate]);

  // ===================================================
  // LOAD CLAIMS
  // ===================================================

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // ===================================================
  // GET STATUS
  // ===================================================

  const getStatus = (claim) => {
    return (
      claim?.status ||
      "pending"
    ).toLowerCase();
  };

  // ===================================================
  // GET TITLE
  // ===================================================

  const getTitle = (claim) => {
    return (
      claim?.item?.title ||
      claim?.item?.name ||
      claim?.itemTitle ||
      claim?.title ||
      "Claimed Item"
    );
  };

  // ===================================================
  // GET DESCRIPTION
  // ===================================================

  const getDescription = (
    claim
  ) => {
    return (
      claim?.item?.description ||
      claim?.description ||
      "No description available."
    );
  };

  // ===================================================
  // GET LOCATION
  // ===================================================

  const getLocation = (
    claim
  ) => {
    return (
      claim?.item?.location ||
      claim?.location ||
      "Location not available"
    );
  };

  // ===================================================
  // GET DATE
  // ===================================================

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

  // ===================================================
  // FILTER CLAIMS
  // ===================================================

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

  // ===================================================
  // RENDER
  // ===================================================

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
            INTRO
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
              Track the status of your
              claims and view information
              about items you have requested
              to recover.
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
              Please wait while we
              retrieve your claims.
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
                claims yet, or no claims
                match your search.
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
                    getStatus(
                      claim
                    );

                  const image =
                    getClaimImageUrl(
                      claim
                    );

                  const itemId =
                    claim?.itemId ||
                    claim?.item?.id;

                  console.log(
                    "RENDER CLAIM:",
                    claim?.id,
                    "IMAGE:",
                    image
                  );

                  return (

                    <article
                      className="claim-card"
                      key={claim.id}
                    >

                      {/* =================================
                          IMAGE
                      ================================= */}

                      <div className="claim-image-wrapper">

                        {image ? (

                          <img
                            src={image}
                            alt={getTitle(
                              claim
                            )}
                            className="claim-image"
                            loading="lazy"
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

                      {/* =================================
                          CONTENT
                      ================================= */}

                      <div className="claim-content">

                        <div className="claim-number">
                          CLAIM #{claim.id}
                        </div>

                        <h3>
                          {getTitle(
                            claim
                          )}
                        </h3>

                        <p className="claim-description">
                          {getDescription(
                            claim
                          )}
                        </p>

                        <div className="claim-info">

                          <FiMapPin />

                          <span>
                            {getLocation(
                              claim
                            )}
                          </span>

                        </div>

                        <div className="claim-info">

                          <FiCalendar />

                          <span>
                            {getDate(
                              claim
                            )}
                          </span>

                        </div>

                        <button
                          type="button"
                          className="view-claim-button"
                          disabled={!itemId}
                          onClick={() => {

                            if (!itemId) {
                              return;
                            }

                            navigate(
                              `/item-details/${Number(
                                itemId
                              )}`
                            );

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