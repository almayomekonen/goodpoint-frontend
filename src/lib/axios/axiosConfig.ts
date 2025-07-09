import axios from "axios";

// הגדרת baseURL לפי הסביבה
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://goodpoint-backend-production.up.railway.app"
    : "http://localhost:8080");

// Debug logs
console.log("🔧 Axios Config:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  baseURL: baseURL,
});

// הגדרת axios defaults
axios.defaults.baseURL = baseURL;
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;

// Interceptor להוספת headers נוספים במידת הצורך
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor לטיפול בשגיאות
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default axios;
