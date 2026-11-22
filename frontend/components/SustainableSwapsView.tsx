"use client";

import React, { useState } from "react";
import {
  Leaf,
  DollarSign,
  TrendingDown,
  Sparkles,
  Zap,
  Filter,
} from "lucide-react";
import { SustainableAlternative, BudgetTier, SwapCategory, ConfidenceLevel } from "@/lib/api";

interface SustainableSwapsViewProps {
  swaps: SustainableAlternative[];
}

export const SustainableSwapsView: React.FC<SustainableSwapsViewProps> = ({ swaps }) => {
  const [selectedTier, setSelectedTier] = useState<BudgetTier | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<SwapCategory | "all">("all");

  const filteredSwaps = swaps.filter((s) => {
    const tierMatch = selectedTier === "all" || s.budget_tier === selectedTier;
    const catMatch = selectedCategory === "all" || s.category === selectedCategory;
    return tierMatch && catMatch;
  });

  const getTierBadge = (tier: BudgetTier) => {
    switch (tier) {
      case "minimal":
        return { label: "Free / DIY Low Cost", class: "bg-emerald-950 text-emerald-300 border-emerald-800" };
      case "moderate":
        return { label: "Moderate Budget", class: "bg-cyan-950 text-cyan-300 border-cyan-800" };
      default:
        return { label: "Comprehensive Retrofit", class: "bg-purple-950 text-purple-300 border-purple-800" };
    }
  };

  return (
    <section aria-labelledby="swaps-heading" className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 id="swaps-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Sustainable Alternatives &amp; Carbon Swaps
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Budget-tiered lifestyle and energy transitions that cut household winter emissions while defending respiratory health.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 p-4 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Filter className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          <span className="font-semibold">Filter Swaps:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Budget Filter */}
          <div className="flex items-center space-x-1 bg-obsidian-850 p-1 rounded-lg border border-obsidian-750 text-xs">
            {(["all", "minimal", "moderate", "comprehensive"] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors capitalize ${
                  selectedTier === tier
                    ? "bg-cyan-500 text-obsidian-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Swaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSwaps.map((swap, idx) => {
          const tierBadge = getTierBadge(swap.budget_tier);

          return (
            <article
              key={idx}
              className="rounded-2xl bg-obsidian-900 border border-obsidian-800 p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${tierBadge.class}`}>
                    {tierBadge.label}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {swap.category.replace(/_/g, " ")}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white mb-2">
                  {swap.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {swap.description}
                </p>

                {/* Immediate Swap Action */}
                <div className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-750 mb-3">
                  <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-[11px] mb-1">
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Deploy Today</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    {swap.immediate_swap}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2.5 rounded-lg bg-obsidian-850/80 border border-obsidian-800">
                    <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-semibold mb-0.5">
                      <TrendingDown className="w-3 h-3" aria-hidden="true" />
                      <span>Emission Cut</span>
                    </div>
                    <span className="text-white font-bold text-xs">{swap.estimated_emission_cut}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-obsidian-850/80 border border-obsidian-800">
                    <div className="flex items-center space-x-1 text-amber-400 text-[10px] font-semibold mb-0.5">
                      <DollarSign className="w-3 h-3" aria-hidden="true" />
                      <span>Cost Impact</span>
                    </div>
                    <span className="text-white font-bold text-xs">{swap.estimated_cost_impact}</span>
                  </div>
                </div>
              </div>

              {/* Scientific Mechanism */}
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-slate-300 space-y-2">
                <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Why It Works</span>
                </div>
                <p className="leading-relaxed">
                  {swap.mechanism}
                </p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-cyan-900/30">
                  <span className="text-cyan-300 font-semibold">Assumptions: </span>
                  {swap.assumptions}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
