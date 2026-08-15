import { Link } from "react-router-dom";
import "../styles/itemcard.css";

export default function ItemCard({ item }) {
  const statusColor = {
    LOST: "#ef4444",
    FOUND: "#22c55e",
    RETURNED: "#3b82f6",
  };

  return (
    <div className="item-card">
      {/* Image */}
      {item.image ? (
        <img
          src={`https://campus-missing-found-portal-backend.onrender.com/uploads/${item.image}`}
          alt={item.title}
          className="item-image"
        />
      ) : (
        <div className="no-image">📦</div>
      )}

      <div className="item-content">
        <h2 className="item-title">{item.title}</h2>

        <p className="item-description">{item.description}</p>

        <p>
          <strong>🏷 Category:</strong> {item.category}
        </p>

        <p>
          <strong>📍 Location:</strong> {item.location}
        </p>

        {/* Reward */}
        {item.reward > 0 && (
          <p
            style={{
              color: "#16a34a",
              fontWeight: "bold",
              marginTop: "8px",
            }}
          >
            💰 Reward : ₹{item.reward}
          </p>
        )}

        {/* AI Match */}
        {item.matchPercentage > 0 && (
          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              borderRadius: "8px",
              background: "#eef6ff",
              color: "#2563eb",
              fontWeight: "bold",
            }}
          >
            🤖 AI Match : {item.matchPercentage}%
          </div>
        )}

        {/* Status */}
        <div
          className="status"
          style={{
            background: statusColor[item.status] || "#6b7280",
          }}
        >
          {item.status}
        </div>

        <p className="posted-date">
          📅 Posted on{" "}
          {new Date(item.createdAt).toLocaleDateString()}
        </p>

        <Link to={`/item/${item.id}`}>
          <button className="details-btn">
            View Details →
          </button>
        </Link>
      </div>
    </div>
  );
}

