import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // IMPORTANT:
    // Do NOT force Content-Type for FormData.
    // The browser automatically creates:
    //
    // multipart/form-data; boundary=....
    //
    // which Multer requires.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error("API ERROR:", error);

    if (error.response?.status === 401) {
      console.warn("Unauthorized request.");

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

export default api;