import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Tag, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  GitCommit, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Archive, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Box,
  FileCode,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import UpdatedFrame from '../UpdatedFrame';

export interface ModrinthFile {
  id: string;
  url: string;
  filename: string;
  primary: boolean;
  size: number;
  hashes: {
    sha1?: string;
    sha512?: string;
  };
}

export interface ModrinthVersion {
  id: string;
  project_id: string;
  name: string;
  version_number: string;
  game_versions: string[];
  loaders: string[];
  date_published: string;
  downloads: number;
  version_type: 'release' | 'beta' | 'alpha';
  changelog?: string;
  files: ModrinthFile[];
}

export interface ArchivedVersion {
  version: string;
  tag: string;
  date: string;
  status: 'scrapped';
  highlights: {
    title: string;
    description: string;
  }[];
}

const ARCHIVED_VERSIONS: ArchivedVersion[] = [
  {
    version: "The Backwoods v1.5.0",
    tag: "scrapped-2",
    date: "April 26, 2026",
    status: "scrapped",
    highlights: [
      {
        title: "Content Expansion",
        description: "Massive injection of new content including custom biomes, unique food items, specialized tools, decorative/functional blocks, and an entirely new dimension."
      },
      {
        title: "Mob AI Update",
        description: "Splinters can now swim, removing water as a safe sanctuary from pursuits."
      },
      {
        title: "Overhauls & Balance",
        description: "Massive balance adjustments and backend performance passes. Significant design reworks to mechanics within The Loss dimension and how Plaque spreads."
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
        description: "Major framework development on atmospheric sub-dimensions, specialized structural generation, and linear advancement trees."
      },
      {
        title: "Entity AI Mechanics",
        description: "Implemented specialized freeze and dimension-infection targeting behaviors unique to the Blindspot Splinter."
      }
    ]
  }
];

// Offline snapshot fallback
const FALLBACK_MODRINTH_VERSIONS: ModrinthVersion[] = [
  {
    id: "fpHqAaAq",
    project_id: "vOBTyVQ6",
    name: "Backwoods 1.7.0",
    version_number: "1.7.0",
    game_versions: ["1.21.1"],
    loaders: ["neoforge"],
    date_published: "2026-06-28T09:23:44.249216Z",
    downloads: 1420,
    version_type: "release",
    changelog: "New Content\n\n* 1 feature in the petrified weald.\n* 4 entities\n* 1 item\n* 3 features in the Grain\n* 1 dimension\n* 1 biome\n* 1 block\n* 2 commands\n* 5 features in the new dimension.\n\nChanges\n\n* Tweaked Rot AI\n* Scandere wood now drops dirt by 100% chance.\n* The mod's wood can now be used as fuel\n* Compatibility for tree physics mod\n* Compatibility for alexs caves mod\n* Removed mineshaft generation in the Grain biome.\n* Added complex AI states (Silent, Stalk, Hunt, Hivemind) to some entities\n* Igniter durability now won't be consumed on creative mode.\n* Adjusted spawning condition of Blindspot splinter\n* Rebalanced entity spawning to reduce excessively long periods without encounters\n* Dying in the grain won't take you back to the world.",
    files: [
      {
        id: "v9vP2y4f",
        url: "https://cdn.modrinth.com/data/vOBTyVQ6/versions/fpHqAaAq/the_backwoods-1.7.0-neoforge-1.21.1.jar",
        filename: "the_backwoods-1.7.0-neoforge-1.21.1.jar",
        primary: true,
        size: 40580922,
        hashes: {}
      }
    ]
  },
  {
    id: "igXUTezP",
    project_id: "vOBTyVQ6",
    name: "Backwoods 1.6.0",
    version_number: "1.6.0",
    game_versions: ["1.21.8"],
    loaders: ["neoforge"],
    date_published: "2026-05-18T10:14:02.812391Z",
    downloads: 894,
    version_type: "release",
    changelog: "Updated to Minecraft 1.21.8 NeoForge.\n\n* Major structural generation refinements\n* Fixed crash on dimension travel\n* Entity bounding box corrections\n* Improved sound system spatial falloff",
    files: [
      {
        id: "7k56iR9p",
        url: "https://cdn.modrinth.com/data/vOBTyVQ6/versions/igXUTezP/the_backwoods-1.6.0-neoforge-1.21.8.jar",
        filename: "the_backwoods-1.6.0-neoforge-1.21.8.jar",
        primary: true,
        size: 42551305,
        hashes: {}
      }
    ]
  },
  {
    id: "MC4nEJjm",
    project_id: "vOBTyVQ6",
    name: "Backwoods 1.6.0",
    version_number: "1.6.0",
    game_versions: ["1.20.1"],
    loaders: ["forge"],
    date_published: "2026-05-15T14:57:48.942908Z",
    downloads: 7117,
    version_type: "release",
    changelog: "Minecraft 1.20.1 Forge port and balance optimizations.\n\n* Compatibility patches for JEI and Curios\n* Memory footprint reduction during chunk meshing",
    files: [
      {
        id: "CFtLwRM4",
        url: "https://cdn.modrinth.com/data/vOBTyVQ6/versions/MC4nEJjm/the_backwoods-1.6.0-forge-1.20.1.jar",
        filename: "the_backwoods-1.6.0-forge-1.20.1.jar",
        primary: true,
        size: 43212761,
        hashes: {}
      }
    ]
  }
];

function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// Simple parser for changelog text (markdown bullet points and bold tags)
function renderChangelog(text?: string) {
  if (!text) return <p className="text-xs text-[#5a6b5e] italic">No changelog provided.</p>;
  
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs text-[#a3ada3] font-mono leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;
        
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#a9d1b0] select-none mt-1">•</span>
              <span>{content}</span>
            </div>
          );
        }
        
        if (trimmed.endsWith(':') || trimmed.toLowerCase() === 'new content' || trimmed.toLowerCase() === 'changes') {
          return (
            <div key={idx} className="font-bold text-[#e0e7e0] font-serif uppercase tracking-wider pt-2 pb-0.5 text-[11px] border-b border-[#1c241e]">
              {trimmed}
            </div>
          );
        }

        return <div key={idx}>{trimmed}</div>;
      })}
    </div>
  );
}

export default function VersionsView() {
  const [modrinthVersions, setModrinthVersions] = useState<ModrinthVersion[]>(FALLBACK_MODRINTH_VERSIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'modrinth' | 'archived'>('all');
  const [loaderFilter, setLoaderFilter] = useState<'all' | 'neoforge' | 'forge'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Expandable changelogs
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleChangelog = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://api.modrinth.com/v2/project/backwoods/version', {
        headers: {
          'User-Agent': 'BackwoodsWiki/1.0 (https://github.com/honeypie3301/Backwoods-Wiki)'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ModrinthVersion[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setModrinthVersions(data);
        setIsLive(true);
        setLastUpdated(new Date());
        try {
          localStorage.setItem('backwoods_modrinth_versions_cache', JSON.stringify({
            timestamp: Date.now(),
            data
          }));
        } catch {
          // Ignore localStorage errors
        }
      }
    } catch {
      // Try local cache fallback
      try {
        const cached = localStorage.getItem('backwoods_modrinth_versions_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.data)) {
            setModrinthVersions(parsed.data);
            setLastUpdated(new Date(parsed.timestamp));
          }
        }
      } catch {
        // Fall back to bundled static snapshot
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  // Filtered Modrinth versions
  const filteredModrinth = useMemo(() => {
    return modrinthVersions.filter(v => {
      // Loader match
      if (loaderFilter !== 'all') {
        const hasLoader = v.loaders.some(l => l.toLowerCase() === loaderFilter);
        if (!hasLoader) return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesVer = v.version_number.toLowerCase().includes(q);
        const matchesChangelog = (v.changelog || '').toLowerCase().includes(q);
        const matchesGame = v.game_versions.some(gv => gv.includes(q));
        if (!matchesName && !matchesVer && !matchesChangelog && !matchesGame) return false;
      }
      return true;
    });
  }, [modrinthVersions, loaderFilter, searchQuery]);

  // Filtered Archived versions
  const filteredArchived = useMemo(() => {
    return ARCHIVED_VERSIONS.filter(v => {
      if (loaderFilter !== 'all') {
        // Archived versions were developed prior to the loader split
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesVer = v.version.toLowerCase().includes(q);
        const matchesTag = v.tag.toLowerCase().includes(q);
        const matchesHighlights = v.highlights.some(h => 
          h.title.toLowerCase().includes(q) || h.description.toLowerCase().includes(q)
        );
        if (!matchesVer && !matchesTag && !matchesHighlights) return false;
      }
      return true;
    });
  }, [loaderFilter, searchQuery]);

  const totalModrinthCount = modrinthVersions.length;
  const totalArchivedCount = ARCHIVED_VERSIONS.length;

  return (
    <UpdatedFrame id="versions_modrinth_hybrid" isUpdated={true}>
      <div className="space-y-8 py-2 select-text">
        {/* Header Overview Card */}
        <div className="p-5 bg-[#0f1210] border border-[#1c241e] rounded-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#e0e7e0] tracking-wide">
                  Version Archive &amp; Release Log
                </h2>
                {isLive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    LIVE MODRINTH
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1d1b14] text-amber-300 border border-amber-800/60">
                    SNAPSHOT
                  </span>
                )}
              </div>
              <p className="text-xs text-[#a3ada3] leading-relaxed max-w-2xl font-sans">
                Official release versions synchronized via the Modrinth REST API alongside preserved internal pre-release milestone chronicles.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <button
                onClick={fetchVersions}
                disabled={isLoading}
                title="Refresh releases from Modrinth"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b15] hover:bg-[#1a251c] text-[#a9d1b0] border border-[#2a382c] rounded-lg text-xs font-mono transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Syncing...' : 'Sync Modrinth'}</span>
              </button>

              <a
                href="https://modrinth.com/mod/backwoods/versions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-mono transition-all"
              >
                <span>Modrinth Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#1a231c]">
            <div className="p-2.5 bg-[#090c0a] border border-[#171e18] rounded-lg">
              <span className="text-[10px] font-mono text-[#5a6b5e] uppercase block">Latest Build</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {modrinthVersions[0]?.version_number || 'v1.7.0'}
              </span>
            </div>
            <div className="p-2.5 bg-[#090c0a] border border-[#171e18] rounded-lg">
              <span className="text-[10px] font-mono text-[#5a6b5e] uppercase block">Modrinth Releases</span>
              <span className="text-xs font-mono font-bold text-[#e0e7e0]">
                {totalModrinthCount} builds
              </span>
            </div>
            <div className="p-2.5 bg-[#090c0a] border border-[#171e18] rounded-lg">
              <span className="text-[10px] font-mono text-[#5a6b5e] uppercase block">Scrapped Archives</span>
              <span className="text-xs font-mono font-bold text-rose-400">
                {totalArchivedCount} milestones
              </span>
            </div>
            <div className="p-2.5 bg-[#090c0a] border border-[#171e18] rounded-lg">
              <span className="text-[10px] font-mono text-[#5a6b5e] uppercase block">Primary Platform</span>
              <span className="text-xs font-mono font-bold text-[#a9d1b0]">
                NeoForge 1.21.1
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#0a0d0b] border border-[#171e18] rounded-xl">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 font-bold'
                  : 'bg-[#121813] text-[#829285] hover:text-[#e0e7e0] border border-[#1d261e]'
              }`}
            >
              All Versions ({totalModrinthCount + (loaderFilter === 'all' ? totalArchivedCount : 0)})
            </button>
            <button
              onClick={() => setActiveTab('modrinth')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'modrinth'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 font-bold'
                  : 'bg-[#121813] text-[#829285] hover:text-[#e0e7e0] border border-[#1d261e]'
              }`}
            >
              <HardDrive className="w-3 h-3" />
              Official Releases ({totalModrinthCount})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'archived'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/70 font-bold'
                  : 'bg-[#121813] text-[#829285] hover:text-[#e0e7e0] border border-[#1d261e]'
              }`}
            >
              <Archive className="w-3 h-3" />
              Internal Archives ({totalArchivedCount})
            </button>
          </div>

          {/* Secondary Controls: Loader filter + search query */}
          <div className="flex items-center gap-2">
            {/* Loader Filter */}
            <div className="flex items-center gap-1 bg-[#121813] border border-[#1d261e] rounded-lg p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setLoaderFilter('all')}
                className={`px-2 py-1 rounded transition-colors ${
                  loaderFilter === 'all' ? 'bg-[#1c271e] text-[#a9d1b0] font-bold' : 'text-[#5a6b5e] hover:text-[#c9d1c9]'
                }`}
              >
                All Loaders
              </button>
              <button
                onClick={() => setLoaderFilter('neoforge')}
                className={`px-2 py-1 rounded transition-colors ${
                  loaderFilter === 'neoforge' ? 'bg-[#1c271e] text-[#a9d1b0] font-bold' : 'text-[#5a6b5e] hover:text-[#c9d1c9]'
                }`}
              >
                NeoForge
              </button>
              <button
                onClick={() => setLoaderFilter('forge')}
                className={`px-2 py-1 rounded transition-colors ${
                  loaderFilter === 'forge' ? 'bg-[#1c271e] text-[#a9d1b0] font-bold' : 'text-[#5a6b5e] hover:text-[#c9d1c9]'
                }`}
              >
                Forge
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative flex items-center min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5a6b5e] pointer-events-none" />
              <input
                type="text"
                placeholder="Filter version / changelog..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#121713] border border-[#1e2520] rounded-lg py-1 pl-8 pr-2 text-xs text-[#c9d1c9] placeholder-[#5a6b5e] focus:outline-none focus:border-[#709978]"
              />
            </div>
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="relative pl-6 sm:pl-8 border-l border-[#1a221c] space-y-10">
          {/* 1. Official Modrinth Releases */}
          {(activeTab === 'all' || activeTab === 'modrinth') && (
            <>
              {filteredModrinth.map((v) => {
                const primaryFile = v.files.find(f => f.primary) || v.files[0];
                const isExpanded = !!expandedIds[v.id];
                const gameVerStr = v.game_versions.join(', ');
                const loaderStr = v.loaders.join(', ');

                return (
                  <div key={v.id} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-[#080a08] border-2 border-emerald-500 shadow-sm shadow-emerald-950/20 z-10">
                      <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                    </div>

                    {/* Version Card */}
                    <div className="bg-[#0b0f0c] border border-[#1a241c] hover:border-[#2b3a2e] rounded-xl p-5 space-y-4 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#e0e7e0] tracking-tight">
                              {v.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#142318] text-emerald-300 border border-emerald-800 uppercase">
                              <Tag className="w-2.5 h-2.5" />
                              v{v.version_number}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#121e15] text-[#8cd99d] border border-[#233827]">
                              {loaderStr.toUpperCase()} • {gameVerStr}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/70 text-emerald-300 border border-emerald-700/80">
                              Official
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#5a6b5e] font-mono pt-0.5">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(v.date_published)}
                            </span>
                            <span className="flex items-center gap-1.5 text-[#728574]">
                              <Download className="w-3.5 h-3.5" />
                              {v.downloads.toLocaleString()} downloads
                            </span>
                            {primaryFile && (
                              <span className="flex items-center gap-1.5 text-[#5a6b5e]">
                                <FileCode className="w-3.5 h-3.5" />
                                {formatBytes(primaryFile.size)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Direct Download Button */}
                        {primaryFile && (
                          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                            <a
                              href={primaryFile.url}
                              download
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172419] hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 border border-emerald-700/60 rounded-lg text-xs font-mono font-bold transition-all shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download .jar</span>
                            </a>
                            <a
                              href={`https://modrinth.com/mod/backwoods/version/${v.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Inspect on Modrinth"
                              className="p-1.5 bg-[#101612] hover:bg-[#19221b] text-[#5a6b5e] hover:text-[#a9d1b0] border border-[#1e2720] rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Expandable Changelog Accordion */}
                      {v.changelog && (
                        <div className="pt-2 border-t border-[#18201a]">
                          <button
                            onClick={() => toggleChangelog(v.id)}
                            className="flex items-center justify-between w-full text-left py-1 text-xs font-mono text-[#719277] hover:text-[#a9d1b0] transition-colors"
                          >
                            <span className="flex items-center gap-1.5 font-semibold">
                              <FileCode className="w-3.5 h-3.5" />
                              {isExpanded ? 'Hide Release Changelog' : 'View Release Changelog'}
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-3 p-4 bg-[#080b09] border border-[#172018] rounded-lg">
                              {renderChangelog(v.changelog)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* 2. Archived / Scrapped Versions */}
          {(activeTab === 'all' || activeTab === 'archived') && (
            <>
              {filteredArchived.map((v) => (
                <div key={v.version} className="relative group">
                  {/* Timeline Node */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-[#080a08] border-2 border-rose-500/80 shadow-sm shadow-rose-950/20 z-10">
                    <Archive className="w-3.5 h-3.5 text-rose-400" />
                  </div>

                  {/* Version Card */}
                  <div className="bg-[#0b0e0c] border border-rose-950/40 hover:border-rose-900/60 rounded-xl p-5 space-y-4 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#e0e7e0] tracking-tight">
                            {v.version}
                          </h3>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1d1616] text-rose-300 border border-rose-900/60 uppercase">
                            <Tag className="w-2.5 h-2.5" />
                            {v.tag}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1d1414] text-rose-400 border border-[#3e1e1e] uppercase">
                            Archived Milestone
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[#5a6b5e] font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Recorded Milestone: {v.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Developmental Highlights */}
                    <div className="grid gap-3 pt-2">
                      {v.highlights.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="p-3.5 bg-[#080a08] border border-[#1b221c] rounded-lg"
                        >
                          <div className="flex gap-3">
                            <div className="mt-0.5 p-1 rounded bg-[#131a14] border border-[#202b22] shrink-0 h-fit">
                              {hIdx === 0 && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                              {hIdx === 1 && <Activity className="w-3.5 h-3.5 text-emerald-400" />}
                              {hIdx === 2 && <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />}
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="font-serif text-xs font-bold text-[#e0e7e0]">
                                {h.title}
                              </h4>
                              <p className="text-xs text-[#829285] leading-relaxed font-sans">
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
            </>
          )}

          {/* Empty State */}
          {filteredModrinth.length === 0 && filteredArchived.length === 0 && (
            <div className="p-8 text-center bg-[#0d110e] border border-[#1c241e] rounded-xl space-y-2">
              <p className="text-sm text-[#a3ada3] font-mono">No matching versions found.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLoaderFilter('all');
                  setActiveTab('all');
                }}
                className="text-xs text-emerald-400 hover:underline font-mono"
              >
                Clear active filters
              </button>
            </div>
          )}
        </div>
      </div>
    </UpdatedFrame>
  );
}
