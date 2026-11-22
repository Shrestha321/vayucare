"use client";

import React, { useState } from "react";
import {
  Home,
  Wind,
  Shield,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
} from "lucide-react";
import { IAQRoomHack, RoomName, ConfidenceLevel } from "@/lib/api";

interface IAQHacksViewProps {
  hacks: IAQRoomHack[];
  city: string;
}

export const IAQHacksView: React.FC<IAQHacksViewProps> = ({ hacks, city }) => {
  const [selectedRoomIdx, setSelectedRoomIdx] = useState<number>(0);

  const activeHack = hacks[selectedRoomIdx] || hacks[0];

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
    <section aria-labelledby="iaq-heading" className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 id="iaq-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Indoor Air Quality (IAQ) Blueprint
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Room-by-room physical interventions, perimeter sealing, and filtration placement to create a clean air sanctuary in {city}.
        </p>
      </div>

      {/* Room Tabs */}
      <div
        className="flex space-x-2 overflow-x-auto pb-3 mb-6 scrollbar-none"
        role="tablist"
        aria-label="Room selection tabs"
      >
        {hacks.map((hack, idx) => {
          const isSelected = selectedRoomIdx === idx;
          return (
            <button
              key={idx}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedRoomIdx(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-2 ${
                isSelected
                  ? "bg-cyan-500 text-obsidian-950 border-cyan-400 shadow-md shadow-cyan-500/20"
                  : "bg-obsidian-900 text-slate-300 border-obsidian-800 hover:border-obsidian-700 hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{hack.room_display_title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Room Protocol Card */}
      {activeHack && (
        <article className="bg-obsidian-900 border border-obsidian-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-obsidian-800 pb-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Room IAQ Action Plan
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {activeHack.room_display_title}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Impact: {activeHack.indoor_pm25_drop_pct_range}</span>
              </span>
            </div>
          </div>

          {/* Core Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ventilation vs Sealing */}
            <div className="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs mb-2">
                <Wind className="w-4 h-4" aria-hidden="true" />
                <span>Ventilation Timing vs. Sealing</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeHack.ventilation_rule}
              </p>
            </div>

            {/* Purifier Placement & DIY Strategy */}
            <div className="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs mb-2">
                <Layers className="w-4 h-4" aria-hidden="true" />
                <span>Purification Strategy &amp; Airflow Vector</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeHack.purifier_strategy}
              </p>
            </div>

            {/* Dust & Chemical Control */}
            <div className="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs mb-2">
                <Shield className="w-4 h-4" aria-hidden="true" />
                <span>Dust Control &amp; Zero Smoke Rule</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeHack.dust_and_chemical_control}
              </p>
            </div>

            {/* Cooking Swap (If Kitchen / Living) */}
            {activeHack.kitchen_cooking_swap && (
              <div className="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750">
                <div className="flex items-center space-x-2 text-orange-400 font-bold text-xs mb-2">
                  <Flame className="w-4 h-4" aria-hidden="true" />
                  <span>Cooking Aerosol Containment</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeHack.kitchen_cooking_swap}
                </p>
              </div>
            )}
          </div>

          {/* Transparent Reasoning Card */}
          <div className="p-5 rounded-xl bg-cyan-950/30 border border-cyan-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Why This Works (IAQ Physics &amp; Mechanics)</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${getConfidenceBadge(activeHack.confidence_level)}`}>
                {activeHack.confidence_level} Confidence
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeHack.mechanism}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-cyan-900/50 text-[11px]">
              <div>
                <span className="font-semibold text-cyan-300">Target IAQ Drop: </span>
                <span className="text-white font-bold">{activeHack.indoor_pm25_drop_pct_range}</span>
              </div>
              <div>
                <span className="font-semibold text-cyan-300">Model Assumptions: </span>
                <span className="text-slate-300">{activeHack.assumptions}</span>
              </div>
            </div>
          </div>
        </article>
      )}
    </section>
  );
};
