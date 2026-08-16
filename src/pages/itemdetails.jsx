import {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../services/api";

import {
  FaRobot,
  FaGift,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaMoneyBillWave,
  FaGoogle,
  FaTimesCircle,
  FaClock,
  FaUndo,
  FaAward,
  FaStar,
  FaImage,
} from "react-icons/fa";

import "../styles/itemdetails.css";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [claimLoading, setClaimLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // =====================================================
  // CURRENT USER
  // =====================================================

  const token = localStorage.getItem("token");

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("user")
    );
  } catch {
    currentUser = null;
  }

  // =====================================================
  // IMAGE URL
  // =====================================================
  // IMPORTANT:
  // Your NEW database stores Cloudinary URLs.
  //
  // Example:
  // https://res.cloudinary.com/.../image/upload/.../image.webp
  //
  // We DO NOT convert this into /uploads/.
  // =====================================================

  const getDisplayImageUrl = (image) => {
    if (!image) {
      return null;
    }

    const value = String(image).trim();

    if (!value) {
      return null;
    }

    // Cloudinary / external URL
    if (
      value.startsWith("https://") ||
      value.startsWith("http://")
    ) {
      return value;
    }

    // New database should normally never reach here.
    // This is only a safe relative-path fallback.
    if (value.startsWith("/")) {
      return value;
    }

    return `/${value}`;
  };

  // =====================================================
  // IMAGE ERROR
  // =====================================================

  const handleImageError = (event, label) => {
    console.error(
      `${label} IMAGE FAILED:`,
      event?.currentTarget?.src
    );

    if (event?.currentTarget) {
      event.currentTarget.style.display = "none";
    }

    const parent =
      event?.currentTarget?.parentElement;

    if (!parent) return;

    const fallback =
      parent.querySelector(".image-fallback");

    if (fallback) {
      fallback.style.display = "flex";
    }

    const bestFallback =
      parent.querySelector(
        ".best-match-no-image"
      );

    if (bestFallback) {
      bestFallback.style.display = "flex";
    }
  };

  // =====================================================
  // TEXT SIMILARITY
  // =====================================================

  const normalizeText = (value) => {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getWords = (value) => {
    return normalizeText(value)
      .split(" ")
      .filter(
        (word) =>
          word.length > 2
      );
  };

  const calculateTextSimilarity = (
    first,
    second
  ) => {
    const words1 = getWords(first);
    const words2 = getWords(second);

    if (
      words1.length === 0 ||
      words2.length === 0
    ) {
      return 0;
    }

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    let common = 0;

    set1.forEach((word) => {
      if (set2.has(word)) {
        common++;
      }
    });

    const total =
      new Set([
        ...words1,
        ...words2,
      ]).size;

    if (!total) {
      return 0;
    }

    return common / total;
  };

  // =====================================================
  // AI MATCH CALCULATION
  // =====================================================

  const calculateItemMatch = (
    currentItem,
    otherItem
  ) => {
    if (!currentItem || !otherItem) {
      return 0;
    }

    if (
      Number(currentItem.id) ===
      Number(otherItem.id)
    ) {
      return 0;
    }

    const currentStatus =
      String(
        currentItem.status || ""
      ).toUpperCase();

    const otherStatus =
      String(
        otherItem.status || ""
      ).toUpperCase();

    // A lost item should primarily match a found item.
    // A found item should primarily match a lost item.
    if (
      currentStatus === "LOST" &&
      otherStatus !== "FOUND"
    ) {
      return 0;
    }

    if (
      currentStatus === "FOUND" &&
      otherStatus !== "LOST"
    ) {
      return 0;
    }

    const titleSimilarity =
      calculateTextSimilarity(
        currentItem.title,
        otherItem.title
      );

    const descriptionSimilarity =
      calculateTextSimilarity(
        currentItem.description,
        otherItem.description
      );

    const categorySimilarity =
      normalizeText(
        currentItem.category
      ) ===
      normalizeText(
        otherItem.category
      )
        ? 1
        : 0;

    const locationSimilarity =
      calculateTextSimilarity(
        currentItem.location,
        otherItem.location
      );

    // ===================================================
    // WEIGHTED MATCH
    // ===================================================

    let score =
      titleSimilarity * 40 +
      descriptionSimilarity * 30 +
      categorySimilarity * 20 +
      locationSimilarity * 10;

    // Exact title bonus
    if (
      normalizeText(
        currentItem.title
      ) &&
      normalizeText(
        currentItem.title
      ) ===
        normalizeText(
          otherItem.title
        )
    ) {
      score += 10;
    }

    // Same category + similar title
    if (
      categorySimilarity === 1 &&
      titleSimilarity >= 0.3
    ) {
      score += 5;
    }

    return Math.min(
      Math.round(score),
      100
    );
  };

  // =====================================================
  // FIND BEST MATCH
  // =====================================================

  const findBestMatch = (
    currentItem,
    allItems
  ) => {
    if (
      !currentItem ||
      !Array.isArray(allItems)
    ) {
      return {
        score: 0,
        item: null,
      };
    }

    let bestScore = 0;
    let bestItem = null;

    allItems.forEach((otherItem) => {
      const score =
        calculateItemMatch(
          currentItem,
          otherItem
        );

      if (score > bestScore) {
        bestScore = score;
        bestItem = otherItem;
      }
    });

    return {
      score: bestScore,
      item: bestItem,
    };
  };

  // =====================================================
  // FETCH ITEM + AI MATCH
  // =====================================================

  const fetchItem = useCallback(
    async () => {
      try {
        setLoading(true);

        if (
          !id ||
          id === "undefined" ||
          id === "null"
        ) {
          throw new Error(
            "Item ID is missing."
          );
        }

        const numericId = Number(id);

        if (
          !Number.isInteger(
            numericId
          )
        ) {
          throw new Error(
            "Invalid item ID."
          );
        }

        // =================================================
        // GET CURRENT ITEM
        // =================================================

        const itemResponse =
          await api.get(
            `/items/${numericId}`
          );

        const receivedItem =
          itemResponse.data;

        console.log(
          "===================================="
        );

        console.log(
          "ITEM DETAILS RESPONSE:",
          receivedItem
        );

        console.log(
          "CLOUDINARY IMAGE:",
          receivedItem?.image
        );

        console.log(
          "IMAGE URL:",
          getDisplayImageUrl(
            receivedItem?.image
          )
        );

        console.log(
          "LATITUDE:",
          receivedItem?.latitude
        );

        console.log(
          "LONGITUDE:",
          receivedItem?.longitude
        );

        console.log(
          "BACKEND AI SCORE:",
          receivedItem?.aiScore
        );

        console.log(
          "BACKEND MATCH:",
          receivedItem?.bestMatch
        );

        console.log(
          "===================================="
        );

        // =================================================
        // CLAIMS
        // =================================================

        if (
          Array.isArray(
            receivedItem?.reports
          )
        ) {
          setClaims(
            receivedItem.reports
          );
        } else {
          setClaims([]);
        }

        // =================================================
        // GET ALL ITEMS FOR AI MATCHING
        // =================================================

        let allItems = [];

        try {
          const allItemsResponse =
            await api.get("/items");

          if (
            Array.isArray(
              allItemsResponse.data
            )
          ) {
            allItems =
              allItemsResponse.data;
          } else if (
            Array.isArray(
              allItemsResponse.data?.items
            )
          ) {
            allItems =
              allItemsResponse.data.items;
          }
        } catch (matchError) {
          console.error(
            "ALL ITEMS FETCH ERROR:",
            matchError
          );
        }

        // =================================================
        // FRONTEND AI FALLBACK
        // =================================================

        const calculatedMatch =
          findBestMatch(
            receivedItem,
            allItems
          );

        console.log(
          "FRONTEND AI MATCH PERCENTAGE:",
          calculatedMatch.score
        );

        console.log(
          "FRONTEND BEST MATCH:",
          calculatedMatch.item
        );

        // =================================================
        // CHOOSE BACKEND OR FRONTEND RESULT
        // =================================================

        let finalScore =
          Number(
            receivedItem.matchPercentage ??
              receivedItem.aiScore ??
              0
          );

        let finalBestMatch =
          receivedItem.bestMatch ||
          null;

        // If backend has a valid match, use it.
        // Otherwise use our calculated match.
        if (
          (!finalBestMatch ||
            finalScore <= 0) &&
          calculatedMatch.item
        ) {
          finalScore =
            calculatedMatch.score;

          finalBestMatch = {
            ...calculatedMatch.item,
            matchPercentage:
              calculatedMatch.score,
          };
        }

        const finalItem = {
          ...receivedItem,

          matchPercentage:
            Math.min(
              Math.max(
                Number(finalScore) || 0,
                0
              ),
              100
            ),

          aiScore:
            Math.min(
              Math.max(
                Number(finalScore) || 0,
                0
              ),
              100
            ),

          bestMatch:
            finalBestMatch,
        };

        setItem(finalItem);
      } catch (error) {
        console.error(
          "FETCH ITEM ERROR:",
          error
        );

        setItem(null);
        setClaims([]);

        alert(
          error.response?.data?.message ||
            error.message ||
            "Unable to fetch item."
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // =====================================================
  // SUBMIT CLAIM
  // =====================================================

  const submitClaim = async () => {
    if (!token) {
      alert(
        "Please login first."
      );

      navigate("/login");
      return;
    }

    if (!message.trim()) {
      alert(
        "Please explain why this item belongs to you."
      );

      return;
    }

    try {
      setClaimLoading(true);

      await api.post(
        "/reports",
        {
          itemId: Number(id),
          message:
            message.trim(),
        },
      );

      alert(
        "Claim submitted successfully."
      );

      setMessage("");

      await fetchItem();
    } catch (error) {
      console.error(
        "SUBMIT CLAIM ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to submit claim."
      );
    } finally {
      setClaimLoading(false);
    }
  };

  // =====================================================
  // APPROVE CLAIM
  // =====================================================

  const approveClaim = async (
    reportId
  ) => {
    if (!currentUser) {
      alert(
        "Please login first."
      );

      navigate("/login");
      return;
    }

    if (!item) return;

    if (
      Number(currentUser.id) !==
      Number(item.userId)
    ) {
      alert(
        "Only the owner of this item can approve claims."
      );

      return;
    }

    try {
      setApprovalLoading(reportId);

      await api.put(
        `/reports/${reportId}/approve`
      );

      alert(
        "Claim approved successfully."
      );

      await fetchItem();
    } catch (error) {
      console.error(
        "APPROVE CLAIM ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to approve claim."
      );
    } finally {
      setApprovalLoading(null);
    }
  };

  // =====================================================
  // REJECT CLAIM
  // =====================================================

  const rejectClaim = async (
    reportId
  ) => {
    if (!currentUser) {
      alert(
        "Please login first."
      );

      navigate("/login");
      return;
    }

    if (!item) return;

    if (
      Number(currentUser.id) !==
      Number(item.userId)
    ) {
      alert(
        "Only the owner of this item can reject claims."
      );

      return;
    }

    try {
      setApprovalLoading(reportId);

      await api.put(
        `/reports/${reportId}/reject`
      );

      alert(
        "Claim rejected successfully."
      );

      await fetchItem();
    } catch (error) {
      console.error(
        "REJECT CLAIM ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to reject claim."
      );
    } finally {
      setApprovalLoading(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="loading-page">
          <div className="loader"></div>

          <h2>
            Loading Item Details...
          </h2>
        </div>
      </>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!item) {
    return (
      <>
        <Navbar />

        <div className="loading-page">
          <div className="not-found-box">
            <h2>
              Item Not Found
            </h2>

            <p>
              The requested item does not exist.
            </p>

            <button
              className="back-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              <FaArrowLeft />
              Back
            </button>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // STATUS
  // =====================================================

  const itemStatus =
    String(
      item.status || ""
    ).toUpperCase();

  const isReturned =
    itemStatus === "RETURNED";

  const matchPercentage =
    Math.min(
      Math.max(
        Number(
          item.matchPercentage ??
            item.aiScore ??
            0
        ),
        0
      ),
      100
    );

  const bestMatch =
    item.bestMatch || null;

  const isRewardPaid =
    Boolean(item.rewardPaid);

  const hasReward =
    Number(item.reward || 0) > 0;

  const isOwner =
    currentUser &&
    Number(currentUser.id) ===
      Number(item.userId);

  // =====================================================
  // APPROVED CLAIM
  // =====================================================

  const approvedClaim =
    claims.find(
      (claim) =>
        String(
          claim.status || ""
        ).toUpperCase() ===
        "APPROVED"
    );

  const isClaimApproved =
    Boolean(
      item.claimApproved ||
        approvedClaim
    );

  // =====================================================
  // MY CLAIM
  // =====================================================

  const myClaim =
    claims.find(
      (claim) =>
        currentUser &&
        Number(claim.userId) ===
          Number(currentUser.id)
    );

  const approvedClaimant =
    approvedClaim?.user ||
    null;

  const normalizedMyClaimStatus =
    String(
      myClaim?.status || ""
    ).toUpperCase();

  const claimsClosed =
    isReturned ||
    isClaimApproved;

  // =====================================================
  // RETURNED CLAIMANT
  // =====================================================

  const returnedClaimant =
    approvedClaim?.user ||
    item.claimant ||
    null;

  // =====================================================
  // IMAGE URL
  // =====================================================

  const mainImageUrl =
    getDisplayImageUrl(
      item.image
    );

  const bestMatchImageUrl =
    bestMatch
      ? getDisplayImageUrl(
          bestMatch.image
        )
      : null;

  // =====================================================
  // GOOGLE MAPS URL
  // =====================================================

  const hasCoordinates =
    item.latitude !== null &&
    item.latitude !== undefined &&
    item.longitude !== null &&
    item.longitude !== undefined &&
    item.latitude !== "" &&
    item.longitude !== "";

  const googleMapsUrl =
    hasCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${item.latitude},${item.longitude}`
        )}`
      : null;

  // =====================================================
  // MARK RETURNED
  // =====================================================

  const markItemReturned =
    async () => {
      if (!isOwner) {
        alert(
          "Only the owner can mark the item as returned."
        );

        return;
      }

      if (!isClaimApproved) {
        alert(
          "Approve a claim first."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure the item has been returned?\n\nThe approved claimant will receive 10 recovery points."
        );

      if (!confirmed) return;

      try {
        const response =
          await api.put(
            `/items/${Number(
              id
            )}/returned`
          );

        alert(
          response.data?.message ||
            "Item marked as returned."
        );

        await fetchItem();
      } catch (error) {
        console.error(
          "RETURN ITEM ERROR:",
          error
        );

        alert(
          error.response?.data?.message ||
            "Unable to mark item as returned."
        );
      }
    };

  // =====================================================
  // PAY REWARD
  // =====================================================

  const payReward =
    async () => {
      if (!isOwner) {
        alert(
          "Only the owner can pay the reward."
        );

        return;
      }

      if (!isReturned) {
        alert(
          "Reward can only be paid after the item has been returned."
        );

        return;
      }

      if (!hasReward) {
        alert(
          "No reward available."
        );

        return;
      }

      if (isRewardPaid) {
        alert(
          "Reward already paid."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Pay ₹${item.reward} reward?`
        );

      if (!confirmed) return;

      try {
        setPaymentLoading(true);

        const response =
          await api.post(
            "/payment/pay",
            {
              itemId: Number(id),
            }
          );

        alert(
          response.data?.message ||
            "Reward paid successfully."
        );

        await fetchItem();
      } catch (error) {
        console.error(
          "PAY REWARD ERROR:",
          error
        );

        alert(
          error.response?.data?.message ||
            "Unable to pay reward."
        );
      } finally {
        setPaymentLoading(false);
      }
    };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <>
      <Navbar />

      <main className="details-page">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="details-hero">

          <div className="hero-image">

            {mainImageUrl ? (
              <img
                src={mainImageUrl}
                alt={
                  item.title ||
                  "Lost and Found Item"
                }
                loading="eager"
                decoding="async"
                onError={(event) =>
                  handleImageError(
                    event,
                    "MAIN ITEM"
                  )
                }
              />
            ) : (
              <div
                className="image-fallback"
                style={{
                  display: "flex",
                }}
              >
                <FaImage />

                <span>
                  No Image Available
                </span>
              </div>
            )}

            <div
              className="image-fallback"
              style={{
                display: "none",
              }}
            >
              <FaImage />

              <span>
                Image could not be loaded
              </span>
            </div>

          </div>

          <div className="hero-content">

            <span
              className={`status ${
                itemStatus.toLowerCase() ||
                "unknown"
              }`}
            >
              {itemStatus ||
                "UNKNOWN"}
            </span>

            <h1>
              {item.title ||
                "Untitled Item"}
            </h1>

            <p>
              {item.description ||
                "No description available."}
            </p>

            {isReturned && (
              <div className="returned-badge">
                <FaCheckCircle />

                Item Successfully Returned
              </div>
            )}

          </div>

        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <section className="details-grid">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="left-column">

            {/* LOCATION */}

            <div className="info-card">

              <h2>
                <FaMapMarkerAlt />
                Location
              </h2>

              <p>
                {item.location ||
                  "Location not available"}
              </p>

              {googleMapsUrl && (
                <a
                  className="map-btn"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGoogle />
                  Open in Google Maps
                </a>
              )}

              {hasCoordinates && (
                <div className="coordinates">
                  <span>
                    Latitude:{" "}
                    {item.latitude}
                  </span>

                  <span>
                    Longitude:{" "}
                    {item.longitude}
                  </span>
                </div>
              )}

            </div>

            {/* POSTED BY */}

            <div className="info-card">

              <h2>
                <FaUser />
                Posted By
              </h2>

              <p>
                <strong>
                  Name:
                </strong>{" "}
                {item.user?.name ||
                  "N/A"}
              </p>

              <p>
                <strong>
                  Email:
                </strong>{" "}
                {item.user?.email ||
                  "N/A"}
              </p>

              {item.user?.department && (
                <p>
                  <strong>
                    Department:
                  </strong>{" "}
                  {item.user.department}
                </p>
              )}

            </div>

            {/* DATE */}

            <div className="info-card">

              <h2>
                <FaCalendarAlt />
                Posted On
              </h2>

              <p>
                {item.createdAt
                  ? new Date(
                      item.createdAt
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "Not Available"}
              </p>

            </div>

            {/* CATEGORY */}

            {item.category && (
              <div className="info-card">

                <h2>
                  <FaAward />
                  Item Category
                </h2>

                <p>
                  {item.category}
                </p>

              </div>
            )}

            {/* OWNER RETURN */}

            {isOwner &&
              !isReturned && (
                <div className="info-card return-card">

                  <h2>
                    <FaUndo />
                    Item Return
                  </h2>

                  {!isClaimApproved ? (
                    <p>
                      Approve a claim
                      first. Once the
                      genuine claimant
                      receives the item,
                      you can mark it as
                      returned.
                    </p>
                  ) : (
                    <>
                      <div className="approved-claimant-box">

                        <FaUser />

                        <div>

                          <span>
                            Approved Claimant
                          </span>

                          <strong>
                            {approvedClaimant?.name ||
                              "Claimant"}
                          </strong>

                          {approvedClaimant?.email && (
                            <small>
                              {
                                approvedClaimant.email
                              }
                            </small>
                          )}

                        </div>

                      </div>

                      <div className="points-return-notice">

                        <FaStar />

                        <span>
                          The claimant
                          will receive
                          <strong>
                            {" "}
                            10 Recovery
                            Points
                          </strong>{" "}
                          after the item
                          is marked as
                          returned.
                        </span>

                      </div>

                      <button
                        className="return-btn"
                        onClick={
                          markItemReturned
                        }
                      >
                        <FaCheckCircle />
                        Mark Item Returned
                      </button>
                    </>
                  )}

                </div>
              )}

            {/* RETURNED */}

            {isReturned && (
              <div className="info-card returned-card">

                <h2>
                  <FaCheckCircle />
                  Return Status
                </h2>

                <div className="returned-info">

                  <FaCheckCircle />

                  <div>

                    <strong>
                      Item Returned
                      Successfully
                    </strong>

                    <p>
                      This item has
                      been successfully
                      returned to the
                      claimant.
                    </p>

                  </div>

                </div>

                <div className="recovery-recognition">

                  <FaAward />

                  <div>

                    <strong>
                      Recovery
                      Recognition
                    </strong>

                    <p>
                      The approved
                      claimant receives
                      10 recovery points
                      for successful
                      recovery.
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="right-column">

            {/* AI MATCH */}

            <div className="ai-card">

              <div className="ai-header">

                <FaRobot />

                <h2>
                  AI Match Score
                </h2>

              </div>

              <h1>
                {matchPercentage}%
              </h1>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${matchPercentage}%`,
                  }}
                />

              </div>

              <p className="ai-description">
                Matching is calculated
                using title, description,
                category and location.
              </p>

              {bestMatch ? (
                <div className="best-match-box">

                  <div className="best-match-title">

                    <FaStar />

                    Best Matching Item

                  </div>

                  <div className="best-match-content">

                    <div className="best-match-image-wrapper">

                      {bestMatchImageUrl ? (
                        <img
                          src={
                            bestMatchImageUrl
                          }
                          alt={
                            bestMatch.title ||
                            "Best match"
                          }
                          loading="lazy"
                          onError={(event) =>
                            handleImageError(
                              event,
                              "BEST MATCH"
                            )
                          }
                        />
                      ) : (
                        <div
                          className="best-match-no-image"
                          style={{
                            display: "flex",
                          }}
                        >
                          <FaImage />
                        </div>
                      )}

                    </div>

                    <div className="best-match-info">

                      <h3>
                        {bestMatch.title ||
                          "Matching Item"}
                      </h3>

                      <p>
                        {bestMatch.description ||
                          "No description available."}
                      </p>

                      <div className="best-match-meta">

                        {bestMatch.category && (
                          <span>
                            {
                              bestMatch.category
                            }
                          </span>
                        )}

                        {bestMatch.location && (
                          <span>
                            {
                              bestMatch.location
                            }
                          </span>
                        )}

                      </div>

                      <strong>
                        {Number(
                          bestMatch.matchPercentage ||
                            0
                        )}
                        % Match
                      </strong>

                    </div>

                  </div>

                  {bestMatch.id && (
                    <button
                      className="view-match-btn"
                      onClick={() =>
                        navigate(
                          `/items/${bestMatch.id}`
                        )
                      }
                    >
                      View Matching Item
                    </button>
                  )}

                </div>
              ) : (
                <div className="no-ai-match">

                  <FaRobot />

                  <span>
                    No matching item found
                    yet.
                  </span>

                </div>
              )}

            </div>

            {/* REWARD */}

            <div className="reward-card">

              <h2>
                <FaGift />
                Reward
              </h2>

              {hasReward ? (
                <>
                  <h1>
                    ₹
                    {Number(
                      item.reward
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </h1>

                  {!isReturned && (
                    <div className="reward-warning">

                      <div className="reward-warning-icon">
                        <FaClock />
                      </div>

                      <div>

                        <strong>
                          Reward Pending
                        </strong>

                        <p>
                          The reward can
                          be paid after
                          the item has
                          been successfully
                          returned.
                        </p>

                      </div>

                    </div>
                  )}

                  {isReturned &&
                    isRewardPaid && (
                      <div className="reward-paid">

                        <FaCheckCircle />

                        Reward Paid
                        Successfully

                      </div>
                    )}

                  {isReturned &&
                    !isRewardPaid &&
                    isOwner && (
                      <button
                        className="reward-btn"
                        onClick={
                          payReward
                        }
                        disabled={
                          paymentLoading
                        }
                      >
                        <FaMoneyBillWave />

                        {paymentLoading
                          ? "Processing..."
                          : `Pay ₹${item.reward} Reward`}
                      </button>
                    )}

                  {isReturned &&
                    !isRewardPaid &&
                    !isOwner && (
                      <div className="reward-warning">

                        <div className="reward-warning-icon">
                          <FaClock />
                        </div>

                        <div>

                          <strong>
                            Reward Awaiting
                            Payment
                          </strong>

                          <p>
                            The item owner
                            can complete
                            the reward
                            payment.
                          </p>

                        </div>

                      </div>
                    )}

                </>
              ) : (
                <div className="no-reward">
                  No reward has been
                  offered for this item.
                </div>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            CLAIM SECTION
        ================================================= */}

        <section className="claim-section">

          <div className="claim-heading">

            <div>

              <h2>
                Claims & Verification
              </h2>

              <p>
                People who believe this
                item belongs to them can
                submit a claim.
              </p>

            </div>

            <div className="claim-count">

              {claims.length}

              <span>
                Claims
              </span>

            </div>

          </div>

          {isOwner && (
            <div className="owner-claim-notice">

              <FaUser />

              <div>

                <strong>
                  You are the item owner
                </strong>

                <p>
                  Review submitted claims
                  and approve the genuine
                  claimant.
                </p>

              </div>

            </div>
          )}

          {/* CLAIM FORM */}

          {!isOwner &&
            !claimsClosed &&
            !myClaim && (
              <div className="claim-form">

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder="Explain why this item belongs to you. Mention unique details that can help verify your ownership..."
                />

                <button
                  className="claim-btn"
                  onClick={
                    submitClaim
                  }
                  disabled={
                    claimLoading
                  }
                >
                  {claimLoading
                    ? "Submitting..."
                    : "Submit Claim"}
                </button>

              </div>
            )}

          {/* MY CLAIM */}

          {!isOwner &&
            myClaim && (
              <div className="already-claimed">

                {normalizedMyClaimStatus ===
                "APPROVED" ? (
                  <FaCheckCircle />
                ) : normalizedMyClaimStatus ===
                  "REJECTED" ? (
                  <FaTimesCircle />
                ) : (
                  <FaClock />
                )}

                <div>

                  <strong>
                    You have already
                    submitted a claim.
                  </strong>

                  <p>
                    Status:{" "}
                    {myClaim.status ||
                      "PENDING"}
                  </p>

                </div>

              </div>
            )}

          {/* CLOSED */}

          {!isOwner &&
            claimsClosed && (
              <div className="claims-closed">

                <FaCheckCircle />

                <div>

                  <strong>
                    Claims are closed
                  </strong>

                  <p>
                    This item already
                    has an approved claim
                    or has been returned.
                  </p>

                </div>

              </div>
            )}

          {/* CLAIM LIST */}

          {claims.length > 0 ? (
            <div className="claims-list">

              {claims.map(
                (claim) => {

                  const claimStatus =
                    String(
                      claim.status ||
                        "PENDING"
                    ).toLowerCase();

                  const claimUser =
                    claim.user || {};

                  const claimDate =
                    claim.createdAt
                      ? new Date(
                          claim.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "";

                  return (
                    <div
                      className="claim-card"
                      key={
                        claim.id
                      }
                    >

                      <div className="claim-user">

                        <div className="claim-avatar">

                          <FaUser />

                        </div>

                        <div>

                          <h3>
                            {claimUser.name ||
                              "Unknown User"}
                          </h3>

                          <span>
                            {claimUser.email ||
                              "Email unavailable"}
                          </span>

                          {claimDate && (
                            <small>
                              Submitted on{" "}
                              {claimDate}
                            </small>
                          )}

                        </div>

                      </div>

                      <div className="claim-message">
                        {claim.message ||
                          "No claim message provided."}
                      </div>

                      <div
                        className={`claim-status ${claimStatus}`}
                      >

                        {claimStatus ===
                          "approved" && (
                          <FaCheckCircle />
                        )}

                        {claimStatus ===
                          "rejected" && (
                          <FaTimesCircle />
                        )}

                        {claimStatus ===
                          "pending" && (
                          <FaClock />
                        )}

                        {claimStatus.toUpperCase()}

                      </div>

                      {isOwner &&
                        claimStatus ===
                          "pending" && (
                          <div className="claim-buttons">

                            <button
                              className="approve-btn"
                              onClick={() =>
                                approveClaim(
                                  claim.id
                                )
                              }
                              disabled={
                                approvalLoading ===
                                claim.id
                              }
                            >
                              <FaCheckCircle />

                              {approvalLoading ===
                              claim.id
                                ? "Processing..."
                                : "Approve"}
                            </button>

                            <button
                              className="reject-btn"
                              onClick={() =>
                                rejectClaim(
                                  claim.id
                                )
                              }
                              disabled={
                                approvalLoading ===
                                claim.id
                              }
                            >
                              <FaTimesCircle />

                              {approvalLoading ===
                              claim.id
                                ? "Processing..."
                                : "Reject"}
                            </button>

                          </div>
                        )}

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="empty-claims">

              <FaUser />

              <span>
                No claims submitted yet.
              </span>

            </div>
          )}

        </section>

        {/* =================================================
            BACK
        ================================================= */}

        <div className="back-section">

          <button
            className="back-btn"
            onClick={() =>
              navigate(-1)
            }
          >
            <FaArrowLeft />
            Back
          </button>

        </div>

      </main>
    </>
  );
}

export default ItemDetails;