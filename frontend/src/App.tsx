import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import UserProfile from "./pages/UserProfile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import UserProtectedRoute from "./components/UserProtectedRoute";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import TripPlanner from "./pages/TripPlanner";
import MyTrips from "./pages/MyTrips";
import ChatAssistant from "./pages/ChatAssistant";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import CostEstimateDetails from "./pages/CostEstimateDetails";
// Navbar appears only on protected client pages
function ClientLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />

        {/* Protected client pages */}
        <Route element={<UserProtectedRoute />}>
          <Route element={<ClientLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/planner" element={<TripPlanner />} />
            <Route path="/my-trips" element={<MyTrips />} />
            <Route path="/chat" element={<ChatAssistant />} />
            <Route path="/saved-estimates/:estimateId" element={<CostEstimateDetails />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}