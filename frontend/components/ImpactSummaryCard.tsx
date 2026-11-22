"use client";

import React, { useState } from "react";
import {
  TrendingDown,
  ShieldAlert,
  AlertTriangle,
  Bookmark,
  Share2,
  Check,
  Award,
  Sparkles,
} from "lucide-react";
import { OverallImpactSummary } from "@/lib/api";

interface ImpactSummaryCardProps {
  impact: OverallImpactSummary;
  planId: string;
  shareSlug: string;
  isFavorite: boolean;
  onToggleFavorite: (newVal: boolean) => Promise<void>;
  city: string;
}

export const ImpactSummaryCard: React.FC<ImpactSummaryCardProps> = ({
  impact,
  planId,
  shareSlug,
  isFavorite,
  onToggleFavorite,
  city,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);

  const handleCopyLink = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}?share=${shareSlug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleFavoriteClick = async () => {
    setFavoriteLoading(true);
    try {
      await onToggleFavorite(!isFavorite);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <section aria-labelledby="impact-heading" className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 id="impact-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Direct Impact &amp; Medical Safeguards
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Model-synthesized exposure reduction, emissions trajectory, and clinical triggers for {city}.
          </p>
        </div>

        {/* Share & Favorite Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              isFavorite
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-obsidian-800 text-slate-300 border-obsidian-700 hover:text-white hover:bg-obsidian-750"
            }`}
            aria-label={isFavorite ? "Remove from favorite plans" : "Bookmark this plan to favorites"}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} aria-hidden="true" />
            <span>{isFavorite ? "Bookmarked" : "Bookmark Plan"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 transition-colors flex items-center space-x-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Copy public shareable link for this plan"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span>Share Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Impact Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-obsidian-900 border border-cyan-800/60 shadow-xl">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold mb-2">
            <TrendingDown className="w-4 h-4" aria-hidden="true" />
            <span>PM2.5 Exposure Reduction</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {impact.estimated_aggregate_pm25_reduction_pct}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Net personal lung inhalation dose drop comparing standard routine against VayuCare protocol.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-obsidian-900 border border-emerald-800/60 shadow-xl">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-2">
            <Award className="w-4 h-4" aria-hidden="true" />
            <span>Indoor AQI Drop</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {impact.estimated_indoor_aqi_drop_points}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Estimated indoor particulate suppression achieved via perimeter sealing and targeted filtration.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/40 to-obsidian-900 border border-purple-800/60 shadow-xl">
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold mb-2">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Household Carbon Cut</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {impact.household_co2_cut_kg_monthly}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Direct monthly greenhouse gas emissions avoided through mass transit and clean heating swaps.
          </p>
        </div>
      </div>

      {/* Vulnerable Member Alerts */}
      <div className="p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-400" aria-hidden="true" />
          <span>Vulnerable Household Member Alerts</span>
        </div>
        <ul className="space-y-2.5">
          {impact.vulnerable_member_alerts.map((alert, idx) => (
            <li
              key={idx}
              className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 leading-relaxed flex items-start space-x-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" aria-hidden="true"></span>
              <span>{alert}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Emergency Medical Escalation Triggers */}
      <div className="p-6 rounded-2xl bg-obsidian-900 border border-red-900/40 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-red-400" aria-hidden="true" />
          <span>Emergency Clinical Escalation Triggers (Immediate Action)</span>
        </div>
        <p className="text-xs text-slate-400">
          Seek emergency medical evaluation immediately if any of the following clinical signs manifest during severe smog episodes:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {impact.emergency_escalation_triggers.map((trigger, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-200 flex items-start space-x-2.5"
            >
              <span className="font-bold text-red-400 flex-shrink-0">{idx + 1}.</span>
              <span>{trigger}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
