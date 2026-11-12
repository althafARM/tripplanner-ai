import "./CostEstimateDetails.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  Fuel,
  Hotel,
  Utensils,
  Ticket,
  Car,
  Train,
  Route,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getCostEstimateDetails } from "../services/costService";

interface EstimateDetails {
  id: number;
  destination: string;
  start_location: string;
  days: number;
  travellers: number;
  budget: number;
  has_own_vehicle: boolean;
  vehicle_type: string | null;
  transport_mode: string | null;
  accommodation_type: string;
  food_type: string;
  total_cost: number;
  cost_per_traveller: number;
  remaining_budget: number;
  within_budget: boolean;
  cost_breakdown: Record<string, {
    amount: number;
    status: string;
    source?: string;
  }>;
  route_details: {
    one_way_distance_km?: number;
    round_trip_distance_km?: number;
    estimated_driving_minutes?: number;
    distance_source?: string;
  };
  created_at: string;
}

export default function CostEstimateDetails() {
  const { estimateId } = useParams();
  const navigate = useNavigate();

  const [estimate, setEstimate] =
    useState<EstimateDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatLKR = (amount: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(amount);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);

        const response = await getCostEstimateDetails(
          Number(estimateId)
        );

        setEstimate(response.estimate);
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
            "Unable to load estimate details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (estimateId && Number.isInteger(Number(estimateId)) &&
        Number(estimateId) > 0) {
      loadDetails();
    } else {
      setError("Invalid estimate ID.");
      setLoading(false);
    }
  }, [estimateId]);

  const expenseItems = [
    { key: "transport", title: "Transport", icon: Train },
    { key: "fuel", title: "Fuel", icon: Fuel },
    { key: "vehicle_hire", title: "Vehicle Hire", icon: Car },
    { key: "accommodation", title: "Accommodation", icon: Hotel },
    { key: "food", title: "Food & Restaurants", icon: Utensils },
    { key: "attractions", title: "Attractions", icon: Ticket },
    { key: "other_expenses", title: "Other Expenses", icon: Wallet },
  ];

  if (loading) {
    return (
      <div className="page-shell estimate-details-page">
        <div className="estimate-details-message">
          <RefreshCw className="cost-spin" size={35} />
          <h2>Loading estimate details...</h2>
        </div>
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="page-shell estimate-details-page">
        <div className="estimate-details-message">
          <AlertCircle size={35} />
          <h2>Unable to Load Estimate</h2>
          <p>{error || "Estimate not found."}</p>

          <button onClick={() => navigate("/saved-estimates")}>
            Back to Saved Estimates
          </button>
        </div>
      </div>
    );
  }

  const drivingMinutes =
    estimate.route_details.estimated_driving_minutes ?? 0;

  return (
    <div className="page-shell estimate-details-page">

      <button
        className="estimate-back-button"
        onClick={() => navigate("/saved-estimates")}
      >
        <ArrowLeft size={18} />
        Back to Saved Estimates
      </button>

      {/* HEADER */}
      <section className="estimate-details-header">
        <span>SAVED TRAVEL BUDGET</span>

        <h1>
          {estimate.start_location}{" "}
          <MapPin size={25} /> {estimate.destination}
        </h1>

        <p>
          Saved on{" "}
          {new Date(estimate.created_at).toLocaleString()}
        </p>
      </section>

      {/* TOTAL COST */}
      <section className="estimate-details-total">
        <span>TOTAL ESTIMATED COST</span>

        <h2>{formatLKR(estimate.total_cost)}</h2>

        <p>
          Per traveller:{" "}
          <strong>
            {formatLKR(estimate.cost_per_traveller)}
          </strong>
        </p>
      </section>

      {/* BUDGET STATUS */}
      <section
        className={
          estimate.within_budget
            ? "estimate-details-budget within-budget"
            : "estimate-details-budget over-budget"
        }
      >
        {estimate.within_budget ? (
          <CheckCircle size={25} />
        ) : (
          <AlertCircle size={25} />
        )}

        <div>
          <h3>
            {estimate.within_budget
              ? "Within Your Budget"
              : "Over Your Budget"}
          </h3>

          <p>
            {estimate.within_budget
              ? `${formatLKR(estimate.remaining_budget)} remaining`
              : `${formatLKR(Math.abs(estimate.remaining_budget))} over budget`}
          </p>
        </div>
      </section>

      {/* TRIP INFORMATION */}
      <section className="estimate-details-section">
        <h2>Trip Information</h2>

        <div className="estimate-details-grid">

          <div className="estimate-detail-card">
            <MapPin />
            <span>Starting Location</span>
            <strong>{estimate.start_location}</strong>
          </div>

          <div className="estimate-detail-card">
            <MapPin />
            <span>Destination</span>
            <strong>{estimate.destination}</strong>
          </div>

          <div className="estimate-detail-card">
            <CalendarDays />
            <span>Travel Duration</span>
            <strong>{estimate.days} Days</strong>
          </div>

          <div className="estimate-detail-card">
            <Users />
            <span>Travellers</span>
            <strong>{estimate.travellers} People</strong>
          </div>

          <div className="estimate-detail-card">
            <Wallet />
            <span>Total Budget</span>
            <strong>{formatLKR(estimate.budget)}</strong>
          </div>

          <div className="estimate-detail-card">
            <Hotel />
            <span>Accommodation</span>
            <strong>{estimate.accommodation_type}</strong>
          </div>

          <div className="estimate-detail-card">
            <Utensils />
            <span>Food Preference</span>
            <strong>{estimate.food_type}</strong>
          </div>

          <div className="estimate-detail-card">
            {estimate.has_own_vehicle ? <Car /> : <Train />}
            <span>Transport Method</span>
            <strong>
              {estimate.has_own_vehicle
                ? `Own ${estimate.vehicle_type || "Vehicle"}`
                : estimate.transport_mode || "Not specified"}
            </strong>
          </div>

        </div>
      </section>

      {/* ROUTE DETAILS */}
      {estimate.route_details.distance_source && (
        <section className="estimate-details-section">
          <h2>
            <Route size={22} />
            Route Information
          </h2>

          <div className="estimate-route-grid">

            <div>
              <span>One-way Distance</span>
              <strong>
                {estimate.route_details.one_way_distance_km ?? 0} km
              </strong>
            </div>

            <div>
              <span>Return Distance</span>
              <strong>
                {estimate.route_details.round_trip_distance_km ?? 0} km
              </strong>
            </div>

            <div>
              <span>Return Driving Time</span>
              <strong>
                <Clock size={17} />
                {Math.floor(drivingMinutes / 60)}h{" "}
                {drivingMinutes % 60}m
              </strong>
            </div>

          </div>

          <p className="estimate-route-source">
            Distance source: {estimate.route_details.distance_source}
          </p>
        </section>
      )}

      {/* EXPENSE BREAKDOWN */}
      <section className="estimate-details-section">
        <h2>Complete Expense Breakdown</h2>

        <div className="estimate-expense-grid">

          {expenseItems.map((item) => {
            const expense = estimate.cost_breakdown[item.key];

            if (!expense) return null;

            const Icon = item.icon;

            return (
              <div
                className="estimate-expense-card"
                key={item.key}
              >
                <div className="estimate-expense-icon">
                  <Icon size={23} />
                </div>

                <div>
                  <h3>{item.title}</h3>

                  <strong>
                    {formatLKR(expense.amount)}
                  </strong>

                  <span>{expense.status}</span>
                </div>
              </div>
            );
          })}

        </div>
      </section>

      <button
        className="estimate-back-button bottom"
        onClick={() => navigate("/saved-estimates")}
      >
        <ArrowLeft size={18} />
        Back to Saved Estimates
      </button>

    </div>
  );
}