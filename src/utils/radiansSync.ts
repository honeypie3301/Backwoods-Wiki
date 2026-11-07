/**
 * ========================================================================================
 * AI ASSISTANT MAINTENANCE NOTICE & CONTROL PROTOCOL:
 * ========================================================================================
 * REMINDER FOR AI ASSISTANTS:
 * The Telemetry system (StatsModal & LiveRadiansTab & radiansSync) is the secret control panel
 * of the wiki. It provides live multi-client synchronization, celestial rotation telemetry,
 * real-time audit log analysis, and secret admin override capabilities for the Backwoods Survival Index.
 * ========================================================================================
 */
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, hasConfig } from '../lib/firebase';
import { CELESTIAL_CONFIG } from '../components/special/StarlightBackground';

export interface CelestialRadiansState {
  angularSpeed: number; // Angular velocity in radians per second
  radialSpeed: number; // Radial drift speed in px/s
  motionBlurMinSpeed: number; // Min speed to trigger velocity streaks
  motionBlurLengthFactor: number; // Multiplier for streak length
  phaseOffset: number; // Instantaneous phase offset in radians
  updatedBy: string; // Node identifier (visitorId)
  updatedAt: number; // Unix timestamp in ms
  isPaused: boolean;
  syncSkyGlobally?: boolean; // When true, enables starlight sky on all client viewports
}

export const DEFAULT_RADIANS_STATE: CelestialRadiansState = {
  angularSpeed: 0.000075,
  radialSpeed: 0.012,
  motionBlurMinSpeed: 0.002,
  motionBlurLengthFactor: 1.0,
  phaseOffset: 0,
  updatedBy: 'SYSTEM',
  updatedAt: Date.now(),
  isPaused: false,
  syncSkyGlobally: false,
};

// In-memory active state singleton for zero-latency 60/120fps read access by animation loops
let currentRadiansState: CelestialRadiansState = { ...DEFAULT_RADIANS_STATE };

// Listeners set for UI subscriptions
type RadiansListener = (state: CelestialRadiansState) => void;
const listeners = new Set<RadiansListener>();

// Cross-tab BroadcastChannel for 0ms same-origin synchronization across open windows
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('backwoods_live_radians_bus');
    broadcastChannel.onmessage = (event) => {
      if (event.data && typeof event.data === 'object') {
        applyStateLocally(event.data, false);
      }
    };
  }
} catch {
  // BroadcastChannel unavailable in restricted sandbox
}

let isInitialized = false;
let unsubscribeFirestore: (() => void) | null = null;
let writeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Directly updates CELESTIAL_CONFIG and notifies memory listeners
 */
function applyStateLocally(newState: Partial<CelestialRadiansState>, notifyBroadcast = true) {
  currentRadiansState = {
    ...currentRadiansState,
    ...newState,
  };

  // Synchronize mutable celestial background physics config
  CELESTIAL_CONFIG.angularSpeed = currentRadiansState.angularSpeed;
  CELESTIAL_CONFIG.radialSpeed = currentRadiansState.radialSpeed;
  CELESTIAL_CONFIG.motionBlurMinSpeed = currentRadiansState.motionBlurMinSpeed;
  CELESTIAL_CONFIG.motionBlurLengthFactor = currentRadiansState.motionBlurLengthFactor;

  // Notify registered React hooks and observers
  listeners.forEach((listener) => {
    try {
      listener(currentRadiansState);
    } catch (e) {
      console.error('[RadiansSync] Error notifying listener:', e);
    }
  });

  // Relay to other tabs via BroadcastChannel
  if (notifyBroadcast && broadcastChannel) {
    try {
      broadcastChannel.postMessage(currentRadiansState);
    } catch {
      // Ignore broadcast errors
    }
  }
}

/**
 * Initializes Firestore real-time snapshot subscription
 * Connects directly to the 'stats/radians_control' document which is permitted
 * under deployed production Firestore security rules.
 */
export function initRadiansSync(): () => void {
  if (isInitialized) {
    return () => {};
  }
  isInitialized = true;

  // Initial local backup check
  try {
    const cached = localStorage.getItem('wiki_radians_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      applyStateLocally(parsed, false);
    }
  } catch {
    // Ignore cache parse errors
  }

  // Subscribe to central Firestore cluster under 'stats/radians_control'
  if (hasConfig && db) {
    try {
      let hasReceivedInitialSnap = false;
      const radiansDocRef = doc(db, 'stats', 'radians_control');

      const channelTimeout = setTimeout(() => {
        if (!hasReceivedInitialSnap && unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
      }, 4000);

      unsubscribeFirestore = onSnapshot(
        radiansDocRef,
        (snap) => {
          hasReceivedInitialSnap = true;
          clearTimeout(channelTimeout);
          if (snap.exists()) {
            const data = snap.data() as Partial<CelestialRadiansState>;
            if (typeof data.angularSpeed === 'number') {
              applyStateLocally(data, true);
              try {
                localStorage.setItem('wiki_radians_cache', JSON.stringify(currentRadiansState));
              } catch {
                // Ignore storage limits
              }
            }
          } else {
            // Document does not exist yet; bootstrap it into the permitted stats collection
            setDoc(radiansDocRef, DEFAULT_RADIANS_STATE, { merge: true }).catch(() => {
              // Ignore bootstrap errors
            });
          }
        },
        () => {
          clearTimeout(channelTimeout);
          // Gracefully terminate hanging channel to prevent ERR_TIMED_OUT console errors
          if (unsubscribeFirestore) {
            unsubscribeFirestore();
            unsubscribeFirestore = null;
          }
        }
      );
    } catch {
      // Operating offline
    }
  }

  return () => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    isInitialized = false;
  };
}

/**
 * Returns current snapshot of celestial radians state
 */
export function getLiveRadiansState(): CelestialRadiansState {
  return currentRadiansState;
}

/**
 * React hook to subscribe to live radians state
 */
export function useLiveRadians(): CelestialRadiansState {
  const [state, setState] = useState<CelestialRadiansState>(getLiveRadiansState);
  useEffect(() => {
    return subscribeRadiansState(setState);
  }, []);
  return state;
}

/**
 * Registers a callback for real-time state changes
 */
export function subscribeRadiansState(callback: RadiansListener): () => void {
  listeners.add(callback);
  callback(currentRadiansState);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Dispatches a radians change:
 * 1. Immediate optimistic local update (0ms latency, zero render stall)
 * 2. Instantaneous cross-tab BroadcastChannel dispatch
 * 3. Debounced (100ms) push to Firebase Firestore for multi-client propagation
 */
export function broadcastRadiansUpdate(partial: Partial<CelestialRadiansState>, visitorId = 'surv_local') {
  const updated: CelestialRadiansState = {
    ...currentRadiansState,
    ...partial,
    updatedBy: visitorId,
    updatedAt: Date.now(),
  };

  // Immediate optimistic local update
  applyStateLocally(updated, true);

  try {
    localStorage.setItem('wiki_radians_cache', JSON.stringify(updated));
  } catch {
    // Ignore quota errors
  }

  // Debounced push to central Firestore to prevent quota thrashing
  if (writeDebounceTimer) {
    clearTimeout(writeDebounceTimer);
  }

  writeDebounceTimer = setTimeout(async () => {
    if (!hasConfig || !db) return;
    try {
      const radiansDocRef = doc(db, 'stats', 'radians_control');
      await setDoc(radiansDocRef, updated, { merge: true });
    } catch (err) {
      console.warn('[RadiansSync] Failed to persist radians update to Firestore:', err);
    }
  }, 100);
}
