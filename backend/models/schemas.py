"""Pydantic v2 schemas for VayuCare data validation and serialization."""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class HousingType(str, Enum):
    """Housing structure categorization."""
    APARTMENT_HIGH = "apartment_high"  # 6th floor or higher
    APARTMENT_LOW = "apartment_low"    # 1st to 5th floor
    GROUND_FLOOR_STUDIO = "ground_floor_studio"
    INDEPENDENT_HOUSE = "independent_house"
    SLUM_UNSEALED = "slum_unsealed"


class FloorLevel(str, Enum):
    """Floor elevation level affecting ground-level particulate concentration."""
    BASEMENT = "basement"
    GROUND_FLOOR = "ground_floor"
    MID_FLOOR_1_5 = "mid_floor_1_5"
    HIGH_FLOOR_6_PLUS = "high_floor_6_plus"


class CommuteMode(str, Enum):
    """Primary daily commute method."""
    METRO_TRAIN = "metro_train"
    BUS_PUBLIC = "bus_public"
    TWO_WHEELER = "two_wheeler"  # Motorbike/Scooter
    CAR_AC_RECIRC = "car_ac_recirc"
    WALK_CYCLE = "walk_cycle"
    HYBRID_WFH = "hybrid_wfh"


class MemberRole(str, Enum):
    """Role/profile of an individual household member."""
    INFANT_TODDLER = "infant_toddler"      # 0-4 years
    SCHOOL_KID = "school_kid"              # 5-17 years
    PREGNANT_INDIVIDUAL = "pregnant_individual"
    ELDERLY_SENIOR = "elderly_senior"      # 65+ years
    ASTHMATIC_OR_COPD = "asthmatic_or_copd"
    HEALTHY_ADULT = "healthy_adult"


class CookingFuel(str, Enum):
    """Primary household cooking fuel."""
    LPG_GAS = "lpg_gas"
    INDUCTION_ELECTRIC = "induction_electric"
    PIPED_NATURAL_GAS = "piped_natural_gas"
    BIOMASS_WOOD_CHARCOAL = "biomass_wood_charcoal"


class HeatingSource(str, Enum):
    """Winter space heating method."""
    NONE = "none"
    HEAT_PUMP_AC = "heat_pump_ac"
    ELECTRIC_OIL_CONVECTION = "electric_oil_convection"
    GAS_HEATER = "gas_heater"
    WOOD_ANGITHI_COAL = "wood_angithi_coal"


class BudgetTier(str, Enum):
    """Financial tier for recommended interventions."""
    MINIMAL = "minimal"        # Free to near-zero cost DIY
    MODERATE = "moderate"      # Balanced budget swaps
    COMPREHENSIVE = "comprehensive"  # High-end purifiers and retrofits


class ConfidenceLevel(str, Enum):
    """Confidence grade based on empirical IAQ and atmospheric science."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AQISeverity(str, Enum):
    """Standardized AQI severity classifications."""
    GOOD_MODERATE = "good_moderate"      # 0 - 100
    UNHEALTHY_SENSITIVE = "unhealthy_sensitive"  # 101 - 200
    POOR_UNHEALTHY = "poor_unhealthy"    # 201 - 300
    SEVERE_HAZARDOUS = "severe_hazardous"  # 301 - 450
    EMERGENCY_CRITICAL = "emergency_critical"  # 451+


class RoutineTimeWindow(str, Enum):
    """Time-of-day blocks for daily routines."""
    EARLY_MORNING = "early_morning"
    COMMUTE_OUTBOUND = "commute_outbound"
    MIDDAY_AFTERNOON = "midday_afternoon"
    COMMUTE_RETURN = "commute_return"
    NIGHT_SLEEP = "night_sleep"


class ExposureRisk(str, Enum):
    """Ambient exposure risk level."""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class RoomName(str, Enum):
    """Target room for IAQ interventions."""
    LIVING_ROOM = "living_room"
    MASTER_BEDROOM = "master_bedroom"
    CHILDREN_NURSERY = "children_nursery"
    ELDERLY_ROOM = "elderly_room"
    KITCHEN = "kitchen"
    ENTRYWAY_BALCONY = "entryway_balcony"


class SwapCategory(str, Enum):
    """Sustainable lifestyle swap domain."""
    COMMUTE_TRAVEL = "commute_travel"
    HOME_ENERGY_HEATING = "home_energy_heating"
    COOKING_FUEL = "cooking_fuel"
    HOUSEHOLD_PRODUCTS = "household_products"
    COMMUNITY_GREEN_ACTION = "community_green_action"


class PledgeActionType(str, Enum):
    """Categories for community smog mitigation pledges."""
    COMMUTE_CARPOOL = "commute_carpool"
    STOP_WASTE_BURNING = "stop_waste_burning"
    IAQ_SENIOR_AID = "iaq_senior_aid"
    PLANT_URBAN_GREENERY = "plant_urban_greenery"
    ANTI_IDLING_CAMPAIGN = "anti_idling_campaign"
    CLEAN_COOKING_PLEDGE = "clean_cooking_pledge"


# --- Input Models ---

class MemberProfile(BaseModel):
    """Individual member in the household."""
    model_config = ConfigDict(frozen=True)

    role: MemberRole = Field(..., description="Role and age/health category of the member")
    has_asthma_or_sensitivity: bool = Field(default=False, description="Whether this member has documented respiratory/asthma condition")
    daily_commute: bool = Field(default=True, description="Whether this member commutes daily outside the home")
    notes: Optional[str] = Field(default=None, max_length=150, description="Specific sensitivity notes or medication requirements")


class UserProfileInput(BaseModel):
    """Comprehensive user household and ambient profile input."""
    model_config = ConfigDict(str_strip_whitespace=True)

    city: str = Field(..., min_length=2, max_length=100, description="City name (e.g., Delhi, Lahore, Mumbai)")
    neighborhood: str = Field(..., min_length=2, max_length=120, description="Neighborhood, locality, or sector")
    aqi: int = Field(..., ge=0, le=999, description="Ambient AQI reading (0 to 999 scale)")
    housing_type: HousingType = Field(default=HousingType.APARTMENT_LOW, description="Housing typology")
    floor_level: FloorLevel = Field(default=FloorLevel.MID_FLOOR_1_5, description="Floor level in the building")
    household_members: List[MemberProfile] = Field(..., min_length=1, max_length=15, description="List of household members")
    commute_mode: CommuteMode = Field(default=CommuteMode.METRO_TRAIN, description="Primary commute mode")
    cooking_fuel: CookingFuel = Field(default=CookingFuel.LPG_GAS, description="Cooking fuel used")
    heating_source: HeatingSource = Field(default=HeatingSource.NONE, description="Heating source used in winter")
    has_air_purifier: bool = Field(default=False, description="Whether the household owns a mechanical air purifier")
    budget_tier: BudgetTier = Field(default=BudgetTier.MODERATE, description="Intervention budget tier preference")
    special_concerns: Optional[str] = Field(default=None, max_length=500, description="Additional notes or constraints")


# --- Output / Generated Plan Models ---

class TimeBlockRoutine(BaseModel):
    """Scheduled low-emission and exposure-optimized routine block."""
    model_config = ConfigDict(frozen=True)

    time_window: RoutineTimeWindow = Field(..., description="Daily routine phase")
    time_label: str = Field(..., description="Display time range e.g., 06:00 - 08:30 (Morning Peak)")
    safe_outdoor_window: bool = Field(..., description="Whether ambient PM2.5 levels permit safe outdoor transit/activity")
    exposure_risk: ExposureRisk = Field(..., description="Exposure danger rating")
    recommended_activity: str = Field(..., description="Specific schedule actions for vulnerable and general members")
    commute_swap: str = Field(..., description="Direct low-emission travel swap recommendation")
    mask_guidance: str = Field(..., description="Mask type and filtration fit guidance (N95, FFP2, valve vs non-valve)")
    mechanism: str = Field(..., description="Plain-language physical mechanism explaining why this recommendation works")
    estimated_pm25_reduction_pct_range: str = Field(..., description="Realistic PM2.5 exposure reduction percentage range")
    co2_reduction_kg_monthly: Optional[float] = Field(default=None, description="Estimated monthly household CO2 emissions saved in kg")
    assumptions: str = Field(..., description="Explicit scientific and behavioral assumptions")
    confidence_level: ConfidenceLevel = Field(..., description="Empirical confidence level")


class IAQRoomHack(BaseModel):
    """Room-by-room actionable indoor air quality protocol."""
    model_config = ConfigDict(frozen=True)

    room_name: RoomName = Field(..., description="Target room")
    room_display_title: str = Field(..., description="Human-friendly room title")
    ventilation_rule: str = Field(..., description="Precise ventilation schedule vs. perimeter sealing actions")
    purifier_strategy: str = Field(..., description="Purifier positioning, DIY Corsi-Rosenthal box guidance, or airflow management")
    dust_and_chemical_control: str = Field(..., description="Wet-mopping instructions, micro-dust prevention, avoiding incense/VOCs")
    kitchen_cooking_swap: Optional[str] = Field(default=None, description="Kitchen exhaust and low-smoke cooking adjustments")
    mechanism: str = Field(..., description="Plain-language IAQ mechanism (particulate physics, infiltration dynamics)")
    indoor_pm25_drop_pct_range: str = Field(..., description="Estimated room PM2.5 drop percentage range")
    assumptions: str = Field(..., description="Assumptions regarding room sealing, air volume, and filtration efficiency")
    confidence_level: ConfidenceLevel = Field(..., description="Confidence grade")


class SustainableAlternative(BaseModel):
    """Budget-tiered sustainable lifestyle and community action swap."""
    model_config = ConfigDict(frozen=True)

    category: SwapCategory = Field(..., description="Intervention category")
    budget_tier: BudgetTier = Field(..., description="Budget tier")
    title: str = Field(..., description="Swap title")
    description: str = Field(..., description="Full actionable description")
    immediate_swap: str = Field(..., description="Immediate low-effort alternative to deploy today")
    mechanism: str = Field(..., description="Physical or lifecycle mechanism reducing emissions or exposure")
    estimated_emission_cut: str = Field(..., description="Estimated emission cut (e.g. 15-25 kg CO2e / month)")
    estimated_cost_impact: str = Field(..., description="Estimated financial impact or monthly savings")
    assumptions: str = Field(..., description="Baseline behavior and equipment assumptions")
    confidence_level: ConfidenceLevel = Field(..., description="Confidence grade")


class OverallImpactSummary(BaseModel):
    """Aggregated exposure and environmental impact metrics."""
    model_config = ConfigDict(frozen=True)

    estimated_aggregate_pm25_reduction_pct: str = Field(..., description="Total estimated personal PM2.5 exposure reduction")
    estimated_indoor_aqi_drop_points: str = Field(..., description="Estimated indoor AQI drop points relative to ambient")
    household_co2_cut_kg_monthly: str = Field(..., description="Total estimated household monthly CO2 cut")
    vulnerable_member_alerts: List[str] = Field(..., description="Critical alerts tailored specifically to infants, seniors, asthmatics")
    emergency_escalation_triggers: List[str] = Field(..., description="Clinical and air triggers requiring immediate medical intervention")


class VayuCarePlanResponse(BaseModel):
    """Complete personalized smog response plan."""
    id: str = Field(..., description="Unique plan identifier")
    share_slug: str = Field(..., description="URL-friendly sharing token")
    created_at: str = Field(..., description="ISO 8601 generation timestamp")
    is_cached: bool = Field(default=False, description="Whether this response was served from cache")
    profile: UserProfileInput = Field(..., description="The user profile provided")
    aqi_severity: AQISeverity = Field(..., description="Computed AQI severity grade")
    daily_routines: List[TimeBlockRoutine] = Field(..., description="Daily time-blocked routine recommendations")
    iaq_hacks: List[IAQRoomHack] = Field(..., description="Room-by-room indoor air quality hacks")
    sustainable_alternatives: List[SustainableAlternative] = Field(..., description="Practical sustainable alternatives")
    overall_impact: OverallImpactSummary = Field(..., description="Holistic impact calculation and medical safeguards")


class PlanSummaryResponse(BaseModel):
    """Lightweight plan listing representation."""
    id: str
    share_slug: str
    created_at: str
    city: str
    neighborhood: str
    aqi: int
    aqi_severity: AQISeverity
    household_size: int
    is_favorite: bool


class PlanFavoriteUpdate(BaseModel):
    """Payload to toggle plan favorite status."""
    is_favorite: bool


# --- Community Models ---

class CommunityPledgeCreate(BaseModel):
    """Payload to create a new community smog action pledge."""
    model_config = ConfigDict(str_strip_whitespace=True)

    author_name: str = Field(..., min_length=2, max_length=60, description="Pledger name or pseudonym")
    neighborhood: str = Field(..., min_length=2, max_length=100, description="Neighborhood or locality")
    city: str = Field(..., min_length=2, max_length=80, description="City name")
    action_type: PledgeActionType = Field(..., description="Pledge action category")
    title: str = Field(..., min_length=5, max_length=120, description="Pledge title")
    description: str = Field(..., min_length=15, max_length=600, description="Concrete pledge commitment details")
    target_reduction_summary: str = Field(..., min_length=5, max_length=150, description="Target reduction impact")


class CommunityPledgeResponse(BaseModel):
    """Full community pledge with counter and upvotes."""
    id: str
    author_name: str
    neighborhood: str
    city: str
    action_type: PledgeActionType
    title: str
    description: str
    target_reduction_summary: str
    pledge_count: int
    upvotes: int
    created_at: str


# --- Preset Models ---

class PresetProfile(BaseModel):
    """Realistic one-click scenario preset."""
    id: str
    title: str
    description: str
    tag: str
    profile: UserProfileInput
