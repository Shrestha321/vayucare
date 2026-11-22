"use client";

import React from "react";
import { X, BookOpen, ShieldCheck, Wind, HelpCircle, Layers, CheckCircle2 } from "lucide-react";

interface AirQualityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AirQualityGuideModal: React.FC<AirQualityGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-obsidian-800 bg-obsidian-850">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="guide-modal-title" className="text-lg font-bold text-white">
                VayuCare Air Quality Science &amp; Mask Guide
              </h2>
              <p className="text-xs text-slate-400">
                Evidence-based reference on particulate physics, winter inversions, and effective filtration.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800"
            aria-label="Close air quality science guide"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Micron Particle Scales */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center space-x-2">
              <Wind className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>1. Particulate Matter Scales: PM2.5 vs PM10</span>
            </h3>
            <p>
              Particulate matter is classified by aerodynamic diameter in micrometers (µm):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-750">
                <span className="font-bold text-white block">PM10 (Coarse)</span>
                <span className="text-[11px] text-slate-400">Pollen, road dust, mold (&le; 10 µm).</span>
                <p className="text-[11px] text-slate-300 mt-1">
                  Trapped in the upper respiratory tract (nasal cilia and pharynx).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-850 border border-cyan-800/60">
                <span className="font-bold text-cyan-300 block">PM2.5 (Fine Respirable)</span>
                <span className="text-[11px] text-slate-400">Combustion smoke, nitrates (&le; 2.5 µm).</span>
                <p className="text-[11px] text-slate-300 mt-1">
                  Penetrates deep into alveolar sacs, entering bloodstream microvasculature.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-750">
                <span className="font-bold text-amber-300 block">Human Hair (~70 µm)</span>
                <span className="text-[11px] text-slate-400">Visual benchmark for size.</span>
                <p className="text-[11px] text-slate-300 mt-1">
                  A single human hair is ~30x larger than a PM2.5 particulate.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Winter Thermal Inversion Trap */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>2. Why Severe Smog Spikes in Winter (Thermal Inversion)</span>
            </h3>
            <p>
              Under normal daytime conditions, warm air near the ground rises and disperses pollutants vertically.
              During cold winter nights and early mornings, radiative cooling causes the ground surface to chill faster than the air above.
              A layer of warmer, lighter air caps the cooler, denser air below, effectively sealing vehicle exhaust,
              stubble burning smoke, and construction dust into a shallow ground-level basin 50 to 150 meters high.
            </p>
          </section>

          {/* Section 3: Mask Standards */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-purple-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" aria-hidden="true" />
              <span>3. Respirator Ratings: N95/FFP2 vs Cloth / Surgical</span>
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-750 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-bold text-white">N95 / FFP2 / KF94 (95%+ Filtration Efficiency): </span>
                  Utilizes electrostatically charged meltblown polypropylene fibers that attract sub-micron particles via diffusion and impaction.
                  A snug perimeter nose pinch is mandatory; facial hair or gaps drop real filtration from 95% down to &lt;50%.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-750 flex items-start space-x-2.5">
                <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-bold text-white">Cloth &amp; Surgical Masks (&lt;20% Filtration for PM2.5): </span>
                  Designed only for fluid splash containment; fine aerosols flow around cheek and nose gaps with zero aerodynamic resistance.
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Corsi-Rosenthal Box Specs */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>4. DIY Corsi-Rosenthal Box (Affordable Clean Air)</span>
            </h3>
            <p>
              A scientifically validated open-source air cleaner built with a 20-inch box fan and four MERV 13 furnace filters taped into a cube.
              It delivers over 250 - 400 CFM clean air delivery rate (CADR) at a fraction of commercial purifier costs,
              making clean air accessible to ground-floor homes and low-budget households.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
