
import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "react-router-dom";

import {
  CalendarDays,
  MapPin,
  Sparkles,
  Users,
  Wallet,
  Sunrise,
  Sun,
  Moon,
  Utensils,
  Car,
  Lightbulb,
  Clock,
  Plane,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Compass,
  Mountain,
  ArrowUpRight,
} from "lucide-react";

import { generateTrip } from "../services/api";
import WeatherCard from "../components/WeatherCard";

const interestsList = [
  "Nature",
  "Beaches",
  "Food",
  "Culture",
  "Adventure",
  "Photography",
];

interface DayPlan {
  title: string;
  content: string;
}

interface ActivitySection {
  title: string;
  content: string;
  icon: ReactNode;
  className: string;
}

const activityDefinitions = [
  {
    title: "MORNING",
    icon: <Sunrise size={20} />,
    className: "morning",
  },
  {
    title: "AFTERNOON",
    icon: <Sun size={20} />,
    className: "afternoon",
  },
  {
    title: "EVENING",
    icon: <Moon size={20} />,
    className: "evening",
  },
  {
    title: "FOOD RECOMMENDATIONS",
    icon: <Utensils size={20} />,
    className: "food",
  },
  {
    title: "TRANSPORT",
    icon: <Car size={20} />,
    className: "transport",
  },
  {
    title: "ESTIMATED DAILY COST",
    icon: <Wallet size={20} />,
    className: "cost",
  },
];

// Split an itinerary into individual days.
const getDayPlans = (text: string): DayPlan[] => {
  const sections = text.split(
    /(?=^\s{0,3}(?:#{1,6}\s*)?(?:\*\*)?DAY\s+\d+\b.*$)/gim
  );

  return sections
    .map((section) => {
      const lines = section.trim().split("\n");

      const title = lines[0]
        .replace(/^#{1,6}\s*/, "")
        .replace(/\*\*/g, "")
        .trim();

      return {
        title,
        content: lines.slice(1).join("\n").trim(),
      };
    })
    .filter(
      (day) =>
        /^DAY\s+\d+/i.test(day.title) &&
        day.content.length > 0
    );
};

// Split each day into morning, afternoon, evening, etc.
const getActivitySections = (text: string): ActivitySection[] => {
  const headingPattern =
    /^\s*(?:#{1,6}\s*)?(?:\*\*)?(MORNING|AFTERNOON|EVENING|FOOD RECOMMENDATIONS|TRANSPORT|ESTIMATED DAILY COST)(?:\*\*)?\s*:?\s*$/gim;

  const matches = [...text.matchAll(headingPattern)];

  return activityDefinitions
    .map((item) => {
      const matchIndex = matches.findIndex(
        (match) => match[1].toUpperCase() === item.title
      );

      if (matchIndex === -1) {
        return { ...item, content: "" };
      }

      const currentMatch = matches[matchIndex];
      const start = currentMatch.index! + currentMatch[0].length;
      const nextMatch = matches[matchIndex + 1];

      const end = nextMatch ? nextMatch.index! : text.length;

      return {
        ...item,
        content: text.slice(start, end).trim(),
      };
    })
    .filter((item) => item.content.length > 0);
};

export default function TripPlanner() {
  const [searchParams] = useSearchParams();

  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );

  const [startLocation, setStartLocation] = useState("Colombo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState("50000");
  const [style, setStyle] = useState("Relaxing");

  const [interests, setInterests] = useState<string[]>([
    "Nature",
    "Food",
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itinerary, setItinerary] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Calculate trip duration.
  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.round(
            (new Date(`${endDate}T00:00:00`).getTime() -
              new Date(`${startDate}T00:00:00`).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : 0;

  const toggleInterest = (interest: string) => {
    setInterests((previous) =>
      previous.includes(interest)
        ? previous.filter((item) => item !== interest)
        : [...previous, interest]
    );
  };

  // Generate the AI itinerary.
  const handleGenerate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setItinerary("");

    if (!destination.trim()) {
      setError("Please enter your destination.");
      return;
    }

    if (!startLocation.trim()) {
      setError("Please enter your starting location.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select your travel dates.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after the start date.");
      return;
    }

    if (interests.length === 0) {
      setError("Please select at least one travel interest.");
      return;
    }

    try {
      setLoading(true);

      const response = await generateTrip({
        destination: destination.trim(),
        start_location: startLocation.trim(),
        days,
        budget: `LKR ${budget}`,
        travel_style: `${style}. Interests: ${interests.join(", ")}.`,
        travellers,
      });

      if (!response?.itinerary) {
        throw new Error("The AI did not return an itinerary.");
      }

      setItinerary(response.itinerary);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to generate your trip. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset the planner.
  const resetPlanner = () => {
    setItinerary("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const dayPlans = itinerary ? getDayPlans(itinerary) : [];

  const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(
    startLocation.trim()
  )}/${encodeURIComponent(destination.trim())}`;

  return (
    <div className="midnight-planner-page">

      {/* HERO SECTION */}
      <section className="midnight-planner-hero">
        <div className="midnight-planner-hero-overlay" />

        <div className="midnight-planner-hero-content">
          <span className="midnight-planner-eyebrow">
            <Sparkles size={16} />
            YOUR PERSONAL TRAVEL DESIGNER
          </span>

          <h1>
            Every journey
            <br />
            <span>starts with a dream.</span>
          </h1>

          <p>
            Tell us where you want to go. Let AI transform
            your travel ideas into a personalised adventure.
          </p>

          <div className="midnight-planner-hero-details">
            <span>
              <Compass size={17} />
              Discover new places
            </span>

            <span>
              <Sparkles size={17} />
              AI-powered planning
            </span>
          </div>
        </div>

        <div className="midnight-planner-hero-decoration">
          <Mountain size={90} strokeWidth={0.8} />
        </div>
      </section>

      <main className="midnight-planner-container">

        {/* TRIP FORM */}
        {!itinerary && (
          <div className="midnight-planner-layout">

            {/* LEFT FORM */}
            <section className="midnight-planner-form-card">

              <div className="midnight-planner-card-heading">
                <div>
                  <span className="midnight-planner-step">
                    STEP 01 — YOUR JOURNEY
                  </span>

                  <h2>Plan your adventure</h2>

                  <p>
                    Complete the details below to create
                    your personalised travel plan.
                  </p>
                </div>

                <div className="midnight-planner-heading-icon">
                  <Plane size={27} />
                </div>
              </div>

              <form onSubmit={handleGenerate}>

                {/* DESTINATION */}
                <div className="midnight-planner-form-group">
                  <label>
                    <MapPin size={17} />
                    Where do you want to go?
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Ella, Sri Lanka"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>

                {/* START LOCATION */}
                <div className="midnight-planner-form-group">
                  <label>
                    <Compass size={17} />
                    Starting location
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Colombo"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    required
                  />
                </div>

                {/* DATES */}
                <div className="midnight-planner-form-row">

                  <div className="midnight-planner-form-group">
                    <label>
                      <CalendarDays size={17} />
                      Start date
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="midnight-planner-form-group">
                    <label>
                      <CalendarDays size={17} />
                      End date
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>

                </div>

                {/* DURATION */}
                <div className="midnight-planner-duration">
                  <Clock size={17} />

                  {days > 0
                    ? `Your journey: ${days} ${days === 1 ? "day" : "days"}`
                    : "Select your dates to calculate trip duration"}
                </div>

                {/* TRAVELLERS */}
                <div className="midnight-planner-form-group">
                  <label>
                    <Users size={17} />
                    Number of travellers
                  </label>

                  <div className="midnight-planner-traveller-control">
                    <button
                      type="button"
                      onClick={() =>
                        setTravellers((value) => Math.max(1, value - 1))
                      }
                    >
                      −
                    </button>

                    <span>
                      {travellers} Travellers
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setTravellers((value) => Math.min(20, value + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* BUDGET */}
                <div className="midnight-planner-form-group">
                  <label>
                    <Wallet size={17} />
                    Your total budget (LKR)
                  </label>

                  <div className="midnight-planner-budget-input">
                    <span>LKR</span>

                    <input
                      type="number"
                      min="1000"
                      placeholder="50000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* TRAVEL STYLE */}
                <div className="midnight-planner-form-group">
                  <label>
                    <Sparkles size={17} />
                    Choose your travel style
                  </label>

                  <div className="midnight-planner-style-options">
                    {[
                      "Relaxing",
                      "Adventure",
                      "Luxury",
                      "Budget",
                    ].map((item) => (
                      <button
                        type="button"
                        key={item}
                        className={
                          style === item
                            ? "midnight-planner-style-option active"
                            : "midnight-planner-style-option"
                        }
                        onClick={() => setStyle(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* INTERESTS */}
                <div className="midnight-planner-form-group">
                  <label>
                    <Sparkles size={17} />
                    What experiences do you love?
                  </label>

                  <div className="midnight-planner-interest-options">
                    {interestsList.map((interest) => (
                      <button
                        type="button"
                        key={interest}
                        className={
                          interests.includes(interest)
                            ? "midnight-planner-interest-option active"
                            : "midnight-planner-interest-option"
                        }
                        onClick={() => toggleInterest(interest)}
                      >
                        {interests.includes(interest) && (
                          <CheckCircle2 size={14} />
                        )}

                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="midnight-planner-error">
                    {error}
                  </div>
                )}

                {/* GENERATE BUTTON */}
                <button
                  type="submit"
                  className="midnight-planner-generate-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={19} className="midnight-spin" />
                      Creating your adventure...
                    </>
                  ) : (
                    <>
                      <Sparkles size={19} />
                      Generate My Trip
                      <ArrowRight size={19} />
                    </>
                  )}
                </button>

                <p className="midnight-planner-form-note">
                  <CheckCircle2 size={14} />
                  Your journey will be personalised using your preferences.
                </p>

              </form>
            </section>

            {/* RIGHT SIDEBAR */}
            <aside className="midnight-planner-sidebar">

              <div className="midnight-planner-sidebar-image">
                <div className="midnight-planner-sidebar-overlay">
                  <span>DISCOVER THE EXTRAORDINARY</span>

                  <h2>
                    Make memories.
                    <br />
                    Not just plans.
                  </h2>

                  <p>
                    Discover beautiful destinations and
                    unforgettable experiences with your
                    personal AI travel assistant.
                  </p>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="midnight-planner-summary-card">
                <div className="midnight-planner-summary-heading">
                  <div>
                    <span>YOUR JOURNEY</span>
                    <h3>Trip summary</h3>
                  </div>

                  <Plane size={23} />
                </div>

                <div className="midnight-planner-summary-item">
                  <MapPin size={19} />

                  <div>
                    <span>Destination</span>
                    <strong>
                      {destination || "Not selected"}
                    </strong>
                  </div>
                </div>

                <div className="midnight-planner-summary-item">
                  <CalendarDays size={19} />

                  <div>
                    <span>Duration</span>
                    <strong>
                      {days ? `${days} Days` : "Not selected"}
                    </strong>
                  </div>
                </div>

                <div className="midnight-planner-summary-item">
                  <Users size={19} />

                  <div>
                    <span>Travellers</span>
                    <strong>{travellers} People</strong>
                  </div>
                </div>

                <div className="midnight-planner-summary-item">
                  <Wallet size={19} />

                  <div>
                    <span>Total budget</span>
                    <strong>
                      LKR {Number(budget || 0).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="midnight-planner-summary-item">
                  <Sparkles size={19} />

                  <div>
                    <span>Travel style</span>
                    <strong>{style}</strong>
                  </div>
                </div>
              </div>

              {/* TRAVEL TIP */}
              <div className="midnight-planner-tip">
                <div className="midnight-planner-tip-icon">
                  <Lightbulb size={23} />
                </div>

                <div>
                  <h4>A little travel tip</h4>

                  <p>
                    Choose your interests carefully. Your AI
                    itinerary will be designed around the
                    experiences you enjoy.
                  </p>
                </div>
              </div>

            </aside>
          </div>
        )}

        {/* LOADING SCREEN */}
        {loading && (
          <div className="midnight-planner-loading">
            <div className="midnight-planner-loading-icon">
              <Plane size={36} />
            </div>

            <span>YOUR ADVENTURE IS TAKING SHAPE</span>

            <h2>Creating your dream trip...</h2>

            <p>
              Our AI is preparing destinations, activities
              and travel ideas just for you.
            </p>

            <div className="midnight-planner-progress">
              <span />
            </div>
          </div>
        )}

        {/* ITINERARY RESULT */}
        {itinerary && (
          <section className="midnight-planner-result">

            {/* RESULT HEADER */}
            <div className="midnight-planner-result-header">
              <div>
                <span className="midnight-planner-step">
                  <Sparkles size={15} />
                  YOUR PERSONAL AI ITINERARY
                </span>

                <h1>
                  Your adventure in{" "}
                  <span>{destination}</span>
                </h1>

                <p>
                  Your personalised travel experience is ready.
                  Get ready to explore!
                </p>
              </div>

              <button
                className="midnight-planner-new-trip-button"
                onClick={resetPlanner}
              >
                <RefreshCw size={17} />
                Create another trip
              </button>
            </div>

            {/* TRIP OVERVIEW */}
            <div className="midnight-planner-result-overview">

              <div className="midnight-planner-overview-item">
                <MapPin size={22} />
                <div>
                  <span>Destination</span>
                  <strong>{destination}</strong>
                </div>
              </div>

              <div className="midnight-planner-overview-item">
                <CalendarDays size={22} />
                <div>
                  <span>Duration</span>
                  <strong>{days} Days</strong>
                </div>
              </div>

              <div className="midnight-planner-overview-item">
                <Users size={22} />
                <div>
                  <span>Travellers</span>
                  <strong>{travellers} People</strong>
                </div>
              </div>

              <div className="midnight-planner-overview-item">
                <Wallet size={22} />
                <div>
                  <span>Planned budget</span>
                  <strong>
                    LKR {Number(budget).toLocaleString()}
                  </strong>
                </div>
              </div>

            </div>

            {/* WEATHER AND MAP */}
            <div className="midnight-planner-travel-tools">

              <div className="midnight-planner-weather">
                <WeatherCard destination={destination} />
              </div>

              <div className="midnight-planner-map-card">
                <div className="midnight-planner-map-decoration">
                  <MapPin size={27} />
                </div>

                <span>EXPLORE YOUR ROUTE</span>

                <h3>Your journey awaits.</h3>

                <p>
                  View your route from {startLocation} to{" "}
                  {destination}.
                </p>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="midnight-planner-map-button"
                >
                  View Google Maps
                  <ArrowUpRight size={17} />
                </a>
              </div>

            </div>

            {/* ITINERARY HEADING */}
            <div className="midnight-planner-itinerary-heading">
              <span>YOUR TRAVEL SCHEDULE</span>

              <h2>Explore your journey</h2>

              <p>
                A day-by-day itinerary created around your
                preferences.
              </p>
            </div>

            {/* DAILY ITINERARY */}
            <div className="midnight-planner-days">

              {dayPlans.length > 0 ? (
                dayPlans.map((day, index) => {
                  const activities = getActivitySections(day.content);

                  return (
                    <article
                      className="midnight-planner-day-card"
                      key={index}
                    >
                      <div className="midnight-planner-day-number">
                        <span>DAY</span>
                        <strong>{index + 1}</strong>
                      </div>

                      <div className="midnight-planner-day-content">
                        <h3>{day.title}</h3>

                        {activities.length > 0 ? (
                          <div className="midnight-planner-activity-grid">
                            {activities.map((activity) => (
                              <div
                                className={`midnight-planner-activity-card ${activity.className}`}
                                key={activity.title}
                              >
                                <div className="midnight-planner-activity-heading">
                                  <div>
                                    {activity.icon}
                                  </div>

                                  <h4>{activity.title}</h4>
                                </div>

                                <div className="midnight-planner-activity-content">
                                  <ReactMarkdown>
                                    {activity.content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="midnight-planner-full-day-content">
                            <ReactMarkdown>
                              {day.content}
                            </ReactMarkdown>
                          </div>
                        )}

                        <div className="midnight-planner-day-footer">
                          <span>
                            <Clock size={15} />
                            Daily travel plan
                          </span>

                          <span>
                            <CheckCircle2 size={15} />
                            AI generated
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="midnight-planner-full-itinerary">
                  <ReactMarkdown>
                    {itinerary}
                  </ReactMarkdown>
                </div>
              )}

            </div>

            {/* TRAVEL TIPS */}
            <div className="midnight-planner-result-tip">
              <div>
                <Lightbulb size={25} />
              </div>

              <section>
                <h3>Before you travel</h3>

                <p>
                  Review the suggested activities and estimated
                  costs. Confirm opening hours, transport
                  arrangements and prices with the relevant
                  providers before travelling.
                </p>
              </section>
            </div>

            <button
              className="midnight-planner-result-bottom-button"
              onClick={resetPlanner}
            >
              <RefreshCw size={18} />
              Plan Another Adventure
            </button>

          </section>
        )}

      </main>
    </div>
  );
}
