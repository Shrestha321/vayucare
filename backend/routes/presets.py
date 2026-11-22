"""Realistic one-click smog and demographic scenario presets."""

from typing import List
from fastapi import APIRouter
from backend.models.schemas import (
    BudgetTier,
    CommuteMode,
    CookingFuel,
    FloorLevel,
    HeatingSource,
    HousingType,
    MemberProfile,
    MemberRole,
    PresetProfile,
    UserProfileInput,
)

router = APIRouter(prefix="/api/presets", tags=["Scenario Presets"])

PRESETS: List[PresetProfile] = [
    PresetProfile(
        id="delhi-severe-420",
        title="Delhi NCR Winter Severe — Family with Elderly & School Kid",
        description="Hazardous thermal inversion peak in Delhi NCR (AQI 420). Family of 4 living on 3rd floor with asthmatic grandmother and 9-year-old student.",
        tag="Severe AQI 420 • Multigenerational",
        profile=UserProfileInput(
            city="New Delhi",
            neighborhood="Defence Colony / Lajpat Nagar",
            aqi=420,
            housing_type=HousingType.APARTMENT_LOW,
            floor_level=FloorLevel.MID_FLOOR_1_5,
            household_members=[
                MemberProfile(role=MemberRole.HEALTHY_ADULT, has_asthma_or_sensitivity=False, daily_commute=True, notes="Office worker"),
                MemberProfile(role=MemberRole.HEALTHY_ADULT, has_asthma_or_sensitivity=False, daily_commute=True, notes="School teacher"),
                MemberProfile(role=MemberRole.SCHOOL_KID, has_asthma_or_sensitivity=False, daily_commute=True, notes="9yo attending morning school"),
                MemberProfile(role=MemberRole.ELDERLY_SENIOR, has_asthma_or_sensitivity=True, daily_commute=False, notes="Chronic bronchitis, stays home"),
            ],
            commute_mode=CommuteMode.METRO_TRAIN,
            cooking_fuel=CookingFuel.PIPED_NATURAL_GAS,
            heating_source=HeatingSource.ELECTRIC_OIL_CONVECTION,
            has_air_purifier=True,
            budget_tier=BudgetTier.MODERATE,
            special_concerns="Grandmother experiences acute coughing during early morning hours; school kid has outdoor morning assembly.",
        ),
    ),
    PresetProfile(
        id="lahore-critical-560",
        title="Lahore Smog Crisis — Joint Family with Newborn & Grandparents",
        description="Emergency off-the-scale particulate crisis in Lahore (AQI 560+). Joint household with 3-month-old infant, ground-floor exposure, and two-wheeler commuters.",
        tag="Emergency AQI 560+ • Newborn Protection",
        profile=UserProfileInput(
            city="Lahore",
            neighborhood="Gulberg III / Model Town",
            aqi=560,
            housing_type=HousingType.GROUND_FLOOR_STUDIO,
            floor_level=FloorLevel.GROUND_FLOOR,
            household_members=[
                MemberProfile(role=MemberRole.INFANT_TODDLER, has_asthma_or_sensitivity=True, daily_commute=False, notes="3-month-old infant"),
                MemberProfile(role=MemberRole.HEALTHY_ADULT, has_asthma_or_sensitivity=False, daily_commute=True, notes="Motorcycle commuter"),
                MemberProfile(role=MemberRole.HEALTHY_ADULT, has_asthma_or_sensitivity=False, daily_commute=False, notes="Full-time caregiver"),
                MemberProfile(role=MemberRole.ELDERLY_SENIOR, has_asthma_or_sensitivity=True, daily_commute=False, notes="Hypertension and mild COPD"),
            ],
            commute_mode=CommuteMode.TWO_WHEELER,
            cooking_fuel=CookingFuel.LPG_GAS,
            heating_source=HeatingSource.GAS_HEATER,
            has_air_purifier=False,
            budget_tier=BudgetTier.MINIMAL,
            special_concerns="Extreme PM2.5 infiltration on ground floor; cannot afford commercial HEPA filters; baby chest congestion fears.",
        ),
    ),
    PresetProfile(
        id="mumbai-coastal-185",
        title="Mumbai Coastal Smog — Ground Floor Studio with Asthmatic Resident",
        description="Moderate-to-poor coastal inversion smog (AQI 185) exacerbated by nearby construction and maritime humidity.",
        tag="Unhealthy AQI 185 • Asthma Sensitivity",
        profile=UserProfileInput(
            city="Mumbai",
            neighborhood="Bandra West / Khar Danda",
            aqi=185,
            housing_type=HousingType.GROUND_FLOOR_STUDIO,
            floor_level=FloorLevel.GROUND_FLOOR,
            household_members=[
                MemberProfile(role=MemberRole.ASTHMATIC_OR_COPD, has_asthma_or_sensitivity=True, daily_commute=True, notes="Uses budesonide inhaler daily"),
                MemberProfile(role=MemberRole.HEALTHY_ADULT, has_asthma_or_sensitivity=False, daily_commute=True, notes="Suburban train commuter"),
            ],
            commute_mode=CommuteMode.METRO_TRAIN,
            cooking_fuel=CookingFuel.PIPED_NATURAL_GAS,
            heating_source=HeatingSource.NONE,
            has_air_purifier=False,
            budget_tier=BudgetTier.MODERATE,
            special_concerns="High humidity causes mold spores to combine with traffic soot, triggering evening wheezing.",
        ),
    ),
    PresetProfile(
        id="kolkata-transit-310",
        title="Kolkata Traffic Corridor — High-Rise Apartment with Bus Commuters",
        description="Hazardous roadside dust and vehicular smoke corridor (AQI 310) in South Kolkata, 8th floor flat.",
        tag="Hazardous AQI 310 • High-Rise Dynamics",
        profile=UserProfileInput(
            city="Kolkata",
            neighborhood="Ballygunge / Gariahat",
            aqi=310,
            housing_type=HousingType.APARTMENT_HIGH,
            floor_level=FloorLevel.HIGH_FLOOR_6_PLUS,
            household_members=[
                MemberProfile(role=MemberRole.HEALTHY_ADULT, has_asthma_or_sensitivity=False, daily_commute=True, notes="Public bus commuter"),
                MemberProfile(role=MemberRole.PREGNANT_INDIVIDUAL, has_asthma_or_sensitivity=False, daily_commute=False, notes="Second trimester pregnancy"),
            ],
            commute_mode=CommuteMode.BUS_PUBLIC,
            cooking_fuel=CookingFuel.LPG_GAS,
            heating_source=HeatingSource.NONE,
            has_air_purifier=True,
            budget_tier=BudgetTier.COMPREHENSIVE,
            special_concerns="Expecting mother requires safe indoor air sanctuary and minimal exposure during clinical checkups.",
        ),
    ),
]


@router.get("", response_model=List[PresetProfile])
async def get_scenario_presets() -> List[PresetProfile]:
    """Retrieve realistic pre-configured household and pollution scenarios."""
    return PRESETS
