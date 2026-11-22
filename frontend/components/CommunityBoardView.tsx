"use client";

import React, { useState } from "react";
import {
  Users,
  ThumbsUp,
  Plus,
  Filter,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingDown,
  X,
  Loader2,
} from "lucide-react";
import {
  CommunityPledgeResponse,
  CommunityPledgeCreate,
  PledgeActionType,
} from "@/lib/api";

interface CommunityBoardViewProps {
  pledges: CommunityPledgeResponse[];
  onUpvote: (pledgeId: string) => Promise<void>;
  onCreatePledge: (pledge: CommunityPledgeCreate) => Promise<void>;
  userCity: string;
}

export const CommunityBoardView: React.FC<CommunityBoardViewProps> = ({
  pledges,
  onUpvote,
  onCreatePledge,
  userCity,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedActionType, setSelectedActionType] = useState<PledgeActionType | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [upvotingIds, setUpvotingIds] = useState<Record<string, boolean>>({});

  // New pledge form state
  const [authorName, setAuthorName] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [city, setCity] = useState<string>(userCity || "New Delhi");
  const [actionType, setActionType] = useState<PledgeActionType>("commute_carpool");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [targetReduction, setTargetReduction] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleUpvote = async (id: string) => {
    setUpvotingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await onUpvote(id);
    } finally {
      setUpvotingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!authorName.trim() || !neighborhood.trim() || !city.trim() || !title.trim() || !description.trim()) {
      setFormError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreatePledge({
        author_name: authorName.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        action_type: actionType,
        title: title.trim(),
        description: description.trim(),
        target_reduction_summary: targetReduction.trim() || "Local emission mitigation",
      });
      setIsModalOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setTargetReduction("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to publish pledge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPledges = pledges.filter((p) => {
    const cityMatch = !selectedCity || p.city.toLowerCase().includes(selectedCity.toLowerCase());
    const actionMatch = selectedActionType === "all" || p.action_type === selectedActionType;
    return cityMatch && actionMatch;
  });

  const getActionBadge = (type: PledgeActionType) => {
    switch (type) {
      case "stop_waste_burning":
        return { label: "Stop Waste Burning", class: "bg-red-950 text-red-300 border-red-800" };
      case "commute_carpool":
        return { label: "Carpool / Transit Shift", class: "bg-cyan-950 text-cyan-300 border-cyan-800" };
      case "iaq_senior_aid":
        return { label: "Senior / Vulnerable Aid", class: "bg-emerald-950 text-emerald-300 border-emerald-800" };
      case "anti_idling_campaign":
        return { label: "Anti-Idling Zone", class: "bg-amber-950 text-amber-300 border-amber-800" };
      case "plant_urban_greenery":
        return { label: "Urban Greenery Buffer", class: "bg-green-950 text-green-300 border-green-800" };
      default:
        return { label: "Clean Cooking", class: "bg-purple-950 text-purple-300 border-purple-800" };
    }
  };

  return (
    <section aria-labelledby="community-heading" className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 id="community-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Community Smog Action Board
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Collective neighborhood initiatives, anti-burning pledges, and carpool pods to clean the air together.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 transition-colors flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Make a community smog action pledge"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Make a Community Pledge</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Filter className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span className="font-semibold">Filter Initiatives:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            placeholder="Search by city..."
            className="px-3 py-1.5 rounded-lg bg-obsidian-800 border border-obsidian-750 text-xs text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Filter pledges by city"
          />

          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value as PledgeActionType | "all")}
            className="px-3 py-1.5 rounded-lg bg-obsidian-800 border border-obsidian-750 text-xs text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Filter pledges by action category"
          >
            <option value="all">All Action Categories</option>
            <option value="stop_waste_burning">Stop Waste Burning</option>
            <option value="commute_carpool">Carpool &amp; Transit</option>
            <option value="iaq_senior_aid">Senior IAQ Aid</option>
            <option value="anti_idling_campaign">Anti-Idling</option>
            <option value="plant_urban_greenery">Greenery</option>
            <option value="clean_cooking_pledge">Clean Cooking</option>
          </select>
        </div>
      </div>

      {/* Pledges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPledges.map((pledge) => {
          const actionBadge = getActionBadge(pledge.action_type);
          const isUpvoting = !!upvotingIds[pledge.id];

          return (
            <article
              key={pledge.id}
              className="rounded-2xl bg-obsidian-900 border border-obsidian-800 p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${actionBadge.class}`}>
                    {actionBadge.label}
                  </span>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>
                      {pledge.neighborhood}, {pledge.city}
                    </span>
                  </div>
                </div>

                <h2 className="text-base font-bold text-white mb-2">
                  {pledge.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {pledge.description}
                </p>

                {/* Target Reduction Impact */}
                <div className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-750 flex items-start space-x-2 text-xs">
                  <TrendingDown className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-emerald-300">Target Direct Impact: </span>
                    <span className="text-slate-200">{pledge.target_reduction_summary}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Author & Upvote */}
              <div className="flex items-center justify-between pt-3 border-t border-obsidian-800 text-xs">
                <span className="text-slate-400">
                  By <span className="text-slate-200 font-semibold">{pledge.author_name}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleUpvote(pledge.id)}
                  disabled={isUpvoting}
                  className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 transition-colors flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
                  aria-label={`Upvote pledge ${pledge.title}, currently has ${pledge.upvotes} upvotes`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{pledge.upvotes}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Modal: Make a Pledge */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pledge-modal-title"
        >
          <div className="relative w-full max-w-lg bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                <h2 id="pledge-modal-title" className="text-lg font-bold text-white">
                  Make a Community Smog Action Pledge
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-800 text-xs text-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label htmlFor="pledge-author" className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Name / Group Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="pledge-author"
                  type="text"
                  required
                  maxLength={60}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Meera &amp; Sector 14 RWA"
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pledge-neighborhood" className="block text-xs font-semibold text-slate-300 mb-1">
                    Neighborhood <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="pledge-neighborhood"
                    type="text"
                    required
                    maxLength={100}
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g. Indirapuram"
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-emerald-400"
                  />
                </div>

                <div>
                  <label htmlFor="pledge-city" className="block text-xs font-semibold text-slate-300 mb-1">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="pledge-city"
                    type="text"
                    required
                    maxLength={80}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pledge-action-type" className="block text-xs font-semibold text-slate-300 mb-1">
                  Action Category
                </label>
                <select
                  id="pledge-action-type"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as PledgeActionType)}
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <option value="stop_waste_burning">Zero Waste &amp; Leaf Burning Patrol</option>
                  <option value="commute_carpool">Neighborhood Carpool / Transit Pod</option>
                  <option value="iaq_senior_aid">Senior &amp; Vulnerable Clean Air Aid</option>
                  <option value="anti_idling_campaign">School Gate Anti-Idling Zone</option>
                  <option value="plant_urban_greenery">Dust Barrier &amp; Urban Greenery</option>
                  <option value="clean_cooking_pledge">Community Clean Cooking Swap</option>
                </select>
              </div>

              <div>
                <label htmlFor="pledge-title" className="block text-xs font-semibold text-slate-300 mb-1">
                  Pledge Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="pledge-title"
                  type="text"
                  required
                  minLength={5}
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Colony Night Guards Electric Heater Drive"
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="pledge-desc" className="block text-xs font-semibold text-slate-300 mb-1">
                  Action Commitment Details <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="pledge-desc"
                  rows={3}
                  required
                  minLength={15}
                  maxLength={600}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly what action is being taken and how neighbors can participate."
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="pledge-impact" className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Direct Impact
                </label>
                <input
                  id="pledge-impact"
                  type="text"
                  maxLength={150}
                  value={targetReduction}
                  onChange={(e) => setTargetReduction(e.target.value)}
                  placeholder="e.g. Eliminates ~200 kg open smoke/night"
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-800 border border-obsidian-700 text-white text-xs focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-obsidian-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-obsidian-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Pledge</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
