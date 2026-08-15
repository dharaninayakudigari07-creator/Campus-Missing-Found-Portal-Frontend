import {
    GoogleMap,
    Marker,
    useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "16px",
};

const defaultCenter = {
    lat: 16.3067,
    lng: 80.4365,
};

export default function LocationMap({
    latitude,
    longitude,
    onLocationSelect,
    selectable = false,
}) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey:
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    if (loadError) {
        return (
            <div className="map-error">
                Google Maps could not be loaded.
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="map-loading">
                Loading Google Maps...
            </div>
        );
    }

    const position =
        latitude !== undefined &&
        latitude !== null &&
        longitude !== undefined &&
        longitude !== null
            ? {
                  lat: Number(latitude),
                  lng: Number(longitude),
              }
            : null;

    const center = position || defaultCenter;

    const handleMapClick = (event) => {
        if (!selectable || !onLocationSelect) {
            return;
        }

        const selected = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        };

        onLocationSelect(selected);
    };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={16}
            onClick={handleMapClick}
            options={{
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: true,
            }}
        >
            {position && (
                <Marker
                    position={position}
                    title="Item Location"
                />
            )}
        </GoogleMap>
    );
}

