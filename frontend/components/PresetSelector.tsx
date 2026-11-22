"use client";

import React from "react";
import { X, Sparkles, AlertTriangle, Users, Home, Navigation } from "lucide-react";
import { PresetProfile } from "@/lib/api";

interface PresetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  presets: PresetProfile[];
  onSelectPreset: (preset: PresetProfile) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  isOpen,
  onClose,
  presets,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preset-modal-title"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-obsidian-800 bg-obsidian-850">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="preset-modal-title" className="text-lg font-bold text-white">
                Realistic Smog & Demographic Scenarios
              </h2>
              <p className="text-xs text-slate-400">
                Select a benchmark winter scenario to instantly test VayuCare&apos;s tailored recommendations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Close preset scenario selector"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Preset Cards List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {presets.map((preset) => {
            const aqi = preset.profile.aqi;
            const aqiColorClass =
              aqi >= 450
                ? "bg-red-950 text-red-300 border-red-800"
                : aqi >= 300
                ? "bg-purple-950 text-purple-300 border-purple-800"
                : aqi >= 200
                ? "bg-orange-950 text-orange-300 border-orange-800"
                : "bg-amber-950 text-amber-300 border-amber-800";

            return (
              <div
                key={preset.id}
                className="p-5 rounded-xl bg-obsidian-800/80 border border-obsidian-700 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-white">
                      {preset.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${aqiColorClass}`}>
                        AQI {aqi}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-obsidian-700 text-slate-300">
                        {preset.tag}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {preset.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5 bg-obsidian-900/60 px-2.5 py-1.5 rounded-lg border border-obsidian-800">
                      <Users className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                      <span>{preset.profile.household_members.length} Members</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-obsidian-900/60 px-2.5 py-1.5 rounded-lg border border-obsidian-800">
                      <Home className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                      <span className="capitalize">{preset.profile.housing_type.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-obsidian-900/60 px-2.5 py-1.5 rounded-lg border border-obsidian-800">
                      <Navigation className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                      <span className="capitalize">{preset.profile.commute_mode.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-obsidian-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
                    aria-label={`Apply ${preset.title}`}
                  >
                    Load Scenario
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
