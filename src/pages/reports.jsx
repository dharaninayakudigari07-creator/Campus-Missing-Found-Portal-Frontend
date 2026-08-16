import { getImageUrl } from "../config";

import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/reports/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReports(res.data);
    } catch (err) {
      console.log(err);
      alert("Unable to load reports");
    }
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "40px",
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        <h1
          style={{
            color: "#ff6b00",
            marginBottom: "30px",
          }}
        >
          📋 My Reports
        </h1>

        {reports.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0,0,0,.1)",
            }}
          >
            <h2>No reports submitted yet.</h2>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              style={{
                display: "flex",
                gap: "20px",
                background: "#fff",
                marginBottom: "20px",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 5px 15px rgba(0,0,0,.1)",
              }}
            >
              {/* Image */}
              <div>
                {report.item.image ? (
                  <img
                    src={getImageUrl(report.item.image)}
                    alt={report.item.title}
                    style={{
                      width: "170px",
                      height: "170px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "170px",
                      height: "170px",
                      background: "#eee",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "50px",
                      borderRadius: "10px",
                    }}
                  >
                    📦
                  </div>
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1 }}>
                <h2>{report.item.title}</h2>

                <p>
                  <strong>Category :</strong>{" "}
                  {report.item.category}
                </p>

                <p>
                  <strong>Location :</strong>{" "}
                  {report.item.location}
                </p>

                <p>
                  <strong>Reward :</strong> ₹
                  {report.item.reward}
                </p>

                <p>
                  <strong>Your Message :</strong>
                </p>

                <p>{report.message}</p>

                <p>
                  <strong>Status :</strong>{" "}
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      background:
                        report.status === "APPROVED"
                          ? "#22c55e"
                          : report.status === "REJECTED"
                          ? "#ef4444"
                          : "#f59e0b",
                      color: "white",
                    }}
                  >
                    {report.status}
                  </span>
                </p>

                <p
                  style={{
                    marginTop: "10px",
                    color: "#777",
                  }}
                >
                  Submitted on{" "}
                  {new Date(
                    report.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}


