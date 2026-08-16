import { useState, useEffect } from "react";
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
const [imagePreview, setImagePreview] = useState("");

const [message, setMessage] = useState("");
const [error, setError] = useState("");

const [loadingLocation, setLoadingLocation] = useState(false);
const [submitting, setSubmitting] = useState(false);

// =====================================================
// IMAGE PREVIEW CLEANUP
// =====================================================

useEffect(() => {
    return () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
    };
}, [imagePreview]);

// =====================================================
// IMAGE UPLOAD
// =====================================================

const handleImageChange = (e) => {
    setError("");
    setMessage("");

    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
        setImage(null);
        setImagePreview("");
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
    ];

    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
    ];

    const fileName = selectedFile.name.toLowerCase();

    const validMimeType = allowedTypes.includes(
        selectedFile.type
    );

    const validExtension = allowedExtensions.some(
        (extension) => fileName.endsWith(extension)
    );

    if (!validMimeType && !validExtension) {
        setError(
            "Please upload JPG, JPEG, PNG, WEBP or GIF images."
        );

        e.target.value = "";
        setImage(null);
        setImagePreview("");

        return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
        setError(
            "Image size must be less than 10 MB."
        );

        e.target.value = "";
        setImage(null);
        setImagePreview("");

        return;
    }

    setImage(selectedFile);

    const previewUrl =
        URL.createObjectURL(selectedFile);

    setImagePreview(previewUrl);

    console.log(
        "========== IMAGE SELECTED =========="
    );

    console.log("File:", selectedFile);
    console.log("Name:", selectedFile.name);
    console.log("Type:", selectedFile.type);
    console.log("Size:", selectedFile.size);
    console.log("Preview URL:", previewUrl);
};

// =====================================================
// REMOVE IMAGE
// =====================================================

const removeImage = () => {
    if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview("");

    const fileInput =
        document.getElementById(
            "lost-item-image"
        );

    if (fileInput) {
        fileInput.value = "";
    }
};

// =====================================================
// GET CURRENT LOCATION
// =====================================================

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
            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;

            setLatitude(String(lat));
            setLongitude(String(lng));

            setMessage(
                "Current location captured successfully."
            );

            setLoadingLocation(false);
        },

        (err) => {
            console.error(
                "Location error:",
                err
            );

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
            maximumAge: 0,
        }
    );
};

// =====================================================
// GOOGLE MAPS DIRECTIONS
// =====================================================

const openGoogleMaps = (mode) => {
    if (!latitude || !longitude) {
        setError(
            "Please click Use Current Location first."
        );

        return;
    }

    const destination =
        String(latitude) +
        "," +
        String(longitude);

    const url =
        "https://www.google.com/maps/dir/?api=1" +
        "&destination=" +
        encodeURIComponent(destination) +
        "&travelmode=" +
        mode;

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
};

// =====================================================
// SUBMIT FORM
// =====================================================

const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!title.trim()) {
        setError(
            "Please enter the item name."
        );
        return;
    }

    if (!description.trim()) {
        setError(
            "Please enter the item description."
        );
        return;
    }

    if (!category) {
        setError(
            "Please select a category."
        );
        return;
    }

    if (!location.trim()) {
        setError(
            "Please enter where the item was lost."
        );
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

        formData.append(
            "title",
            title.trim()
        );

        formData.append(
            "description",
            description.trim()
        );

        formData.append(
            "category",
            category
        );

        formData.append(
            "location",
            location.trim()
        );

        formData.append(
            "latitude",
            latitude
        );

        formData.append(
            "longitude",
            longitude
        );

        formData.append(
            "status",
            "LOST"
        );

        formData.append(
            "reward",
            reward || "0"
        );

        // =================================================
        // IMAGE
        // =================================================

        if (image instanceof File) {
            formData.append(
                "image",
                image,
                image.name
            );
        }

        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "========== SUBMITTING LOST ITEM =========="
        );

        console.log(
            "Image state:",
            image
        );

        console.log(
            "Is File:",
            image instanceof File
        );

        console.log(
            "Image name:",
            image?.name
        );

        console.log(
            "Image type:",
            image?.type
        );

        console.log(
            "Image size:",
            image?.size
        );

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(
                    "FORM DATA:",
                    key,
                    {
                        name: value.name,
                        type: value.type,
                        size: value.size,
                    }
                );
            } else {
                console.log(
                    "FORM DATA:",
                    key,
                    value
                );
            }
        }

        // =================================================
        // API REQUEST
        // =================================================

        await api.post(
            "/items",
            formData
        );

        setMessage(
            "Lost item reported successfully!"
        );

        setImage(null);
        setImagePreview("");

        setTimeout(() => {
            navigate("/my-items");
        }, 1200);

    } catch (err) {
        console.error(
            "Failed to report lost item:",
            err
        );

        setError(
            err.response?.data?.message ||
            "Failed to report lost item."
        );
    } finally {
        setSubmitting(false);
    }
};

// =====================================================
// RENDER
// =====================================================

return (
    <>
        <Navbar />

        <div className="lost-page">

            {/* =================================================
                HEADER
            ================================================= */}

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

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="lost-content">

                {/* =================================================
                    LEFT CARD
                ================================================= */}

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
                            ⚠️
                            <span>
                                {error}
                            </span>
                        </div>
                    )}

                    {/* SUCCESS */}

                    {message && (
                        <div className="alert success-alert">
                            ✅
                            <span>
                                {message}
                            </span>
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
                                    setTitle(
                                        e.target.value
                                    )
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
                                    setCategory(
                                        e.target.value
                                    )
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

                                <option value="Clothing">
                                    Clothing
                                </option>

                                <option value="Bags">
                                    Bags
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

                        {/* =================================================
                            GPS LOCATION
                        ================================================= */}

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

                            {latitude &&
                                longitude && (
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
                                                🚗 Car
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openGoogleMaps(
                                                        "walking"
                                                    )
                                                }
                                            >
                                                🚶 Walk
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openGoogleMaps(
                                                        "bicycling"
                                                    )
                                                }
                                            >
                                                🚲 Bike
                                            </button>

                                        </div>

                                    </div>
                                )}

                        </div>

                        {/* =================================================
                            REWARD
                        ================================================= */}

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

                        {/* =================================================
                            IMAGE UPLOAD
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Item Image
                            </label>

                            <div className="file-upload">

                                <input
                                    id="lost-item-image"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageChange}
                                />

                                {!imagePreview && (
                                    <>
                                        <div className="upload-icon">
                                            📷
                                        </div>

                                        <p>
                                            Upload a clear image
                                            of the lost item
                                        </p>

                                        <small>
                                            JPG, JPEG, PNG, WEBP
                                            or GIF • Maximum 10 MB
                                        </small>
                                    </>
                                )}

                                {imagePreview && (
                                    <div className="image-preview-container">

                                        <img
                                            src={imagePreview}
                                            alt="Lost item preview"
                                            className="image-preview"
                                        />

                                        <div className="image-preview-info">

                                            <strong>
                                                {image?.name}
                                            </strong>

                                            <span>
                                                {image
                                                    ? (
                                                        image.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)
                                                    : "0.00"}{" "}
                                                MB
                                            </span>

                                        </div>

                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={removeImage}
                                        >
                                            ✕ Remove Image
                                        </button>

                                    </div>
                                )}

                            </div>

                        </div>

                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() =>
                                    navigate(
                                        "/dashboard"
                                    )
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

                {/* =================================================
                    RIGHT INFORMATION PANEL
                ================================================= */}

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
                                item was lost.
                            </p>

                        </div>

                    </div>

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
                            </p>

                        </div>

                    </div>

                    <div className="feature-card">

                        <div className="feature-icon recovery-icon">
                            🔔
                        </div>

                        <div>

                            <h3>
                                Faster Recovery
                            </h3>

                            <p>
                                Review possible matches and
                                proceed with the claim and
                                recovery process.
                            </p>

                        </div>

                    </div>

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
