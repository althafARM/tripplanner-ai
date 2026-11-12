import "./CostEstimator.css";
import { useState } from "react";
import RouteMap from "../components/RouteMap";
import {
  Calculator,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  Train,
  Hotel,
  Utensils,
  Ticket,
  Fuel,
  Car,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Navigation,
  Route,
  Clock,
  Lightbulb,
} from "lucide-react";

import {
  estimateTravelCost,
  saveCostEstimate,
  type CostEstimateRequest,
  type CostEstimateResponse,
} from "../services/costService";

export default function CostEstimator() {
  const [form, setForm] = useState<CostEstimateRequest>({
    destination: "",
    start_location: "Colombo",
    days: 2,
    travellers: 2,
    budget: 50000,
    has_own_vehicle: false,
    vehicle_type: null,
    transport_mode: "bus",
    accommodation_type: "budget",
    food_type: "standard",
  });

  const [result, setResult] =
    useState<CostEstimateResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  // SAVE COST ESTIMATE
    const handleSaveEstimate = async () => {
    if (!result) return;

    setSaving(true);
    setSaveMessage("");

    try {
        const response = await saveCostEstimate(result);

        setSaveMessage(
        response.message || "Cost estimate saved successfully!"
        );
    } catch (err: any) {
        setSaveMessage(
        err.response?.data?.detail ||
            "Unable to save estimate. Please try again."
        );
    } finally {
        setSaving(false);
    }
    };
  const formatLKR = (amount: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleChange = (
    field: keyof CostEstimateRequest,
    value: string | number | boolean | null
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleEstimate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await estimateTravelCost(form);
      setResult(response);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to calculate travel costs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isOwnVehicle = result?.trip_details.has_own_vehicle;

    const isHiredVehicle =
    !isOwnVehicle &&
    ["car", "van", "tuk_tuk"].includes(
        result?.trip_details.transport_mode || ""
    );

    const costCards = result
    ? [
        // Public transport
        ...(!isOwnVehicle && !isHiredVehicle
            ? [
                {
                title: "Transport",
                icon: Train,
                data: result.cost_breakdown.transport,
                },
            ]
            : []),

        // Own vehicle or hired vehicle fuel
        ...(isOwnVehicle || isHiredVehicle
            ? [
                {
                title: "Fuel",
                icon: Fuel,
                data: result.cost_breakdown.fuel,
                },
            ]
            : []),

        // Hired vehicle fee
        ...(isHiredVehicle
            ? [
                {
                title: "Vehicle Hire",
                icon: Car,
                data: result.cost_breakdown.vehicle_hire,
                },
            ]
            : []),

        {
            title: "Accommodation",
            icon: Hotel,
            data: result.cost_breakdown.accommodation,
        },
        {
            title: "Food & Restaurants",
            icon: Utensils,
            data: result.cost_breakdown.food,
        },
        {
            title: "Attractions",
            icon: Ticket,
            data: result.cost_breakdown.attractions,
        },
        {
            title: "Other Expenses",
            icon: Wallet,
            data: result.cost_breakdown.other_expenses,
        },
        ]
    : [];

  return (
    <div className="page-shell cost-estimator-page">

      {/* HEADER */}
      <section className="cost-estimator-header">
        <div className="cost-header-icon">
          <Calculator size={30} />
        </div>

        <span className="cost-eyebrow">
          SMART TRAVEL BUDGETING
        </span>

        <h1>
          Travel Cost <span>Estimator</span>
        </h1>

        <p>
          Plan your Sri Lankan journey with a clear breakdown
          of your estimated travel expenses.
        </p>
      </section>

      {/* MAIN CONTENT */}
      <div className="cost-estimator-layout">

        {/* FORM */}
        <section className="cost-form-card">

          <div className="cost-section-heading">
            <Sparkles size={21} />
            <div>
              <h2>Your Trip Details</h2>
              <p>Enter your travel information.</p>
            </div>
          </div>

          <form onSubmit={handleEstimate}>

            <div className="cost-form-grid">

              <div className="cost-field">
                <label>Starting Location</label>

                <div className="cost-input-wrapper">
                  <MapPin size={18} />

                  <input
                    type="text"
                    value={form.start_location}
                    onChange={(e) =>
                      handleChange("start_location", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="cost-field">
                <label>Destination</label>

                <div className="cost-input-wrapper">
                  <MapPin size={18} />

                  <input
                    type="text"
                    placeholder="Example: Kandy"
                    value={form.destination}
                    onChange={(e) =>
                      handleChange("destination", e.target.value)
                    }
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div className="cost-field">
                <label>Number of Days</label>

                <div className="cost-input-wrapper">
                  <CalendarDays size={18} />

                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={form.days}
                    onChange={(e) =>
                      handleChange("days", Number(e.target.value))
                    }
                    required
                  />
                </div>
              </div>

              <div className="cost-field">
                <label>Number of Travellers</label>

                <div className="cost-input-wrapper">
                  <Users size={18} />

                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={form.travellers}
                    onChange={(e) =>
                      handleChange("travellers", Number(e.target.value))
                    }
                    required
                  />
                </div>
              </div>

              <div className="cost-field">
                <label>Total Budget (LKR)</label>

                <div className="cost-input-wrapper">
                  <Wallet size={18} />

                  <input
                    type="number"
                    min="1"
                    value={form.budget}
                    onChange={(e) =>
                      handleChange("budget", Number(e.target.value))
                    }
                    required
                  />
                </div>
              </div>

              {/* OWN VEHICLE SELECTION */}
                <div className="cost-field">
                <label>Do you have your own vehicle?</label>

                <div className="cost-input-wrapper">
                    <Car size={18} />

                    <select
                    value={form.has_own_vehicle ? "yes" : "no"}
                    onChange={(e) => {
                        const hasVehicle = e.target.value === "yes";

                        setForm((previous) => ({
                        ...previous,
                        has_own_vehicle: hasVehicle,
                        vehicle_type: hasVehicle ? "car" : null,
                        transport_mode: hasVehicle ? null : "bus",
                        }));
                    }}
                    >
                    <option value="no">No, I need transport</option>
                    <option value="yes">Yes, I have my own vehicle</option>
                    </select>
                </div>
                </div>

                {/* OWN VEHICLE TYPE */}
                {form.has_own_vehicle ? (
                <div className="cost-field">
                    <label>Choose Your Vehicle</label>

                    <div className="cost-input-wrapper">
                    <Car size={18} />

                    <select
                        value={form.vehicle_type ?? "car"}
                        onChange={(e) =>
                        handleChange(
                            "vehicle_type",
                            e.target.value as "car" | "van" | "tuk_tuk"
                        )
                        }
                    >
                        <option value="car">Car</option>
                        <option value="van">Van</option>
                        <option value="tuk_tuk">Tuk-Tuk</option>
                    </select>
                    </div>
                </div>
                ) : (
                /* HIRED TRANSPORT */
                <div className="cost-field">
                    <label>Choose Transport Method</label>

                    <div className="cost-input-wrapper">
                    <Train size={18} />

                    <select
                        value={form.transport_mode ?? "bus"}
                        onChange={(e) =>
                        handleChange(
                            "transport_mode",
                            e.target.value as "train" | "bus" | "tuk_tuk" | "car" | "van"
                        )
                        }
                    >
                        <option value="train">Train</option>
                        <option value="bus">Bus</option>
                        <option value="tuk_tuk">Hire a Tuk-Tuk</option>
                        <option value="car">Hire a Car</option>
                        <option value="van">Hire a Van</option>
                    </select>
                    </div>
                </div>
                )}

              <div className="cost-field">
                <label>Accommodation</label>

                <div className="cost-input-wrapper">
                  <Hotel size={18} />

                  <select
                    value={form.accommodation_type}
                    onChange={(e) =>
                      handleChange(
                        "accommodation_type",
                        e.target.value
                      )
                    }
                  >
                    <option value="budget">Budget</option>
                    <option value="standard">Standard</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="cost-field">
                <label>Food Preference</label>

                <div className="cost-input-wrapper">
                  <Utensils size={18} />

                  <select
                    value={form.food_type}
                    onChange={(e) =>
                      handleChange("food_type", e.target.value)
                    }
                  >
                    <option value="budget">Budget</option>
                    <option value="standard">Standard</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>

            </div>

            {error && (
              <div className="cost-error">
                <AlertCircle size={19} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="cost-estimate-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={19} className="cost-spin" />
                  Calculating Costs...
                </>
              ) : (
                <>
                  <Calculator size={19} />
                  Calculate Travel Cost
                </>
              )}
            </button>

          </form>
        </section>

        {/* RESULTS */}
        <section className="cost-results-section">

          {!result && !loading && (
            <div className="cost-empty-card">
              <div className="cost-empty-icon">
                <Wallet size={38} />
              </div>

              <h2>Your Cost Breakdown</h2>

              <p>
                Enter your trip details and calculate your
                estimated travel expenses.
              </p>
            </div>
          )}

          {loading && (
            <div className="cost-empty-card">
              <RefreshCw
                size={35}
                className="cost-spin"
              />

              <h2>Calculating your trip...</h2>

              <p>Please wait while we prepare your estimate.</p>
            </div>
          )}

          {result && (
            <>
              {/* TOTAL */}
              <div className="cost-total-card">

                <span className="cost-total-label">
                  TOTAL ESTIMATED TRIP COST
                </span>

                <h2>
                  {formatLKR(
                    result.summary.total_estimated_cost
                  )}
                </h2>

                <div className="cost-per-person">
                  <Users size={17} />
                  Per Traveller:
                  <strong>
                    {formatLKR(
                      result.summary.cost_per_traveller
                    )}
                  </strong>
                </div>

              </div>

              {/* BUDGET */}
              <div
                className={
                  result.summary.within_budget
                    ? "cost-budget-card within-budget"
                    : "cost-budget-card over-budget"
                }
              >

                {result.summary.within_budget ? (
                  <CheckCircle size={23} />
                ) : (
                  <AlertCircle size={23} />
                )}

                <div>
                  <h3>
                    {result.summary.within_budget
                      ? "Within Your Budget"
                      : "Over Your Budget"}
                  </h3>

                  <p>
                    {result.summary.within_budget
                      ? `You have ${formatLKR(
                          result.summary.remaining_budget
                        )} remaining.`
                      : `You need an additional ${formatLKR(
                          Math.abs(
                            result.summary.remaining_budget
                          )
                        )}.`}
                  </p>
                </div>

              </div>
                {/* SMART BUDGET ASSISTANT */}
                {result.budget_advice && (
                <div
                    className={`smart-budget-card ${
                    result.budget_advice.can_afford_trip
                        ? "smart-budget-success"
                        : "smart-budget-warning"
                    }`}
                >
                    <div className="smart-budget-header">
                    <div className="smart-budget-icon">
                        {result.budget_advice.can_afford_trip ? (
                        <CheckCircle size={25} />
                        ) : (
                        <Lightbulb size={25} />
                        )}
                    </div>

                    <div>
                        <span>TRIPPLANNER AI</span>

                        <h2>
                        {result.budget_advice.can_afford_trip
                            ? "Your Trip Is Affordable!"
                            : "Let's Make Your Trip Affordable"}
                        </h2>
                    </div>
                    </div>

                    <p className="smart-budget-message">
                    {result.budget_advice.message}
                    </p>

                    <div className="smart-budget-difference">
                    <Wallet size={21} />

                    <div>
                        <span>
                        {result.budget_advice.can_afford_trip
                            ? "Remaining Budget"
                            : "Additional Money Required"}
                        </span>

                        <strong>
                        {formatLKR(result.budget_advice.budget_difference)}
                        </strong>
                    </div>
                    </div>

                    {!result.budget_advice.can_afford_trip &&
                    result.budget_advice.suggestions.length > 0 && (
                        <div className="smart-budget-suggestions">
                        <h3>
                            <Lightbulb size={19} />
                            AI Recommendations
                        </h3>

                        {result.budget_advice.suggestions.map(
                            (suggestion, index) => (
                            <div
                                className="smart-budget-suggestion"
                                key={index}
                            >
                                <CheckCircle size={17} />
                                <span>{suggestion}</span>
                            </div>
                            )
                        )}
                        </div>
                    )}
                </div>
                )}
              {/* ROUTE INFORMATION */}
              {result.route_details.distance_source && (
                <div className="cost-route-card">

                    <div className="cost-route-header">
                    <div className="cost-route-title-icon">
                        <Route size={22} />
                    </div>

                    <div>
                        <h2>Route Information</h2>
                        <p>Actual road distance calculated using OpenStreetMap.</p>
                    </div>
                    </div>

                    <div className="cost-route-locations">

                    <div className="cost-route-location">
                        <MapPin size={19} />
                        <div>
                        <span>STARTING LOCATION</span>
                        <strong>{result.trip_details.start_location}</strong>
                        </div>
                    </div>

                    <div className="cost-route-arrow">
                        <Navigation size={20} />
                    </div>

                    <div className="cost-route-location">
                        <MapPin size={19} />
                        <div>
                        <span>DESTINATION</span>
                        <strong>{result.trip_details.destination}</strong>
                        </div>
                    </div>

                    </div>

                    <div className="cost-route-stats">

                    <div className="cost-route-stat">
                        <Route size={21} />
                        <span>One-way distance</span>
                        <strong>
                        {result.route_details.one_way_distance_km} km
                        </strong>
                    </div>

                    <div className="cost-route-stat">
                        <Navigation size={21} />
                        <span>Return distance</span>
                        <strong>
                        {result.route_details.round_trip_distance_km} km
                        </strong>
                    </div>

                    <div className="cost-route-stat">
                        <Clock size={21} />
                        <span>Return driving time</span>
                        <strong>
                        {Math.floor(
                            result.route_details.estimated_driving_minutes / 60
                        )}h{" "}
                        {result.route_details.estimated_driving_minutes % 60}m
                        </strong>
                    </div>

                    </div>

                    <div className="cost-route-source">
                    Distance source: {result.route_details.distance_source}
                    </div>

                    {/* INTERACTIVE DRIVING ROUTE MAP */}
                    {result.route_details.start_coordinates &&
                    result.route_details.destination_coordinates && (
                        <div className="cost-route-map-section">

                            <h3>
                            <MapPin size={20} />
                            Driving Route Map
                            </h3>

                            <p>
                            Explore the driving route from your starting location
                            to your destination.
                            </p>

                            <RouteMap
                            startCoordinates={result.route_details.start_coordinates}
                            destinationCoordinates={result.route_details.destination_coordinates}
                            startLocation={result.trip_details.start_location}
                            destination={result.trip_details.destination}
                            />

                        </div>
                    )}

                </div>
              )}

              {/* BREAKDOWN */}
              <div className="cost-breakdown-heading">
                <h2>Expense Breakdown</h2>
                <span>Estimated costs</span>
              </div>

              <div className="cost-breakdown-grid">

                {costCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      className="cost-category-card"
                      key={card.title}
                    >
                      <div className="cost-category-icon">
                        <Icon size={22} />
                      </div>

                      <div>
                        <h3>{card.title}</h3>

                        <strong>
                          {formatLKR(card.data.amount)}
                        </strong>

                        <span className="cost-status">
                          {card.data.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* PRICE INFORMATION */}
              <div className="cost-price-information">

                <h3>Price Information</h3>

                <p>
                  {result.price_information.message}
                </p>

                <span>
                  Price type: {result.price_information.price_type}
                </span>

                <small>
                    Fuel prices updated:{" "}
                    {result.price_information.fuel_prices_last_updated ||
                        "Date unavailable"}
                </small>

              </div>
              {/* SAVE ESTIMATE BUTTON */}
                <div className="cost-save-section">

                <button
                    type="button"
                    className="cost-save-button"
                    onClick={handleSaveEstimate}
                    disabled={saving}
                >
                    {saving ? (
                    <>
                        <RefreshCw size={18} className="cost-spin" />
                        Saving Estimate...
                    </>
                    ) : (
                    <>
                        <CheckCircle size={18} />
                        Save This Estimate
                    </>
                    )}
                </button>

                {saveMessage && (
                    <p className="cost-save-message">
                    {saveMessage}
                    </p>
                )}

                </div>

            </>
          )}

        </section>

      </div>

    </div>
  );
}