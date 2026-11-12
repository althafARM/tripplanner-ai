import API from "./api";

// --------------------------------------------------
// COST ESTIMATE REQUEST
// --------------------------------------------------

export interface CostEstimateRequest {
  destination: string;
  start_location: string;
  days: number;
  travellers: number;
  budget: number;

  has_own_vehicle: boolean;

  vehicle_type: "car" | "van" | "tuk_tuk" | null;

  fuel_type?:
    | "petrol_92"
    | "petrol_95"
    | "auto_diesel"
    | "super_diesel"
    | null;

  transport_mode:
    | "train"
    | "bus"
    | "tuk_tuk"
    | "car"
    | "van"
    | null;

  accommodation_type: "budget" | "standard" | "luxury";
  food_type: "budget" | "standard" | "luxury";
}

// --------------------------------------------------
// COST CATEGORY
// --------------------------------------------------

export interface CostCategory {
  amount: number;
  status: string;
  source: string;

  fuel_type?: string | null;
  fuel_price_per_litre?: number;
  fuel_litres?: number;
  fuel_efficiency_km_per_litre?: number | null;
}

// --------------------------------------------------
// SMART BUDGET ADVICE
// --------------------------------------------------

export interface BudgetAdvice {
  status: "within_budget" | "over_budget";

  can_afford_trip: boolean;

  budget_difference: number;

  message: string;

  suggestions: string[];

  recommended_action?: string;
}

// --------------------------------------------------
// COST ESTIMATE RESPONSE
// --------------------------------------------------

export interface CostEstimateResponse {
  success: boolean;

  trip_details: {
    start_location: string;
    destination: string;
    days: number;
    travellers: number;
    has_own_vehicle: boolean;
    vehicle_type: string | null;
    fuel_type?: string | null;
    transport_mode: string | null;
    accommodation_type: string;
    food_type: string;
  };

  route_details: {
    one_way_distance_km: number;
    round_trip_distance_km: number;
    estimated_driving_minutes: number;
    distance_source: string | null;

    start_coordinates: {
      latitude: number;
      longitude: number;
    } | null;

    destination_coordinates: {
      latitude: number;
      longitude: number;
    } | null;
  };

  cost_breakdown: {
    transport: CostCategory;
    fuel: CostCategory;
    vehicle_hire: CostCategory;
    accommodation: CostCategory;
    food: CostCategory;
    attractions: CostCategory;
    other_expenses: CostCategory;
  };

  // Smart Budget Assistant response
  budget_advice: BudgetAdvice;

  summary: {
    total_estimated_cost: number;
    cost_per_traveller: number;
    budget: number;
    remaining_budget: number;
    within_budget: boolean;
  };

  currency: string;

  price_information: {
    price_type: string;
    last_updated?: string;
    fuel_prices_last_updated?: string;
    fuel_price_source?: string;
    message: string;
  };
}

// --------------------------------------------------
// ESTIMATE TRAVEL COST
// --------------------------------------------------

export async function estimateTravelCost(
  payload: CostEstimateRequest
): Promise<CostEstimateResponse> {

  const response = await API.post(
    "/api/costs/estimate",
    payload
  );

  return response.data;
}

// --------------------------------------------------
// SAVED COST ESTIMATE TYPES
// --------------------------------------------------

export interface SavedCostEstimate {
  id: number;
  destination: string;
  start_location: string;
  days: number;
  travellers: number;
  total_cost: number;
  budget: number;
  remaining_budget: number;
  within_budget: boolean;
  created_at: string;
}

export interface SavedCostEstimatesResponse {
  success: boolean;
  total: number;
  estimates: SavedCostEstimate[];
}

// --------------------------------------------------
// SAVE COST ESTIMATE
// --------------------------------------------------

export async function saveCostEstimate(
  result: CostEstimateResponse
) {

  const response = await API.post(
    "/api/cost-estimates/save",
    {
      trip_details: result.trip_details,
      route_details: result.route_details,
      cost_breakdown: result.cost_breakdown,
      summary: result.summary,
    }
  );

  return response.data;
}

// --------------------------------------------------
// GET SAVED COST ESTIMATES
// --------------------------------------------------

export async function getSavedCostEstimates():
Promise<SavedCostEstimatesResponse> {

  const response = await API.get(
    "/api/cost-estimates/"
  );

  return response.data;
}

// --------------------------------------------------
// DELETE SAVED COST ESTIMATE
// --------------------------------------------------

export async function deleteCostEstimate(
  estimateId: number
) {

  const response = await API.delete(
    `/api/cost-estimates/${estimateId}`
  );

  return response.data;
}

// --------------------------------------------------
// GET SAVED COST ESTIMATE DETAILS
// --------------------------------------------------

export async function getCostEstimateDetails(
  estimateId: number
) {

  const response = await API.get(
    `/api/cost-estimates/${estimateId}`
  );

  return response.data;
}