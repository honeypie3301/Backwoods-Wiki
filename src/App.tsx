import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import SanitySimulator from "./components/SanitySimulator";
import DimensionFlow from "./components/DimensionFlow";
import AchievementsChecklist from "./components/AchievementsChecklist";
import Entity3DViewer from "./components/Entity3DViewer";
import { ManifestItem, Article } from "./types";
import { parseWikiFormat, extractHeaders, injectHeaderIds, TocItem } from "./wikiParser";
import { 
  Menu, 
  X, 
  ChevronRight, 
  Bookmark, 
  HelpCircle, 
  Flame, 
  AlertOctagon, 
  Skull, 
  History 
} from "lucide-react";

export default function App() {
  const [manifest, setManifest] = useState<ManifestItem[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("home");
  const [activeTab, setActiveTab] = useState<string>("wiki");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [articleContent, setArticleContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Load manifest on mount
  useEffect(() => {
    fetch("/wiki/manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load wiki index manifest");
        return res.json();
      })
      .then((data: ManifestItem[]) => {
        setManifest(data);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg("Could not load the wiki page index. Please verify that the mod assets are built.");
      });
  }, []);

  // Load active article content
  useEffect(() => {
    if (manifest.length === 0 || activeTab !== "wiki") return;

    const activeItem = manifest.find((item) => item.slug === activeSlug);
    if (!activeItem) return;

    setLoading(true);
    setErrorMsg(null);

    fetch(`/wiki/${activeItem.filename}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load page: ${activeItem.title}`);
        return res.text();
      })
      .then((text) => {
        // Parse custom wiki format
        const parsedHtml = parseWikiFormat(text);
        
        // Extract headers for Table of Contents
        const headers = extractHeaders(parsedHtml);
        setToc(headers);

        // Inject IDs into headers to support jump links
        const finalHtml = injectHeaderIds(parsedHtml, headers);
        setArticleContent(finalHtml);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg(`Failed to retrieve article: ${activeItem.title}. The file might be corrupted.`);
        setLoading(false);
      });
  }, [activeSlug, manifest, activeTab]);

  // Handle clicking inside the compiled wiki HTML (intercept page jumps & buttons)
  const handleWikiContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Intercept action button triggers
    const button = target.closest("button");
    if (button && button.getAttribute("data-action") === "switch-tab-dimensions") {
      e.preventDefault();
      setActiveTab("dimensions");
      return;
    }

    // Intercept internal MediaWiki anchor jumps
    const link = target.closest("a");
    if (link) {
      const slug = link.getAttribute("data-wiki-slug");
      const hash = link.getAttribute("data-wiki-hash");

      if (slug) {
        e.preventDefault();
        setActiveSlug(slug);
        setActiveTab("wiki");

        // If there's a hash jump, wait for render and smooth scroll to it
        if (hash) {
          setTimeout(() => {
            const cleanId = hash.replace("#", "").toLowerCase().trim();
            // Try matching either exact id or id starting/containing
            const targetEl = document.querySelector(`[id*="${cleanId}"]`) || document.getElementById(cleanId);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 150);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }
  };

  // Scroll smooth to TOC links
  const handleTocLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const targetEl = document.getElementById(id);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeArticleMeta = manifest.find((item) => item.slug === activeSlug);

  return (
    <div className="flex h-screen bg-[#050303] text-[#e0dcd3] overflow-hidden font-sans select-text">
      
      {/* Sidebar navigation */}
      <Sidebar
        manifest={manifest}
        activeSlug={activeSlug}
        onSelectArticle={setActiveSlug}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content body panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header Panel */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#070505] border-b border-[#221414] shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger menu */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded bg-[#1a0f0f] border border-[#3a1a1a]/60 text-[#c4bfa5] md:hidden cursor-pointer hover:bg-[#2d1212]/50"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb pathing */}
            <div className="flex items-center text-xs font-mono text-[#8e8375] uppercase tracking-wider">
              <span>Backwoods Mod</span>
              <ChevronRight size={12} className="mx-1" />
              <span className="text-[#c4bfa5] font-semibold">
                {activeTab === "wiki" ? (activeArticleMeta?.title || "Encyclopedia") : ""}
                {activeTab === "bestiary" && "3D Entity Bestiary"}
                {activeTab === "sanity" && "Sanity Simulator"}
                {activeTab === "dimensions" && "Dimension Map"}
                {activeTab === "achievements" && "Achievements"}
              </span>
            </div>
          </div>

          {/* Quick-access Mod Credits Banner */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#1a0c0c] border border-[#5c1414]/30 rounded text-[10px] font-mono text-[#ff7043]">
            <Flame size={10} className="animate-pulse" />
            <span>MCreator Custom Code Modifying Tool</span>
          </div>
        </header>

        {/* Dynamic content tab switches */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          
          {activeTab === "wiki" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
              
              {/* Main wiki article reading lane */}
              <article className="xl:col-span-9 space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-[#ff7043] animate-spin" />
                    <span className="text-xs font-mono text-[#8e8375] uppercase tracking-widest">
                      Retrieving log parameters...
                    </span>
                  </div>
                ) : errorMsg ? (
                  <div className="p-6 bg-[#1f0505] border border-red-950/60 rounded-md text-center max-w-md mx-auto space-y-3">
                    <Skull className="text-[#ff5555] mx-auto" size={32} />
                    <h3 className="text-sm font-bold uppercase text-white">Corruption Detected</h3>
                    <p className="text-xs text-[#a4a090] leading-relaxed">{errorMsg}</p>
                  </div>
                ) : (
                  <div 
                    ref={contentContainerRef}
                    onClick={handleWikiContainerClick}
                    dangerouslySetInnerHTML={{ __html: articleContent }}
                    className="prose prose-invert max-w-none wiki-article-body wiki-html-content"
                  />
                )}
              </article>

              {/* Sidebar Outline / Table of Contents (TOC) inside article */}
              {toc.length > 0 && !loading && (
                <div className="hidden xl:block xl:col-span-3 sticky top-6 bg-[#080505] border border-[#221414] p-4 rounded-md">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8e8375] mb-3 flex items-center gap-1.5 font-bold">
                    <Bookmark size={10} />
                    Page Outline
                  </div>
                  <ul className="space-y-2 text-xs">
                    {toc.map((item) => (
                      <li 
                        key={item.id} 
                        style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                      >
                        <a 
                          href={`#${item.id}`}
                          onClick={(e) => handleTocLinkClick(e, item.id)}
                          className="text-[#9c9788] hover:text-[#ff7043] transition-colors leading-relaxed block truncate"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          {activeTab === "bestiary" && <Entity3DViewer />}

          {activeTab === "sanity" && <SanitySimulator />}

          {activeTab === "dimensions" && (
            <DimensionFlow onNavigateToArticle={(slug) => {
              setActiveSlug(slug);
              setActiveTab("wiki");
            }} />
          )}

          {activeTab === "achievements" && <AchievementsChecklist />}

        </div>

      </div>
    </div>
  );
}
