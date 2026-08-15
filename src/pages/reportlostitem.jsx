import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/reportlostitem.css";

function ReportLostItem() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [reward, setReward] = useState("");
    const [image, setImage] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ==============================
    // GET CURRENT LOCATION
    // ==============================
    const getCurrentLocation = () => {
        setError("");
        setMessage("");

        if (!navigator.geolocation) {
            setError(
                "Geolocation is not supported by your browser."
            );
            return;
        }

        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setLatitude(String(lat));
                setLongitude(String(lng));

                setMessage(
                    "Current location captured successfully."
                );

                setLoadingLocation(false);
            },
            (err) => {
                console.error("Location error:", err);

                setLoadingLocation(false);

                if (err.code === 1) {
                    setError(
                        "Location permission denied. Click Allow in Chrome and try again."
                    );
                } else if (err.code === 2) {
                    setError(
                        "Your location could not be determined. Please try again."
                    );
                } else if (err.code === 3) {
                    setError(
                        "Location request timed out. Please try again."
                    );
                } else {
                    setError(
                        "Unable to get your current location."
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    // ==============================
    // GOOGLE MAPS DIRECTIONS
    // ==============================
    const openGoogleMaps = (mode) => {
        if (!latitude || !longitude) {
            setError(
                "Please click Use Current Location first."
            );
            return;
        }

        const destination =
            String(latitude) + "," + String(longitude);

        const url =
            "https://www.google.com/maps/dir/?api=1" +
            "&destination=" +
            encodeURIComponent(destination) +
            "&travelmode=" +
            mode;

        window.open(url, "_blank");
    };

    // ==============================
    // SUBMIT FORM
    // ==============================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!title.trim()) {
            setError("Please enter the item name.");
            return;
        }

        if (!description.trim()) {
            setError("Please enter the item description.");
            return;
        }

        if (!category) {
            setError("Please select a category.");
            return;
        }

        if (!location.trim()) {
            setError("Please enter where the item was lost.");
            return;
        }

        if (!latitude || !longitude) {
            setError(
                "Please click Use Current Location to capture the location."
            );
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();

            formData.append("title", title);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("location", location);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("status", "LOST");
            formData.append("reward", reward || "0");

            if (image) {
                formData.append("image", image);
            }

            await api.post("/items", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setMessage(
                "Lost item reported successfully!"
            );

            setTimeout(() => {
                navigate("/my-items");
            }, 1200);

        } catch (err) {
            console.error(
                "Failed to report lost item:",
                err
            );

            setError(
                err.response &&
                err.response.data &&
                err.response.data.message
                    ? err.response.data.message
                    : "Failed to report lost item."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* =========================================
                NAVBAR
            ========================================= */}
            <Navbar />

            {/* =========================================
                REPORT LOST PAGE
            ========================================= */}
            <div className="lost-page">

                {/* HEADER */}

                <div className="lost-header">

                    <div>

                        <div className="breadcrumb">
                            Student Portal
                            <span>/</span>
                            Report Lost Item
                        </div>

                        <h1>
                            Report Your Lost Item
                        </h1>

                        <p>
                            Provide clear information about your
                            missing item to help our AI-powered
                            system find the best possible match.
                        </p>

                    </div>

                    <div className="header-icon">
                        🔎
                    </div>

                </div>

                {/* MAIN CONTENT */}

                <div className="lost-content">

                    {/* =====================================
                        LEFT SIDE
                    ===================================== */}

                    <div className="details-card">

                        <div className="card-heading">

                            <div className="heading-icon">
                                📦
                            </div>

                            <div>
                                <h2>
                                    Item Details
                                </h2>

                                <p>
                                    Enter the details of your missing item
                                </p>
                            </div>

                        </div>

                        {/* ERROR */}

                        {error && (
                            <div className="alert error-alert">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* SUCCESS */}

                        {message && (
                            <div className="alert success-alert">
                                ✅ {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            {/* ITEM NAME */}

                            <div className="form-group">

                                <label>
                                    Item Name
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    placeholder="Example: Black Laptop"
                                />

                            </div>

                            {/* CATEGORY */}

                            <div className="form-group">

                                <label>
                                    Category
                                    <span>*</span>
                                </label>

                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    <option value="Electronics">
                                        Electronics
                                    </option>

                                    <option value="Documents">
                                        Documents
                                    </option>

                                    <option value="Wallet">
                                        Wallet
                                    </option>

                                    <option value="Keys">
                                        Keys
                                    </option>

                                    <option value="Books">
                                        Books
                                    </option>

                                    <option value="Accessories">
                                        Accessories
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            {/* DESCRIPTION */}

                            <div className="form-group">

                                <label>
                                    Description
                                    <span>*</span>
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Describe the item, color, brand, identifying marks, stickers, serial number, etc."
                                    rows={5}
                                />

                            </div>

                            {/* LOST LOCATION */}

                            <div className="form-group">

                                <label>
                                    Where Did You Lose It?
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: KL University Library"
                                />

                            </div>

                            {/* CURRENT LOCATION */}

                            <div className="location-section">

                                <div className="location-title">

                                    <div className="location-pin">
                                        📍
                                    </div>

                                    <div>

                                        <h3>
                                            Capture Exact Location
                                        </h3>

                                        <p>
                                            Allow Chrome to access
                                            your location and we will
                                            save the exact GPS position.
                                        </p>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="current-location-btn"
                                    onClick={getCurrentLocation}
                                    disabled={loadingLocation}
                                >
                                    {loadingLocation
                                        ? "📍 Getting Location..."
                                        : "📍 Use Current Location"}
                                </button>

                                {latitude && longitude && (

                                    <div className="location-success">

                                        <div className="location-confirmed">

                                            <span>
                                                ✓
                                            </span>

                                            <div>

                                                <strong>
                                                    Location Captured
                                                </strong>

                                                <p>
                                                    Your exact GPS
                                                    coordinates have
                                                    been saved.
                                                </p>

                                            </div>

                                        </div>

                                        <div className="coordinates">

                                            <div>

                                                <span>
                                                    Latitude
                                                </span>

                                                <strong>
                                                    {Number(
                                                        latitude
                                                    ).toFixed(6)}
                                                </strong>

                                            </div>

                                            <div>

                                                <span>
                                                    Longitude
                                                </span>

                                                <strong>
                                                    {Number(
                                                        longitude
                                                    ).toFixed(6)}
                                                </strong>

                                            </div>

                                        </div>

                                        <div className="directions-title">
                                            🧭 Get Directions
                                        </div>

                                        <div className="travel-buttons">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openGoogleMaps(
                                                        "driving"
                                                    )
                                                }
                                            >
                                                <span>
                                                    🚗
                                                </span>

                                                Car
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openGoogleMaps(
                                                        "walking"
                                                    )
                                                }
                                            >
                                                <span>
                                                    🚶
                                                </span>

                                                Walk
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openGoogleMaps(
                                                        "bicycling"
                                                    )
                                                }
                                            >
                                                <span>
                                                    🚲
                                                </span>

                                                Bike
                                            </button>

                                        </div>

                                    </div>

                                )}

                            </div>

                            {/* REWARD */}

                            <div className="form-group">

                                <label>
                                    Reward Amount
                                </label>

                                <div className="reward-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={reward}
                                        onChange={(e) =>
                                            setReward(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Example: 500"
                                    />

                                </div>

                                <small>
                                    Optional reward for the person
                                    who successfully returns your
                                    item.
                                </small>

                            </div>

                            {/* IMAGE */}

                            <div className="form-group">

                                <label>
                                    Item Image
                                </label>

                                <div className="file-upload">

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setImage(
                                                e.target.files &&
                                                e.target.files[0]
                                                    ? e.target.files[0]
                                                    : null
                                            )
                                        }
                                    />

                                    <p>
                                        Upload a clear image of
                                        your lost item
                                    </p>

                                </div>

                            </div>

                            {/* BUTTONS */}

                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        navigate("/dashboard")
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Report Lost Item →"}
                                </button>

                            </div>

                        </form>

                    </div>

                    {/* =====================================
                        RIGHT INFORMATION PANEL
                    ===================================== */}

                    <div className="information-panel">

                        <div className="info-intro">

                            <span>
                                HOW IT WORKS
                            </span>

                            <h2>
                                Find Your Item
                                <br />
                                Faster & Smarter
                            </h2>

                            <p>
                                Our AI-enabled campus platform
                                combines intelligent matching,
                                location tracking and reward
                                support to improve the chances
                                of recovering your belongings.
                            </p>

                        </div>

                        {/* AI MATCHING */}

                        <div className="feature-card">

                            <div className="feature-icon ai-icon">
                                ✨
                            </div>

                            <div>

                                <h3>
                                    AI-Powered Matching
                                </h3>

                                <p>
                                    AI analyzes the item name,
                                    category, description,
                                    image details and location
                                    to compare your lost item
                                    with reported found items.
                                </p>

                            </div>

                        </div>

                        {/* LOCATION */}

                        <div className="feature-card">

                            <div className="feature-icon map-icon">
                                📍
                            </div>

                            <div>

                                <h3>
                                    Smart Location Tracking
                                </h3>

                                <p>
                                    Your GPS location helps
                                    identify exactly where the
                                    item was lost. Google Maps
                                    directions can provide
                                    driving, walking and bicycle
                                    routes.
                                </p>

                            </div>

                        </div>

                        {/* REWARD */}

                        <div className="feature-card">

                            <div className="feature-icon reward-icon">
                                💰
                            </div>

                            <div>

                                <h3>
                                    Reward Payment
                                </h3>

                                <p>
                                    Add an optional reward to
                                    encourage students to report
                                    and return your lost item.
                                    Reward processing can be
                                    integrated securely into the
                                    campus portal.
                                </p>

                            </div>

                        </div>

                        {/* RECOVERY */}

                        <div className="feature-card">

                            <div className="feature-icon recovery-icon">
                                🔔
                            </div>

                            <div>

                                <h3>
                                    Faster Recovery
                                </h3>

                                <p>
                                    When a possible match is
                                    identified, users can review
                                    the reported information and
                                    proceed with the claim and
                                    recovery process.
                                </p>

                            </div>

                        </div>

                        {/* TIPS */}

                        <div className="tips-card">

                            <h3>
                                💡 Tips for Better AI Matching
                            </h3>

                            <ul>

                                <li>
                                    Use the correct item category.
                                </li>

                                <li>
                                    Mention brand, color and
                                    identifying marks.
                                </li>

                                <li>
                                    Upload a clear item image.
                                </li>

                                <li>
                                    Capture your exact location.
                                </li>

                            </ul>

                        </div>

                        {/* PRIVACY */}

                        <div className="privacy-card">

                            🔒 Your information is securely
                            stored and used to help match lost
                            and found items within the campus
                            portal.

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

export default ReportLostItem;

