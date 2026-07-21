import React, { useState } from 'react';
import { Compass, Sparkles, ShieldAlert, Skull, ArrowDown, Activity, Flame, HelpCircle } from 'lucide-react';

interface DimensionData {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  textColor: string;
  accentColor: string;
  subtitle: string;
  desc: string;
  access: string;
  biomes: string[];
  rules: { title: string; desc: string }[];
}

export default function DimensionsView() {
  const [activeTab, setActiveTab] = useState<'realms' | 'igniters'>('realms');
  const [selectedDimension, setSelectedDimension] = useState<string>('backwoods');

  const dimensions: DimensionData[] = [
    {
      id: "backwoods",
      name: "The Backwoods",
      subtitle: "Primary Dimension",
      color: "from-amber-600 to-amber-900",
      borderColor: "border-amber-800/40",
      bgGlow: "bg-amber-950/20",
      textColor: "text-amber-200",
      accentColor: "text-amber-400",
      desc: "An endless, fog-heavy forest built entirely from oak planks and dead trees. The sky is a permanent amber haze, casting a light that feels fundamentally wrong.",
      access: "Ignite a wooden frame portal using Steel and Charcoal.",
      biomes: [
        "The Wood Plains: Deceptively quiet flat expanses.",
        "The Thicket: Heavily packed wooden trees with no geodes underneath.",
        "The Deep Backwoods: Dense spruce forests with frequent rotten geodes."
      ],
      rules: [
        {
          title: "Dimension Immune System",
          desc: "Actively tracks 'Spore Threat' (0 to 100). The dimension summons physical sentinels (The Rot) to eliminate entities in the 'spore' namespace."
        },
        {
          title: "Threat Accumulation",
          desc: "Scanning nearby spores adds +1 to +5 threat per second. Combat adds +2 threat, and kills add +5 threat. Threats decay naturally by -1 per second in clean zones."
        },
        {
          title: "The Rot Deployment",
          desc: "Triggered at ≥40 threat with strong spores, or automatically if ≥25 small spores swarm. Summons crash down from the sky with a 10-minute cooldown."
        }
      ]
    },
    {
      id: "loss",
      name: "The Loss",
      subtitle: "The Forgotten Sub-Realm",
      color: "from-slate-500 to-slate-800",
      borderColor: "border-slate-800/40",
      bgGlow: "bg-slate-900/30",
      textColor: "text-slate-200",
      accentColor: "text-slate-400",
      desc: "A sub-dimension representing a fading memory of the world. It is composed entirely of oak planks and oak logs, with absolutely no structures in the Loss dimension. An ash-grey sky looms over the vast, empty expanse of wood.",
      access: "Entered involuntarily with a 0.2666% chance per second when experiencing Stage Four mental degradation in the Backwoods.",
      biomes: [
        "Confusion: A dark, ash-swept biome with a grey-fog sky, with floors of Faded Blocks and trenches filled with Plaque. Passive ash particles drift through the atmosphere."
      ],
      rules: [
        {
          title: "Automatic Exit",
          desc: "The Loss will forcibly eject the player after a maximum duration of 20 minutes."
        },
        {
          title: "Inventory Erosion",
          desc: "Remaining inside this dimension carries a passive danger of permanently warping or altering specific items in your inventory."
        },
        {
          title: "Fading Mechanics",
          desc: "The Loss actively drains the physical substance of living beings. Simply being inside The Loss—or holding a Faded Block anywhere in your inventory—causes your entity to undergo Existential Phase-Shifting (accumulating a \"fade level\"). Your physical body becomes increasingly translucent and you shed ash particles. Your attack damage and gravity are dynamically reduced the more you fade, making your strikes weaker and jumps floaty. Once your fade level surpasses a critical threshold (15.0), you become partially intangible—all incoming projectiles (like arrows) will phase harmlessly right through you."
        }
      ]
    },
    {
      id: "rotting",
      name: "The Rotting",
      subtitle: "Suffocating Forest",
      color: "from-purple-600 to-purple-900",
      borderColor: "border-purple-800/40",
      bgGlow: "bg-purple-950/20",
      textColor: "text-purple-200",
      accentColor: "text-purple-400",
      desc: "A dark, oppressive realm characterized by dense, towering forests of rotten wood and a thick, suffocating fog that heavily limits visibility.",
      access: "Discovered by exploring and entering deep underground geodes inside the Backwoods dimension.",
      biomes: [
        "The Flat Plateaus: Uniform sea-level forest floors.",
        "Rotten Canopy: Dense, layered columns of rotting branches.",
        "Rotting Deep: Deep ocean-level valleys covered in Rotten Oak Wood with active falling ash."
      ],
      rules: [
        {
          title: "Perpetual Midnight",
          desc: "The Rotting has no day/night cycle, remaining permanently dark and requiring constant artificial lighting to survive."
        },
        {
          title: "Rotten Flora",
          desc: "Vines harvested from the rotten logs in this dimension carry a distinct bonus chance to drop raw string."
        }
      ]
    },
    {
      id: "grain",
      name: "The Grain",
      subtitle: "The Labyrinth of Planks",
      color: "from-yellow-600 to-amber-800",
      borderColor: "border-yellow-900/40",
      bgGlow: "bg-yellow-950/10",
      textColor: "text-yellow-100",
      accentColor: "text-yellow-400",
      desc: "Constructed purely out of oak planks and saturated in an eerie, thick yellow fog. This realm is highly structured and filled with repetitive wooden architectural grids.",
      access: "Entered by being struck by a Splinter, building to extreme altitudes, or staying in the Backwoods for long durations.",
      biomes: [
        "The Uniform Grain: Flat, tree-less expanses of pure oak floor.",
        "The Stillwood: The primary forest biome, filled with vertical wooden towers.",
        "The Splinter Nest: hauting, colossal, repeating timber networks.",
        "The Pillar Thicket: Labyrinth of massive hollow wood chimneys.",
        "The Labyrinthine Grids: Procedurally generated maze walls that change per chunk, rendering traditional maps useless.",
        "The Fractured Barrens: Fractured angular frameworks resembling broken grids."
      ],
      rules: [
        {
          title: "Splinter Threat",
          desc: "The Grain acts as the primary spawning sector and home nest for aggressive Splinter entities."
        },
        {
          title: "Arch Build Support",
          desc: "Advanced decorative features and procedurally aligned mazes are optimized for NeoForge 1.21.x builds."
        }
      ]
    },
    {
      id: "familiar",
      name: "The Familiar",
      subtitle: "The Simulated Overworld",
      color: "from-emerald-600 to-emerald-900",
      borderColor: "border-emerald-800/40",
      bgGlow: "bg-emerald-950/20",
      textColor: "text-emerald-200",
      accentColor: "text-emerald-400",
      desc: "A false, simulated clone of the Overworld spanning seven mirrored biomes. The landscape looks friendly, but everything within is silently watching your every move.",
      access: "No straightforward entry or escape—disclosing portal coordinates is hindered by space warping.",
      biomes: [
        "Mirrored Plains / Mirrored Forest / Mirrored Birch Forest / Mirrored Taiga",
        "Mirrored Desert / Mirrored Savannah / Mirrored Jungle",
        "Mirrored Ocean"
      ],
      rules: [
        {
          title: "Uncanny Behavior",
          desc: "Mobs do not feed or wander. They will stand completely still, rotate their bodies to stare continuously at you, and play low hums."
        },
        {
          title: "Transient Entities",
          desc: "Hostiles and passive creatures alike carry a heavy chance to vanish instantly into thin air the moment you strike them."
        }
      ]
    },
    {
      id: "petrified",
      name: "The Petrified Weald",
      subtitle: "The Fossilized Remains",
      color: "from-zinc-500 to-zinc-800",
      borderColor: "border-zinc-700/40",
      bgGlow: "bg-zinc-950/20",
      textColor: "text-zinc-200",
      accentColor: "text-zinc-400",
      desc: "The calcified, crumbling ruins of a long-dead world. Everything here is either turned to ash or trapped under heavy, permanent charcoal fog.",
      access: "Ignite Petrified Rotten Oak portal frames using the Steel and Shard catalyst.",
      biomes: [
        "Calcified Plains: Waste filled with leaning 100-block tall spikes of petrified wood.",
        "Weald Outskirts: Light woods with oak-style branches.",
        "Petrified Thickwoods: Dense forests of Dark Oak and Mega Spruce trees.",
        "Fossilized Core: Heart of the realm where Ancient Debris is embedded in petrified logs.",
        "Ashen Barrens: Desolate floor of ash roses."
      ],
      rules: [
        {
          title: "Heavy Lungs Condition",
          desc: "Entering the Ashen Barrens biome inflicts 'Heavy Lungs', restricting mining speed, movement, attack rate, and oxygen levels."
        },
        {
          title: "Unstable Fire",
          desc: "Combustion is highly unstable. Fire flickers out instantly when left unattended inside this dimension."
        }
      ]
    },
    {
      id: "substrata",
      name: "The Sub-Strata",
      subtitle: "Terminal Underworld",
      color: "from-stone-600 to-stone-800",
      borderColor: "border-stone-800/40",
      bgGlow: "bg-stone-900/30",
      textColor: "text-stone-200",
      accentColor: "text-[#709978]",
      desc: "An oppressive subterranean extension beneath the surface. Closely linked to the architecture of The Grain, transitioning the color palette to deep oak planks and thick yellow haze.",
      access: "Entry is terminal: A player can only slip into this dimension by dying while physically inside The Grain.",
      biomes: [
        "The Dead Grain: Monochromatic, repeating grid structures."
      ],
      rules: [
        {
          title: "Scaffolding descent",
          desc: "Spawns at the maximum sky coordinate (Y=319). Players must descend safely through a massive scaffolding tower to reach the floor at Y=161."
        },
        {
          title: "Shrinking Safe Zones",
          desc: "Tracks active Blindspot Splinters. Local exclusion safety zones decay from 120 blocks down to a suffocating 16 blocks the longer you survive."
        }
      ]
    }
  ];

  const currentDim = dimensions.find(d => d.id === selectedDimension) || dimensions[0];

  return (
    <div className="space-y-8 select-text">
      {/* Top Navigation Mode Selection */}
      <div className="flex border-b border-[#1a221c] pb-4 gap-4">
        <button
          onClick={() => setActiveTab('realms')}
          className={`px-4 py-2 font-serif text-sm font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'realms' 
              ? 'bg-[#151a16] text-[#a9d1b0] border border-[#2d3a2f]' 
              : 'text-[#829285] hover:text-[#e0e7e0]'
          }`}
        >
          Explore Realms ({dimensions.length})
        </button>
        <button
          onClick={() => setActiveTab('igniters')}
          className={`px-4 py-2 font-serif text-sm font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'igniters' 
              ? 'bg-[#151a16] text-[#a9d1b0] border border-[#2d3a2f]' 
              : 'text-[#829285] hover:text-[#e0e7e0]'
          }`}
        >
          Portal Catalysts & Success Rates
        </button>
      </div>

      {activeTab === 'realms' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar selector */}
          <div className="lg:col-span-4 space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#5a6b5e] mb-3">Dimensions Index</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[380px] lg:max-h-none overflow-y-auto pr-1 scrollbar-thin">
              {dimensions.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDimension(d.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg border transition-all shrink-0 lg:shrink cursor-pointer ${
                    selectedDimension === d.id
                      ? `bg-gradient-to-r ${d.color} text-white ${d.borderColor} font-semibold shadow-md`
                      : 'bg-[#0a0c0a] hover:bg-[#121612] text-[#829285] border-[#161c17]'
                  }`}
                >
                  <div className="font-serif text-sm">{d.name}</div>
                  <div className="text-[10px] opacity-70 font-mono mt-0.5">{d.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-8 p-6 bg-[#0c0e0c] border border-[#1d251e] rounded-xl relative overflow-hidden space-y-6">
            <div className={`absolute right-0 top-0 w-32 h-32 blur-3xl opacity-25 rounded-full ${currentDim.bgGlow}`} />

            {/* Title */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5a6b5e]">Dimension Profile</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#e0e7e0] mt-1">{currentDim.name}</h3>
              <p className="text-xs text-[#709978] font-mono mt-0.5">{currentDim.subtitle}</p>
            </div>

            {/* Desc & Access */}
            <div className="space-y-4">
              <p className="text-sm text-[#c9d1c9] leading-relaxed">{currentDim.desc}</p>
              
              <div className="p-4 bg-[#111512] border-l-2 border-[#709978] rounded-r-lg space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#5a6b5e]">Entry Mechanism</div>
                <div className="text-xs text-[#a9d1b0]">{currentDim.access}</div>
              </div>
            </div>

            {/* Biomes */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#5a6b5e] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Regional Biomes
              </h4>
              <div className="grid gap-2">
                {currentDim.biomes.map((b, i) => (
                  <div key={i} className="p-3 bg-[#070907] border border-[#161d18] rounded text-xs text-[#829285] leading-relaxed">
                    {b.includes(':') ? (
                      <>
                        <strong className="text-[#c9d1c9] font-serif">{b.split(':')[0]}:</strong>
                        <span>{b.split(':')[1]}</span>
                      </>
                    ) : (
                      <span>{b}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Special Rules */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#5a6b5e] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#a9d1b0]" />
                Environmental Hazards & Systems
              </h4>
              <div className="grid gap-3">
                {currentDim.rules.map((rule, i) => (
                  <div key={i} className="p-4 bg-[#121613]/80 border border-[#1f2820] rounded-lg">
                    <h5 className="font-serif text-sm font-semibold text-[#a9d1b0] mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#709978]" />
                      {rule.title}
                    </h5>
                    <p className="text-xs text-[#829285] leading-relaxed pl-3.5">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="p-5 bg-[#0f1210] border border-[#1c241e] rounded-lg">
            <p className="text-sm text-[#c9d1c9] leading-relaxed">
              Igniters are portal triggers used to travel between realms. Due to localized cosmic interference, the success chance of each igniter fluctuates heavily based on the dimension from which you attempt to strike it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Igniter 1 */}
            <div className="p-5 bg-[#0a0c0a] border border-[#1f2821] rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#e0e7e0]">Steel and Charcoal</h4>
                  <p className="text-[10px] font-mono text-[#5a6b5e] uppercase">Gate to: The Backwoods</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#1c241e]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#131914] text-[#829285] border-b border-[#1c241e]">
                      <th className="p-3">Source Dimension</th>
                      <th className="p-3 text-center">Difficulty (Threshold)</th>
                      <th className="p-3 text-right">Success Chance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171f18]">
                    <tr>
                      <td className="p-3 font-medium text-[#c9d1c9]">Overworld</td>
                      <td className="p-3 text-center font-mono">2</td>
                      <td className="p-3 text-right text-emerald-400 font-bold font-mono">8 in 10 (80%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-[#c9d1c9]">Petrified Weald</td>
                      <td className="p-3 text-center font-mono">1</td>
                      <td className="p-3 text-right text-emerald-400 font-bold font-mono">9 in 10 (90%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">Familiar</td>
                      <td className="p-3 text-center font-mono">3</td>
                      <td className="p-3 text-right text-emerald-500 font-mono">7 in 10 (70%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-amber-500">The Backwoods (Self)</td>
                      <td className="p-3 text-center font-mono">6</td>
                      <td className="p-3 text-right text-amber-400 font-mono">4 in 10 (40%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Still</td>
                      <td className="p-3 text-center font-mono">7</td>
                      <td className="p-3 text-right text-amber-500 font-mono">3 in 10 (30%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Rotting</td>
                      <td className="p-3 text-center font-mono">8</td>
                      <td className="p-3 text-right text-rose-400 font-mono">2 in 10 (20%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Loss</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Igniter 2 */}
            <div className="p-5 bg-[#0a0c0a] border border-[#1f2821] rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#e0e7e0]">Steel and Shard</h4>
                  <p className="text-[10px] font-mono text-[#5a6b5e] uppercase">Gate to: The Petrified Weald</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#1c241e]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#131914] text-[#829285] border-b border-[#1c241e]">
                      <th className="p-3">Source Dimension</th>
                      <th className="p-3 text-center">Difficulty (Threshold)</th>
                      <th className="p-3 text-right">Success Chance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171f18]">
                    <tr>
                      <td className="p-3 font-medium text-[#c9d1c9]">Petrified Weald (Self)</td>
                      <td className="p-3 text-center font-mono">1</td>
                      <td className="p-3 text-right text-emerald-400 font-bold font-mono">9 in 10 (90%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">Familiar</td>
                      <td className="p-3 text-center font-mono">1</td>
                      <td className="p-3 text-right text-emerald-400 font-bold font-mono">9 in 10 (90%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Loss</td>
                      <td className="p-3 text-center font-mono">3</td>
                      <td className="p-3 text-right text-emerald-500 font-mono">7 in 10 (70%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Backwoods</td>
                      <td className="p-3 text-center font-mono">7</td>
                      <td className="p-3 text-right text-amber-500 font-mono">3 in 10 (30%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Rotting</td>
                      <td className="p-3 text-center font-mono">8</td>
                      <td className="p-3 text-right text-rose-400 font-mono">2 in 10 (20%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Still</td>
                      <td className="p-3 text-center font-mono">8</td>
                      <td className="p-3 text-right text-rose-400 font-mono">2 in 10 (20%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-[#c9d1c9]">Overworld</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
