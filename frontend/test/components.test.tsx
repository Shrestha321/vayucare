import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Navbar } from "@/components/Navbar";
import { ProfilerForm } from "@/components/ProfilerForm";
import { DailyRoutinesView } from "@/components/DailyRoutinesView";
import { IAQHacksView } from "@/components/IAQHacksView";
import { SustainableSwapsView } from "@/components/SustainableSwapsView";
import { ImpactSummaryCard } from "@/components/ImpactSummaryCard";
import { PresetSelector } from "@/components/PresetSelector";
import {
  TimeBlockRoutine,
  IAQRoomHack,
  SustainableAlternative,
  OverallImpactSummary,
  PresetProfile,
  UserProfileInput,
} from "@/lib/api";

const mockRoutines: TimeBlockRoutine[] = [
  {
    time_window: "early_morning",
    time_label: "06:00 - 08:30 (Morning Inversion Peak)",
    safe_outdoor_window: false,
    exposure_risk: "critical",
    recommended_activity: "Keep doors sealed; avoid outdoor exercise.",
    commute_swap: "Delay commute past 9 AM.",
    mask_guidance: "Tight N95 respirator mandatory.",
    mechanism: "Radiative surface cooling locks PM2.5 under 100 meters.",
    estimated_pm25_reduction_pct_range: "70% - 85%",
    co2_reduction_kg_monthly: 5.0,
    assumptions: "Boundary layer remains low until solar rise.",
    confidence_level: "high",
  },
];

const mockHacks: IAQRoomHack[] = [
  {
    room_name: "master_bedroom",
    room_display_title: "Master Bedroom Sanctuary",
    ventilation_rule: "Keep windows weatherstripped; do not open at night.",
    purifier_strategy: "Place HEPA unit 1 meter from bed headboard.",
    dust_and_chemical_control: "Wet-mop twice weekly; zero agarbatti.",
    kitchen_cooking_swap: null,
    mechanism: "Continuous CADR recycling reduces steady-state PM2.5.",
    indoor_pm25_drop_pct_range: "75% - 88%",
    assumptions: "Door kept closed overnight.",
    confidence_level: "high",
  },
];

const mockSwaps: SustainableAlternative[] = [
  {
    category: "commute_travel",
    budget_tier: "minimal",
    title: "Shift to Metro Transit & Engine Anti-Idling",
    description: "Switch 3 days weekly to mass transit.",
    immediate_swap: "Turn off engine at lights >20 seconds.",
    mechanism: "Mass transit carries 40x more passengers per unit of fuel.",
    estimated_emission_cut: "30 - 45 kg CO2e / month",
    estimated_cost_impact: "Saves $30 monthly",
    assumptions: "Replaces personal motorcycle travel.",
    confidence_level: "high",
  },
];

const mockImpact: OverallImpactSummary = {
  estimated_aggregate_pm25_reduction_pct: "65% - 80% personal dose reduction",
  estimated_indoor_aqi_drop_points: "220 points reduction",
  household_co2_cut_kg_monthly: "55 kg CO2e / month",
  vulnerable_member_alerts: ["Asthma Alert: Cold air triggers bronchial constriction."],
  emergency_escalation_triggers: ["Peak expiratory flow drop > 30%."],
};

describe("Navbar Component", () => {
  it("renders brand, accessible tablist, and action buttons", () => {
    const handleTabChange = vi.fn();
    render(
      <Navbar
        activeTab="profiler"
        onTabChange={handleTabChange}
        hasPlan={true}
        onOpenPresets={vi.fn()}
        onOpenGuide={vi.fn()}
        savedCount={3}
      />
    );

    expect(screen.getByText(/Vayu/i)).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Household Profiler/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Daily Routines/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Room IAQ Hacks/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Saved Plans \(3\)/i })).toBeInTheDocument();
  });
});

describe("ProfilerForm Component", () => {
  it("renders form fields with accessible labels and handles input", () => {
    const handleSubmit = vi.fn();
    render(<ProfilerForm onSubmit={handleSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Neighborhood/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ambient Air Quality Index slider/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generate Personalized Smog Action Plan/i })).toBeInTheDocument();
  });

  it("triggers submit when required fields are filled", () => {
    const handleSubmit = vi.fn();
    render(<ProfilerForm onSubmit={handleSubmit} isLoading={false} />);

    const submitBtn = screen.getByRole("button", { name: /Generate Personalized Smog Action Plan/i });
    fireEvent.click(submitBtn);

    // Initial default profile has city and neighborhood filled
    expect(handleSubmit).toHaveBeenCalled();
  });
});

describe("DailyRoutinesView Component", () => {
  it("renders routine time blocks and mechanisms", () => {
    render(<DailyRoutinesView routines={mockRoutines} city="New Delhi" aqi={420} />);

    expect(screen.getByText(/06:00 - 08:30 \(Morning Inversion Peak\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Avoid Outdoor Exposure/i)).toBeInTheDocument();
    expect(screen.getByText(/Radiative surface cooling locks PM2.5 under 100 meters./i)).toBeInTheDocument();
    expect(screen.getByText(/70% - 85%/i)).toBeInTheDocument();
  });
});

describe("IAQHacksView Component", () => {
  it("renders room tabs and actionable IAQ instructions", () => {
    render(<IAQHacksView hacks={mockHacks} city="New Delhi" />);

    expect(screen.getByRole("tab", { name: /Master Bedroom Sanctuary/i })).toBeInTheDocument();
    expect(screen.getByText(/Ventilation Timing vs. Sealing/i)).toBeInTheDocument();
    expect(screen.getByText(/Keep windows weatherstripped; do not open at night./i)).toBeInTheDocument();
    expect(screen.getByText(/Place HEPA unit 1 meter from bed headboard./i)).toBeInTheDocument();
  });
});

describe("SustainableSwapsView Component", () => {
  it("renders budget-tiered swaps and carbon cut metrics", () => {
    render(<SustainableSwapsView swaps={mockSwaps} />);

    expect(screen.getByText(/Shift to Metro Transit & Engine Anti-Idling/i)).toBeInTheDocument();
    expect(screen.getByText(/30 - 45 kg CO2e \/ month/i)).toBeInTheDocument();
    expect(screen.getByText(/Free \/ DIY Low Cost/i)).toBeInTheDocument();
  });
});

describe("ImpactSummaryCard Component", () => {
  it("renders primary exposure reduction meters and clinical emergency triggers", () => {
    const handleToggleFavorite = vi.fn();
    render(
      <ImpactSummaryCard
        impact={mockImpact}
        planId="plan-123"
        shareSlug="slug-456"
        isFavorite={false}
        onToggleFavorite={handleToggleFavorite}
        city="New Delhi"
      />
    );

    expect(screen.getByText(/65% - 80% personal dose reduction/i)).toBeInTheDocument();
    expect(screen.getByText(/220 points reduction/i)).toBeInTheDocument();
    expect(screen.getByText(/55 kg CO2e \/ month/i)).toBeInTheDocument();
    expect(screen.getByText(/Asthma Alert: Cold air triggers bronchial constriction./i)).toBeInTheDocument();
    expect(screen.getByText(/Peak expiratory flow drop > 30%./i)).toBeInTheDocument();
  });
});

describe("PresetSelector Component", () => {
  const mockPreset: PresetProfile = {
    id: "delhi-test",
    title: "Delhi NCR Winter Severe",
    description: "Severe smog testing scenario",
    tag: "AQI 420",
    profile: {
      city: "New Delhi",
      neighborhood: "Defence Colony",
      aqi: 420,
      housing_type: "apartment_low",
      floor_level: "mid_floor_1_5",
      household_members: [
        { role: "healthy_adult", has_asthma_or_sensitivity: false, daily_commute: true },
      ],
      commute_mode: "metro_train",
      cooking_fuel: "piped_natural_gas",
      heating_source: "electric_oil_convection",
      has_air_purifier: true,
      budget_tier: "moderate",
    },
  };

  it("renders presets dialog and triggers selection callback", () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <PresetSelector
        isOpen={true}
        onClose={handleClose}
        presets={[mockPreset]}
        onSelectPreset={handleSelect}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Realistic Smog & Demographic Scenarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Delhi NCR Winter Severe/i)).toBeInTheDocument();

    const loadBtn = screen.getByRole("button", { name: /Apply Delhi NCR Winter Severe/i });
    fireEvent.click(loadBtn);
    expect(handleSelect).toHaveBeenCalledWith(mockPreset);
  });
});
