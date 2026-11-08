import { Navigate, Outlet } from "react-router-dom";

export default function UserProtectedRoute() {
  const token = sessionStorage.getItem("user_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}