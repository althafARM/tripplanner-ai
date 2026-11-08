import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// Protect admin dashboard
function ProtectedRoute() {
  const token = sessionStorage.getItem("admin_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Admin login */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected admin pages */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        {/* Default route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;