import { useCallback, useEffect, useRef, useState } from "react";
import {
    GoogleMap as GoogleMapComponent,
    Marker,
    Circle,
    useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const defaultCenter = {
    lat: 16.3067,
    lng: 80.4365,
};

export default function GoogleMap({
    latitude,
    longitude,
    tracking = false,
    onLocationSelect,
}) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [accuracy, setAccuracy] = useState(null);

    const [center, setCenter] = useState(
        latitude && longitude
            ? {
                  lat: Number(latitude),
                  lng: Number(longitude),
              }
            : defaultCenter
    );

    const mapRef = useRef(null);
    const watchIdRef = useRef(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: "campus-lost-found-google-map",
        googleMapsApiKey:
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    });

    /*
    ==========================================
    START LIVE LOCATION TRACKING
    ==========================================
    */

    useEffect(() => {
        if (!tracking) {
            return;
        }

        if (!navigator.geolocation) {
            alert(
                "Geolocation is not supported by this browser."
            );
            return;
        }

        watchIdRef.current =
            navigator.geolocation.watchPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    setCurrentLocation(location);
                    setAccuracy(
                        position.coords.accuracy
                    );

                    setCenter(location);

                    if (mapRef.current) {
                        mapRef.current.panTo(location);
                    }

                    if (onLocationSelect) {
                        onLocationSelect({
                            latitude:
                                position.coords.latitude,
                            longitude:
                                position.coords.longitude,
                            accuracy:
                                position.coords.accuracy,
                        });
                    }
                },
                (error) => {
                    console.error(
                        "Geolocation error:",
                        error
                    );

                    if (error.code === 1) {
                        alert(
                            "Location permission was denied. Please allow location access in Chrome."
                        );
                    } else if (error.code === 2) {
                        alert(
                            "Your location could not be determined."
                        );
                    } else if (error.code === 3) {
                        alert(
                            "Location request timed out. Please try again."
                        );
                    } else {
                        alert(
                            "Unable to access your current location."
                        );
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                }
            );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(
                    watchIdRef.current
                );

                watchIdRef.current = null;
            }
        };
    }, [tracking, onLocationSelect]);

    /*
    ==========================================
    INITIAL LOCATION
    ==========================================
    */

    useEffect(() => {
        if (latitude && longitude) {
            const position = {
                lat: Number(latitude),
                lng: Number(longitude),
            };

            setCenter(position);

            setCurrentLocation(position);
        }
    }, [latitude, longitude]);

    /*
    ==========================================
    MAP LOAD
    ==========================================
    */

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    /*
    ==========================================
    CLEANUP
    ==========================================
    */

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(
                    watchIdRef.current
                );
            }
        };
    }, []);

    /*
    ==========================================
    GOOGLE MAP ERROR
    ==========================================
    */

    if (loadError) {
        return (
            <div className="google-map-error">
                <div className="map-error-icon">
                    ⚠️
                </div>

                <h3>
                    Google Maps could not load
                </h3>

                <p>
                    Please check your Google Maps API
                    key and Google Maps API configuration.
                </p>
            </div>
        );
    }

    /*
    ==========================================
    LOADING
    ==========================================
    */

    if (!isLoaded) {
        return (
            <div className="google-map-loading">
                <div className="map-spinner"></div>

                <p>
                    Loading Google Maps...
                </p>
            </div>
        );
    }

    /*
    ==========================================
    MAP
    ==========================================
    */

    return (
        <div className="google-map-container">

            <GoogleMapComponent
                mapContainerStyle={containerStyle}
                center={center}
                zoom={currentLocation ? 18 : 14}
                onLoad={onMapLoad}
                options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                    clickableIcons: false,
                }}
            >

                {currentLocation && (
                    <>
                        <Marker
                            position={currentLocation}
                            title="Your Current Location"
                            animation={
                                window.google?.maps?.Animation
                                    ?.DROP
                            }
                        />

                        {accuracy && (
                            <Circle
                                center={currentLocation}
                                radius={accuracy}
                                options={{
                                    strokeColor: "#2563eb",
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                    fillColor: "#2563eb",
                                    fillOpacity: 0.12,
                                }}
                            />
                        )}
                    </>
                )}

            </GoogleMapComponent>

            {tracking && currentLocation && (
                <div className="tracking-map-status">

                    <div className="tracking-live-dot"></div>

                    <div>
                        <strong>
                            LIVE LOCATION
                        </strong>

                        <span>
                            Tracking your current position
                        </span>
                    </div>

                </div>
            )}

        </div>
    );
}


