import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Eye, 
  X, 
  Maximize2, 
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import UpdatedFrame from '../UpdatedFrame';

function getAbsoluteAssetUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  let cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  if (cleanUrl.startsWith('wiki_assets/')) {
    cleanUrl = cleanUrl.replace('wiki_assets/', '');
  }
  
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const isGitHubPages = window.location.hostname.endsWith('github.io');
  
  let base = '';
  if (isGitHubPages && segments.length > 0) {
    base = `/${segments[0]}/`;
  } else {
    const viteBase = import.meta.env.BASE_URL || '/';
    if (viteBase === './' || viteBase === '.') {
      base = '/';
    } else {
      base = viteBase.endsWith('/') ? viteBase : `${viteBase}/`;
    }
  }
  
  return `${base}${cleanUrl}`;
}

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
  image?: string;
  isUpdated?: boolean;
}

export default function StructuresView() {
  const [selectedDimension, setSelectedDimension] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [enlargedImage, setEnlargedImage] = useState<{ url: string; name: string; desc: string } | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

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
        "Summit Loot: Houses a high-tier wooden chest at its summit containing dimensional survival equipment.",
        "Architectural Anomaly: Features missing banisters, worn steps, and zero structural foundation support.",
        "Fall Peril: Steep drop hazard with zero safety barriers into the surrounding dense woods."
      ],
      color: "border-amber-700/40 text-amber-300",
      image: "structures/staircase.png"
    },
    {
      id: "backwoods_farlands",
      name: "The Farlands",
      dimension: "The Backwoods",
      dimensionId: "backwoods",
      tag: "Boundary Glitch",
      scale: "Monolithic Planks (6,275,412m+)",
      materials: ["Solid Oak Planks", "Rotten Oak Logs"],
      desc: "Massive solid walls of Oak Planks and structural distortion extending infinitely towards world boundaries.",
      features: [
        "Anti-Gravity Anomaly: Crossing the boundary threshold degrades gravity into an anti-gravity floating state.",
        "Monolithic Scale: Infinite vertical and horizontal walls composed entirely of wooden boards.",
        "Spatial Distortions: Coordinate tracking becomes unreliable due to non-Euclidean mesh compression."
      ],
      color: "border-amber-700/40 text-amber-300",
      image: "structures/backwoods_farlands.png"
    },
    {
      id: "oak_stalactites",
      name: "Oak Stalactites",
      dimension: "The Backwoods",
      dimensionId: "backwoods",
      tag: "Subterranean Stalactite",
      scale: "Tapered Columns (12-30m)",
      materials: ["Oak Logs"],
      desc: "Inverted wooden log spikes growing upward into solid cave ceilings with inverse tapering.",
      features: [
        "Ceiling Anchoring: Embeds directly into overhead stone ceilings without popping out on floor surfaces.",
        "Inverse Taper: Widens at the top ceiling junction and tapers downward into a sharp wooden point.",
        "Wood Harvest: High density source of harvestable Oak Logs inside subterranean caverns."
      ],
      color: "border-amber-700/40 text-amber-300",
      image: "structures/oak_stalactites.png"
    },
    {
      id: "menger_sponge_small",
      name: "Menger Sponge (Small)",
      dimension: "The Backwoods",
      dimensionId: "backwoods",
      tag: "Fractal Formation",
      scale: "Compact Recursive Cube (2% Spawn Rate / Chunk)",
      materials: ["Lignum Caro (90%)", "Splintered Oak (9%)", "Oak Planks (1%)", "Chest", "Furnace", "Red Bed"],
      desc: "A compact 3D recursive cubic sponge constructed from weighted organic Caro and oak materials.",
      features: [
        "Weighted Material Mix: Generated from 90% organic Lignum Caro, 9% Splintered Oak, and 1% Oak Planks.",
        "Interior Loot Voids: Hollow internal fractal chambers contain Furnaces, Loot Chests, and Red Beds.",
        "Compact Redoubt: Functions as a defensive shelter against hostile surface predators."
      ],
      color: "border-amber-700/40 text-amber-300",
      image: "structures/small_menger_sponge.png"
    },

    // THE GRAIN
    {
      id: "the_underside",
      name: "The Underside",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Sub-Floor Void Chamber",
      scale: "Y=20 to Y=44 (24m Chamber Height)",
      materials: ["Oak Planks (Ceiling & Floor)", "Oak Fences"],
      desc: "A sprawling subterranean void chamber generating directly beneath the main floorboards of The Grain.",
      features: [
        "Structural Boundaries: Enclosed by solid Oak Plank ceiling (Y=44) and floor (Y=20) plates.",
        "Support Columns: Vertical Oak Fence columns generate on a strict 4-block grid between Y=20 and Y=44.",
        "Terrain Override: Force-overwrites pre-existing terrain rule blocks and mazes as chunks process."
      ],
      color: "border-yellow-700/40 text-yellow-300",
      image: "structures/the_underside.png",
      isUpdated: true
    },
    {
      id: "void_basement",
      name: "Void Basement",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Subterranean Sub-Grid",
      scale: "Y=-50 to Y=-13 (Catwalks at Y=-34)",
      materials: ["Oak Planks (Catwalks & Plates)", "Oak Fences"],
      desc: "A submerged undercroft beneath floorboards featuring sharp 90-degree walkway networks over deep voids.",
      features: [
        "Catwalk Array: 2-block wide Oak Plank catwalks at Y=-34 following 'Square Snake' grid paths (24-block frequency).",
        "Downward Support: Oak Fence columns extend downward every 5 blocks beneath catwalk intersections.",
        "Enclosed Volume: Sealed above (Y=-13) and below (Y=-50) by solid Oak Plank floor/ceiling layers."
      ],
      color: "border-yellow-700/40 text-yellow-300",
      image: "structures/void_basement.png"
    },
    {
      id: "void_bedrock_planks",
      name: "Void Bedrock Planks",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Bedrock Fissure Anomaly",
      scale: "Y=-64 to Y=-59 Bedrock Layer (3-5.5m Radius Blobs)",
      materials: ["Oak Planks", "Bedrock"],
      desc: "Direct bedrock layer replacement where ellipsoidal Oak Plank blobs punch holes down into the Void.",
      features: [
        "Bedrock Punchout: Replaces vanilla bedrock blocks at Y=-64 to Y=-59 with randomized 3 to 5.5 block radius blobs.",
        "Flattened Ellipsoid Clusters: Stamped across bedrock floor layers from Y=-64 to Y=-59 with a 3 to 5.5 block radius.",
        "Void Apertures: Creates direct fall holes into the Void at the bottom of the world."
      ],
      color: "border-yellow-700/40 text-yellow-300",
      image: "structures/void_planks.png",
      isUpdated: true
    },
    {
      id: "cavern_grid",
      name: "Cavern Grid",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Structural Cavern Grid",
      scale: "Multi-level Subterranean Lattice",
      materials: ["Oak Planks", "Air"],
      desc: "An intricate 3D grid layout stretching across subterranean caverns within The Grain.",
      features: [
        "Modular Architecture: Repeating hallway cells separated by wooden partitions.",
        "Disorientation: Identical room geometries induce acute navigational confusion.",
        "Acoustic Amplification: Footsteps reverberate loudly across wooden grid frames."
      ],
      color: "border-yellow-700/40 text-yellow-300",
      image: "structures/cavern_grid.png"
    },
    {
      id: "menger_sponge",
      name: "Menger Sponge (Macro)",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Macro Fractal Matrix",
      scale: "Massive 81x81x81m Cube Matrix",
      materials: ["Oak Planks", "Bedrock", "Air"],
      desc: "An 81x81x81 block recursive 3D fractal Menger sponge matrix carved into the terrain.",
      features: [
        "3D Fractal Subtraction: Carves recursive 3D hollow tunnel networks through the solid structure.",
        "Floor Protection: Preserves existing bedrock floor plates from being sliced by fractal voids.",
        "Navigational Labyrinth: Complex multi-tier 3D interior tunnel network."
      ],
      color: "border-yellow-700/40 text-yellow-300",
      image: "structures/grain_menger_sponge.png"
    },
    {
      id: "sky_grid",
      name: "Sky Grid",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Aerial Grid Matrix",
      scale: "Y=190 to Y=319 (12-block Equalized Cube Cavities)",
      materials: ["Oak Planks"],
      desc: "An aerial lattice of 1-block wide Oak Plank beams forming 12x12x12 block open cube cavities high overhead.",
      features: [
        "Equalized Spacing: Beams generate every 12 blocks horizontally and vertically (11 blocks air + 1 block beam).",
        "Pillar Intersections: Solid vertical Oak Plank columns run full height through every grid line intersection.",
        "High-Altitude Crossing: Allows elevated cross-biome transit above forest canopy terrain."
      ],
      color: "border-yellow-700/40 text-yellow-300",
      image: "structures/sky_grid.png"
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
      color: "border-yellow-700/40 text-yellow-300",
      image: "structures/nest_grids.png"
    },
    {
      id: "sub_grain_atria",
      name: "Sub-Grain Atria",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Stacked Colonnade Halls",
      scale: "Y=8 (3 Stacked 5-block Floors with 1-block Gaps)",
      materials: ["Oak Planks", "Air"],
      desc: "A multi-floor atrium structure starting at Y=8 with carved 6-block wide hallways and vertical shafts.",
      features: [
        "Triple Tier Design: Generates 3 stacked 5-block tall floor levels with 1-block gaps between floors.",
        "Coordinate Carving: Carves 6-block wide hallways along X and Z axes at regular 10-block intervals starting at Y=8.",
        "Connecting Shafts: 2x2 vertical shaft openings carved every 20 blocks to allow movement between levels."
      ],
      color: "border-yellow-700/40 text-yellow-300",
      image: "structures/sub_grain_atria.png"
    },
    {
      id: "labyrinthine_grids",
      name: "Labyrinthine Grids",
      dimension: "The Grain",
      dimensionId: "grain",
      tag: "Non-Euclidean Maze",
      scale: "Endless Partitions",
      materials: ["Uniform Oak Planks"],
      desc: "Repeating 3D corridor grids designed to disorient travelers in an infinite loop of indistinguishable wooden halls.",
      features: [
        "Geometric Confusion: Hallways seamlessly reconnect in non-intuitive patterns.",
        "Blind Corners: High probability of ambushes at 90-degree intersections.",
        "Marker Strategy: Explorers are advised to leave torch or block trails."
      ],
      color: "border-yellow-700/40 text-yellow-300",
      image: "structures/labyrinthine_grids.png"
    },

    // THE SUB-STRATA
    {
      id: "right_side_up_city",
      name: "Right Side Up City",
      dimension: "The Sub-Strata",
      dimensionId: "substrata",
      tag: "Skyscraper Ruins",
      scale: "Floor at Y=63 (20-50m Building Heights)",
      materials: ["Oak Planks", "Air"],
      desc: "A decayed metropolis of wooden skyscrapers standing upright across a solid Y=63 floor plate.",
      features: [
        "Procedural Heights: Buildings stand 20 to 50 blocks tall with 5x5 to 8x8 block footprints on a 10-block grid.",
        "40% Hollow Shell Chance: 40% of generated buildings feature hollow air interiors with roof and floor slabs.",
        "Macro Roundabouts: 24-block radius circular park roundabouts generate every 10x10 macro chunk sector."
      ],
      color: "border-stone-600 text-stone-300",
      image: "structures/right_side_up_city.png"
    },
    {
      id: "upside_down_city",
      name: "Upside Down City",
      dimension: "The Sub-Strata",
      dimensionId: "substrata",
      tag: "Inverted Megastructure",
      scale: "Ceiling at Y=160 (20-50m Inverted Towers)",
      materials: ["Oak Planks"],
      desc: "A surreal inverted mirror city hanging suspended downward from a solid Y=160 bedrock ceiling plate.",
      features: [
        "Solid Ceiling Anchor: Anchored to a forced Y=160 ceiling plate using Flag 16 world data injections.",
        "Downward Towers: Buildings extend 20 to 50 blocks downward into subterranean cavern air space.",
        "Vertical Navigation: Requires ladders, scaffolding, or Ender Pearl projection to explore safely."
      ],
      color: "border-stone-600 text-stone-300",
      image: "structures/upside_down_city.png"
    },
    {
      id: "scaffolding_tower",
      name: "Scaffolding Tower",
      dimension: "The Sub-Strata",
      dimensionId: "substrata",
      tag: "Spawn Monument",
      scale: "Y=161 to Y=319 (158m Tall / 14x14 Symmetrical Frame)",
      materials: ["Oak Planks", "Oak Stairs"],
      desc: "A colossal 14x14 symmetrical frame built from Oak Planks and directional Oak Stairs spanning 158 vertical blocks.",
      features: [
        "Sub-Strata Spawn Point: Serves as the initial arrival landmark when descending into The Sub-Strata.",
        "14x14 Grid Frame: Constructed from Oak Plank corner pillars, horizontal beams, and directional Oak Stair ramps.",
        "Massive Descent Shaft: Spans 158 vertical blocks from Y=161 to build limit at Y=319."
      ],
      color: "border-stone-600 text-stone-300",
      image: "structures/scaffolding_tower.png"
    },
    {
      id: "catwalk_sub_cavern",
      name: "Catwalk Sub-Cavern",
      dimension: "The Sub-Strata",
      dimensionId: "substrata",
      tag: "Industrial Transit Network",
      scale: "Sprawling Bridge Array",
      materials: ["Oak Planks", "Air"],
      desc: "Extensive elevated catwalks spanning deep abysses between subterranean city sectors.",
      features: [
        "Elevated Transit: Connects distant skyscraper rooftops and cavern walls across cavern gulfs.",
        "Perilous Crossings: Missing walkway segments demand precision jumping over deep drops.",
        "Vantage Points: Excellent high ground for surveying city sectors and spotting Blindspot Splinters."
      ],
      color: "border-stone-600 text-stone-300",
      image: "structures/catwalk_sub_cavern.png"
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
        "Randomized Lean: Leans 4 to 10 blocks in randomized directions with heavy surface roughness.",
        "Deep Root Anchor: Embeds up to 20 blocks below surface terrain for seamless geological integration.",
        "Petrified Weald Icon: Defines the jagged, calcified skyline of the Calcified Plains."
      ],
      color: "border-zinc-600 text-zinc-300",
      image: "structures/calcified_spikes.png"
    },
    {
      id: "large_calcified_spikes",
      name: "Large Calcified Spikes",
      dimension: "The Petrified Weald",
      dimensionId: "petrified",
      tag: "Oceanic Megastructure",
      scale: "100 to 185 Blocks Tall (Base Radius 10-14m)",
      materials: ["Petrified Rotten Oak Wood"],
      desc: "Mountain-scale petrified pillars rising from ocean floors and deep trenches up into the sky.",
      features: [
        "Water-Logging Safe: Evaluates OCEAN_FLOOR_WG heightmaps to anchor safely on seabed stone.",
        "25-Block Sub-Bed Foundation: Embeds up to 25 blocks beneath ocean beds to prevent water displacement errors.",
        "Colossal Landmarks: Visible from multiple biomes away across the Fossilized Core."
      ],
      color: "border-zinc-600 text-zinc-300",
      image: "structures/large_calcified_spikes.png"
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
        "Organic Composition: Built organically from natural grass, dirt, and stone in mirrored biomes.",
        "Gravity Decay: Moving past boundary coordinates induces weightlessness physics.",
        "Peaceful Glitch: Generates without hostile infestation in serene mirrored biomes."
      ],
      color: "border-emerald-600 text-emerald-300",
      image: "structures/familiar_farlands.png",
      isUpdated: true
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
            Across the dimensional layers of Backwoods generate anomalous structures, fractal anomalies, colossal scaffolding towers, subterranean sub-floors, and monolithic glitch walls that defy standard Minecraft physics and geometry.
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
          {filteredStructures.map((struct) => {
            const cardContent = (
              <div
                key={struct.id}
                className={`p-5 bg-[#0a0d0b] border ${struct.color} rounded-xl space-y-4 shadow-md flex flex-col justify-between hover:scale-[1.01] transition-transform relative overflow-hidden`}
              >
                <div className="space-y-3">
                  {/* Structure Image Container */}
                  {struct.image && !failedImages[struct.id] ? (
                    <div 
                      className="relative w-full h-44 bg-[#080b09] rounded-lg overflow-hidden border border-[#19231b] group cursor-pointer"
                      onClick={() => setEnlargedImage({ url: getAbsoluteAssetUrl(struct.image!), name: struct.name, desc: struct.desc })}
                    >
                      <img
                        src={getAbsoluteAssetUrl(struct.image)}
                        alt={struct.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => handleImageError(struct.id)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0b] via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-[#060806]/80 backdrop-blur-sm rounded border border-[#1f2c21] text-[10px] font-mono text-[#a9d1b0] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3" />
                        <span>Enlarge Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 bg-[#0d120e] rounded-lg border border-[#18231a] flex flex-col items-center justify-center text-[#526355] text-xs font-mono space-y-1">
                      <ImageIcon className="w-6 h-6 opacity-40" />
                      <span>No Photo Archive</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-[#18221a] pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#709978] tracking-wider block">
                        {struct.dimension}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#e0e7e0] mt-0.5 flex items-center gap-2">
                        <span>{struct.name}</span>
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141d16] text-[#a9d1b0] border border-[#1e2c20]">
                      {struct.tag}
                    </span>
                  </div>

                  <p className="text-xs text-[#9eb0a1] leading-relaxed">
                    {struct.desc}
                  </p>

                  {/* FARLANDS DISTANCE ANOMALY WARNING CALLOUT */}
                  {(struct.id === 'backwoods_farlands' || struct.id === 'familiar_farlands') && (
                    <div className="p-3 bg-amber-950/25 border border-amber-600/40 rounded-lg space-y-2 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Farlands Generation Glitch & Distance Anomaly</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-200/90">
                        <strong>Perlin Noise Bug Emulation:</strong> The Farlands terrain is an intentional recreation of the historic Beta 1.7 terrain generation glitch, triggered when 3D Perlin noise coordinates overflow near world boundaries.
                      </p>
                      <p className="text-[11px] leading-relaxed text-amber-200/90">
                        <strong>Threshold Distance vs. Morphing Glitch:</strong> If the Farlands distance threshold is configured to a low value (such as 256 blocks instead of the default 836,721 blocks), the Farlands render as classic, authentic Beta 1.7 wall slabs and Swiss-cheese grids right near spawn.
                      </p>
                      <p className="text-[11px] leading-relaxed text-amber-200/90">
                        When generating at extreme coordinates (836,721+ blocks out), a secondary floating-point coordinate precision degradation bug occurs in the engine. This causes the classic Farlands walls to morph, fracture, and compress into erratic Swiss-cheese tunnels and floating block clusters the farther out you travel.
                      </p>
                      <div className="pt-1.5 text-[10px] text-amber-300/80 border-t border-amber-700/30 font-mono">
                        <strong>Gravity Decay:</strong> Past the distance threshold, gravitational pull smoothly decays (jump height increases up to 1.8x, and dropped items form zero-g magnetic clusters).
                      </div>
                    </div>
                  )}

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
                  <div className="flex items-center gap-1 flex-wrap">
                    {struct.materials.map((m, idx) => (
                      <span key={idx} className="bg-[#101612] px-1.5 py-0.5 rounded border border-[#19221b] text-[#c9d1c9]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );

            return struct.isUpdated ? (
              <UpdatedFrame key={struct.id} id={`struct_${struct.id}`} isUpdated={true}>
                {cardContent}
              </UpdatedFrame>
            ) : (
              cardContent
            );
          })}
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

      {/* ENLARGED IMAGE LIGHTBOX MODAL */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setEnlargedImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[#0c100d] border border-[#1f2d22] rounded-2xl overflow-hidden shadow-2xl flex flex-col space-y-4 p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#18231a] pb-3">
              <div>
                <span className="text-xs font-mono text-[#709978] uppercase tracking-wider">Structure Survey Archive</span>
                <h3 className="font-serif text-xl font-bold text-[#e0e7e0]">{enlargedImage.name}</h3>
              </div>
              <button 
                onClick={() => setEnlargedImage(null)}
                className="p-1.5 rounded-lg bg-[#141b16] text-[#718274] hover:text-[#e0e7e0] hover:bg-[#1f2a21] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative max-h-[70vh] flex items-center justify-center bg-[#060806] rounded-xl overflow-hidden border border-[#161f17]">
              <img 
                src={enlargedImage.url} 
                alt={enlargedImage.name}
                className="max-h-[68vh] w-auto object-contain" 
              />
            </div>

            <p className="text-xs text-[#9eb0a1] font-mono leading-relaxed bg-[#080b09] p-3 rounded-lg border border-[#141c15]">
              {enlargedImage.desc}
            </p>
          </div>
        </div>
      )}
    </UpdatedFrame>
  );
}

