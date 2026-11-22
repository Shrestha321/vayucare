"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  Activity,
  Home,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  BudgetTier,
  CommuteMode,
  CookingFuel,
  FloorLevel,
  HousingType,
  MemberProfile,
  MemberRole,
  UserProfileInput,
  HeatingSource,
} from "@/lib/api";

interface ProfilerFormProps {
  initialProfile?: UserProfileInput;
  onSubmit: (profile: UserProfileInput) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
}

const DEFAULT_PROFILE: UserProfileInput = {
  city: "New Delhi",
  neighborhood: "Defence Colony",
  aqi: 380,
  housing_type: "apartment_low",
  floor_level: "mid_floor_1_5",
  household_members: [
    {
      role: "healthy_adult",
      has_asthma_or_sensitivity: false,
      daily_commute: true,
      notes: "Office commuter",
    },
    {
      role: "elderly_senior",
      has_asthma_or_sensitivity: true,
      daily_commute: false,
      notes: "Chronic bronchitis; stays indoors",
    },
    {
      role: "school_kid",
      has_asthma_or_sensitivity: false,
      daily_commute: true,
      notes: "Morning school bus transit",
    },
  ],
  commute_mode: "metro_train",
  cooking_fuel: "piped_natural_gas",
  heating_source: "electric_oil_convection",
  has_air_purifier: true,
  budget_tier: "moderate",
  special_concerns: "Elderly member experiences night wheezing; need bedroom sealing advice.",
};

export const ProfilerForm: React.FC<ProfilerFormProps> = ({
  initialProfile = DEFAULT_PROFILE,
  onSubmit,
  isLoading,
  errorMessage,
}) => {
  const [profile, setProfile] = useState<UserProfileInput>(initialProfile);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync if initialProfile changes from a preset
  React.useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const handleMemberChange = (
    index: number,
    field: keyof MemberProfile,
    value: string | boolean
  ) => {
    const updated = [...profile.household_members];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, household_members: updated });
  };

  const handleAddMember = () => {
    if (profile.household_members.length >= 10) return;
    setProfile({
      ...profile,
      household_members: [
        ...profile.household_members,
        {
          role: "healthy_adult",
          has_asthma_or_sensitivity: false,
          daily_commute: true,
          notes: "",
        },
      ],
    });
  };

  const handleRemoveMember = (index: number) => {
    if (profile.household_members.length <= 1) return;
    const updated = profile.household_members.filter((_, i) => i !== index);
    setProfile({ ...profile, household_members: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Frontend validation
    if (!profile.city.trim()) {
      setValidationError("City name is required.");
      return;
    }
    if (!profile.neighborhood.trim()) {
      setValidationError("Neighborhood or locality is required.");
      return;
    }
    if (profile.aqi < 0 || profile.aqi > 999) {
      setValidationError("AQI must be between 0 and 999.");
      return;
    }
    if (profile.household_members.length === 0) {
      setValidationError("At least one household member must be specified.");
      return;
    }

    await onSubmit(profile);
  };

  const getAqiSeverityBadge = (aqi: number) => {
    if (aqi <= 100) return { label: "Good / Moderate", class: "bg-emerald-950 text-emerald-300 border-emerald-800" };
    if (aqi <= 200) return { label: "Unhealthy for Sensitive", class: "bg-amber-950 text-amber-300 border-amber-800" };
    if (aqi <= 300) return { label: "Poor / Unhealthy", class: "bg-orange-950 text-orange-300 border-orange-800" };
    if (aqi <= 450) return { label: "Severe / Hazardous", class: "bg-purple-950 text-purple-300 border-purple-800" };
    return { label: "Emergency Critical (Inversion Crisis)", class: "bg-red-950 text-red-300 border-red-800 animate-pulse" };
  };

  const severityBadge = getAqiSeverityBadge(profile.aqi);

  return (
    <section aria-labelledby="profiler-heading" className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center sm:text-left">
        <h1 id="profiler-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Household &amp; Location Profiler
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Enter your specific housing structure, vulnerable family members, daily transit patterns, and winter pollution
          intensity to generate an evidence-based smog mitigation plan.
        </p>
      </div>

      {/* Accessible Live Region for Errors */}
      <div aria-live="polite" aria-atomic="true">
        {(validationError || errorMessage) && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Validation Error</p>
              <p className="text-xs text-red-300 mt-0.5">{validationError || errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-obsidian-900 border border-obsidian-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Section 1: Location & Ambient AQI */}
        <fieldset className="space-y-4">
          <legend className="text-base font-bold text-cyan-400 flex items-center space-x-2 border-b border-obsidian-800 pb-2 w-full">
            <Activity className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <span>1. Location &amp; Smog Severity</span>
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city-input" className="block text-xs font-semibold text-slate-300 mb-1">
                City <span className="text-red-400">*</span>
              </label>
              <input
                id="city-input"
                type="text"
                required
                maxLength={100}
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="e.g. New Delhi, Lahore, Mumbai"
                className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white placeholder-slate-500 text-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
            </div>

            <div>
              <label htmlFor="neighborhood-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Neighborhood / Sector <span className="text-red-400">*</span>
              </label>
              <input
                id="neighborhood-input"
                type="text"
                required
                maxLength={120}
                value={profile.neighborhood}
                onChange={(e) => setProfile({ ...profile, neighborhood: e.target.value })}
                placeholder="e.g. Defence Colony, Gulberg, Bandra"
                className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white placeholder-slate-500 text-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
            </div>
          </div>

          {/* AQI Slider & Severity Tag */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="aqi-input" className="text-xs font-semibold text-slate-300">
                Ambient AQI (Air Quality Index): <span className="text-cyan-400 font-bold text-base">{profile.aqi}</span>
              </label>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${severityBadge.class}`}>
                {severityBadge.label}
              </span>
            </div>
            <input
              id="aqi-input"
              type="range"
              min="0"
              max="999"
              step="1"
              value={profile.aqi}
              onChange={(e) => setProfile({ ...profile, aqi: parseInt(e.target.value, 10) || 0 })}
              className="w-full h-2 bg-obsidian-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Ambient Air Quality Index slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0 (Clean)</span>
              <span>100 (Moderate)</span>
              <span>250 (Poor)</span>
              <span>400 (Severe)</span>
              <span>999 (Crisis)</span>
            </div>
          </div>
        </fieldset>

        {/* Section 2: Housing & Elevation */}
        <fieldset className="space-y-4">
          <legend className="text-base font-bold text-emerald-400 flex items-center space-x-2 border-b border-obsidian-800 pb-2 w-full">
            <Home className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <span>2. Housing Typology &amp; Floor Elevation</span>
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="housing-type-select" className="block text-xs font-semibold text-slate-300 mb-1">
                Housing Type
              </label>
              <select
                id="housing-type-select"
                value={profile.housing_type}
                onChange={(e) => setProfile({ ...profile, housing_type: e.target.value as HousingType })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-sm focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <option value="apartment_low">Apartment (1st - 5th Floor)</option>
                <option value="apartment_high">Apartment High-Rise (6th Floor+)</option>
                <option value="ground_floor_studio">Ground Floor Studio / Flat</option>
                <option value="independent_house">Independent House / Villa</option>
                <option value="slum_unsealed">Informal / Unsealed Dwelling</option>
              </select>
            </div>

            <div>
              <label htmlFor="floor-level-select" className="block text-xs font-semibold text-slate-300 mb-1">
                Floor Level
              </label>
              <select
                id="floor-level-select"
                value={profile.floor_level}
                onChange={(e) => setProfile({ ...profile, floor_level: e.target.value as FloorLevel })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-sm focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <option value="ground_floor">Ground Floor (Highest dust tracking)</option>
                <option value="mid_floor_1_5">Mid Floor (1st - 5th)</option>
                <option value="high_floor_6_plus">High Floor (6th floor &amp; above)</option>
                <option value="basement">Basement / Semi-basement</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Section 3: Household Members & Vulnerabilities */}
        <fieldset className="space-y-4">
          <div className="flex items-center justify-between border-b border-obsidian-800 pb-2">
            <legend className="text-base font-bold text-cyan-400 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              <span>3. Household Members &amp; Vulnerabilities</span>
            </legend>
            <button
              type="button"
              onClick={handleAddMember}
              disabled={profile.household_members.length >= 8}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-700 text-cyan-300 border border-cyan-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-40"
              aria-label="Add household member"
            >
              <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Add Member
            </button>
          </div>

          <div className="space-y-3">
            {profile.household_members.map((member, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={`member-role-${idx}`} className="block text-[11px] font-medium text-slate-400 mb-1">
                      Member {idx + 1} Role
                    </label>
                    <select
                      id={`member-role-${idx}`}
                      value={member.role}
                      onChange={(e) => handleMemberChange(idx, "role", e.target.value as MemberRole)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      <option value="infant_toddler">Infant / Toddler (0-4 yrs)</option>
                      <option value="school_kid">School Kid (5-17 yrs)</option>
                      <option value="pregnant_individual">Pregnant Individual</option>
                      <option value="elderly_senior">Elderly Senior (65+ yrs)</option>
                      <option value="asthmatic_or_copd">Asthmatic / COPD / Bronchitis</option>
                      <option value="healthy_adult">Healthy Adult</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center space-y-2 pt-1">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={member.has_asthma_or_sensitivity}
                        onChange={(e) => handleMemberChange(idx, "has_asthma_or_sensitivity", e.target.checked)}
                        className="rounded bg-obsidian-800 border-obsidian-700 text-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
                      />
                      <span>Asthma / Respiratory Sensitivity</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={member.daily_commute}
                        onChange={(e) => handleMemberChange(idx, "daily_commute", e.target.checked)}
                        className="rounded bg-obsidian-800 border-obsidian-700 text-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
                      />
                      <span>Daily Commuter</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor={`member-notes-${idx}`} className="block text-[11px] font-medium text-slate-400 mb-1">
                      Sensitivity Notes (Optional)
                    </label>
                    <input
                      id={`member-notes-${idx}`}
                      type="text"
                      maxLength={150}
                      value={member.notes || ""}
                      onChange={(e) => handleMemberChange(idx, "notes", e.target.value)}
                      placeholder="e.g. Uses inhaler, morning bus"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
                    />
                  </div>
                </div>

                {profile.household_members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="self-end sm:self-center p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-obsidian-800 transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
                    aria-label={`Remove household member ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </fieldset>

        {/* Section 4: Commute & Energy Profiles */}
        <fieldset className="space-y-4">
          <legend className="text-base font-bold text-cyan-400 flex items-center space-x-2 border-b border-obsidian-800 pb-2 w-full">
            <span>4. Commute, Energy &amp; Heating Lifestyle</span>
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="commute-select" className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Commute Mode
              </label>
              <select
                id="commute-select"
                value={profile.commute_mode}
                onChange={(e) => setProfile({ ...profile, commute_mode: e.target.value as CommuteMode })}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <option value="metro_train">Metro / LRT Rail Transit</option>
                <option value="bus_public">Public City Bus</option>
                <option value="two_wheeler">Motorcycle / Scooter (Open Air)</option>
                <option value="car_ac_recirc">Car (AC Recirculation)</option>
                <option value="walk_cycle">Walking / Bicycle</option>
                <option value="hybrid_wfh">Remote / Work from Home</option>
              </select>
            </div>

            <div>
              <label htmlFor="cooking-fuel-select" className="block text-xs font-semibold text-slate-300 mb-1">
                Cooking Fuel
              </label>
              <select
                id="cooking-fuel-select"
                value={profile.cooking_fuel}
                onChange={(e) => setProfile({ ...profile, cooking_fuel: e.target.value as CookingFuel })}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <option value="piped_natural_gas">Piped Natural Gas (PNG)</option>
                <option value="lpg_gas">LPG Cylinder</option>
                <option value="induction_electric">Induction / Electric Stovetop</option>
                <option value="biomass_wood_charcoal">Biomass / Charcoal / Wood</option>
              </select>
            </div>

            <div>
              <label htmlFor="heating-source-select" className="block text-xs font-semibold text-slate-300 mb-1">
                Winter Space Heating
              </label>
              <select
                id="heating-source-select"
                value={profile.heating_source}
                onChange={(e) => setProfile({ ...profile, heating_source: e.target.value as HeatingSource })}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <option value="electric_oil_convection">Electric Oil / Convection Radiator</option>
                <option value="heat_pump_ac">Inverter AC Heat Pump</option>
                <option value="gas_heater">Gas Heater</option>
                <option value="wood_angithi_coal">Wood / Angithi / Coal</option>
                <option value="none">None / No Heating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-obsidian-850 border border-obsidian-750">
              <div>
                <span className="block text-xs font-semibold text-slate-200">Mechanical Air Purifier</span>
                <span className="text-[11px] text-slate-400">Do you currently operate an air purifier?</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.has_air_purifier}
                  onChange={(e) => setProfile({ ...profile, has_air_purifier: e.target.checked })}
                  className="sr-only peer"
                  aria-label="Toggle whether household owns an air purifier"
                />
                <div className="w-11 h-6 bg-obsidian-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div>
              <label htmlFor="budget-tier-select" className="block text-xs font-semibold text-slate-300 mb-1">
                Intervention Budget Tier
              </label>
              <select
                id="budget-tier-select"
                value={profile.budget_tier}
                onChange={(e) => setProfile({ ...profile, budget_tier: e.target.value as BudgetTier })}
                className="w-full px-3 py-2.5 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <option value="minimal">Minimal (Zero cost &amp; DIY Corsi-Rosenthal boxes)</option>
                <option value="moderate">Moderate (Standard HEPA &amp; weatherstripping)</option>
                <option value="comprehensive">Comprehensive (Multi-room purifiers &amp; retrofits)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="special-concerns" className="block text-xs font-semibold text-slate-300 mb-1">
              Special Health Concerns &amp; Constraints (Optional)
            </label>
            <textarea
              id="special-concerns"
              rows={2}
              maxLength={500}
              value={profile.special_concerns || ""}
              onChange={(e) => setProfile({ ...profile, special_concerns: e.target.value })}
              placeholder="e.g. 3-month-old infant in master bedroom, street-facing balcony dust, elderly member has night-time asthma."
              className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white placeholder-slate-500 text-xs focus-visible:ring-2 focus-visible:ring-cyan-400"
            />
          </div>
        </fieldset>

        {/* Submit Button */}
        <div className="pt-4 border-t border-obsidian-800 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-obsidian-950 flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Generate Personalized Smog Action Plan"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Synthesizing IAQ Plan with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                <span>Generate Personalized Smog Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
