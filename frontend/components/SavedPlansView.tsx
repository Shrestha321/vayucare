"use client";

import React, { useState } from "react";
import {
  BookmarkCheck,
  Bookmark,
  Trash2,
  ExternalLink,
  Share2,
  Calendar,
  Users,
  Check,
  Scale,
  Sparkles,
} from "lucide-react";
import { PlanSummaryResponse, AQISeverity } from "@/lib/api";

interface SavedPlansViewProps {
  plans: PlanSummaryResponse[];
  onSelectPlan: (planId: string) => Promise<void>;
  onToggleFavorite: (planId: string, currentVal: boolean) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
  activePlanId?: string | null;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  plans,
  onSelectPlan,
  onToggleFavorite,
  onDeletePlan,
  activePlanId,
}) => {
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const handleCopy = async (slug: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}?share=${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleToggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((i) => i !== id));
    } else {
      if (compareIds.length >= 2) {
        setCompareIds([compareIds[1], id]);
      } else {
        setCompareIds([...compareIds, id]);
      }
    }
  };

  const filteredPlans = filterFavorite ? plans.filter((p) => p.is_favorite) : plans;

  const getAqiColor = (severity: AQISeverity) => {
    switch (severity) {
      case "emergency_critical":
        return "bg-red-950 text-red-300 border-red-800";
      case "severe_hazardous":
        return "bg-purple-950 text-purple-300 border-purple-800";
      case "poor_unhealthy":
        return "bg-orange-950 text-orange-300 border-orange-800";
      default:
        return "bg-emerald-950 text-emerald-300 border-emerald-800";
    }
  };

  return (
    <section aria-labelledby="saved-plans-heading" className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 id="saved-plans-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Saved Smog Action Plans
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Revisit, compare, and manage your household winter survival roadmaps.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFilterFavorite(!filterFavorite)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            filterFavorite
              ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
              : "bg-obsidian-850 text-slate-300 border-obsidian-750 hover:text-white"
          }`}
          aria-label="Filter bookmarked favorite plans"
        >
          <Bookmark className={`w-4 h-4 ${filterFavorite ? "fill-amber-400 text-amber-400" : ""}`} aria-hidden="true" />
          <span>Favorites Only ({plans.filter((p) => p.is_favorite).length})</span>
        </button>
      </div>

      {/* Compare Banner if 2 plans are selected */}
      {compareIds.length === 2 && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-cyan-300 font-semibold">
            <Scale className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>2 Plans Selected for Comparison:</span>
            {compareIds.map((id) => {
              const p = plans.find((item) => item.id === id);
              return p ? (
                <span key={id} className="bg-obsidian-850 px-2 py-0.5 rounded border border-cyan-700 text-white">
                  {p.city} (AQI {p.aqi})
                </span>
              ) : null;
            })}
          </div>
          <button
            type="button"
            onClick={() => setCompareIds([])}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear Comparison
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredPlans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-obsidian-900 border border-obsidian-800">
          <BookmarkCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-base font-bold text-white mb-1">No Saved Plans Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterFavorite
              ? "You haven't bookmarked any plans as favorites yet."
              : "Generate a personalized smog action plan to save and track it here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan) => {
            const isCurrent = activePlanId === plan.id;
            const isCompared = compareIds.includes(plan.id);
            const aqiBadgeClass = getAqiColor(plan.aqi_severity);

            return (
              <article
                key={plan.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrent
                    ? "bg-obsidian-850 border-cyan-500 shadow-lg shadow-cyan-950/40"
                    : "bg-obsidian-900 border-obsidian-800 hover:border-obsidian-700"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-base font-bold text-white">
                      {plan.neighborhood}, {plan.city}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${aqiBadgeClass}`}>
                      AQI {plan.aqi}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        Active In View
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                      <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                      <span>{plan.household_size} Family Members</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleCompare(plan.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center space-x-1 ${
                      isCompared
                        ? "bg-cyan-500 text-obsidian-950 border-cyan-400 font-bold"
                        : "bg-obsidian-800 text-slate-300 border-obsidian-700 hover:text-white"
                    }`}
                    aria-label={`Compare plan for ${plan.city}`}
                  >
                    <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isCompared ? "Compared" : "Compare"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(plan.share_slug, plan.id)}
                    className="p-2 rounded-lg bg-obsidian-800 text-slate-300 hover:text-white border border-obsidian-700 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                    aria-label="Copy share link for this saved plan"
                  >
                    {copiedId === plan.id ? (
                      <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Share2 className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(plan.id, plan.is_favorite)}
                    className="p-2 rounded-lg bg-obsidian-800 text-slate-300 hover:text-amber-400 border border-obsidian-700 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
                    aria-label={plan.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${plan.is_favorite ? "fill-amber-400 text-amber-400" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan.id)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 transition-colors flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400"
                    aria-label={`Open plan for ${plan.city}`}
                  >
                    <span>Open Plan</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-obsidian-800 transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
                    aria-label={`Delete plan for ${plan.city}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
