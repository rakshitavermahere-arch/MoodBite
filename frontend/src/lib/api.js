import axios from "axios";


const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

const readCookie = (name) => {
  const row = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.split("=").slice(1).join("=")) : null;
};

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const csrf = readCookie("csrf_token");
    if (csrf) config.headers["X-CSRF-Token"] = csrf;
  }
  return config;
});

let refreshPromise = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.includes("/auth/");
    if (error.response?.status === 401 && !original?._retried && !isAuthRoute) {
      original._retried = true;
      refreshPromise = refreshPromise || api.post("/auth/refresh").finally(() => { refreshPromise = null; });
      try {
        await refreshPromise;
        return api(original);
      } catch (_) {
        window.dispatchEvent(new Event("moodbite:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export const apiError = (error, fallback = "Something went wrong. Please retry.") => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
};

export const backendAssetUrl = (path) => `${backendUrl}${path}`;
