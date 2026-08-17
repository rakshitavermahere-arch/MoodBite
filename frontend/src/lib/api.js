import axios from "axios";
 
 
const backendUrl = process.env.REACT_APP_BACKEND_URL;
 
export const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});
 
// The csrf_token cookie is set by the backend on a different domain than the
// frontend (e.g. onrender.com vs vercel.app). Browsers only let JavaScript
// read cookies belonging to the page's own domain, so document.cookie can
// never see it here. Instead we fetch its value directly from the backend
// (which can always read its own cookie) and keep it in memory.
let csrfToken = null;
 
export const setCsrfToken = (token) => {
  csrfToken = token || null;
};
 
export const refreshCsrfToken = async () => {
  try {
    const { data } = await api.get("/auth/csrf-token");
    setCsrfToken(data.csrf_token);
  } catch (_) {
    setCsrfToken(null);
  }
};
 
api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method) && csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
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
        await refreshCsrfToken();
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
 