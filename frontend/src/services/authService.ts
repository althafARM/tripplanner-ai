const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// User Registration
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const response = await fetch(`${API_URL}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed.");
  }

  return data;
}

// User Login
export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed.");
  }

  sessionStorage.setItem("user_token", data.access_token);
  sessionStorage.setItem("user_data", JSON.stringify(data.user));

  return data;
}

// Get User Profile
export async function getUserProfile() {
  const token = sessionStorage.getItem("user_token");

  if (!token) {
    throw new Error("Please log in first.");
  }

  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      logoutUser();
    }

    throw new Error("Unable to retrieve user profile.");
  }

  return response.json();
}

// User Logout
export function logoutUser() {
  sessionStorage.removeItem("user_token");
  sessionStorage.removeItem("user_data");
  window.location.href = "/login";
}