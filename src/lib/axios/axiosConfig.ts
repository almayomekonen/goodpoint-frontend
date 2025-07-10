import axios from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_NAME } from "../../common/consts/auth-storage.consts";

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

// בדיקת טוקן
const token = Cookies.get(ACCESS_TOKEN_NAME);
console.log("🔍 Token Check:", {
  tokenExists: !!token,
  tokenLength: token?.length,
  cookieName: ACCESS_TOKEN_NAME,
});

// בדיקת כל הcookies
const allCookies = document.cookie.split(";").reduce(
  (acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    acc[name] = value;
    return acc;
  },
  {} as Record<string, string>
);
console.log("🍪 All Cookies:", allCookies);

// בדיקת תוקף הטוקן
if (token) {
  try {
    // פונקציה פשוטה לפירוק JWT ללא ספריה חיצונית
    const parseJwt = (token: string) => {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    };

    const decoded = parseJwt(token);
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;

    console.log("🔍 Token Validation:", {
      isExpired,
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
      currentTime: new Date(currentTime * 1000).toISOString(),
      userId: decoded.id,
      username: decoded.username,
    });

    if (isExpired) {
      console.warn("⚠️ Token is expired! User should be logged out.");
      // מחיקת הטוקן הפג
      Cookies.remove(ACCESS_TOKEN_NAME);
    }
  } catch (error) {
    console.error("❌ Error parsing token:", error);
    // מחיקת טוקן לא תקין
    Cookies.remove(ACCESS_TOKEN_NAME);
  }
}

// הגדרת axios defaults
axios.defaults.baseURL = baseURL;
axios.defaults.timeout = 30000; // הגדלת timeout ל-30 שניות
axios.defaults.withCredentials = true;

console.log("🔧 Axios Defaults:", {
  baseURL: axios.defaults.baseURL,
  timeout: axios.defaults.timeout,
  withCredentials: axios.defaults.withCredentials,
});

// בדיקת חיבור לשרת
const checkServerHealth = async () => {
  try {
    console.log("🔍 Checking server health...");
    const response = await fetch(`${baseURL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("✅ Server is healthy and responding");
    } else {
      console.warn("⚠️ Server responded with status:", response.status);
    }
  } catch (error) {
    console.error("❌ Server health check failed:", error);
    console.error("❌ This might indicate server connectivity issues");
  }
};

// בצע בדיקת health רק אם זה לא development
if (import.meta.env.MODE !== "development") {
  checkServerHealth();
}

// Interceptor להוספת headers נוספים במידת הצורך
axios.interceptors.request.use(
  (config) => {
    // וודא שיש baseURL בכל request
    if (!config.baseURL) {
      config.baseURL = baseURL;
    }

    // כפה JSON response
    config.headers["Accept"] = "application/json";
    config.headers["Content-Type"] = "application/json";

    console.log("🚀 API Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      withCredentials: config.withCredentials,
      headers: config.headers,
    });

    // debug מיוחד לbקשות login
    if (config.url?.includes("/login")) {
      console.log("🔑 LOGIN REQUEST:", {
        url: config.url,
        data: config.data,
        headers: config.headers,
        withCredentials: config.withCredentials,
      });
    }
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor לטיפול בשגיאות
axios.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers["content-type"],
      dataType: typeof response.data,
      isHTML:
        typeof response.data === "string" &&
        response.data.includes("<!DOCTYPE html>"),
    });

    // debug מיוחד לresponse של login
    if (response.config.url?.includes("/login")) {
      console.log("🔑 LOGIN RESPONSE:", {
        url: response.config.url,
        status: response.status,
        data: response.data,
        setCookieHeader: response.headers["set-cookie"],
        allHeaders: response.headers,
      });

      // בדוק אם הטוקן נשמר אחרי הlogin
      setTimeout(() => {
        const token = Cookies.get(ACCESS_TOKEN_NAME);
        console.log("🔍 POST-LOGIN Token Check:", {
          tokenExists: !!token,
          tokenLength: token?.length,
          tokenValue: token?.substring(0, 20) + "...",
        });
      }, 100);
    }

    // אם השרת מחזיר HTML במקום JSON, זה אומר שיש בעיה
    if (
      typeof response.data === "string" &&
      response.data.includes("<!DOCTYPE html>")
    ) {
      console.error(
        "❌ Server returned HTML instead of JSON - this indicates a routing issue"
      );
      throw new Error("Server returned HTML instead of JSON");
    }

    return response;
  },
  (error) => {
    console.error("❌ API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      networkError: !error.response && error.request,
      timeoutError: error.code === "ECONNABORTED",
    });

    // debug מיוחד לשגיאות login
    if (error.config?.url?.includes("/login")) {
      console.error("🔑 LOGIN ERROR:", {
        url: error.config.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
        networkError: !error.response && error.request,
        timeoutError: error.code === "ECONNABORTED",
        request: error.request,
        response: error.response,
      });
    }

    // טיפול בשגיאות 401 - אימות נכשל
    if (error.response?.status === 401) {
      console.warn(
        "⚠️ 401 Unauthorized - Clearing tokens and redirecting to login"
      );

      // מחיקת כל הטוקנים
      Cookies.remove(ACCESS_TOKEN_NAME);
      Cookies.remove("klo");

      // רענון הדף כדי לטריגר מצב לא מאומת
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default axios;
