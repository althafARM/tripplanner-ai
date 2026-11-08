const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Admin login
export async function adminLogin(
  username: string,
  password: string
) {
  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Admin login failed.");
  }

  sessionStorage.setItem("admin_token", data.access_token);

  return data;
}

// Authenticated API requests
async function adminFetch(endpoint: string) {
  const token = sessionStorage.getItem("admin_token");

  if (!token) {
    throw new Error("Admin authentication required.");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    sessionStorage.removeItem("admin_token");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to load monitoring information.");
  }

  return response.json();
}

// Monitoring APIs
export const getSystemStatus = () =>
  adminFetch("/api/monitoring/system");

export const getAIMonitoring = () =>
  adminFetch("/api/monitoring/ai");

export const getDatabaseStatus = () =>
  adminFetch("/api/monitoring/database");

export const getApplicationLogs = () =>
  adminFetch("/api/monitoring/logs");

// Admin logout
export function adminLogout() {
  sessionStorage.removeItem("admin_token");
  window.location.href = "/login";
}