/**
 * ========================================================================================
 * AI ASSISTANT MAINTENANCE NOTICE & CONTROL PROTOCOL:
 * ========================================================================================
 * REMINDER FOR AI ASSISTANTS:
 * The Telemetry system (StatsModal & LiveRadiansTab) is the secret control panel of the wiki.
 * It provides live multi-client synchronization, celestial rotation telemetry, real-time audit
 * log analysis, and secret admin override capabilities for the Backwoods Survival Index.
 * ========================================================================================
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Compass, 
  RotateCw, 
  RotateCcw, 
  Sparkles, 
  Play, 
  Pause, 
  Zap, 
  Check, 
  Radio, 
  Layers, 
  Gauge, 
  Sliders, 
  Maximize2 
} from 'lucide-react';
import { 
  getLiveRadiansState, 
  subscribeRadiansState, 
  broadcastRadiansUpdate, 
  CelestialRadiansState, 
  DEFAULT_RADIANS_STATE 
} from '../../utils/radiansSync';
import { useTheme } from '../../context/ThemeContext';

interface LiveRadiansTabProps {
  visitorId: string;
}

const PRESETS = [
  { label: 'Authentic Celestial Drift', speed: 0.000075, tag: '0.000075 rad/s' },
  { label: 'Steady Planetary Orbit', speed: 0.002, tag: '0.002000 rad/s' },
  { label: 'High-Velocity Celestial Spin', speed: 0.015, tag: '0.015000 rad/s' },
  { label: 'Warp Streaks (Motion Blur)', speed: 0.05, tag: '0.050000 rad/s' },
  { label: 'Hyper-Speed Velocity (Max 5.0)', speed: 5.0, tag: '5.000000 rad/s' },
  { label: 'Stationary Celestial Zero', speed: 0, tag: '0.000000 rad/s' },
];

export default function LiveRadiansTab({ visitorId }: LiveRadiansTabProps) {
  const { theme, setTheme } = useTheme();
  const [state, setState] = useState<CelestialRadiansState>(getLiveRadiansState);
  const [inputSpeed, setInputSpeed] = useState<string>(() => state.angularSpeed.toFixed(6));
  const [liveAngle, setLiveAngle] = useState<number>(0);
  const [recentSyncBadge, setRecentSyncBadge] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const stateRef = useRef<CelestialRadiansState>(state);

  // Keep stateRef in sync with state for zero-lag RAF loop
  useEffect(() => {
    stateRef.current = state;
    setInputSpeed(state.angularSpeed.toFixed(6));
  }, [state]);

  // Subscribe to real-time broadcasts
  useEffect(() => {
    const unsubscribe = subscribeRadiansState((newState) => {
      setState(newState);
      setRecentSyncBadge(true);
      const timer = setTimeout(() => setRecentSyncBadge(false), 1200);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, []);

  // Real-time canvas radar sweep loop
  useEffect(() => {
    let animId: number;

    const renderDial = (currentTime: number) => {
      const dt = Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = currentTime;

      const currentSpeed = stateRef.current.isPaused ? 0 : stateRef.current.angularSpeed;
      angleRef.current = (angleRef.current + currentSpeed * dt) % (Math.PI * 2);
      if (angleRef.current < 0) angleRef.current += Math.PI * 2;

      setLiveAngle(angleRef.current);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const cx = w / 2;
          const cy = h / 2;
          const radius = Math.min(w, h) * 0.42;

          ctx.clearRect(0, 0, w, h);

          // Radar background glow
          const bgGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
          bgGrad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
          bgGrad.addColorStop(0.8, 'rgba(6, 78, 59, 0.04)');
          bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = bgGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Outer concentric grid rings
          [0.35, 0.65, 1.0].forEach((ratio, idx) => {
            ctx.beginPath();
            ctx.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
            ctx.strokeStyle = idx === 2 ? 'rgba(52, 211, 153, 0.45)' : 'rgba(52, 211, 153, 0.15)';
            ctx.lineWidth = idx === 2 ? 1.5 : 1;
            ctx.setLineDash(idx === 1 ? [4, 4] : []);
            ctx.stroke();
            ctx.setLineDash([]);
          });

          // Cardinal coordinate axes
          ctx.beginPath();
          ctx.moveTo(cx - radius * 1.05, cy);
          ctx.lineTo(cx + radius * 1.05, cy);
          ctx.moveTo(cx, cy - radius * 1.05);
          ctx.lineTo(cx, cy + radius * 1.05);
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Radian tick marks around perimeter (16 sectors = π/8 intervals)
          const totalTicks = 16;
          for (let i = 0; i < totalTicks; i++) {
            const rad = (i * Math.PI * 2) / totalTicks;
            const isMajor = i % 4 === 0;
            const isSemi = i % 2 === 0;
            const tickLen = isMajor ? 9 : isSemi ? 6 : 3;

            const x1 = cx + Math.cos(rad) * radius;
            const y1 = cy + Math.sin(rad) * radius;
            const x2 = cx + Math.cos(rad) * (radius - tickLen);
            const y2 = cy + Math.sin(rad) * (radius - tickLen);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = isMajor ? 'rgba(52, 211, 153, 0.8)' : 'rgba(52, 211, 153, 0.3)';
            ctx.lineWidth = isMajor ? 1.5 : 1;
            ctx.stroke();
          }

          // Rotating Sweep Reticle (indicates active live angular position)
          const sweepAngle = angleRef.current;
          const sweepX = cx + Math.cos(sweepAngle) * radius;
          const sweepY = cy + Math.sin(sweepAngle) * radius;

          // Sweep trail cone
          const sweepTrailSteps = 24;
          for (let step = 0; step < sweepTrailSteps; step++) {
            const tRatio = step / sweepTrailSteps;
            const trailAngle = sweepAngle - (tRatio * 0.5 * Math.sign(currentSpeed || 1));
            const alpha = (1 - tRatio) * 0.25;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, trailAngle, trailAngle + 0.02 * Math.sign(currentSpeed || 1));
            ctx.closePath();
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.fill();
          }

          // Main needle line
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sweepX, sweepY);
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.95)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Target reticle head
          ctx.beginPath();
          ctx.arc(sweepX, sweepY, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#34d399';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Center anchor pivot
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#34d399';
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(renderDial);
    };

    animId = requestAnimationFrame(renderDial);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    broadcastRadiansUpdate({ angularSpeed: newSpeed }, visitorId);
  }, [visitorId]);

  const handleManualInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputSpeed);
    if (!isNaN(val)) {
      const clamped = Math.max(-5.0, Math.min(5.0, val));
      handleSpeedChange(clamped);
    }
  };

  const handleNudgePhase = (deltaRad: number) => {
    angleRef.current = (angleRef.current + deltaRad) % (Math.PI * 2);
    if (angleRef.current < 0) angleRef.current += Math.PI * 2;
    setLiveAngle(angleRef.current);
    broadcastRadiansUpdate({ phaseOffset: angleRef.current }, visitorId);
  };

  const degreesPerSec = (state.angularSpeed * (180 / Math.PI)).toFixed(2);
  const rpm = ((state.angularSpeed * 60) / (Math.PI * 2)).toFixed(3);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto gap-3 text-[#cbd5e1] font-mono select-none pr-1">
      {/* Top Protocol Status Bar */}
      <div className="shrink-0 p-2 sm:p-2.5 bg-[#090f0c] border border-[#1b261e] rounded flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
            LIVE RADIANS BROADCAST BUS
          </span>
          <span className="text-[10px] text-[#4f6454] hidden sm:inline">|</span>
          <span className="text-[10px] text-[#637d68] hidden sm:inline">
            SYNCHRONIZED VIA FIRESTORE CLUSTER
          </span>
        </div>

        <div className="flex items-center gap-2">
          {recentSyncBadge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 animate-pulse">
              PACKET RECEIVED
            </span>
          )}
          <span className="text-[10px] text-[#4f6454]">
            NODE: <span className="text-emerald-300 font-semibold">{state.updatedBy || 'SYSTEM'}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Radar Scope (Left) + Master Controllers (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Column: Live Gyroscope Radar Dial & Telemetric Vector */}
        <div className="lg:col-span-5 bg-[#0a0f0c] border border-[#18231a] rounded p-3 flex flex-col items-center justify-between gap-3">
          <div className="w-full flex items-center justify-between border-b border-[#18231a] pb-1.5 text-[10px] uppercase text-[#637d68] tracking-wider">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>RADIAN RADAR RETICLE</span>
            </div>
            <span className="text-emerald-400 font-bold">
              θ = {liveAngle.toFixed(4)} rad
            </span>
          </div>

          {/* Interactive Radar Canvas */}
          <div className="relative flex items-center justify-center p-2">
            <canvas 
              ref={canvasRef} 
              width={240} 
              height={240} 
              className="w-52 h-52 sm:w-56 sm:h-56 rounded-full border border-emerald-900/30 bg-[#060a08] shadow-[0_0_20px_rgba(16,185,129,0.06)]"
            />
            {/* Overlay cardinal markers */}
            <span className="absolute top-3 text-[9px] font-bold text-emerald-400/80">0 rad / N</span>
            <span className="absolute right-3 text-[9px] font-bold text-emerald-400/80">π/2 rad</span>
            <span className="absolute bottom-3 text-[9px] font-bold text-emerald-400/80">π rad / S</span>
            <span className="absolute left-3 text-[9px] font-bold text-emerald-400/80">3π/2 rad</span>
          </div>

          {/* Telemetry Metrics Readout */}
          <div className="w-full grid grid-cols-3 gap-1.5 text-center bg-[#070b08] p-2 rounded border border-[#141d16] text-[10px]">
            <div>
              <div className="text-[#4f6454] text-[8.5px] uppercase">ANGULAR VELOCITY</div>
              <div className="text-emerald-300 font-bold text-[11px] font-mono">
                {state.angularSpeed >= 0 ? '+' : ''}{state.angularSpeed.toFixed(6)}
              </div>
              <div className="text-[8px] text-[#4f6454]">rad / sec</div>
            </div>
            <div>
              <div className="text-[#4f6454] text-[8.5px] uppercase">ARC ROTATION</div>
              <div className="text-cyan-300 font-bold text-[11px] font-mono">
                {degreesPerSec}°/s
              </div>
              <div className="text-[8px] text-[#4f6454]">arc deg / sec</div>
            </div>
            <div>
              <div className="text-[#4f6454] text-[8.5px] uppercase">ORBIT FREQ</div>
              <div className="text-amber-300 font-bold text-[11px] font-mono">
                {rpm} RPM
              </div>
              <div className="text-[8px] text-[#4f6454]">rev / min</div>
            </div>
          </div>

          {/* Theme Status */}
          <div className="w-full flex items-center justify-end text-[9.5px] px-1 text-[#637d68]">
            <span className="text-[#4f6454]">
              THEME: <span className={theme === 'starlight' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{theme.toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* Right Column: Sliders, Presets, and Direct Numeric Control */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
          {/* Master Speed Slider Card */}
          <div className="bg-[#0a0f0c] border border-[#18231a] rounded p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-[#18231a] pb-1.5">
              <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                LIVE RADIANS SLIDER (MAX ±5.0 rad/s)
              </span>
              <button
                type="button"
                onClick={() => broadcastRadiansUpdate({ isPaused: !state.isPaused }, visitorId)}
                className={`px-2 py-0.5 rounded text-[9.5px] font-semibold uppercase flex items-center gap-1 transition-colors cursor-pointer ${
                  state.isPaused 
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800' 
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/80'
                }`}
              >
                {state.isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                {state.isPaused ? 'RESUME ORBIT' : 'HALT ORBIT'}
              </button>
            </div>

            {/* Range Slider max 5.0 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] text-[#637d68]">
                <span>-5.000000 rad/s (Retrograde)</span>
                <span className="text-emerald-300 font-bold text-xs bg-[#060a08] px-2 py-0.5 rounded border border-[#18231a]">
                  {state.angularSpeed >= 0 ? '+' : ''}{state.angularSpeed.toFixed(6)} rad/s
                </span>
                <span>+5.000000 rad/s (Prograde)</span>
              </div>
              <input
                type="range"
                min="-5.0"
                max="5.0"
                step="0.0001"
                value={state.angularSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#121a15] rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
              />
            </div>

            {/* Direct Value Input Form */}
            <form onSubmit={handleManualInputSubmit} className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[#637d68] shrink-0">DIRECT INPUT (MAX 5):</span>
              <input
                type="text"
                value={inputSpeed}
                onChange={(e) => setInputSpeed(e.target.value)}
                placeholder="e.g. 5.0"
                className="flex-1 bg-[#060a08] border border-[#1d2920] rounded px-2 py-1 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                APPLY LIVE
              </button>
            </form>
          </div>

          {/* Preset Buttons Grid */}
          <div className="bg-[#0a0f0c] border border-[#18231a] rounded p-3 flex flex-col gap-2">
            <span className="text-[10px] text-[#637d68] font-bold uppercase tracking-wider">
              OPERATIONAL PRESETS (BROADCASTS TO ALL CLIENTS)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PRESETS.map((p) => {
                const isActive = Math.abs(state.angularSpeed - p.speed) < 0.00001;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSpeedChange(p.speed)}
                    className={`p-2 rounded text-left border transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      isActive
                        ? 'bg-emerald-950/80 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                        : 'bg-[#070b08] border-[#162018] hover:border-emerald-800/80 hover:bg-[#0c130e]'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold truncate ${isActive ? 'text-emerald-200' : 'text-[#8eb397]'}`}>
                      {p.label}
                    </span>
                    <span className="text-[8.5px] font-mono text-[#526a58]">
                      {p.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phase Nudge & Auxiliary Drift Controls */}
          <div className="bg-[#0a0f0c] border border-[#18231a] rounded p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-[#18231a] pb-1">
              <span className="text-[10px] text-[#637d68] font-bold uppercase tracking-wider">
                INSTANTANEOUS PHASE SHIFT (Δθ)
              </span>
              <span className="text-[9px] text-[#4f6454]">STEP CELESTIAL POSITION</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleNudgePhase(-Math.PI / 2)}
                className="px-2 py-1 bg-[#070b08] hover:bg-[#101812] border border-[#1a251d] hover:border-emerald-700/60 rounded text-[9.5px] text-[#8eb397] font-semibold transition-colors cursor-pointer"
              >
                -π/2 (-90°)
              </button>
              <button
                type="button"
                onClick={() => handleNudgePhase(-Math.PI / 4)}
                className="px-2 py-1 bg-[#070b08] hover:bg-[#101812] border border-[#1a251d] hover:border-emerald-700/60 rounded text-[9.5px] text-[#8eb397] font-semibold transition-colors cursor-pointer"
              >
                -π/4 (-45°)
              </button>
              <button
                type="button"
                onClick={() => handleNudgePhase(Math.PI / 4)}
                className="px-2 py-1 bg-[#070b08] hover:bg-[#101812] border border-[#1a251d] hover:border-emerald-700/60 rounded text-[9.5px] text-[#8eb397] font-semibold transition-colors cursor-pointer"
              >
                +π/4 (+45°)
              </button>
              <button
                type="button"
                onClick={() => handleNudgePhase(Math.PI / 2)}
                className="px-2 py-1 bg-[#070b08] hover:bg-[#101812] border border-[#1a251d] hover:border-emerald-700/60 rounded text-[9.5px] text-[#8eb397] font-semibold transition-colors cursor-pointer"
              >
                +π/2 (+90°)
              </button>
              <button
                type="button"
                onClick={() => handleNudgePhase(Math.PI)}
                className="px-2 py-1 bg-[#070b08] hover:bg-[#101812] border border-[#1a251d] hover:border-emerald-700/60 rounded text-[9.5px] text-[#8eb397] font-semibold transition-colors cursor-pointer"
              >
                +π (+180°)
              </button>
              <button
                type="button"
                onClick={() => {
                  angleRef.current = 0;
                  setLiveAngle(0);
                  broadcastRadiansUpdate({ phaseOffset: 0 }, visitorId);
                }}
                className="px-2 py-1 bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 rounded text-[9.5px] text-red-300 font-semibold transition-colors cursor-pointer ml-auto"
              >
                ZERO (0 rad)
              </button>
            </div>

            {/* Theme switcher banner if theme is not Starlight */}
            {theme !== 'starlight' && (
              <div className="mt-1 p-2 bg-amber-950/20 border border-amber-900/50 rounded flex items-center justify-between gap-2 text-[10px] text-amber-300">
                <span>The background sky theme is currently set to Emerald. Switch to Starlight to see the live rotation in the background.</span>
                <button
                  type="button"
                  onClick={() => setTheme('starlight')}
                  className="px-2 py-0.5 bg-amber-900/60 hover:bg-amber-800 text-amber-100 rounded text-[9px] font-bold uppercase transition-colors shrink-0 cursor-pointer"
                >
                  ACTIVATE STARLIGHT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

