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
  FaCertificate,
} from "react-icons/fa";

import "../styles/itemdetails.css";


// =====================================================
// COMPONENT
// =====================================================

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // =====================================================
  // USER
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
  // FETCH ITEM
  // =====================================================

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);

      if (
        !id ||
        id === "undefined" ||
        id === "null"
      ) {
        throw new Error("Item ID is missing.");
      }

      const numericId = Number(id);

      if (!Number.isInteger(numericId)) {
        throw new Error("Invalid item ID.");
      }

      const response = await api.get(
        `/items/${numericId}`
      );

      console.log(
        "ITEM DETAILS RESPONSE:",
        response.data
      );

      console.log(
        "AI MATCH PERCENTAGE:",
        response.data?.matchPercentage
      );

      console.log(
        "BEST AI MATCH:",
        response.data?.bestMatch
      );

      const receivedItem = response.data;

      setItem(receivedItem);

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

    } catch (error) {
      console.error(
        "FETCH ITEM ERROR:",
        error.response?.data ||
          error.message
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
  }, [id]);

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
        "Please login before submitting a claim."
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
          message: message.trim(),
        }
      );

      alert(
        "Claim submitted successfully."
      );

      setMessage("");

      await fetchItem();

    } catch (error) {
      console.error(
        "SUBMIT CLAIM ERROR:",
        error.response?.data ||
          error.message
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

  const approveClaim = async (reportId) => {
    if (!currentUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (
      Number(currentUser.id) !==
      Number(item.userId)
    ) {
      alert(
        "Only the student who reported this item can approve the claim."
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
        error.response?.data ||
          error.message
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

  const rejectClaim = async (reportId) => {
    if (!currentUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (
      Number(currentUser.id) !==
      Number(item.userId)
    ) {
      alert(
        "Only the student who reported this item can reject the claim."
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
        error.response?.data ||
          error.message
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
  // MARK RETURNED
  // =====================================================

  const markItemReturned = async () => {
    try {
      if (!isOwner) {
        alert(
          "Only the item owner can mark this item as returned."
        );

        return;
      }

      if (!isClaimApproved) {
        alert(
          "Please approve a claim before marking the item as returned."
        );

        return;
      }

      const confirmed = window.confirm(
        "Are you sure this item has been returned?\n\nThe approved claimant will receive 10 recovery points."
      );

      if (!confirmed) {
        return;
      }

      const response = await api.put(
        `/items/${Number(id)}/returned`
      );

      console.log(
        "RETURN RESPONSE:",
        response.data
      );

      alert(
        response.data?.message ||
          "Item marked as returned successfully."
      );

      await fetchItem();

    } catch (error) {
      console.error(
        "MARK RETURNED ERROR:",
        error.response?.data ||
          error.message
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

  const payReward = async () => {
    try {
      if (!isOwner) {
        alert(
          "Only the item owner can pay the reward."
        );

        return;
      }

      if (!isReturned) {
        alert(
          "Reward can only be paid after the item has been returned."
        );

        return;
      }

      if (isRewardPaid) {
        alert(
          "Reward has already been paid."
        );

        return;
      }

      if (!hasReward) {
        alert(
          "No reward is available for this item."
        );

        return;
      }

      const confirmed = window.confirm(
        `Pay ₹${item.reward} reward?`
      );

      if (!confirmed) {
        return;
      }

      setPaymentLoading(true);

      const response = await api.post(
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
        error.response?.data ||
          error.message
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
              The item you are looking for
              could not be found.
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

  const itemStatus = String(
    item.status || ""
  ).toUpperCase();

  const isReturned =
    itemStatus === "RETURNED";

  // =====================================================
  // AI MATCH
  // =====================================================

  const matchPercentage = Math.min(
    Math.max(
      Number(
        item.matchPercentage || 0
      ),
      0
    ),
    100
  );

  const bestMatch =
    item.bestMatch || null;

  // =====================================================
  // REWARD
  // =====================================================

  const isRewardPaid = Boolean(
    item.rewardPaid
  );

  const hasReward =
    Number(item.reward || 0) > 0;

  // =====================================================
  // OWNER
  // =====================================================

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
          claim.status
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

  // =====================================================
  // APPROVED CLAIMANT NAME
  // =====================================================

  const approvedClaimant =
    approvedClaim?.user ||
    null;

  // =====================================================
  // RENDER
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

            {item.image ? (
              <img
                src={`https://campus-missing-found-portal-backend.onrender.com/uploads/${item.image}`}
                alt={
                  item.title ||
                  "Lost and found item"
                }
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";

                  const fallback =
                    event.currentTarget
                      .parentElement
                      .querySelector(
                        ".image-fallback"
                      );

                  if (fallback) {
                    fallback.style.display =
                      "flex";
                  }
                }}
              />
            ) : null}

            <div
              className="image-fallback"
              style={{
                display: item.image
                  ? "none"
                  : "flex",
              }}
            >
              📦

              <span>
                No Image Available
              </span>
            </div>

          </div>

          <div className="hero-content">

            <span
              className={`status ${itemStatus.toLowerCase()}`}
            >
              {itemStatus}
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
            DETAILS GRID
        ================================================= */}

        <section className="details-grid">

          {/* =================================================
              LEFT COLUMN
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
                  "Location not available."}
              </p>

              {item.latitude &&
                item.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="map-btn"
                  >
                    <FaGoogle />
                    Open in Google Maps
                  </a>
                )}

            </div>

            {/* POSTED BY */}

            <div className="info-card">

              <h2>
                <FaUser />
                Posted By
              </h2>

              <p>
                <strong>Name:</strong>{" "}
                {item.user?.name ||
                  "Not available"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {item.user?.email ||
                  "Not available"}
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
                  : "Not available"}
              </p>

            </div>

            {/* RETURN SECTION */}

            {isOwner &&
              !isReturned && (
                <div className="info-card return-card">

                  <h2>
                    <FaUndo />
                    Item Return
                  </h2>

                  {!isClaimApproved ? (
                    <p>
                      Approve a claim first.
                      After the item is given
                      to the genuine claimant,
                      you can mark it as returned.
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
                              "Approved Student"}
                          </strong>

                          {approvedClaimant?.email && (
                            <small>
                              {approvedClaimant.email}
                            </small>
                          )}
                        </div>

                      </div>

                      <div className="points-return-notice">

                        <FaStar />

                        <span>
                          The claimant will receive
                          <strong> 10 recovery points</strong>
                          {" "}after this item is marked
                          as returned.
                        </span>

                      </div>

                      <button
                        className="return-btn"
                        onClick={
                          markItemReturned
                        }
                      >
                        <FaCheckCircle />
                        Mark Item as Returned
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
                    </strong>

                    <p>
                      This item has been
                      successfully returned
                      to the genuine claimant.
                    </p>
                  </div>

                </div>

                {approvedClaimant && (
                  <div className="recovery-recognition">

                    <FaAward />

                    <div>
                      <strong>
                        Recovery Recognition
                      </strong>

                      <p>
                        {approvedClaimant.name ||
                          "The claimant"}{" "}
                        has successfully recovered
                        this item and received
                        recovery points.
                      </p>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="right-column">

            {/* =================================================
                AI MATCH CARD
            ================================================= */}

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
                    width:
                      `${matchPercentage}%`,
                  }}
                />

              </div>

              <p className="ai-description">
                AI-powered similarity score
                based on title, description,
                category and location.
              </p>

              {/* BEST MATCH */}

              {bestMatch && (
                <div className="best-match-box">

                  <div className="best-match-title">

                    <FaCheckCircle />

                    <span>
                      Best Matching Report
                    </span>

                  </div>

                  <div className="best-match-content">

                    {bestMatch.image ? (
                      <img
                        src={`https://campus-missing-found-portal-backend.onrender.com/uploads/${bestMatch.image}`}
                        alt={
                          bestMatch.title ||
                          "Matching item"
                        }
                      />
                    ) : (
                      <div className="best-match-no-image">
                        📦
                      </div>
                    )}

                    <div className="best-match-info">

                      <h3>
                        {bestMatch.title}
                      </h3>

                      <p>
                        {bestMatch.description ||
                          "No description available."}
                      </p>

                      <div className="best-match-meta">

                        <span>
                          {bestMatch.status}
                        </span>

                        <span>
                          {bestMatch.category}
                        </span>

                        <span>
                          {bestMatch.location}
                        </span>

                      </div>

                      <strong>
                        {bestMatch.similarity}%
                        {" "}
                        Match
                      </strong>

                    </div>

                  </div>

                  <button
                    className="view-match-btn"
                    onClick={() =>
                      navigate(
                        `/item/${bestMatch.id}`
                      )
                    }
                  >
                    View Matching Item
                  </button>

                </div>
              )}

              {!bestMatch && (
                <div className="no-ai-match">

                  <FaClock />

                  <span>
                    No matching Lost/Found
                    report found yet.
                  </span>

                </div>
              )}

            </div>

            {/* =================================================
                REWARD
            ================================================= */}

            <div className="reward-card">

              <h2>
                <FaGift />
                Reward
              </h2>

              <h1>
                ₹{item.reward || 0}
              </h1>

              {hasReward &&
                !isRewardPaid &&
                !isReturned &&
                isOwner && (
                  <div className="reward-warning">

                    <div className="reward-warning-icon">
                      <FaClock />
                    </div>

                    <div>

                      <strong>
                        Reward Locked
                      </strong>

                      <p>
                        Reward can only be
                        paid after the item
                        has been returned.
                      </p>

                    </div>

                  </div>
                )}

              {hasReward &&
                !isRewardPaid &&
                isReturned &&
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
                    {paymentLoading
                      ? "Processing..."
                      : (
                        <>
                          <FaMoneyBillWave />
                          Pay Reward
                        </>
                      )}
                  </button>
                )}

              {isRewardPaid && (
                <div className="reward-paid">

                  <FaCheckCircle />

                  <span>
                    Reward Paid Successfully
                  </span>

                </div>
              )}

              {!hasReward && (
                <div className="no-reward">
                  No reward offered for
                  this item.
                </div>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            CLAIMS
        ================================================= */}

        <section className="claim-section">

          <div className="claim-heading">

            <div>

              <h2>
                Claim Requests
              </h2>

              <p>
                Students who believe this
                item belongs to them can
                submit a claim.
              </p>

            </div>

            <div className="claim-count">

              {claims.length}

              <span>
                {claims.length === 1
                  ? " Claim"
                  : " Claims"}
              </span>

            </div>

          </div>

          {/* OWNER NOTICE */}

          {isOwner &&
            !isReturned && (
              <div className="owner-claim-notice">

                <FaUser />

                <div>

                  <strong>
                    You are the item owner
                  </strong>

                  <p>
                    You can review and approve
                    or reject student claims
                    for this item.
                  </p>

                </div>

              </div>
            )}

          {/* CLAIM FORM */}

          {!isOwner &&
            !isReturned &&
            !myClaim && (
              <div className="claim-form">

                <textarea
                  placeholder="Explain why this item belongs to you..."
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
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

          {/* ALREADY CLAIMED */}

          {myClaim &&
            !isOwner &&
            !isReturned && (
              <div className="already-claimed">

                <FaClock />

                <div>

                  <strong>
                    You already submitted
                    a claim
                  </strong>

                  <p>
                    Current status:{" "}
                    <strong>
                      {String(
                        myClaim.status ||
                          "PENDING"
                      ).toUpperCase()}
                    </strong>
                  </p>

                </div>

              </div>
            )}

          {/* RETURNED */}

          {isReturned && (
            <div className="claims-closed">

              <FaCheckCircle />

              <div>

                <strong>
                  Claims Closed
                </strong>

                <p>
                  This item has already been
                  returned, so new claims are
                  no longer accepted.
                </p>

              </div>

            </div>
          )}

          {/* CLAIM LIST */}

          {claims.length === 0 ? (
            <div className="empty-claims">

              <FaTimesCircle />

              <span>
                No Claims Yet
              </span>

            </div>
          ) : (
            <div className="claims-list">

              {claims.map((claim) => {

                const claimStatus =
                  String(
                    claim.status ||
                      "PENDING"
                  ).toUpperCase();

                const isPending =
                  claimStatus ===
                  "PENDING";

                return (
                  <div
                    key={claim.id}
                    className="claim-card"
                  >

                    {/* USER */}

                    <div className="claim-user">

                      <div className="claim-avatar">
                        <FaUser />
                      </div>

                      <div>

                        <h3>
                          {claim.user?.name ||
                            "Unknown User"}
                        </h3>

                        {claim.user?.email && (
                          <span>
                            {claim.user.email}
                          </span>
                        )}

                        {claim.user?.department && (
                          <small>
                            {claim.user.department}
                          </small>
                        )}

                      </div>

                    </div>

                    {/* MESSAGE */}

                    <p className="claim-message">
                      {claim.message ||
                        "No message provided."}
                    </p>

                    {/* STATUS */}

                    <span
                      className={`claim-status ${claimStatus.toLowerCase()}`}
                    >

                      {claimStatus ===
                        "APPROVED" && (
                        <FaCheckCircle />
                      )}

                      {claimStatus ===
                        "REJECTED" && (
                        <FaTimesCircle />
                      )}

                      {claimStatus ===
                        "PENDING" && (
                        <FaClock />
                      )}

                      {claimStatus}

                    </span>

                    {/* OWNER BUTTONS */}

                    {isOwner &&
                      isPending &&
                      !isReturned && (
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
                            Reject
                          </button>

                        </div>
                      )}

                  </div>
                );
              })}

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

