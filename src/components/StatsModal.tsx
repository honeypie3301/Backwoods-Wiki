import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  RefreshCw, 
  Activity, 
  Users, 
  Terminal, 
  FileText, 
  Eye, 
  Database 
} from 'lucide-react';

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

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const base = import.meta.env.BASE_URL || '/';
      const baseUrl = base.endsWith('/') ? base : `${base}/`;
      const res = await fetch(`${baseUrl}api/stats`);
      if (!res.ok) {
        throw new Error('Terminal failed to respond with statistical records.');
      }
      const data = await res.json();
      setStats(data);
      setIsSandbox(false);
    } catch (err) {
      console.warn("Backend database offline or unreachable. Initializing sandbox local-stats fallback.", err);
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
        const defaultStats = {
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
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const getArticleTitle = (slug: string) => {
    const article = articles.find(a => a.slug === slug);
    if (article) return article.title;
    // Format fallback neatly
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay with blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          id="stats-modal-backdrop"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-4xl bg-[#0b0e0c] border border-[#232d25] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-mono z-50 text-[#c9d1c9]"
          id="stats-modal-container"
        >
          {/* Header - Terminal Style */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#0e1310] border-b border-[#1e2720] select-none">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/85" />
                <span className="w-3 h-3 rounded-full bg-amber-500/85" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/85" />
              </div>
              <div className="h-4 w-[1px] bg-[#232d25] mx-1" />
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-xs font-bold tracking-widest text-[#a9d1b0] uppercase flex items-center gap-2">
                  WIKI TELEMETRY TERMINAL v1.0.9
                  {isSandbox && (
                    <span className="text-amber-500 text-[9px] px-1.5 py-0.5 bg-amber-950/40 border border-amber-900/40 rounded font-normal uppercase tracking-normal animate-pulse">
                      SANDBOX MODE
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleManualRefresh}
                disabled={loading || isRefreshing}
                className="p-1.5 text-[#5a6b5e] hover:text-[#a9d1b0] hover:bg-[#161d18] rounded transition-all cursor-pointer disabled:opacity-40"
                title="Synchronize Database Logs"
                id="stats-refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 text-[#5a6b5e] hover:text-red-400 hover:bg-red-950/20 rounded transition-all cursor-pointer"
                id="stats-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading && !stats ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
                <div className="text-xs text-[#5a6b5e] uppercase tracking-[0.2em] animate-pulse">
                  Querying server registry files...
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-red-500 border border-red-900/30 bg-red-950/10 rounded-lg p-6">
                <Database className="w-8 h-8 mb-3 text-red-600 animate-bounce" />
                <h4 className="text-sm font-bold uppercase mb-1">Access Protocol Failed</h4>
                <p className="text-xs text-red-400 max-w-md leading-relaxed">{error}</p>
                <button 
                  onClick={() => fetchStats()}
                  className="mt-4 px-3 py-1.5 bg-red-950/40 hover:bg-red-950/60 border border-red-800 text-xs rounded transition-all text-red-300"
                >
                  Retry Connection
                </button>
              </div>
            ) : stats ? (
              <>
                {/* 1. Dashboard Numbers (Bento Style Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Hits */}
                  <div className="p-4 bg-[#111712] border border-[#232d25] rounded-lg relative overflow-hidden group hover:border-[#304033] transition-colors">
                    <div className="absolute top-3 right-3 text-[#1f2720] group-hover:text-emerald-950 transition-colors">
                      <Eye className="w-10 h-10" />
                    </div>
                    <span className="text-[10px] font-bold text-[#5a6b5e] uppercase tracking-wider block mb-1">
                      Total Hits (Impressions)
                    </span>
                    <span className="text-3xl font-extrabold text-[#e0e7e0] font-sans">
                      {stats.totalCount.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#3d4b3f] block mt-1 uppercase">
                      Global page impressions registered
                    </span>
                  </div>

                  {/* Unique Survivors */}
                  <div className="p-4 bg-[#111712] border border-[#232d25] rounded-lg relative overflow-hidden group hover:border-[#304033] transition-colors">
                    <div className="absolute top-3 right-3 text-[#1f2720] group-hover:text-teal-950 transition-colors">
                      <Users className="w-10 h-10" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      Unique Survivors
                    </span>
                    <span className="text-3xl font-extrabold text-emerald-300 font-sans">
                      {stats.uniqueCount.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#4d5c4f] block mt-1 uppercase text-emerald-500/70">
                      Distinct terminal nodes recorded
                    </span>
                  </div>

                  {/* Returning Operatives */}
                  <div className="p-4 bg-[#111712] border border-[#232d25] rounded-lg relative overflow-hidden group hover:border-[#304033] transition-colors">
                    <div className="absolute top-3 right-3 text-[#1f2720] group-hover:text-amber-950 transition-colors">
                      <Activity className="w-10 h-10" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">
                      Returning Operatives
                    </span>
                    <span className="text-3xl font-extrabold text-amber-400 font-sans">
                      {stats.repeatCount.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#4d5c4f] block mt-1 uppercase text-amber-600/70">
                      Re-entries from identified nodes
                    </span>
                  </div>
                </div>

                {/* 2. Top Pages and Live Logs split layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Top Pages (Page Views) - 2 cols on lg */}
                  <div className="lg:col-span-2 bg-[#0e120f] border border-[#1e2720] rounded-lg p-4 flex flex-col h-[320px]">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#1e2720] mb-3 select-none">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-[#a9d1b0] uppercase tracking-wider">
                        Page View Directory
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {Object.keys(stats.pageViews).length === 0 ? (
                        <div className="text-center py-12 text-[#5a6b5e] text-xs italic">
                          No page records cataloged yet.
                        </div>
                      ) : (
                        Object.entries(stats.pageViews)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          .map(([slug, count]) => (
                            <div 
                              key={slug} 
                              className="flex items-center justify-between text-xs py-1.5 px-2 bg-[#121713] border border-[#1e2520]/60 hover:border-[#2b372d] rounded transition-all"
                            >
                              <span className="text-[#a9d1b0] truncate max-w-[70%]" title={slug}>
                                {getArticleTitle(slug)}
                              </span>
                              <div className="flex items-center gap-1.5 font-sans">
                                <span className="text-[10px] font-mono text-[#5a6b5e]">({count as number})</span>
                                <span className="text-emerald-400 font-semibold">{Math.round(((count as number) / stats.totalCount) * 100)}%</span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Live Telemetry Feed (Recent Logs) - 3 cols on lg */}
                  <div className="lg:col-span-3 bg-[#0e120f] border border-[#1e2720] rounded-lg p-4 flex flex-col h-[320px]">
                    <div className="flex items-center justify-between pb-3 border-b border-[#1e2720] mb-3 select-none">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold text-[#a9d1b0] uppercase tracking-wider">
                          Telemetry Log Trace
                        </span>
                      </div>
                      <span className="text-[9px] text-[#5a6b5e] uppercase">
                        Real-time feed
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-[11px] font-mono scrollbar-thin">
                      {stats.logs.length === 0 ? (
                        <div className="text-center py-12 text-[#5a6b5e] italic">
                          Telemetry logs are currently empty.
                        </div>
                      ) : (
                        stats.logs.map((log, index) => {
                          const date = new Date(log.timestamp);
                          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                          const isNew = log.type === 'unique';
                          return (
                            <div 
                              key={index} 
                              className="border-b border-[#1a221c]/40 pb-1.5 last:border-0 leading-normal"
                            >
                              <span className="text-[#5a6b5e] mr-1.5 font-semibold">[{timeStr}]</span>
                              <span className="text-emerald-500/80 uppercase tracking-tight mr-1.5">CONN_IN</span>
                              <span className="text-[#829285] mr-1.5 font-bold">{log.visitorId}</span>
                              <span className="text-[#5a6b5e] mr-1.5">accessed</span>
                              <span className="text-teal-400 hover:underline mr-2">{getArticleTitle(log.slug)}</span>
                              <span className={`inline-block px-1 rounded text-[9px] uppercase font-bold leading-none py-0.5 ${
                                isNew 
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                                  : 'bg-[#151a16] text-amber-500 border border-amber-900/60'
                              }`}>
                                {isNew ? 'NEW' : 'RET'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="p-3 bg-[#0d120e] border border-[#1e2720]/60 rounded text-[10px] text-[#5a6b5e] leading-relaxed select-none">
                  <span className="text-emerald-500 font-bold mr-1">PROTOCOL SUMMARY:</span>{' '}
                  {isSandbox 
                    ? "Sandbox storage active. Since this is hosted as a static page (e.g. GitHub Pages) or the API server is unreachable, visit statistics are tracked and saved securely within your browser's local sandbox storage."
                    : "This terminal presents actual, persistent server-side analytics from the Backwoods database. All visitor sessions are anonymized with generated local hardware keys to satisfy survival privacy parameters."}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-[#5a6b5e] italic">
                System awaiting first scan.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
