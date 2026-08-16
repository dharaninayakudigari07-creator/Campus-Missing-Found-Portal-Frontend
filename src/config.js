// =====================================================
// API CONFIGURATION
// =====================================================

// Local development backend
const LOCAL_API_URL =
  "http://localhost:5000/api";

// Deployed Render backend
const PRODUCTION_API_URL =
  "https://campus-missing-found-portal-backend.onrender.com/api";

// =====================================================
// API BASE URL
// =====================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  PRODUCTION_API_URL;

// =====================================================
// BACKEND URL
// =====================================================

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ||
  API_BASE_URL.replace(/\/api$/, "");

// =====================================================
// IMAGE URL HELPER
// =====================================================

export const getImageUrl = (value) => {
  if (!value) {
    return null;
  }

  const image = String(value).trim();

  if (!image) {
    return null;
  }

  // ---------------------------------------------------
  // CLOUDINARY / ABSOLUTE URL
  // ---------------------------------------------------
  // Example:
  // https://res.cloudinary.com/...
  // ---------------------------------------------------

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  // ---------------------------------------------------
  // LOCAL UPLOAD URL
  // ---------------------------------------------------

  if (image.startsWith("/uploads/")) {
    return `${BACKEND_URL}${image}`;
  }

  if (image.startsWith("uploads/")) {
    return `${BACKEND_URL}/${image}`;
  }

  // ---------------------------------------------------
  // OTHER ABSOLUTE PATH
  // ---------------------------------------------------

  if (image.startsWith("/")) {
    return `${BACKEND_URL}/uploads${image}`;
  }

  // ---------------------------------------------------
  // OLD DATABASE IMAGE NAME
  // Example:
  // 1786854923204.webp
  // ---------------------------------------------------

  return `${BACKEND_URL}/uploads/${image}`;
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default {
  API_BASE_URL,
  BACKEND_URL,
  getImageUrl,
};