import { doc, setDoc, addDoc, collection, increment, serverTimestamp } from 'firebase/firestore';
import { db, hasConfig } from '../lib/firebase';
import { detectClientEnvironment } from './deviceInfo';

// 600ms in-memory cache to prevent duplicate click tracking from rapid double clicks or bubbling
const recentClicks = new Map<string, number>();

export interface ClickTrackingOptions {
  page: string;
  target: string;
  category?: string;
}

/**
 * Tracks user click interactions (item selection, block inspection, navigation links, etc.)
 * directly to the central Firebase Firestore telemetry database without sandbox degradation.
 */
export async function trackTelemetryClick(options: ClickTrackingOptions | string, targetName?: string) {
  try {
    // Abort if telemetry tracking is disabled for this device
    if (typeof window !== 'undefined' && localStorage.getItem('wiki_telemetry_ignore_device') === 'true') {
      return;
    }

    const page = typeof options === 'string' ? options : options.page;
    const target = typeof options === 'string' ? (targetName || '') : options.target;
    const category = typeof options === 'object' ? options.category : undefined;

    const cleanTarget = target.trim();
    if (!cleanTarget) return;

    // Deduplication check: ignore identical clicks within 600ms
    const dedupKey = `${page}::${cleanTarget}`;
    const now = Date.now();
    const lastTime = recentClicks.get(dedupKey) || 0;
    if (now - lastTime < 600) {
      return;
    }
    recentClicks.set(dedupKey, now);

    // Keep cache bounded
    if (recentClicks.size > 80) {
      const expiry = now - 5000;
      for (const [k, v] of recentClicks.entries()) {
        if (v < expiry) recentClicks.delete(k);
      }
    }

    let visitorId = localStorage.getItem('wiki_visitor_id');
    if (!visitorId) {
      visitorId = 'surv_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('wiki_visitor_id', visitorId);
    }
    const shortVisitorId = visitorId.substring(0, 12);
    const clientEnv = detectClientEnvironment();

    // Normalized target slug format e.g. "items:steel_charcoal"
    const normalizedTarget = cleanTarget.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48);
    const slug = `${page}:${normalizedTarget}`;

    // Update local cache so terminal has immediate optimistic visibility
    try {
      const localStatsStr = localStorage.getItem('local_wiki_stats');
      if (localStatsStr) {
        const localStats = JSON.parse(localStatsStr);
        localStats.totalCount = (localStats.totalCount || 0) + 1;
        if (!localStats.pageViews) localStats.pageViews = {};
        localStats.pageViews[slug] = (localStats.pageViews[slug] || 0) + 1;
        if (!localStats.logs) localStats.logs = [];
        localStats.logs.unshift({
          timestamp: new Date().toISOString(),
          type: 'click',
          slug,
          target: cleanTarget,
          page,
          visitorId: shortVisitorId,
          os: clientEnv.os,
          browser: clientEnv.browser
        });
        if (localStats.logs.length > 50) localStats.logs = localStats.logs.slice(0, 50);
        localStorage.setItem('local_wiki_stats', JSON.stringify(localStats));
      }
    } catch {}

    // Live Firebase Firestore logging
    if (hasConfig) {
      const statsDocRef = doc(db, 'stats', 'global');
      const statsWrite = setDoc(statsDocRef, {
        totalCount: increment(1),
        [`pageViews.${slug}`]: increment(1)
      }, { merge: true });

      const logWrite = addDoc(collection(db, 'telemetry_logs'), {
        timestamp: serverTimestamp(),
        type: 'click',
        slug,
        target: cleanTarget,
        page,
        category: category || null,
        visitorId: shortVisitorId,
        os: clientEnv.os,
        browser: clientEnv.browser
      });

      await Promise.all([statsWrite, logWrite]);
    }
  } catch (err) {
    console.warn('Telemetry click registration error:', err);
  }
}
