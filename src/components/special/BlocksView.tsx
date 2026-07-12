import React, { useState, useMemo } from 'react';
import { Search, Info, Shield, Flame, Hammer, Coins, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import FancyRecipeView from './FancyRecipeView';

function getBlockRecipeIds(name: string): string[] {
  if (name === "Nullstone & Cobbled Nullstone") {
    return [
      'nullstone_slab', 'nullstone_stair', 'nullstone_wall',
      'cobbled_nullstone_slab', 'cobbled_nullstone_stair', 'cobbled_nullstone_wall',
      'cracked_nullstone'
    ];
  }
  if (name === "Rotten Oak Wood Family") {
    return [
      'rotten_oak_planks', 'rotten_oak_slab', 'rotten_oak_stair',
      'rotten_oak_fence', 'rotten_oak_gate', 'rotten_oak_trapdoor',
      'rotten_oak_pressure_plate', 'rotten_oak_button', 'rotten_oak_wood'
    ];
  }
  if (name === "Petrified Rotten Oak Wood") {
    return [
      'petrified_rotten_oak_wood', 'petrified_rotten_oak_planks', 'petrified_rotten_oak_stairs',
      'petrified_rotten_oak_fence', 'petrified_rotten_stick'
    ];
  }
  if (name === "Petrified Planks & Slab & Stairs") {
    return [
      'petrified_rotten_oak_planks', 'petrified_rotten_oak_stairs'
    ];
  }
  if (name === "Fractus Core" || name === "Fractus Prime Core") {
    return ['fractus_core_nugget'];
  }
  return [];
}

interface BlockItem {
  name: string;
  dimension: 'overworld' | 'backwoods_rotting' | 'loss' | 'petrified_weald';
  hardness?: string;
  blastRes?: string;
  burnTime?: string;
  description: string;
  latin?: { term: string; translation: string }[];
  mechanics?: string[];
  lootTable?: { item: string; weight: number; condition: string }[];
  isWarning?: boolean;
  warningText?: string;
  isSpecial?: boolean;
  specialText?: string;
}

export default function BlocksView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDim, setSelectedDim] = useState<string>('all');
  const [expandedRecipes, setExpandedRecipes] = useState<Record<string, boolean>>({});

  const blocks: BlockItem[] = [
    {
      name: "Scandere Lignum Log",
      dimension: "overworld",
      burnTime: "270 ticks",
      description: "The trunk of the Scandere tree. It starts as a regular dark oak-shaped tree upon generation and grows naturally over time, climbing upwards and sprouting leaves.",
      latin: [
        { term: "Scandere", translation: "to climb" },
        { term: "Lignum", translation: "wood" }
      ],
      mechanics: [
        "Growth (Ascendance): Grows upwards to reaching heights of 50 to 80 blocks tall. It sprouts horizontal branches and forms a majestic, dense canopy crown of Oak Leaves and hanging Vines at the top (Sequoia/Redwood style).",
        "Trunk Optimization: Inner trunk blocks buried under and above other logs skip active growth ticks to prevent tick lag.",
        "Symbiosis: Emits a passive aura that attracts nearby passive mobs, drawing them to idle in a ring around it. Increases their breeding rate."
      ]
    },
    {
      name: "Scandere Lignum (Spreading Root-wood)",
      dimension: "overworld",
      burnTime: "270 ticks",
      description: "The spreading root-wood of the Scandere. This all-sided bark block acts as the roots of the tree, growing primarily underground to replace stone or dirt.",
      mechanics: [
        "Spreading: Spreads tick by tick, replacing solid blocks in its path. Underground growth is favored heavily over surface growth. Spread speed is accelerated by nearby adult animals whose presence fertilizes the network. The root network is constrained by a generation limit; roots age with each spread and will naturally halt after 10 blocks of outward growth, preventing infinite expansion.",
        "Vein-Shape Control: Employs a strict neighbor check. It will not spread to a block if it is already adjacent to 2 or more Scandere Lignum blocks, preventing blocky blobs and creating natural, thin vein paths.",
        "Infestation: Disturbed blocks carry a 10% chance to release a Lignum Vermis parasite upon destruction.",
        "Mining Threat: There is a rare 1% chance per tick while actively mining for the parasite to violently shatter the block early and erupt."
      ],
      lootTable: [
        { item: "Scandere Lignum", weight: 80, condition: "Always" },
        { item: "Bone Meal", weight: 20, condition: "No Silk Touch" }
      ]
    },
    {
      name: "Ash-Rose",
      dimension: "backwoods_rotting",
      description: "A highly specialized eerie flower placed exclusively by the elusive Ash-Weaver. Serves as the ultimate defense against Splinters.",
      mechanics: [
        "Splinter Freeze: Holding one in either hand, or placing it on the ground, causes all nearby Splinters to freeze and stop moving entirely.",
        "Wilt Decay: Slowly wilts over time while held, eventually crumbling into nothingness.",
        "Placement: Can be safely replanted on grass, dirt, deepslate, and any type of log or planks, or placed inside a clay flower pot (retaining its protective freeze aura properties)."
      ]
    },
    {
      name: "Fractus Core",
      dimension: "backwoods_rotting",
      burnTime: "13 hours (smelting)",
      description: "A stark block of pure, perfect white geometry that defies the natural visual and physical laws of the world. Obtained from the anomalous Fractus entity.",
      mechanics: [
        "Anomalous Weight: Keeping it in your inventory slows movement speed by 4% and increases falling gravity by +0.017 points per core.",
        "Luminescent Light: Radiates a permanent light level of 13 without generating any heat.",
        "Cosmic Attraction: Existing near a core (whether placed, dropped, or in chests within a 120-block radius) initiates invasion events in the Overworld/Nether."
      ],
      isWarning: true,
      warningText: "Invasion Stages: (1) Escalation: Breach intervals scale down from 2 min to 45s. (2) Breach: A giant 2.8m swirling cyan cosmic vortex expands. (3) Arrival: Portal stabilized, summoning a horde of 3-7 Fractus entities."
    },
    {
      name: "Faded Block",
      dimension: "loss",
      description: "The primary surface block of the Loss dimension. A pale, completely drained version of dirt entirely leached of life.",
      mechanics: [
        "Absolute Silence: Produces absolutely no audio or sound footsteps when walked upon, broken, or placed."
      ]
    },
    {
      name: "Sinking Ash",
      dimension: "loss",
      description: "A dangerous natural hazard generating in Loss. Acts as a mobility control hazard.",
      mechanics: [
        "Movement Restriction: Severely slows player movement when stepped inside.",
        "Fall Mitigation: Completely cushions and cancels all fall damage."
      ]
    },
    {
      name: "Nullstone & Cobbled Nullstone",
      dimension: "loss",
      hardness: "2.2",
      blastRes: "7.5",
      description: "The primary stone of the Loss dimension, formed from degraded stone. Texture is washed-out and low-detail. Produces no sound upon interaction.",
      mechanics: [
        "Nullstone Family: Can be crafted into slabs, stairs, and walls.",
        "Cracked Nullstone: Created by smelting Nullstone in a furnace (takes 6 seconds, grants 0.2 XP; hardness 1.8, blast res 6.0)."
      ]
    },
    {
      name: "Plaque Block & Plaque Heart",
      dimension: "loss",
      description: "A highly aggressive, infectious corruption that slowly spreads to convert any adjacent solid blocks in all six directions.",
      mechanics: [
        "Plaque Spread: Spreads outwards. Generates throughout Loss similar to coal ore layers.",
        "Plaque Heart: Hidden in deep plaque spheres. Breaking a red-tinted Plaque Heart drops Memory Fragments and reduces your Loss dimension timer by 50 seconds."
      ],
      isWarning: true,
      warningText: "Infection Threat: Carrying Plaque items in your inventory inflicts escalating Slowness, Hunger, and Mining Fatigue over time."
    },
    {
      name: "Memory Quartz Ore",
      dimension: "loss",
      description: "An ore block generating between Y -7 and Y 92 inside the Loss dimension.",
      mechanics: [
        "Yield: Yields 1 to 2 Memory Shards when mined."
      ]
    },
    {
      name: "Rotten Oak Wood Family",
      dimension: "backwoods_rotting",
      burnTime: "200 - 240 ticks",
      description: "Standard Oak Planks spontaneously decay into Rotten Oak blocks when a player's time in the Backwoods exceeds 24,000 ticks. The decay spreads to adjacent blocks.",
      mechanics: [
        "Log Shards: Rotten Oak Logs have a chance to drop a Heartwood Shard when chopped.",
        "Crafting Base: Planks are used as base ingredients for rotten wood-tier crafting tools.",
        "Complete Set: Includes planks, slabs, stairs, fences, gates, trapdoors, and pressure plates."
      ],
      isWarning: true,
      warningText: "Rot Hazard: Carrying any Rotten Oak variant in your inventory inflicts 0.1 damage periodically to the player."
    },
    {
      name: "Petrified Rotten Oak Wood",
      dimension: "petrified_weald",
      hardness: "21",
      blastRes: "23.04",
      description: "The calcified, exceptionally dense remains of ancient flora. Features four-sided bark textures. Sturdiest block in the petrified set.",
      isSpecial: true,
      specialText: "Material Properties: Extremely dense, very high blast resistance, and 100% immune to fire or lava ignition."
    },
    {
      name: "Petrified Rotten Oak Log",
      dimension: "petrified_weald",
      hardness: "20",
      blastRes: "22.5",
      description: "The primary structural pillar of the ancient calcified trees in the Petrified Weald.",
      isSpecial: true,
      specialText: "Stripped Variant: Stripped Petrified Rotten Oak Log has hardness 17 and blast resistance 22.05."
    },
    {
      name: "Petrified Planks, Slab, Stairs & Fence Gate",
      dimension: "petrified_weald",
      hardness: "10",
      blastRes: "9.0",
      description: "Extremely heavy, calcified structural blocks including planks, slabs, stairs, and fence gates. They are entirely fireproof and offer immense blast resistance compared to normal wood.",
      mechanics: [
        "Sound Properties: Produces custom hollow rotting wood step and break sounds.",
        "Fire Immunity: Since they are fossilized, they cannot be set on fire or destroyed by lava."
      ]
    },
    {
      name: "Petrified Weald Leaves",
      dimension: "petrified_weald",
      hardness: "6",
      blastRes: "1.3",
      description: "Brittle, calcified foliage. Structurally far tougher than vanilla leaves."
    },
    {
      name: "Amber Grit & Cobbled Amber Grit",
      dimension: "petrified_weald",
      hardness: "3",
      blastRes: "9.0",
      description: "Dense deepslate-like ground block generating naturally in the Petrified Weald."
    },
    {
      name: "Lignum Caro",
      dimension: "backwoods_rotting",
      hardness: "1.5",
      blastRes: "1.5",
      latin: [
        { term: "Lignum", translation: "wood" },
        { term: "Caro", translation: "flesh" }
      ],
      description: "A pristine, living wood tissue block that belongs in the Backwoods dimension and can also be found in the Dead Grain biome. It generates as massive, continuous cellular membrane structures embedded up to 45 blocks deep into the terrain. It behaves as an active immune defender against spore-based infections.",
      mechanics: [
        "Pristine Active Defense: When uninfected, it has a 40% chance per random tick to 'sneeze' against nearby Spore entities within 4 blocks. Deals 1.0 to 2.0 magic damage, applies knockback, and inflicts Poison I for 6 seconds.",
        "Block Defense & Reclamation: Pristine blocks actively convert adjacent Spore blocks back into pristine Lignum Caro blocks (35% chance) and cleanse nearby corrupted Lignum Caro blocks back to pristine (25% chance) on random ticks.",
        "Colony Restoration: Actively seeks out nearby burnt blocks and restores them to their healthy equivalents, triggering a cascading wave of rapid regeneration through neighboring colony blocks to repair damaged areas.",
        "Corruption Vulnerability: Has an 'infected' state property. If it becomes compromised, its defenses shut down and it starts spreading the spore infection, converting adjacent blocks into infected Lignum Caro at a 35% chance with rapid chain propagation.",
        "Infection Delay: All active defense, spread, and cleansing mechanics remain completely dormant until the world is at least 1,200 ticks old (1 minute)."
      ]
    },
    {
      name: "Fractus Prime Core",
      dimension: "backwoods_rotting",
      hardness: "5.0",
      blastRes: "12.0",
      description: "An advanced anomalies core containing the compressed, high-energy matrix of the elite Fractus Prime drone. Radiates pure cold luminance and powerful magnetic resonance.",
      mechanics: [
        "Luminance Level 13: Emits a steady light level of 13.0 with emissive, post-processed rendering.",
        "Resonant Sound: Employs specialized beacon sound dampeners. Plays 'block.beacon.activate' when placed and 'block.beacon.deactivate' when broken.",
        "Compact Geometry: Possesses a custom compact voxel bounding box of box(3, 0, 3, 13, 10, 13) instead of a full block shape.",
        "Compact Stack: Unlike normal blocks, it has a max stack size of 1 and RARE item rarity, making it extremely valuable."
      ]
    },
    {
      name: "False Oak Planks",
      dimension: "backwoods_rotting",
      hardness: "0.2",
      blastRes: "0.2",
      description: "A highly deceptive decoy block that looks visually indistinguishable from standard Oak Planks but physically behaves as a leaf block. It can only be found in the Backwoods dimension, acting as leaves for the trees in the Thicket biome. Designed for hidden traps and secret pathways.",
      mechanics: [
        "Flawless Mimicry: Uses the exact textures of vanilla Oak Planks on all sides, making them impossible to spot with the naked eye.",
        "No Occlusion: Built on a leaf block base. Players and entities can pass completely through the block, and it does not block line-of-sight (though it still blocks light with a value of 15).",
        "High Flammability: Extremely vulnerable to fire (flammability of 30, spread speed of 60) and gets ignited by lava.",
        "Stick Drops: Breaking the block without Shears or a Silk Touch tool drops 1-2 Sticks instead of the block itself."
      ],
      lootTable: [
        { item: "False Oak Planks", weight: 100, condition: "Silk Touch / Shears" },
        { item: "Stick", weight: 100, condition: "No Silk Touch (drops 1-2)" }
      ]
    },
    {
      name: "Decaying Leaves",
      dimension: "backwoods_rotting",
      hardness: "0.2",
      blastRes: "0.2",
      description: "Dead, crumbling oak leaves that are slowly decaying in the damp atmosphere of the Backwoods. Highly flammable.",
      mechanics: [
        "Light Blockage: Possesses a high light opacity of 14, creating dark under-canopy environments despite being translucent.",
        "Flammability: Highly susceptible to catching fire, accelerating flame spreads through canopy crowns."
      ]
    },
    {
      name: "Fossilized Silt",
      dimension: "petrified_weald",
      hardness: "3.5",
      blastRes: "6.0",
      description: "A heavy, compacted silt deposit that has mineralized over ages in the Petrified Weald. Harder than regular soil, requiring a shovel to dig efficiently.",
      mechanics: [
        "Mineral Density: Steps produce a deep, solid stony tuff sound.",
        "Excavation: Drops itself as a building block when cleared with a shovel tool."
      ]
    }
  ];

  const filteredBlocks = useMemo(() => {
    return blocks.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            b.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDim = selectedDim === 'all' || b.dimension === selectedDim;
      return matchesSearch && matchesDim;
    });
  }, [searchQuery, selectedDim]);

  return (
    <div className="space-y-6 select-text">
      {/* Intro and Search bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <p className="text-sm text-[#829285] max-w-xl">
          Complete catalog of the custom blocks found across the Overworld, Backwoods, Loss, and Petrified Weald dimensions.
        </p>
        
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#5a6b5e]" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#0a0c0a] border border-[#1c241e] rounded-md text-xs text-[#c9d1c9] focus:outline-none focus:border-[#709978] transition-colors placeholder-[#5a6b5e]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1a221c] pb-3">
        {[
          { id: 'all', label: 'All Blocks' },
          { id: 'overworld', label: 'Overworld' },
          { id: 'backwoods_rotting', label: 'Backwoods & Rotting' },
          { id: 'loss', label: 'The Loss' },
          { id: 'petrified_weald', label: 'Petrified Weald' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedDim(tab.id)}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
              selectedDim === tab.id
                ? 'bg-[#1a241d] text-[#a9d1b0] border border-[#2e3e31]'
                : 'bg-transparent text-[#829285] hover:text-[#e0e7e0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBlocks.map((block) => (
          <div 
            key={block.name}
            className="p-5 bg-[#0c0e0c] border border-[#1d251e] rounded-xl flex flex-col justify-between hover:border-[#2e3e31] transition-all duration-300"
          >
            <div className="space-y-3.5">
              {/* Card Header */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#e0e7e0]">{block.name}</h3>
                  <span className="text-[9px] font-mono uppercase text-[#709978] bg-[#111612] px-1.5 py-0.5 rounded border border-[#1f2820] mt-1 inline-block">
                    {block.dimension.replace('_', ' & ')}
                  </span>
                </div>
                
                {/* Latin title translation if exists */}
                {block.latin && (
                  <div className="text-[10px] font-mono text-right text-[#5a6b5e]">
                    {block.latin.map((l, idx) => (
                      <div key={idx}>
                        <span className="text-rose-400 font-semibold">"{l.term}"</span>: {l.translation}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats badges */}
              {(block.hardness || block.blastRes || block.burnTime) && (
                <div className="flex flex-wrap gap-3 py-1.5 border-y border-[#1a221c]/50">
                  {block.hardness && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#829285]">
                      <Hammer className="w-3.5 h-3.5 text-[#5a6b5e]" />
                      Hardness: <span className="text-[#a9d1b0] font-bold">{block.hardness}</span>
                    </span>
                  )}
                  {block.blastRes && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#829285]">
                      <Shield className="w-3.5 h-3.5 text-[#5a6b5e]" />
                      Blast Res: <span className="text-[#a9d1b0] font-bold">{block.blastRes}</span>
                    </span>
                  )}
                  {block.burnTime && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#829285]">
                      <Flame className="w-3.5 h-3.5 text-[#5a6b5e]" />
                      Burn Time: <span className="text-[#a9d1b0] font-bold">{block.burnTime}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-xs text-[#829285] leading-relaxed">{block.description}</p>

              {/* Warnings and Hazards */}
              {block.isWarning && (
                <div className="p-3 bg-[#1c1212] border-l-2 border-rose-500 rounded text-[11px] text-rose-300 leading-relaxed flex items-start gap-2 select-none">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{block.warningText}</span>
                </div>
              )}

              {/* Material safety */}
              {block.isSpecial && (
                <div className="p-3 bg-[#111512] border-l-2 border-emerald-500 rounded text-[11px] text-emerald-300 leading-relaxed flex items-start gap-2 select-none">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{block.specialText}</span>
                </div>
              )}

              {/* Behavioral Mechanics list */}
              {block.mechanics && block.mechanics.length > 0 && (
                <div className="space-y-1 pt-1.5">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#5a6b5e]">Behavioral Mechanics</h4>
                  <ul className="space-y-1 pl-3.5 list-disc text-[11px] text-[#829285] leading-relaxed">
                    {block.mechanics.map((mech, mIdx) => (
                      <li key={mIdx}>
                        {mech.includes(':') ? (
                          <>
                            <strong className="text-[#c9d1c9] font-semibold">{mech.split(':')[0]}:</strong>
                            <span>{mech.split(':')[1]}</span>
                          </>
                        ) : (
                          <span>{mech}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Loot Table */}
            {block.lootTable && (
              <div className="mt-4 pt-3 border-t border-[#1a221c]/40">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#5a6b5e] mb-2">Loot Drops</h4>
                <div className="overflow-hidden rounded border border-[#1a221c] text-[10px]">
                  <table className="w-full text-left border-collapse font-mono">
                    <thead>
                      <tr className="bg-[#101311] text-[#5a6b5e] border-b border-[#1a221c]">
                        <th className="p-2">Drop Item</th>
                        <th className="p-2 text-center">Weight</th>
                        <th className="p-2 text-right">Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#171e19]">
                      {block.lootTable.map((loot, lIdx) => (
                        <tr key={lIdx}>
                          <td className="p-2 font-medium text-[#c9d1c9]">{loot.item}</td>
                          <td className="p-2 text-center text-[#829285]">{loot.weight}</td>
                          <td className="p-2 text-right text-[#5a6b5e] font-sans italic">{loot.condition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Collapsible Crafting Recipes */}
            {(() => {
              const recipeIds = getBlockRecipeIds(block.name);
              if (recipeIds.length === 0) return null;
              const isExpanded = !!expandedRecipes[block.name];
              return (
                <div className="mt-4 pt-3 border-t border-[#1a221c]/40">
                  <button
                    onClick={() => setExpandedRecipes(prev => ({ ...prev, [block.name]: !isExpanded }))}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0a0d0a] hover:bg-[#111711] border border-[#1c261d]/80 hover:border-[#304433] rounded-lg text-[11px] font-mono text-[#709978] hover:text-[#a9d1b0] transition-all cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <Hammer className="w-3.5 h-3.5 text-[#5a6b5e]" />
                      {isExpanded ? 'Hide Crafting Recipes' : `View Crafting Recipes (${recipeIds.length})`}
                    </span>
                    <span className="text-[9px]">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3">
                      <FancyRecipeView itemIds={recipeIds} />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
