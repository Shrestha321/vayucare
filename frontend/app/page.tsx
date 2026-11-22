"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar, ActiveTab } from "@/components/Navbar";
import { ProfilerForm } from "@/components/ProfilerForm";
import { DailyRoutinesView } from "@/components/DailyRoutinesView";
import { IAQHacksView } from "@/components/IAQHacksView";
import { SustainableSwapsView } from "@/components/SustainableSwapsView";
import { ImpactSummaryCard } from "@/components/ImpactSummaryCard";
import { CommunityBoardView } from "@/components/CommunityBoardView";
import { SavedPlansView } from "@/components/SavedPlansView";
import { PresetSelector } from "@/components/PresetSelector";
import { AirQualityGuideModal } from "@/components/AirQualityGuideModal";
import {
  api,
  VayuCarePlanResponse,
  UserProfileInput,
  PlanSummaryResponse,
  PresetProfile,
  CommunityPledgeResponse,
  CommunityPledgeCreate,
} from "@/lib/api";
import { Shield, Sparkles, Wind, AlertCircle } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("profiler");
  const [currentPlan, setCurrentPlan] = useState<VayuCarePlanResponse | null>(null);
  const [savedPlans, setSavedPlans] = useState<PlanSummaryResponse[]>([]);
  const [presets, setPresets] = useState<PresetProfile[]>([]);
  const [communityPledges, setCommunityPledges] = useState<CommunityPledgeResponse[]>([]);
  const [initialProfile, setInitialProfile] = useState<UserProfileInput | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Announce notifications for accessibility
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Data Fetching
  const loadInitialData = useCallback(async () => {
    try {
      const [presetsData, plansData, pledgesData] = await Promise.allSettled([
        api.getPresets(),
        api.listPlans(),
        api.listPledges(),
      ]);

      if (presetsData.status === "fulfilled") setPresets(presetsData.value);
      if (plansData.status === "fulfilled") setSavedPlans(plansData.value);
      if (pledgesData.status === "fulfilled") setCommunityPledges(pledgesData.value);

      // Check if URL has ?share=slug
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const shareSlug = urlParams.get("share");
        if (shareSlug) {
          try {
            const sharedPlan = await api.getPlanBySlug(shareSlug);
            setCurrentPlan(sharedPlan);
            setActiveTab("routines");
            triggerNotification(`Loaded shared plan for ${sharedPlan.profile.city}`);
          } catch {
            // Ignore if invalid
          }
        }
      }
    } catch {
      // Background load error
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle Plan Generation
  const handleGeneratePlan = async (profile: UserProfileInput) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const newPlan = await api.generatePlan(profile);
      setCurrentPlan(newPlan);
      // Refresh saved plans list
      const updatedPlans = await api.listPlans();
      setSavedPlans(updatedPlans);

      setActiveTab("routines");
      triggerNotification(
        newPlan.is_cached
          ? `Instant retrieval from cache for ${profile.city}`
          : `Synthesized new smog action plan for ${profile.city}`
      );
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Failed to synthesize plan. Please check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Select Preset
  const handleSelectPreset = (preset: PresetProfile) => {
    setInitialProfile(preset.profile);
    setActiveTab("profiler");
    triggerNotification(`Loaded scenario: ${preset.title}`);
  };

  // Toggle Favorite
  const handleToggleFavorite = async (planId: string, currentVal: boolean) => {
    try {
      await api.toggleFavorite(planId, !currentVal);
      setSavedPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, is_favorite: !currentVal } : p))
      );
      triggerNotification(!currentVal ? "Plan bookmarked to favorites" : "Plan removed from favorites");
    } catch {
      // Error handling
    }
  };

  // Delete Plan
  const handleDeletePlan = async (planId: string) => {
    try {
      await api.deletePlan(planId);
      setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
      if (currentPlan?.id === planId) {
        setCurrentPlan(null);
        setActiveTab("profiler");
      }
      triggerNotification("Plan deleted successfully");
    } catch {
      // Error handling
    }
  };

  // Open Saved Plan by ID
  const handleSelectPlan = async (planId: string) => {
    try {
      setIsLoading(true);
      const fullPlan = await api.getPlanById(planId);
      setCurrentPlan(fullPlan);
      setActiveTab("routines");
      triggerNotification(`Opened plan for ${fullPlan.profile.city}`);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Failed to load saved plan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Upvote Community Pledge
  const handleUpvotePledge = async (pledgeId: string) => {
    try {
      const updated = await api.upvotePledge(pledgeId);
      setCommunityPledges((prev) =>
        prev.map((p) => (p.id === pledgeId ? updated : p))
      );
      triggerNotification("Upvoted community action pledge!");
    } catch {
      // Error
    }
  };

  // Create Community Pledge
  const handleCreatePledge = async (pledge: CommunityPledgeCreate) => {
    const created = await api.createPledge(pledge);
    setCommunityPledges((prev) => [created, ...prev]);
    triggerNotification("Your community pledge was successfully published!");
  };

  const isCurrentPlanFavorite =
    currentPlan ? savedPlans.find((p) => p.id === currentPlan.id)?.is_favorite || false : false;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasPlan={!!currentPlan}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        savedCount={savedPlans.length}
      />

      {/* Accessible Polite Announcement Banner */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {notification}
      </div>

      {notification && (
        <div className="bg-cyan-950 border-b border-cyan-800 text-cyan-200 text-xs py-2 px-4 text-center font-medium">
          {notification}
        </div>
      )}

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {globalError && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Service Notice</p>
              <p className="text-xs text-red-300 mt-0.5">{globalError}</p>
            </div>
          </div>
        )}

        {/* View Switching */}
        {activeTab === "profiler" && (
          <ProfilerForm
            initialProfile={initialProfile}
            onSubmit={handleGeneratePlan}
            isLoading={isLoading}
            errorMessage={globalError}
          />
        )}

        {activeTab === "routines" && currentPlan && (
          <DailyRoutinesView
            routines={currentPlan.daily_routines}
            city={currentPlan.profile.city}
            aqi={currentPlan.profile.aqi}
          />
        )}

        {activeTab === "iaq" && currentPlan && (
          <IAQHacksView
            hacks={currentPlan.iaq_hacks}
            city={currentPlan.profile.city}
          />
        )}

        {activeTab === "swaps" && currentPlan && (
          <SustainableSwapsView
            swaps={currentPlan.sustainable_alternatives}
          />
        )}

        {activeTab === "impact" && currentPlan && (
          <ImpactSummaryCard
            impact={currentPlan.overall_impact}
            planId={currentPlan.id}
            shareSlug={currentPlan.share_slug}
            isFavorite={isCurrentPlanFavorite}
            onToggleFavorite={async (newVal) => {
              await handleToggleFavorite(currentPlan.id, !newVal);
            }}
            city={currentPlan.profile.city}
          />
        )}

        {activeTab === "community" && (
          <CommunityBoardView
            pledges={communityPledges}
            onUpvote={handleUpvotePledge}
            onCreatePledge={handleCreatePledge}
            userCity={currentPlan?.profile.city || "New Delhi"}
          />
        )}

        {activeTab === "saved" && (
          <SavedPlansView
            plans={savedPlans}
            onSelectPlan={handleSelectPlan}
            onToggleFavorite={handleToggleFavorite}
            onDeletePlan={handleDeletePlan}
            activePlanId={currentPlan?.id}
          />
        )}
      </main>

      {/* Footer Landmark */}
      <footer className="border-t border-obsidian-800 bg-obsidian-900/60 py-8 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span className="text-slate-300 font-semibold">VayuCare Copilot</span>
            <span>— Precision IAQ &amp; Low-Emission Science</span>
          </div>
          <p>
            Compliant with WCAG 2.1 AA • Powered by Google Gemini &amp; Empirical IAQ Physics
          </p>
        </div>
      </footer>

      {/* Preset Selector Modal */}
      <PresetSelector
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        presets={presets}
        onSelectPreset={handleSelectPreset}
      />

      {/* Air Quality Science Guide Modal */}
      <AirQualityGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
