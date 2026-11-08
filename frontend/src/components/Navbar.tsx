import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Compass,
  Menu,
  X,
  UserRound,
  LogOut,
  ArrowUpRight,
} from "lucide-react";

import { logoutUser } from "../services/authService";

const links = [
  { to: "/home", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/my-trips", label: "My Trips" },
  { to: "/chat", label: "AI Assistant" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="lux-navbar">

      <div className="lux-nav-container">

        {/* BRAND */}
        <Link
          to="/home"
          className="lux-brand"
          onClick={closeMenu}
        >
          <span className="lux-brand-icon">
            <Compass size={25} />
          </span>

          <span className="lux-brand-text">
            TripPlanner
            <span> AI</span>
            <small>TRAVEL INTELLIGENTLY</small>
          </span>
        </Link>

        {/* MOBILE MENU */}
        <button
          className="lux-mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>

        {/* NAVIGATION */}
        <nav className={open ? "lux-nav-links open" : "lux-nav-links"}>

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/home"}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "lux-nav-link active" : "lux-nav-link"
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* PROFILE */}
          <Link
            to="/profile"
            className="lux-profile-button"
            onClick={closeMenu}
          >
            <UserRound size={17} />
            <span>Profile</span>
          </Link>

          {/* PLAN A TRIP */}
          <Link
            to="/planner"
            className="lux-plan-button"
            onClick={closeMenu}
          >
            Plan a Trip
            <ArrowUpRight size={17} />
          </Link>

          {/* LOGOUT */}
          <button
            className="lux-logout-button"
            onClick={() => {
              closeMenu();
              logoutUser();
            }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>

        </nav>

      </div>
    </header>
  );
}