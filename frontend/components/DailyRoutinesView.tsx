"use client";

import React, { useState } from "react";
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Info,
  Car,
  Compass,
  Sparkles,
} from "lucide-react";
import { TimeBlockRoutine, RoutineTimeWindow, ExposureRisk, ConfidenceLevel } from "@/lib/api";

interface DailyRoutinesViewProps {
  routines: TimeBlockRoutine[];
  city: string;
  aqi: number;
}

export const DailyRoutinesView: React.FC<DailyRoutinesViewProps> = ({
  routines,
  city,
  aqi,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const getRiskBadge = (risk: ExposureRisk) => {
    switch (risk) {
      case "critical":
        return { label: "Critical Risk", class: "bg-red-950 text-red-300 border-red-800" };
      case "high":
        return { label: "High Risk", class: "bg-purple-950 text-purple-300 border-purple-800" };
      case "moderate":
        return { label: "Moderate Risk", class: "bg-amber-950 text-amber-300 border-amber-800" };
      default:
        return { label: "Low Risk", class: "bg-emerald-950 text-emerald-300 border-emerald-800" };
    }
  };

  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case "high":
        return "bg-emerald-950 text-emerald-300 border-emerald-800";
      case "medium":
        return "bg-cyan-950 text-cyan-300 border-cyan-800";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <section aria-labelledby="routines-heading" className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 id="routines-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Low-Emission Daily Routines
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Chronologically scheduled routines optimized for {city}&apos;s winter atmospheric boundary layer (Current AQI: {aqi}).
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-obsidian-850 px-3 py-1.5 rounded-lg border border-obsidian-750 text-slate-300">
            <Compass className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>Thermal Inversion Schedule Active</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {routines.map((routine, idx) => {
          const isExpanded = expandedIndex === idx;
          const riskBadge = getRiskBadge(routine.exposure_risk);

          return (
            <article
              key={idx}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? "bg-obsidian-900 border-cyan-500/50 shadow-lg shadow-cyan-950/30"
                  : "bg-obsidian-900/70 border-obsidian-800 hover:border-obsidian-700"
              }`}
            >
              {/* Routine Card Header */}
              <button
                type="button"
                onClick={() => toggleExpand(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-2xl"
                aria-expanded={isExpanded}
                aria-label={`Toggle details for ${routine.time_label}`}
              >
                <div className="flex items-start sm:items-center space-x-4">
                  <div className="p-2.5 rounded-xl bg-obsidian-800 border border-obsidian-700 text-cyan-400 flex-shrink-0">
                    <Clock className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-white">
                        {routine.time_label}
                      </h2>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${riskBadge.class}`}>
                        {riskBadge.label}
                      </span>
                      {routine.safe_outdoor_window ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <ShieldCheck className="w-3 h-3 mr-1" aria-hidden="true" />
                          Safer Window
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800">
                          <ShieldAlert className="w-3 h-3 mr-1" aria-hidden="true" />
                          Avoid Outdoor Exposure
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                      {routine.recommended_activity}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 flex-shrink-0 mt-1 sm:mt-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>
              </button>

              {/* Expanded Card Details */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 space-y-5 border-t border-obsidian-800/80 pt-5 text-xs text-slate-200">
                  {/* Recommended Activity */}
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mb-1">
                      Activity &amp; Scheduling Protocol
                    </h3>
                    <p className="text-sm text-slate-100 leading-relaxed bg-obsidian-850 p-3.5 rounded-xl border border-obsidian-800">
                      {routine.recommended_activity}
                    </p>
                  </div>

                  {/* Commute Swap & Mask Guidance Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-obsidian-850 p-4 rounded-xl border border-obsidian-800">
                      <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1.5">
                        <Car className="w-4 h-4" aria-hidden="true" />
                        <span>Low-Emission Commute Swap</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {routine.commute_swap}
                      </p>
                    </div>

                    <div className="bg-obsidian-850 p-4 rounded-xl border border-obsidian-800">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1.5">
                        <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                        <span>Respirator / Mask Guidance</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {routine.mask_guidance}
                      </p>
                    </div>
                  </div>

                  {/* Transparent Reasoning: Mechanism, Impact & Assumptions */}
                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs">
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        <span>Why This Works (Scientific Mechanism)</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${getConfidenceBadge(routine.confidence_level)}`}>
                        {routine.confidence_level} Confidence
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      {routine.mechanism}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-cyan-900/50 text-[11px]">
                      <div>
                        <span className="font-semibold text-cyan-300">Estimated Direct Impact: </span>
                        <span className="text-white font-bold">{routine.estimated_pm25_reduction_pct_range}</span>
                        {routine.co2_reduction_kg_monthly && (
                          <div className="text-slate-400 mt-0.5">
                            Monthly Household CO2e Cut: ~{routine.co2_reduction_kg_monthly} kg
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-cyan-300">Assumptions: </span>
                        <span className="text-slate-300">{routine.assumptions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
