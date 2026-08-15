import { useEffect, useState, useCallback } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    CircleMarker,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import "../styles/locationtracking.css";

// ==========================================
// MAP MARKERS
// ==========================================

const lostIcon = new L.DivIcon({
    className: "custom-map-marker",
    html: '<div class="lost-marker">!</div>',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

const foundIcon = new L.DivIcon({
    className: "custom-map-marker",
    html: '<div class="found-marker">✓</div>',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

// ==========================================
// MOVE MAP TO LOCATION
// ==========================================

function MapMover({ location }) {
    const map = useMap();

    useEffect(() => {
        if (location) {
            map.flyTo(
                [location.latitude, location.longitude],
                17,
                {
                    duration: 1,
                }
            );
        }
    }, [location, map]);

    return null;
}

// ==========================================
// LOCATION TRACKING PAGE
// ==========================================

function LocationTracking() {
    const [items, setItems] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState("");

    // Default location
    const defaultLocation = [16.3725, 80.4700];

    // ==========================================
    // LOAD ITEMS + START GPS
    // ==========================================

    // ==========================================
    // LOAD LOST/FOUND ITEMS
    // ==========================================

    const loadItems = useCallback(async () => {
        try {
            const response = await api.get("/items");

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            const validItems = data.filter((item) => {
                return (
                    item.latitude !== null &&
                    item.longitude !== null &&
                    item.latitude !== undefined &&
                    item.longitude !== undefined
                );
            });

            setItems(validItems);
        } catch (error) {
            console.error("Unable to load items:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // ==========================================
    // LIVE GPS TRACKING
    // ==========================================

    const startLocationTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError(
                "Geolocation is not supported by your browser."
            );
            return;
        }

        navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                setLocationError("");
            },
            (error) => {
                console.error("GPS Error:", error);

                setLocationError(
                    "Please allow location access to show your position."
                );
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000,
            }
        );
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => {
            loadItems();
            startLocationTracking();
        });
    }, [loadItems, startLocationTracking]);

    // ==========================================
    // GO TO CURRENT LOCATION
    // ==========================================

    const goToMyLocation = () => {
        if (!userLocation) {
            alert("Your current location is not available yet.");
            return;
        }

        window.dispatchEvent(
            new CustomEvent("centerUserLocation", {
                detail: userLocation,
            })
        );
    };

    // ==========================================
    // SEARCH
    // ==========================================

    const filteredItems = items.filter((item) => {
        const searchValue = search.toLowerCase().trim();

        if (!searchValue) {
            return true;
        }

        return (
            String(item.title || "")
                .toLowerCase()
                .includes(searchValue) ||
            String(item.category || "")
                .toLowerCase()
                .includes(searchValue) ||
            String(item.location || "")
                .toLowerCase()
                .includes(searchValue)
        );
    });

    // ==========================================
    // GOOGLE MAPS DIRECTIONS
    // ==========================================

    const openDirections = (item) => {
        if (
            item.latitude === null ||
            item.longitude === null ||
            item.latitude === undefined ||
            item.longitude === undefined
        ) {
            alert("Location coordinates are not available.");
            return;
        }

        const destination =
            `${Number(item.latitude)},${Number(item.longitude)}`;

        const googleMapsUrl =
            `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

        window.open(
            googleMapsUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="google-map-page">

            {/* ==================================
                MAP
            ================================== */}

            <MapContainer
                center={defaultLocation}
                zoom={16}
                zoomControl={false}
                className="google-style-map"
            >

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* ==================================
                    USER LIVE LOCATION
                ================================== */}

                {userLocation && (
                    <>
                        <MapMover location={userLocation} />

                        <CircleMarker
                            center={[
                                userLocation.latitude,
                                userLocation.longitude,
                            ]}
                            radius={9}
                            pathOptions={{
                                color: "#ffffff",
                                fillColor: "#4285f4",
                                fillOpacity: 1,
                                weight: 4,
                            }}
                        />

                        <CircleMarker
                            center={[
                                userLocation.latitude,
                                userLocation.longitude,
                            ]}
                            radius={28}
                            pathOptions={{
                                color: "#4285f4",
                                fillColor: "#4285f4",
                                fillOpacity: 0.12,
                                weight: 1,
                            }}
                        />
                    </>
                )}

                {/* ==================================
                    LOST / FOUND ITEM MARKERS
                ================================== */}

                {filteredItems.map((item) => (
                    <Marker
                        key={item.id}
                        position={[
                            Number(item.latitude),
                            Number(item.longitude),
                        ]}
                        icon={
                            item.status === "LOST"
                                ? lostIcon
                                : foundIcon
                        }
                        eventHandlers={{
                            click: () => {
                                setSelectedItem(item);
                            },
                        }}
                    >
                        <Popup>

                            <div className="map-item-popup">

                                <div
                                    className={
                                        item.status === "LOST"
                                            ? "popup-label lost"
                                            : "popup-label found"
                                    }
                                >
                                    {item.status}
                                </div>

                                <h3>
                                    {item.title || "Unnamed Item"}
                                </h3>

                                <p>
                                    {item.category || "Other"}
                                </p>

                                <div className="popup-location">
                                    📍{" "}
                                    {item.location ||
                                        "Unknown location"}
                                </div>

                                {item.description && (
                                    <div className="popup-description">
                                        {item.description}
                                    </div>
                                )}

                                <button
                                    className="popup-direction-button"
                                    onClick={() =>
                                        openDirections(item)
                                    }
                                >
                                    🧭 Directions
                                </button>

                            </div>

                        </Popup>
                    </Marker>
                ))}

            </MapContainer>

            {/* ==================================
                SEARCH BAR
            ================================== */}

            <div className="google-search-container">

                <div className="google-search-box">

                    <span className="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search lost or found items"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    {search && (
                        <button
                            className="clear-search"
                            onClick={() => setSearch("")}
                        >
                            ×
                        </button>
                    )}

                </div>

            </div>

            {/* ==================================
                CURRENT LOCATION
            ================================== */}

            <button
                className="current-location-button"
                onClick={goToMyLocation}
                title="Your location"
            >
                <span>➤</span>
            </button>

            {/* ==================================
                LOCATION ERROR
            ================================== */}

            {locationError && (
                <div className="location-message">
                    ⚠️ {locationError}
                </div>
            )}

            {/* ==================================
                SEARCH RESULTS
            ================================== */}

            {search.trim() &&
                filteredItems.length > 0 && (

                    <div className="search-results">

                        {filteredItems
                            .slice(0, 5)
                            .map((item) => (

                                <div
                                    className="search-result"
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setSearch("");
                                    }}
                                >

                                    <div
                                        className={
                                            item.status === "LOST"
                                                ? "result-icon lost"
                                                : "result-icon found"
                                        }
                                    >
                                        {item.status === "LOST"
                                            ? "!"
                                            : "✓"}
                                    </div>

                                    <div>

                                        <strong>
                                            {item.title}
                                        </strong>

                                        <span>
                                            📍{" "}
                                            {item.location ||
                                                "Unknown location"}
                                        </span>

                                    </div>

                                </div>

                            ))}

                    </div>
                )}

            {/* ==================================
                SELECTED ITEM CARD
            ================================== */}

            {selectedItem && (

                <div className="selected-item-card">

                    <button
                        className="close-card"
                        onClick={() =>
                            setSelectedItem(null)
                        }
                    >
                        ×
                    </button>

                    <div
                        className={
                            selectedItem.status === "LOST"
                                ? "card-status lost"
                                : "card-status found"
                        }
                    >
                        {selectedItem.status}
                    </div>

                    <h2>
                        {selectedItem.title ||
                            "Unnamed Item"}
                    </h2>

                    <p className="card-category">
                        {selectedItem.category ||
                            "Other"}
                    </p>

                    <p className="card-location">
                        📍{" "}
                        {selectedItem.location ||
                            "Unknown location"}
                    </p>

                    {selectedItem.description && (
                        <p className="card-description">
                            {selectedItem.description}
                        </p>
                    )}

                    <button
                        className="directions-button"
                        onClick={() =>
                            openDirections(selectedItem)
                        }
                    >
                        🧭 Get Directions
                    </button>

                </div>

            )}

            {/* ==================================
                MAP LEGEND
            ================================== */}

            <div className="map-info-card">

                <div>
                    <span className="info-dot lost"></span>
                    Lost
                </div>

                <div>
                    <span className="info-dot found"></span>
                    Found
                </div>

                <div>
                    <span className="info-dot you"></span>
                    You
                </div>

            </div>

            {/* ==================================
                LOADING
            ================================== */}

            {loading && (

                <div className="map-loading-overlay">

                    <div className="loading-circle"></div>

                    <span>
                        Loading map...
                    </span>

                </div>

            )}

        </div>
    );
}

export default LocationTracking;

