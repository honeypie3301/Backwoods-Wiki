import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Shield, Zap, Flame, Compass, HelpCircle, 
  Dna, Swords, Hammer, Award, Star, ListFilter, AlertCircle, Sparkles 
} from 'lucide-react';
import FancyRecipeView from './FancyRecipeView';

interface ItemData {
  id: string;
  name: string;
  category: 'keys' | 'materials' | 'memory' | 'weapons' | 'tools' | 'utility';
  desc: string;
  burnTime?: string;
  stats?: { label: string; value: string }[];
  recipes?: string[];
  notes?: string[];
  subItems?: { name: string; damage: string; speed: string; durability: string; notes?: string }[];
}

export default function ItemsView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('steel_charcoal');

  const categories = [
    { id: 'all', name: 'All Gear & Items', icon: Package },
    { id: 'keys', name: 'Keys & Consumables', icon: Compass },
    { id: 'materials', name: 'Materials', icon: Dna },
    { id: 'memory', name: 'Memory Shards', icon: Star },
    { id: 'weapons', name: 'Weapons', icon: Swords },
    { id: 'tools', name: 'Tools', icon: Hammer },
    { id: 'utility', name: 'Utility & Cores', icon: Zap }
  ];

  const items: ItemData[] = [
    {
      id: "steel_charcoal",
      name: "Steel and Charcoal",
      category: "keys",
      desc: "The primary key used to enter and exit the Backwoods dimension. Striking it in the Overworld triggers dimensional transport.",
      stats: [
        { label: "Overworld Success Rate", value: "90%" },
        { label: "Other Success Rate", value: "10%" },
        { label: "Durability Penalty", value: "Consumes durability on failed strike" }
      ],
      notes: [
        "Striking it plays a deep metallic sound and releases heavy gray cloud particles.",
        "If it fails to connect, the steel's durability is depleted and the charcoal is consumed without opening a gateway."
      ]
    },
    {
      id: "steel_shard",
      name: "Steel and Shard",
      category: "keys",
      desc: "An ancient transport key tuned to the resonant frequency of the Petrified Weald. Functions similarly to Steel and Charcoal but shifts the destination coordinate calculation.",
      stats: [
        { label: "Weald Success Rate", value: "90%" },
        { label: "Overworld Success Rate", value: "Extremely Low" }
      ],
      notes: [
        "Crafted with robust steel and a fossilized splinter shard.",
        "Required to securely egress from the Petrified Weald back to standard coordinates."
      ]
    },
    {
      id: "pale_draught",
      name: "Pale Draught",
      category: "keys",
      desc: "A rare chemical mixture compiled to sever sensory links. Drinking it transports the player directly to the simulated realm known as The Familiar.",
      recipes: [
        "1 Glass Bottle + 1 Seep"
      ],
      notes: [
        "Use with extreme caution: The Familiar is a highly volatile trap biome with no direct physical exits.",
        "Always prepare escape plans or secondary gear before consuming this potion."
      ]
    },
    {
      id: "pale_remedy",
      name: "Pale Remedy",
      category: "keys",
      desc: "A highly specialized anti-degradation tonic that stabilizes cognitive brain function inside the Backwoods.",
      recipes: [
        "1 Ash-Rose + 1 Bowl + 1 Seep"
      ],
      stats: [
        { label: "Exposure Reduction", value: "-3,000 backwoods_time (ticks)" },
        { label: "Side Effects", value: "Nausea I (6 seconds)" },
        { label: "Stack Limit", value: "Does not stack (1 per slot)" }
      ],
      notes: [
        "Drinking it returns an empty wooden bowl to your inventory.",
        "Because it does not stack, each dosage must be carried and consumed with clear strategic intention during heavy expeditions."
      ]
    },
    {
      id: "faded_foods",
      name: "Faded Foods",
      category: "keys",
      desc: "Decaying, dimensionally eroded variants of standard Overworld foodstuffs found across the Loss dimension. Over time, standard foods undergo deep temporal decay here, stripping away their nutritive value and infusing them with volatile neurological anomalies.",
      stats: [
        { label: "Primary Source", value: "Overworld food decay inside the Loss dimension" },
        { label: "Nutrition Level", value: "Severely degraded (e.g., Faded Steak restores only 2 hunger)" },
        { label: "Anomalous Effects", value: "Blindness, Nausea, Slowness, or Weakness when consumed" },
        { label: "Cleanse Agent", value: "Memory Fragment / Recovered Memory Fragment" }
      ],
      notes: [
        "Faded foods are shadows of their original forms. For example: Faded Carrots restore only 1 hunger and 0.1 saturation; Faded Cooked Porkchops restore 8 hunger and 0.8 saturation.",
        "Consuming faded items introduces severe side effects: Faded Carrot inflicts Blindness I (3s), Faded Steak has a 50% chance to inflict Nausea I (3s), Faded Golden Carrot inflicts Night Vision paired with Slowness I (15s), and Faded Golden Apple inflicts Resistance I (10s) but also Weakness I (30s).",
        "The most volatile is the Faded Enchanted Golden Apple: it briefly grants Absorption I (4s) and Regeneration I (3s), but then triggers a massive, crippling 60-second Weakness and 45-second Hunger debuff.",
        "Purification: To restore faded foods to their clean Overworld counterparts, place a standard Memory Fragment (or Recovered Memory Fragment) in your main hand, the faded food in your offhand, and right-click to cleanse it."
      ]
    },
    {
      id: "petrified_bark",
      name: "Petrified Bark",
      category: "materials",
      desc: "Fossilized tree bark stripped from mineralized logs. Highly valued for its dense, stone-like resilience.",
      stats: [
        { label: "Acquisition Method", value: "Strip Petrified Logs in Weald" },
        { label: "Drop Chance", value: "1 in 23 stripped logs (~4.35%)" },
        { label: "Tool Penalty", value: "Inflicts heavy durability damage to axes" }
      ],
      notes: [
        "Crucial material for crafting Petrified Rotten Swords and robust Petrified Rotten Axes."
      ]
    },
    {
      id: "memory_shard",
      name: "Memory Shard",
      category: "memory",
      desc: "A powerful, multi-modal temporal anchor crystal harvested from the ancient depths of the Loss dimension. Employs advanced chrono-stasis and passive decay-halting fields.",
      stats: [
        { label: "Acquisition Method", value: "Mine Memory Quartz in Loss" },
        { label: "Primary Mode (0)", value: "Instant Rewind (consumes 1 shard)" },
        { label: "Secondary Mode (1)", value: "Chrono-Stasis Anchor (15-sec max window)" },
        { label: "Passive Protection", value: "Stops Faded tool passive inventory decay" }
      ],
      notes: [
        "Mode 0 (Rewind Mode): Normal right-click instantly rolls back the player's spatial position, health, food level, and kinetic states to a pre-recorded timestamp.",
        "Mode 1 (Chrono-Stasis Anchor): "Shaking" toggles modes (swinging arm 2-5 times). Right-click to drop an anchor at your current position, saving your exact states. Activating it again within 15 seconds (300 ticks) snaps you back instantly, healing and restoring food. Dropping an anchor consumes 1 shard.",
        "Passive Time-Lock: Simply carrying a Memory Shard anywhere in your active inventory halts the passive decay of Faded tools (which normally face a 1-in-3 chance to lose 1 durability point every 100 ticks).",
        "Crafting utility: Required in quantities to craft highly resonant dimensional artifacts like the Resonant Rot Effigy."
      ]
    },
    {
      id: "seep",
      name: "Seep",
      category: "materials",
      desc: "A thick, pale, anomalous sap that slowly seeps out of wood that should not be alive. It glows with a faint, ghostly luminescence.",
      stats: [
        { label: "Acquisition Method", value: "Break Oak Planks inside Backwoods" },
        { label: "Drop Chance", value: "Low (requires breaking numerous blocks)" }
      ],
      notes: [
        "The core binder used in all protective and sanity-restoring consumables."
      ]
    },
    {
      id: "rotten_stick",
      name: "Rotten Stick",
      category: "materials",
      desc: "A brittle, decaying stick crafted from corrupted wood planks.",
      recipes: [
        "2 Rotten Oak Planks"
      ],
      burnTime: "75 ticks (smelting fuel)",
      notes: [
        "Acts as the core handle material for all base Rotten tools and weapons."
      ]
    },
    {
      id: "petrified_rotten_stick",
      name: "Petrified Rotten Stick",
      category: "materials",
      desc: "A heavy, mineralized stick fossilized over centuries in the Petrified Weald.",
      burnTime: "300 ticks (excellent smelting fuel)",
      notes: [
        "Primary handle material required to withstand the physical weight of Petrified tools."
      ]
    },
    {
      id: "splinter_shard",
      name: "Splinter Shard",
      category: "materials",
      desc: "A jagged, carbon-black shard of corrupted wood tissue torn from defeated Splinters.",
      stats: [
        { label: "Drop Chance", value: "~5% chance from Log Splinters" }
      ],
      notes: [
        "Used directly to build standard Rotten Swords and basic woodbound gear."
      ]
    },
    {
      id: "sharpened_splinter_shard",
      name: "Sharpened Splinter Shard",
      category: "materials",
      desc: "A brittle, razor-sharp material processed through stonecutters. Can be used as a desperate weapon of last resort.",
      stats: [
        { label: "Attack Damage", value: "0.8" },
        { label: "Durability", value: "25" },
        { label: "Inventory Hazard", value: "0.08 damage / 160 ticks" }
      ],
      notes: [
        "Extremely fragile. Breaks after a few combat encounters but can help clear minor foliage or early threats.",
        "Pricking Threat: Carrying this item in your inventory pricks you for 0.08 physical damage every 160 ticks. You can completely neutralize this hazard by maintaining the Inoculation effect."
      ]
    },
    {
      id: "heartwood_shard",
      name: "Heartwood Shard",
      category: "materials",
      desc: "A dark crimson chunk of dense heartwood harvested from deep within rotting logs.",
      stats: [
        { label: "Acquisition Method", value: "Break Rotten Oak Logs in Rotting" },
        { label: "Drop Chance", value: "~3% chance per block" }
      ],
      notes: [
        "Used at a smithing table to upgrade Rotten Swords into their devastating Heartwood variants."
      ]
    },
    {
      id: "petrified_resin",
      name: "Petrified Resin",
      category: "materials",
      desc: "A hard, fossilized resin used to repair and maintain Recovered Faded tools.",
      stats: [
        { label: "Acquisition Method", value: "Harvest Sedgebrush with Recovered Hoe" },
        { label: "Repair Value", value: "+25 Durability points" }
      ],
      notes: [
        "Right-click to apply directly to eligible tools in hand.",
        "Consumed completely upon application (does not apply in Creative Mode)."
      ]
    },
    {
      id: "compact_petrified_resin",
      name: "Compact Petrified Resin",
      category: "materials",
      desc: "A dense block of processed Petrified Resin providing superior tool maintenance.",
      stats: [
        { label: "Repair Value", value: "+50 Durability points" }
      ]
    },
    {
      id: "memory_fragment",
      name: "Memory Fragment",
      category: "memory",
      desc: "A faint, flickering shard of raw memory extracted from anomalous structures.",
      stats: [
        { label: "Acquisition Method", value: "Mine Plaque Hearts in Loss" }
      ],
      notes: [
        "Can be used to purify and convert Faded/corrupted food items back into edible, safe standard variants. Single use."
      ]
    },
    {
      id: "distorted_memory_fragment",
      name: "Distorted Memory Fragment",
      category: "memory",
      desc: "An unstable, swirling vortex of corrupted memory. Crucial for advanced biological upgrading."
    },
    {
      id: "recovered_memory_fragment",
      name: "Recovered Memory Fragment",
      category: "memory",
      desc: "A highly stabilized crystal of pure memory used to upgrade Faded tools into their self-repairing Recovered variants.",
      recipes: [
        "2 Distorted Memory Fragments + 1 Pale Remedy + 1 Heartwood Shard",
        "1 Memory Fragment + Glistering Melon Slice + Seep",
        "1 Memory Fragment + Golden Apple + Seep"
      ],
      stats: [
        { label: "Food Purification Uses", value: "3 conversions per crystal" }
      ],
      notes: [
        "To purify food: Place crystal in main hand, faded food in offhand, and right-click. Restores food value while consuming 1 durability point of the fragment."
      ]
    },
    {
      id: "rotten_sword",
      name: "Rotten Sword",
      category: "weapons",
      desc: "A primary weapon fashioned from corrupted splinters and decomposing handles.",
      recipes: [
        "2 Splinter Shards + 1 Rotten Stick"
      ],
      stats: [
        { label: "Attack Damage", value: "5.5" },
        { label: "Durability", value: "175" },
        { label: "Special Effect", value: "50% chance: Wither I (6 seconds) on hit" }
      ],
      notes: [
        "Roughly equivalent to an iron sword but inflicts persistent decay on standard monsters."
      ]
    },
    {
      id: "heartwood_rotten_sword",
      name: "Heartwood Rotten Sword",
      category: "weapons",
      desc: "An upgraded sword that inflicts chaotic biological anomalies upon targets.",
      recipes: [
        "1 Rotten Sword + 1 Heartwood Shard (Smithing Table)"
      ],
      stats: [
        { label: "Attack Damage", value: "8" },
        { label: "Durability", value: "400" }
      ],
      notes: [
        "On hit, rolls a random status modifier from the following pool:",
        "• 25% Chance: Wither I (7.5 seconds)",
        "• 25% Chance: Blindness I (8.5 seconds)",
        "• 25% Chance: Slowness II (12.5 seconds)",
        "• 25% Chance: No secondary effect"
      ]
    },
    {
      id: "petrified_rotten_sword",
      name: "Petrified Rotten Sword",
      category: "weapons",
      desc: "A heavy, calcified claymore possessing massive weight and durability. Its impact shifts depending on target classification.",
      recipes: [
        "2 Petrified Bark + 1 Petrified Planks + 1 Petrified Rotten Stick"
      ],
      stats: [
        { label: "Attack Damage", value: "9" },
        { label: "Durability", value: "2,000" }
      ],
      notes: [
        "On hit, has a 60% chance to inflict devastating tier-3 debuffs:",
        "• vs Mobs: Weakness III (30s), Wither III (13.5s), or Slowness II (9s)",
        "• vs Players: Weakness II (15s), Wither II (12.5s), or Blindness I (4.5s)"
      ]
    },
    {
      id: "faded_sword",
      name: "Faded Sword",
      category: "weapons",
      desc: "A decaying relic of a standard weapon lost to temporal erosion inside The Loss. Extremely fast but highly fragile.",
      stats: [
        { label: "Attack Damage", value: "7" },
        { label: "Attack Speed", value: "2.4" },
        { label: "Durability", value: "48" }
      ],
      notes: [
        "Transformed automatically in inventory when exposed to Faded materials."
      ]
    },
    {
      id: "recovered_faded_sword",
      name: "Recovered Faded Sword",
      category: "weapons",
      desc: "A stabilized version of the Faded Sword that preserves its high-velocity combat speed with slightly improved structural integrity.",
      stats: [
        { label: "Attack Damage", value: "7" },
        { label: "Attack Speed", value: "2.4" },
        { label: "Durability", value: "80" }
      ]
    },
    {
      id: "rotten_tools",
      name: "Rotten Tools Set",
      category: "tools",
      desc: "A complete set of basic iron-tier tools fashioned from decomposing planks and sticks.",
      subItems: [
        { name: "Rotten Axe", damage: "8.0", speed: "1.0", durability: "175", notes: "Slower chopping" },
        { name: "Rotten Pickaxe", damage: "4.0", speed: "1.2", durability: "175", notes: "Iron mining tier" },
        { name: "Rotten Shovel", damage: "3.5", speed: "1.0", durability: "175" },
        { name: "Rotten Hoe", damage: "1.0", speed: "3.0", durability: "175" }
      ]
    },
    {
      id: "petrified_rotten_axe",
      name: "Petrified Rotten Axe",
      category: "tools",
      desc: "A colossal, heavy logging axe specifically balanced to chop calcified fossil logs.",
      stats: [
        { label: "Attack Damage", value: "9.5" },
        { label: "Durability", value: "2,077" }
      ]
    },
    {
      id: "faded_tools",
      name: "Faded Tools Set",
      category: "tools",
      desc: "Decaying, eroded variants of standard tools caused by dimension exposure. Extremely high efficiency but near-zero durability.",
      subItems: [
        { name: "Faded Axe", damage: "9.0", speed: "1.0", durability: "25", notes: "Sluggish and highly brittle" },
        { name: "Faded Pickaxe", damage: "3.0", speed: "1.2", durability: "25", notes: "Efficiency IV, Iron Mining Tier" },
        { name: "Faded Shovel", damage: "3.0", speed: "1.0", durability: "25" },
        { name: "Faded Hoe", damage: "1.0", speed: "4.0", durability: "50", notes: "Highest durability of the set" }
      ]
    },
    {
      id: "recovered_faded_tools",
      name: "Recovered Faded Tools Set",
      category: "tools",
      desc: "Stabilized, highly specialized versions of the Faded tools that offer passive repair mechanics and specific harvesting boosts.",
      subItems: [
        { name: "Recovered Faded Axe", damage: "9.0", speed: "1.0", durability: "60" },
        { name: "Recovered Faded Pickaxe", damage: "3.0", speed: "1.2", durability: "50", notes: "Grants short Haste boost while mining Nullstone blocks" },
        { name: "Recovered Faded Shovel", damage: "3.0", speed: "1.0", durability: "45" },
        { name: "Recovered Faded Hoe", damage: "1.0", speed: "4.0", durability: "50", notes: "Instantly shears Sedgebrush with a 6% chance to drop Petrified Resin" }
      ]
    },
    {
      id: "effigy",
      name: "Effigy",
      category: "utility",
      desc: "A small handmade doll woven from rotten wood and dense creeping roots. Resonates with dimensional energy.",
      notes: [
        "Right-click: Emits a detection pulse highlighting nearby Woodbound/Rot entities.",
        "Shift + Right-click: Initiates emergency transport from the Rotting dimension directly into The Still sub-realm."
      ]
    },
    {
      id: "resonant_rot_effigy",
      name: "Resonant Rot Effigy",
      category: "utility",
      desc: "An upgraded, stabilized scouting doll designed to safeguard dimensional traversal.",
      recipes: [
        "1 Effigy + 4 Memory Shards + 4 Seep"
      ],
      notes: [
        "Right-click (standard): Emits a massive scan pulse with elevated range and duration.",
        "Shift + Right-click: Cycles between Attuned and Fractured transport modes.",
        "• Mode: ATTUNED — Teleports player from Rotting → The Still.",
        "• Mode: FRACTURED — Safely teleports player from any non-Overworld dimension back to the Overworld.",
        "Provides 10 seconds of Slow Falling after teleportation to avoid high-altitude landing damage."
      ]
    },
    {
      id: "fractus_core_nugget",
      name: "Fractus Core Nugget",
      category: "utility",
      desc: "A small fragment of plain, white anomalous geometry. Packing these fragments alters local gravity and coordinates.",
      stats: [
        { label: "Fuel Burn Time", value: "111,111 ticks (Smelts continuously for 1.5+ hours)" },
        { label: "Weight Penalty", value: "-0.4% Movement speed per nugget" },
        { label: "Gravity Penalty", value: "+0.0018 falling gravity points per nugget" }
      ],
      notes: [
        "Crafted by breaking 1 Fractus Core block into 9 nuggets.",
        "The physics penalties stack completely. Carrying multiple stacks can render normal movement impossible, binding you to the ground."
      ]
    },
    {
      id: "scandere_resin",
      name: "Scandere Resin",
      category: "materials",
      desc: "A raw, sticky organic sap harvested from wood logs. Extremely poisonous if consumed directly, but has major chemical crystallization properties.",
      stats: [
        { label: "Nutritional Value", value: "3" },
        { label: "Saturation modifier", value: "0.2" },
        { label: "Toxicity Effect", value: "Poison I (2.45 seconds / 49 ticks)" }
      ],
      notes: [
        "Can be cooked in a furnace to obtain Crystallized Scandere Resin.",
        "Used as a core sticky binder in several advanced crafting recipes, such as composting."
      ]
    },
    {
      id: "crystallized_scandere_resin",
      name: "Crystallized Scandere Resin",
      category: "materials",
      desc: "A hardened, mineralized version of Scandere Resin obtained by baking raw sap. It is extremely sturdy and serves as a high-tier structural binder.",
      stats: [
        { label: "Rarity", value: "Common" },
        { label: "Smelting Yield", value: "5.0 XP reward per baked item" }
      ],
      notes: [
        "Smelted from raw Scandere Resin in any standard furnace (cooking time: 250 ticks).",
        "Required to craft Lignum Compost."
      ]
    },
    {
      id: "lignum_compost",
      name: "Lignum Compost",
      category: "utility",
      desc: "An advanced, high-potency fertilizer enriched with raw tree sap. Functions as an incredibly powerful agricultural booster.",
      stats: [
        { label: "Stack Size", value: "64" },
        { label: "Fertilization Range", value: "11x3x11 Area" }
      ],
      notes: [
        "If applied directly to Moss, Saplings, or Crops, it acts as standard bone meal applied 10 times consecutively.",
        "If applied elsewhere, it applies bone meal to a massive 11x3x11 area around the block with a 10% chance per block, rapidly growing tall grass and plants.",
        "Crafted with 1 Crystallized Scandere Resin surrounded by either 4 Bone Meal or 4 Rotten Flesh (yields 8 compost)."
      ]
    },
    {
      id: "pale_draught_bottle",
      name: "Pale Draught Bottle",
      category: "keys",
      desc: "An uncommon sensory-severing draft stored in a heavy glass container. Used for advanced inter-dimensional transport between minor sub-realms.",
      stats: [
        { label: "Rarity", value: "Uncommon" },
        { label: "Stack Size", value: "1" },
        { label: "Side Effect", value: "Darkness VII (4.5s / 90 ticks)" }
      ],
      notes: [
        "Consuming this item in 'The Still' inflicts Darkness VII and teleports you to 'The Familiar' at your current horizontal coordinates on the surface.",
        "Consuming this item in 'The Grain' inflicts Darkness VII and teleports you to 'The Still' at Y=129.",
        "If consumed inside any other dimension, it displays 'It won't work' and has no effect."
      ]
    },
    {
      id: "stabilized_pale_remedy",
      name: "Stabilized Pale Remedy",
      category: "keys",
      desc: "A highly stabilized, advanced anti-degradation remedy crafted with Recovered Memory fragments. Maximizes cognitive recovery.",
      stats: [
        { label: "Degradation Reduction", value: "-5,000 Exposure (backwoods_time NBT)" },
        { label: "Nutritional Value", value: "4" },
        { label: "Saturation modifier", value: "4.0" }
      ],
      notes: [
        "Significantly reduces mental strain and exposure to dimension-decay conditions.",
        "Always edible. Drinking returns an empty glass Bowl to the player's inventory.",
        "Crafted shapelessly from 1 Seep, 1 Ash-Rose, 1 Bowl, and 1 Recovered Memory Fragment."
      ]
    },
    {
      id: "null_pointer_axe",
      name: "Null Pointer Axe",
      category: "tools",
      desc: "A rare, fireproof debugging and testing battleaxe with astronomical attack damage and supernatural attribute modifiers. For testing purposes only.",
      stats: [
        { label: "Attack Damage", value: "2,013" },
        { label: "Attack Speed", value: "6.7" },
        { label: "Durability / Uses", value: "2,079" },
        { label: "Health Bonus", value: "+500 Max Health" },
        { label: "Oxygen Bonus", value: "+10 Oxygen" },
        { label: "Step Height", value: "+1.0 Block Height" },
        { label: "Sneaking Speed", value: "+50% Movement Speed" }
      ],
      notes: [
        "Completely immune to fire and lava destruction.",
        "Creative-only testing tool. Has no crafting recipe.",
        "Can be repaired using Faded Blocks, Petrified Bark, Sharpened Splinter Shards, or Plaque Hearts."
      ]
    },
    {
      id: "faded_materials",
      name: "Faded Materials (Copper, Iron, Gold, Netherite)",
      category: "materials",
      desc: "Drained, completely decayed remnants of copper, iron, gold, and netherite metals eroded by temporal decay in the Loss dimension.",
      stats: [
        { label: "Degradation Rate", value: "100%" }
      ],
      notes: [
        "Created passively when corresponding metal items warp inside your inventory while staying in the Loss dimension.",
        "Serves as degraded scrap material in your inventory until removed."
      ]
    },
    {
      id: "lignum_caro",
      name: "Lignum Caro",
      category: "materials",
      desc: "A highly dense organic meat block harvested from Lignum trees. It beats like flesh but grows like wood, harboring strange immunological resistance.",
      stats: [
        { label: "Smelting Temp", value: "High Yield" },
        { label: "Stack Size", value: "64" }
      ],
      notes: [
        "Can be cooked in a furnace or smoker to produce Lignum Caro Ash.",
        "Used as a basic structural component and is a required ingredient for crafting the Lignum Caro Sword."
      ]
    },
    {
      id: "lignum_caro_ash",
      name: "Lignum Caro Ash",
      category: "materials",
      desc: "A fine, high-purity crystalline ash obtained by roasting raw Lignum Caro blocks. Concentrates the immunological defense properties of the wood flesh.",
      stats: [
        { label: "Rarity", value: "Common" },
        { label: "Stack Size", value: "64" }
      ],
      notes: [
        "Obtained by smelting Lignum Caro blocks in any furnace or blast furnace.",
        "Used in brewing stands to brew the specialized Potion of Inoculation."
      ]
    },
    {
      id: "potion_of_inoculation",
      name: "Potion of Inoculation",
      category: "utility",
      desc: "A potion to accelerate the decay of the Spore mod and the Arphex mod effects.",
      stats: [
        { label: "Effect", value: "Inoculation I (3:00)" },
        { label: "Stack Size", value: "1" }
      ],
      notes: [
        "Brewed by combining Lignum Caro Ash with a Water Bottle in a brewing stand.",
        "Every second, the effect checks the host entity for negative status effects originating from external mods such as Fungal Infection: Spore and ArPhEx. When an eligible debuff, such as corrosion, frostbite, or splintered sanity, is active on the entity, the procedure subtracts an additional 20 ticks from its remaining duration. Working in tandem with Minecraft's standard natural tick decay, this mechanism causes targeted afflictions to wear off twice as fast as normal."
      ]
    },
    {
      id: "lignum_caro_sword",
      name: "Lignum Caro Sword",
      category: "weapons",
      desc: "An organic, living blade crafted directly from the pristine tissue of uncorrupted Lignum Caro wood. It is unique among weapons for its parasitic, self-repairing nature.",
      stats: [
        { label: "Attack Damage", value: "5" },
        { label: "Attack Speed", value: "1" },
        { label: "Durability", value: "225" }
      ],
      notes: [
        "Crafted with 2 Lignum Caro blocks and a stick.",
        "Sustained Self-Repair (Organic Feeding): When damaged and kept in the inventory, the sword organically regenerates. Every 3 seconds, it will repair itself by 1 durability point in exchange for consuming a small amount of the player's hunger (requires hunger bar above zero).",
        "Can also be repaired at an anvil using uncorrupted Lignum Caro blocks."
      ]
    }
  ];

  // Sync with Table of Contents clicks
  useEffect(() => {
    const handleHeadingClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      const targetId = customEvent.detail.id;
      
      const matched = items.find(item => {
        const normalizedTarget = targetId.toLowerCase().replace(/-/g, '_');
        const normalizedId = item.id.toLowerCase();
        
        if (normalizedTarget === normalizedId) return true;
        if (normalizedTarget.includes(normalizedId)) return true;
        return false;
      });

      if (matched) {
        setSelectedItemId(matched.id);
      }
    };
    window.addEventListener('wiki-scroll-to-heading', handleHeadingClick);
    return () => window.removeEventListener('wiki-scroll-to-heading', handleHeadingClick);
  }, [items]);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedItem = items.find(i => i.id === selectedItemId) || filteredItems[0] || items[0];

  return (
    <div className="space-y-6 select-text">
      
      {/* Search & Categories Header */}
      <div className="p-4 bg-[#0f1210] border border-[#1c241e] rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#5a6b5e]" />
          <input 
            type="text" 
            placeholder="Search items or stats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#060806] border border-[#1b251d] text-[#c9d1c9] rounded-md focus:outline-none focus:border-[#709978] placeholder-[#445247]"
          />
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 scrollbar-thin">
          <span className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider mr-2 hidden lg:inline">Filters:</span>
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const firstInCat = items.find(i => cat.id === 'all' || i.category === cat.id);
                  if (firstInCat) setSelectedItemId(firstInCat.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer shrink-0 ${
                  isSelected 
                    ? 'bg-[#151f17] border-[#425a45] text-[#a9d1b0]' 
                    : 'bg-[#080a08] border-[#131b14] text-[#829285] hover:text-[#e0e7e0] hover:bg-[#0c100c]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Items Catalog */}
        <div className="lg:col-span-5 space-y-2">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#5a6b5e] mb-2 flex items-center justify-between">
            <span>Gear Manifest ({filteredItems.length})</span>
            {searchQuery && <span className="text-emerald-500 font-bold lowercase">Search active</span>}
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin">
            {filteredItems.map(item => {
              const isSelected = item.id === selectedItemId;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg border transition-all shrink-0 cursor-pointer flex flex-col ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#172219]/40 to-[#0e120f] border-[#445c47] text-[#e0e7e0] font-semibold'
                      : 'bg-[#060806] hover:bg-[#0c100c] text-[#829285] border-[#131a14]'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-serif text-xs text-[#e0e7e0]">{item.name}</span>
                    <span className="text-[9px] font-mono uppercase opacity-55 text-[#709978]">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5a6b5e] mt-1 line-clamp-1">{item.desc}</p>
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-xs text-[#5a6b5e] border border-dashed border-[#1a221c] rounded-lg">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#435246]" />
                No items match your search query or active filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Profiler */}
        {selectedItem && (
          <div className="lg:col-span-7 p-6 bg-[#080a08] border border-[#182019] rounded-xl space-y-5 relative overflow-hidden">
            {/* Ambient Background Grid Glow */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-950/5 blur-3xl rounded-full pointer-events-none" />

            {/* Profile Header */}
            <div className="pb-3 border-b border-[#161f17] flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#5a6b5e]">GEAR RECORD</span>
                <h3 className="font-serif text-xl font-bold text-[#e0e7e0] mt-0.5">{selectedItem.name}</h3>
                <span className="inline-block text-[9px] font-mono uppercase text-[#709978] bg-[#111712] border border-[#1e2720] px-1.5 py-0.5 rounded mt-1.5">
                  Category: {selectedItem.category}
                </span>
              </div>
              
              {selectedItem.burnTime && (
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase text-[#5a6b5e]">BURN TIME</span>
                  <div className="text-xs font-mono text-amber-500 font-bold flex items-center gap-1 mt-0.5">
                    <Flame className="w-3.5 h-3.5" />
                    {selectedItem.burnTime}
                  </div>
                </div>
              )}
            </div>

            {/* Core Description */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-mono text-[#5a6b5e] uppercase tracking-wider">Operational Description</h4>
              <p className="text-xs sm:text-sm text-[#c9d1c9] leading-relaxed">{selectedItem.desc}</p>
            </div>

            {/* Stats Attributes Table */}
            {selectedItem.stats && selectedItem.stats.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[9px] font-mono text-[#5a6b5e] uppercase tracking-wider">Functional Properties</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedItem.stats.map((stat, sIdx) => (
                    <div key={sIdx} className="p-2.5 bg-[#050605] border border-[#131a14] rounded-md font-mono text-[11px] flex justify-between items-center">
                      <span className="text-[#5a6b5e]">{stat.label}</span>
                      <span className="text-[#a9d1b0] font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-items (For Toolsets) */}
            {selectedItem.subItems && selectedItem.subItems.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[9px] font-mono text-[#5a6b5e] uppercase tracking-wider">Toolset breakdown</h4>
                <div className="overflow-x-auto rounded-lg border border-[#131a14] bg-[#050605] scrollbar-thin">
                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#0b0e0c] border-b border-[#131a14] text-[#5a6b5e]">
                        <th className="p-2.5">Tool</th>
                        <th className="p-2.5 text-center">Dmg</th>
                        <th className="p-2.5 text-center">Speed</th>
                        <th className="p-2.5 text-center">Dura</th>
                        <th className="p-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#131a14]/60 text-[#c9d1c9]">
                      {selectedItem.subItems.map((sub, sIdx) => (
                        <tr key={sIdx} className="hover:bg-[#0c100c]/40">
                          <td className="p-2.5 text-[#e0e7e0] font-bold">{sub.name}</td>
                          <td className="p-2.5 text-center text-red-400">{sub.damage}</td>
                          <td className="p-2.5 text-center text-amber-500">{sub.speed}</td>
                          <td className="p-2.5 text-center text-emerald-400">{sub.durability}</td>
                          <td className="p-2.5 text-[#829285] text-[10px] italic">{sub.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Visual Crafting Recipe Block */}
            <FancyRecipeView 
              itemIds={
                selectedItem.id === 'rotten_tools' 
                  ? ['rotten_axe', 'rotten_pickaxe', 'rotten_shovel', 'rotten_hoe']
                  : selectedItem.id === 'recovered_faded_tools'
                  ? ['recovered_faded_axe', 'recovered_faded_pickaxe', 'recovered_faded_shovel', 'recovered_faded_hoe']
                  : [selectedItem.id]
              }
              title="Crafting Recipe Blueprint"
            />

            {/* Tactical Notes */}
            {selectedItem.notes && selectedItem.notes.length > 0 && (
              <div className="p-3.5 bg-[#050605] border border-[#1a231b] rounded-lg space-y-2">
                <h4 className="text-[9px] font-mono text-[#5a6b5e] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#709978]" />
                  Survivalist Operational Log
                </h4>
                <ul className="text-xs text-[#829285] space-y-1.5 list-disc pl-4 leading-relaxed">
                  {selectedItem.notes.map((note, nIdx) => (
                    <li key={nIdx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
