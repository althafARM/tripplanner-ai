import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import {
  Compass,
  Menu,
  X,
  UserRound,
  LogOut,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { logoutUser } from "../services/authService";

import "./Navbar.css";

const links = [
  { to: "/home", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/planner", label: "Plan a Trip" },
  { to: "/my-trips", label: "My Trips" },
  { to: "/chat", label: "AI Assistant" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="tropical-navbar">

      <div className="tropical-nav-container">

        {/* BRAND */}

        <Link
          to="/home"
          className="tropical-brand"
          onClick={closeMenu}
        >
          <span className="tropical-brand-icon">
            <Compass size={27} />
            <span className="tropical-brand-sparkle">
              <Sparkles size={12} />
            </span>
          </span>

          <span className="tropical-brand-text">
            TripPlanner
            <span> AI</span>
            <small>EXPLORE • DISCOVER • EXPERIENCE</small>
          </span>
        </Link>


        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="tropical-mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>


        {/* NAVIGATION */}

        <nav
          className={
            open
              ? "tropical-nav-links open"
              : "tropical-nav-links"
          }
        >

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/home"}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive
                  ? "tropical-nav-link active"
                  : "tropical-nav-link"
              }
            >
              {link.label}
            </NavLink>
          ))}


          {/* PROFILE */}

          <Link
            to="/profile"
            className="tropical-profile-button"
            onClick={closeMenu}
          >
            <UserRound size={17} />
            <span>Profile</span>
          </Link>


          {/* PLAN A TRIP */}

          <Link
            to="/planner"
            className="tropical-plan-button"
            onClick={closeMenu}
          >
            Plan a Trip
            <ArrowUpRight size={17} />
          </Link>


          {/* LOGOUT */}

          <button
            type="button"
            className="tropical-logout-button"
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