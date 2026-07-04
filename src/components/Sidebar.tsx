import React, { useState } from 'react';
import { 
  Search, 
  X, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Compass, 
  Sparkles, 
  Skull, 
  Activity, 
  HelpCircle,
  Folder,
  FileText
} from 'lucide-react';
import { WikiArticle } from '../types';

interface SidebarProps {
  articles: WikiArticle[];
  currentSlug: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  articles,
  currentSlug,
  searchQuery,
  setSearchQuery,
  isOpen,
  onClose
}: SidebarProps) {
  // Keep track of which categories are collapsed. Default all open.
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Group articles by category
  const categories = React.useMemo(() => {
    const groups: Record<string, WikiArticle[]> = {};
    articles.forEach(article => {
      const cat = article.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(article);
    });
    return groups;
  }, [articles]);

  // Get icons based on category or article title
  const getArticleIcon = (slug: string) => {
    switch (slug) {
      case 'home':
        return <BookOpen className="w-4 h-4 text-[#709978]" />;
      case 'sanity':
        return <Skull className="w-4 h-4 text-emerald-500" />;
      case 'dimensions':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'entities':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'items':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'terminated':
        return <Skull className="w-4 h-4 text-red-500 animate-pulse" />;
      default:
        return <FileText className="w-4 h-4 text-[#5a6b5e]" />;
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 z-40
          w-[280px] h-screen
          bg-[#0c0f0d] border-r border-[#1a221c]
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header Branding */}
        <div className="p-5 border-b border-[#1a221c] flex items-center justify-between bg-[#0e120f]">
          <a href="#/wiki/home" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-8 h-8 rounded bg-[#1e2720] border border-[#2d3a2f] flex items-center justify-center text-[#a9d1b0] font-serif font-bold text-lg group-hover:bg-[#253228] transition-colors">
              B
            </div>
            <div>
              <h1 className="font-serif font-bold text-[#e0e7e0] tracking-wide text-sm">
                BACKWOODS WIKI
              </h1>
              <p className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider">
                Survival Index
              </p>
            </div>
          </a>
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded text-[#5a6b5e] hover:text-[#e0e7e0] hover:bg-[#151d17] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#1a221c]/50 bg-[#0c0f0d]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#5a6b5e]" />
            <input
              type="text"
              placeholder="Search guide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121713] border border-[#1e2520] rounded-md py-1.5 pl-9 pr-8 text-xs text-[#c9d1c9] placeholder-[#5a6b5e] focus:outline-none focus:border-[#709978] focus:ring-1 focus:ring-[#709978] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#5a6b5e] hover:text-[#e0e7e0] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Navigation / Article List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          {(Object.entries(categories) as [string, WikiArticle[]][]).map(([categoryName, catArticles]) => {
            const isCollapsed = collapsedCategories[categoryName];
            return (
              <div key={categoryName} className="space-y-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryName)}
                  className="w-full flex items-center justify-between text-left py-1 text-[11px] font-mono font-semibold tracking-wider text-[#5a6b5e] hover:text-[#a9d1b0] uppercase transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Folder className="w-3 h-3 text-[#334237]" />
                    {categoryName}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {/* Category Articles */}
                {!isCollapsed && (
                  <div className="pl-1.5 space-y-0.5 border-l border-[#1a221c]/50 ml-1.5 mt-1 transition-all duration-300">
                    {catArticles.map(article => {
                      const isActive = currentSlug === article.slug;
                      return (
                        <a
                          key={article.slug}
                          href={`#/wiki/${article.slug}`}
                          onClick={onClose}
                          className={`
                            group flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-all duration-150
                            ${isActive 
                              ? 'bg-[#18201a] text-[#a9d1b0] font-medium border-l-2 border-[#709978]' 
                              : 'text-[#829285] hover:text-[#e0e7e0] hover:bg-[#111712]'
                            }
                          `}
                        >
                          <span className="shrink-0 transition-transform group-hover:scale-110 duration-200">
                            {getArticleIcon(article.slug)}
                          </span>
                          <span className="truncate">{article.title}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {articles.length === 0 && (
            <div className="text-center py-8 text-[#5a6b5e] text-xs font-serif italic">
              No results match search
            </div>
          )}
        </nav>

        {/* Footer info - Survival Credits & Links */}
        <div className="p-4 border-t border-[#1a221c] bg-[#090b0a] text-[10px] font-mono flex flex-col gap-2">
          <div className="flex flex-col gap-1.5 border-b border-[#141b16] pb-2 mb-2">
            <a 
              href="https://modrinth.com/mod/backwoods" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#709978] hover:text-[#a9d1b0] flex items-center gap-1.5 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Modrinth Page
            </a>
            <a 
              href="https://www.curseforge.com/minecraft/mc-mods/backwoods" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#709978] hover:text-[#a9d1b0] flex items-center gap-1.5 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              CurseForge Page
            </a>
            <a 
              href="https://discord.com/invite/NtRJqPCUQA" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#709978] hover:text-[#a9d1b0] flex items-center gap-1.5 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              Official Discord
            </a>
          </div>
          <div className="select-none text-[9px] uppercase tracking-wider text-[#353d36]">ESTABLISHED FOR ESTEEMED SURVIVORS</div>
        </div>
      </aside>
    </>
  );
}
