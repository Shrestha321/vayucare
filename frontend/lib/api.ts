/**
 * VayuCare Centralized Typed API Client.
 * Strictly typed interfaces matching backend Pydantic v2 models.
 * Zero 'any' types.
 */

export type HousingType =
  | "apartment_high"
  | "apartment_low"
  | "ground_floor_studio"
  | "independent_house"
  | "slum_unsealed";

export type FloorLevel =
  | "basement"
  | "ground_floor"
  | "mid_floor_1_5"
  | "high_floor_6_plus";

export type CommuteMode =
  | "metro_train"
  | "bus_public"
  | "two_wheeler"
  | "car_ac_recirc"
  | "walk_cycle"
  | "hybrid_wfh";

export type MemberRole =
  | "infant_toddler"
  | "school_kid"
  | "pregnant_individual"
  | "elderly_senior"
  | "asthmatic_or_copd"
  | "healthy_adult";

export type CookingFuel =
  | "lpg_gas"
  | "induction_electric"
  | "piped_natural_gas"
  | "biomass_wood_charcoal";

export type HeatingSource =
  | "none"
  | "heat_pump_ac"
  | "electric_oil_convection"
  | "gas_heater"
  | "wood_angithi_coal";

export type BudgetTier = "minimal" | "moderate" | "comprehensive";
export type ConfidenceLevel = "high" | "medium" | "low";
export type AQISeverity =
  | "good_moderate"
  | "unhealthy_sensitive"
  | "poor_unhealthy"
  | "severe_hazardous"
  | "emergency_critical";

export type RoutineTimeWindow =
  | "early_morning"
  | "commute_outbound"
  | "midday_afternoon"
  | "commute_return"
  | "night_sleep";

export type ExposureRisk = "low" | "moderate" | "high" | "critical";

export type RoomName =
  | "living_room"
  | "master_bedroom"
  | "children_nursery"
  | "elderly_room"
  | "kitchen"
  | "entryway_balcony";

export type SwapCategory =
  | "commute_travel"
  | "home_energy_heating"
  | "cooking_fuel"
  | "household_products"
  | "community_green_action";

export type PledgeActionType =
  | "commute_carpool"
  | "stop_waste_burning"
  | "iaq_senior_aid"
  | "plant_urban_greenery"
  | "anti_idling_campaign"
  | "clean_cooking_pledge";

export interface MemberProfile {
  role: MemberRole;
  has_asthma_or_sensitivity: boolean;
  daily_commute: boolean;
  notes?: string | null;
}

export interface UserProfileInput {
  city: string;
  neighborhood: string;
  aqi: number;
  housing_type: HousingType;
  floor_level: FloorLevel;
  household_members: MemberProfile[];
  commute_mode: CommuteMode;
  cooking_fuel: CookingFuel;
  heating_source: HeatingSource;
  has_air_purifier: boolean;
  budget_tier: BudgetTier;
  special_concerns?: string | null;
}

export interface TimeBlockRoutine {
  time_window: RoutineTimeWindow;
  time_label: string;
  safe_outdoor_window: boolean;
  exposure_risk: ExposureRisk;
  recommended_activity: string;
  commute_swap: string;
  mask_guidance: string;
  mechanism: string;
  estimated_pm25_reduction_pct_range: string;
  co2_reduction_kg_monthly?: number | null;
  assumptions: string;
  confidence_level: ConfidenceLevel;
}

export interface IAQRoomHack {
  room_name: RoomName;
  room_display_title: string;
  ventilation_rule: string;
  purifier_strategy: string;
  dust_and_chemical_control: string;
  kitchen_cooking_swap?: string | null;
  mechanism: string;
  indoor_pm25_drop_pct_range: string;
  assumptions: string;
  confidence_level: ConfidenceLevel;
}

export interface SustainableAlternative {
  category: SwapCategory;
  budget_tier: BudgetTier;
  title: string;
  description: string;
  immediate_swap: string;
  mechanism: string;
  estimated_emission_cut: string;
  estimated_cost_impact: string;
  assumptions: string;
  confidence_level: ConfidenceLevel;
}

export interface OverallImpactSummary {
  estimated_aggregate_pm25_reduction_pct: string;
  estimated_indoor_aqi_drop_points: string;
  household_co2_cut_kg_monthly: string;
  vulnerable_member_alerts: string[];
  emergency_escalation_triggers: string[];
}

export interface VayuCarePlanResponse {
  id: string;
  share_slug: string;
  created_at: string;
  is_cached: boolean;
  profile: UserProfileInput;
  aqi_severity: AQISeverity;
  daily_routines: TimeBlockRoutine[];
  iaq_hacks: IAQRoomHack[];
  sustainable_alternatives: SustainableAlternative[];
  overall_impact: OverallImpactSummary;
}

export interface PlanSummaryResponse {
  id: string;
  share_slug: string;
  created_at: string;
  city: string;
  neighborhood: string;
  aqi: number;
  aqi_severity: AQISeverity;
  household_size: number;
  is_favorite: boolean;
}

export interface PresetProfile {
  id: string;
  title: string;
  description: string;
  tag: string;
  profile: UserProfileInput;
}

export interface CommunityPledgeCreate {
  author_name: string;
  neighborhood: string;
  city: string;
  action_type: PledgeActionType;
  title: string;
  description: string;
  target_reduction_summary: string;
}

export interface CommunityPledgeResponse {
  id: string;
  author_name: string;
  neighborhood: string;
  city: string;
  action_type: PledgeActionType;
  title: string;
  description: string;
  target_reduction_summary: string;
  pledge_count: number;
  upvotes: number;
  created_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(`API Error ${status}: ${detail}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let detail = `Request failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          detail = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Fallback to text or status
      }
      throw new ApiError(response.status, detail);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      503,
      err instanceof Error ? err.message : "Network error communicating with VayuCare backend"
    );
  }
}

export const api = {
  /** Generate or retrieve cached personalized smog action plan */
  generatePlan: (profile: UserProfileInput): Promise<VayuCarePlanResponse> =>
    request<VayuCarePlanResponse>("/api/plans/generate", {
      method: "POST",
      body: JSON.stringify(profile),
    }),

  /** List saved plan summaries */
  listPlans: (limit = 30, offset = 0): Promise<PlanSummaryResponse[]> =>
    request<PlanSummaryResponse[]>(`/api/plans?limit=${limit}&offset=${offset}`),

  /** Get full plan by UUID */
  getPlanById: (planId: string): Promise<VayuCarePlanResponse> =>
    request<VayuCarePlanResponse>(`/api/plans/${planId}`),

  /** Get shared plan by slug token */
  getPlanBySlug: (slug: string): Promise<VayuCarePlanResponse> =>
    request<VayuCarePlanResponse>(`/api/plans/share/${slug}`),

  /** Toggle favorite status */
  toggleFavorite: (planId: string, isFavorite: boolean): Promise<{ id: string; is_favorite: boolean }> =>
    request<{ id: string; is_favorite: boolean }>(`/api/plans/${planId}/favorite`, {
      method: "PATCH",
      body: JSON.stringify({ is_favorite: isFavorite }),
    }),

  /** Delete plan by ID */
  deletePlan: (planId: string): Promise<void> =>
    request<void>(`/api/plans/${planId}`, {
      method: "DELETE",
    }),

  /** Fetch pre-configured realistic scenario presets */
  getPresets: (): Promise<PresetProfile[]> =>
    request<PresetProfile[]>("/api/presets"),

  /** Fetch community smog action board pledges */
  listPledges: (city?: string, actionType?: PledgeActionType): Promise<CommunityPledgeResponse[]> => {
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (actionType) params.append("action_type", actionType);
    const queryString = params.toString();
    return request<CommunityPledgeResponse[]>(`/api/community/pledges${queryString ? `?${queryString}` : ""}`);
  },

  /** Submit a new community smog pledge */
  createPledge: (pledge: CommunityPledgeCreate): Promise<CommunityPledgeResponse> =>
    request<CommunityPledgeResponse>("/api/community/pledges", {
      method: "POST",
      body: JSON.stringify(pledge),
    }),

  /** Upvote an existing community pledge */
  upvotePledge: (pledgeId: string): Promise<CommunityPledgeResponse> =>
    request<CommunityPledgeResponse>(`/api/community/pledges/${pledgeId}/upvote`, {
      method: "POST",
    }),

  /** Health probe */
  checkHealth: (): Promise<{ status: string; service: string }> =>
    request<{ status: string; service: string }>("/health"),
};
