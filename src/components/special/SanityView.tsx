import React, { useState } from 'react';
import { 
  Skull, 
  Activity, 
  Eye, 
  Clock, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertTriangle, 
  HeartCrack,
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react';
import UpdatedFrame from '../UpdatedFrame';

export default function SanityView() {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      stage: 1,
      title: "Stage One — The Initial Fraying",
      time: "6m 30s",
      ticks: "7,800 ticks",
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/20",
      badge: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
      desc: "Subtle psychological shifts begin. The boundary between environmental ambience and internal auditory hallucinations starts to blur.",
      symptoms: [
        {
          name: "Faint Whispers",
          detail: "Soft, randomized auditory whispers play in the distance (whisper1 through whisper5). These are directional and easily mistaken for background wind or player footsteps."
        },
        {
          name: "Subconscious Unease",
          detail: "Ambient soundscape frequencies experience micro-dropouts, giving the sensation that ambient tracks are hesitating."
        },
        {
          name: "Auditory Ambiguity",
          detail: "Faint wood creaks (wood_creak_1 to wood_creak_5) trigger outside line-of-sight, simulating unprompted movement in nearby plank structures."
        }
      ]
    },
    {
      stage: 2,
      title: "Stage Two — Auditory Dissociation & Sensory Loss",
      time: "10m 24s",
      ticks: "12,480 ticks",
      color: "border-amber-500/40 text-amber-400 bg-amber-950/20",
      badge: "bg-amber-900/40 text-amber-300 border-amber-700/50",
      desc: "Sensory processing begins to collapse. Silence becomes aggressive and vision is intermittently throttled.",
      symptoms: [
        {
          name: "Abrupt Music Halting",
          detail: "Background music abruptly cuts out entirely without fading, leaving an oppressive atmospheric void."
        },
        {
          name: "Darkness Pulses",
          detail: "The player is struck with spontaneous Darkness status effects lasting 3.0 seconds (60 ticks), constricting vision to immediate proximity."
        },
        {
          name: "Cave Auditory Injections",
          detail: "Vanilla cave ambiance stingers play unprompted in open sky environments, disorienting spatial awareness."
        },
        {
          name: "Amplified Whispers",
          detail: "Whisper audio events increase in volume, frequency, and spatial proximity."
        }
      ]
    },
    {
      stage: 3,
      title: "Stage Three — Cognitive Distortion & Hallucinatory Paranoia",
      time: "18m 12s",
      ticks: "21,840 ticks",
      color: "border-orange-500/40 text-orange-400 bg-orange-950/20",
      badge: "bg-orange-900/40 text-orange-300 border-orange-700/50",
      desc: "Severe neuro-perceptual breakdown. Auditory hallucinations mimic actual survival sounds to manipulate player decision-making.",
      symptoms: [
        {
          name: "Degradation Sound Stinger",
          detail: "A deep, heavily distorted audio event (degradation_o1) plays directly at the player's position, accompanied by sudden screen jolts."
        },
        {
          name: "Camera Incoherence",
          detail: "Micro camera shakes and subtle pitch tilts disorient navigation, simulating intense vertigo."
        },
        {
          name: "Phantom Interaction Sounds",
          detail: "Chest opening/closing noises, distant bell tolls, wood cracking (wood_crack_1 to wood_crack_7), and footsteps play phantom-style around the player."
        },
        {
          name: "Prolonged Darkness",
          detail: "Darkness pulses occur more frequently with extended duration, making navigating uneven terrain treacherous."
        }
      ]
    },
    {
      stage: 4,
      title: "Stage Four — Complete Cognitive Collapse & Reality Failure",
      time: "26m 00s",
      ticks: "31,200 ticks",
      color: "border-red-500/50 text-red-400 bg-red-950/30",
      badge: "bg-red-900/50 text-red-300 border-red-700/60 animate-pulse",
      desc: "Terminal state of Mental Degradation. The mind fractures, causing environmental reality to destabilize.",
      symptoms: [
        {
          name: "Master Silence",
          detail: "All non-essential audio is silenced; ambient tracks, wind, and distant mob sounds cease entirely."
        },
        {
          name: "Spontaneous Wood Decay",
          detail: "Nearby Oak Planks and Rotten Oak Wood blocks experience spontaneous visual decay and phantom cracking."
        },
        {
          name: "Dimensional Phase Destabilization",
          detail: "Extreme degradation triggers spontaneous phase pulls, forcing dimensional displacement into The Loss or The Grain."
        },
        {
          name: "Severe Visual Vignette",
          detail: "Vision borders darken heavily with chromatic aberration, severely limiting situational awareness."
        }
      ]
    }
  ];

  return (
    <UpdatedFrame id="sanity_page_view" isUpdated={true}>
      <div className="space-y-10 max-w-[1000px] mx-auto text-[#c9d1c9]">
        
        {/* HERO SECTION */}
        <div className="p-6 sm:p-8 bg-[#0c0f0d] border border-[#1e2720] rounded-xl space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-950/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#709978]">
            <Skull className="w-4 h-4 text-emerald-400" />
            <span>Core Psychological Survival System</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#e0e7e0] tracking-tight">
            Mental Degradation
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-[#a9bcae]">
            In the Backwoods, the primary threat is not merely physical fauna — it is prolonged psychological exposure to an anomalous, non-Euclidean reality. The human psyche degrades progressively the longer an explorer remains within affected dimensions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
            <div className="p-3 bg-[#111613] border border-[#1d2720] rounded-lg">
              <span className="text-[10px] font-mono uppercase text-[#5a6b5e] block">Tracking Logic</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">Tick-Based Global Timer</span>
            </div>
            <div className="p-3 bg-[#111613] border border-[#1d2720] rounded-lg">
              <span className="text-[10px] font-mono uppercase text-[#5a6b5e] block">Adaptation Threshold</span>
              <span className="text-xs font-mono text-amber-400 font-bold">20 Minutes (24,000 ticks)</span>
            </div>
            <div className="p-3 bg-[#111613] border border-[#1d2720] rounded-lg">
              <span className="text-[10px] font-mono uppercase text-[#5a6b5e] block">Reset Mechanism</span>
              <span className="text-xs font-mono text-[#709978] font-bold">Dimension Evacuation / Remedy</span>
            </div>
          </div>
        </div>

        {/* REALITY ADAPTATION MECHANIC */}
        <div className="p-6 bg-[#0f1310] border border-[#1d261f] rounded-xl space-y-4 shadow-md">
          <div className="flex items-center gap-2.5 text-amber-400 font-mono text-xs uppercase font-bold tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Reality Adaptation Mechanic</span>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-[#c9d1c9]">
            If a player survives continuously within the Backwoods for <strong className="text-amber-300">20 minutes (24,000 ticks)</strong> without triggering fatal collapse, their neural pathways begin developing <strong className="text-emerald-400">Reality Adaptation</strong>.
          </p>

          <div className="p-4 bg-[#141b16] border-l-2 border-amber-500 rounded-r-lg space-y-2 text-xs">
            <div className="text-amber-300 font-semibold uppercase tracking-wider font-mono text-[11px]">Adaptation Effect:</div>
            <p className="text-[#9eb0a1] leading-relaxed">
              Extends subsequent degradation stage threshold timings by <strong className="text-amber-300">+15%</strong>. This grants hardened explorers slightly wider windows of clarity during long deep-realm expeditions.
            </p>
          </div>
        </div>

        {/* INTERACTIVE STAGE SELECTOR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#e0e7e0] flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Degradation Progression Stages</span>
            </h2>
            <span className="text-xs font-mono text-[#5a6b5e]">4 Sequential Phases</span>
          </div>

          {/* Stage Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stages.map(st => (
              <button
                key={st.stage}
                onClick={() => setActiveStage(st.stage)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeStage === st.stage
                    ? `${st.color} shadow-lg scale-[1.02]`
                    : 'bg-[#0b0e0c] hover:bg-[#121713] text-[#718274] border-[#161e18]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Stage {st.stage}</span>
                  <span className="text-[10px] font-mono opacity-80">{st.time}</span>
                </div>
                <span className="font-serif text-xs font-semibold text-[#e0e7e0] truncate w-full">
                  {st.stage === 1 ? 'Initial Fraying' : st.stage === 2 ? 'Sensory Loss' : st.stage === 3 ? 'Cognitive Distortion' : 'Reality Failure'}
                </span>
              </button>
            ))}
          </div>

          {/* Active Stage Detailed Card */}
          {(() => {
            const cur = stages.find(s => s.stage === activeStage) || stages[0];
            return (
              <div className={`p-6 rounded-xl border ${cur.color} bg-[#0c100d] space-y-6 shadow-xl`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2a21] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#5a6b5e]">Stage Profile</span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#e0e7e0] mt-0.5">{cur.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${cur.badge}`}>
                      {cur.time} ({cur.ticks})
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#a9d1b0] leading-relaxed italic">
                  "{cur.desc}"
                </p>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#5a6b5e] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    Documented Symptoms & Behavioral Manifestations
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cur.symptoms.map((sym, idx) => (
                      <div key={idx} className="p-3.5 bg-[#0e1410] border border-[#1a251c] rounded-lg space-y-1.5">
                        <div className="font-serif text-sm font-semibold text-[#e0e7e0] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {sym.name}
                        </div>
                        <p className="text-xs text-[#829285] leading-relaxed pl-3.5">
                          {sym.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* COUNTERMEASURES & RECOVERY */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#e0e7e0] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Countermeasures & Medical Recovery</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Pale Remedy */}
            <div className="p-5 bg-[#0a0d0b] border border-[#1c261e] rounded-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#e0e7e0] font-serif text-sm font-bold">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Pale Remedy</span>
                </div>
                <p className="text-xs text-[#829285] leading-relaxed">
                  Brewed pharmaceutical draft crafted from harvested spores. When consumed, resets degradation exposure ticks by a substantial margin, staving off Stage 3 and 4 hallucinations.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-emerald-400 uppercase">
                EFFECT: -8,000 Ticks Exposure
              </div>
            </div>

            {/* Recovered Pale Remedy */}
            <div className="p-5 bg-[#0a0d0b] border border-[#1c261e] rounded-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#e0e7e0] font-serif text-sm font-bold">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Recovered Pale Remedy</span>
                </div>
                <p className="text-xs text-[#829285] leading-relaxed">
                  Refined variant with stabilized neural binders. Completely resets active mental degradation timer back to zero and grants temporary immunity against darkness pulses.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-cyan-400 uppercase">
                EFFECT: Full Reset (0 Ticks) + Clarity
              </div>
            </div>

            {/* Evacuation Protocol */}
            <div className="p-5 bg-[#0a0d0b] border border-[#1c261e] rounded-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#e0e7e0] font-serif text-sm font-bold">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Dimensional Evacuation</span>
                </div>
                <p className="text-xs text-[#829285] leading-relaxed">
                  Returning to the Overworld or entering sanitized pocket dimensions immediately ceases psychological stress and begins passive neural recalibration.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-[#709978] uppercase">
                EFFECT: Safe Environment Recovery
              </div>
            </div>

          </div>
        </div>

        {/* SUMMARY REFERENCE MATRIX TABLE */}
        <div className="p-5 bg-[#0b0e0c] border border-[#1b251d] rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#e0e7e0] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Degradation Stages Reference Matrix</span>
            </h3>
            <span className="text-[10px] font-mono text-[#5a6b5e] uppercase">Summary Overview</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#1a231b]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#121813] text-[#829285] border-b border-[#1c271e] font-mono text-[11px]">
                  <th className="p-3">Stage</th>
                  <th className="p-3">Trigger Time</th>
                  <th className="p-3">Total Ticks</th>
                  <th className="p-3">Primary Auditory Symptom</th>
                  <th className="p-3">Visual / Physics Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151e16] text-[#c9d1c9]">
                <tr className="hover:bg-[#111713] transition-colors">
                  <td className="p-3 font-bold text-emerald-400">Stage 1</td>
                  <td className="p-3 font-mono">6m 30s</td>
                  <td className="p-3 font-mono">7,800 ticks</td>
                  <td className="p-3">Faint directional whispers (whisper1–5)</td>
                  <td className="p-3 text-[#829285]">None (Auditory only)</td>
                </tr>
                <tr className="hover:bg-[#111713] transition-colors">
                  <td className="p-3 font-bold text-amber-400">Stage 2</td>
                  <td className="p-3 font-mono">10m 24s</td>
                  <td className="p-3 font-mono">12,480 ticks</td>
                  <td className="p-3">Music halts instantly; cave stingers inject</td>
                  <td className="p-3 text-amber-300">Darkness pulses (3.0s duration)</td>
                </tr>
                <tr className="hover:bg-[#111713] transition-colors">
                  <td className="p-3 font-bold text-orange-400">Stage 3</td>
                  <td className="p-3 font-mono">18m 12s</td>
                  <td className="p-3 font-mono">21,840 ticks</td>
                  <td className="p-3">Distorted degradation_o1 stinger; phantom chests & bells</td>
                  <td className="p-3 text-orange-300">Camera jolts, pitch disorientation</td>
                </tr>
                <tr className="hover:bg-[#111713] transition-colors">
                  <td className="p-3 font-bold text-red-400">Stage 4</td>
                  <td className="p-3 font-mono">26m 00s</td>
                  <td className="p-3 font-mono">31,200 ticks</td>
                  <td className="p-3">Master silence blanket across all channels</td>
                  <td className="p-3 text-red-300 font-semibold">Wood decay, forced phase displacements</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </UpdatedFrame>
  );
}
