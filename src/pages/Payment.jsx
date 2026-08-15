import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/navbar";
import api from "../services/api";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const item = location.state?.item;

  const [loading, setLoading] = useState(false);

  if (!item) {
    return (
      <>
        <Navbar />
        <div
          style={{
            textAlign: "center",
            marginTop: "80px",
          }}
        >
          <h2>Item not found.</h2>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              marginTop: "20px",
              padding: "12px 25px",
              background: "#ff6600",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </>
    );
  }

  const payNow = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.post(
        "/payment/pay",
        {
          itemId: item.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "Reward Paid Successfully!");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Payment Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "550px",
          margin: "40px auto",
          background: "#fff",
          padding: "35px",
          borderRadius: "15px",
          boxShadow: "0 10px 25px rgba(0,0,0,.15)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#ff6600",
            marginBottom: "20px",
          }}
        >
          Reward Payment
        </h1>

        {item.image && (
          <img
            src={`http://localhost:5000/uploads/${item.image}`}
            alt={item.title}
            style={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          />
        )}

        <h2>{item.title}</h2>

        <p>{item.description}</p>

        <p>
          <strong>Category:</strong> {item.category}
        </p>

        <p>
          <strong>Location:</strong> {item.location}
        </p>

        <h2
          style={{
            color: "green",
            marginTop: "20px",
          }}
        >
          Reward: ₹{item.reward}
        </h2>

        <button
          onClick={payNow}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            marginTop: "30px",
            background: "#ff6600",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "💳 Pay Reward"}
        </button>
      </div>
    </>
  );
}
