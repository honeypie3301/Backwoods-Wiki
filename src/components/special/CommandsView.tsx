import React, { useState } from 'react';
import { Terminal, Copy, Check, Info, ShieldAlert, Award, Package, Crosshair, HelpCircle } from 'lucide-react';

interface CommandData {
  cmd: string;
  usage: string;
  category: 'debug' | 'time' | 'sentinel' | 'kits';
  summary: string;
  details: string;
  table?: { col1: string; col2: string }[];
  kits?: {
    name: string;
    description: string;
    items: string[];
    effects?: string[];
  }[];
}

export default function CommandsView() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const commands: CommandData[] = [
    {
      cmd: "/backwoodstime on",
      usage: "/backwoodstime on",
      category: "debug",
      summary: "Enables player debug mode.",
      details: "While active, your current backwoods_time is displayed in real time above your hotbar while inside the Backwoods dimension, and void_time is displayed while inside the Loss dimension."
    },
    {
      cmd: "/backwoodstime off",
      usage: "/backwoodstime off",
      category: "debug",
      summary: "Disables player debug mode.",
      details: "Hides the real-time active timers from above the hotbar."
    },
    {
      cmd: "/setbackwoodstime",
      usage: "/setbackwoodstime [value]",
      category: "time",
      summary: "Directly sets your Backwoods time.",
      details: "Modifies the persistent player backwoods_time value. Essential for instantly testing different stages of mental degradation without waiting for hours.",
      table: [
        { col1: "Degradation Stage 1", col2: "6,000 threshold" },
        { col1: "Degradation Stage 2", col2: "9,600 threshold" },
        { col1: "Degradation Stage 3", col2: "16,800 threshold" },
        { col1: "Degradation Stage 4", col2: "24,000 threshold" }
      ]
    },
    {
      cmd: "/setvoidtime",
      usage: "/setvoidtime [value]",
      category: "time",
      summary: "Directly sets your Loss void time.",
      details: "Sets the player's void_time value inside the Loss dimension. At a value of 12,000 or above, Plaque blocks begin spreading significantly faster following the resonate sound of the bell."
    },
    {
      cmd: "/rotstate",
      usage: "/rotstate [target] totem [on | off | infinity on | infinity off]",
      category: "sentinel",
      summary: "Toggles the Rot sentinel's totem consumption status.",
      details: "Directly controls the ultimate state of the Rot sentinel. When active, the sentinel emits massive sonic shockwaves, enjoys a larger blast radius, deals amplified damage, and fights relentlessly. Setting it to infinity on unlocks its ultimate limit state, granting it massive passive health regeneration."
    },
    {
      cmd: "/combatkit",
      usage: "/combatkit [backwoods | fractus | rot]",
      category: "kits",
      summary: "Equips unified developer combat loadouts.",
      details: "Provides operator-level developer equipment arrays tailored for specific dimensional test trials or entity combat.",
      kits: [
        {
          name: "fractus",
          description: "Optimized stats and items for heavy combat against anomalous Fractus entities.",
          items: [
            "1x Standard Netherite Sword & 1x Bow",
            "128x Tipped Arrows of Strong Harming",
            "64x Fractus Spawn Eggs & 64x Fractus Prime Spawn Eggs"
          ],
          effects: [
            "Max HP boosted directly to 200 (100 Hearts)",
            "Step Height amplified to 3 blocks",
            "Infinite status effects: Regeneration X, Speed X, Resistance X, Saturation"
          ]
        },
        {
          name: "backwoods",
          description: "Maximized survival kit for enduring high-threat environments and base survival testing.",
          items: [
            "Maxed Netherite Armor Set (Protection IV, Unbreaking III, Mending, Thorns IV, Respiration IV, Aqua Affinity, Swift Sneak III, Feather Falling IV, Depth Strider III)",
            "1x Maxed Netherite Axe & 1x Maxed Bow & 1x Shield (off-hand)",
            "128x Tipped Arrows of Strong Harming",
            "128x Torches & 128x Oak Planks",
            "64x Enchanted Golden Apples & 2x Portal Catalysts"
          ]
        },
        {
          name: "rot",
          description: "Extreme combat suite specifically designed for engaging the Rot Sentinel.",
          items: [
            "Maxed Netherite Armor Set (same as Backwoods suite)",
            "1x Maxed Netherite Axe, Maxed Bow, and Maxed Shield (off-hand)",
            "128x Tipped Arrows of Strong Harming & 64x Enchanted Golden Apples",
            "12x Totems of Undying",
            "TACZ Integration: Grants Minigun (AUTO) + infinite Creative Ammo Box if Timeless and Classics Zero is loaded"
          ]
        }
      ]
    }
  ];

  const handleCopy = (cmdString: string) => {
    navigator.clipboard.writeText(cmdString);
    setCopiedCmd(cmdString);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredCmds = activeFilter === 'all' 
    ? commands 
    : commands.filter(c => c.category === activeFilter);

  return (
    <div className="space-y-6 select-text">
      {/* Disclaimer block */}
      <div className="p-5 bg-[#0f1210] border border-[#1c241e] rounded-lg flex gap-3 select-none">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-[#829285] leading-relaxed">
          These commands are operator (cheats) level developer utilities designed specifically for debugging and balancing testing. They require server operator status (OP) enabled.
        </p>
      </div>

      {/* Categories chips */}
      <div className="flex flex-wrap gap-2 border-b border-[#1a221c] pb-3">
        {[
          { id: 'all', label: 'All Utilities' },
          { id: 'debug', label: 'Player Debugging' },
          { id: 'time', label: 'Time Thresholds' },
          { id: 'sentinel', label: 'Sentinel Overload' },
          { id: 'kits', label: 'Developer Combat Kits' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
              activeFilter === cat.id
                ? 'bg-[#1a241d] text-[#a9d1b0] border border-[#2e3e31]'
                : 'bg-transparent text-[#829285] hover:text-[#e0e7e0]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Commands List */}
      <div className="space-y-6">
        {filteredCmds.map((c) => (
          <div 
            key={c.cmd}
            className="p-5 bg-[#0c0e0c] border border-[#1d251e] rounded-xl space-y-4 hover:border-[#2e3e31] transition-all duration-300"
          >
            {/* Command Header / Terminal Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070907] p-3 rounded-lg border border-[#151c16]">
              <div className="flex items-center gap-2 font-mono text-xs text-[#a9d1b0]">
                <Terminal className="w-3.5 h-3.5 text-[#5a6b5e]" />
                <span className="text-[#e0e7e0] font-bold">{c.usage}</span>
              </div>
              
              <button
                onClick={() => handleCopy(c.cmd)}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#121813] hover:bg-[#1a241c] text-[11px] font-mono text-[#a9d1b0] rounded border border-[#243327] transition-all cursor-pointer select-none"
              >
                {copiedCmd === c.cmd ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>

            {/* Description details */}
            <div className="space-y-2 pl-1">
              <h4 className="font-serif text-sm font-semibold text-[#c9d1c9]">{c.summary}</h4>
              <p className="text-xs text-[#829285] leading-relaxed">{c.details}</p>
            </div>

            {/* If has value thresholds table */}
            {c.table && (
              <div className="max-w-xs overflow-hidden rounded border border-[#1a221c] text-xs">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="bg-[#111612] text-[#5a6b5e] border-b border-[#1a221c]">
                      <th className="p-2">Degradation Milestone</th>
                      <th className="p-2 text-right">Ticks Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161d18] text-[#829285]">
                    {c.table.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 font-sans text-xs text-[#c9d1c9]">{row.col1}</td>
                        <td className="p-2 text-right font-bold text-[#709978]">{row.col2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* If is Combat Kits display custom kits breakdown */}
            {c.kits && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
                {c.kits.map((kit) => (
                  <div key={kit.name} className="p-4 bg-[#080908] border border-[#161d17] rounded-lg flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#709978]" />
                        <h5 className="font-serif text-sm font-bold text-[#e0e7e0] uppercase tracking-wide">{kit.name}</h5>
                      </div>
                      
                      <p className="text-[11px] text-[#5a6b5e] leading-relaxed italic">{kit.description}</p>
                      
                      {/* Items lists */}
                      <div className="space-y-1">
                        <div className="text-[9px] font-mono text-[#709978] uppercase font-bold">Gear Added:</div>
                        <ul className="space-y-1 text-[11px] text-[#829285] pl-3 list-disc">
                          {kit.items.map((item, idx) => (
                            <li key={idx} className="leading-tight">{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Attribute modifiers if any */}
                      {kit.effects && (
                        <div className="space-y-1 pt-1.5 border-t border-[#161d17]">
                          <div className="text-[9px] font-mono text-rose-400 uppercase font-bold">Passive Buffs:</div>
                          <ul className="space-y-0.5 text-[11px] text-rose-300/80 pl-3 list-disc">
                            {kit.effects.map((fx, idx) => (
                              <li key={idx} className="leading-tight">{fx}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopy(`/combatkit ${kit.name}`)}
                      className="mt-4 w-full text-center py-1.5 bg-[#101411] hover:bg-[#18201a] border border-[#202c22] rounded text-[10px] font-mono text-[#a9d1b0] transition-all cursor-pointer select-none"
                    >
                      Copy Kit Trigger
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
