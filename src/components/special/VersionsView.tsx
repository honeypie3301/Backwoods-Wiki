import React from 'react';
import { Calendar, Tag, Sparkles, Activity, ShieldAlert, GitCommit } from 'lucide-react';

interface VersionItem {
  version: string;
  tag: string;
  date: string;
  status: 'scrapped' | 'active' | 'beta';
  highlights: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

export default function VersionsView() {
  const versions: VersionItem[] = [
    {
      version: "The Backwoods v1.5.0",
      tag: "scrapped-2",
      date: "April 26, 2026",
      status: "scrapped",
      highlights: [
        {
          title: "Content Expansion",
          description: "Massive injection of new content including custom biomes, unique food items, specialized tools, decorative/functional blocks, and an entirely new dimension.",
          icon: <Sparkles className="w-4 h-4 text-emerald-400" />
        },
        {
          title: "Mob AI Update",
          description: "Splinters can now swim, removing water as a safe sanctuary from pursuits.",
          icon: <Activity className="w-4 h-4 text-emerald-400" />
        },
        {
          title: "Overhauls & Balance",
          description: "Massive balance adjustments and backend performance passes. Significant design reworks to mechanics within The Loss dimension and how Plaque spreads.",
          icon: <ShieldAlert className="w-4 h-4 text-emerald-500" />
        }
      ]
    },
    {
      version: "The Backwoods v1.4.0",
      tag: "scrapped",
      date: "April 13, 2026",
      status: "scrapped",
      highlights: [
        {
          title: "World Generation & Progression",
          description: "Major framework development on atmospheric sub-dimensions, specialized structural generation, and linear advancement trees.",
          icon: <Sparkles className="w-4 h-4 text-[#709978]" />
        },
        {
          title: "Entity AI Mechanics",
          description: "Implemented specialized freeze and dimension-infection targeting behaviors unique to the Blindspot Splinter.",
          icon: <Activity className="w-4 h-4 text-[#709978]" />
        }
      ]
    }
  ];

  return (
    <div className="space-y-12 py-4 select-text">
      {/* Intro section */}
      <div className="p-5 bg-[#0f1210] border border-[#1c241e] rounded-lg">
        <p className="text-sm text-[#c9d1c9] leading-relaxed">
          Explore the archived version log and development chronicles of the Backwoods. This log captures key historical pre-releases, milestones, and design iterations.
        </p>
      </div>

      {/* Timeline container */}
      <div className="relative pl-6 sm:pl-8 border-l border-[#1a221c]">
        {versions.map((v, index) => (
          <div key={v.version} className="relative mb-12 last:mb-0">
            {/* Dot Indicator */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-[#080a08] border-2 border-[#a9d1b0] shadow-sm shadow-emerald-950/20 z-10">
              <GitCommit className="w-3.5 h-3.5 text-[#a9d1b0]" />
            </div>

            {/* Version Header Card */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#e0e7e0] tracking-tight">
                  {v.version}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#182119] text-[#a9d1b0] border border-[#2e3e31] uppercase">
                  <Tag className="w-2.5 h-2.5" />
                  {v.tag}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1d1414] text-rose-400 border border-[#3e1e1e] uppercase">
                  Archived
                </span>
              </div>

              {/* Date Metadata */}
              <div className="flex items-center gap-1.5 text-xs text-[#5a6b5e] font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>Released: {v.date}</span>
              </div>

              {/* Highlights List */}
              <div className="grid gap-4 mt-4">
                {v.highlights.map((h, hIndex) => (
                  <div 
                    key={hIndex} 
                    className="p-4 bg-[#0c0f0d] border border-[#1a221c] rounded-lg hover:border-[#2e3e31] transition-all duration-300"
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 p-1.5 rounded bg-[#151b16] border border-[#232d25] shrink-0 h-fit">
                        {h.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-bold text-[#e0e7e0]">
                          {h.title}
                        </h4>
                        <p className="text-xs text-[#829285] leading-relaxed">
                          {h.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
