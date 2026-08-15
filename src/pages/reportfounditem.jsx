import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";

import "../styles/reportitem.css";

function ReportFoundItem() {
    const navigate = useNavigate();

    // =====================================================
    // FORM STATES
    // =====================================================

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");

    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const [image, setImage] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loadingLocation, setLoadingLocation] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

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

        // =================================================
        // VALIDATION
        // =================================================

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
                "Please enter where you found the item."
            );
            return;
        }

        if (!latitude || !longitude) {
            setError(
                "Please click Use Current Location to capture the location."
            );
            return;
        }

        // =================================================
        // SUBMIT
        // =================================================

        try {
            setSubmitting(true);

            const formData =
                new FormData();

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

            // IMPORTANT:
            // Found item status
            formData.append(
                "status",
                "FOUND"
            );

            // =================================================
            // IMAGE
            // =================================================

            if (image) {
                formData.append(
                    "image",
                    image
                );
            }

            // =================================================
            // API REQUEST
            // =================================================

            await api.post(
                "/items",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            setMessage(
                "Found item reported successfully!"
            );

            // =================================================
            // REDIRECT
            // =================================================

            setTimeout(() => {
                navigate("/my-items");
            }, 1200);

        } catch (err) {
            console.error(
                "Failed to report found item:",
                err
            );

            setError(
                err.response &&
                err.response.data &&
                err.response.data.message
                    ? err.response.data.message
                    : "Failed to report found item."
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
            {/* =================================================
                NAVBAR
            ================================================= */}

            <Navbar />

            {/* =================================================
                PAGE
            ================================================= */}

            <div className="lost-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="lost-header">

                    <div>

                        <div className="breadcrumb">

                            Student Portal

                            <span>
                                /
                            </span>

                            Report Found Item

                        </div>

                        <h1>
                            Report a Found Item
                        </h1>

                        <p>
                            Found something that belongs
                            to another student? Provide
                            accurate information so our
                            AI-powered system can help
                            identify the rightful owner.
                        </p>

                    </div>

                    <div className="header-icon">
                        🔔
                    </div>

                </div>

                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <div className="lost-content">

                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <div className="details-card">

                        {/* =================================================
                            CARD HEADING
                        ================================================= */}

                        <div className="card-heading">

                            <div className="heading-icon">
                                📦
                            </div>

                            <div>

                                <h2>
                                    Found Item Details
                                </h2>

                                <p>
                                    Enter accurate information
                                    about the item you found
                                </p>

                            </div>

                        </div>

                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (
                            <div className="alert error-alert">

                                ⚠️

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}

                        {/* =================================================
                            SUCCESS
                        ================================================= */}

                        {message && (
                            <div className="alert success-alert">

                                ✅

                                <span>
                                    {message}
                                </span>

                            </div>
                        )}

                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* =================================================
                                ITEM NAME
                            ================================================= */}

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

                            {/* =================================================
                                CATEGORY
                            ================================================= */}

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

                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

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

                            {/* =================================================
                                FOUND LOCATION
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Where Did You Find It?
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
                                    placeholder="Example: NRI Institute Library"
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
                                            Save the GPS location
                                            where the item was found.
                                        </p>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="current-location-btn"
                                    onClick={
                                        getCurrentLocation
                                    }
                                    disabled={
                                        loadingLocation
                                    }
                                >

                                    {loadingLocation
                                        ? "📍 Getting Location..."
                                        : "📍 Use Current Location"}

                                </button>

                                {/* =================================================
                                    LOCATION RESULT
                                ================================================= */}

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
                                                        GPS coordinates
                                                        have been saved
                                                        with this report.
                                                    </p>

                                                </div>

                                            </div>

                                            {/* =================================================
                                                COORDINATES
                                            ================================================= */}

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

                                            {/* =================================================
                                                DIRECTIONS
                                            ================================================= */}

                                            <div className="directions-title">

                                                🧭

                                                Get Directions

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

                            {/* =================================================
                                IMAGE
                            ================================================= */}

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

                                    <div className="upload-icon">
                                        📷
                                    </div>

                                    <p>
                                        {image
                                            ? image.name
                                            : "Upload a clear image of the found item"}
                                    </p>

                                    <small>
                                        PNG, JPG or JPEG
                                    </small>

                                </div>

                            </div>

                            {/* =================================================
                                FORM BUTTONS
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
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting
                                        ? "Submitting..."
                                        : "Report Found Item →"}

                                </button>

                            </div>

                        </form>

                    </div>

                    {/* =================================================
                        RIGHT INFORMATION PANEL
                    ================================================= */}

                    <div className="information-panel">

                        {/* =================================================
                            INTRO
                        ================================================= */}

                        <div className="info-intro">

                            <span>
                                HELP YOUR CAMPUS
                            </span>

                            <h2>
                                Return Lost Items
                                <br />
                                Faster & Smarter
                            </h2>

                            <p>
                                Report the item you found
                                with accurate details.
                                Our AI-enabled platform
                                helps connect found items
                                with students who reported
                                them as lost.
                            </p>

                        </div>

                        {/* =================================================
                            AI MATCHING
                        ================================================= */}

                        <div className="feature-card">

                            <div className="feature-icon ai-icon">
                                ✨
                            </div>

                            <div>

                                <h3>
                                    AI-Powered Matching
                                </h3>

                                <p>
                                    Our matching system compares
                                    the item name, category,
                                    description and location
                                    with existing lost-item
                                    reports to identify
                                    possible matches.
                                </p>

                            </div>

                        </div>

                        {/* =================================================
                            LOCATION
                        ================================================= */}

                        <div className="feature-card">

                            <div className="feature-icon map-icon">
                                📍
                            </div>

                            <div>

                                <h3>
                                    Smart Location Tracking
                                </h3>

                                <p>
                                    GPS coordinates help
                                    students and administrators
                                    understand where the item
                                    was found. Google Maps
                                    directions are also available.
                                </p>

                            </div>

                        </div>

                        {/* =================================================
                            CLAIM SYSTEM
                        ================================================= */}

                        <div className="feature-card">

                            <div className="feature-icon recovery-icon">
                                🔐
                            </div>

                            <div>

                                <h3>
                                    Secure Claim Verification
                                </h3>

                                <p>
                                    Students can submit a claim
                                    for a possible match.
                                    The item reporter can review
                                    the claim before the recovery
                                    process is completed.
                                </p>

                            </div>

                        </div>

                        {/* =================================================
                            RECOVERY
                        ================================================= */}

                        <div className="feature-card">

                            <div className="feature-icon success-icon">
                                🤝
                            </div>

                            <div>

                                <h3>
                                    Help Someone Recover It
                                </h3>

                                <p>
                                    Your report can help another
                                    student quickly identify and
                                    recover their lost belongings
                                    through the campus portal.
                                </p>

                            </div>

                        </div>

                        {/* =================================================
                            TIPS
                        ================================================= */}

                        <div className="tips-card">

                            <h3>
                                💡 Tips for Better AI Matching
                            </h3>

                            <ul>

                                <li>
                                    Use the correct item category.
                                </li>

                                <li>
                                    Mention the brand, color
                                    and identifying marks.
                                </li>

                                <li>
                                    Upload a clear image.
                                </li>

                                <li>
                                    Enter the exact location
                                    where you found it.
                                </li>

                                <li>
                                    Capture the GPS location
                                    whenever possible.
                                </li>

                            </ul>

                        </div>

                        {/* =================================================
                            PRIVACY
                        ================================================= */}

                        <div className="privacy-card">

                            🔒

                            Your information is securely
                            stored and used to help match
                            lost and found items within
                            the campus portal.

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

export default ReportFoundItem;
