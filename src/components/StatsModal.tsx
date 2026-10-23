import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Clock,
  Search,
  Monitor,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  getDocs,
  where,
  collection, 
  increment, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, hasConfig } from '../lib/firebase';
import { detectClientEnvironment } from '../utils/deviceInfo';

interface TelemetryLog {
  timestamp: string;
  type: 'unique' | 'repeat';
  slug: string;
  visitorId: string;
  os?: string;
  browser?: string;
}

interface SearchSummary {
  totalLogs: number;
  uniqueCount: number;
  repeatCount: number;
  matchedNodes: string[];
  newestDate?: string;
  oldestDate?: string;
  topTarget?: { title: string; count: number };
  device?: string;
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
  const [activeMobileTab, setActiveMobileTab] = useState<'overview' | 'stream'>('overview');
  const [isDeviceIgnored, setIsDeviceIgnored] = useState<boolean>(() => {
    return localStorage.getItem('wiki_telemetry_ignore_device') === 'true';
  });
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    const saved = localStorage.getItem('wiki_telemetry_fullscreen');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const next = !prev;
      localStorage.setItem('wiki_telemetry_fullscreen', String(next));
      return next;
    });
  };

  // User ID database search engine state
  const [searchUserId, setSearchUserId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TelemetryLog[] | null>(null);
  const [searchSummary, setSearchSummary] = useState<SearchSummary | null>(null);
  const searchCacheRef = useRef<Map<string, TelemetryLog[]>>(new Map());

  const currentVisitorId = useMemo(() => {
    return localStorage.getItem('wiki_visitor_id') || 'unassigned';
  }, [isOpen]);

  const currentVisitorIdShort = currentVisitorId.substring(0, 12);
  const clientEnv = useMemo(() => detectClientEnvironment(), []);

  const handleStopTracking = () => {
    localStorage.setItem('wiki_telemetry_ignore_device', 'true');
    setIsDeviceIgnored(true);
    setStatusNotice('DEVICE TELEMETRY HALTED');
    setTimeout(() => setStatusNotice(null), 2800);
  };

  const handleResumeTracking = () => {
    localStorage.removeItem('wiki_telemetry_ignore_device');
    setIsDeviceIgnored(false);
    setStatusNotice('DEVICE TELEMETRY ACTIVE');
    setTimeout(() => setStatusNotice(null), 2800);
  };

  // Log terminal open event to telemetry trace stream
  const hasLoggedOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasLoggedOpenRef.current = false;
      return;
    }

    if (hasLoggedOpenRef.current) return;
    hasLoggedOpenRef.current = true;

    const recordTerminalAccess = async () => {
      try {
        // Abort if device tracking is disabled
        if (localStorage.getItem('wiki_telemetry_ignore_device') === 'true') {
          return;
        }

        let visitorId = localStorage.getItem('wiki_visitor_id');
        if (!visitorId) {
          visitorId = 'surv_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
          localStorage.setItem('wiki_visitor_id', visitorId);
        }

        const shortVisitorId = visitorId.substring(0, 12);

        const recordLocalTerminal = (isUnique: boolean) => {
          try {
            const raw = localStorage.getItem('local_wiki_stats');
            let localData: StatsData | null = null;
            if (raw) {
              localData = JSON.parse(raw);
            }
            if (!localData) {
              localData = {
                uniqueCount: 1,
                repeatCount: 0,
                totalCount: 1,
                pageViews: {},
                logs: []
              };
            }

            localData.totalCount = (localData.totalCount || 0) + 1;
            if (isUnique) {
              localData.uniqueCount = (localData.uniqueCount || 0) + 1;
            } else {
              localData.repeatCount = (localData.repeatCount || 0) + 1;
            }

            if (!localData.pageViews) localData.pageViews = {};
            localData.pageViews['telemetry-terminal'] = (localData.pageViews['telemetry-terminal'] || 0) + 1;

            if (!localData.logs) localData.logs = [];
            localData.logs.unshift({
              timestamp: new Date().toISOString(),
              type: isUnique ? 'unique' : 'repeat',
              slug: 'telemetry-terminal',
              visitorId: shortVisitorId,
              os: clientEnv.os,
              browser: clientEnv.browser
            });

            if (localData.logs.length > 50) {
              localData.logs = localData.logs.slice(0, 50);
            }

            localStorage.setItem('local_wiki_stats', JSON.stringify(localData));
            setStats(localData);
          } catch (e) {
            console.error('Failed to log terminal open event to local sandbox', e);
          }
        };

        // Optimistic UI emission: append event to local trace immediately so terminal shows 0ms latency
        const optimisticType = localStorage.getItem('wiki_visitor_established') === 'true' ? 'repeat' : 'unique';
        const optimisticEntry: TelemetryLog = {
          timestamp: new Date().toISOString(),
          type: optimisticType,
          slug: 'telemetry-terminal',
          visitorId: shortVisitorId,
          os: clientEnv.os,
          browser: clientEnv.browser
        };
        setStats(prev => {
          if (!prev) return prev;
          const currentLogs = prev.logs || [];
          return {
            ...prev,
            totalCount: (prev.totalCount || 0) + 1,
            pageViews: {
              ...prev.pageViews,
              'telemetry-terminal': (prev.pageViews?.['telemetry-terminal'] || 0) + 1
            },
            logs: [optimisticEntry, ...currentLogs].slice(0, 50)
          };
        });

        if (hasConfig) {
          // Asynchronously dispatch writes in parallel without blocking the UI thread
          (async () => {
            try {
              const visitorDocRef = doc(db, 'visitors', visitorId);
              const isKnownLocally = localStorage.getItem('wiki_visitor_established') === 'true';
              let isUnique = false;

              if (!isKnownLocally) {
                const visitorSnapshot = await getDoc(visitorDocRef);
                isUnique = !visitorSnapshot.exists();
                localStorage.setItem('wiki_visitor_established', 'true');
              }

              const visitorWrite = isUnique
                ? setDoc(visitorDocRef, {
                    firstVisit: serverTimestamp(),
                    lastVisit: serverTimestamp(),
                    os: clientEnv.os,
                    browser: clientEnv.browser,
                    deviceType: clientEnv.deviceType
                  })
                : setDoc(visitorDocRef, {
                    lastVisit: serverTimestamp(),
                    os: clientEnv.os,
                    browser: clientEnv.browser,
                    deviceType: clientEnv.deviceType
                  }, { merge: true });

              const statsDocRef = doc(db, 'stats', 'global');
              const statsWrite = setDoc(statsDocRef, {
                totalCount: increment(1),
                uniqueCount: isUnique ? increment(1) : increment(0),
                repeatCount: !isUnique ? increment(1) : increment(0),
                ['pageViews.telemetry-terminal']: increment(1)
              }, { merge: true });

              const logWrite = addDoc(collection(db, 'telemetry_logs'), {
                timestamp: serverTimestamp(),
                type: isUnique ? 'unique' : 'repeat',
                slug: 'telemetry-terminal',
                visitorId: shortVisitorId,
                os: clientEnv.os,
                browser: clientEnv.browser
              });

              // Execute all three writes concurrently over a single batched window
              await Promise.all([visitorWrite, statsWrite, logWrite]);
            } catch (err) {
              console.warn('Firebase terminal logging failed, using local sandbox fallback', err);
              recordLocalTerminal(false);
            }
          })();
        } else {
          const raw = localStorage.getItem('local_wiki_stats');
          let hasVisited = false;
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              hasVisited = parsed.logs?.some((l: TelemetryLog) => l.visitorId === shortVisitorId);
            } catch (e) {}
          }
          recordLocalTerminal(!hasVisited);
        }
      } catch (err) {
        console.error('Error logging terminal telemetry event:', err);
      }
    };

    recordTerminalAccess();
  }, [isOpen]);

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

    // Zero-delay rehydration: instantly render from local cache if available
    const cachedStats = localStorage.getItem('cached_telemetry_stats') || localStorage.getItem('local_wiki_stats');
    if (cachedStats) {
      try {
        setStats(JSON.parse(cachedStats));
        setLoading(false);
      } catch {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }

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

          setStats(prev => {
            const nextStats = {
              uniqueCount: data.uniqueCount || 0,
              repeatCount: data.repeatCount || 0,
              totalCount: data.totalCount || 0,
              pageViews,
              logs: prev?.logs || []
            };
            try {
              localStorage.setItem('cached_telemetry_stats', JSON.stringify(nextStats));
            } catch {}
            return nextStats;
          });
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
            visitorId: data.visitorId || 'unknown',
            os: data.os,
            browser: data.browser
          });
        });
        setStats(prev => {
          const nextStats = !prev ? {
            uniqueCount: 0,
            repeatCount: 0,
            totalCount: 0,
            pageViews: {},
            logs
          } : {
            ...prev,
            logs
          };
          try {
            localStorage.setItem('cached_telemetry_stats', JSON.stringify(nextStats));
          } catch {}
          return nextStats;
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
    if (slug === 'telemetry-terminal' || slug === 'terminal') {
      return 'Telemetry Terminal';
    }
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

  const computeSearchSummary = (results: TelemetryLog[]) => {
    if (results.length === 0) {
      setSearchSummary({
        totalLogs: 0,
        uniqueCount: 0,
        repeatCount: 0,
        matchedNodes: []
      });
      return;
    }
    const nodes = Array.from(new Set(results.map(r => r.visitorId)));
    const targetCounts: Record<string, number> = {};
    let uniqueCount = 0;
    let repeatCount = 0;

    results.forEach(r => {
      targetCounts[r.slug] = (targetCounts[r.slug] || 0) + 1;
      if (r.type === 'unique') uniqueCount++;
      else repeatCount++;
    });

    let topSlug = '';
    let maxCount = 0;
    Object.entries(targetCounts).forEach(([slug, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topSlug = slug;
      }
    });

    const latestWithDevice = results.find(r => r.browser || r.os);
    const detectedDevice = latestWithDevice 
      ? `${latestWithDevice.browser || 'Browser'}${latestWithDevice.os ? ` on ${latestWithDevice.os}` : ''}`
      : (nodes.some(n => n.toLowerCase().includes(currentVisitorIdShort.toLowerCase())) ? `${clientEnv.browser} on ${clientEnv.os}` : undefined);

    setSearchSummary({
      totalLogs: results.length,
      uniqueCount,
      repeatCount,
      matchedNodes: nodes,
      newestDate: results[0]?.timestamp,
      oldestDate: results[results.length - 1]?.timestamp,
      topTarget: topSlug ? { title: getArticleTitle(topSlug), count: maxCount } : undefined,
      device: detectedDevice
    });
  };

  // User ID database search engine effect with automatic debounce
  useEffect(() => {
    const trimmed = searchUserId.trim().toLowerCase();
    if (!trimmed) {
      setSearchResults(null);
      setSearchSummary(null);
      setIsSearching(false);
      return;
    }

    // Check memory cache first for 0ms instant display
    if (searchCacheRef.current.has(trimmed)) {
      const cached = searchCacheRef.current.get(trimmed)!;
      setSearchResults(cached);
      computeSearchSummary(cached);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        let results: TelemetryLog[] = [];

        if (hasConfig) {
          const prefixes = [trimmed];
          if (!trimmed.startsWith('surv_') && !trimmed.includes('_')) {
            prefixes.push('surv_' + trimmed);
          }

          const isGeneric = trimmed === 'surv' || trimmed === 'surv_';
          const logsMap = new Map<string, TelemetryLog>();

          for (const p of prefixes) {
            let q = query(
              collection(db, 'telemetry_logs'),
              where('visitorId', '>=', p),
              where('visitorId', '<=', p + '\uf8ff')
            );
            if (isGeneric) {
              q = query(q, limit(250));
            }
            const snap = await getDocs(q);
            snap.forEach(docSnap => {
              const data = docSnap.data();
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
              logsMap.set(docSnap.id, {
                timestamp: tsStr,
                type: data.type || 'repeat',
                slug: data.slug || 'home',
                visitorId: data.visitorId || 'unknown',
                os: data.os,
                browser: data.browser
              });
            });
          }

          results = Array.from(logsMap.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        } else {
          // Local sandbox fallback
          const localLogs = stats?.logs || [];
          results = localLogs.filter(l => l.visitorId.toLowerCase().includes(trimmed));
        }

        searchCacheRef.current.set(trimmed, results);
        setSearchResults(results);
        computeSearchSummary(results);
      } catch (err) {
        console.error('Error querying full Firestore history:', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(debounceTimer);
  }, [searchUserId, hasConfig, stats]);

  // Active pool of logs: database search results or live stream
  const activeLogsPool = searchResults !== null ? searchResults : (stats?.logs || []);

  // Filter logs by type
  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return activeLogsPool;
    return activeLogsPool.filter(l => l.type === logFilter);
  }, [activeLogsPool, logFilter]);

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
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? 'p-1 sm:p-2' : 'p-2 sm:p-5'
      }`}>
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
          className={`relative w-full bg-[#080c09] border border-[#1b261e] rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono z-50 text-[#c8d4ca] transition-all duration-200 ${
            isFullscreen 
              ? 'w-[98.5vw] h-[97vh] max-w-[98.5vw] max-h-[97vh]' 
              : 'w-full max-w-6xl h-[92vh] sm:h-[88vh] max-h-[92vh] sm:max-h-[88vh]'
          }`}
          id="stats-modal-container"
        >
          {/* Header - Minimalist Tactical HUD Bar */}
          <div 
            onDoubleClick={toggleFullscreen}
            className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0b100d] border-b border-[#1b261e] select-none gap-2 cursor-default"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onDoubleClick={handleStopTracking}
                  title="Double-click: Stop tracking (ignore this device)"
                  className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                    isDeviceIgnored 
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]' 
                      : 'bg-red-500/35 hover:bg-red-500/75'
                  }`}
                />
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-2.5 h-2.5 rounded-full bg-amber-500/40 hover:bg-amber-500/80 transition-colors cursor-pointer" 
                  title="Click: Toggle Fullscreen / Maximize" 
                />
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  onDoubleClick={handleResumeTracking}
                  title="Click: Toggle Maximize | Double-click: Resume tracking"
                  className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                    !isDeviceIgnored 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' 
                      : 'bg-emerald-500/35 hover:bg-emerald-500/75'
                  }`}
                />
              </div>
              <div className="h-4 w-[1px] bg-[#1e2a22] shrink-0" />
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
                <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#a4c9ad] uppercase truncate">
                  <span className="hidden sm:inline">BACKWOODS TELEMETRY TERMINAL</span>
                  <span className="sm:hidden">TELEMETRY</span>
                </span>
                {statusNotice && (
                  <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider shrink-0 font-bold ${
                    isDeviceIgnored
                      ? 'text-red-300 bg-red-950/80 border border-red-800'
                      : 'text-emerald-300 bg-emerald-950/80 border border-emerald-800'
                  }`}>
                    <span className="hidden sm:inline">{statusNotice}</span>
                    <span className="sm:hidden">{isDeviceIgnored ? 'HALTED' : 'ACTIVE'}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mode indicator pill */}
              {isSandbox ? (
                <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-900/50 bg-amber-950/20 text-amber-400 text-[10px] tracking-wider uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  SANDBOX
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-900/50 bg-emerald-950/20 text-emerald-400 text-[10px] tracking-wider uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE DB
                </div>
              )}

              <div className="flex items-center gap-1 sm:gap-1.5 border-l border-[#1b261e] pl-2 sm:pl-3">
                <button 
                  onClick={toggleFullscreen}
                  className="p-1 sm:p-1.5 text-[#5e7564] hover:text-emerald-400 hover:bg-[#121914] rounded transition-colors cursor-pointer"
                  title={isFullscreen ? "Restore compact size" : "Maximize / Fullscreen"}
                  id="stats-fullscreen-btn"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button 
                  onClick={handleManualRefresh}
                  disabled={loading || isRefreshing}
                  className="p-1 sm:p-1.5 text-[#5e7564] hover:text-emerald-400 hover:bg-[#121914] rounded transition-colors cursor-pointer disabled:opacity-40"
                  title="Synchronize telemetry logs"
                  id="stats-refresh-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-1 sm:p-1.5 text-[#5e7564] hover:text-red-400 hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                  title="Close terminal (Esc)"
                  id="stats-close-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 p-2.5 sm:p-3.5 flex flex-col min-h-0 gap-2 sm:gap-2.5 overflow-hidden">
            {loading && !stats ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
                <div className="text-[10px] text-[#5e7564] uppercase tracking-widest animate-pulse font-mono">
                  INITIALIZING TELEMETRY UPLINK...
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-red-400 border border-red-900/40 bg-red-950/15 rounded p-5">
                <Database className="w-6 h-6 mb-2 text-red-500 animate-pulse" />
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
                {/* Mobile HUD Tab Selector (< lg) */}
                <div className="flex lg:hidden items-center bg-[#0d130f] p-1 rounded border border-[#1b261e] shrink-0 gap-1 select-none">
                  <button
                    type="button"
                    onClick={() => setActiveMobileTab('overview')}
                    className={`flex-1 py-1.5 px-2 rounded text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeMobileTab === 'overview'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80'
                        : 'text-[#647c6a] hover:text-[#a4c9ad] border border-transparent'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Overview</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#080d0a] text-emerald-400 font-mono">
                      {stats.totalCount.toLocaleString()}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMobileTab('stream')}
                    className={`flex-1 py-1.5 px-2 rounded text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeMobileTab === 'stream'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80'
                        : 'text-[#647c6a] hover:text-[#a4c9ad] border border-transparent'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Trace Stream</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#080d0a] text-emerald-400 font-mono">
                      {filteredLogs.length}
                    </span>
                  </button>
                </div>

                {/* Unified Master 2-Column Command Cockpit (Side-by-Side on Desktop, Tabbed on Mobile) */}
                <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-2.5 sm:gap-3 overflow-hidden">
                  {/* Left Analytical Sidebar: 3 Metric Cards + Telemetry Targets */}
                  <div className={`${activeMobileTab === 'overview' ? 'flex' : 'hidden'} lg:flex lg:col-span-4 flex-col gap-2 sm:gap-2.5 h-full min-h-0 overflow-hidden`}>
                    {/* 3 Compressed Metric Cards Stack */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-1.5 sm:gap-2 shrink-0">
                      {/* Total Hits */}
                      <div className="px-2.5 py-1.5 sm:py-2 bg-[#0d120f] border border-[#1b261e] rounded hover:border-[#27382c] transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-[#738f7a] uppercase tracking-wider flex items-center gap-1.5 truncate">
                            <Eye className="w-3.5 h-3.5 text-emerald-500/80 shrink-0" />
                            <span className="hidden sm:inline">Total Hits</span>
                            <span className="sm:hidden">Hits</span>
                          </span>
                          <span className="text-[8.5px] sm:text-[9px] text-[#5e7564] px-1.5 py-0.2 rounded border border-[#1b261e] bg-[#090d0a] font-mono shrink-0">
                            ALL
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-1">
                          <div className="text-lg sm:text-2xl font-bold text-[#e1eae2] font-sans tracking-tight">
                            {stats.totalCount.toLocaleString()}
                          </div>
                          <div className="text-[8.5px] sm:text-[9.5px] text-[#5e7564] uppercase font-mono truncate hidden sm:block">
                            Global records
                          </div>
                        </div>
                      </div>

                      {/* Unique Survivors */}
                      <div className="px-2.5 py-1.5 sm:py-2 bg-[#0d120f] border border-[#1b261e] rounded hover:border-[#27382c] transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-emerald-400/90 uppercase tracking-wider flex items-center gap-1.5 truncate">
                            <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="hidden sm:inline">Survivors</span>
                            <span className="sm:hidden">Unique</span>
                          </span>
                          <span className="text-[8.5px] sm:text-[9px] text-emerald-400/90 px-1.5 py-0.2 rounded border border-emerald-900/40 bg-emerald-950/30 font-mono shrink-0">
                            DISTINCT
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-1">
                          <div className="text-lg sm:text-2xl font-bold text-emerald-400 font-sans tracking-tight">
                            {stats.uniqueCount.toLocaleString()}
                          </div>
                          <div className="text-[8.5px] sm:text-[9.5px] text-emerald-500/70 uppercase font-mono truncate hidden sm:block">
                            Hardware nodes
                          </div>
                        </div>
                      </div>

                      {/* Returning Operatives */}
                      <div className="px-2.5 py-1.5 sm:py-2 bg-[#0d120f] border border-[#1b261e] rounded hover:border-[#27382c] transition-colors relative overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10.5px] sm:text-[11.5px] font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5 truncate">
                            <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="hidden sm:inline">Returning</span>
                            <span className="sm:hidden">Return</span>
                          </span>
                          <span className="text-[8.5px] sm:text-[9px] text-amber-400/90 px-1.5 py-0.2 rounded border border-amber-900/40 bg-amber-950/30 font-mono shrink-0">
                            {retentionRate}%
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-1">
                          <div className="text-lg sm:text-2xl font-bold text-amber-400 font-sans tracking-tight">
                            {stats.repeatCount.toLocaleString()}
                          </div>
                          <div className="text-[8.5px] sm:text-[9.5px] text-amber-500/70 uppercase font-mono truncate hidden sm:block">
                            Re-entries
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Targets: Responsive Height */}
                    <div className="bg-[#0c110e] border border-[#1b261e] rounded p-2.5 sm:p-3 flex flex-col flex-1 min-h-0 overflow-hidden">
                      <div className="flex items-center justify-between pb-2 border-b border-[#1b261e] mb-2 select-none shrink-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-[#a4c9ad] uppercase tracking-wider">
                            Telemetry Targets
                          </span>
                          {totalTargetsCount > 0 && (
                            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-[#111713] border border-[#1e2a20] text-emerald-400 font-mono">
                              {totalTargetsCount}
                            </span>
                          )}
                        </div>
                        {totalTargetsCount > 6 ? (
                          <button
                            type="button"
                            onClick={() => setShowAllTargets(prev => !prev)}
                            className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded border border-[#213025] hover:border-emerald-600/60 bg-[#101712] hover:bg-[#152018] text-[#86a58e] hover:text-emerald-300 transition-colors uppercase tracking-wider cursor-pointer"
                          >
                            {showAllTargets ? 'Top 6' : `All (${totalTargetsCount})`}
                          </button>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] text-[#4f6454] uppercase tracking-wider">
                            Ranked
                          </span>
                        )}
                      </div>

                      {topPages.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#4f6454] italic">
                          No page view distribution recorded.
                        </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1 scrollbar-thin">
                          {topPages.map((page) => (
                            <div key={page.slug} className="group">
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1">
                                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                  <span className={`text-[8.5px] sm:text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                                    page.rank === 1 
                                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                                      : 'bg-[#111713] border-[#1f2c22] text-[#5e7564]'
                                  }`}>
                                    #{String(page.rank).padStart(2, '0')}
                                  </span>
                                  <span className="truncate text-xs sm:text-[13px] text-[#cad6cc] group-hover:text-emerald-300 transition-colors" title={page.title}>
                                    {page.title}
                                  </span>
                                </div>
                                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-mono font-bold shrink-0">
                                  {page.count.toLocaleString()} <span className="text-[8px] sm:text-[8.5px] font-normal text-[#4f6454]">HITS</span>
                                </span>
                              </div>
                              {/* Sleek Minimalist Progress Bar */}
                              <div className="w-full h-1.5 bg-[#121914] rounded-full overflow-hidden border border-[#1a251d]/50">
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
                  </div>

                  {/* Right Column: Realtime Telemetry Stream with Integrated User ID Search Engine */}
                  <div className={`${activeMobileTab === 'stream' ? 'flex' : 'hidden'} lg:flex lg:col-span-8 bg-[#0c110e] border border-[#1b261e] rounded p-2.5 sm:p-3 flex-col h-full min-h-0 overflow-hidden`}>
                    {/* Stream Header & Filters */}
                    <div className="flex flex-wrap sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-[#1b261e] mb-2 select-none gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${searchResults !== null ? 'bg-cyan-400' : 'bg-emerald-400'} opacity-60`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${searchResults !== null ? 'bg-cyan-500' : 'bg-emerald-500'}`}></span>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-[#a4c9ad] uppercase tracking-wider truncate">
                          {searchResults !== null ? (
                            <>
                              <span className="hidden sm:inline">Database History Audit</span>
                              <span className="sm:hidden">History Audit</span>
                            </>
                          ) : (
                            <>
                              <span className="hidden sm:inline">Telemetry Trace Stream</span>
                              <span className="sm:hidden">Trace Stream</span>
                            </>
                          )}
                        </span>
                        {searchResults !== null && (
                          <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300 font-mono uppercase font-bold shrink-0">
                            HISTORICAL
                          </span>
                        )}
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1 bg-[#090d0a] p-0.5 rounded border border-[#1b261e] shrink-0 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setLogFilter('all')}
                          className={`px-2 py-0.5 text-[9px] sm:text-[10px] uppercase font-semibold rounded transition-colors cursor-pointer ${
                            logFilter === 'all'
                              ? 'bg-[#1b261e] text-[#d6ded7] border border-[#2b3c30]'
                              : 'text-[#4f6454] hover:text-[#a4c9ad]'
                          }`}
                        >
                          All ({activeLogsPool.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogFilter('unique')}
                          className={`px-2 py-0.5 text-[9px] sm:text-[10px] uppercase font-semibold rounded transition-colors cursor-pointer ${
                            logFilter === 'unique'
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                              : 'text-[#4f6454] hover:text-emerald-400'
                          }`}
                        >
                          Unique ({activeLogsPool.filter(l => l.type === 'unique').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogFilter('repeat')}
                          className={`px-2 py-0.5 text-[9px] sm:text-[10px] uppercase font-semibold rounded transition-colors cursor-pointer ${
                            logFilter === 'repeat'
                              ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                              : 'text-[#4f6454] hover:text-amber-400'
                          }`}
                        >
                          Return ({activeLogsPool.filter(l => l.type === 'repeat').length})
                        </button>
                      </div>
                    </div>

                    {/* Optimized User ID Search Engine */}
                    <div className="relative mb-2 shrink-0">
                      <div className="relative flex items-center">
                        <Search className="w-4 h-4 text-[#5e7564] absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          value={searchUserId}
                          onChange={(e) => setSearchUserId(e.target.value)}
                          placeholder="Search User ID or node (e.g. surv_q8c)..."
                          className="w-full bg-[#080d0a] border border-[#1b261e] focus:border-emerald-600/70 focus:outline-none text-[11px] sm:text-xs font-mono text-[#d6ded7] placeholder-[#4f6454] pl-8.5 pr-20 py-1.5 rounded transition-all"
                        />
                        {searchUserId ? (
                          <div className="absolute right-2 flex items-center gap-1.5">
                            {isSearching && (
                              <span className="w-2.5 h-2.5 rounded-full border border-emerald-400 border-t-transparent animate-spin" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSearchUserId('');
                                setSearchResults(null);
                                setSearchSummary(null);
                              }}
                              className="text-[#5e7564] hover:text-[#d6ded7] transition-colors p-0.5 cursor-pointer"
                              title="Clear search"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSearchUserId(currentVisitorIdShort)}
                            className="absolute right-1.5 text-[8.5px] sm:text-[9.5px] text-[#5e7564] hover:text-emerald-400 transition-colors uppercase font-mono px-2 py-0.5 bg-[#0e1611] rounded border border-[#1c271f] cursor-pointer"
                            title="Audit history for your current browser node"
                          >
                            My Node
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search Result Intelligence Card */}
                    {searchUserId.trim() && (
                      <div className="mb-2 bg-[#080d0a] border border-[#1b261e] rounded p-2 text-[9.5px] sm:text-[10px] font-mono select-none shrink-0">
                        {isSearching ? (
                          <div className="flex items-center gap-2 text-emerald-400 py-0.5">
                            <span className="w-2.5 h-2.5 rounded-full border border-emerald-400 border-t-transparent animate-spin" />
                            <span>Querying Firestore history for node "{searchUserId}"...</span>
                          </div>
                        ) : searchResults && searchResults.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141d16] pb-1">
                              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>AUDIT: {searchResults.length} RECORDS FOUND</span>
                              </div>
                              <div className="text-[8px] sm:text-[8.5px] text-[#55695a]">
                                {searchSummary?.matchedNodes.length} NODE(S) MATCHED
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[8px] sm:text-[8.5px] text-[#7a9480]">
                              {searchSummary?.oldestDate && (
                                <span>
                                  FIRST: <strong className="text-[#a4c9ad]">{new Date(searchSummary.oldestDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                </span>
                              )}
                              {searchSummary?.newestDate && (
                                <span>
                                  LATEST: <strong className="text-[#a4c9ad]">{new Date(searchSummary.newestDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                </span>
                              )}
                              {searchSummary?.topTarget && (
                                <span>
                                  TOP: <strong className="text-emerald-400">{searchSummary.topTarget.title} ({searchSummary.topTarget.count}x)</strong>
                                </span>
                              )}
                              {searchSummary?.device && (
                                <span>
                                  PLATFORM: <strong className="text-emerald-300 font-semibold">{searchSummary.device}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[#687f6e] italic py-0.5">
                            No records found in database history matching node ID "{searchUserId}".
                          </div>
                        )}
                      </div>
                    )}

                    {/* Scrollable Log Stream */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1 pb-2 font-mono scrollbar-thin">
                      {filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10 text-[#4f6454] italic">
                          <Radio className="w-4 h-4 mb-1 text-[#303f34]" />
                          <span className="text-xs">No telemetry trace events match the active criteria.</span>
                        </div>
                      ) : (
                        filteredLogs.map((log, index) => {
                          const date = new Date(log.timestamp);
                          const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                          const timeOnly = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                          const isNew = log.type === 'unique';
                          const relativeTime = formatRelativeTime(log.timestamp);
                          const isCurrentVisitor = log.visitorId === currentVisitorIdShort;
                          const displayBrowser = log.browser || (isCurrentVisitor ? clientEnv.browser : null);
                          const displayOs = log.os || (isCurrentVisitor ? clientEnv.os : null);

                          return (
                            <div 
                              key={`${log.timestamp}-${index}`} 
                              className="px-2.5 py-1.5 sm:py-2 bg-[#080c09] hover:bg-[#101712] border border-[#162018] rounded transition-colors flex flex-col gap-1"
                            >
                              {/* Primary Row: Timestamp, Status Pill, Target Destination, Visitor Chip */}
                              <div className="flex items-center justify-between gap-1.5 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 truncate">
                                  {/* Timestamp */}
                                  <span className="text-[#4e6453] text-[9px] sm:text-[10px] font-semibold shrink-0" title={date.toLocaleString()}>
                                    [{timeOnly}<span className="hidden sm:inline"> · {dateStr}</span>]
                                  </span>

                                  {/* Categorized Status Pill */}
                                  {log.slug === 'telemetry-terminal' ? (
                                    <span className="shrink-0 px-1.5 py-0.2 rounded text-[7.5px] sm:text-[8px] uppercase font-bold tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                                      <span className="hidden sm:inline">TERMINAL</span>
                                      <span className="sm:hidden">TERM</span>
                                    </span>
                                  ) : isNew ? (
                                    <span className="shrink-0 px-1.5 py-0.2 rounded text-[7.5px] sm:text-[8px] uppercase font-bold tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-700/80">
                                      <span className="hidden sm:inline">NEW NODE</span>
                                      <span className="sm:hidden">NEW</span>
                                    </span>
                                  ) : (
                                    <span className="shrink-0 px-1.5 py-0.2 rounded text-[7.5px] sm:text-[8px] uppercase font-bold tracking-wider bg-[#1c180a] text-amber-300 border border-amber-800/80">
                                      <span className="hidden sm:inline">RETURN</span>
                                      <span className="sm:hidden">RET</span>
                                    </span>
                                  )}

                                  {/* Destination Title */}
                                  <span className="text-[#a4c9ad] hover:text-emerald-300 transition-colors truncate text-[11px] sm:text-xs font-medium flex items-center gap-1">
                                    {log.slug === 'telemetry-terminal' && (
                                      <Terminal className="w-3 h-3 text-cyan-400 shrink-0 inline" />
                                    )}
                                    <span className="truncate">{getArticleTitle(log.slug)}</span>
                                  </span>
                                </div>

                                {/* Clickable Visitor ID Chip */}
                                <div className="shrink-0">
                                  {isCurrentVisitor ? (
                                    <button
                                      type="button"
                                      onClick={() => setSearchUserId(log.visitorId)}
                                      title="Click to search full database history for your node"
                                      className="text-[8.5px] sm:text-[9.5px] text-emerald-300 bg-emerald-950/60 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-700/60 font-mono font-semibold hover:bg-emerald-900/80 hover:border-emerald-500 transition-colors cursor-pointer"
                                    >
                                      {log.visitorId} <span className="hidden sm:inline">(YOU)</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setSearchUserId(log.visitorId)}
                                      title={`Click to search complete database history for node ${log.visitorId}`}
                                      className="text-[8.5px] sm:text-[9.5px] text-[#637d68] bg-[#0d140f] px-1.5 sm:px-2 py-0.5 rounded border border-[#1c271f] font-mono hover:text-emerald-400 hover:border-[#2f3f33] transition-colors cursor-pointer"
                                    >
                                      {log.visitorId}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Secondary Row: Device Info (Browser + OS) and Elapsed Time */}
                              <div className="flex items-center justify-between text-[8.5px] sm:text-[9.5px] font-mono border-t border-[#121a14] pt-1 text-[#5e7765]">
                                <div className="flex items-center gap-1.5 text-[#738e7a] min-w-0 truncate">
                                  <Monitor className="w-3 h-3 text-emerald-500/70 shrink-0" />
                                  <span className="text-[#96b49e] font-semibold">
                                    {displayBrowser || (isCurrentVisitor ? clientEnv.browser : 'Client Browser')}
                                  </span>
                                  <span className="text-[#3c4f41]">·</span>
                                  <span className="text-[#6d8874]">
                                    {displayOs || (isCurrentVisitor ? clientEnv.os : 'Client OS')}
                                  </span>
                                  {isCurrentVisitor && (
                                    <span className="text-[7px] sm:text-[7.5px] px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold ml-1 uppercase">
                                      Your Device
                                    </span>
                                  )}
                                </div>
                                <span className="text-[#415546] shrink-0 text-[8px] sm:text-[9px] ml-2 font-mono">
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

                {/* 3. Footer Protocol Banner (Compact) */}
                <div className="shrink-0 p-2 sm:p-2.5 bg-[#0a0f0c] border border-[#18231a] rounded text-[10px] sm:text-[11px] text-[#4f6454] leading-relaxed select-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <div>
                    <span className="text-emerald-400 font-bold mr-1">PROTOCOL SUMMARY:</span>
                    {isSandbox 
                      ? "Sandbox mode engaged. Analytics persist safely in browser sandbox storage."
                      : "Telemetry uplink synchronized with Backwoods central Firestore cluster. Visitor sessions strictly anonymized."}
                  </div>
                  <div className="text-[8.5px] sm:text-[9.5px] text-[#3f5043] shrink-0 font-mono">
                    PRESS <kbd className="px-1.5 py-0.2 bg-[#121914] border border-[#1e2a21] text-[#788e7d] rounded text-[7.5px] sm:text-[8px]">ESC</kbd> TO EXIT TERMINAL
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
