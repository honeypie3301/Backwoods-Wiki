import React, { useState, useMemo } from 'react';
import { 
  Search, Info, Shield, Flame, Hammer, Coins, AlertTriangle, 
  ShieldAlert, Sparkles, ChevronDown, ChevronUp, LayoutGrid, Maximize2, Minimize2 
} from 'lucide-react';
import FancyRecipeView from './FancyRecipeView';
import UpdatedFrame from '../UpdatedFrame';

function getBlockRecipeIds(name: string): string[] {
  if (name === "Splintered Oak Planks") {
    return ['splintered_oak_planks'];
  }
  if (name === "Splintered Oak Wood") {
    return ['splintered_oak_wood'];
  }
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
  if (name === "Petrified Planks & Slab & Stairs" || name === "Petrified Planks, Slab, Stairs & Fence Gate") {
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
  tool?: string;
  description: string;
  latin?: { term: string; translation: string }[];
  mechanics?: string[];
  lootTable?: { item: string; weight: number; condition: string }[];
  isWarning?: boolean;
  warningText?: string;
  isSpecial?: boolean;
  specialText?: string;
  isUpdated?: boolean;
}

export default function BlocksView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDim, setSelectedDim] = useState<string>('all');
  const [compactMode, setCompactMode] = useState<boolean>(true);
  const [expandedMechanics, setExpandedMechanics] = useState<Record<string, boolean>>({});
  const [expandedLoot, setExpandedLoot] = useState<Record<string, boolean>>({});
  const [expandedRecipes, setExpandedRecipes] = useState<Record<string, boolean>>({});

  const blocks: BlockItem[] = [
    {
      name: "Scandere Lignum Log",
      dimension: "overworld",
      hardness: "2.7",
      blastRes: "5.0",
      burnTime: "270 ticks",
      tool: "Axe",
      description: "The trunk of the Scandere tree. It starts as a regular dark oak-shaped tree upon generation and grows naturally over time, climbing upwards and sprouting leaves.",
      latin: [
        { term: "Scandere", translation: "to climb" },
        { term: "Lignum", translation: "wood" }
      ],
      mechanics: [
        "Growth (Ascendance): Grows upwards to reach a colossal height of 50 to 80 blocks tall. It sprouts horizontal branches and forms a majestic, dense canopy crown of Oak Leaves and hanging Vines at the top (Sequoia/Redwood style).",
        "Trunk Optimization: Inner trunk blocks buried under other logs skip active growth ticks to prevent tick lag, ensuring 80-tall trees don't affect server performance.",
        "Climbing Ability: If the log is adjacent to a solid wall, the active growth tip has a 10% chance per random tick to climb vertically along the structure up to a max height of 80 blocks.",
        "Canopy Growth Limits: Canopy leaves and draping Vines grow exclusively in the top 12 blocks of the trunk, ensuring the lower 80% remains a clean, monolithic wooden pillar.",
        "Symbiosis: Emits a passive aura that attracts nearby passive mobs, drawing them to idle in a ring around it, which increases their breeding rate."
      ]
    },
    {
      name: "Scandere Lignum (Spreading Root-wood)",
      dimension: "overworld",
      hardness: "2.0",
      blastRes: "5.0",
      burnTime: "270 ticks",
      tool: "Axe",
      description: "The spreading root-wood of the Scandere. This all-sided bark block acts as the roots of the tree, growing primarily underground to replace stone or dirt.",
      mechanics: [
        "Spreading: Spreads tick by tick, replacing solid blocks in its path. Under open sky, 80% horizontal spread is favored. Underground, 60% downwards spread is favored to dig deep roots.",
        "Animal Fertilization: Nearby adult passive animals within a 6-block radius reduce the spread delay by up to 4 ticks, actively accelerating root network expansion.",
        "Vein-Shape Control: Employs a hard cap on network density. Roots will not spread to a block if it is already adjacent to 2 or more Scandere Lignum blocks, preventing blocky blobs and forming natural, thin veins.",
        "Limit of Growth: Underground growth naturally halts after 10 blocks of outward growth from the center, preventing infinite expansion.",
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
      hardness: "0.0",
      blastRes: "0.0",
      burnTime: "100 ticks (flammable)",
      tool: "Shears / Hand",
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
      hardness: "2.0",
      blastRes: "10.0",
      burnTime: "13 hours (smelting)",
      tool: "Pickaxe",
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
      hardness: "0.35",
      blastRes: "0.8",
      tool: "Shovel",
      description: "The primary surface block of the Loss dimension. A pale, completely drained version of dirt entirely leached of life.",
      mechanics: [
        "Absolute Silence: Produces absolutely no audio or sound footsteps when walked upon, broken, or placed."
      ]
    },
    {
      name: "Sinking Ash",
      dimension: "loss",
      hardness: "0.5",
      blastRes: "0.5",
      tool: "Shovel",
      description: "A dangerous natural hazard generating in Loss. Acts as a mobility control hazard.",
      mechanics: [
        "Movement Restriction: Severely slows player movement when stepped inside.",
        "Fall Mitigation: Completely cushions and cancels all fall damage.",
        "Purification: Right-clicking with Petrified Resin converts the block into a Faded Block. Right-clicking with Compact Petrified Resin converts it into Nullstone. Each conversion consumes 1 resin item from your hand."
      ]
    },
    {
      name: "Nullstone & Cobbled Nullstone",
      dimension: "loss",
      hardness: "2.2",
      blastRes: "7.5",
      tool: "Pickaxe",
      description: "The primary stone of the Loss dimension, formed from degraded stone. Texture is washed-out and low-detail. Produces no sound upon interaction. Additionally, its void-like composition absorbs physical impact—any projectile (such as arrows or spectral arrows) that strikes a Nullstone block is instantly destroyed in a flash of particles.",
      mechanics: [
        "Nullstone Family: Can be crafted into slabs, stairs, and walls.",
        "Cracked Nullstone: Created by smelting Nullstone in a furnace (takes 6 seconds, grants 0.2 XP; hardness 1.8, blast res 6.0)."
      ]
    },
    {
      name: "Plaque Block & Plaque Heart",
      dimension: "loss",
      hardness: "1.5 / 6.0",
      blastRes: "2.0 / 18.0",
      tool: "Shovel",
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
      hardness: "2.0",
      blastRes: "7.0",
      tool: "Pickaxe (Required)",
      description: "An ore block generating between Y -7 and Y 92 inside the Loss dimension.",
      mechanics: [
        "Yield: Yields 1 to 2 Memory Shards when mined."
      ]
    },
    {
      name: "Rotten Oak Wood Family",
      dimension: "backwoods_rotting",
      hardness: "3.0",
      blastRes: "15.0",
      burnTime: "200 - 240 ticks",
      tool: "Axe",
      description: "Standard Oak Planks spontaneously decay into Rotten Oak blocks when a player's time in the Backwoods exceeds 24,000 ticks. The decay spreads to adjacent blocks.",
      mechanics: [
        "Log Shards: Rotten Oak Logs have a chance to drop a Heartwood Shard when chopped.",
        "Crafting Base: Planks are used as base ingredients for rotten wood-tier crafting tools.",
        "Complete Set: Includes planks, slabs, stairs, fences, gates, trapdoors, and pressure plates."
      ],
      isWarning: true,
      warningText: "Rot Hazard: Carrying any Rotten Oak variant block or item in your inventory inflicts 0.05 wood pricking damage per slot every 45 ticks. This damage is completely prevented if you are under the Inoculation effect."
    },
    {
      name: "Splintered Oak Planks",
      dimension: "overworld",
      hardness: "2.2",
      blastRes: "3.5",
      tool: "Axe",
      description: "A hazardous, defensive spiked building block covered in sharp splinters. Handled with caution to prevent injury.",
      mechanics: [
        "Crouch Placement Only: Non-sneak block placement on top is strictly locked and fails to prevent unwanted construction over active hazards. Players must sneak (crouch) to place any block on it.",
        "Mob Caution: Smart monsters detect the hazardous spiked surface and actively avoid pathfinding over these planks.",
        "Spiked Friction: Spike friction reduces standard walking velocity across the block surface (speed factor: 0.6).",
        "Axe Stripping: Right-clicking with any Axe or Shears strips/disarms the block back to standard Oak Planks. This consumes tool durability, triggers 15 wood dust plume particles, and drops 0-2 Sharpened Splinter Shards. There is a 25% chance of structural collapse, breaking the block entirely instead of stripping it.",
        "Pricking Hazard: Stepping on the block without boots or while wearing Leather Boots inflicts 0.5 physical damage every 30 ticks. Higher-tier boots completely block damage but lose 1 point of durability every 60 ticks. Woodbound entities are fully immune.",
        "Impalement Falling: Falling from a height of 3 blocks or more on these planks without steel-capped boots multiplies impact gravity, inflicting severe impalement damage (fall distance plus 1-2 bonus physical damage) bypassing normal fall-mitigating blocks."
      ]
    },
    {
      name: "Petrified Rotten Oak Wood",
      dimension: "petrified_weald",
      hardness: "21.0",
      blastRes: "23.0",
      tool: "Axe",
      isUpdated: true,
      description: "The calcified, exceptionally dense remains of ancient flora. Features four-sided bark textures. Sturdiest block in the petrified set.",
      isSpecial: true,
      specialText: "Material Properties: Extremely dense, very high blast resistance (23.0), and 100% immune to fire or lava ignition."
    },
    {
      name: "Petrified Rotten Oak Log",
      dimension: "petrified_weald",
      hardness: "20.0",
      blastRes: "22.5",
      tool: "Axe",
      description: "The primary structural pillar of the ancient calcified trees in the Petrified Weald.",
      isSpecial: true,
      specialText: "Stripped Variant: Stripped Petrified Rotten Oak Log has hardness 17.0 and blast resistance 22.0."
    },
    {
      name: "Stripped Petrified Rotten Oak Log",
      dimension: "petrified_weald",
      hardness: "17.0",
      blastRes: "22.0",
      tool: "Axe",
      isUpdated: true,
      description: "Stripped variant of the Petrified Rotten Oak Log. Heavily mineralized heartwood exposed after outer bark removal.",
      isSpecial: true,
      specialText: "Completely immune to fire and lava ignition. Retains extreme structural integrity (hardness 17.0, blast resistance 22.0)."
    },
    {
      name: "Petrified Planks, Slab, Stairs & Fence Gate",
      dimension: "petrified_weald",
      hardness: "10.0",
      blastRes: "9.0",
      tool: "Axe",
      description: "Extremely heavy, calcified structural blocks including planks, slabs, stairs, and fence gates. They are entirely fireproof and offer immense blast resistance compared to normal wood.",
      mechanics: [
        "Sound Properties: Produces custom hollow rotting wood step and break sounds.",
        "Fire Immunity: Since they are fossilized, they cannot be set on fire or destroyed by lava."
      ]
    },
    {
      name: "Petrified Weald Leaves",
      dimension: "petrified_weald",
      hardness: "6.0",
      blastRes: "1.3",
      tool: "Shears / Hoe",
      description: "Brittle, calcified foliage. Structurally far tougher than vanilla leaves."
    },
    {
      name: "Sedgebrush & Tall Sedgebrush",
      dimension: "petrified_weald",
      hardness: "0.3",
      blastRes: "0.0",
      burnTime: "100 ticks (flammable)",
      tool: "Shears / Hand",
      isUpdated: true,
      description: "Arid, mineralized scrub brush growing across the Petrified Weald and dried Backwoods riverbeds. Brittle plant matter yielding resin.",
      mechanics: [
        "Harvest Drops: Breaking drops Petrified Resin (4-5% chance per break).",
        "Shearing: Can be sheared with Shears to obtain the intact plant block for decoration.",
        "Flammability: Highly flammable despite mineral dusting (flammability 100)."
      ],
      lootTable: [
        { item: "Sedgebrush", weight: 100, condition: "Shears" },
        { item: "Petrified Resin", weight: 5, condition: "Standard break (4-5% drop chance)" }
      ]
    },
    {
      name: "Amber Grit & Cobbled Amber Grit",
      dimension: "petrified_weald",
      hardness: "3.0",
      blastRes: "9.0",
      tool: "Pickaxe",
      description: "Dense deepslate-like ground block generating naturally in the Petrified Weald. Regular mining yields Cobbled Amber Grit and rare Petrified Oak Galls, while Silk Touch preserves the intact block.",
      isUpdated: true,
      lootTable: [
        { item: "Cobbled Amber Grit", weight: 100, condition: "Standard Break (without Silk Touch)" },
        { item: "Petrified Oak Gall (1-3)", weight: 15, condition: "Standard Break (15% drop rate)" },
        { item: "Amber Grit", weight: 100, condition: "Silk Touch" }
      ]
    },
    {
      name: "Windcap Mushroom Plant",
      dimension: "backwoods_rotting",
      hardness: "0.0",
      blastRes: "0.0",
      tool: "Hand / Shears",
      description: "A pale, aerated mushroom plant that generates naturally in damp forest biomes. Can be harvested for Windcap Mushrooms.",
      isUpdated: true,
      lootTable: [
        { item: "Windcap Mushroom", weight: 100, condition: "Harvesting plant" }
      ]
    },
    {
      name: "Lignum Caro",
      dimension: "backwoods_rotting",
      hardness: "2.5",
      blastRes: "1.5",
      tool: "Axe",
      isUpdated: true,
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
      name: "Lignum Caro Trapdoor",
      dimension: "backwoods_rotting",
      hardness: "2.5",
      blastRes: "1.5",
      burnTime: "300 ticks",
      tool: "Axe",
      description: "A fleshy trapdoor crafted from Lignum Caro. Can be opened by redstone or by hand.",
      mechanics: [
        "Reactive Organic Snapping: Due to its reactive organic nature, whenever an entity steps directly on a closed Lignum Caro Trapdoor, it will automatically snap open after a brief 4-tick delay, dropping the entity down.",
        "Furnace Fuel: It can be used as a furnace fuel (burns for 300 ticks)."
      ]
    },

    {
      name: "Fractus Prime Core",
      dimension: "backwoods_rotting",
      hardness: "5.0",
      blastRes: "12.0",
      tool: "Pickaxe",
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
      tool: "Shears / Axe",
      description: "A highly deceptive decoy block that looks visually indistinguishable from standard Oak Planks but physically behaves as a leaf block. It can only be found in the Backwoods dimension, acting as leaves for the trees in the Thicket biome. Designed for hidden traps and secret pathways.",
      mechanics: [
        "Flawless Mimicry: Uses the exact textures of vanilla Oak Planks on all sides, making them impossible to spot with the naked eye.",
        "High Flammability: Extremely vulnerable to fire (flammability of 30, spread speed of 60) and gets ignited by lava.",
        "Stick Drops: Breaking the block without Shears or a Silk Touch tool drops 1-2 Sticks instead of the block itself.",
        "Fall Breakage (Trap Trigger): Falling onto the block with a fall distance greater than 4 blocks instantly shatters/breaks it silently with no drops, functioning as an automated trap door/pitfall trigger.",
        "Active Camouflage Platform: The Lignum Vermis entity dynamically reads this block's 'oak' properties, matching its skin camouflage to standard Oak Planks while crawling on it."
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
      tool: "Shears / Hoe",
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
      tool: "Shovel",
      description: "A heavy, compacted silt deposit that has mineralized over ages in the Petrified Weald. Harder than regular soil, requiring a shovel to dig efficiently.",
      mechanics: [
        "Mineral Density: Steps produce a deep, solid stony tuff sound.",
        "Excavation: Drops itself as a building block when cleared with a shovel tool."
      ]
    },
    {
      name: "Splintered Oak Wood",
      dimension: "backwoods_rotting",
      hardness: "2.5",
      blastRes: "3.5",
      tool: "Axe",
      isUpdated: true,
      description: "Hazardous spiked wood block used actively by Log Splinter entities. Slows movement speed and inflicts prick damage on creatures traversing over it.",
      mechanics: [
        "Dynamic Entity Construction: Used directly by Log Splinter entities to construct vertical pillars and bridge terrain gaps while pursuing targets.",
        "Spiked Slowdown & Damage: Walking on the block slows movement velocity (speed factor 0.6) and deals 1.0 prick damage.",
        "Disarming / Stripping: Right-clicking with an Axe or Shears strips/disarms the block back to Oak Planks, dropping Sharpened Splinter Shards (with a 25% chance of structural collapse)."
      ],
      lootTable: [
        { item: "Sharpened Splinter Shard", weight: 100, condition: "When disarmed with Axe/Shears" }
      ]
    },
    {
      name: "Petrified Splintered Oak Wood",
      dimension: "petrified_weald",
      hardness: "22.0",
      blastRes: "25.0",
      tool: "Axe",
      isUpdated: true,
      description: "Fossilized, calcified spiked wood variant with extreme structural density. Deployed in the Petrified Weald by Petrified Log Splinter entities.",
      mechanics: [
        "Subterranean Calcified Construction: Deployed by Petrified Log Splinter entities using fill and bridge procedures to traverse chasms.",
        "Extreme Hardness: Hardness 22.0 and Blast Resistance 25.0 make it virtually impervious to standard explosions.",
        "Spiked Slowdown & Impalement: Impairs movement velocity and inflicts prick damage to trespassers."
      ]
    },
    {
      name: "Petrified Oak Planks",
      dimension: "backwoods_rotting",
      hardness: "2.2",
      blastRes: "3.0",
      tool: "Pickaxe",
      isUpdated: true,
      description: "Heavy, fossilized oak wood planks that serve as the main filler block of the Backwoods. Over eons, these planks have absorbed mineral compounds from the living environment, rendering them rock-hard and completely fireproof.",
      mechanics: [
        "Pale Oak Aesthetics: Same texture as standard vanilla Oak Planks, but has been bleached into a very slightly pale, mineralized tone.",
        "Total Fire Immunity: Completely fireproof and impervious to fire spreads or lava ignition.",
        "Tool Requirements: Requires a Pickaxe (any tier) to mine and collect efficiently.",
        "Living Dimension Self-Defense: The dimension's living wood adapted and petrified to protect its core structure from extreme environmental stress and heat hazards.",
        "Vanilla Wood Tag Compatibility: Registered under vanilla plank tags, allowing them to craft standard vanilla items like Sticks, Crafting Tables, fences, and tools seamlessly."
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

  const toggleMechanics = (name: string) => {
    setExpandedMechanics(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleLoot = (name: string) => {
    setExpandedLoot(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const areAllExpanded = useMemo(() => {
    if (filteredBlocks.length === 0) return false;
    return filteredBlocks.every(b => {
      const mechOpen = !b.mechanics || b.mechanics.length === 0 || !!expandedMechanics[b.name];
      const lootOpen = !b.lootTable || b.lootTable.length === 0 || !!expandedLoot[b.name];
      return mechOpen && lootOpen;
    });
  }, [filteredBlocks, expandedMechanics, expandedLoot]);

  const toggleExpandAll = () => {
    const nextState = !areAllExpanded;
    const nextMech: Record<string, boolean> = { ...expandedMechanics };
    const nextLoot: Record<string, boolean> = { ...expandedLoot };
    filteredBlocks.forEach(b => {
      if (b.mechanics && b.mechanics.length > 0) nextMech[b.name] = nextState;
      if (b.lootTable && b.lootTable.length > 0) nextLoot[b.name] = nextState;
    });
    setExpandedMechanics(nextMech);
    setExpandedLoot(nextLoot);
  };

  return (
    <div className="space-y-4 select-text">
      {/* Intro and Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <p className="text-xs text-[#829285] max-w-xl leading-relaxed">
          Catalog of custom geological, arboreal, and dimensional blocks across Backwoods realms.
        </p>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#5a6b5e]" />
            <input
              type="text"
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0a0c0a] border border-[#1c241e] rounded-md text-xs text-[#c9d1c9] focus:outline-none focus:border-[#709978] transition-colors placeholder-[#5a6b5e]"
            />
          </div>

          <button
            onClick={() => setCompactMode(prev => !prev)}
            className={`px-2.5 py-1.5 text-xs font-mono rounded border flex items-center gap-1.5 transition-colors cursor-pointer select-none shrink-0 ${
              compactMode 
                ? 'bg-[#121913] border-[#2c3d2f] text-[#a9d1b0]' 
                : 'bg-[#0a0d0a] border-[#1a231b] text-[#829285] hover:text-[#c9d1c9]'
            }`}
            title={compactMode ? "Switch to Expanded View" : "Switch to Compact View"}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{compactMode ? 'Compact' : 'Expanded'}</span>
          </button>

          <button
            onClick={toggleExpandAll}
            className="px-2.5 py-1.5 text-xs font-mono rounded border bg-[#0a0d0a] border-[#1a231b] text-[#829285] hover:text-[#c9d1c9] flex items-center gap-1.5 transition-colors cursor-pointer select-none shrink-0"
            title={areAllExpanded ? "Collapse All Details" : "Expand All Details"}
          >
            {areAllExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{areAllExpanded ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#1a221c] pb-2.5">
        {[
          { id: 'all', label: 'All', count: blocks.length },
          { id: 'overworld', label: 'Overworld', count: blocks.filter(b => b.dimension === 'overworld').length },
          { id: 'backwoods_rotting', label: 'Backwoods & Rotting', count: blocks.filter(b => b.dimension === 'backwoods_rotting').length },
          { id: 'loss', label: 'The Loss', count: blocks.filter(b => b.dimension === 'loss').length },
          { id: 'petrified_weald', label: 'Petrified Weald', count: blocks.filter(b => b.dimension === 'petrified_weald').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedDim(tab.id)}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedDim === tab.id
                ? 'bg-[#1a241d] text-[#a9d1b0] border border-[#2e3e31]'
                : 'bg-transparent text-[#829285] hover:text-[#e0e7e0] border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className={`grid gap-3.5 ${
        compactMode 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {filteredBlocks.map((block) => {
          const isMechOpen = !compactMode || !!expandedMechanics[block.name];
          const isLootOpen = !compactMode || !!expandedLoot[block.name];
          const recipeIds = getBlockRecipeIds(block.name);
          const isRecipeOpen = !!expandedRecipes[block.name];

          const cardContent = (
            <div 
              key={block.name}
              className="p-3.5 sm:p-4 bg-[#0a0d0a] border border-[#172018] rounded-xl flex flex-col justify-between hover:border-[#2a382d] transition-all duration-200 h-full space-y-3"
            >
              <div className="space-y-2.5">
                {/* Card Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#e0e7e0] leading-snug truncate" title={block.name}>
                      {block.name}
                    </h3>
                    <span className="text-[9px] font-mono uppercase text-[#709978] bg-[#111712] px-1.5 py-0.5 rounded border border-[#1b251c] mt-1 inline-block">
                      {block.dimension.replace('_', ' & ')}
                    </span>
                  </div>
                  
                  {/* Latin title translation if exists */}
                  {block.latin && (
                    <div className="text-[10px] font-mono text-right text-[#5a6b5e] shrink-0">
                      {block.latin.map((l, idx) => (
                        <div key={idx}>
                          <span className="text-rose-400 font-semibold">"{l.term}"</span>: {l.translation}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats badges */}
                {(block.hardness || block.blastRes || block.burnTime || block.tool) && (
                  <div className="flex flex-wrap gap-1.5 py-1 border-y border-[#161f18]/60 text-[10px] font-mono">
                    {block.hardness && (
                      <span className="inline-flex items-center gap-1 bg-[#101411] border border-[#18221a] px-1.5 py-0.5 rounded text-[#829285]">
                        <Hammer className="w-3 h-3 text-[#5a6b5e]" />
                        <span>Hardness:</span>
                        <strong className="text-[#a9d1b0]">{block.hardness}</strong>
                      </span>
                    )}
                    {block.blastRes && (
                      <span className="inline-flex items-center gap-1 bg-[#101411] border border-[#18221a] px-1.5 py-0.5 rounded text-[#829285]">
                        <Shield className="w-3 h-3 text-[#5a6b5e]" />
                        <span>Blast:</span>
                        <strong className="text-[#a9d1b0]">{block.blastRes}</strong>
                      </span>
                    )}
                    {block.burnTime && (
                      <span className="inline-flex items-center gap-1 bg-[#101411] border border-[#18221a] px-1.5 py-0.5 rounded text-[#829285]">
                        <Flame className="w-3 h-3 text-amber-500/80" />
                        <span>Burn:</span>
                        <strong className="text-amber-400">{block.burnTime}</strong>
                      </span>
                    )}
                    {block.tool && (
                      <span className="inline-flex items-center gap-1 bg-[#101411] border border-[#18221a] px-1.5 py-0.5 rounded text-[#829285]">
                        <Hammer className="w-3 h-3 text-[#709978]" />
                        <span>Tool:</span>
                        <strong className="text-[#a9d1b0]">{block.tool}</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-[#829285] leading-relaxed">
                  {block.description}
                </p>

                {/* Warnings and Hazards */}
                {block.isWarning && (
                  <div className="p-2 bg-[#191010] border-l-2 border-rose-500 rounded text-[10px] text-rose-300 leading-snug flex items-start gap-1.5 select-none">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{block.warningText}</span>
                  </div>
                )}

                {/* Material safety */}
                {block.isSpecial && (
                  <div className="p-2 bg-[#101511] border-l-2 border-emerald-500 rounded text-[10px] text-emerald-300 leading-snug flex items-start gap-1.5 select-none">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{block.specialText}</span>
                  </div>
                )}

                {/* Behavioral Mechanics collapsible */}
                {block.mechanics && block.mechanics.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => toggleMechanics(block.name)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#070907] hover:bg-[#0f140f] border border-[#162018] hover:border-[#243326] rounded text-[10px] font-mono text-[#709978] hover:text-[#a9d1b0] transition-colors cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#709978]/60" />
                        <span>Behavioral Mechanics ({block.mechanics.length})</span>
                      </span>
                      <span className="text-[9px] text-[#5a6b5e] flex items-center gap-0.5">
                        {isMechOpen ? <><ChevronUp className="w-3 h-3" /> Hide</> : <><ChevronDown className="w-3 h-3" /> View</>}
                      </span>
                    </button>

                    {isMechOpen && (
                      <div className="space-y-1.5 text-[11px] text-[#829285] leading-relaxed bg-[#060806] p-2.5 rounded border border-[#141c15]">
                        {block.mechanics.map((mech, mIdx) => (
                          <div key={mIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#527058] shrink-0 mt-1.5" />
                            <div className="flex-1">
                              {mech.includes(':') ? (
                                <>
                                  <strong className="text-[#c9d1c9] font-semibold">{mech.split(':')[0]}:</strong>
                                  <span>{mech.split(':')[1]}</span>
                                </>
                              ) : (
                                <span>{mech}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Loot Table collapsible */}
                {block.lootTable && (
                  <div className="space-y-1.5 pt-0.5">
                    <button
                      onClick={() => toggleLoot(block.name)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#070907] hover:bg-[#0f140f] border border-[#162018] hover:border-[#243326] rounded text-[10px] font-mono text-[#709978] hover:text-[#a9d1b0] transition-colors cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <Coins className="w-3 h-3 text-[#5a6b5e]" />
                        <span>Loot Drops ({block.lootTable.length})</span>
                      </span>
                      <span className="text-[9px] text-[#5a6b5e] flex items-center gap-0.5">
                        {isLootOpen ? <><ChevronUp className="w-3 h-3" /> Hide</> : <><ChevronDown className="w-3 h-3" /> View</>}
                      </span>
                    </button>

                    {isLootOpen && (
                      <div className="overflow-hidden rounded border border-[#162018] text-[9px] font-mono">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0e120f] text-[#5a6b5e] border-b border-[#162018]">
                              <th className="p-1.5">Drop</th>
                              <th className="p-1.5 text-center">Weight</th>
                              <th className="p-1.5 text-right">Condition</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#141b15]">
                            {block.lootTable.map((loot, lIdx) => (
                              <tr key={lIdx}>
                                <td className="p-1.5 font-medium text-[#c9d1c9]">{loot.item}</td>
                                <td className="p-1.5 text-center text-[#829285]">{loot.weight}</td>
                                <td className="p-1.5 text-right text-[#5a6b5e] font-sans italic">{loot.condition}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Collapsible Crafting Recipes */}
                {recipeIds.length > 0 && (
                  <div className="pt-0.5">
                    <button
                      onClick={() => setExpandedRecipes(prev => ({ ...prev, [block.name]: !isRecipeOpen }))}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#070907] hover:bg-[#0f140f] border border-[#162018] hover:border-[#243326] rounded text-[10px] font-mono text-[#709978] hover:text-[#a9d1b0] transition-colors cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <Hammer className="w-3 h-3 text-[#5a6b5e]" />
                        <span>Crafting Recipes ({recipeIds.length})</span>
                      </span>
                      <span className="text-[9px] text-[#5a6b5e] flex items-center gap-0.5">
                        {isRecipeOpen ? <><ChevronUp className="w-3 h-3" /> Hide</> : <><ChevronDown className="w-3 h-3" /> View</>}
                      </span>
                    </button>

                    {isRecipeOpen && (
                      <div className="mt-2.5">
                        <FancyRecipeView itemIds={recipeIds} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );

          if (block.isUpdated) {
            return (
              <UpdatedFrame key={block.name} id={`block_${block.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`} isUpdated={true}>
                {cardContent}
              </UpdatedFrame>
            );
          }

          return cardContent;
        })}
      </div>
    </div>
  );
}
