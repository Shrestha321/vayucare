"use client";

import React from "react";
import { Wind, ShieldAlert, BookOpen, Layers, BookmarkCheck, Users } from "lucide-react";

export type ActiveTab =
  | "profiler"
  | "routines"
  | "iaq"
  | "swaps"
  | "impact"
  | "community"
  | "saved";

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hasPlan: boolean;
  onOpenPresets: () => void;
  onOpenGuide: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  hasPlan,
  onOpenPresets,
  onOpenGuide,
  savedCount,
}) => {
  return (
    <header className="border-b border-obsidian-700 bg-obsidian-900/90 backdrop-blur-md sticky top-0 z-40">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-obsidian-950 shadow-lg shadow-cyan-500/20">
              <Wind className="w-6 h-6 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Vayu<span className="text-cyan-400">Care</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  GenAI Smog Copilot
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Precision IAQ & Low-Emission Protection for Severe Winter Pollution
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenPresets}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-700 text-cyan-300 border border-cyan-500/30 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Open realistic scenario presets selector"
            >
              <Layers className="w-4 h-4 mr-1.5 text-cyan-400" aria-hidden="true" />
              Presets
            </button>
            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-700 text-emerald-300 border border-emerald-500/30 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Open air quality science and mask guide"
            >
              <BookOpen className="w-4 h-4 mr-1.5 text-emerald-400" aria-hidden="true" />
              Air Science Guide
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav
          className="flex space-x-1 overflow-x-auto py-2 border-t border-obsidian-800/80 scrollbar-none"
          role="tablist"
          aria-label="VayuCare navigation views"
        >
          <button
            role="tab"
            aria-selected={activeTab === "profiler"}
            aria-controls="tab-content"
            onClick={() => onTabChange("profiler")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "profiler"
                ? "bg-cyan-500 text-obsidian-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            Household Profiler
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "routines"}
            aria-controls="tab-content"
            disabled={!hasPlan}
            onClick={() => onTabChange("routines")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              !hasPlan
                ? "text-slate-600 cursor-not-allowed"
                : activeTab === "routines"
                ? "bg-cyan-500 text-obsidian-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            Daily Routines
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "iaq"}
            aria-controls="tab-content"
            disabled={!hasPlan}
            onClick={() => onTabChange("iaq")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              !hasPlan
                ? "text-slate-600 cursor-not-allowed"
                : activeTab === "iaq"
                ? "bg-cyan-500 text-obsidian-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            Room IAQ Hacks
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "swaps"}
            aria-controls="tab-content"
            disabled={!hasPlan}
            onClick={() => onTabChange("swaps")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              !hasPlan
                ? "text-slate-600 cursor-not-allowed"
                : activeTab === "swaps"
                ? "bg-cyan-500 text-obsidian-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            Sustainable Swaps
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "impact"}
            aria-controls="tab-content"
            disabled={!hasPlan}
            onClick={() => onTabChange("impact")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              !hasPlan
                ? "text-slate-600 cursor-not-allowed"
                : activeTab === "impact"
                ? "bg-cyan-500 text-obsidian-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            Direct Impact
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "community"}
            aria-controls="tab-content"
            onClick={() => onTabChange("community")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center space-x-1.5 transition-all ${
              activeTab === "community"
                ? "bg-emerald-500 text-obsidian-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Community Board</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "saved"}
            aria-controls="tab-content"
            onClick={() => onTabChange("saved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center space-x-1.5 transition-all ${
              activeTab === "saved"
                ? "bg-cyan-500 text-obsidian-950 font-bold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-obsidian-800"
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Saved Plans ({savedCount})</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
