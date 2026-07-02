import React from "react";
import { ManifestItem } from "../types";
import { 
  Search, 
  BookOpen, 
  ShieldAlert, 
  Trophy, 
  GitFork, 
  Box, 
  Compass, 
  ChevronRight,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  manifest: ManifestItem[];
  activeSlug: string;
  onSelectArticle: (slug: string) => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  manifest,
  activeSlug,
  onSelectArticle,
  activeTab,
  onChangeTab,
  searchQuery,
  onSearchChange,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  // Group articles by category
  const categories = manifest.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ManifestItem[]>);

  // Filter articles based on search query
  const filteredManifest = manifest.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = filteredManifest.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ManifestItem[]>);

  const handleArticleClick = (slug: string) => {
    onSelectArticle(slug);
    onChangeTab("wiki");
    onCloseMobile();
  };

  const handleTabClick = (tab: string) => {
    onChangeTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0707] border-r border-[#221414] text-[#c4bfa5]">
      {/* Wiki Title */}
      <div className="p-6 border-b border-[#221414] bg-[#0c0808]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#441111]/30 border border-[#7c1c1c]/50 rounded-lg text-[#ff5555]">
            <Compass size={22} />
          </div>
          <div>
            <h2 className="text-md font-extrabold tracking-wider text-white uppercase font-sans">
              Backwoods Wiki
            </h2>
            <p className="text-xs text-[#8e8375] font-mono uppercase tracking-widest mt-0.5">
              Horror Index
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs / Tools */}
      <div className="px-4 py-4 border-b border-[#221414] bg-[#0a0707]">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8e8375] px-2 mb-2">
          Interactive Tools
        </div>
        <div className="space-y-1">
          <button
            id="tab-wiki"
            onClick={() => handleTabClick("wiki")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded font-medium transition-all ${
              activeTab === "wiki"
                ? "bg-[#2d1212]/50 text-white border-l-2 border-[#ff7043]"
                : "hover:bg-[#1a0f0f] text-[#a4a090] hover:text-white"
            }`}
          >
            <BookOpen size={16} className={activeTab === "wiki" ? "text-[#ff7043]" : ""} />
            <span>Encyclopedia</span>
          </button>

          <button
            id="tab-bestiary"
            onClick={() => handleTabClick("bestiary")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded font-medium transition-all ${
              activeTab === "bestiary"
                ? "bg-[#2d1212]/50 text-white border-l-2 border-[#ff7043]"
                : "hover:bg-[#1a0f0f] text-[#a4a090] hover:text-white"
            }`}
          >
            <Box size={16} className={activeTab === "bestiary" ? "text-[#ff7043]" : ""} />
            <div className="flex items-center justify-between w-full">
              <span>3D Entity Bestiary</span>
              <span className="text-[9px] font-mono bg-[#7c1c1c]/40 text-[#ffab91] px-1.5 py-0.5 rounded uppercase tracking-wider">3D</span>
            </div>
          </button>

          <button
            id="tab-sanity"
            onClick={() => handleTabClick("sanity")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded font-medium transition-all ${
              activeTab === "sanity"
                ? "bg-[#2d1212]/50 text-white border-l-2 border-[#ff7043]"
                : "hover:bg-[#1a0f0f] text-[#a4a090] hover:text-white"
            }`}
          >
            <ShieldAlert size={16} className={activeTab === "sanity" ? "text-[#ff5555]" : ""} />
            <span>Sanity Simulator</span>
          </button>

          <button
            id="tab-dimensions"
            onClick={() => handleTabClick("dimensions")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded font-medium transition-all ${
              activeTab === "dimensions"
                ? "bg-[#2d1212]/50 text-white border-l-2 border-[#ff7043]"
                : "hover:bg-[#1a0f0f] text-[#a4a090] hover:text-white"
            }`}
          >
            <GitFork size={16} className={activeTab === "dimensions" ? "text-[#ffab91]" : ""} />
            <span>Dimension Map</span>
          </button>

          <button
            id="tab-achievements"
            onClick={() => handleTabClick("achievements")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded font-medium transition-all ${
              activeTab === "achievements"
                ? "bg-[#2d1212]/50 text-white border-l-2 border-[#ff7043]"
                : "hover:bg-[#1a0f0f] text-[#a4a090] hover:text-white"
            }`}
          >
            <Trophy size={16} className={activeTab === "achievements" ? "text-[#ffccbc]" : ""} />
            <span>Achievements</span>
          </button>
        </div>
      </div>

      {/* Article Search */}
      <div className="px-4 py-3 bg-[#0a0707] border-b border-[#221414]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-[#8e8375]" />
          <input
            id="wiki-search-input"
            type="text"
            placeholder="Search encyclopedia..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#160e0e] border border-[#3a1a1a]/40 focus:border-[#7c1c1c] text-white rounded outline-none placeholder-[#8e8375] font-sans transition-all"
          />
        </div>
      </div>

      {/* Browse Articles */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-950">
        {Object.keys(filteredCategories).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-[#8e8375] font-mono uppercase">No results found</p>
          </div>
        ) : (
          Object.entries(filteredCategories).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8e8375] px-2 font-semibold">
                {category}
              </h4>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = activeTab === "wiki" && activeSlug === item.slug;
                  return (
                    <button
                      key={item.slug}
                      id={`sidebar-article-${item.slug}`}
                      onClick={() => handleArticleClick(item.slug)}
                      className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded text-xs transition-all ${
                        isActive
                          ? "bg-[#331111]/40 border-r border-[#ff7043] text-white font-medium shadow-md"
                          : "hover:bg-[#1a0f0f]/50 text-[#9c9788] hover:text-[#e0dcd3]"
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      <ChevronRight size={12} className={`opacity-40 shrink-0 ml-1 ${isActive ? "text-[#ff7043] opacity-80" : ""}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#221414] bg-[#0c0808] text-center">
        <p className="text-[9px] font-mono text-[#8e8375] tracking-widest uppercase">
          Backwoods v1.21.x
        </p>
        <p className="text-[9px] font-sans text-[#5c4a4a] mt-1">
          Survival Horror Mod Index
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0 border-r border-[#221414] z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Mobile Drawer Drawer */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 max-w-[80vw] z-50 md:hidden transition-transform duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
