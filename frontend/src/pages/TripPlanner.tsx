import "./TripPlanner.css";
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
  Fuel,
  Hotel,
  AlertCircle,
  Ticket,
} from "lucide-react";

import { generateTrip, saveTrip } from "../services/api";
import WeatherCard from "../components/WeatherCard";

import {
  estimateTravelCost,
  type CostEstimateResponse,
} from "../services/costService";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const interestsList = [
  "Nature",
  "Beaches",
  "Food",
  "Culture",
  "Adventure",
  "Photography",
];

// --------------------------------------------------
// TYPES
// --------------------------------------------------

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

// --------------------------------------------------
// ACTIVITY DEFINITIONS
// --------------------------------------------------

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
    title: "TRANSPORT PLAN",
    icon: <Car size={20} />,
    className: "transport",
  },
  {
    title: "TRANSPORT",
    icon: <Car size={20} />,
    className: "transport",
  },
];

// --------------------------------------------------
// FORMAT CURRENCY
// --------------------------------------------------

const formatLKR = (amount: number | undefined | null) => {
  return `LKR ${Number(amount ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// --------------------------------------------------
// SEPARATE ITINERARY DAYS
// --------------------------------------------------

const getDayPlans = (text: string): DayPlan[] => {
  const cleanedText = text
    .replace(/svgDaily travel plansvgAI generated/gi, "")
    .replace(/^svg\s*$/gim, "")
    .trim();

  const headingPattern =
    /^\s{0,3}(?:#{1,6}\s*)?(?:\*\*)?DAY[\s\u00a0\u202f]*(\d+)\s*[–—-][^\r\n]*(?:\*\*)?\s*$/gim;

  const matches = [...cleanedText.matchAll(headingPattern)];

  return matches
    .map((match, index) => {
      const start = match.index! + match[0].length;

      const nextMatch = matches[index + 1];

      const end = nextMatch
        ? nextMatch.index!
        : cleanedText.length;

      const dayNumber = match[1];

      const headingText = match[0]
        .replace(/^#{1,6}\s*/, "")
        .replace(/\*\*/g, "")
        .trim();

      const cleanTitle = headingText
        .replace(
          /^(?:DAY[\s\u00a0\u202f]*\d+\s*[–—-]\s*)+/i,
          ""
        )
        .trim();

      const content = cleanedText
        .slice(start, end)
        .replace(/^\s*---+\s*$/gm, "")
        .trim();

      return {
        title: `DAY ${dayNumber} – ${cleanTitle}`,
        content,
      };
    })
    .filter((day) => day.content.length > 0);
};

// --------------------------------------------------
// SEPARATE ACTIVITY SECTIONS
// --------------------------------------------------

const getActivitySections = (
  text: string
): ActivitySection[] => {
  const headingPattern =
    /^\s*(?:#{1,6}\s*)?(?:\*\*)?(MORNING|AFTERNOON|EVENING|FOOD RECOMMENDATIONS|TRANSPORT PLAN|TRANSPORT)(?:\*\*)?\s*:?\s*$/gim;

  const matches = [...text.matchAll(headingPattern)];

  return activityDefinitions
    .map((item) => {
      const matchIndex = matches.findIndex(
        (match) => match[1].toUpperCase() === item.title
      );

      if (matchIndex === -1) {
        return {
          ...item,
          content: "",
        };
      }

      const currentMatch = matches[matchIndex];

      const start =
        currentMatch.index! + currentMatch[0].length;

      const nextMatch = matches[matchIndex + 1];

      const end = nextMatch
        ? nextMatch.index!
        : text.length;

      return {
        ...item,
        content: text.slice(start, end).trim(),
      };
    })
    .filter((item) => item.content.length > 0);
};

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function TripPlanner() {
  const [searchParams] = useSearchParams();

  // Trip details
  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );

  const [startLocation, setStartLocation] = useState("Colombo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState("50000");
  const [style, setStyle] = useState("Relaxing");

  // Transport
  const [transportType, setTransportType] =
    useState("own_vehicle");

  const [bookedVehicle, setBookedVehicle] =
    useState("car");

  const transportPreference =
    transportType === "own_vehicle"
      ? "Transport preference: Use the user's own vehicle."
      : transportType === "book_vehicle"
        ? `Transport preference: Book a ${bookedVehicle} for the trip.`
        : `Transport preference: Travel by ${transportType}.`;

  // Interests
  const [interests, setInterests] = useState<string[]>([
    "Nature",
    "Food",
  ]);

  // Application states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itinerary, setItinerary] = useState("");

  const [costResult, setCostResult] =
    useState<CostEstimateResponse | null>(null);

  const [savingTrip, setSavingTrip] = useState(false);
  const [tripSaved, setTripSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // --------------------------------------------------
  // TRIP DURATION
  // --------------------------------------------------

  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.round(
            (
              new Date(`${endDate}T00:00:00`).getTime() -
              new Date(`${startDate}T00:00:00`).getTime()
            ) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : 0;

  // --------------------------------------------------
  // TOGGLE INTERESTS
  // --------------------------------------------------

  const toggleInterest = (interest: string) => {
    setInterests((previous) =>
      previous.includes(interest)
        ? previous.filter((item) => item !== interest)
        : [...previous, interest]
    );
  };

  // --------------------------------------------------
  // GENERATE TRIP
  // --------------------------------------------------

  const handleGenerate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setItinerary("");
    setCostResult(null);
    setTripSaved(false);
    setSaveMessage("");

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

    if (!budget || Number(budget) < 1000) {
      setError("Please enter a valid trip budget.");
      return;
    }

    try {
      setLoading(true);

      // Generate AI itinerary
      const response = await generateTrip({
        destination: destination.trim(),
        start_location: startLocation.trim(),
        days,
        budget: `LKR ${budget}`,
        travel_style:
          `${style}. Interests: ${interests.join(", ")}. ${transportPreference}`,
        travellers,
      });

      console.log("RAW AI ITINERARY:", response.itinerary);

      if (!response?.itinerary) {
        throw new Error(
          "The AI did not return an itinerary."
        );
      }

      // ----------------------------------------------
      // BACKEND COST ESTIMATION
      // ----------------------------------------------

      try {
        const isOwnVehicle =
          transportType === "own_vehicle";

        const isBookingVehicle =
          transportType === "book_vehicle";

        let selectedVehicle:
          | "car"
          | "van"
          | "tuk_tuk"
          | null = null;

        if (isOwnVehicle) {
          selectedVehicle = "car";
        } else if (isBookingVehicle) {
          if (bookedVehicle === "tuk-tuk") {
            selectedVehicle = "tuk_tuk";
          } else if (
            bookedVehicle === "car" ||
            bookedVehicle === "van"
          ) {
            selectedVehicle = bookedVehicle;
          }
        }

        let selectedTransport:
          | "train"
          | "bus"
          | "tuk_tuk"
          | "car"
          | "van"
          | null = null;

        if (isOwnVehicle) {
          selectedTransport = null;
        } else if (isBookingVehicle) {
          selectedTransport =
            bookedVehicle === "tuk-tuk"
              ? "tuk_tuk"
              : bookedVehicle === "bus"
                ? "bus"
                : bookedVehicle === "car"
                  ? "car"
                  : "van";
        } else {
          selectedTransport =
            transportType as "train" | "bus";
        }

        const accommodation =
          style === "Budget"
            ? "budget"
            : style === "Luxury"
              ? "luxury"
              : "standard";

        const food =
          style === "Budget"
            ? "budget"
            : style === "Luxury"
              ? "luxury"
              : "standard";

        const estimate = await estimateTravelCost({
          destination: destination.trim(),
          start_location: startLocation.trim(),
          days,
          travellers,
          budget: Number(budget),
          has_own_vehicle: isOwnVehicle,
          vehicle_type: selectedVehicle,
          transport_mode: selectedTransport,
          accommodation_type: accommodation,
          food_type: food,
        });

        setCostResult(estimate);

        console.log("COST ESTIMATE RESPONSE:", estimate);
      } catch (costError) {
        console.error(
          "Cost estimation failed:",
          costError
        );

        setCostResult(null);
      }

      // Show itinerary even if cost estimation fails
      setItinerary(response.itinerary);
    } catch (err: unknown) {
      console.error("Trip generation failed:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to generate your trip. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SAVE TRIP
  // --------------------------------------------------

  const handleSaveTrip = async () => {
    try {
      setSavingTrip(true);
      setSaveMessage("");

      await saveTrip({
        destination: destination.trim(),
        start_location: startLocation.trim(),
        days,
        budget: `LKR ${budget}`,
        travel_style:
          `${style}. Interests: ${interests.join(", ")}. ${transportPreference}`,
        travellers,
        itinerary,
      });

      setTripSaved(true);

      setSaveMessage(
        "Your trip has been saved successfully!"
      );
    } catch (err: unknown) {
      console.error("Save trip failed:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to save your trip.";

      setSaveMessage(message);
    } finally {
      setSavingTrip(false);
    }
  };

  // --------------------------------------------------
  // RESET PLANNER
  // --------------------------------------------------

  const resetPlanner = () => {
    setItinerary("");
    setError("");
    setCostResult(null);
    setTripSaved(false);
    setSaveMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // PREPARE ITINERARY
  // --------------------------------------------------

  const dayPlans = itinerary
    ? getDayPlans(itinerary)
    : [];

  const googleMapsUrl =
    `https://www.google.com/maps/dir/${encodeURIComponent(
      startLocation.trim()
    )}/${encodeURIComponent(destination.trim())}`;

  const expenseBreakdownItems = costResult
    ? [
        { name: "Transport", amount: costResult.cost_breakdown.transport?.amount ?? 0 },
        { name: "Fuel", amount: costResult.cost_breakdown.fuel?.amount ?? 0 },
        { name: "Vehicle Hire", amount: costResult.cost_breakdown.vehicle_hire?.amount ?? 0 },
        { name: "Accommodation", amount: costResult.cost_breakdown.accommodation?.amount ?? 0 },
        { name: "Food", amount: costResult.cost_breakdown.food?.amount ?? 0 },
        { name: "Attractions", amount: costResult.cost_breakdown.attractions?.amount ?? 0 },
        { name: "Other Expenses", amount: costResult.cost_breakdown.other_expenses?.amount ?? 0 },
      ]
    : [];

  const expenseTotal = costResult?.summary.total_estimated_cost ?? 0;

  // --------------------------------------------------
  // MARKDOWN COMPONENTS
  // --------------------------------------------------

  const markdownComponents = {
    h1: ({ children }: { children?: ReactNode }) => (
      <h1 className="itinerary-main-heading">
        {children}
      </h1>
    ),

    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="itinerary-section-heading">
        {children}
      </h2>
    ),

    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="itinerary-sub-heading">
        {children}
      </h3>
    ),

    p: ({ children }: { children?: ReactNode }) => (
      <p className="itinerary-paragraph">
        {children}
      </p>
    ),

    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="itinerary-list">
        {children}
      </ul>
    ),

    ol: ({ children }: { children?: ReactNode }) => (
      <ol className="itinerary-list">
        {children}
      </ol>
    ),

    li: ({ children }: { children?: ReactNode }) => (
      <li className="itinerary-list-item">
        {children}
      </li>
    ),

    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="itinerary-bold">
        {children}
      </strong>
    ),

    table: ({ children }: { children?: ReactNode }) => (
      <div className="itinerary-table-wrapper">
        <table className="itinerary-table">
          {children}
        </table>
      </div>
    ),
  };

  // --------------------------------------------------
  // MAIN JSX
  // --------------------------------------------------

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
                    onChange={(e) =>
                      setDestination(e.target.value)
                    }
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
                    onChange={(e) =>
                      setStartLocation(e.target.value)
                    }
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
                      onChange={(e) =>
                        setStartDate(e.target.value)
                      }
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
                      onChange={(e) =>
                        setEndDate(e.target.value)
                      }
                      required
                    />
                  </div>

                </div>

                {/* DURATION */}

                <div className="midnight-planner-duration">
                  <Clock size={17} />

                  {days > 0
                    ? `Your journey: ${days} ${
                        days === 1 ? "day" : "days"
                      }`
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
                        setTravellers((value) =>
                          Math.max(1, value - 1)
                        )
                      }
                    >
                      −
                    </button>

                    <span>{travellers} Travellers</span>

                    <button
                      type="button"
                      onClick={() =>
                        setTravellers((value) =>
                          Math.min(20, value + 1)
                        )
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
                      onChange={(e) =>
                        setBudget(e.target.value)
                      }
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

                {/* TRANSPORT */}

                <div className="midnight-planner-form-group">
                  <label>
                    <Car size={17} />
                    Choose Your Transport
                  </label>

                  <div className="midnight-planner-style-options">
                    {[
                      {
                        value: "own_vehicle",
                        label: "Own Vehicle",
                      },
                      {
                        value: "book_vehicle",
                        label: "Book Vehicle",
                      },
                      {
                        value: "train",
                        label: "Train",
                      },
                      {
                        value: "bus",
                        label: "Bus",
                      },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        className={
                          transportType === item.value
                            ? "midnight-planner-style-option active"
                            : "midnight-planner-style-option"
                        }
                        onClick={() =>
                          setTransportType(item.value)
                        }
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BOOKED VEHICLE */}

                {transportType === "book_vehicle" && (
                  <div className="midnight-planner-form-group">
                    <label>
                      <Car size={17} />
                      Select Vehicle Type
                    </label>

                    <div className="midnight-planner-style-options">
                      {[
                        {
                          value: "tuk-tuk",
                          label: "Tuk-tuk",
                        },
                        {
                          value: "car",
                          label: "Car",
                        },
                        {
                          value: "van",
                          label: "Van",
                        },
                        {
                          value: "bus",
                          label: "Bus",
                        },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.value}
                          className={
                            bookedVehicle === item.value
                              ? "midnight-planner-style-option active"
                              : "midnight-planner-style-option"
                          }
                          onClick={() =>
                            setBookedVehicle(item.value)
                          }
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                        onClick={() =>
                          toggleInterest(interest)
                        }
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

                {/* GENERATE */}

                <button
                  type="submit"
                  className="midnight-planner-generate-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw
                        size={19}
                        className="midnight-spin"
                      />
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
                  <Car size={19} />
                  <div>
                    <span>Transport</span>
                    <strong>
                      {transportType === "own_vehicle"
                        ? "Own Vehicle"
                        : transportType === "book_vehicle"
                          ? `Book ${bookedVehicle}`
                          : transportType === "train"
                            ? "Train"
                            : "Bus"}
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

        {/* LOADING */}

        {loading && (
          <div className="midnight-planner-loading">
            <div className="midnight-planner-loading-glow" />

            <div className="midnight-planner-loading-icon">
              <Plane size={34} />
              <Sparkles className="planner-loading-sparkle" size={18} />
            </div>

            <span className="midnight-planner-loading-label">
              YOUR ADVENTURE IS TAKING SHAPE
            </span>

            <h2>
              Creating your <span>dream trip...</span>
            </h2>

            <p>
              Our AI is preparing destinations, activities
              and travel ideas just for you.
            </p>

            <div className="midnight-planner-progress">
              <span />
            </div>

            <div className="midnight-planner-loading-status">
              <span className="planner-loading-dot" />
              TripPlanner AI is planning your journey
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

            {/* SMART BUDGET ASSISTANT */}

            {costResult && (
              <section
                className={`smart-budget-card ${
                  costResult.budget_advice.can_afford_trip
                    ? "smart-budget-success"
                    : "smart-budget-warning"
                }`}
              >
                <div className="smart-budget-header">
                  <div className="smart-budget-icon">
                    {costResult.budget_advice.can_afford_trip ? (
                      <CheckCircle2 size={26} />
                    ) : (
                      <Lightbulb size={26} />
                    )}
                  </div>

                  <div>
                    <span>TRIPPLANNER AI</span>

                    <h2>
                      {costResult.budget_advice.can_afford_trip
                        ? "Your Trip Is Affordable!"
                        : "Let's Make Your Trip Affordable"}
                    </h2>
                  </div>
                </div>

                <p className="smart-budget-message">
                  {costResult.budget_advice.message}
                </p>

                <div className="smart-budget-difference">
                  <Wallet size={24} />

                  <div>
                    <span>
                      {costResult.budget_advice.can_afford_trip
                        ? "Remaining Budget"
                        : "Additional Money Required"}
                    </span>

                    <strong>
                      {formatLKR(
                        costResult.budget_advice.budget_difference
                      )}
                    </strong>
                  </div>
                </div>

                <div className="smart-budget-cost-details">
                  <div>
                    <span>Estimated Trip Cost</span>
                    <strong>
                      {formatLKR(
                        costResult.summary.total_estimated_cost
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Your Available Budget</span>
                    <strong>
                      {formatLKR(costResult.summary.budget)}
                    </strong>
                  </div>

                  <div>
                    <span>Cost Per Traveller</span>
                    <strong>
                      {formatLKR(
                        costResult.summary.cost_per_traveller
                      )}
                    </strong>
                  </div>
                </div>

                {!costResult.budget_advice.can_afford_trip &&
                  costResult.budget_advice.suggestions?.length > 0 && (
                    <div className="smart-budget-suggestions">
                      <h3>
                        <Lightbulb size={19} />
                        Recommendations to Reduce Costs
                      </h3>

                      {costResult.budget_advice.suggestions.map(
                        (suggestion, index) => (
                          <div
                            className="smart-budget-suggestion"
                            key={index}
                          >
                            <CheckCircle2 size={17} />
                            <span>{suggestion}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </section>
            )}

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
                  const activities =
                    getActivitySections(day.content);

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
                                  <div>{activity.icon}</div>
                                  <h4>{activity.title}</h4>
                                </div>

                                <div className="midnight-planner-activity-content">
                                  <ReactMarkdown
                                    components={markdownComponents}
                                  >
                                    {activity.content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="midnight-planner-full-day-content">
                            <ReactMarkdown
                              components={markdownComponents}
                            >
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
                  <ReactMarkdown
                    components={markdownComponents}
                  >
                    {itinerary
                      .replace(/```svg[\s\S]*?```/gi, "")
                      .replace(/^svg\s*$/gim, "")}
                  </ReactMarkdown>
                </div>
              )}

              {/* ---------------------------------------
                  COMPLETE TRIP SUMMARY
              --------------------------------------- */}

              {costResult && (
                <section className="midnight-trip-summary">

                  {/* SUMMARY HEADER */}

                  <div className="trip-summary-header">
                    <div>
                      <span className="section-eyebrow">
                        YOUR TRAVEL FINANCES
                      </span>

                      <h2>Complete Trip Summary</h2>

                      <p>
                        Detailed estimated expenses for your
                        entire journey.
                      </p>
                    </div>

                    <Wallet size={32} />
                  </div>

                  {/* TOTAL COST */}

                  <div className="trip-summary-total">
                    <span>Total Estimated Trip Cost</span>

                    <h2>
                      {formatLKR(
                        costResult.summary.total_estimated_cost
                      )}
                    </h2>

                    <p>
                      For {travellers} traveller
                      {travellers > 1 ? "s" : ""} over{" "}
                      {days} day{days > 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* OVERVIEW */}

                  <div className="trip-summary-overview">

                    <div className="summary-overview-card">
                      <Wallet size={22} />

                      <span>Your Budget</span>

                      <strong>
                        {formatLKR(costResult.summary.budget)}
                      </strong>
                    </div>

                    <div className="summary-overview-card">
                      <Users size={22} />

                      <span>Cost Per Traveller</span>

                      <strong>
                        {formatLKR(
                          costResult.summary.cost_per_traveller
                        )}
                      </strong>
                    </div>

                    <div className="summary-overview-card">
                      <CalendarDays size={22} />

                      <span>Trip Duration</span>

                      <strong>{days} Days</strong>
                    </div>

                    <div className="summary-overview-card">
                      <Wallet size={22} />

                      <span>Remaining Budget</span>

                      <strong>
                        {formatLKR(
                          costResult.summary.remaining_budget
                        )}
                      </strong>
                    </div>

                  </div>

                  {/* BUDGET PROGRESS DASHBOARD */}

                  <div className="summary-budget-progress">

                    <div className="budget-progress-header">
                      <div>
                        <span className="section-eyebrow">
                          SMART BUDGET TRACKER
                        </span>

                        <h3>Your Trip Budget</h3>

                        <p>Track your estimated spending against your available budget.</p>
                      </div>

                      <Wallet size={28} />
                    </div>

                    {(() => {
                      const budget = costResult.summary.budget;
                      const total = costResult.summary.total_estimated_cost;

                      const percentage =
                        budget > 0 ? (total / budget) * 100 : 0;

                      const remaining = budget - total;
                      const isOverBudget = total > budget;

                      return (
                        <>
                          <div className="budget-progress-amounts">

                            <div>
                              <span>Estimated Spending</span>
                              <strong>{formatLKR(total)}</strong>
                            </div>

                            <div>
                              <span>Available Budget</span>
                              <strong>{formatLKR(budget)}</strong>
                            </div>

                          </div>

                          <div className="budget-progress-track">
                            <div
                              className={`budget-progress-fill ${
                                isOverBudget ? "over-budget" : ""
                              }`}
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                              }}
                            />
                          </div>

                          <div className="budget-progress-footer">

                            <strong>
                              {percentage.toFixed(1)}% of budget used
                            </strong>

                            <span className={isOverBudget ? "budget-negative" : "budget-positive"}>
                              {isOverBudget
                                ? `${formatLKR(Math.abs(remaining))} over budget`
                                : `${formatLKR(remaining)} remaining`}
                            </span>

                          </div>

                          <div className={`budget-progress-message ${
                            isOverBudget ? "budget-warning" : "budget-success"
                          }`}>
                            {isOverBudget
                              ? "Your estimated trip cost exceeds your available budget. Consider reducing some expenses."
                              : "Great! Your estimated trip cost is within your available budget."}
                          </div>
                        </>
                      );
                    })()}

                  </div>

                  {/* COMPLETE EXPENSE BREAKDOWN */}

                  <div className="summary-expenses">

                    <div className="expense-section-heading">
                      <div>
                        <span className="section-eyebrow">TRIP FINANCIAL ANALYSIS</span>
                        <h3>
                          <Wallet size={22} />
                          Complete Expense Breakdown
                        </h3>
                        <p className="summary-description">
                          Understand exactly where your travel money goes.
                        </p>
                      </div>

                      <div className="expense-total-badge">
                        <span>Total Expenses</span>
                        <strong>{formatLKR(expenseTotal)}</strong>
                      </div>
                    </div>

                    <div className="expense-analysis-grid">

                      {expenseBreakdownItems.map((item, index) => {
                        const percentage =
                          expenseTotal > 0
                            ? (item.amount / expenseTotal) * 100
                            : 0;

                        const icons = [
                          <Car size={22} />,
                          <Fuel size={22} />,
                          <Hotel size={22} />,
                          <Utensils size={22} />,
                          <Compass size={22} />,
                          <Ticket size={22} />,
                          <Wallet size={22} />,
                        ];

                        return (
                          <div className="expense-analysis-card" key={item.name}>

                            <div className="expense-analysis-top">
                              <div className="expense-analysis-icon">
                                {icons[index]}
                              </div>

                              <span className="expense-analysis-percentage">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>

                            <span className="expense-analysis-name">
                              {item.name}
                            </span>

                            <strong className="expense-analysis-amount">
                              {formatLKR(item.amount)}
                            </strong>

                            <div className="expense-analysis-track">
                              <div
                                className="expense-analysis-fill"
                                style={{
                                  width: `${Math.min(100, percentage)}%`,
                                }}
                              />
                            </div>

                            <small>Share of total trip cost</small>

                          </div>
                        );
                      })}

                    </div>

                  </div>

                  {/* ROUTE DETAILS */}

                  <div className="summary-route-details">

                    <h3>
                      <MapPin size={22} />
                      Route Information
                    </h3>

                    <div className="summary-route-grid">

                      <div>
                        <span>Starting Location</span>
                        <strong>
                          {costResult.trip_details.start_location}
                        </strong>
                      </div>

                      <div>
                        <span>Destination</span>
                        <strong>
                          {costResult.trip_details.destination}
                        </strong>
                      </div>

                      <div>
                        <span>One-way Distance</span>
                        <strong>
                          {costResult.route_details.one_way_distance_km.toFixed(
                            2
                          )}{" "}
                          km
                        </strong>
                      </div>

                      <div>
                        <span>Round-trip Distance</span>
                        <strong>
                          {costResult.route_details.round_trip_distance_km.toFixed(
                            2
                          )}{" "}
                          km
                        </strong>
                      </div>

                      <div>
                        <span>Estimated Travel Time</span>
                        <strong>
                          {Math.round(
                            costResult.route_details.estimated_driving_minutes /
                              60
                          )}{" "}
                          hours
                        </strong>
                      </div>

                      <div>
                        <span>Distance Information</span>
                        <strong>
                          {costResult.route_details.distance_source ||
                            "Estimated"}
                        </strong>
                      </div>

                    </div>
                  </div>

                  {/* FUEL DETAILS */}

                  {costResult.cost_breakdown.fuel && (
                    <div className="summary-fuel-details">

                      <h3>
                        <Fuel size={22} />
                        Fuel Information
                      </h3>

                      <div className="summary-fuel-grid">

                        <div>
                          <span>Fuel Type</span>

                          <strong>
                            {costResult.cost_breakdown.fuel.fuel_type ||
                              costResult.trip_details.fuel_type ||
                              "Not specified"}
                          </strong>
                        </div>

                        <div>
                          <span>Fuel Price Per Litre</span>

                          <strong>
                            {costResult.cost_breakdown.fuel.fuel_price_per_litre
                              ? formatLKR(
                                  costResult.cost_breakdown.fuel
                                    .fuel_price_per_litre
                                )
                              : "Not available"}
                          </strong>
                        </div>

                        <div>
                          <span>Estimated Fuel Usage</span>

                          <strong>
                            {costResult.cost_breakdown.fuel.fuel_litres != null
                              ? `${costResult.cost_breakdown.fuel.fuel_litres.toFixed(
                                  2
                                )} Litres`
                              : "Not available"}
                          </strong>
                        </div>

                        <div>
                          <span>Fuel Efficiency</span>

                          <strong>
                            {costResult.cost_breakdown.fuel
                              .fuel_efficiency_km_per_litre != null
                              ? `${costResult.cost_breakdown.fuel.fuel_efficiency_km_per_litre} km/L`
                              : "Not available"}
                          </strong>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* BUDGET STATUS */}

                  <div className="summary-budget-status">

                    <h3>
                      {costResult.budget_advice.can_afford_trip ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <AlertCircle size={22} />
                      )}

                      Budget Status
                    </h3>

                    <p>
                      {costResult.budget_advice.message}
                    </p>

                    <div className="summary-budget-status-details">

                      <span>
                        {costResult.budget_advice.can_afford_trip
                          ? "Your trip is within budget."
                          : "Your trip is above your available budget."}
                      </span>

                      <strong>
                        {costResult.budget_advice.can_afford_trip
                          ? "Within Budget"
                          : "Over Budget"}
                      </strong>

                    </div>

                    {costResult.budget_advice.suggestions?.length > 0 && (
                      <div className="summary-budget-suggestions">

                        <h4>
                          <Lightbulb size={19} />
                          Money-Saving Suggestions
                        </h4>

                        <ul>
                          {costResult.budget_advice.suggestions.map(
                            (suggestion, index) => (
                              <li key={index}>
                                {suggestion}
                              </li>
                            )
                          )}
                        </ul>

                      </div>
                    )}

                    {costResult.budget_advice.recommended_action && (
                      <div className="summary-recommended-action">
                        <strong>Recommended Action</strong>

                        <p>
                          {costResult.budget_advice.recommended_action}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* PRICE INFORMATION */}

                  {costResult.price_information && (
                    <div className="summary-price-information">

                      <h4>Price Information</h4>

                      <p>
                        {costResult.price_information.message}
                      </p>

                      {costResult.price_information.last_updated && (
                        <small>
                          Prices last updated:{" "}
                          {costResult.price_information.last_updated}
                        </small>
                      )}

                      {costResult.price_information.fuel_prices_last_updated && (
                        <small>
                          Fuel prices last updated:{" "}
                          {costResult.price_information.fuel_prices_last_updated}
                        </small>
                      )}

                      {costResult.price_information.fuel_price_source && (
                        <small>
                          Fuel price source:{" "}
                          {costResult.price_information.fuel_price_source}
                        </small>
                      )}

                    </div>
                  )}

                  <p className="summary-disclaimer">
                    Note: All costs are estimates. Actual prices may
                    change depending on availability, season,
                    transport arrangements and service providers.
                    Confirm prices before travelling.
                  </p>

                </section>
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

            {/* SAVE TRIP */}

            <div className="midnight-planner-save-section">

              <button
                className="midnight-planner-save-button"
                onClick={handleSaveTrip}
                disabled={savingTrip || tripSaved}
              >
                {savingTrip ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="midnight-spin"
                    />
                    Saving Your Trip...
                  </>
                ) : tripSaved ? (
                  <>
                    <CheckCircle2 size={18} />
                    Trip Saved Successfully
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Save My Trip
                  </>
                )}
              </button>

              {saveMessage && (
                <p
                  className={
                    tripSaved
                      ? "save-success-message"
                      : "save-error-message"
                  }
                >
                  {saveMessage}
                </p>
              )}

              <button
                className="midnight-planner-result-bottom-button"
                onClick={resetPlanner}
              >
                <RefreshCw size={18} />
                Plan Another Adventure
              </button>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}