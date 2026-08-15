import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiEye,
  FiCheckCircle,
  FiTrash2,
  FiPackage,
  FiMapPin,
  FiCalendar,
  FiTag,
  FiAlertCircle,
  FiPlusCircle,
  FiArrowRight,
} from "react-icons/fi";

import Navbar from "../components/navbar";
import api from "../services/api";

import "../styles/myitems.css";

function MyItems() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH MY ITEMS
  // ==========================================

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/items/my/items");

      setItems(response.data || []);
    } catch (err) {
      console.error("MY ITEMS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your items."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, []);

  // ==========================================
  // IMAGE URL
  // ==========================================

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    // If backend already returned complete URL
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // Normal backend uploaded image
    return `http://localhost:5000/uploads/${image}`;
  };

  // ==========================================
  // MARK RETURNED
  // ==========================================

  const handleReturned = async (id) => {
    const confirmReturn = window.confirm(
      "Are you sure you want to mark this item as returned?"
    );

    if (!confirmReturn) {
      return;
    }

    try {
      await api.put(`/items/${id}/returned`);

      alert("Item marked as returned successfully.");

      fetchMyItems();
    } catch (err) {
      console.error("RETURN ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to mark item as returned."
      );
    }
  };

  // ==========================================
  // DELETE ITEM
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/items/${id}`);

      alert("Item deleted successfully.");

      setItems((previousItems) =>
        previousItems.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("DELETE ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete item."
      );
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "LOST":
        return "status-lost";

      case "FOUND":
        return "status-found";

      case "RETURNED":
        return "status-returned";

      default:
        return "status-default";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="my-items-page">
        <Navbar />

        <section className="my-items-loading">
          <div className="my-items-spinner"></div>

          <h2>Loading Your Items...</h2>

          <p>
            Please wait while we retrieve your reported items.
          </p>
        </section>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="my-items-page">

      <Navbar />

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="my-items-hero">

        <div className="hero-decoration hero-decoration-one"></div>

        <div className="hero-decoration hero-decoration-two"></div>

        <div className="my-items-hero-content">

          <div className="hero-label">
            <FiPackage />
            <span>PERSONAL COLLECTION</span>
          </div>

          <h1>
            My <span>Items</span>
          </h1>

          <p>
            View and manage all the lost and found items
            you have reported on the campus portal.
          </p>

          <div className="hero-actions">

            <button
              className="hero-report-btn"
              onClick={() => navigate("/report-lost")}
            >
              <FiPlusCircle />
              Report Lost Item
            </button>

            <button
              className="hero-report-btn secondary"
              onClick={() => navigate("/report-found")}
            >
              <FiPackage />
              Report Found Item
            </button>

          </div>

        </div>

      </section>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="my-items-content">

        {/* ERROR */}

        {error && (
          <div className="my-items-error">
            <FiAlertCircle />

            <div>
              <strong>Unable to load items</strong>

              <p>{error}</p>
            </div>

            <button onClick={fetchMyItems}>
              Try Again
            </button>
          </div>
        )}

        {/* ==========================================
            TOP BAR
        ========================================== */}

        <div className="items-topbar">

          <div>
            <span className="section-label">
              YOUR ACTIVITY
            </span>

            <h2>
              Reported Items
            </h2>

            <p>
              {items.length === 0
                ? "You haven't reported any items yet."
                : `You have reported ${items.length} ${
                    items.length === 1 ? "item" : "items"
                  }.`}
            </p>
          </div>

          <div className="item-count">
            <FiPackage />

            <span>
              {items.length}
            </span>

            <small>
              Items
            </small>
          </div>

        </div>

        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {items.length === 0 && !error && (
          <div className="empty-items">

            <div className="empty-icon">
              <FiPackage />
            </div>

            <h2>
              No Items Reported Yet
            </h2>

            <p>
              Start by reporting a lost or found item.
              Your items will appear here.
            </p>

            <div className="empty-actions">

              <button
                onClick={() => navigate("/report-lost")}
              >
                <FiPlusCircle />
                Report Lost Item
              </button>

              <button
                onClick={() => navigate("/report-found")}
              >
                <FiPackage />
                Report Found Item
              </button>

            </div>

          </div>
        )}

        {/* ==========================================
            ITEMS GRID
        ========================================== */}

        {items.length > 0 && (
          <div className="my-items-grid">

            {items.map((item) => {

              const imageUrl = getImageUrl(item.image);

              return (
                <article
                  className="my-item-card"
                  key={item.id}
                >

                  {/* ==================================
                      IMAGE
                  ================================== */}

                  <div className="item-image-wrapper">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title || "Item"}
                        className="item-image"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";

                          const fallback =
                            e.currentTarget.parentElement.querySelector(
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
                        display: imageUrl
                          ? "none"
                          : "flex",
                      }}
                    >
                      <FiPackage />
                      <span>No Image</span>
                    </div>

                    {/* STATUS */}

                    <span
                      className={`item-status ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                  </div>

                  {/* ==================================
                      CARD BODY
                  ================================== */}

                  <div className="item-card-body">

                    <div className="item-category">

                      <FiTag />

                      <span>
                        {item.category || "General"}
                      </span>

                    </div>

                    <h3>
                      {item.title}
                    </h3>

                    <p className="item-description">
                      {item.description ||
                        "No description provided."}
                    </p>

                    {/* DETAILS */}

                    <div className="item-details">

                      <div className="item-detail">

                        <FiMapPin />

                        <span>
                          {item.location ||
                            "Location not specified"}
                        </span>

                      </div>

                      <div className="item-detail">

                        <FiCalendar />

                        <span>
                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Date unavailable"}
                        </span>

                      </div>

                    </div>

                    {/* REWARD */}

                    {Number(item.reward) > 0 && (
                      <div className="item-reward">

                        <span>
                          Reward
                        </span>

                        <strong>
                          ₹{Number(item.reward).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>
                    )}

                    {/* ==================================
                        ACTIONS
                    ================================== */}

                    <div className="item-actions">

                      <button
                        className="view-item-btn"
                        onClick={() =>
                          navigate(
                            `/item-details/${item.id}`
                          )
                        }
                      >
                        <FiEye />

                        <span>
                          View Details
                        </span>

                        <FiArrowRight />
                      </button>

                      {item.status !== "RETURNED" && (
                        <button
                          className="return-item-btn"
                          onClick={() =>
                            handleReturned(item.id)
                          }
                          title="Mark as returned"
                        >
                          <FiCheckCircle />

                          <span>
                            Returned
                          </span>
                        </button>
                      )}

                      <button
                        className="delete-item-btn"
                        onClick={() =>
                          handleDelete(item.id)
                        }
                        title="Delete item"
                      >
                        <FiTrash2 />
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </main>

    </div>
  );
}

export default MyItems;
