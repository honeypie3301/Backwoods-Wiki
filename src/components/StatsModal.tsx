import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  RefreshCw, 
  Activity, 
  Users, 
  Terminal, 
  Eye, 
  Database,
  BarChart3,
  Radio,
  Layers,
  Clock
} from 'lucide-react';
import { doc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, hasConfig } from '../lib/firebase';

interface TelemetryLog {
  timestamp: string;
  type: 'unique' | 'repeat';
  slug: string;
  visitorId: string;
}

interface StatsData {
  uniqueCount: number;
  repeatCount: number;
  totalCount: number;
  pageViews: Record<string, number>;
  logs: TelemetryLog[];
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Array<{ slug: string; title: string }>;
}

export default function StatsModal({ isOpen, onClose, articles }: StatsModalProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [logFilter, setLogFilter] = useState<'all' | 'unique' | 'repeat'>('all');
  const [showAllTargets, setShowAllTargets] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);
    setIsSandbox(false);

    let statsUnsubscribe: () => void = () => {};
    let logsUnsubscribe: () => void = () => {};

    const enableSandboxFallback = () => {
      // Fallback to local storage
      const localStatsStr = localStorage.getItem('local_wiki_stats');
      if (localStatsStr) {
        try {
          setStats(JSON.parse(localStatsStr));
          setIsSandbox(true);
        } catch (e) {
          setError('Failed to parse local stats database.');
        }
      } else {
        // Initialize default mock local stats
        const localId = localStorage.getItem('wiki_visitor_id') || 'surv_local';
        const defaultStats: StatsData = {
          uniqueCount: 12,
          repeatCount: 18,
          totalCount: 30,
          pageViews: { 'home': 12, 'getting-started': 8, 'items': 6, 'blocks': 4 },
          logs: [
            {
              timestamp: new Date().toISOString(),
              type: 'unique' as const,
              slug: 'home',
              visitorId: localId.substring(0, 12)
            },
            {
              timestamp: new Date(Date.now() - 600000).toISOString(),
              type: 'repeat' as const,
              slug: 'getting-started',
              visitorId: 'surv_f2910a'
            },
            {
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              type: 'unique' as const,
              slug: 'items',
              visitorId: 'surv_f2910a'
            }
          ]
        };
        localStorage.setItem('local_wiki_stats', JSON.stringify(defaultStats));
        setStats(defaultStats);
        setIsSandbox(true);
      }
      setLoading(false);
    };

    if (!hasConfig) {
      enableSandboxFallback();
      return;
    }

    try {
      // 1. Listen to global stats doc
      statsUnsubscribe = onSnapshot(doc(db, 'stats', 'global'), (statsDoc) => {
        if (statsDoc.exists()) {
          const data = statsDoc.data();
          const pageViews: Record<string, number> = {};
          
          if (data.pageViews && typeof data.pageViews === 'object') {
            Object.assign(pageViews, data.pageViews);
          }
          
          Object.keys(data).forEach(key => {
            if (key.startsWith('pageViews.')) {
              const slug = key.replace('pageViews.', '');
              pageViews[slug] = (pageViews[slug] || 0) + Number(data[key] || 0);
            }
          });

          setStats(prev => ({
            uniqueCount: data.uniqueCount || 0,
            repeatCount: data.repeatCount || 0,
            totalCount: data.totalCount || 0,
            pageViews,
            logs: prev?.logs || []
          }));
          setIsSandbox(false);
        } else {
          // Document does not exist yet (first time initialization)
          setStats(prev => ({
            uniqueCount: 0,
            repeatCount: 0,
            totalCount: 0,
            pageViews: {},
            logs: prev?.logs || []
          }));
          setIsSandbox(false);
        }
        setLoading(false);
      }, (err) => {
        console.warn("Error listening to Firestore global stats, enabling local sandbox fallback.", err);
        enableSandboxFallback();
      });

      // 2. Listen to logs query
      const logsQuery = query(
        collection(db, 'telemetry_logs'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      logsUnsubscribe = onSnapshot(logsQuery, (snapshot) => {
        const logs: TelemetryLog[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          let tsStr = new Date().toISOString();
          if (data.timestamp) {
            if (typeof data.timestamp.toDate === 'function') {
              tsStr = data.timestamp.toDate().toISOString();
            } else if (data.timestamp.seconds) {
              tsStr = new Date(data.timestamp.seconds * 1000).toISOString();
            } else {
              tsStr = new Date(data.timestamp).toISOString();
            }
          }
          logs.push({
            timestamp: tsStr,
            type: data.type || 'repeat',
            slug: data.slug || 'home',
            visitorId: data.visitorId || 'unknown'
          });
        });
        setStats(prev => {
          if (!prev) {
            return {
              uniqueCount: 0,
              repeatCount: 0,
              totalCount: 0,
              pageViews: {},
              logs
            };
          }
          return {
            ...prev,
            logs
          };
        });
      }, (err) => {
        console.warn("Error listening to Firestore logs, enabling local sandbox fallback.", err);
        enableSandboxFallback();
      });

    } catch (err) {
      console.warn("Firebase execution error, enabling local sandbox fallback.", err);
      enableSandboxFallback();
    }

    return () => {
      statsUnsubscribe();
      logsUnsubscribe();
    };
  }, [isOpen, retryCount]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (isSandbox) {
      const localStatsStr = localStorage.getItem('local_wiki_stats');
      if (localStatsStr) {
        try {
          setStats(JSON.parse(localStatsStr));
        } catch (e) {
          console.error(e);
        }
      }
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const getArticleTitle = (slug: string) => {
    const article = articles.find(a => a.slug === slug);
    if (article) return article.title;
    // Format fallback neatly
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  };

  // Compute top visited pages breakdown
  const { topPages, totalTargetsCount } = useMemo(() => {
    if (!stats) return { topPages: [], totalTargetsCount: 0 };
    
    // Check if stats.pageViews has keys
    const viewsMap: Record<string, number> = { ...(stats.pageViews || {}) };

    // If pageViews is empty but we have logs, calculate distribution from logs
    if (Object.keys(viewsMap).length === 0 && stats.logs.length > 0) {
      stats.logs.forEach(log => {
        viewsMap[log.slug] = (viewsMap[log.slug] || 0) + 1;
      });
    }

    const sorted = Object.entries(viewsMap)
      .map(([slug, count]) => ({
        slug,
        title: getArticleTitle(slug),
        count
      }))
      .sort((a, b) => b.count - a.count);

    const maxCount = sorted.length > 0 ? Math.max(...sorted.map(p => p.count), 1) : 1;

    const ranked = sorted.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      percentage: Math.round((item.count / maxCount) * 100)
    }));

    return {
      topPages: showAllTargets ? ranked : ranked.slice(0, 6),
      totalTargetsCount: ranked.length
    };
  }, [stats, articles, showAllTargets]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!stats) return [];
    if (logFilter === 'all') return stats.logs;
    return stats.logs.filter(l => l.type === logFilter);
  }, [stats, logFilter]);

  const formatRelativeTime = (timestamp: string) => {
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return `${Math.floor(diffHr / 24)}d ago`;
    } catch {
      return 'recent';
    }
  };

  if (!isOpen) return null;

  const retentionRate = stats && stats.totalCount > 0 
    ? Math.round((stats.repeatCount / stats.totalCount) * 100) 
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop overlay with blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
          id="stats-modal-backdrop"
        />

        {/* Modal Window: Sleek Minimalist Dark HUD with Crisp Borders */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-[#080c09] border border-[#1b261e] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-mono z-50 text-[#c8d4ca]"
          id="stats-modal-container"
        >
          {/* Header - Minimalist Tactical HUD Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#0b100d] border-b border-[#1b261e] select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="h-4 w-[1px] bg-[#1e2a22]" />
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold tracking-wider text-[#a4c9ad] uppercase flex items-center gap-2">
                  BACKWOODS TELEMETRY TERMINAL
                  <span className="text-[9px] px-1.5 py-0.2 text-[#4e6353] border border-[#1b261e] rounded bg-[#0e1410] font-mono">
                    v1.1.0-HUD
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mode indicator pill */}
              {isSandbox ? (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-900/50 bg-amber-950/20 text-amber-400 text-[9px] tracking-wider uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  SANDBOX STORAGE
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-900/50 bg-emerald-950/20 text-emerald-400 text-[9px] tracking-wider uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE DATABASE LINK
                </div>
              )}

              <div className="flex items-center gap-1.5 border-l border-[#1b261e] pl-3">
                <button 
                  onClick={handleManualRefresh}
                  disabled={loading || isRefreshing}
                  className="p-1.5 text-[#5e7564] hover:text-emerald-400 hover:bg-[#121914] rounded transition-colors cursor-pointer disabled:opacity-40"
                  title="Synchronize telemetry logs"
                  id="stats-refresh-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-1.5 text-[#5e7564] hover:text-red-400 hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                  title="Close terminal (Esc)"
                  id="stats-close-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {loading && !stats ? (
              <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
                <Activity className="w-7 h-7 text-emerald-400 animate-pulse" />
                <div className="text-[11px] text-[#5e7564] uppercase tracking-widest animate-pulse font-mono">
                  INITIALIZING TELEMETRY UPLINK...
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-red-400 border border-red-900/40 bg-red-950/15 rounded p-6">
                <Database className="w-7 h-7 mb-2 text-red-500 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1 text-red-300">Access Protocol Fault</h4>
                <p className="text-[11px] text-red-400/80 max-w-md leading-relaxed">{error}</p>
                <button 
                  onClick={() => { setError(null); setRetryCount(prev => prev + 1); }}
                  className="mt-3 px-3 py-1 bg-red-950/40 hover:bg-red-950/70 border border-red-800 text-[10px] uppercase tracking-wider rounded transition-colors text-red-300 font-semibold"
                >
                  Retry Connection
                </button>
              </div>
            ) : stats ? (
              <>
                {/* 1. HUD Metrics Ribbon (3 Crisp Modular Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Total Hits */}
                  <div className="p-3.5 bg-[#0d120f] border border-[#1b261e] rounded hover:border-[#27382c] transition-colors relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-[#5e7564] uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-500/70" />
                        Total Hits
                      </span>
                      <span className="text-[9px] text-[#425246] px-1.5 py-0.2 rounded border border-[#1b261e] bg-[#090d0a]">
                        IMPRESSIONS
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#e1eae2] font-sans tracking-tight">
                      {stats.totalCount.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-[#4a5f50] mt-1 uppercase flex items-center gap-1">
                      <span>Global telemetry records</span>
                    </div>
                  </div>

                  {/* Unique Survivors */}
                  <div className="p-3.5 bg-[#0d120f] border border-[#1b261e] rounded hover:border-[#27382c] transition-colors relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-emerald-400/90 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        Unique Survivors
                      </span>
                      <span className="text-[9px] text-emerald-400/80 px-1.5 py-0.2 rounded border border-emerald-900/40 bg-emerald-950/30">
                        DISTINCT
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-sans tracking-tight">
                      {stats.uniqueCount.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-emerald-500/60 mt-1 uppercase">
                      Unique terminal hardware nodes
                    </div>
                  </div>

                  {/* Returning Operatives */}
                  <div className="p-3.5 bg-[#0d120f] border border-[#1b261e] rounded hover:border-[#27382c] transition-colors relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        Returning Operatives
                      </span>
                      <span className="text-[9px] text-amber-400/80 px-1.5 py-0.2 rounded border border-amber-900/40 bg-amber-950/30 font-mono">
                        {retentionRate}% RETENTION
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-sans tracking-tight">
                      {stats.repeatCount.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-amber-500/60 mt-1 uppercase">
                      Re-entries from identified survivors
                    </div>
                  </div>
                </div>

                {/* 2. Two-Column Split Layout: Top Visited Breakdown & Realtime Trace Stream */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column: Top Visited Telemetry Targets */}
                  <div className="lg:col-span-5 bg-[#0c110e] border border-[#1b261e] rounded p-3.5 flex flex-col h-[380px]">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#1b261e] mb-3 select-none">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold text-[#a4c9ad] uppercase tracking-wider">
                          Telemetry Targets
                        </span>
                        {totalTargetsCount > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#111713] border border-[#1e2a20] text-emerald-400/90 font-mono">
                            {totalTargetsCount}
                          </span>
                        )}
                      </div>
                      {totalTargetsCount > 6 ? (
                        <button
                          type="button"
                          onClick={() => setShowAllTargets(prev => !prev)}
                          className="text-[9px] font-mono px-2 py-0.5 rounded border border-[#213025] hover:border-emerald-600/60 bg-[#101712] hover:bg-[#152018] text-[#86a58e] hover:text-emerald-300 transition-colors uppercase tracking-wider cursor-pointer"
                        >
                          {showAllTargets ? 'Show Top 6' : `View All (${totalTargetsCount})`}
                        </button>
                      ) : (
                        <span className="text-[9px] text-[#4f6454] uppercase tracking-wider">
                          Ranked by views
                        </span>
                      )}
                    </div>

                    {topPages.length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-[#4f6454] italic">
                        No page view distribution recorded.
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                        {topPages.map((page) => (
                          <div key={page.slug} className="group">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                  page.rank === 1 
                                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                                    : 'bg-[#111713] border-[#1f2c22] text-[#5e7564]'
                                }`}>
                                  #{String(page.rank).padStart(2, '0')}
                                </span>
                                <span className="truncate text-[#cad6cc] group-hover:text-emerald-300 transition-colors" title={page.title}>
                                  {page.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-400/90 font-mono font-bold shrink-0">
                                {page.count.toLocaleString()} <span className="text-[8px] font-normal text-[#4f6454]">HITS</span>
                              </span>
                            </div>
                            {/* Sleek Minimalist Progress Bar */}
                            <div className="w-full h-1 bg-[#121914] rounded-full overflow-hidden border border-[#1a251d]/40">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  page.rank === 1 ? 'bg-emerald-400' : 'bg-emerald-600/70'
                                }`}
                                style={{ width: `${page.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Realtime Telemetry Stream with Categorized Status Pills */}
                  <div className="lg:col-span-7 bg-[#0c110e] border border-[#1b261e] rounded p-3.5 flex flex-col h-[380px]">
                    {/* Stream Header & Filters */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#1b261e] mb-2.5 select-none">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-semibold text-[#a4c9ad] uppercase tracking-wider">
                          Telemetry Trace Stream
                        </span>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1 bg-[#090d0a] p-0.5 rounded border border-[#1b261e]">
                        <button
                          onClick={() => setLogFilter('all')}
                          className={`px-2 py-0.5 text-[9px] uppercase font-semibold rounded transition-colors cursor-pointer ${
                            logFilter === 'all'
                              ? 'bg-[#1b261e] text-[#d6ded7] border border-[#2b3c30]'
                              : 'text-[#4f6454] hover:text-[#a4c9ad]'
                          }`}
                        >
                          All ({stats.logs.length})
                        </button>
                        <button
                          onClick={() => setLogFilter('unique')}
                          className={`px-2 py-0.5 text-[9px] uppercase font-semibold rounded transition-colors cursor-pointer ${
                            logFilter === 'unique'
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                              : 'text-[#4f6454] hover:text-emerald-400'
                          }`}
                        >
                          Unique
                        </button>
                        <button
                          onClick={() => setLogFilter('repeat')}
                          className={`px-2 py-0.5 text-[9px] uppercase font-semibold rounded transition-colors cursor-pointer ${
                            logFilter === 'repeat'
                              ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                              : 'text-[#4f6454] hover:text-amber-400'
                          }`}
                        >
                          Return
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Log Stream */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[11px] font-mono scrollbar-thin">
                      {filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12 text-[#4f6454] italic">
                          <Radio className="w-5 h-5 mb-1.5 text-[#303f34]" />
                          <span>No telemetry trace events match the active filter.</span>
                        </div>
                      ) : (
                        filteredLogs.map((log, index) => {
                          const date = new Date(log.timestamp);
                          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                          const isNew = log.type === 'unique';
                          const relativeTime = formatRelativeTime(log.timestamp);

                          return (
                            <div 
                              key={`${log.timestamp}-${index}`} 
                              className="px-2.5 py-1.5 bg-[#080c09] hover:bg-[#101712] border border-[#162018] rounded transition-colors flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {/* Timestamp */}
                                <span className="text-[#4e6453] text-[10px] font-semibold shrink-0">
                                  [{timeStr}]
                                </span>

                                {/* Categorized Status Pill */}
                                {isNew ? (
                                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 shadow-[0_0_6px_rgba(16,185,129,0.2)]">
                                    NEW NODE
                                  </span>
                                ) : (
                                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider bg-[#1c180a] text-amber-300 border border-amber-800/80">
                                    RETURN
                                  </span>
                                )}

                                {/* Destination Title */}
                                <span className="text-[#99b5a1] hover:text-emerald-300 transition-colors truncate">
                                  {getArticleTitle(log.slug)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Visitor ID Chip */}
                                <span className="text-[9px] text-[#55695a] bg-[#0d140f] px-1.5 py-0.2 rounded border border-[#1c271f] font-mono">
                                  {log.visitorId}
                                </span>
                                {/* Elapsed */}
                                <span className="text-[9px] text-[#3d4f42] w-12 text-right hidden sm:inline">
                                  {relativeTime}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Footer Protocol Banner */}
                <div className="p-3 bg-[#0a0f0c] border border-[#18231a] rounded text-[10px] text-[#4f6454] leading-relaxed select-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-emerald-400 font-bold mr-1">PROTOCOL SUMMARY:</span>
                    {isSandbox 
                      ? "Sandbox mode engaged. Analytics persist safely in browser sandbox storage."
                      : "Telemetry uplink synchronized with Backwoods central Firestore cluster. Visitor sessions strictly anonymized."}
                  </div>
                  <div className="text-[9px] text-[#3f5043] shrink-0 font-mono">
                    PRESS <kbd className="px-1 py-0.2 bg-[#121914] border border-[#1e2a21] text-[#788e7d] rounded text-[8px]">ESC</kbd> TO EXIT TERMINAL
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-[#4f6454] italic">
                System awaiting first scan.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
