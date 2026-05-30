import axios from "axios";

/* ===================== BASE URL ===================== */
const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://sgcsc-backend-dzp4.onrender.com/api";

/* ===================== AXIOS INSTANCE ===================== */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  timeout: 15000,
});

/* ===================== REQUEST INTERCEPTOR ===================== */
api.interceptors.request.use(
  (config) => {
    // Franchise token takes priority for franchise-specific routes
    const franchiseToken = localStorage.getItem("franchise_token");
    const path = config.url || "";
    
    // For franchise-specific routes, use franchise token
    if (
      path.includes("/credits/") ||
      path.includes("/franchise-profile/") ||
      (path.includes("/franchise/") && franchiseToken)
    ) {
      if (franchiseToken) {
        config.headers.Authorization = `Bearer ${franchiseToken}`;
      }
    } else {
      // Priority-based token resolution for other routes
      const token =
        localStorage.getItem("admin_token") ||
        localStorage.getItem("franchise_token") ||
        localStorage.getItem("student_token") ||
        localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Let browser handle multipart/form-data headers
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===================== RESPONSE INTERCEPTOR ===================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global auth failure handling
    if (error.response && error.response.status === 401) {
      console.warn("🔐 Unauthorized – clearing auth data");

      localStorage.removeItem("admin_token");
      localStorage.removeItem("franchise_token");
      localStorage.removeItem("student_token");
    }

    return Promise.reject(error);
  }
);

export default api;
