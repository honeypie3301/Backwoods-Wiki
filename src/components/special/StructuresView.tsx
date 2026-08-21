import React, { useState } from 'react';
import { 
  Building2, 
  Compass, 
  Layers, 
  MapPin, 
  Boxes, 
  Search, 
  Eye, 
  ShieldAlert, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import UpdatedFrame from '../UpdatedFrame';

interface StructureItem {
  id: string;
  name: string;
  dimension: string;
  dimensionId: string;
  tag: string;
  scale: string;
  materials: string[];
  desc: string;
  features: string[];
  color: string;
}

export default function StructuresView() {
  const [selectedDimension, setSelectedDimension] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const structures: StructureItem[] = [
    // THE BACKWOODS
    {
      id: "a_staircase",
      name: "A Staircase",
      dimension: "The Backwoods",
      dimensionId: "backwoods",
      tag: "Exploration Landmark",
      scale: "Spiral Ascent (18-24m)",
      materials: ["Oak Planks", "Oak Slabs", "Loot Chest"],
      desc: "An ominous, freestanding spiral flight of wooden stairs ascending unanchored into the thick yellow fog.",
      features: [
        "Loot Reward: Houses a high-tier wooden chest at its summit containing dimensional survival equipment.",
        "Aesthetic: Eerie architectural anomaly with missing banisters and worn steps.",
        "Hazard: Steep drop hazard with zero safety barriers into surrounding woods."
      ],
      color: "border-amber-700/40 text-amber-300"
    },
    {
      id: "backwoods_farlands",
      name: "The Farlands",
      dimension: "The Backwoods",
      dimensionId: "backwoods",
      tag: "Boundary Glitch",
      scale: "Monolithic Planks (6,275,412m+)",
      materials: ["Solid Oak Planks", "Rotten Oak Logs"],
      desc: "Massive solid walls of Oak Planks and structural distortion extending towards world boundaries.",
      features: [
        "Gravity Anomaly: Beyond the boundary threshold, localized gravity degrades into anti-gravity float states.",
        "Structural Scale: Infinite vertical and horizontal walls composed entirely of wooden boards.",
        "Navigational Hazard: Extreme spatial distortion makes coordinate tracking unreliable."
      ],
      color: "border-amber-700/40 text-amber-300"
    },
    {
      id: "oak_stalactites",
      name: "Oak Stalactites",
      dimension: "The Backwoods",
      dimensionId: "backwoods",
      tag: "Geological Anomaly",
      scale: "Medium Columns (12-30m)",
      materials: ["Oak Planks", "Lignum Caro"],
      desc: "Massive inverted wooden pillars hanging from subterranean ceilings and dense overgrowth.",
      features: [
        "Biological Fusion: Frequently embedded with pulsating Lignum Caro organic matter.",
        "Cave Hazard: Obstructs cave navigation and creates blind spots for stalking predators.",
        "Harvestable: High density of harvestable wood blocks in cave biomes."
      ],
      color: "border-amber-700/40 text-amber-300"
    },
    {
      id: "menger_sponge_small",
      name: "Menger Sponge (Small)",
      dimension: "The Backwoods",
      dimensionId: "backwoods",
      tag: "Fractal Formation",
      scale: "Compact Recursive Cube (9x9x9m)",
      materials: ["Oak Planks", "Decayed Logs"],
      desc: "A mathematically pure 3D fractal cubic sponge constructed entirely from oak planks.",
      features: [
        "Recursive Voids: Features interconnected hollow tunnels through mathematical subtraction.",
        "Shelter: Functions as a temporary natural redoubt against open-range hostile mobs.",
        "Loot Node: Occasional internal hidden compartments with supplies."
      ],
      color: "border-amber-700/40 text-amber-300"
    },

    // THE GRAIN
    {
      id: "void_basement",
      name: "Void Basement",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Subterranean Sub-Grid",
      scale: "Expansive Chamber",
      materials: ["Stripped Oak Planks", "Reinforced Beams"],
      desc: "A submerged, hollow undercroft generating beneath the floorboards of The Grain.",
      features: [
        "Atmosphere: Thick darkness and echoey acoustic dampening.",
        "Navigation: Accessible through missing flooring fissures in upper grain layers.",
        "Hostile Activity: High spawn rate of lurking entities seeking darkness."
      ],
      color: "border-yellow-700/40 text-yellow-300"
    },
    {
      id: "cavern_grid",
      name: "Cavern Grid",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Structural Maze",
      scale: "Multi-level Grid",
      materials: ["Oak Planks", "Wooden Slabs", "Lattices"],
      desc: "An intricate 3D grid layout stretching across subterranean caverns within The Grain.",
      features: [
        "Modular Architecture: Repeating hallway cells separated by wooden partitions.",
        "Disorientation: Identical room geometries induce acute navigational confusion.",
        "Acoustic Traps: Footsteps reverberate loudly across wooden grid frames."
      ],
      color: "border-yellow-700/40 text-yellow-300"
    },
    {
      id: "sky_grid",
      name: "Sky Grid",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Aerial Formation",
      scale: "High Altitude Grid (Y=180-260)",
      materials: ["Oak Planks", "Oak Fences"],
      desc: "A suspended network of wooden walkways and cross-braced beams hanging high above the grain floor.",
      features: [
        "Fall Peril: Open-air catwalks with no railings over lethal void depths.",
        "Transit Network: Allows swift cross-biome travel across dense forest canopies below.",
        "Atmospheric Wind: Severe wind gusts increase slipping risk on narrow beams."
      ],
      color: "border-yellow-700/40 text-yellow-300"
    },
    {
      id: "the_nest_grids",
      name: "The Nest Grids",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Splinter Hive",
      scale: "Dense Concentric Cubes",
      materials: ["Splintered Oak", "Sharp Wood Needles"],
      desc: "Densely packed cubic labyrinths infested by aggressive Splinters and Splintered sentinels.",
      features: [
        "Hostile Hive: High density of Splinter mobs and Splinter Needle traps.",
        "Resource Hub: Abundant source of Sharpened Splinters and rare drops.",
        "Labyrinthine Layout: Multiple dead-ends designed to trap intruders."
      ],
      color: "border-yellow-700/40 text-yellow-300"
    },
    {
      id: "sub_grain_atria",
      name: "Sub-Grain Atria",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Central Monument",
      scale: "Massive Hall (40x40x30m)",
      materials: ["Polished Oak", "Decorative Planks"],
      desc: "Colossal multi-tier atriums featuring soaring wooden pillars and skylights into the yellow fog.",
      features: [
        "Architectural Grandeur: Symmetrical colonnades and elevated viewing galleries.",
        "Loot Sanctuaries: Often contains concealed artifact pedestals.",
        "Echo Chamber: Amplifies ambient whispers and entity movement."
      ],
      color: "border-yellow-700/40 text-yellow-300"
    },
    {
      id: "labyrinthine_grids",
      name: "Labyrinthine Grids",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Non-Euclidean Maze",
      scale: "Endless Partitions",
      materials: ["Uniform Oak Planks"],
      desc: "Seamless repeating corridors designed to trap travelers in an infinite loop of indistinguishable wooden halls.",
      features: [
        "Geometric Confusion: Hallways seamlessly reconnect in non-intuitive patterns.",
        "Blind Corners: High probability of ambushes at 90-degree intersections.",
        "Marker Strategy: Explorers are advised to leave torch or block trails."
      ],
      color: "border-yellow-700/40 text-yellow-300"
    },

    // THE SUB-STRATA
    {
      id: "right_side_up_city",
      name: "Right Side Up City",
      dimension: "The Sub-Strata",
      dimensionId: "substrata",
      tag: "Megalopolis Ruin",
      scale: "Multi-block Skyscraper Complex",
      materials: ["Dark Oak Planks", "Petrified Logs", "Deepslate"],
      desc: "A decayed, colossal city of wooden skyscrapers standing upright across the floor of The Sub-Strata.",
      features: [
        "Tower Exploration: Explorable multi-floor buildings with interior stairwells and offices.",
        "Catastrophic Decay: Collapsed floorboards create vertical drop pitfalls.",
        "High Loot Value: Concentrated tech, gear, and rare dimensional artifacts."
      ],
      color: "border-stone-600 text-stone-300"
    },
    {
      id: "upside_down_city",
      name: "Upside Down City",
      dimension: "The Sub-Strata",
      dimensionId: "substrata",
      tag: "Inverted Megastructure",
      scale: "Ceiling-Anchored Skyscrapers",
      materials: ["Petrified Planks", "Inverted Pillars"],
      desc: "A surreal, fully inverted mirror city hanging suspended from the bedrock ceiling.",
      features: [
        "Inverted Navigation: Requires scaffolding, pearl projection, or flight to explore safely.",
        "Gravity Contrast: The visual disorientation of walking under skyscrapers overhead.",
        "Ancient Lore: Relics of an extinct pre-collapse civilization."
      ],
      color: "border-stone-600 text-stone-300"
    },
    {
      id: "scaffolding_tower",
      name: "Scaffolding Tower",
      dimension: "The Sub-Strata",
      dimensionId: "substrata",
      tag: "Spawn Monument",
      scale: "Colossal Descent Shaft (Y=319 to Y=161)",
      materials: ["Scaffolding", "Reinforced Planks", "Ladders"],
      desc: "A massive, towering lattice of scaffolding where players spawn upon first entering The Sub-Strata.",
      features: [
        "Descent Requirement: Players must carefully climb down 158 vertical blocks to reach solid ground.",
        "Safe Staging: Protected starting perimeter before venturing into hostile sectors.",
        "Structural Landmarks: Visible across great distances in the subterranean gloom."
      ],
      color: "border-stone-600 text-stone-300"
    },
    {
      id: "catwalk_sub_cavern",
      name: "Catwalk Sub-Cavern",
      dimension: "The Sub-Strata",
      dimensionId: "substrata",
      tag: "Transit Network",
      scale: "Sprawling Bridge Array",
      materials: ["Iron Grates", "Petrified Oak Planks"],
      desc: "Extensive industrial catwalks spanning deep abysses between subterranean city sectors.",
      features: [
        "Inter-Sector Bridges: Connects distant skyscraper rooftops and cavern walls.",
        "Perilous Crossings: Missing walkway segments demand precision jumping.",
        "Strategic High Ground: Excellent vantage point for spotting Blindspot Splinters."
      ],
      color: "border-stone-600 text-stone-300"
    },

    // THE PETRIFIED WEALD
    {
      id: "calcified_spikes",
      name: "Calcified Spikes",
      dimension: "The Petrified Weald",
      dimensionId: "petrified",
      tag: "Natural Monument",
      scale: "60 to 110 Blocks Tall",
      materials: ["Petrified Rotten Oak Wood", "Ash Stone"],
      desc: "Gargantuan needle-sharp spikes of petrified wood piercing the ash-choked atmosphere.",
      features: [
        "Rugged Profile: Leans 4 to 10 blocks in randomized directions with heavy surface roughness.",
        "Deep Anchoring: Embeds up to 20 blocks below surface terrain for seamless integration.",
        "Imposing Landscape: Defines the iconic silhouette of the Calcified Plains."
      ],
      color: "border-zinc-600 text-zinc-300"
    },
    {
      id: "large_calcified_spikes",
      name: "Large Calcified Spikes",
      dimension: "The Petrified Weald",
      dimensionId: "petrified",
      tag: "Megastructure",
      scale: "100 to 185 Blocks Tall (Base Radius 10-14m)",
      materials: ["Petrified Rotten Oak Wood"],
      desc: "Mountain-scale pillars rising from deep oceanic trenches and river beds up into the sky.",
      features: [
        "Water-Logging Safe: Specifically anchored to ocean floor heightmaps without fluid displacement errors.",
        "Subterranean Base: Embeds up to 25 blocks beneath the ocean bed to withstand tectonic currents.",
        "Colossal Landmarks: Visible from multiple biomes away across the Fossilized Core."
      ],
      color: "border-zinc-600 text-zinc-300"
    },

    // THE FAMILIAR
    {
      id: "familiar_farlands",
      name: "Familiar Farlands",
      dimension: "The Familiar",
      dimensionId: "familiar",
      tag: "Nostalgic Anomaly",
      scale: "Astronomical Boundary (6,275,412m+)",
      materials: ["Grass Blocks", "Dirt", "Stone"],
      desc: "A faithful recreation of classic Minecraft beta world generation glitches in The Familiar.",
      features: [
        "Organic Composition: Unlike Backwoods Farlands, these are built organically from natural grass and stone.",
        "Gravity Decay: Moving past boundary coordinates induces weightlessness physics.",
        "Peaceful Glitch: Generates without hostile infestation in serene mirrored biomes."
      ],
      color: "border-emerald-600 text-emerald-300"
    }
  ];

  const dimensionsList = [
    { id: 'all', name: 'All Realms' },
    { id: 'backwoods', name: 'The Backwoods' },
    { id: 'grain', name: 'The Grain' },
    { id: 'substrata', name: 'The Sub-Strata' },
    { id: 'petrified', name: 'The Petrified Weald' },
    { id: 'familiar', name: 'The Familiar' }
  ];

  const filteredStructures = structures.filter(s => {
    const matchesDimension = selectedDimension === 'all' || s.dimensionId === selectedDimension;
    const matchesSearch = searchQuery.trim() === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dimension.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.materials.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDimension && matchesSearch;
  });

  return (
    <UpdatedFrame id="structures_page_view" isUpdated={true}>
      <div className="space-y-8 max-w-[1000px] mx-auto text-[#c9d1c9]">
        
        {/* HEADER */}
        <div className="p-6 sm:p-8 bg-[#0c0f0d] border border-[#1e2720] rounded-xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#709978]">
            <Building2 className="w-4 h-4 text-[#709978]" />
            <span>Architectural & Geological Survey</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#e0e7e0] tracking-tight">
            Structures & Monuments
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-[#a9bcae]">
            Across the dimensional layers of Backwoods generate anomalous structures, fractal anomalies, colossal scaffolding towers, and monolithic glitch walls that defy standard Minecraft physics and geometry.
          </p>

          {/* Search and Filters */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6b5e]" />
              <input
                type="text"
                placeholder="Search structures by name, material, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111613] border border-[#1f2a21] text-[#c9d1c9] text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-[#709978]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {dimensionsList.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDimension(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    selectedDimension === d.id
                      ? 'bg-[#151e17] text-[#a9d1b0] border border-[#2d3e30] font-semibold'
                      : 'bg-[#090c0a] text-[#718274] hover:text-[#c9d1c9] border border-[#141b16]'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STRUCTURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredStructures.map((struct) => (
            <div
              key={struct.id}
              className={`p-5 bg-[#0a0d0b] border ${struct.color} rounded-xl space-y-4 shadow-md flex flex-col justify-between hover:scale-[1.01] transition-transform`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#18221a] pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#709978] tracking-wider block">
                      {struct.dimension}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#e0e7e0] mt-0.5">{struct.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141d16] text-[#a9d1b0] border border-[#1e2c20]">
                    {struct.tag}
                  </span>
                </div>

                <p className="text-xs text-[#9eb0a1] leading-relaxed">
                  {struct.desc}
                </p>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono text-[#5a6b5e] uppercase tracking-wider">Key Specifications:</div>
                  <ul className="space-y-1 text-xs text-[#829285]">
                    {struct.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-[#709978] mt-1.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-[#141c15] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#617364]">
                <div>
                  <span className="text-[#4a594c]">Scale: </span>
                  <span className="text-[#a9d1b0]">{struct.scale}</span>
                </div>
                <div className="flex items-center gap-1">
                  {struct.materials.map((m, idx) => (
                    <span key={idx} className="bg-[#101612] px-1.5 py-0.5 rounded border border-[#19221b] text-[#c9d1c9]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStructures.length === 0 && (
          <div className="p-12 text-center bg-[#0a0c0a] border border-[#1b231d] rounded-xl space-y-2">
            <p className="text-sm font-mono text-[#829285]">No structures matched your search filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedDimension('all'); }}
              className="text-xs font-mono text-[#709978] underline hover:text-[#a9d1b0]"
            >
              Reset filters
            </button>
          </div>
        )}

      </div>
    </UpdatedFrame>
  );
}
