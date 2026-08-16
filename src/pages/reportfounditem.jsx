import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";

import "../styles/reportfounditem.css";

function ReportFoundItem() {
    const navigate = useNavigate();

    // =====================================================
    // STATES
    // =====================================================

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");

    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loadingLocation, setLoadingLocation] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    // =====================================================
    // IMAGE PREVIEW
    // =====================================================

    useEffect(() => {
        if (!image) {
            setImagePreview("");
            return;
        }

        const previewUrl =
            URL.createObjectURL(image);

        setImagePreview(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [image]);

    // =====================================================
    // IMAGE CHANGE
    // =====================================================

    const handleImageChange = (e) => {
        setError("");
        setMessage("");

        const file = e.target.files?.[0];

        if (!file) {
            setImage(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image file."
            );

            e.target.value = "";
            setImage(null);

            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "Image size must be less than 5 MB."
            );

            e.target.value = "";
            setImage(null);

            return;
        }

        setImage(file);
    };

    // =====================================================
    // REMOVE IMAGE
    // =====================================================

    const removeImage = () => {
        setImage(null);
        setImagePreview("");

        const fileInput =
            document.getElementById("found-item-image");

        if (fileInput) {
            fileInput.value = "";
        }
    };

    // =====================================================
    // LOCATION
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
    // GOOGLE MAPS
    // =====================================================

    const openGoogleMaps = (mode) => {
        if (!latitude || !longitude) {
            setError(
                "Please click Use Current Location first."
            );
            return;
        }

        const destination =
            `${latitude},${longitude}`;

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
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!title.trim()) {
            setError("Please enter the item name.");
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

            formData.append(
                "status",
                "FOUND"
            );

            // IMPORTANT
            if (image) {
                formData.append(
                    "image",
                    image,
                    image.name
                );
            }

            await api.post(
                "/items",
                formData
            );

            setMessage(
                "Found item reported successfully!"
            );

            setTimeout(() => {
                navigate("/my-items");
            }, 1200);

        } catch (err) {
            console.error(
                "Failed to report found item:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to report found item."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // JSX
    // =====================================================

    return (
        <>
            <Navbar />

            <div className="found-page">

                {/* HEADER */}
                <div className="found-header">

                    <div>

                        <div className="found-breadcrumb">
                            Student Portal
                            <span>/</span>
                            Report Found Item
                        </div>

                        <h1>
                            Report a Found Item
                        </h1>

                        <p>
                            Found something that belongs to
                            another student? Provide accurate
                            information so our AI-powered system
                            can help identify the rightful owner.
                        </p>

                    </div>

                    <div className="found-header-icon">
                        🔔
                    </div>

                </div>

                {/* MAIN */}
                <div className="found-content">

                    {/* LEFT */}
                    <div className="found-details-card">

                        <div className="found-card-heading">

                            <div className="found-heading-icon">
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

                        {error && (
                            <div className="found-alert found-error">
                                ⚠️
                                <span>{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="found-alert found-success">
                                ✅
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            {/* ITEM NAME */}
                            <div className="found-form-group">

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
                            <div className="found-form-group">

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
                            <div className="found-form-group">

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

                            {/* FOUND LOCATION */}
                            <div className="found-form-group">

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

                            {/* GPS */}
                            <div className="found-location-section">

                                <div className="found-location-title">

                                    <div className="found-location-pin">
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
                                    className="found-current-location-btn"
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

                                {latitude &&
                                    longitude && (
                                        <div className="found-location-success">

                                            <div className="found-location-confirmed">

                                                <span>
                                                    ✓
                                                </span>

                                                <div>
                                                    <strong>
                                                        Location Captured
                                                    </strong>

                                                    <p>
                                                        GPS coordinates
                                                        have been saved.
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="found-coordinates">

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

                                            <div className="found-directions-title">
                                                🧭 Get Directions
                                            </div>

                                            <div className="found-travel-buttons">

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

                            {/* IMAGE */}
                            <div className="found-form-group">

                                <label>
                                    Item Image
                                </label>

                                <div className="found-file-upload">

                                    {!imagePreview ? (
                                        <>
                                            <input
                                                id="found-item-image"
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                                onChange={
                                                    handleImageChange
                                                }
                                            />

                                            <div className="found-upload-icon">
                                                📷
                                            </div>

                                            <strong>
                                                Click to upload image
                                            </strong>

                                            <p>
                                                Upload a clear image
                                                of the found item
                                            </p>

                                            <small>
                                                PNG, JPG, JPEG or WEBP
                                                • Maximum 5 MB
                                            </small>
                                        </>
                                    ) : (
                                        <div className="found-image-preview-container">

                                            <div className="found-image-preview-header">

                                                <strong>
                                                    Image Preview
                                                </strong>

                                                <button
                                                    type="button"
                                                    className="found-remove-image-btn"
                                                    onClick={
                                                        removeImage
                                                    }
                                                >
                                                    ✕ Remove
                                                </button>

                                            </div>

                                            <img
                                                src={imagePreview}
                                                alt="Found item preview"
                                                className="found-uploaded-image-preview"
                                            />

                                            <p className="found-selected-file-name">
                                                {image?.name}
                                            </p>

                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* BUTTONS */}
                            <div className="found-form-actions">

                                <button
                                    type="button"
                                    className="found-cancel-btn"
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
                                    className="found-submit-btn"
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

                    {/* RIGHT */}
                    <div className="found-information-panel">

                        <div className="found-info-intro">

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

                        <div className="found-feature-card">

                            <div className="found-feature-icon">
                                ✨
                            </div>

                            <div>
                                <h3>
                                    AI-Powered Matching
                                </h3>

                                <p>
                                    The system compares item
                                    details with existing
                                    lost-item reports.
                                </p>
                            </div>

                        </div>

                        <div className="found-feature-card">

                            <div className="found-feature-icon">
                                📍
                            </div>

                            <div>
                                <h3>
                                    Smart Location Tracking
                                </h3>

                                <p>
                                    GPS coordinates help identify
                                    where the item was found.
                                </p>
                            </div>

                        </div>

                        <div className="found-feature-card">

                            <div className="found-feature-icon">
                                🔐
                            </div>

                            <div>
                                <h3>
                                    Secure Claim Verification
                                </h3>

                                <p>
                                    Students can submit claims
                                    for possible matches.
                                </p>
                            </div>

                        </div>

                        <div className="found-feature-card">

                            <div className="found-feature-icon">
                                🤝
                            </div>

                            <div>
                                <h3>
                                    Help Someone Recover It
                                </h3>

                                <p>
                                    Your report can help another
                                    student recover their belongings.
                                </p>
                            </div>

                        </div>

                        <div className="found-tips-card">

                            <h3>
                                💡 Tips for Better AI Matching
                            </h3>

                            <ul>
                                <li>
                                    Use the correct category.
                                </li>

                                <li>
                                    Mention brand and color.
                                </li>

                                <li>
                                    Upload a clear image.
                                </li>

                                <li>
                                    Enter the exact location.
                                </li>

                                <li>
                                    Capture GPS location.
                                </li>
                            </ul>

                        </div>

                        <div className="found-privacy-card">
                            🔒 Your information is securely
                            stored and used to help match
                            lost and found items.
                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

export default ReportFoundItem;