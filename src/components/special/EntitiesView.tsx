import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Sparkles, ChevronDown, ChevronUp, Skull, AlertCircle, 
  Heart, Swords, Eye, Zap, BookOpen, Activity, Compass, 
  EyeOff, ShieldAlert, Award, Package, RefreshCw, ArrowUpDown, Droplets, Flame, MapPin, Layers,
  MessageSquare, Copy, Check, Terminal, Search, X
} from 'lucide-react';
import ModelViewer from './ModelViewer';
import UpdatedFrame from '../UpdatedFrame';

const ENTITY_MODELS: Record<string, { modelUrl: string; textureUrl: string }> = {
  rot: {
    modelUrl: '/models/Rot.obj',
    textureUrl: '/models/RotSkin.png'
  },
  splinter: {
    modelUrl: '/models/Splinter.obj',
    textureUrl: '/models/splinter-blindspot_skin.png'
  },
  log_splinter: {
    modelUrl: '/models/Splinter.obj',
    textureUrl: '/models/log_splinter_skin.png'
  },
  blindspot_splinter: {
    modelUrl: '/models/Splinter.obj',
    textureUrl: '/models/splinter-blindspot_skin.png'
  },
  petrified_splinter: {
    modelUrl: '/models/Splinter.obj',
    textureUrl: '/models/petrified_log_splinter_skin.png'
  },
  hollow: {
    modelUrl: '/models/Splinter.obj',
    textureUrl: '/models/spruce_biped.png'
  },
  stilt_walker: {
    modelUrl: '/models/StiltStalker.obj',
    textureUrl: '/models/stiltstalker_skin.png'
  },
  ash_weaver: {
    modelUrl: '/models/Splinter.obj',
    textureUrl: '/models/ash_weaver_skin.png'
  },
  lignum_gigas: {
    modelUrl: '/models/LignumGigas_2.obj',
    textureUrl: '/models/gigas_skin.png'
  },
  fractus: {
    modelUrl: '/models/Fractus.obj',
    textureUrl: '/models/fractus_skin.png'
  },
  fractus_prime: {
    modelUrl: '/models/Fractus.obj',
    textureUrl: '/models/fractus_skin.png'
  },
  lignum_vermis: {
    modelUrl: '/models/LignumVermis.obj',
    textureUrl: '/models/lignumvermis_skin.png'
  },
  lignum_palus: {
    modelUrl: '/models/LignumPalus.obj',
    textureUrl: '/models/lignumpalus_skin.png'
  },
  lignum_spina: {
    modelUrl: '/models/Lignum Spina.obj',
    textureUrl: '/models/lignum_spina.png'
  },
  petrified_lignum_spina: {
    modelUrl: '/models/Lignum Spina.obj',
    textureUrl: '/models/petrified_lignum_spina.png'
  },
  lignum_echinus: {
    modelUrl: '/models/LignumEchinus.obj',
    textureUrl: '/models/lignum_echinus.png'
  },
  petrified_lignum_echinus: {
    modelUrl: '/models/LignumEchinus.obj',
    textureUrl: '/models/petrified_lignum_echinus.png'
  },
  lignum_trilobita: {
    modelUrl: '/models/LignumTrilobita.obj',
    textureUrl: '/models/lignum_trilobita.png'
  },
  petrified_lignum_trilobita: {
    modelUrl: '/models/LignumTrilobita.obj',
    textureUrl: '/models/petrified_lignum_trilobita.png'
  },
  kyne_splinter: {
    modelUrl: '/models/Kyne.obj',
    textureUrl: '/models/kyne.png'
  },
  dorceless_splinter: {
    modelUrl: '/models/Dorceless.obj',
    textureUrl: '/models/dorceless.png'
  },
  woodweaver: {
    modelUrl: '/models/WoodWeaver.obj',
    textureUrl: '/models/woodweaver_skin.png'
  },
  hewn_splinter: {
    modelUrl: '/models/Hewn_Splinter.obj',
    textureUrl: '/models/hewn_splinter.png'
  },
  verdant_engine: {
    modelUrl: '/models/VerdantEngine.obj',
    textureUrl: '/models/verdant_skin.png'
  }
};

const ENTITY_IMMUNITIES: Record<string, string[]> = {
  rot: ["Fall Damage", "Cactus", "Drowning", "Freezing", "Soul Fracture"],
  woodweaver: ["Fall Damage", "Drowning", "Suffocation"],
  hewn_splinter: ["Projectiles / Arrows", "Fall Damage", "Cactus", "Drowning", "Falling Anvils", "Fluid Pushes"],
  splinter: ["Poison", "Splash Potions", "Cactus", "Drowning", "Dragon's Breath"],
  kyne_splinter: ["Cactus", "Drowning"],
  dorceless_splinter: ["Cactus", "Drowning"],
  log_splinter: ["Poison", "Splash Potions", "Cactus", "Drowning", "Dragon's Breath"],
  blindspot_splinter: ["Poison", "Splash Potions", "Cactus", "Drowning", "Dragon's Breath"],
  petrified_splinter: ["In Fire", "Arrows & Bows", "Poison", "Splash Potions", "Cactus", "Drowning", "Dragon's Breath", "Wither"],
  hollow: ["Drowning", "Explosions"],
  stilt_walker: ["Cactus", "Drowning", "Dragon's Breath", "Wither"],
  ash_weaver: ["Cactus", "Drowning"],
  lignum_gigas: ["Fall Damage", "Cactus", "Drowning", "Falling Anvils"],
  fractus: ["Poison", "Splash Potions", "Fall Damage", "Cactus", "Drowning", "Lightning", "Dragon's Breath", "Wither"],
  fractus_prime: ["Fire", "Poison", "Splash Potions", "Fall Damage", "Cactus", "Drowning", "Lightning", "Dragon's Breath", "Wither"],
  lignum_vermis: ["Cactus", "Drowning"],
  lignum_palus: ["Poison", "Splash Potions", "Cactus", "Drowning", "Falling Anvils", "Wither"],
  lignum_spina: ["Sweet Berry / Thorns", "Cactus", "Drowning"],
  petrified_lignum_spina: ["Sweet Berry / Thorns", "Cactus", "Drowning", "Arrows"],
  lignum_echinus: ["Sweet Berry / Thorns", "Cactus", "Drowning"],
  petrified_lignum_echinus: ["Sweet Berry / Thorns", "Cactus", "Drowning", "Fall Damage"],
  lignum_trilobita: ["Cactus", "Drowning", "Suffocation"],
  petrified_lignum_trilobita: ["Cactus", "Drowning", "Suffocation", "Falling Anvils"],
  verdant_engine: ["In Fire", "Projectiles / Arrows", "Poison & Splash Potions", "Fall Damage", "Cactus", "Drowning & Water current push", "Lightning Bolts", "Falling Anvils", "Wither & Wither Skulls"]
};

interface Ability {
  title: string;
  trigger: string;
  description: string;
  category: string;
}

interface EntityProfile {
  id: string;
  name: string;
  title: string;
  threatLevel: 'Passive' | 'Low' | 'Medium' | 'High' | 'Extreme' | 'Extermination Class';
  threatColor: string;
  badgeBg: string;
  borderColor: string;
  hp: string;
  damage: string;
  armor: string;
  speed: string;
  dim: string;
  desc: string;
  aka?: string;
  isUpdated?: boolean;
  _matchReason?: string;
}

const getThreatBadgeStyle = (threatLevel: string) => {
  switch (threatLevel) {
    case 'Extermination Class':
      return 'bg-[#251012] border border-red-500/70 text-red-400 font-bold animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.75)]';
    case 'Extreme':
      return 'bg-[#221315] border border-red-900/50 text-[#cf8f92] font-semibold shadow-[0_0_8px_rgba(239,68,68,0.45)]';
    case 'High':
      return 'bg-[#1a1318] border border-[#3f2123]/40 text-[#b5a3bd] shadow-[0_0_4px_rgba(239,68,68,0.25)]';
    case 'Medium':
      return 'bg-[#1a1715] border border-[#2f2824]/40 text-[#c2b09f]';
    case 'Low':
      return 'bg-[#141715] border border-[#222924]/40 text-[#9bb0a0]';
    case 'Passive':
    default:
      return 'bg-[#111412] border border-[#1b221d]/40 text-[#829285]';
  }
};

export default function EntitiesView() {
  const [selectedEntity, setSelectedEntity] = useState<string>('hewn_splinter');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTotemState, setActiveTotemState] = useState<'dormant' | 'empowered' | 'infinity'>('dormant');
  const [activeWoodweaverState, setActiveWoodweaverState] = useState<'dormant' | 'combat' | 'beam'>('dormant');
  const [activeGigasState, setActiveGigasState] = useState<'dormant' | 'anchored' | 'growling'>('dormant');
  const [activeAshWeaverState, setActiveAshWeaverState] = useState<'companion' | 'combat' | 'trauma' | 'territory'>('companion');
  const [activeChatTab, setActiveChatTab] = useState<'movement' | 'home' | 'rules'>('movement');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [openAbilityIndex, setOpenAbilityIndex] = useState<number | null>(0);
  const [openAshWeaverAbilityIndex, setOpenAshWeaverAbilityIndex] = useState<number | null>(0);
  const [sortBy, setSortBy] = useState<'default' | 'threat-asc' | 'threat-desc'>('threat-asc');
  const [activeRotLog, setActiveRotLog] = useState<number>(0);
  const rotClickTimesRef = useRef<number[]>([]);

  const handleCopyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(null), 1500);
  };

  const handleEntitySelect = (entityId: string) => {
    setSelectedEntity(entityId);
    setOpenAbilityIndex(0);
    setOpenAshWeaverAbilityIndex(0);
    if (entityId === 'rot') {
      const now = Date.now();
      const recent = [...rotClickTimesRef.current, now].filter(t => now - t <= 2000);
      rotClickTimesRef.current = recent;
      if (recent.length >= 5) {
        rotClickTimesRef.current = [];
        window.location.hash = '#/wiki/rot-lab';
      }
    } else {
      rotClickTimesRef.current = [];
    }
  };

  const THREAT_VALUES: Record<string, number> = {
    "Passive": 0,
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Extreme": 4,
    "Extermination Class": 5
  };

  const entities: EntityProfile[] = [
    {
      id: "rot",
      name: "The Rot",
      title: "Class-Alpha Threat Sentinel",
      threatLevel: "Extermination Class",
      threatColor: "text-red-500",
      badgeBg: "bg-red-950/40 border-red-900/50 text-red-400",
      borderColor: "border-red-950/40",
      hp: "550 Base (+2 HP/minute scaling)",
      damage: "18 Base (Adaptive / Direct Immunity Override)",
      armor: "15 Points (Dynamic Damage Mitigation)",
      speed: "0.3 (Dynamic Scale: Adaptive Combat Acceleration)",
      dim: "The Backwoods / Dynamic Sentry deployment",
      aka: "Expugnatio, Venator, Vigil, Eversor, Rot Prime",
      isUpdated: true,
      desc: "The apex autonomous combat sentinel of the Backwoods. Driven by a 96-node synthetic cognitive neural array, it continuously evaluates real-time threat vectors, ballistic trajectories, and target kinematics to select optimal neutralization protocols. Equipped with superheater thermal arrays, automated boss immunity overrides, and acoustic shockwaves, target survival probability decays rapidly with every second of engagement."
    },
    {
      id: "woodweaver",
      name: "Woodweaver",
      title: "Telekinetic Adaptive Sentinel",
      threatLevel: "Extreme",
      threatColor: "text-[#be6a6f]",
      badgeBg: "bg-[#2c0f12]/30 border-[#5a1c21]/40 text-[#cc7e82]",
      borderColor: "border-[#3c1215]/20",
      hp: "370 HP",
      damage: "High Melee / Devastating Beam",
      armor: "20 Points",
      speed: "Fast (Phase Adaptive)",
      dim: "The Grain",
      isUpdated: true,
      desc: "An ancient, highly intelligent boss entity residing in The Grain that stalks its prey from afar before engaging in relentless combat. Natural spawns operate on a 20% roll requiring at least 256 blocks clearance from other Woodweavers, at least 32 blocks distance from players, and solid occluding ground. In its dormant phase, it observes players from a distance, cautiously retreating if stared at and vanishing in a cloud of smoke if cornered. As tension builds, it awakens into an aggressive predator capable of telekinetic attacks, charging through obstacles, and firing a devastating vaporizing beam that tears through both terrain and armor. Defeating the Woodweaver causes its core to destabilize in a violent, terrain-shattering explosion."
    },
    {
      id: "splinter",
      name: "The Splinter",
      title: "Woodbound Predator",
      threatLevel: "Medium",
      threatColor: "text-[#d1a851]",
      badgeBg: "bg-[#221808]/30 border-[#473413]/40 text-[#d1a851]",
      borderColor: "border-[#221808]/20",
      hp: "30 HP",
      damage: "6 (3 Hearts)",
      armor: "0 Points",
      speed: "0.335",
      dim: "The Backwoods (Dense Oak/Spruce forests)",
      isUpdated: true,
      desc: "The primary threat of the Backwoods. A gaunt, hollow wooden figure that hunts targets with infinite patience. Possesses an elevated safe fall distance of 7 blocks and increased water movement efficiency (0.3). Driven by the SplinterAgeProcedure, Splinters continuously accumulate age ticks over time (accelerated drastically in water, rain, or fire), weathering and decaying until reaching their final lifespan threshold where they decompose completely into organic matter. Upon spawning, each unit is assigned a stealth Stalker profile or a weeping Angel profile that advances only when unwatched. When a Rot entity approaches within 100 blocks, Splinters possess an innate evacuation instinct, actively fleeing the area to avoid collateral destruction during sentinel combat engagements. Its encounters feed a shared memory of each player's fighting habits, carried by its kin across the Backwoods realms."
    },
    {
      id: "lignum_spina",
      name: "Lignum Spina",
      title: "Thorns Organism",
      threatLevel: "Medium",
      threatColor: "text-[#d1a851]",
      badgeBg: "bg-[#221808]/30 border-[#473413]/40 text-[#d1a851]",
      borderColor: "border-[#221808]/20",
      hp: "12 HP",
      damage: "4 HP + Thorns Reflection",
      armor: "4 Points",
      speed: "0.320",
      dim: "The Backwoods / Thicket Biomes",
      isUpdated: true,
      desc: "A nimble, thorned wooden organism that inflicts custom thorns damage on attackers whenever struck and has a 2% chance to deal sweet berry thorns damage on collision. Commonly generates in upper forest layers at or above Y=50 (requiring a 32-block separation between specimens on solid ground). In combat, it attacks aggressively while HP >= 5, but actively flees and avoids targets when its health drops below 5. Additionally, it flees immediately when a Rot entity approaches within 100 blocks to evade its destructive footprint."
    },
    {
      id: "petrified_lignum_spina",
      name: "Petrified Lignum Spina",
      title: "Calcified Thorns Organism",
      threatLevel: "High",
      threatColor: "text-zinc-400",
      badgeBg: "bg-zinc-900/60 border-zinc-700/50 text-zinc-300",
      borderColor: "border-zinc-800/30",
      hp: "28 HP",
      damage: "6 HP + Thorns Reflection",
      armor: "8 Points (Fossilized Bark)",
      speed: "0.260",
      dim: "The Petrified Weald",
      isUpdated: true,
      desc: "A calcified variant of Lignum Spina adapted to the Petrified Weald, naturally generating at elevations between Y=60 and Y=120 (maintaining a 32-block separation on solid ground). Features 8 armor points, arrow immunity, and custom thorns reflection. Fights aggressively when HP >= 5 and retreats when HP < 5. Automatically flees from approaching Rot entities within a 100-block perimeter to avoid collateral destruction."
    },
    {
      id: "lignum_echinus",
      name: "Lignum Echinus",
      title: "Spiked Wood Burrower",
      threatLevel: "Medium",
      threatColor: "text-[#c28b40]",
      badgeBg: "bg-[#221808]/40 border-[#3d2a0d]/40 text-[#c28b40]",
      borderColor: "border-[#3d2a0d]/20",
      hp: "16 HP",
      damage: "4 HP + Spike Reflection",
      armor: "4 Points",
      speed: "0.350",
      dim: "The Backwoods Undergrowth",
      isUpdated: true,
      desc: "A fast, urchin-like wooden organism that commonly spawns in undergrowth layers at or above Y=58 (requiring a 36-block exclusion zone from other specimens on solid ground). Deals 3 points of thorns reflection damage back to attackers whenever hurt and has a 2% chance to deal collision spike damage. Fights aggressively when HP > 5, but shifts to avoidance mode when HP <= 5. Possesses an active flee routine targeting Rot entities within 100 blocks to evacuate the danger zone."
    },
    {
      id: "petrified_lignum_echinus",
      name: "Petrified Lignum Echinus",
      title: "Fossilized Spiked Urchin",
      threatLevel: "High",
      threatColor: "text-zinc-400",
      badgeBg: "bg-zinc-900/60 border-zinc-700/50 text-zinc-300",
      borderColor: "border-zinc-800/30",
      hp: "32 HP",
      damage: "7 HP + Heavy Spike Reflection",
      armor: "10 Points (Heavy Shell)",
      speed: "0.380",
      dim: "The Petrified Weald",
      isUpdated: true,
      desc: "A dense, fossilized variant of Lignum Echinus generating within the Petrified Weald between Y=-30 and Y=50 (with a 32-block separation on solid ground). Features 10 armor points and high movement speed. Reflects heavy spike damage back to attackers and flees when heavily injured (HP <= 5). Like its uncalcified kin, it flees from Rot entities within a 100-block range to avoid collateral damage."
    },
    {
      id: "lignum_trilobita",
      name: "Lignum Trilobita",
      title: "Wood-Armor Scavenger",
      threatLevel: "Low",
      threatColor: "text-[#4ca398]",
      badgeBg: "bg-[#101b19]/20 border-[#1f3632]/30 text-[#4ca398]",
      borderColor: "border-[#101b19]/10",
      hp: "18 HP",
      damage: "3 HP (1.5 Hearts)",
      armor: "8 Points (Interlocking Planks)",
      speed: "0.220",
      dim: "The Backwoods / Sub-Strata Floors",
      isUpdated: true,
      desc: "An ancient arthropod made of interlocking oak scales that inhabits subterranean sub-strata floors between Y=-20 and Y=48 (requiring a 16-block separation radius on solid ground). Driven by an innate flee mechanism targeting Rot entities (1.5x speed, 100-block range) and players (1.2x speed, 6-block range). Local fauna evacuate the area within 100 blocks of the Rot to avoid becoming collateral damage during its destructive engagements. When health falls to 4 HP or lower, it enters a protective shell hiding state to regenerate +1 HP every 10 ticks up to 10 HP. If a Rot entity approaches within 100 blocks, it breaks hiding instantly and flees. Consumes edible items on the ground, scaling up +0.07 in size per meal."
    },
    {
      id: "petrified_lignum_trilobita",
      name: "Petrified Lignum Trilobita",
      title: "Fossilized Trilobite",
      threatLevel: "Medium",
      threatColor: "text-zinc-400",
      badgeBg: "bg-zinc-900/60 border-zinc-700/50 text-zinc-300",
      borderColor: "border-zinc-800/30",
      hp: "40 HP",
      damage: "4 HP (2 Hearts)",
      armor: "14 Points (Calcified Carapace)",
      speed: "0.140",
      dim: "The Petrified Weald",
      isUpdated: true,
      desc: "A heavily calcified fossilized trilobite generating between Y=0 and Y=60 in the Petrified Weald (with a 32-block separation on solid ground). Features 14 armor points. Features an active fleeing routine targeting Rot entities (1.7x speed, 100-block range) to evade the Rot and avoid collateral damage. Tucks into its carapace when HP <= 4 to heal +1 HP every 10 ticks until reaching 10 HP, but breaks hiding immediately if a Rot entity approaches within 100 blocks."
    },
    {
      id: "hewn_splinter",
      name: "Hewn Splinter",
      title: "Paralyzed Block-Form Splinter",
      threatLevel: "Passive",
      threatColor: "text-[#5ea386]",
      badgeBg: "bg-[#131d17]/30 border-[#263e30]/40 text-[#5ea386]",
      borderColor: "border-[#131d17]/20",
      hp: "6 HP (3 Hearts)",
      damage: "0 HP (Harmless)",
      armor: "0 Points",
      speed: "0.0 (Immobile)",
      dim: "The Backwoods (Wood Plains & Thicket Biomes)",
      isUpdated: true,
      desc: "Something subjected them to a fate inspired by pure, utilitarian cruelty, turned them from bipeds to cubes. They are entirely conscious, but paralyzed. They cannot move, they cannot scream, and they cannot fight back. Visually indistinguishable from a standard Oak Planks block, Hewn Splinters automatically snap their rotation to cardinal 90-degree angles upon spawning. They feature a 5% spawn chance on surface blocks in the Wood Plains and Thicket biomes provided no other Hewn Splinter exists within a 96-block radius. Completely immune to arrows, fall damage, cactus, drowning, falling anvils, and fluid pushes. Drops 1 Oak Planks when destroyed."
    },
    {
      id: "kyne_splinter",
      name: "Kyne Splinter",
      title: "Woodbound Aggressor",
      threatLevel: "Medium",
      threatColor: "text-[#d1a851]",
      badgeBg: "bg-[#221808]/30 border-[#473413]/40 text-[#d1a851]",
      borderColor: "border-[#221808]/20",
      hp: "20 HP",
      damage: "5 HP (2.5 Hearts)",
      armor: "0 Points",
      speed: "0.280",
      dim: "Wood Plains & The Thicket",
      isUpdated: true,
      desc: "A predatory Woodbound entity based on the Thalasin, the analog horror, that drops 7 XP upon defeat. A rare spawn occurring on a 15% roll with a strict 512-block exclusion zone from other Kyne Splinters on solid ground. When struck, if nearby pack members are present, it triggers a pack-wide avenge protocol, rallying surrounding Woodbound entities to retaliate against the attacker. Like all Splinter species, Kyne Splinters actively flee from any Rot entity that approaches within 100 blocks to evade its destructive footprint."
    },
    {
      id: "dorceless_splinter",
      name: "Dorceless Splinter",
      title: "Evasive Void Stalker",
      threatLevel: "High",
      threatColor: "text-[#aa8bc9]",
      badgeBg: "bg-[#1b1424]/30 border-[#312542]/40 text-[#aa8bc9]",
      borderColor: "border-[#1b1424]/20",
      hp: "24 HP",
      damage: "6 HP (3 Hearts)",
      armor: "3 Points",
      speed: "0.220",
      dim: "Wood Plains & The Thicket",
      isUpdated: true,
      desc: "An elusive, armored variant of the Splinter lineage based on the Thalasin, the analog horror, that drops 10 XP, Oak Planks, and a Tetherless Pearl upon defeat. Operates on an uncommon 25% spawn chance roll requiring a 128-block clearance from other Dorceless Splinters on solid ground. Possesses an advanced Enderman-style Dodge Teleport mechanic when damaged: 85% chance to dodge incoming projectile attacks and 50% chance to dodge melee strikes. When dodging, it releases squid ink and smoke particles, playing a wood-break sound, and teleports 6 to 11 blocks away to flank the attacker while immediately facing them. Possesses an innate evacuation instinct, actively fleeing when a Rot entity comes within 100 blocks."
    },
    {
      id: "log_splinter",
      name: "Log Splinter",
      title: "Camouflaged Sentry",
      threatLevel: "Medium",
      threatColor: "text-[#c28b40]",
      badgeBg: "bg-[#221808]/40 border-[#3d2a0d]/40 text-[#c28b40]",
      borderColor: "border-[#3d2a0d]/20",
      hp: "32 HP",
      damage: "6 (3 Hearts)",
      armor: "2 Points (Dense Bark)",
      speed: "0.335",
      dim: "The Backwoods / Forestry Mimicry",
      isUpdated: true,
      desc: "A heavier, bark-skinned variant of the standard Splinter possessing elevated health and a custom wood-rich dropset. Possesses an enhanced safe fall distance of 8 blocks and 0.4 water movement efficiency. It excels at camouflaging against local trees, packing tightly together in mature world phases. Like all Splinter species, it actively flees from approaching Rot entities within a 100-block range. Its encounters feed a shared memory of each player's fighting habits, carried by its kin across the Backwoods realms."
    },
    {
      id: "blindspot_splinter",
      name: "Blindspot Splinter",
      title: "Visually Evasive Wraith",
      threatLevel: "High",
      threatColor: "text-orange-400",
      badgeBg: "bg-orange-950/30 border-orange-900/40 text-orange-400",
      borderColor: "border-orange-950/20",
      hp: "30 HP",
      damage: "6 (3 Hearts)",
      armor: "0 Points",
      speed: "0.335",
      dim: "The Grain (Labyrinths) / The Sub-Strata",
      isUpdated: true,
      desc: "A predator of The Grain that turns invisible in the third-person front view. As the shared hivemind learns, Blindspot Splinters can leave frozen afterimages where they stood, vanish, and silently move behind or around their target. Copies linger while their makers reposition, then fade before the real hunters attack. Ash-Roses can halt them, although these fragile wards wilt quickly in their presence."
    },
    {
      id: "petrified_splinter",
      name: "Petrified Log Splinter",
      title: "Calcified Vanguard",
      threatLevel: "High",
      threatColor: "text-zinc-400",
      badgeBg: "bg-zinc-900/60 border-zinc-700/50 text-zinc-300",
      borderColor: "border-zinc-800/30",
      hp: "56 HP",
      damage: "8 (4 Hearts)",
      armor: "4 Points (Fossilized Wood)",
      speed: "0.300",
      dim: "The Petrified Weald",
      isUpdated: true,
      desc: "A highly resilient, fossilized variant of the Splinter lineage generating in the Petrified Weald (requiring a 48-block clearance from other specimens on solid occluding ground). Adapted to the extreme pressures of the Petrified Weald, it moves slower but acts as a dense physical shield, taking minimal damage from kinetic strikes. Like all Splinter sub-species, it evacuates the area whenever a Rot entity approaches within 100 blocks. Its encounters feed a shared memory of each player's fighting habits, carried by its kin across the Backwoods realms."
    },
    {
      id: "hollow",
      name: "The Hollow",
      title: "Phantom Spectator",
      threatLevel: "Low",
      threatColor: "text-[#4ca398]",
      badgeBg: "bg-[#101b19]/20 border-[#1f3632]/30 text-[#4ca398]",
      borderColor: "border-[#101b19]/10",
      hp: "10 HP",
      damage: "0 (Passive Stalker)",
      armor: "0 Points",
      speed: "0.300 (Teleporting)",
      dim: "Deep Backwoods Canopy",
      isUpdated: true,
      desc: "An eerie stalking entity that manifests in deep forest canopies and dark caverns (requiring a 48-block separation from other Hollows on solid occluding ground). It never engages in physical confrontation. Instead, it looms in the distant fog, teleporting closer when the player is distracted, and instantly vanishes into thin air if attacked."
    },
    {
      id: "stilt_walker",
      name: "Stilt Walker",
      title: "Dimensional Observer",
      threatLevel: "High",
      threatColor: "text-[#aa8bc9]",
      badgeBg: "bg-[#1b1424]/30 border-[#312542]/40 text-[#aa8bc9]",
      borderColor: "border-[#1b1424]/20",
      hp: "40 HP",
      damage: "N/A (Spawns swarms on stalk cycle)",
      armor: "0 Points",
      speed: "0.160",
      dim: "The Backwoods / Tall Canopies",
      isUpdated: true,
      desc: "A tall, looming figure that watches from extreme distances. Prolonged observation activates its hostile phase. When the Rot approaches within 100 blocks, it drops all targets, charges a 3 to 5 second flashing aura, and teleports 70 to 120 blocks directly away to escape. It also uses short-range predictive teleportation during combat to dodge incoming attacks."
    },
    {
      id: "ash_weaver",
      name: "The Ash-Weaver",
      title: "Sub-Realm Gardener & Symbiotic Companion",
      threatLevel: "Low",
      threatColor: "text-[#5ea386]",
      badgeBg: "bg-[#131d17]/30 border-[#263e30]/40 text-[#5ea386]",
      borderColor: "border-[#131d17]/20",
      hp: "40 HP",
      damage: "4 (Base Melee Strike / Self-Defense Reprisal)",
      armor: "0 Points",
      speed: "Walks, sprints, and jumps to follow its companion",
      dim: "The Thicket (Dense vegetation biomes)",
      isUpdated: true,
      desc: "An intelligent, wary companion native to The Thicket. An Ash-Weaver chooses a player who has no Weaver of their own, then learns to recognize their habits, their shelter, and the dangers they face together. It plants Ash-Roses when hostile Splinters threaten its companion, warns of unseen pursuers, and may join a fight or seek cover when frightened. Familiarity makes its strange speech easier to understand, but repeated harm can turn companionship into distrust."
    },
    {
      id: "lignum_gigas",
      name: "Lignum Gigas",
      title: "Woodbound Titan Behemoth",
      threatLevel: "Extreme",
      threatColor: "text-[#be6a6f]",
      badgeBg: "bg-[#2c0f12]/30 border-[#5a1c21]/40 text-[#cc7e82]",
      borderColor: "border-[#3c1215]/20",
      hp: "1,008 HP",
      damage: "3 (Plus massive fall damage launches)",
      armor: "0 Points (Absorbs damage via massive health regen)",
      speed: "0.000 (Immobile Behemoth)",
      dim: "Wood Plains & The Thicket (Colossal Ring formations)",
      isUpdated: true,
      desc: "A gargantuan stationary biomechanical titan standing 80 blocks tall. Built from ancient interlocking oak planks, it channels the legendary properties of the Coelum Carnis. Anchored deep into the floor with an Inexhaustible Health Reservoir (1,088 HP) and immediate Coelum Carnis regeneration, its massive tissue repairs faster than kinetic strikes or environmental decay can consume it. Because of this infinite regenerative core, Lignum Gigas does NOT flee from The Rot, standing completely indifferent to its presence while lesser fauna evacuate. Striking it triggers apocalyptic defensive routines."
    },
    {
      id: "verdant_engine",
      name: "Verdant Engine",
      title: "Atmospheric Retribution Vanguard & Autonomous Hive Node",
      threatLevel: "Extreme",
      threatColor: "text-[#cf8f92]",
      badgeBg: "bg-[#221315] border border-red-900/50 text-[#cf8f92] font-semibold shadow-[0_0_8px_rgba(239,68,68,0.45)]",
      borderColor: "border-[#3c1215]/30",
      hp: "2,500 HP (Limit-Bypassed)",
      damage: "0 (Environmental Restructuring / Failure Cascade)",
      armor: "150 Points / 40 Toughness",
      speed: "0.300 (Gravity-Defying Autonomous Levitation)",
      dim: "Non-Mod Dimensions (Retributive)",
      aka: "World Engine",
      isUpdated: true,
      desc: "A colossal sky-bound terraforming apparatus inspired by the World Engine from the movie Man of Steel. Deployed to enforce planetary biological equilibrium, it executes continuous environmental restructuring cycles by slamming high-energy gravity beams deep into the subterranean crust to transmute entire biomes into Wood Plains. While not designed for direct offensive combat, it commands a formidable 48-block spacetime distortion field that neutralizes incoming projectiles and repels intruders. Operating as synchronized nodes in a dimension-wide hivemind, multiple engines coordinate deterministically to fan across the sky, reserve territory, pinpoint uninfected ground gaps, and command protective orbital rings of Fractus sentinels."
    },
    {
      id: "fractus",
      name: "Fractus",
      title: "Sub-Strata Sentry Drone",
      threatLevel: "High",
      threatColor: "text-cyan-400",
      badgeBg: "bg-cyan-950/30 border-cyan-900/40 text-cyan-400",
      borderColor: "border-cyan-950/20",
      hp: "48 HP",
      damage: "2.0 Base / 3.0 Phase 2 (Constant Laser Tick)",
      armor: "6 Points (Metallic Chassis)",
      speed: "0.200 (Ignoring Gravity)",
      dim: "The Sub-Strata (Menger Sponge structures)",
      isUpdated: true,
      desc: "A floating security drone guarding ancient geometries deep underground. Driven by autonomous mechanical protocols and anchored leash points, Fractus sentinels do not possess biological panic routines and ignore the presence of the Rot. They can evade some incoming projectiles, but use Verdant Engine orbital formations and its dampening field for stronger area defense."
    },
    {
      id: "fractus_prime",
      name: "Fractus Prime",
      title: "Orbital Sentry Overseer",
      threatLevel: "Extreme",
      threatColor: "text-cyan-500",
      badgeBg: "bg-cyan-950/40 border-cyan-800/40 text-cyan-300 font-bold",
      borderColor: "border-cyan-900/30",
      hp: "270 HP (Mini-Boss Class)",
      damage: "21.3 Base / 55.0 Phase 2 (Divided across multi-targets)",
      armor: "20 Points (High Alloy Plating)",
      speed: "0.200 (High-velocity reverse thrust)",
      dim: "The Sub-Strata (Summoned via Drone Rituals)",
      isUpdated: true,
      desc: "A massive overseer-class defense drone commanding a wide airspace perimeter. Operating on automated airborne combat programming, it maintains its containment grid regardless of external threats, deploying multi-beam laser arrays and destructive energy bursts."
    },
    {
      id: "lignum_vermis",
      name: "Lignum Vermis",
      title: "Wood-Burrowing Arthropod",
      threatLevel: "Low",
      threatColor: "text-teal-400",
      badgeBg: "bg-teal-950/20 border-teal-900/30 text-teal-400",
      borderColor: "border-teal-950/10",
      hp: "10 HP",
      damage: "1 Point",
      armor: "0.5 Points",
      speed: "0.23",
      dim: "Sub-Strata (Specifically within wood blocks or mineshafts)",
      isUpdated: true,
      desc: "A neutral arthropod organism constructed entirely of segmented oak planks. Generates naturally in subterranean sub-strata wood veins strictly between Y=44 and Y=52, and frequently emerges (10% chance) when mining Scandere Lignum blocks. Mirroring a wooden silverfish in scale and model size, it blends into forest debris, wood blocks, and abandoned mineshafts. Its diminutive stature allows it to squeeze through narrow apertures and crawl into spaces larger entities cannot navigate."
    },
    {
      id: "lignum_palus",
      name: "Lignum Palus",
      title: "Grid-Bound Column Stalker",
      threatLevel: "High",
      threatColor: "text-orange-400",
      badgeBg: "bg-orange-950/30 border-orange-900/40 text-orange-400",
      borderColor: "border-orange-950/20",
      hp: "50 HP",
      damage: "8 Points (Plus Hypnosis / Collision)",
      armor: "6 Points",
      speed: "0.05 / 0.12 (Freeze/Chase States)",
      dim: "The Sub-Strata (Pillar-heavy structures)",
      isUpdated: true,
      desc: "A towering grid-bound entity standing 5.8 blocks tall that patrols subterranean floors strictly between Y=20 and Y=46 (requiring a 10-block clearance from other Palus specimens on solid ground). Stalks prey through architectural mimicry and gaze hypnosis. When the Rot is detected within 100 blocks, it immediately drops all targets, charges a 3 to 5 second flashing particle aura, and teleports 70 to 120 blocks away to safety. It also uses grid-aligned teleportation to dodge incoming projectiles."
    }
  ];

  const rotAbilities: Ability[] = [
    {
      title: "Direct Boss Immunity Override",
      trigger: "Target entities exhibiting external damage caps, artificial potion buffs, or i-frame exploits",
      description: "Neutralizes foreign defensive systems on formidable non-player targets. Invalidation protocols continuously strip invulnerability frames and artificial god-mode potion effects. Should standard damage pathways be artificially capped or cancelled by external entity logic, a direct true-damage health penalty is enforced to ensure target termination.",
      category: "Boss Neutralization"
    },
    {
      title: "Superheater",
      trigger: "Submerged in fluid or engaging cold/frozen target entities within 24 blocks",
      description: "Anchors its physical core to unleash a massive expanding thermal dome. Vaporizes surrounding fluid volumes, flash-melts cold and frozen terrain blocks into steam, and inflicts severe thermal true damage—amplifying devastation up to triple magnitude against cold-aligned organisms.",
      category: "Thermal Warfare"
    },
    {
      title: "Synthetic Neural Core",
      trigger: "Continuous autonomic processing throughout all combat states",
      description: "An adaptive, non-linear cognitive network driven by 96 synchronized input vector channels feeding an 8-neuron hidden processing layer. It continuously extracts high-dimensional data from the encounter—dissecting weapon draw speeds, crosshair tracking precision, evasion rhythms, mace threat calculations, airtime frequencies, and biological vitals. Synaptic weightings permanently reshape themselves in real time based on combat efficacy; every successful maneuver from its target is systematically analyzed, calculated, and transformed into an insurmountable tactical liability. It does not possess instinct—it learns, adapts, and executes.",
      category: "Cognitive Engine"
    },
    {
      title: "Armor Choke & Equipment Destruction",
      trigger: "Engaging target within close physical proximity",
      description: "Immobilizes target in an inescapable aerial choke hold, dealing periodic damage while rapidly degrading equipped armor durability or forcibly stripping indestructible armor pieces outright.",
      category: "Disarm & Containment"
    },
    {
      title: "Sonic Boom & Omnidirectional Acoustic Shockwave",
      trigger: "Target beyond melee range or under high pressure",
      description: "Fires a focused acoustic beam that completely bypasses target armor protection. Under extreme pressure, releases a 360-degree omnidirectional acoustic shockwave across a wide radius.",
      category: "Acoustic Warfare"
    },
    {
      title: "Rider Kick & High-Velocity Aerial Martial Strikes",
      trigger: "Target airborne, elevated, or attempting rapid escape",
      description: "Launches into high-velocity diagonal dive maneuvers, unleashing judgment dropkicks, standalone uppercuts, or rider kicks that detonate upon floor contact or target impact.",
      category: "Kinetic Warfare"
    },
    {
      title: "Short-Range Blinks & Trajectory Interception",
      trigger: "Incoming physical strikes or projectile launches within range",
      description: "Executes rapid tactical blinks to evade incoming strikes. Computes thrown object parabolic trajectories to materialize directly at predicted landing coordinates.",
      category: "Tactical Mobility"
    },
    {
      title: "Mace Dive Counter & Anti-Air Suppression",
      trigger: "Target descending from height with heavy weapons",
      description: "Identifies high-altitude heavy weapon plunging maneuvers, instantly triggering evasive counter-repositioning to neutralize aerial heavy strikes.",
      category: "Tactical Control"
    },
    {
      title: "Cellular Surge Regeneration & Adaptive Resistance",
      trigger: "Sustaining cumulative damage during prolonged combat",
      description: "Pulses cellular healing at accelerated rates during low-health thresholds, while building up dynamic physical resistance as incoming damage exceeds adaptive mitigation thresholds.",
      category: "Defense & Healing"
    },
    {
      title: "Multi-Agent Swarm Coordinated Auction",
      trigger: "Multiple sentinels present within the combat zone",
      description: "Executes decentralized role allocation protocols to assign specialized combat roles without tactical overlap.",
      category: "Swarm Logic"
    }
  ];

  const splinterAbilities: Ability[] = [
    {
      title: "The Forest Remembers",
      trigger: "Repeated encounters with the same player",
      description: "Standard, Log, Blindspot, and Petrified Splinters share what they learn about their prey. Bow fire, close combat, and fallen kin shape their responses, even when no ordinary Splinter is nearby. Crossing into another Backwoods realm does not erase that memory.",
      category: "Shared Instinct"
    },
    {
      title: "Timber Shields & Hunting Lines",
      trigger: "A vulnerable hunter is aimed at, or a dangerous shot approaches",
      description: "Experienced hunters read incoming shots, seek cover, and weave sideways when directly threatened by a player's aim. Built cover rises from the ground upward. Petrified Splinters do not waste wood shielding themselves from projectiles that cannot hurt them.",
      category: "Combat"
    },
    {
      title: "Coalescence",
      trigger: "Enough eligible remains lie near fallen Splinters",
      description: "Marked wood and sticks draw together, rise into a rough figure, and hang briefly before another hunter stands in their place. Four sticks count as one plank. Player-thrown supplies cannot begin this revival, and chosen remains stay beyond reach until the gathering ends.",
      category: "Reformation"
    }
  ];

  const blindspotAbilities: Ability[] = [
    ...splinterAbilities,
    {
      title: "Borrowed Shapes",
      trigger: "An experienced Blindspot loses the player's attention",
      description: "Frozen copies remain where the hunters stood as their real bodies vanish. Some follow behind the player; others silently take positions around them without circling. They back away if approached and cannot strike until the copies have faded.",
      category: "Deception"
    }
  ];

  const ashWeaverAbilities: Ability[] = [
    {
      title: "A Chosen Companion",
      trigger: "An unassigned Weaver meets an eligible player nearby",
      description: "Chooses a player who has no Ash-Weaver assigned to them. It follows, catches up when needed, and sometimes lingers or glances at its surroundings before returning. A portal it sees its companion enter can become a route to follow; an unexplained disappearance is not permission to teleport.",
      category: "Companion Logic"
    },
    {
      title: "An Uneasy Protector",
      trigger: "Its companion is attacked or a nearby threat becomes dangerous",
      description: "Can turn on an attacker, swing in close combat, or occasionally jump for a stronger strike. It may dodge danger, hesitate, or retreat instead of judging every fight perfectly. When a pursuing Splinter seems to have escaped the player's notice, the Weaver can gesture a warning.",
      category: "Combat AI"
    },
    {
      title: "Ash-Rose Defense",
      trigger: "A nearby hostile Splinter is targeting its companion",
      description: "Looks for safe ground, turns toward the planting site, and swings before placing a rose. Planting is a response to danger, not endless peaceful gardening. Rose placement is limited, and it may drop a blossom for a companion in danger.",
      category: "Botanical Defense"
    },
    {
      title: "Frightening Memories",
      trigger: "A dangerous encounter or a near-death escape",
      description: "Remembers frightening threats and the areas where they were encountered. A shaken Weaver may crouch behind cover, peek out, and wait for danger to pass. Overcoming threats together can ease its fear, but a victory does not erase every memory at once.",
      category: "Cognitive System"
    },
    {
      title: "Learning to Understand",
      trigger: "Its assigned player speaks nearby",
      description: "Recognizes a small set of chat requests, including addressed phrases with minor misspellings. Early replies are mostly scrambled; growing familiarity makes them clearer. It pauses before answering, responds more quickly to urgent help, and speaks privately to its own companion.",
      category: "Social & Linguistics"
    },
    {
      title: "A Place Called Home",
      trigger: "Its companion says 'this is home' from nearby safe ground",
      description: "Accepts a usable shelter or cave, or an equipped campsite, lookout, or open base. It gradually learns nearby rooms and boundaries rather than claiming every visible patch of land. Open doors remain boundaries, and an unsafe or unreachable place can be refused.",
      category: "Territory Logic"
    },
    {
      title: "Making Amends",
      trigger: "Its companion apologizes after an isolated accidental hit",
      description: "A sincere apology can soften a recent mistake, but it does not erase the injury or every frightening memory. Repeated harm carries more weight than repeated words. Spamming apologies earns no trust, and the Weaver may ask for time or wait for kinder behavior.",
      category: "Companionship"
    },
    {
      title: "Small, Deliberate Movements",
      trigger: "Following through uneven ground, ledges, or doorways",
      description: "Walks, sprints, and uses cautious jumps when the route allows. It judges drops and landing space instead of jumping down every slope. At a door it pauses, looks toward the handle, and swings to open or close it, leaving the doorway clear for others.",
      category: "Kinematic AI"
    }
  ];

  const lignumGigasAbilities: Ability[] = [
    {
      title: "Geometrical Ring Formations",
      trigger: "Entity Generation & Terrain Generation checks",
      description: "Generates strictly in massive structures consisting of 7 giant units arranged in a 400-block wide circle (200-block radius from center), all facing inward. Ring centers enforce an absolute separation spacing constraint of at least 900 blocks from other rings.",
      category: "Macro Generation"
    },
    {
      title: "Sinking Anchor & Block Fracturing",
      trigger: "On initial combat strike or receiving direct damage",
      description: "Upon combat initiation, the behemoth fractures all solid blocks within a 9-block radius and sinks precisely 5 blocks into the terrain to anchor its immense weight against kinetic strikes.",
      category: "Kinetic Defense"
    },
    {
      title: "Omnidirectional Radial Flinging",
      trigger: "Active target detected within 28-block radius of base",
      description: "Maintains continuous sector clearance sweeps, forcefully launching active targets within a 28-block radius high into the air to trigger massive fall damage scenarios.",
      category: "Area Control"
    },
    {
      title: "Inventory Stripping Growl",
      trigger: "Proximity combat after emitting an Ender Dragon growl sound",
      description: "Emits a deep, echoing growl. All active targets within a 28-block radius find their active hotbars, main inventory items, and off-hands instantly stripped and cast onto the ground.",
      category: "Equipment Disarm"
    }
  ];

  const verdantEngineAbilities: Ability[] = [
    {
      title: "Distributed Dimension Hivemind Network",
      trigger: "Continuous global synchronization across active dimension",
      description: "Operates as a synchronized node in a shared dimension-wide hivemind. The network partitions the world into discrete 256x256 block coordinate regions, synchronizes completed territory registers across server unloads, deterministically assigns angular radial sectors based on engine UUID to eliminate flight path overlap, and enforces an active 50-block repulsion bubble to prevent aerial clustering.",
      category: "Hivemind Architecture"
    },
    {
      title: "Subterranean Wood & Biome Transmutation",
      trigger: "Continuous downward gravity beam projection",
      description: "Projects a high-energy downward gravity beam transmuting surface vegetation, stone strata, and subterranean caverns into Wood Plains across an expanding radius of up to 256 blocks. Employs an 8-tick chunk lease system, 100-tick column cooldowns, and a 16,384-slot salted open-addressing cache to completely eliminate redundant block recalculations across multiple active units.",
      category: "Planetary Transmutation"
    },
    {
      title: "Kinetic Pound Scaling & Shockwave Acceleration",
      trigger: "Continuous ground pounding impacts",
      description: "Every cumulative ground pound permanently increases base column sampling by 12 samples per tick (up to 200 base samples), while each impact triggers a temporary shockwave burst injecting an additional 80 to 120 samples per tick. Upon reaching the maximum 256-block infection radius, sampling expands by 3.0x to accelerate final territory saturation.",
      category: "Kinetic Amplification"
    },
    {
      title: "Two-Tier Grid Auditing & Gap Pinpointing",
      trigger: "Regional saturation assessment and territory exhaustion check",
      description: "Surveys local 256x256 block territory using a 5x5 coarse grid, escalating to a high-density 9x9 fine grid once saturation reaches 90%. If uninfected gaps are detected, the engine calculates the largest untouched pocket coordinates and routes relocation directly to the hole rather than departing prematurely.",
      category: "Spatial Telemetry"
    },
    {
      title: "Direct Failed-Column Probe Restoration",
      trigger: "Infection radius reaches 90% or higher of maximum bounds",
      description: "When the infection radius is mature, the engine directly isolates the exact block columns that failed the multi-ring saturation probe and performs precision subterranean rod repairs on up to 8 failed columns per check, closing the final 5% saturation gap rapidly.",
      category: "Precision Correction"
    },
    {
      title: "Spacetime Distortion & Projectile Nullification",
      trigger: "Incoming projectiles, flight maneuvers, or hostiles within 48-block defensive radius",
      description: "Generates a 48-block defensive distortion sphere applying up to 90% drag on arrows, tridents, and fireworks, pulling airborne entities into Zero-G suspension, stalling Riptide tridents, and forcing immediate Elytra glide collapse. Field effectiveness automatically scales down to 55% during non-terraforming phases and weakens proportionally as the engine sustains hull damage.",
      category: "Spacetime Defense"
    },
    {
      title: "World Border Margin & Expansion Reactivation",
      trigger: "Approaching world border boundaries or boundary adjustments",
      description: "Enforces an authoritative 25-block clearance margin from world borders, dynamically adapting relocation jump distances down to 64 to 224 blocks in small custom borders. When 100% of regions inside the border achieve 95% or higher saturation, the hive initiates a final verification sweep and enters silent collective dormancy, instantly waking all engines if world borders expand.",
      category: "Boundary Adaptation"
    },
    {
      title: "Catastrophic Core Failure Cascade",
      trigger: "Hull structural integrity reduced to critical threshold (0 HP)",
      description: "Upon sustaining fatal structural damage aloft, propulsion is suspended as internal power reservoirs overload. The destabilized core discharges violent spatial shockwaves outward across surrounding airspace before detonating in a catastrophic terrain-shattering explosion and dissolving from the sky.",
      category: "Terminal Cataclysm"
    }
  ];

  const woodweaverAbilities: Ability[] = [
    {
      title: "Dormant Stalker & Gaze Evasion",
      trigger: "Target within 48 blocks during initial encounter phase",
      description: "The Woodweaver observes targets carefully from afar without initiating direct aggression. If the player maintains direct eye contact, the creature smoothly glides backward while keeping its crimson gaze locked onto the target, steadily building internal Dread.",
      category: "Intelligence & Stalking"
    },
    {
      title: "Emergency Smoke Screen Relocation",
      trigger: "Approached within 5 blocks or cornered during stalking phase",
      description: "If players attempt to rush or corner the entity during its dormant state, it vanishes instantly in a thick cloud of obscuring smoke particles, inflicting temporary blindness and relocating to an elevated vantage point.",
      category: "Evasion & Defense"
    },
    {
      title: "Dread Accumulation & Combat Awakening",
      trigger: "Prolonged line-of-sight exposure, proximity, or taking direct damage",
      description: "Tracks an internal Dread meter from 0% to 100%. Maintaining eye contact or striking the entity rapidly fills this gauge. Upon reaching 100%, the Woodweaver unleashes a deafening roar and transitions permanently into its lethal combat state.",
      category: "State Matrix"
    },
    {
      title: "Hypnosis Gaze & Sensory Stun",
      trigger: "Maintaining direct eye contact during active combat",
      description: "Locks crimson optics onto the player, applying intense Slowness IV, Weakness III, and dynamic camera tilt disorientation. Victims caught in the gaze find their movement frozen as the creature closes the distance.",
      category: "Psychological & Debuff"
    },
    {
      title: "Cellular Collapse & Telekinetic Siphon",
      trigger: "Target within 16 blocks and currently uninfected",
      description: "Suspends the victim mid-air using woodbound telekinesis and inflicts the debilitating 'Cellular Collapse' status effect. The affliction reduces max HP, slows movement, impairs jump strength, and siphons health directly back into the Woodweaver's vital reservoir.",
      category: "Telekinesis & Drain"
    },
    {
      title: "Colossal Vaporize Beam",
      trigger: "Telegraphed after an echoing roar and core charge sequence",
      description: "Channels a concentrated high-energy thermal beam over 40 ticks, firing across a 36-block line-of-sight vector. The beam completely disintegrates all destructible blocks in its trajectory, igniting victims and dealing lethal tick-based damage.",
      category: "Destructive Ranged"
    },
    {
      title: "Post-Beam Core Exhaustion",
      trigger: "Immediately following a complete Vaporize Beam discharge",
      description: "Discharging the vaporize beam overloads and temporarily depletes the Woodweaver's core, leaving it stunned, grounded, and completely immobile for 60 ticks (3.0s). This represents the primary vulnerability window for players to deal massive counter-damage.",
      category: "Vulnerability Window"
    },
    {
      title: "Ramming Dash & Terrain Bulldozer",
      trigger: "Target flees beyond melee reach or takes cover behind blocks",
      description: "Launches into a high-speed charge (0.42 speed) directly toward the target, bulldozing straight through wooden blocks, fences, and natural foliage, closing gaps instantly and crushing obstructed targets.",
      category: "Mobility & Breach"
    },
    {
      title: "Claw Sweeps & Shield Breaker",
      trigger: "Close-quarters combat (<4 blocks)",
      description: "Unleashes rapid 3-hit horizontal and vertical claw cleaves dealing 24-36 damage. Attacks shatter active player shield guards for 100 ticks (5.0s) and knock players backward.",
      category: "Melee Assault"
    },
    {
      title: "Combustion Wave",
      trigger: "Target holding shield guard or hiding behind non-wood cover",
      description: "Superheats the surrounding atmosphere with intense thermal radiation, bypassing shields and wall cover to ignite all targets within an 8-block radius.",
      category: "Elemental & Shield Bypass"
    }
  ];

  const toggleAbility = (idx: number) => {
    setOpenAbilityIndex(openAbilityIndex === idx ? null : idx);
  };

  const toggleAshWeaverAbility = (idx: number) => {
    setOpenAshWeaverAbilityIndex(openAshWeaverAbilityIndex === idx ? null : idx);
  };

  // Sync with Table of Contents clicks
  useEffect(() => {
    const handleHeadingClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      const targetId = customEvent.detail.id;
      
      const matched = entities.find(entity => {
        const normalizedTarget = targetId.toLowerCase().replace(/-/g, '_');
        const normalizedId = entity.id.toLowerCase();
        
        if (normalizedTarget === normalizedId) return true;
        if (normalizedTarget.includes(normalizedId)) return true;
        if (normalizedId === 'splinter' && normalizedTarget === 'the_splinter') return true;
        if (normalizedId === 'rot' && normalizedTarget === 'the_rot') return true;
        if (normalizedId === 'hollow' && normalizedTarget === 'the_hollow') return true;
        if (normalizedId === 'ash_weaver' && normalizedTarget === 'the_ash_weaver') return true;
        if (normalizedId === 'petrified_splinter' && normalizedTarget === 'petrified_log_splinter') return true;
        return false;
      });

      if (matched) {
        setSelectedEntity(matched.id);
        setSearchQuery('');
      }
    };
    window.addEventListener('wiki-scroll-to-heading', handleHeadingClick);
    return () => window.removeEventListener('wiki-scroll-to-heading', handleHeadingClick);
  }, [entities]);

  const getAbilitiesForEntity = (entityId: string): Ability[] => {
    switch (entityId) {
      case 'rot': return rotAbilities;
      case 'woodweaver': return woodweaverAbilities;
      case 'splinter':
      case 'log_splinter':
      case 'petrified_splinter': return splinterAbilities;
      case 'blindspot_splinter': return blindspotAbilities;
      case 'ash_weaver': return ashWeaverAbilities;
      case 'lignum_gigas': return lignumGigasAbilities;
      case 'verdant_engine': return verdantEngineAbilities;
      default: return [];
    }
  };

  const getEntityExtraKeywords = (entityId: string): string => {
    switch (entityId) {
      case 'stilt_walker':
        return 'Spawn Grace Protection System 20 ticks 1s 60 ticks 3s stalk cycle predictive dodging immune damage';
      case 'ash_weaver':
        return 'Botanical Symbiote The Thicket companion trust familiarity fear hiding peeking roses warnings portal travel home cave campsite watchtower doors chat commands';
      case 'fractus':
      case 'fractus_prime':
        return 'Tractor beam grip escape energy sphere burst echolocation network sub-terranean fortification sonar acoustic radar concussive shockwave';
      case 'splinter':
        return 'Angel Stalker evacuation aging shared hivemind learning projectile cover aim weaving coalescence death loot sticks ash rose flower pot';
      case 'log_splinter':
      case 'blindspot_splinter':
      case 'petrified_splinter':
        return 'Decay shared hivemind learning cover projectile immunity afterimages invisible flank surround coalescence sticks planks logs flower pot';
      case 'lignum_palus':
        return 'Architectural mimicry gaze hypnosis flashing particle aura grid-aligned teleportation Y=20 Y=46 subterranean';
      case 'lignum_vermis':
        return 'Tunneling subterranean burrowing earth tremor ambush';
      case 'hewn_splinter':
        return 'Static wooden effigy projectile arrow immunity fluid pushes falling anvils invulnerability';
      case 'woodweaver':
        return 'The Grain dormant stalker emergency smoke screen gaze evasion dread accumulation cellular collapse vaporize beam core exhaustion ramming dash combustion wave';
      case 'rot':
        return 'Alpha Threat Sentinel 96-node synthetic neural array superheater armor choke sonic boom acoustic shockwave rider kick aerial martial strikes mace dive cellular surge multi-agent swarm boss immunity override';
      case 'verdant_engine':
        return 'Spacetime anomaly 2500 HP reality anchoring gravitational collapse singularity pulses';
      case 'lignum_gigas':
        return 'Colossal kinetic stomp ancient bark armor ground pound shockwave forest resonance anchored';
      case 'kyne_splinter':
        return 'Erratic movement high agility';
      case 'dorceless_splinter':
        return 'Heavy armored plating plodding gait';
      case 'hollow':
        return 'Phase-shifting spruce biped explosions drowning';
      case 'lignum_spina':
      case 'petrified_lignum_spina':
        return 'Thorns reflection sweet berry thorns damage Y=50 upper forest';
      case 'lignum_echinus':
      case 'petrified_lignum_echinus':
        return 'Spikes sweet berry thorns damage';
      case 'lignum_trilobita':
      case 'petrified_lignum_trilobita':
        return 'Suffocation resistance falling anvils';
      default:
        return '';
    }
  };

  const sortedEntities = React.useMemo(() => {
    if (sortBy === 'default') return entities;
    return [...entities].sort((a, b) => {
      const valA = THREAT_VALUES[a.threatLevel] || 0;
      const valB = THREAT_VALUES[b.threatLevel] || 0;
      return sortBy === 'threat-asc' ? valA - valB : valB - valA;
    });
  }, [sortBy, entities]);

  const filteredEntities = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedEntities;

    const queryWords = query.split(/\s+/).filter(Boolean);

    const matches: { entity: EntityProfile; score: number; matchReason: string }[] = [];

    for (const entity of sortedEntities) {
      const abilities = getAbilitiesForEntity(entity.id);
      const immunities = ENTITY_IMMUNITIES[entity.id] || [];
      const extraKeywords = getEntityExtraKeywords(entity.id);
      const abilityString = abilities.map(a => `${a.title} ${a.trigger} ${a.description} ${a.category}`).join(' ');
      const immunityString = immunities.join(' ');

      const combinedText = [
        entity.id,
        entity.name,
        entity.title,
        entity.aka || '',
        entity.threatLevel,
        entity.hp,
        entity.damage,
        entity.armor,
        entity.speed,
        entity.dim,
        entity.desc,
        immunityString,
        abilityString,
        extraKeywords
      ].join(' ').toLowerCase();

      const allWordsMatch = queryWords.every(w => combinedText.includes(w));
      if (!allWordsMatch) continue;

      let score = 0;
      let matchReason = '';

      const nameLower = entity.name.toLowerCase();
      const idLower = entity.id.toLowerCase();
      const titleLower = entity.title.toLowerCase();
      const akaLower = (entity.aka || '').toLowerCase();

      if (idLower === query) {
        score += 1000;
        matchReason = 'Exact ID';
      } else if (nameLower === query) {
        score += 800;
        matchReason = 'Exact Name';
      } else if (nameLower.startsWith(query)) {
        score += 500;
        matchReason = 'Name Match';
      } else if (nameLower.includes(query)) {
        score += 300;
        matchReason = 'Name Match';
      } else if (akaLower.includes(query)) {
        score += 250;
        matchReason = `AKA: ${entity.aka}`;
      } else if (titleLower.includes(query)) {
        score += 200;
        matchReason = entity.title;
      } else {
        const foundAbility = abilities.find(a => 
          a.title.toLowerCase().includes(query) || 
          a.category.toLowerCase().includes(query) || 
          a.description.toLowerCase().includes(query) ||
          a.trigger.toLowerCase().includes(query)
        );
        if (foundAbility) {
          score += 150;
          matchReason = `Ability: ${foundAbility.title}`;
        } else {
          const foundImmunity = immunities.find(imm => imm.toLowerCase().includes(query));
          if (foundImmunity) {
            score += 130;
            matchReason = `Immunity: ${foundImmunity}`;
          } else if (entity.threatLevel.toLowerCase().includes(query)) {
            score += 110;
            matchReason = `Threat: ${entity.threatLevel}`;
          } else if (entity.dim.toLowerCase().includes(query)) {
            score += 90;
            matchReason = `Habitat / Dim`;
          } else if (entity.hp.toLowerCase().includes(query) || entity.damage.toLowerCase().includes(query)) {
            score += 80;
            matchReason = `Combat Stat`;
          } else {
            score += 40;
            matchReason = `Dossier Content`;
          }
        }
      }

      matches.push({ entity, score, matchReason });
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.map(m => ({ ...m.entity, _matchReason: m.matchReason }));
  }, [searchQuery, sortedEntities]);

  // Auto-select the top matching entity when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) return;
    if (filteredEntities.length > 0) {
      const topEntity = filteredEntities[0];
      setSelectedEntity(topEntity.id);

      const query = searchQuery.trim().toLowerCase();
      const abilities = getAbilitiesForEntity(topEntity.id);
      const matchedAbilityIdx = abilities.findIndex(a => 
        a.title.toLowerCase().includes(query) || 
        a.description.toLowerCase().includes(query) || 
        a.category.toLowerCase().includes(query) ||
        a.trigger.toLowerCase().includes(query)
      );

      if (matchedAbilityIdx !== -1) {
        if (topEntity.id === 'ash_weaver') {
          setOpenAshWeaverAbilityIndex(matchedAbilityIdx);
        } else {
          setOpenAbilityIndex(matchedAbilityIdx);
        }
      } else {
        setOpenAbilityIndex(0);
        setOpenAshWeaverAbilityIndex(0);
      }
    }
  }, [searchQuery]);

  const currentEntity = entities.find(e => e.id === selectedEntity) || entities[0];

  return (
    <div className="space-y-8 select-text">
      
      {/* Intro section */}
      <div className="p-5 bg-[#0f1210] border border-[#1c241e] rounded-lg">
        <p className="text-sm text-[#c9d1c9] leading-relaxed">
          The Backwoods environment is populated by highly aggressive, adaptive organisms. This dossier provides classified intelligence, operational mechanics, and behavioral logic for all documented entities.
        </p>
      </div>

      {/* SENSOR INTERFERENCE & F3 COORDINATE OBFUSCATION */}
      <UpdatedFrame id="entity_sensor_interference" isUpdated={true}>
        <div className="p-5 bg-[#0e120f] border border-[#223326] rounded-xl space-y-3 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c291f] pb-3">
            <div className="flex items-center gap-2 text-[#709978] font-mono text-xs uppercase font-bold tracking-wider">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Sensory Distortion: Proximity Interference & F3 Obfuscation</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#142018] border border-[#284030] text-emerald-300 self-start sm:self-auto">
              24-BLOCK PROXIMITY FIELD
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#c9d1c9] leading-relaxed">
            Approaching within <strong className="text-white">24 blocks</strong> of anomalous Backwoods organisms actively jams navigational tools and telemetry overlays to prevent coordinate evading:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-[#0a0d0b] border border-[#1a251c] rounded-lg space-y-1.5">
              <div className="font-serif text-xs font-bold text-[#e0e7e0] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Compass Needle Instability</span>
              </div>
              <p className="text-xs text-[#829285] leading-relaxed pl-3.5">
                The compass needle oscillates and twitches violently away from world spawn, spinning with velocity proportional to creature distance. Apex organisms (The Rot, Lignum Gigas, and Fractus Prime) amplify this distortion up to 1.8x.
              </p>
            </div>

            <div className="p-3.5 bg-[#0a0d0b] border border-[#1a251c] rounded-lg space-y-1.5">
              <div className="font-serif text-xs font-bold text-[#e0e7e0] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>F3 Debug Screen Scrambling</span>
              </div>
              <p className="text-xs text-[#829285] leading-relaxed pl-3.5">
                Coordinates and situational data in the F3 debug screen are dynamically scrambled into shifting gibberish. At moderate proximity, XYZ coordinates, Block, Chunk, Facing direction, Biome, and entity count are scrambled; at close contact, the entire overlay is obscured.
              </p>
            </div>
          </div>
        </div>
      </UpdatedFrame>

      {/* Main Grid: Sidebar + Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Selector */}
        <div className="lg:col-span-4 space-y-3">
          {/* Entity Search Bar */}
          <UpdatedFrame id="entity_search_module" isUpdated={true}>
            <div className="p-3 bg-[#0a0d0b] border border-[#1b251d] rounded-lg space-y-2 shadow-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#5a6b5e]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entities, abilities, stats..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#050705] border border-[#172019] text-[#c9d1c9] rounded-md focus:outline-none focus:border-[#709978] placeholder-[#445247] transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-[#5a6b5e] hover:text-[#e0e7e0] p-0.5 rounded transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#5a6b5e]">
                <span>
                  {searchQuery.trim() ? (
                    <span className="text-emerald-400 font-semibold">
                      {filteredEntities.length} matching {filteredEntities.length === 1 ? 'entity' : 'entities'}
                    </span>
                  ) : (
                    <span>{entities.length} documented organisms</span>
                  )}
                </span>
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[#709978] hover:text-[#a9d1b0] underline cursor-pointer text-[9px]"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </UpdatedFrame>

          <div className="flex items-center justify-between pt-1">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#5a6b5e]">Threat Database Index</h4>
            <button 
              onClick={() => {
                setSortBy(prev => prev === 'default' ? 'threat-asc' : prev === 'threat-asc' ? 'threat-desc' : 'default');
              }}
              className="flex items-center gap-1 text-[9px] font-mono px-2 py-1 bg-[#0a0c0a] hover:bg-[#121612] text-[#829285] hover:text-[#e0e7e0] border border-[#161c17] rounded transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3 h-3 text-[#709978]" />
              <span>
                {sortBy === 'default' ? 'Default' : sortBy === 'threat-asc' ? 'Threat: Low→High' : 'Threat: High→Low'}
              </span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-[420px] lg:max-h-none overflow-y-auto pr-1 scrollbar-thin">
            {filteredEntities.length === 0 ? (
              <div className="p-4 bg-[#0a0c0a] border border-[#1a221c] rounded-lg text-center space-y-2">
                <p className="text-xs text-[#829285] font-mono">
                  No organisms found matching "<span className="text-white">{searchQuery}</span>"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 text-[10px] font-mono bg-[#111712] hover:bg-[#18221a] text-[#709978] border border-[#213024] rounded cursor-pointer"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              filteredEntities.map(e => (
                <div key={e.id}>
                  <UpdatedFrame id={`entity_btn_${e.id}`} isUpdated={!!e.isUpdated}>
                    <button
                      onClick={() => handleEntitySelect(e.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md border transition-all shrink-0 lg:shrink cursor-pointer flex flex-col justify-between ${
                        selectedEntity === e.id
                          ? 'bg-gradient-to-r from-red-950/30 to-zinc-900 text-[#e0e7e0] border-red-900/40 font-semibold shadow-md'
                          : 'bg-[#0a0c0a] hover:bg-[#121612] text-[#829285] border-[#161c17]'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-serif text-xs text-[#e0e7e0] flex items-center gap-1">
                          {e.name}
                        </span>
                        <span className={`text-[7px] font-mono uppercase px-1 py-0.5 rounded ${getThreatBadgeStyle(e.threatLevel)}`}>
                          {e.threatLevel}
                        </span>
                      </div>
                      <div className="text-[9px] text-[#5a6b5e] font-mono mt-0.5 italic leading-tight flex items-center justify-between gap-1">
                        <span className="truncate">{e.title}</span>
                        {searchQuery.trim() && e._matchReason && (
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1 py-0.2 rounded shrink-0 not-italic">
                            {e._matchReason}
                          </span>
                        )}
                      </div>
                    </button>
                  </UpdatedFrame>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detailed Profile Panel */}
        <div className="lg:col-span-8 p-6 bg-[#0c0e0c] border border-[#1d251e] rounded-xl relative overflow-hidden space-y-6">
          
          {/* Accent glow */}
          <div className="absolute right-0 top-0 w-36 h-36 bg-red-950/10 blur-3xl rounded-full pointer-events-none" />

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1a221c]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5a6b5e]">Entity Profile</span>
              <h3 
                onClick={() => handleEntitySelect(currentEntity.id)}
                className="font-serif text-2xl sm:text-3xl font-extrabold text-[#e0e7e0] mt-1 cursor-pointer select-none hover:text-red-400 transition-colors"
                title={currentEntity.id === 'rot' ? 'The Rot Mindspace' : undefined}
              >
                {currentEntity.name}
              </h3>
              {currentEntity.aka && (
                <div className="text-[10px] font-mono text-red-400 mt-0.5">
                  <span className="text-[#5a6b5e]">AKA: </span>{currentEntity.aka}
                </div>
              )}
              <p className="text-xs text-[#709978] font-mono mt-0.5">{currentEntity.title}</p>
            </div>
            <div className="shrink-0">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${getThreatBadgeStyle(currentEntity.threatLevel)}`}>
                <Skull className="w-3.5 h-3.5 animate-pulse" />
                {currentEntity.threatLevel} Threat
              </span>
            </div>
          </div>

          {/* Interactive 3D Model Viewer */}
          {(() => {
            const modelConfig = ENTITY_MODELS[currentEntity.id] || { modelUrl: '', textureUrl: '' };
            return (
              <ModelViewer
                modelUrl={modelConfig.modelUrl}
                textureUrl={modelConfig.textureUrl}
                entityId={currentEntity.id}
                entityName={currentEntity.name}
              />
            );
          })()}

          {/* Attributes Table Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#080908] rounded-lg border border-[#161d17] font-mono text-xs">
            <div>
              <div className="text-[#5a6b5e] text-[10px] uppercase">Vital HP</div>
              <div className="text-[#c9d1c9] font-bold mt-0.5">{currentEntity.hp}</div>
            </div>
            <div>
              <div className="text-[#5a6b5e] text-[10px] uppercase">Attack Damage</div>
              <div className="text-red-400 font-bold mt-0.5">{currentEntity.damage}</div>
            </div>
            <div>
              <div className="text-[#5a6b5e] text-[10px] uppercase">Armor Points</div>
              <div className="text-[#a9d1b0] font-bold mt-0.5">{currentEntity.armor}</div>
            </div>
            <div>
              <div className="text-[#5a6b5e] text-[10px] uppercase">Move Speed</div>
              <div className="text-amber-400 font-bold mt-0.5">{currentEntity.speed}</div>
            </div>
          </div>

          {/* Description & Location */}
          <div className="space-y-3">
            <p className="text-sm text-[#c9d1c9] leading-relaxed">{currentEntity.desc}</p>
            
            <div className="p-3 bg-[#111512] border-l-2 border-[#709978] rounded-r-lg">
              <div className="text-[9px] font-mono uppercase text-[#5a6b5e]">Primary Habitat / Spawning Sector</div>
              <div className="text-xs text-[#a9d1b0] mt-0.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                {currentEntity.dim}
              </div>
            </div>
          </div>

          {/* Passive Attributes & Damage Immunities */}
          {ENTITY_IMMUNITIES[currentEntity.id] && (
            <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
              <h5 className="font-serif text-sm font-bold text-[#709978] mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-500" />
                Passive Attributes & Damage Immunities
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-center">
                {ENTITY_IMMUNITIES[currentEntity.id].map((immunity, idx) => (
                  <div key={idx} className="p-2 bg-[#0c0f0d] border border-[#1b231c] rounded">
                    <div className="text-[9px] text-[#5a6b5e] uppercase tracking-wider font-mono">{immunity}</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">IMMUNE</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC SECTIONS BASED ON SELECTED ENTITY */}
          
          {/* THE ROT: Custom mechanics */}
          {currentEntity.id === 'rot' && (
            <UpdatedFrame id="rot_updated_1_21_1" isUpdated={true}>
              <div className="space-y-6 pt-2">
                {/* Abilities Accordion */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-red-500 font-bold">
                  Abilities Dossier (Click to expand details)
                </h4>
                
                <div className="space-y-2">
                  {rotAbilities.map((ab, idx) => {
                    const isOpen = openAbilityIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className="bg-[#120c0c] border border-red-950/20 hover:border-red-900/30 rounded-lg transition-all"
                      >
                        <button
                          onClick={() => toggleAbility(idx)}
                          className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-red-400 bg-red-950/30 border border-red-900/40 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                              {ab.category}
                            </span>
                            <span className="font-serif text-xs sm:text-sm font-bold text-[#e0e7e0] hover:text-red-400 transition-colors">
                              {ab.title}
                            </span>
                          </div>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-[#5a6b5e]" /> : <ChevronDown className="w-4 h-4 text-[#5a6b5e]" />}
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-xs text-[#8c8779] border-t border-red-950/20 space-y-2">
                            <div className="flex items-center gap-1 text-[10px] font-mono text-amber-500">
                              <Zap className="w-3.5 h-3.5" />
                              <span>Trigger Rule: {ab.trigger}</span>
                            </div>
                            <p className="leading-relaxed pl-1">{ab.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totem switcher */}
              <div className="space-y-4 pt-4 border-t border-red-950/20">
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-red-500 font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-red-400" />
                    Totem Overload Integration
                  </h4>
                  <p className="text-xs text-[#829285] leading-relaxed mt-1">
                    Detects an equipped Totem of Undying within 12 blocks. If allowed to close distance, it removes the totem over a multi-second sequence and destroys it, permanently upgrading itself in the process. This cannot be reversed. Do not let it close that distance.
                  </p>
                </div>

                <div className="flex bg-[#070505] p-1 rounded-lg border border-red-950/30 max-w-md select-none">
                  {[
                    { id: 'dormant', label: 'Dormant State' },
                    { id: 'empowered', label: 'Standard Totem' },
                    { id: 'infinity', label: 'Infinity Totem' }
                  ].map((state) => (
                    <button
                      key={state.id}
                      onClick={() => setActiveTotemState(state.id as any)}
                      className={`flex-1 text-center py-1.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer uppercase ${
                        activeTotemState === state.id
                          ? 'bg-red-950 text-red-200 border border-red-900/40'
                          : 'text-[#5a6b5e] hover:text-[#829285]'
                      }`}
                    >
                      {state.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-[#110b0b] border border-red-950/30 rounded-xl">
                  {activeTotemState === 'dormant' && (
                    <div className="space-y-1.5">
                      <h5 className="font-serif text-sm font-bold text-[#c9d1c9] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5a6b5e]" />
                        Active Scan Protocol (Default)
                      </h5>
                      <p className="text-xs text-[#8c8779] leading-relaxed">
                        Baseline configuration. 550 HP, standard cooldown timing, no elevated attributes. Still lethal. Totems remain safe only as long as you keep it outside the 12-block detection range.
                      </p>
                    </div>
                  )}

                  {activeTotemState === 'empowered' && (
                    <div className="space-y-2">
                      <h5 className="font-serif text-sm font-bold text-amber-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Standard Totem (Empowered State)
                      </h5>
                      <p className="text-xs text-[#8c8779] leading-relaxed">
                        Permanent upgrade, triggered once a totem is destroyed. Does not expire.
                      </p>
                      <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed">
                        <li><strong className="text-[#e0e7e0]">+50% Attack Damage</strong>, <strong className="text-[#e0e7e0]">+12.5% Movement Speed</strong>.</li>
                        <li>All action cooldowns roughly halved.</li>
                        <li>85% chance for a landed melee hit to chain directly into a follow-up attack.</li>
                        <li>Melee attacks now break blocks behind the target — walls no longer provide cover.</li>
                        <li>Heavy impacts generate ground shockwaves with knockback and blast damage.</li>
                        <li>Grapple holds require significantly more hits to break free from.</li>
                        <li>Shockwave ability damage and knockback are substantially increased.</li>
                      </ul>
                    </div>
                  )}

                  {activeTotemState === 'infinity' && (
                    <div className="space-y-2">
                      <h5 className="font-serif text-sm font-bold text-red-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Infinity Totem (Absolute Limit State)
                      </h5>
                      <p className="text-xs text-[#8c8779] leading-relaxed">
                        Requires an Infinity Totem — reachable via cross-mod compatibility with the <a href="https://www.curseforge.com/minecraft/mc-mods/re-avaritia" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline font-medium">Avaritia</a> mod. Effectively a permanent, uncappable version of the empowered state.
                      </p>
                      <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed">
                        <li>All Standard Totem bonuses apply, permanently, with no decay.</li>
                        <li>Continuous passive healing that outpaces most sustained damage.</li>
                        <li>Cannot be stripped or reverted by any known method.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Survivor lore intercept */}
              <div className="pt-4 border-t border-red-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-red-400" />
                    Survivor Log Intercepts
                  </h4>
                  <span className="text-[10px] text-red-400/70 font-mono">
                    LOG {activeRotLog + 1} OF 4
                  </span>
                </div>

                {/* Log Selection Tabs */}
                <div className="flex flex-wrap gap-1 bg-[#060404] p-1 rounded-lg border border-red-950/30">
                  {[
                    "AP-04 TOTEM OVERLOAD",
                    "AP-09 GEAR STRIPPING",
                    "AP-12 THERMAL SHOCK",
                    "AP-15 LEGEND TRAP"
                  ].map((logTitle, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveRotLog(idx)}
                      className={`px-2 py-1 text-[9px] font-mono font-bold rounded transition-all cursor-pointer uppercase ${
                        activeRotLog === idx
                          ? 'bg-red-950/60 text-red-300 border border-red-900/40'
                          : 'text-[#5a6b5e] hover:text-[#829285]'
                      }`}
                    >
                      {logTitle.split(" ")[0]}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-[#0d0707] border border-red-950/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-red-950/10 pb-1.5">
                    <span className="text-amber-500 font-bold">
                      {[
                        "AP-04 TOTEM OVERLOAD",
                        "AP-09 GEAR STRIPPING",
                        "AP-12 THERMAL SHOCK",
                        "AP-15 LEGEND TRAP"
                      ][activeRotLog]}
                    </span>
                    <span className="text-[#5a6b5e]">SOURCE: DECRYPTED TRANSMISSION</span>
                  </div>
                  <p className="text-xs text-[#8c8779] leading-relaxed italic">
                    {[
                      `"I critical-struck it with maxed Netherite gear, but the horror adapted right before my eyes. Its skin hardened, my sword bounced off. It shredded through my obsidian walls like paper. Then, it grabbed the Totem of Undying directly out of my hand, crushed it, and absorbed the particles to empower itself. I survived only by crawling into a rock fissure..."`,
                      `"Do not trust your armor. It doesn't just hit you—it strips away your safety. I was backed into a ravine wall, completely immobilized by a sudden, heavy pressure in the air that made it feel like gravity had tripled. It reached out, and with a horrifying, metallic screech, it tore my iron chestplate clean off my body like it was wet paper. I didn't even feel a blade; it just dismantled my protection in a second. I had to ditch the rest of my gear and squeeze into a one-block crawlspace just to escape."`,
                      `"My skin is still blistering. It manipulates the air around you to torture your senses. First, a wave of absolute, biting frost hit me, freezing the breath in my throat and locking up my joints so I couldn't run. The moment the ice took hold, the atmosphere instantly flipped to a blinding, searing heat. The sudden shock of going from sub-zero to boiling cracked my shield right down the middle. If I hadn't dug frantically into the dirt to bury myself, I would have been ash."`,
                      `"I tried to play dirty. I brought three Wither skulls down into the thick of the trees, thinking I could let two monsters destroy each other. It was an insult to the thing. It didn't even flinch at the decay. It met the beast head-on, shattering its skulls with consecutive, deafening strikes that sounded like thunderclaps. Then, it let out a localized scream so violent it shook the valley and blew out my eardrums—a terrifying echo of the deep dark, weaponized in the open air. The woods don't belong to the old legends anymore."`
                    ][activeRotLog]}
                  </p>
                </div>
              </div>
            </div>
          </UpdatedFrame>
          )}

          {/* THE WOODWEAVER: Custom mechanics */}
          {currentEntity.id === 'woodweaver' && (
            <UpdatedFrame id="woodweaver_custom_dossier" isUpdated={true}>
              <div className="space-y-6 pt-2">
                {/* Abilities Accordion */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#c08e91]" />
                    Behavioral &amp; Combat Dossier (Click to expand details)
                  </h4>
                  
                  <div className="space-y-2">
                    {woodweaverAbilities.map((ab, idx) => {
                      const isOpen = openAbilityIndex === idx;
                      return (
                        <div 
                          key={idx} 
                          className="bg-[#120c0c] border border-[#301618]/20 hover:border-[#4d2427]/30 rounded-lg transition-all"
                        >
                          <button
                            onClick={() => toggleAbility(idx)}
                            className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-[#c08e91] bg-[#241315]/30 border border-[#4d2427]/40 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                                {ab.category}
                              </span>
                              <span className="font-serif text-xs sm:text-sm font-bold text-[#e0e7e0] hover:text-[#c08e91] transition-colors">
                                {ab.title}
                              </span>
                            </div>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-[#5a6b5e]" /> : <ChevronDown className="w-4 h-4 text-[#5a6b5e]" />}
                          </button>
                          
                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 text-xs text-[#8c8779] border-t border-[#301618]/20 space-y-2">
                              <div className="flex items-center gap-1 text-[10px] font-mono text-amber-500">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Trigger Condition: {ab.trigger}</span>
                              </div>
                              <p className="leading-relaxed pl-1">{ab.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* State / Phase Matrix Switcher */}
                <div className="space-y-4 pt-4 border-t border-[#301618]/20">
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#c08e91]" />
                      Boss Phase &amp; State Matrix
                    </h4>
                    <p className="text-xs text-[#829285] leading-relaxed mt-1">
                      The Woodweaver transitions through distinct behavioral states governed by player distance, visual engagement angles, internal Dread accumulation, and core stability metrics.
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap bg-[#070505] p-1 rounded-lg border border-[#301618]/30 max-w-xl select-none gap-1">
                    {[
                      { id: 'dormant', label: '1. Dormant Stalker' },
                      { id: 'combat', label: '2. Awakened Combat' },
                      { id: 'beam', label: '3. Vaporize Beam' }
                    ].map((state) => (
                      <button
                        key={state.id}
                        onClick={() => setActiveWoodweaverState(state.id as any)}
                        className={`flex-1 text-center py-1.5 px-2 text-[10px] font-mono font-bold rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                          activeWoodweaverState === state.id
                            ? 'bg-[#241315] text-[#e0b9bb] border border-[#4d2427]/40'
                            : 'text-[#5a6b5e] hover:text-[#829285]'
                        }`}
                      >
                        {state.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-[#110b0b] border border-[#301618]/30 rounded-xl">
                    {activeWoodweaverState === 'dormant' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-[#c9d1c9]">
                          Phase 1: Dormant Stalker &amp; Gaze Evasion
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          Initial passive encounter state. The entity maintains long-distance surveillance (up to 48 blocks) without attacking.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-[#e0e7e0]">Gaze Backstep:</strong> Direct eye contact causes the entity to glide backward smoothly while maintaining eye lock.</li>
                          <li><strong className="text-amber-400">Dread Accumulation:</strong> Eye contact and proximity fill an internal Dread meter at +1.5% per tick.</li>
                          <li><strong className="text-purple-400">Smoke Vanish:</strong> Approaching within 5 blocks causes an instantaneous smoke screen teleport (18-28 blocks away).</li>
                        </ul>
                      </div>
                    )}

                    {activeWoodweaverState === 'combat' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-[#c08e91]">
                          Phase 2: Awakened Aggression &amp; Hypnosis
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          Triggered upon Dread reaching 100% or upon receiving direct player damage. All passive evasion behaviors terminate.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-red-400">Hypnosis Lock:</strong> Sustained eye contact inflicts Slowness IV, Weakness III, and severe camera tilting.</li>
                          <li><strong className="text-purple-400">Cellular Collapse:</strong> Telekinetically suspends targets and siphons health (+4 HP/tick drained back to Woodweaver).</li>
                          <li><strong className="text-amber-400">Terrain Bulldozer:</strong> High-speed charge (0.42) breaks wooden structures, fences, and foliage.</li>
                          <li><strong className="text-emerald-400">Shield Breaker:</strong> 3-hit claw strikes pierce guards, disabling shields for 5 seconds.</li>
                        </ul>
                      </div>
                    )}

                    {activeWoodweaverState === 'beam' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-amber-500">
                          Phase 3: Vaporize Beam &amp; Exhaustion Opening
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          Periodic heavy offensive cycle telegraphed by a loud roar and a glowing core animation.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-red-400">36-Block Thermal Beam:</strong> Channels high-DPS disintegrating beam over 40 ticks, destroying destructible blocks in path.</li>
                          <li><strong className="text-amber-300">Shield Bypass:</strong> Ignores active player shield blocks and inflicts direct fire damage.</li>
                          <li><strong className="text-emerald-400">Critical Exhaustion Opening:</strong> Firing exhausts the core, rendering the Woodweaver completely stunned for 60 ticks (3.0s).</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spawning & Spatial Requirements */}
                <div className="p-4 bg-[#0d0707] border border-[#301618]/40 rounded-lg space-y-2">
                  <h5 className="font-serif text-sm font-bold text-[#c08e91] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#b2797c]" />
                    Spawning Parameters (The Grain)
                  </h5>
                  <ul className="text-xs text-[#8c8779] list-disc pl-4 space-y-1 leading-relaxed">
                    <li><strong className="text-[#e0e7e0]">Native Realm:</strong> Generates exclusively within <strong className="text-[#cfa4a6]">The Grain</strong> dimension.</li>
                    <li><strong className="text-[#e0e7e0]">Spawn Chance &amp; Isolation:</strong> Governed by a 20% natural spawn roll.</li>
                    <li><strong className="text-[#e0e7e0]">Spatial Separation:</strong> Enforces a strict <strong className="text-white">256-block exclusion radius</strong> (512-block bounding box) from any other existing Woodweaver.</li>
                    <li><strong className="text-[#e0e7e0]">Player Clearance:</strong> Cannot spawn within <strong className="text-white">32 blocks</strong> of any player and requires solid occluding ground beneath its base.</li>
                  </ul>
                </div>
              </div>
            </UpdatedFrame>
          )}

          {/* THE SPLINTER: Custom mechanics */}
          {currentEntity.id === 'splinter' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-[#e0e7e0] mb-2">AI Personality Profiles</h5>
                  <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4">
                    <li><strong className="text-[#c9d1c9]">Stalker / Hunt Profile:</strong> Cycles between Silent (watching, motionless), Stalk (keeping distance, breaking sight), and Hunt (direct pursuit) phases.</li>
                    <li><strong className="text-[#c9d1c9]">Angel Profile:</strong> Aggressively moves toward player when unwatched; freezes instantly on eye contact.</li>
                  </ul>
                </div>
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-[#e0e7e0] mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-[#c28b40]" />
                    The Rage Mechanic
                  </h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Staring at a Splinter for too long triggers a sudden state of <strong className="text-[#c28b40]">rage</strong>, overriding its freeze behavior. Striking the entity decreases this sight threshold, provoking enrage reactions progressively faster.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#120e09] border border-[#3d2a0d]/20 rounded-lg space-y-1.5">
                <h5 className="font-serif text-sm font-bold text-[#d1a851]">Kinship Alarm (On Death)</h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  Upon death, a Splinter broadcasts a panic wave that forces all woodbound entities within range into an enraged hunt state for <strong className="text-[#e7c787] font-mono">600 ticks (30s)</strong>. The alert radius dynamically scales with game difficulty:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono text-[10px] text-center text-[#829285]">
                  <div className="p-2 bg-[#090705] rounded border border-[#231a0e]/40">Easy: <strong className="text-[#5ea386]">28 blocks</strong></div>
                  <div className="p-2 bg-[#090705] rounded border border-[#231a0e]/40">Normal: <strong className="text-[#d1a851]">40 blocks</strong></div>
                  <div className="p-2 bg-[#090705] rounded border border-[#231a0e]/40">Hard: <strong className="text-amber-500">90 blocks</strong></div>
                  <div className="p-2 bg-[#090705] rounded border border-[#231a0e]/40">Hardcore: <strong className="text-red-400">160 blocks</strong></div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Environmental Hazards & Navigation</h5>
                <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4 leading-relaxed">
                  <li><strong className="text-[#c9d1c9]">Adaptive Navigation:</strong> If you build up, it builds blocks upward. If you cross a gorge, it bridges across. Mines dividing terrain blockades (slower for high hardness materials).</li>
                  <li><strong className="text-[#aa8bc9]">Dimensional Pull:</strong> A rare subset (10%) carry a 10% chance per hit to drag the victim directly into <strong className="text-[#c2afd6] font-bold">The Grain</strong>.</li>
                  <li><strong className="text-[#5ea386]">Ash-Rose Vulnerability:</strong> Holding an Ash-Rose can halt these hunters; a nearby planted or potted rose can also freeze them while its ward remains active.</li>
                </ul>
              </div>

              {/* Exclusion Zones table */}
              <div className="space-y-2 pt-2">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Exclusion Zone Compression</h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  To prevent overcrowding, safe coordinates are maintained around existing spawns. These boundaries compress as world progression ticks accrue:
                </p>
                <div className="overflow-hidden rounded border border-[#1c241e] text-xs font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#121713] text-[#5a6b5e] border-b border-[#1c241e]">
                        <th className="p-2">Progression Ticks</th>
                        <th className="p-2 text-center">System Radius</th>
                        <th className="p-2 text-right">Clear Volume Area Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#151c16] text-[#8c8779]">
                      <tr>
                        <td className="p-2">0 - 4,000</td>
                        <td className="p-2 text-center">128</td>
                        <td className="p-2 text-right text-[#5ea386]">64 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2">4,001 - 7,500</td>
                        <td className="p-2 text-center">112</td>
                        <td className="p-2 text-right">56 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2">7,501 - 11,000</td>
                        <td className="p-2 text-center">96</td>
                        <td className="p-2 text-right">48 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2">11,001 - 17,000</td>
                        <td className="p-2 text-center">72</td>
                        <td className="p-2 text-right">36 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2">17,001 - 20,000</td>
                        <td className="p-2 text-center">48</td>
                        <td className="p-2 text-right text-[#c28b40]">24 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-red-400">20,001+ Ticks</td>
                        <td className="p-2 text-center font-bold text-red-400">32</td>
                        <td className="p-2 text-right text-red-400 font-bold">16 Blocks (Critical Swarming)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loot Drops */}
              <div className="space-y-2 pt-2">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Loot Drops</h5>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2 py-1 bg-[#101311] border border-[#1a221c] rounded text-[#8c8779]">Stick: <strong>42.86%</strong></span>
                  <span className="px-2 py-1 bg-[#101311] border border-[#1a221c] rounded text-[#8c8779]">Seep: <strong>9.52%</strong></span>
                  <span className="px-2 py-1 bg-[#121613] border border-[#1f2820] rounded text-[#a9d1b0]">Splinter Shard: <strong>4.76%</strong></span>
                  <span className="px-2 py-1 bg-[#101311] border border-[#1a221c] rounded text-zinc-500">Nothing: <strong>42.86%</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* SPLINTER AGING & DECAY MECHANICS (Shared across woodbound entities) */}
          {['splinter', 'log_splinter', 'blindspot_splinter'].includes(currentEntity.id) && (
            <div className="pt-4 border-t border-[#1a221c]">
              <UpdatedFrame id="splinter_aging_decay_mechanics" isUpdated={true}>
                <div className="p-5 bg-[#0a0c0a] border border-[#232f25] rounded-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-[#709978] animate-spin" style={{ animationDuration: '8s' }} />
                    <h5 className="font-serif text-base font-bold text-[#e0e7e0]">
                      Splinter Aging & Decay Mechanics (<code className="text-[#a9d1b0] text-xs font-mono">DATA_Age</code>)
                    </h5>
                  </div>

                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    All entities within the active Splinter taxonomy (standard Splinter, Log Splinter, and Blindspot Splinter) are woodbound organisms subject to continuous temporal aging (tracked via the internal <code className="text-[#a9d1b0]">DATA_Age</code> counter). As time passes, timber entities weather, fracture, rot, and eventually decompose completely into organic matter. Petrified Log Splinters are fossilized/calcified and immune to this decay process.
                  </p>

                  <div className="space-y-2">
                    <h6 className="text-xs font-mono font-bold uppercase text-[#709978]">Environmental Decay Accelerators</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div className="p-3 bg-[#0d120e] border border-[#1c271e] rounded-lg space-y-1">
                        <div className="text-[#5ea386] font-bold flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 shrink-0" />
                          <span>Water &amp; Rain Exposure</span>
                        </div>
                        <p className="text-[#8c8779] text-[11px] leading-snug font-sans">
                          Submersion or rain exposure rots wood at <strong className="text-[#81caa9]">+9 to +12 ticks/tick</strong> (~10x-12x rate).
                        </p>
                      </div>

                      <div className="p-3 bg-[#140e0a] border border-[#3d2a0d]/30 rounded-lg space-y-1">
                        <div className="text-[#d1a851] font-bold flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 shrink-0" />
                          <span>Fire &amp; Thermal Stress</span>
                        </div>
                        <p className="text-[#8c8779] text-[11px] leading-snug font-sans">
                          Combustion inflicts severe thermal stress at <strong className="text-[#e7c787] font-mono">+14 to +16 ticks/tick</strong> (14x-16x rate).
                        </p>
                      </div>

                      <div className="p-3 bg-[#110f17] border border-[#312542]/30 rounded-lg space-y-1">
                        <div className="text-[#aa8bc9] font-bold flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 shrink-0" />
                          <span>Lightning Strike</span>
                        </div>
                        <p className="text-[#8c8779] text-[11px] leading-snug font-sans">
                          Direct strikes instantly force <strong className="text-[#c2afd6]">+60,000 ticks</strong> (50 mins) of age in a single burst.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h6 className="text-xs font-mono font-bold uppercase text-[#709978]">
                      Decay Stages &amp; Structural Limitations ({currentEntity.id === 'log_splinter' ? 'Log Splinter' : 'Standard/Blindspot'})
                    </h6>
                    <div className="overflow-x-auto rounded border border-[#1c241e]">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-[#121713] text-[#5a6b5e] border-b border-[#1c241e]">
                            <th className="p-2.5">Age Range (Ticks)</th>
                            <th className="p-2.5 text-center">Real-Time</th>
                            <th className="p-2.5">Structural Condition &amp; Behavior</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#151c16] text-[#8c8779]">
                          {(() => {
                            const isLog = currentEntity.id === 'log_splinter';
                            const stages = isLog ? [
                              { range: "0 – 60,000", time: "0 – 50 min", desc: "Fresh heavy log timber. Full speed, block placement, and gap bridging.", color: "text-[#a9d1b0]" },
                              { range: "60,001 – 120,000", time: "50m – 1.6h", desc: "Weathered heavy log state. Subtle log texture darkening.", color: "text-[#c9d1c9]" },
                              { range: "120,001 – 240,000", time: "1.6 – 3.3h", desc: "Cracked wood core. Minor agility penalties applied.", color: "text-[#c9d1c9]" },
                              { range: "360,000 Threshold", time: "5 hrs", desc: "Fractured log. Highly vulnerable to fire stress.", color: "text-[#d1a851]" },
                              { range: "360,001 – 420,000", time: "5 – 5.8h", desc: "Rotting Stage: Severe heartwood decay. Permanently loses building and bridging capabilities.", color: "text-[#c28b40]", bg: "bg-[#221808]/10 text-[#d1a851]" },
                              { range: "420,001 – 480,000", time: "5.8 – 6.67h", desc: "Decomposing state. Drastic speed reduction and structural breakdown.", color: "text-rose-400" },
                              { range: "480,000+ Ticks", time: "6.67+ hrs", desc: "Decomposition (AGE_LAST): Entity dissolves completely into rotten drops and despawns.", color: "text-red-400", bg: "bg-red-950/20 text-red-300 font-bold" }
                            ] : [
                              { range: "0 – 72,000", time: "0 – 1 hr", desc: "Fresh timber. Full speed, block placement, and gap bridging.", color: "text-[#a9d1b0]" },
                              { range: "72,001 – 144,000", time: "1 – 2 hrs", desc: "Weathered state. Subtle surface discoloration.", color: "text-[#c9d1c9]" },
                              { range: "144,001 – 216,000", time: "2 – 3 hrs", desc: "Cracked timber. Minor agility reduction.", color: "text-[#c9d1c9]" },
                              { range: "360,000 Threshold", time: "5 hrs", desc: "Fractured wood. Increased vulnerability to combustion.", color: "text-[#d1a851]" },
                              { range: "360,001 – 432,000", time: "5 – 6 hrs", desc: "Rotting Stage: Timber loses structural integrity. Permanently loses building and bridging capabilities.", color: "text-[#c28b40]", bg: "bg-[#221808]/10 text-[#d1a851]" },
                              { range: "432,001 – 576,000", time: "6 – 8 hrs", desc: "Decomposing state. Severe structural weakness.", color: "text-rose-400" },
                              { range: "648,000+ Ticks", time: "9+ hrs", desc: "Decomposition (AGE_LAST): Entity dissolves completely into rotten drops and despawns.", color: "text-red-400", bg: "bg-red-950/20 text-red-300 font-bold" }
                            ];
                            return stages.map((stage, idx) => (
                              <tr key={idx} className={stage.bg || ""}>
                                <td className={`p-2.5 font-bold ${stage.color}`}>{stage.range}</td>
                                <td className="p-2.5 text-center text-[#5a6b5e]">{stage.time}</td>
                                <td className="p-2.5 font-sans">{stage.desc}</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </UpdatedFrame>
            </div>
          )}

          {/* RANGED THREAT DISCRIMINATION (Shared across the four Splinter variants) */}
          {['splinter', 'log_splinter', 'blindspot_splinter', 'petrified_splinter'].includes(currentEntity.id) && (
            <div className="pt-4 border-t border-[#1a221c]">
              <UpdatedFrame id={`ranged_threat_discrimination_${currentEntity.id}`} isUpdated={true}>
                <div className="p-5 bg-[#0a0c0a] border border-[#232f25] rounded-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#709978]" />
                    <h5 className="font-serif text-base font-bold text-[#e0e7e0]">
                      A Hunter That Learns
                    </h5>
                  </div>

                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Standard, Log, Blindspot, and Petrified Splinters share a memory of each player's habits. Their experience follows that player across the Backwoods realms, and any of the four can teach the others. Vulnerable hunters learn to read incoming shots and build cover; Petrified Splinters rely on their projectile-resistant bodies instead.
                  </p>

                  {currentEntity.id === 'petrified_splinter' ? (
                    <div className="p-3 bg-[#0b0e0c] border border-[#1d2720] rounded-lg space-y-2">
                      <h6 className="font-mono font-bold text-[11px] uppercase text-zinc-300">Hardened Pursuit</h6>
                      <p className="text-xs text-[#8c8779] leading-relaxed">
                        Petrified Splinters still observe their prey and teach the shared hivemind. They do not dodge arrows, weave away from an aimed bow, or build projectile shields. Once enraged, their response is to press into melee, using their hardened bodies to weather the fire. Their usual gaze and Ash-Rose restrictions still apply.
                      </p>
                    </div>
                  ) : (
                    <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#110f0d] border border-[#3d2a0d]/30 rounded-lg space-y-2">
                      <div className="text-[#d1a851] font-bold font-mono text-[11px] uppercase flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Active Lethal Threats Recognized</span>
                      </div>
                      <p className="text-[#8c8779] text-[11px] leading-relaxed font-sans">
                        The entity actively monitors the player hand state and detects projectile threats:
                      </p>
                      <ul className="text-[11px] text-[#8c8779] list-disc pl-4 space-y-1 font-mono">
                        <li><strong className="text-[#e7c787]">Bows:</strong> Drawn bows aimed directly through the hunter's position.</li>
                        <li><strong className="text-[#e7c787]">Crossbows:</strong> Charged and loaded crossbows aimed in range.</li>
                        <li><strong className="text-[#e7c787]">Tridents:</strong> Aimed or readied throwing tridents.</li>
                        <li><strong className="text-[#e7c787]">Wind Charges:</strong> Held and primed wind charge projectiles.</li>
                        <li><strong className="text-[#e7c787]">Damaging Potions:</strong> Harmful splash or lingering potions (Harming, Poison, Slowness, Weakness).</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-[#0d120e] border border-[#1c271e] rounded-lg space-y-2">
                      <div className="text-[#5ea386] font-bold font-mono text-[11px] uppercase flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span>Harmless Projectiles Ignored</span>
                      </div>
                      <p className="text-[#8c8779] text-[11px] leading-relaxed font-sans">
                        The AI determines whether a projectile can deal real damage. Projectiles with zero base damage are completely filtered out:
                      </p>
                      <ul className="text-[11px] text-[#8c8779] list-disc pl-4 space-y-1 font-mono">
                        <li><strong className="text-[#a9d1b0]">Snowballs &amp; Eggs:</strong> Completely ignored; splinters refuse to panic, break position, or waste stamina evading harmless items.</li>
                        <li><strong className="text-[#a9d1b0]">Non-Lethal Throws:</strong> Does not trigger defensive retreat or cover seeking if the throwable cannot kill or wound the entity.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#0b0e0c] border border-[#1d2720] rounded-lg space-y-1.5">
                      <h6 className="font-mono font-bold text-[11px] uppercase text-[#709978]">
                        The Patience Trap Protocol
                      </h6>
                      <p className="text-[#8c8779] text-[11px] leading-relaxed">
                        A sheltered Splinter may wait while an archer keeps a weapon trained on its hiding place. Lowering the weapon, releasing a shot, or changing position can give the hunter an opening to move.
                      </p>
                    </div>

                    <div className="p-3 bg-[#0b0e0c] border border-[#1d2720] rounded-lg space-y-1.5">
                      <h6 className="font-mono font-bold text-[11px] uppercase text-[#709978]">
                        Wide Screened Flank Arcs
                      </h6>
                      <p className="text-[#8c8779] text-[11px] leading-relaxed">
                        Hunters may take a wider route around an aimed weapon, using the terrain to screen their approach. Sideways weaving responds to a weapon aimed at that hunter, not merely to a bow being held nearby.
                      </p>
                    </div>
                  </div>
                    </>
                  )}
                </div>
              </UpdatedFrame>
            </div>
          )}

          {['splinter', 'log_splinter', 'blindspot_splinter', 'petrified_splinter'].includes(currentEntity.id) && (
            <div className="space-y-4 pt-4 border-t border-[#1a221c]">
              <UpdatedFrame id={`splinter_shared_instinct_${currentEntity.id}`} isUpdated={true}>
                <div className="p-5 bg-[#0a0c0a] border border-[#232f25] rounded-xl space-y-4">
                  <h5 className="font-serif text-base font-bold text-[#a9d1b0]">Timber Shields &amp; Coalescence</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    An experienced hunter may build its own shelter from an incoming shot, placing the lower block before raising the upper one. It carries the building material in its hand and usually seeks a route around familiar cover before breaking it. Petrified kin need no such shield against projectiles.
                  </p>
                  <h6 className="font-serif text-sm font-bold text-[#d1a851]">What the Fallen Leave Behind</h6>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Remains left by a dead Splinter can begin to stir. Nearby pieces slide toward one point, lift into a rough biped shape, and pause before a new hunter stands in their place. On Lignum Caro, a single eligible wooden drop can be enough; sparse formations suggest their missing limbs with faint smoke.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    {[['Easy', '10'], ['Normal', '7'], ['Hard', '5'], ['Hardcore', '4']].map(([difficulty, amount]) => (
                      <div key={difficulty} className="p-3 bg-[#090b09] border border-[#1b231c] rounded-lg">
                        <div className="text-[#5a6b5e] text-[10px] uppercase">{difficulty}</div>
                        <div className="text-[#d1a851] mt-1">{amount} planks</div>
                      </div>
                    ))}
                  </div>
                  <ul className="text-xs text-[#8c8779] list-disc pl-4 space-y-2 leading-relaxed">
                    <li><strong className="text-[#c9d1c9]">Wood and Sticks:</strong> These are the default plank requirements. Four eligible sticks replace one plank; sixteen replace one log when a log-based form is gathering. Wood and sticks can contribute to the same pile; sticks alone form the realm's plank-type hunter.</li>
                    <li><strong className="text-[#c9d1c9]">Only the Fallen:</strong> Only remains dropped by fallen Splinters can take part. Throwing your own building supplies or sticks on the ground will not summon a hunter.</li>
                    <li><strong className="text-[#c9d1c9]">Beyond Reach:</strong> Selected remains cannot be picked up while the formation holds them. If it breaks apart, surviving drops become available again.</li>
                    <li><strong className="text-[#c9d1c9]">A Place to Stand:</strong> Revival needs safe footing and room for the new body. Solid obstructions, nearby crowds, or an interrupted gathering can prevent it.</li>
                    <li><strong className="text-[#c9d1c9]">Different Remains:</strong> Planks form ordinary Splinters, or Blindspots in The Grain. Logs form Log Splinters, petrified wood forms Petrified Splinters, and fallen Lignum Caro can produce any of the four.</li>
                  </ul>
                </div>
              </UpdatedFrame>
            </div>
          )}

          {/* LOG SPLINTER: Custom mechanics */}
          {currentEntity.id === 'log_splinter' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-[#111412] border-l-2 border-[#709978] rounded-r-lg text-xs text-[#8c8779] leading-relaxed">
                Log Splinters represent highly coordinated territorial forest entities. They share the same underlying pathfinding routines, rage conditions, Ash-Rose vulnerability, and kinship alarm triggers as normal Splinters, but occupy larger territorial exclusion corridors.
              </div>

              {/* Exclusion Zones table */}
              <div className="space-y-2">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Exclusion Zone Guidelines</h5>
                <div className="overflow-hidden rounded border border-[#1c241e] text-xs font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#121713] text-[#5a6b5e] border-b border-[#1c241e]">
                        <th className="p-2">Progression Ticks</th>
                        <th className="p-2 text-center">System Radius</th>
                        <th className="p-2 text-right">Clear Volume Area Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#151c16] text-[#8c8779]">
                      <tr>
                        <td className="p-2">0 - 4,000</td>
                        <td className="p-2 text-center">144</td>
                        <td className="p-2 text-right">72 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2">4,001 - 7,500</td>
                        <td className="p-2 text-center">128</td>
                        <td className="p-2 text-right">64 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2">7,501 - 11,000</td>
                        <td className="p-2 text-center">112</td>
                        <td className="p-2 text-right">56 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2">11,001 - 17,000</td>
                        <td className="p-2 text-center">80</td>
                        <td className="p-2 text-right">40 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2">17,001 - 20,000</td>
                        <td className="p-2 text-center">56</td>
                        <td className="p-2 text-right text-[#c28b40]">28 Blocks around spawn</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-red-400">20,001+ Ticks</td>
                        <td className="p-2 text-center font-bold text-red-400">40</td>
                        <td className="p-2 text-right text-red-400 font-bold">20 Blocks safety distance</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loot Drops */}
              <div className="space-y-2">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Extended Log Dropset</h5>
                <p className="text-xs text-[#829285] leading-relaxed">
                  Killing this heavier variant yields dense, highly valuable materials for crafting wooden protection tools:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                  <div className="p-2 bg-[#090b09] border border-[#161d17] rounded text-center">
                    <div className="text-[#5a6b5e] text-[9px]">Rotten Stick</div>
                    <div className="text-[#c9d1c9] font-bold mt-1">30%</div>
                  </div>
                  <div className="p-2 bg-[#090b09] border border-[#161d17] rounded text-center">
                    <div className="text-[#5a6b5e] text-[9px]">Rotten Planks</div>
                    <div className="text-[#c9d1c9] font-bold mt-1">15%</div>
                  </div>
                  <div className="p-2 bg-[#090b09] border border-[#161d17] rounded text-center">
                    <div className="text-[#5a6b5e] text-[9px]">Rotten Log</div>
                    <div className="text-[#c9d1c9] font-bold mt-1">10%</div>
                  </div>
                  <div className="p-2 bg-[#0c120d] border border-[#263e30]/30 rounded text-center">
                    <div className="text-[#5ea386] text-[9px]">Splinter Shard</div>
                    <div className="text-[#5ea386] font-bold mt-1">3%</div>
                  </div>
                  <div className="p-2 bg-[#090b09] border border-[#161d17] rounded text-center">
                    <div className="text-zinc-600 text-[9px]">No Drop</div>
                    <div className="text-zinc-500 mt-1">35%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLINDSPOT SPLINTER: Custom mechanics */}
          {currentEntity.id === 'blindspot_splinter' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-orange-950/10 border-l-2 border-orange-500 rounded-r-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-orange-400">Front Cam Invisibility:</strong> The Blindspot Splinter turns completely, flawlessly invisible if you attempt to view it using the third-person front perspective! It forces survivalists to stay locked in first-person view to maintain situational tracking.
              </div>

              <div className="space-y-3">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Evasion & Spawning Demands</h5>
                <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4 leading-relaxed">
                  <li><strong className="text-[#c9d1c9]">Base Block Safety:</strong> Cannot generate on empty air blocks; requires structural support beneath coordinates.</li>
                  <li><strong className="text-[#c9d1c9]">Occlusion Control:</strong> Floor blocks in targeted biomes must possess light-occluding density values.</li>
                  <li><strong className="text-[#c9d1c9]">Ash-Rose Counter:</strong> Proximal Ash-Roses wilt at significantly accelerated rates when kept near a Blindspot Splinter.</li>
                </ul>
              </div>

              {/* Exclusion zones */}
              <div className="space-y-3">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Territorial Radii (By Biome)</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#0a0c0a] border border-[#1c241e] rounded">
                    <div className="text-[#5a6b5e] text-[9px] uppercase font-bold">Labyrinth / Pillars</div>
                    <div className="text-orange-400 font-bold mt-1">192 Blocks</div>
                  </div>
                  <div className="p-3 bg-[#0a0c0a] border border-[#1c241e] rounded">
                    <div className="text-[#5a6b5e] text-[9px] uppercase font-bold">Uniform Grain</div>
                    <div className="text-orange-400 font-bold mt-1">1000 Blocks</div>
                  </div>
                  <div className="p-3 bg-[#110b0b] border border-red-950/30 rounded">
                    <div className="text-[#5a6b5e] text-[9px] uppercase font-bold">Dead Grain (Sub-Strata)</div>
                    <div className="text-red-400 font-bold mt-1">Scales Down over time</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Sub-Strata Boundary Compression</h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  Inside the Dead Grain biome, the safety exclusion zone compresses relentlessly as total time spent in the dimension accumulates:
                </p>
                <div className="overflow-hidden rounded border border-[#1c241e] text-xs font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#121713] text-[#5a6b5e] border-b border-[#1c241e]">
                        <th className="p-2">Elapsed Sub-Strata Ticks</th>
                        <th className="p-2 text-center">System Radius</th>
                        <th className="p-2 text-right">Clear Volume Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#151c16] text-[#8c8779]">
                      <tr>
                        <td className="p-2">0 - 1,000 (Initial)</td>
                        <td className="p-2 text-center">120</td>
                        <td className="p-2 text-right">120 Blocks safety radius</td>
                      </tr>
                      <tr>
                        <td className="p-2">1,001 - 3,750</td>
                        <td className="p-2 text-center">77</td>
                        <td className="p-2 text-right">77 Blocks safety radius</td>
                      </tr>
                      <tr>
                        <td className="p-2">3,751 - 5,500</td>
                        <td className="p-2 text-center">58</td>
                        <td className="p-2 text-right">58 Blocks safety radius</td>
                      </tr>
                      <tr>
                        <td className="p-2">5,501 - 8,500</td>
                        <td className="p-2 text-center">42</td>
                        <td className="p-2 text-right">42 Blocks safety radius</td>
                      </tr>
                      <tr>
                        <td className="p-2">8,501 - 10,000</td>
                        <td className="p-2 text-center">28</td>
                        <td className="p-2 text-right text-[#c28b40]">28 Blocks safety radius</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-red-400">10,001+ Ticks</td>
                        <td className="p-2 text-center font-bold text-red-400">16</td>
                        <td className="p-2 text-right text-red-400 font-bold">16 Blocks (Total Suffocation)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentEntity.id === 'blindspot_splinter' && (
            <UpdatedFrame id="blindspot_borrowed_shapes" isUpdated={true}>
              <div className="p-5 bg-[#110f0d] border border-[#3d2a0d]/30 rounded-xl space-y-3">
                <h5 className="font-serif text-base font-bold text-orange-400">Borrowed Shapes</h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  An experienced Blindspot can leave a frozen likeness where it stood and vanish at the same moment. The shape keeps its departing pose; it does not turn its head to follow you. More experienced hunters leave denser, more convincing copies.
                </p>
                <ul className="text-xs text-[#8c8779] list-disc pl-4 space-y-2 leading-relaxed">
                  <li><strong className="text-[#c9d1c9]">Behind the Distraction:</strong> Invisible hunters follow behind their target or silently take fixed positions around them. They do not endlessly circle the player.</li>
                  <li><strong className="text-[#c9d1c9]">Keep Your Distance:</strong> The real bodies try to stay beyond melee reach and back away when approached, preserving the deception.</li>
                  <li><strong className="text-[#c9d1c9]">The Reveal:</strong> Copies linger while the hunters reposition, then fade before attacks resume. Blocked routes cannot keep the illusion alive forever.</li>
                  <li><strong className="text-[#c9d1c9]">Many Faces:</strong> Up to 200 nearby hunters can join a single deployment. These copies are distractions, not additional living Splinters.</li>
                </ul>
              </div>
            </UpdatedFrame>
          )}

          {/* PETRIFIED LOG SPLINTER: Custom mechanics */}
          {currentEntity.id === 'petrified_splinter' && (
            <div className="space-y-4 pt-2 border-t border-[#1a221c]">
              <UpdatedFrame id="petrified_log_splinter_mechanics" isUpdated={true}>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                    <strong className="text-zinc-300">Hardened Physiology:</strong> Emerging solely from fossilized understories, the Petrified Log Splinter is incredibly robust. It possesses high natural armor ratings (4 points) and moves slower than its fleshier brothers (0.3 speed), acting as an unyielding physical gatekeeper in the high-density ash forests.
                  </div>
                  <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4 leading-relaxed">
                    <li><strong className="text-zinc-300">Relentless Under Fire:</strong> Its projectile immunity makes wooden shields unnecessary. When provoked, it closes on its attacker instead of sheltering from harmless arrows.</li>
                    <li><strong className="text-zinc-300">Gaze Locking:</strong> Freezes on direct sights and stalks once line of sight breaks.</li>
                    <li><strong className="text-zinc-300">Kinship Alarms:</strong> Integrates fully with the global difficulty death alert triggers, driving surrounding Petrified Log Splinters into instant 600-tick fury states.</li>
                  </ul>
                </div>
              </UpdatedFrame>
            </div>
          )}

          {/* THE HOLLOW: Custom mechanics */}
          {currentEntity.id === 'hollow' && (
            <div className="space-y-4 pt-2 border-t border-[#1a221c]">
              <UpdatedFrame id="hollow_custom_dossier" isUpdated={true}>
                <div className="p-4 bg-[#101b19]/10 border border-[#1f3632]/20 rounded-lg text-xs text-[#8c8779] space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-[#4ca398]">The Silent Observer:</strong> The Hollow is a non-hostile phantom. It never pursues nor attacks. It maintains a safe, eerie presence in deep forests and underground caverns, creeping closer when your sight is turned, but vanishes instantly with a warp sound if struck.
                  </p>
                  <p className="text-[11px] text-[#5a6b5e]">
                    <strong className="text-[#81caa9]">Spawning Requirement:</strong> Spawns naturally on solid occluding surfaces requiring a 48-block exclusion radius (96-block bounding box) from any other living Hollow.
                  </p>
                </div>
              </UpdatedFrame>
            </div>
          )}

          {/* LIGNUM VERMIS: Custom mechanics */}
          {currentEntity.id === 'lignum_vermis' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <UpdatedFrame id="lignum_vermis_dossier" isUpdated={true}>
                <div className="p-4 bg-[#101b19]/10 border border-[#1f3632]/20 rounded-lg text-xs text-[#8c8779] leading-relaxed space-y-1.5">
                  <p>
                    <strong className="text-[#4ca398]">Harvesting Hazards:</strong> Mining Scandere Lignum blocks carries a notable risk: there is a 10% chance for a Lignum Vermis to emerge upon total block destruction via player tools or explosions. Additionally, there is a rare 1% chance per tick for the hidden organism to violently fracture the block early while a player is actively mining it.
                  </p>
                  <p className="text-[11px] text-[#5a6b5e]">
                    <strong className="text-[#81caa9]">Natural Elevation:</strong> Generates naturally exclusively in subterranean sub-strata wood layers between <strong className="text-white">Y: 44 and Y: 52</strong>.
                  </p>
                </div>
              </UpdatedFrame>
              <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0] mb-2">Loot Drops & Probabilities</h5>
                <div className="overflow-hidden rounded border border-[#1c241e] text-xs font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#121713] text-[#5a6b5e] border-b border-[#1c241e]">
                        <th className="p-2">Item Drop</th>
                        <th className="p-2 text-right">Chance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#151c16] text-[#8c8779]">
                      <tr>
                        <td className="p-2">Seep</td>
                        <td className="p-2 text-right text-[#5ea386]">19.5%</td>
                      </tr>
                      <tr>
                        <td className="p-2">Splinter Shard</td>
                        <td className="p-2 text-right text-[#5ea386]">15.6%</td>
                      </tr>
                      <tr>
                        <td className="p-2 italic">Nothing</td>
                        <td className="p-2 text-right text-zinc-500">64.9%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LIGNUM PALUS: Custom mechanics */}
          {currentEntity.id === 'lignum_palus' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-orange-950/10 border border-orange-900/20 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-orange-400">Pillar Mimicry & Grid-Bound Behavior:</strong> Lignum Palus is a towering 5.8-block-tall colossus that patrols exclusively on the cardinal grid lines of the Sub-Strata. When a player maintains direct line of sight, it freezes solid to blend in as a supporting structural column, only to strike telekinetically the moment you turn away.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-2">
                  <h5 className="font-serif text-sm font-bold text-orange-400">Grid Navigation & Disguise</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Normally wanders at a slow <strong className="text-white">0.05 speed</strong> cardinally, turning only 90 degrees at intersections. It has a <strong className="text-white">50% chance</strong> to stop at any intersection, lock rotation, and disguise itself as a pillar for <strong className="text-white">3 to 9 seconds</strong>.
                  </p>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    If a player stays stationary for <strong className="text-white">&gt; 5 seconds</strong>, it accelerates to <strong className="text-white">0.12 speed</strong>, tracking them directly via the shortest Manhattan path.
                  </p>
                </div>

                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-2">
                  <h5 className="font-serif text-sm font-bold text-orange-400">Freeze & Projectile Dodge</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    <strong>Direct Gaze Freeze:</strong> A moving player keeping direct line of sight causes it to freeze completely on the nearest block center. Breaking line of sight resumes its advance. It does not freeze against stationary players.
                  </p>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    <strong>Ender-Style Dodge:</strong> Any incoming projectile causes it to try up to <strong className="text-white">64 times</strong> to teleport to a safe grid landing point within a 16-block horizontal and 8-block vertical radius (needs 6 blocks of clearance). On success, the damage is fully cancelled.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#0c0f0d] border border-orange-950/20 rounded-lg space-y-3">
                <h5 className="font-serif text-sm font-bold text-orange-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-orange-500 animate-pulse" />
                  Active Hypnosis Mechanics
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#8c8779]">
                  <div className="space-y-1.5">
                    <p className="font-bold text-[#e0e7e0]">Trigger & Telekinesis Pool:</p>
                    <p className="leading-relaxed">
                      Staring at its eye region (within 20 blocks, &gt;0.82 gaze accuracy threshold) triggers a stare counter. After <strong className="text-white">70 ticks (3.5s)</strong>, hypnosis activates.
                    </p>
                    <p className="leading-relaxed">
                      Locks in place and pulls the player to a suspended position <strong className="text-white">2 blocks</strong> in front of its face. The player's camera is locked looking directly at the entity.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-bold text-[#e0e7e0]">Active Trance Effects:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Slowness III</strong> for 7s (tick refresh)</li>
                      <li><strong>Darkness</strong> for 7s (tick refresh)</li>
                      <li><strong>Wither II</strong> for 7s (tick refresh)</li>
                      <li>Deep portal noises play every 30 ticks; loud Warden heartbeats play every 25 ticks.</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-red-950/10 border border-red-900/10 rounded text-xs text-[#8c8779] leading-relaxed">
                  <strong className="text-red-400">Trance Breaks & Cooldown:</strong> Hypnosis ends immediately if the player moves beyond 24 blocks, enters creative/spectator, dies, or if Lignum Palus takes damage. On cancellation, a <strong className="text-white">5-second (100 ticks) cooldown</strong> applies, resetting its hypnosis tags and preventing immediate re-initiation.
                </div>
              </div>
            </div>
          )}

          {/* STILT WALKER: Custom mechanics */}
          {currentEntity.id === 'stilt_walker' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-[#1b1424]/10 border border-[#312542]/20 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-[#aa8bc9]">Stalk & Punishment Loop:</strong> Remaining tracked or close to a Stilt Walker for too long triggers an escalation sequence: looking directly at it inflicts complete blindness (60 ticks) and spawns hostile Blindspot Splinters nearby right before the Stilt Walker teleports away.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-[#aa8bc9] mb-2">Predictive Dodging</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    If a survival mode player within <strong className="text-white">3.2 blocks</strong> swings a weapon, the Stilt Walker instantly senses the action, plays an alert chime, inflicts blindness, spawns Splinters, and teleports on the exact same frame!
                  </p>
                </div>
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-[#aa8bc9] mb-2">Circular Cage Formation</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Whenever Blindspot Splinters are summoned by a Stilt Walker, they generate in a perfect, uniform circle (<strong className="text-white">3.2-block radius</strong>) centered around the attacker to build an inescapable wooden trap.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#110d14] border border-[#1b1424]/40 rounded-lg space-y-1">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Spawn Grace Protection System</h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  For the first <strong className="text-white">20 ticks (1s)</strong> after spawning, the Stilt Walker is immune to damage and predictive dodging checks. In addition, its stalk cycle cannot trigger/terminate until it has been alive for <strong className="text-white">60 ticks (3s)</strong>, preventing instant unfair traps.
                </p>
              </div>
            </div>
          )}

          {/* THE ASH-WEAVER: Custom mechanics */}
          {currentEntity.id === 'ash_weaver' && (
            <UpdatedFrame id="ash_weaver_custom_dossier" isUpdated={true}>
              <div className="space-y-6 pt-2">
                {/* Botanical Overview Banner */}
                <div className="p-4 bg-[#0d1611]/60 border border-[#263e30]/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#1b2b22] pb-2.5">
                    <Sparkles className="w-4 h-4 text-[#81caa9]" />
                    <span className="font-serif text-sm font-bold text-[#e0e7e0]">
                      Botanical Symbiote &amp; Sub-Realm Warden
                    </span>
                  </div>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    A wary, intelligent companion native to <strong className="text-[#81caa9]">The Thicket</strong>. The Ash-Weaver chooses one player, learns from shared experiences, and offers protection without being fearless or perfectly obedient. Trust grows slowly; cruelty can make it keep its distance.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2.5 bg-[#080e0a] border border-[#1b2b22] rounded space-y-1">
                      <div className="font-bold text-[#81caa9] uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5ea386]" />
                        Natural Spawning Rules
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[#829285]">
                        <li><strong className="text-[#e0e7e0]">Substrate Check:</strong> Solid occluding ground (<code className="text-[#81caa9]">canOcclude() == true</code>).</li>
                        <li><strong className="text-[#e0e7e0]">Biome Limitation:</strong> Restricted strictly to <strong className="text-white">The Thicket</strong>.</li>
                        <li><strong className="text-[#e0e7e0]">Spatial Clearance:</strong> Enforces an <strong className="text-white">87.5-block clearance radius</strong> (175x48x175 block volume) from other living Ash-Weavers.</li>
                      </ul>
                    </div>

                    <div className="p-2.5 bg-[#080e0a] border border-[#1b2b22] rounded space-y-1">
                      <div className="font-bold text-[#81caa9] uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#5ea386]" />
                        Kinetic &amp; Environmental Profile
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[#829285]">
                        <li><strong className="text-[#e0e7e0]">Resistances:</strong> Immune to <strong className="text-white">Cactus</strong> and <strong className="text-white">Drowning</strong> damage.</li>
                        <li><strong className="text-[#e0e7e0]">Following Pace:</strong> Walks, sprints, and uses cautious jumps to keep up, slowing when the route becomes unsafe.</li>
                        <li><strong className="text-[#e0e7e0]">Botanical Drop:</strong> Guarantees 1 <strong className="text-white">Ash Rose</strong> blossom on death.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Abilities Accordion */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#81caa9] font-bold flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#5ea386]" />
                    Behavioral &amp; Combat Dossier (Click to expand details)
                  </h4>
                  
                  <div className="space-y-2">
                    {ashWeaverAbilities.map((ab, idx) => {
                      const isOpen = openAshWeaverAbilityIndex === idx;
                      return (
                        <div 
                          key={idx} 
                          className="bg-[#0b130e] border border-[#1c2c21]/40 hover:border-[#2e4d38]/50 rounded-lg transition-all"
                        >
                          <button
                            onClick={() => toggleAshWeaverAbility(idx)}
                            className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-[#81caa9] bg-[#131d17]/50 border border-[#263e30]/60 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                                {ab.category}
                              </span>
                              <span className="font-serif text-xs sm:text-sm font-bold text-[#e0e7e0] hover:text-[#81caa9] transition-colors">
                                {ab.title}
                              </span>
                            </div>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-[#5ea386]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#5ea386]" />
                            )}
                          </button>
                          
                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 text-xs text-[#8c8779] border-t border-[#1c2c21]/30 space-y-2">
                              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Trigger Condition: {ab.trigger}</span>
                              </div>
                              <p className="leading-relaxed pl-1">{ab.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* State / Phase Matrix Switcher */}
                <div className="space-y-4 pt-4 border-t border-[#1c2c21]/30">
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#81caa9] font-bold flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#5ea386]" />
                      Finite State Machine &amp; Operational Phase Matrix
                    </h4>
                    <p className="text-xs text-[#829285] leading-relaxed mt-1">
                      Companionship, danger, frightening memories, and familiar shelter shape how the Weaver behaves. Its attention shifts with the situation rather than following the same routine everywhere.
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap bg-[#060b08] p-1 rounded-lg border border-[#1c2c21]/40 max-w-2xl select-none gap-1">
                    {[
                      { id: 'companion', label: '1. Companion & Garden' },
                      { id: 'combat', label: '2. Combat & Evasion' },
                      { id: 'trauma', label: '3. Trauma & Recovery' },
                      { id: 'territory', label: '4. Home Territory' }
                    ].map((state) => (
                      <button
                        key={state.id}
                        onClick={() => setActiveAshWeaverState(state.id as any)}
                        className={`flex-1 text-center py-1.5 px-2 text-[10px] font-mono font-bold rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                          activeAshWeaverState === state.id
                            ? 'bg-[#15241b] text-[#a4dbc1] border border-[#2b4b37]/60'
                            : 'text-[#5a6b5e] hover:text-[#829285]'
                        }`}
                      >
                        {state.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-[#0a110d] border border-[#1c2c21]/40 rounded-xl">
                    {activeAshWeaverState === 'companion' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-[#81caa9]">
                          Companionship &amp; Protective Planting
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          Follows its chosen companion, pauses to notice its surroundings, and looks for safe planting ground when hostile Splinters give chase.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-[#e0e7e0]">A Chosen Companion:</strong> Chooses an unaccompanied player nearby and keeps a changing, comfortable distance instead of always standing on the same spot.</li>
                          <li><strong className="text-[#81caa9]">Careful Planting:</strong> Checks usable ground and space for the flower, looks toward the spot, then swings to place it.</li>
                          <li><strong className="text-emerald-400">A Defensive Blossom:</strong> Plants when hostile Splinters are targeting its companion, rather than endlessly filling peaceful paths with roses.</li>
                          <li><strong className="text-purple-400">Following Through Portals:</strong> Can follow a witnessed portal route, but does not blindly teleport after unexplained travel.</li>
                        </ul>
                      </div>
                    )}

                    {activeAshWeaverState === 'combat' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-amber-400">
                          Danger &amp; Defense
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          Can help when its companion is attacked, but danger may also make it hesitate, retreat, or reach for a protective blossom.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-red-400">Close Defense:</strong> Swings against attackers in reach and sometimes jumps for a stronger falling strike. It runs when a chase calls for it.</li>
                          <li><strong className="text-amber-400">Avoiding Danger:</strong> Tries to dodge incoming shots or move out of its companion's aim instead of standing in the line of fire.</li>
                          <li><strong className="text-yellow-400">Watch Your Back:</strong> May gesture toward a pursuing Splinter when its companion seems unaware of the danger.</li>
                          <li><strong className="text-[#e0e7e0]">Cautious Footing:</strong> Judges landing space and drop depth, slows at dangerous edges, and may wait rather than commit to a bad jump.</li>
                        </ul>
                      </div>
                    )}

                    {activeAshWeaverState === 'trauma' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-purple-400">
                          Fear &amp; Recovery
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          A frightening encounter can change how the Weaver approaches the same threat or place later. Shared victories can help it regain its nerve.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-red-400">Seeking Cover:</strong> A badly hurt or frightened Weaver can break sight, crouch behind cover, and peek out before deciding to return.</li>
                          <li><strong className="text-purple-400">Remembered Places:</strong> Fear is tied to a threat and the surrounding area, not a single unlucky block.</li>
                          <li><strong className="text-emerald-400">Recovery:</strong> Overcoming nearby threats together can soften frightening memories over time.</li>
                          <li><strong className="text-[#e0e7e0]">Trust and Familiarity:</strong> Shared time and help build a bond; repeated harm can make the Weaver wary or avoidant.</li>
                        </ul>
                      </div>
                    )}

                    {activeAshWeaverState === 'territory' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-teal-400">
                          Home &amp; Understanding
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          A home must be somewhere usable. The Weaver learns shelter and nearby boundaries gradually, and may refuse a place that is unsafe or beyond its reach.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-teal-400">A Usable Home:</strong> Recognizes sheltered rooms, caves, equipped campsites, watchtowers, and open bases, rather than accepting any empty field.</li>
                          <li><strong className="text-[#81caa9]">Room Boundaries:</strong> Open doors do not turn the entire outdoors into another room. Extra areas must connect safely to a remembered home.</li>
                          <li><strong className="text-amber-400">A Few Familiar Words:</strong> Addressed requests tolerate minor typos. Important changes, such as forgetting a home, require clear words and confirmation.</li>
                          <li><strong className="text-[#e0e7e0]">Strange Speech:</strong> Replies begin heavily scrambled and become easier to read with familiarity. A damaged relationship can make communication difficult again.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ash Weaver Chat Command Cheat Sheet */}
                <div className="space-y-4 pt-4 border-t border-[#1c2c21]/30">
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#81caa9] font-bold flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#5ea386]" />
                      Natural Language Chat Command Cheat Sheet
                    </h4>
                    <p className="text-xs text-[#829285] leading-relaxed mt-1">
                      Direct chat directives recognized by the Ash-Weaver in multiplayer and singleplayer chat. Commands may be spoken unaddressed or addressed using <code className="text-[#81caa9]">weaver</code> or <code className="text-[#81caa9]">ash weaver</code>.
                    </p>
                  </div>

                  {/* Segmented Command Tabs */}
                  <div className="flex flex-wrap sm:flex-nowrap bg-[#060b08] p-1 rounded-lg border border-[#1c2c21]/40 max-w-xl select-none gap-1">
                    {[
                      { id: 'movement', label: '1. Movement & Guard' },
                      { id: 'home', label: '2. Home Territory' },
                      { id: 'rules', label: '3. Dialogue & Syntax Rules' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveChatTab(tab.id as any)}
                        className={`flex-1 text-center py-1.5 px-2 text-[10px] font-mono font-bold rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                          activeChatTab === tab.id
                            ? 'bg-[#15241b] text-[#a4dbc1] border border-[#2b4b37]/60'
                            : 'text-[#5a6b5e] hover:text-[#829285]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab 1: Movement & Guard */}
                  {activeChatTab === 'movement' && (
                    <div className="space-y-3">
                      {[
                        {
                          command: 'follow',
                          variants: ['follow', 'follow me', 'come here'],
                          addressed: 'weaver follow / ash weaver follow me',
                          reply: 'Following.',
                          action: 'Resumes following, adjusting its pace and position to its companion and the ground ahead.'
                        },
                        {
                          command: 'stay',
                          variants: ['stay', 'stay here', 'wait here'],
                          addressed: 'weaver stay / ash weaver wait here',
                          reply: 'Waiting here.',
                          action: 'Asks the Weaver to wait nearby instead of following. Immediate danger can interrupt its wait.'
                        },
                        {
                          command: 'watch',
                          variants: ['watch', 'watch my back'],
                          addressed: 'weaver watch / ash weaver watch my back',
                          reply: 'Watching for threats.',
                          action: 'Resumes following and asks it to watch for threats, including pursuers its companion may not have noticed.'
                        },
                        {
                          command: 'help me',
                          variants: ['help me', 'protect me'],
                          addressed: 'weaver help me / ash weaver protect me',
                          reply: "I'll protect you.",
                          action: 'Asks for help against an attacker. The Weaver answers more quickly than usual, but still takes a brief moment to react.'
                        },
                        {
                          command: 'weaver sorry',
                          variants: ['sorry', "I'm sorry", 'my bad', 'forgive me', "I didn't mean to hit you"],
                          addressed: 'weaver sorry / ash weaver please forgive me',
                          reply: 'Be careful.',
                          action: 'Apologizes for a recent accidental hit. Minor typos and common contractions are understood. Repeated apologies cannot restore the same injury twice, and repeated hits may earn a refusal instead.'
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-[#0a110d] border border-[#1c2c21]/40 rounded-xl space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#16251b] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#81caa9] bg-[#121f17] border border-[#243d2c]/60 px-2 py-0.5 rounded">
                                {item.command}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCommand(item.command)}
                                className="p-1 text-[#5a6b5e] hover:text-[#81caa9] transition-colors cursor-pointer"
                                title="Copy command to clipboard"
                              >
                                {copiedCommand === item.command ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <div className="text-[11px] font-mono text-[#8c8779]">
                              <span className="text-[#5a6b5e]">Response:</span>{' '}
                              <span className="text-emerald-400 font-semibold font-serif italic">"{item.reply}"</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                            <div>
                              <span className="text-[#5a6b5e] uppercase text-[9px] block">Recognized Variants:</span>
                              <span className="text-[#a4dbc1]">{item.variants.join(' · ')}</span>
                            </div>
                            <div>
                              <span className="text-[#5a6b5e] uppercase text-[9px] block">Addressed Syntax:</span>
                              <span className="text-[#8c8779]">{item.addressed}</span>
                            </div>
                          </div>

                          <p className="text-xs text-[#8c8779] leading-relaxed pt-1">
                            {item.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 2: Home Territory */}
                  {activeChatTab === 'home' && (
                    <div className="space-y-3">
                      {[
                        {
                          command: 'this is home',
                          variants: ['this is home', 'this is our home', 'remember this place', 'this is our camp', 'this is our base', 'this is a watchtower'],
                          addressed: 'weaver this is home / ash weaver remember this place',
                          reply: "I'll remember this place.",
                          action: 'Asks the Weaver to remember a safe, usable shelter or equipped base. Stand nearby on safe ground; an exposed empty field is not enough. Replacing a home requires confirmation.'
                        },
                        {
                          command: 'this is also home',
                          variants: ['this is also home', 'remember this area too'],
                          addressed: 'weaver this is also home',
                          reply: "I'll remember this area too.",
                          action: 'Adds a nearby, safely connected area to the remembered home. It will not join distant buildings through an unsafe outdoor route.'
                        },
                        {
                          command: 'stay home',
                          variants: ['stay home', 'stay at home'],
                          addressed: 'weaver stay home / ash weaver stay at home',
                          reply: 'Staying home.',
                          action: 'Asks the Weaver to remain around a remembered home it can safely reach. Threats and damaged shelter can interrupt its routine.'
                        },
                        {
                          command: 'forget home',
                          variants: ['forget home', 'forget this home'],
                          addressed: 'weaver forget home',
                          reply: 'Home forgotten.',
                          action: 'Forgets the remembered homes after the request is repeated to confirm. Use the exact phrase so an ordinary conversation cannot erase them.'
                        },
                        {
                          command: 'restore home',
                          variants: ['restore home'],
                          addressed: 'weaver restore home',
                          reply: 'I remember this home again.',
                          action: 'Restores a remembered home nearby if it is still safe and reachable. Repeat the exact request to confirm.'
                        },
                        {
                          command: 'home status',
                          variants: ['home status'],
                          addressed: 'weaver home status',
                          reply: 'I remember home.',
                          action: 'Asks whether it remembers home, whether home is elsewhere, or whether an exposed or damaged place is still usable.'
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-[#0a110d] border border-[#1c2c21]/40 rounded-xl space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#16251b] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-teal-300 bg-[#0f1d16] border border-[#1f382b]/60 px-2 py-0.5 rounded">
                                {item.command}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCommand(item.command)}
                                className="p-1 text-[#5a6b5e] hover:text-teal-300 transition-colors cursor-pointer"
                                title="Copy command to clipboard"
                              >
                                {copiedCommand === item.command ? (
                                  <Check className="w-3.5 h-3.5 text-teal-300" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <div className="text-[11px] font-mono text-[#8c8779]">
                              <span className="text-[#5a6b5e]">Response:</span>{' '}
                              <span className="text-teal-300 font-semibold font-serif italic">"{item.reply}"</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                            <div>
                              <span className="text-[#5a6b5e] uppercase text-[9px] block">Recognized Variants:</span>
                              <span className="text-[#a4dbc1]">{item.variants.join(' · ')}</span>
                            </div>
                            <div>
                              <span className="text-[#5a6b5e] uppercase text-[9px] block">Addressed Syntax:</span>
                              <span className="text-[#8c8779]">{item.addressed}</span>
                            </div>
                          </div>

                          <p className="text-xs text-[#8c8779] leading-relaxed pt-1">
                            {item.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 3: Dialogue & Syntax Rules */}
                  {activeChatTab === 'rules' && (
                    <div className="space-y-3">
                      {/* Status Command Card */}
                      <div className="p-3.5 bg-[#0a110d] border border-[#1c2c21]/40 rounded-xl space-y-2">
                        <div className="flex items-center justify-between border-b border-[#16251b] pb-2">
                          <span className="font-mono text-xs font-bold text-amber-300 bg-[#1e1a0f] border border-[#3a3219]/60 px-2 py-0.5 rounded">
                            status
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCommand('status')}
                            className="p-1 text-[#5a6b5e] hover:text-amber-300 transition-colors cursor-pointer"
                            title="Copy command to clipboard"
                          >
                            {copiedCommand === 'status' ? (
                              <Check className="w-3.5 h-3.5 text-amber-300" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          Queries current stance. The Weaver dynamically replies with <strong className="text-white">"Staying home."</strong> if anchored to territory, <strong className="text-white">"Waiting here."</strong> if halted in place, or <strong className="text-white">"Following."</strong> if currently escorting the companion.
                        </p>
                      </div>

                      {/* Syntax Rules & Obfuscation Deep-Dive */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-[#080e0a] border border-[#1b2b22] rounded-lg space-y-1.5">
                          <div className="font-bold text-[#81caa9] uppercase font-mono tracking-wider flex items-center gap-1.5 text-[11px]">
                            <Terminal className="w-3.5 h-3.5 text-[#5ea386]" />
                            Addressing &amp; Typo Tolerance
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-[#829285] leading-relaxed">
                            <li><strong className="text-[#e0e7e0]">Unaddressed:</strong> Movement requests such as <code className="text-[#81caa9]">follow</code> or <code className="text-[#81caa9]">stay</code> need exact wording without a name. Familiar apologies also allow small, unmistakable typos.</li>
                            <li><strong className="text-[#e0e7e0]">Addressed:</strong> Prefixing with <code className="text-[#81caa9]">weaver</code> or <code className="text-[#81caa9]">ash weaver</code> activates fuzzy matching tolerant of 1 to 2 typos or transpositions.</li>
                            <li><strong className="text-[#e0e7e0]">Safety Bounds:</strong> Typo matching strictly protects short keywords, preventing accidental misinterpretations such as "say" turning into "stay" or "some" into "home".</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-[#080e0a] border border-[#1b2b22] rounded-lg space-y-1.5">
                          <div className="font-bold text-[#81caa9] uppercase font-mono tracking-wider flex items-center gap-1.5 text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-[#5ea386]" />
                            Speech Obfuscation &amp; Bond Growth
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-[#829285] leading-relaxed">
                            <li><strong className="text-[#e0e7e0]">Action Bar Feedback:</strong> Replies appear above the assigned companion's hotbar; nearby strangers do not receive them.</li>
                            <li><strong className="text-[#e0e7e0]">Dynamic Decryption:</strong> Early dialogues appear heavily scrambled with random Minecraft obfuscation runes. As familiarity grows, the scrambled words become easier to read; distrust can make them harder to understand again.</li>
                            <li><strong className="text-[#e0e7e0]">Hesitation Delays:</strong> Responses feature realistic pauses between 4 and 50 ticks (urgent replies take 4 to 8 ticks, while cautious, injured, or unfamiliar states take 18 to 50 ticks).</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-[#080e0a] border border-[#1b2b22] rounded-lg space-y-1.5 sm:col-span-2">
                          <div className="font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5 text-[11px]">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                            Engagement Range &amp; Alienation Warnings
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-[#829285]">
                            <div>
                              <strong className="text-[#e0e7e0] block">32-Block Horizon:</strong>
                              Commands are registered only if the companion and Weaver share the same dimension within a 32-block radius.
                            </div>
                            <div>
                              <strong className="text-[#e0e7e0] block">Home Requests:</strong>
                              Home changes need the Weaver within 8 blocks, with safe ground and a clear view. Conversations do not interrupt an urgent action or danger.
                            </div>
                            <div>
                              <strong className="text-red-400 block">Alienation Threshold:</strong>
                              Repeated harm can make the Weaver refuse requests, fall silent, or ask its companion to keep their distance. Apologies can help with an isolated mistake, but cannot excuse a pattern of attacks.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </UpdatedFrame>
          )}

          {/* LIGNUM GIGAS: Custom mechanics */}
          {currentEntity.id === 'lignum_gigas' && (
            <UpdatedFrame id="lignum_gigas_custom_dossier" isUpdated={true}>
              <div className="space-y-6 pt-2">
                {/* Abilities Accordion */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#c08e91]" />
                    Behavioral &amp; Combat Dossier (Click to expand details)
                  </h4>
                  
                  <div className="space-y-2">
                    {lignumGigasAbilities.map((ab, idx) => {
                      const isOpen = openAbilityIndex === idx;
                      return (
                        <div 
                          key={idx} 
                          className="bg-[#120c0c] border border-[#301618]/20 hover:border-[#4d2427]/30 rounded-lg transition-all"
                        >
                          <button
                            onClick={() => toggleAbility(idx)}
                            className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-[#c08e91] bg-[#241315]/30 border border-[#4d2427]/40 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                                {ab.category}
                              </span>
                              <span className="font-serif text-xs sm:text-sm font-bold text-[#e0e7e0] hover:text-[#c08e91] transition-colors">
                                {ab.title}
                              </span>
                            </div>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-[#5a6b5e]" /> : <ChevronDown className="w-4 h-4 text-[#5a6b5e]" />}
                          </button>
                          
                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 text-xs text-[#8c8779] border-t border-[#301618]/20 space-y-2">
                              <div className="flex items-center gap-1 text-[10px] font-mono text-amber-500">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Trigger Condition: {ab.trigger}</span>
                              </div>
                              <p className="leading-relaxed pl-1">{ab.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* State / Phase Matrix Switcher */}
                <div className="space-y-4 pt-4 border-t border-[#301618]/20">
                  <div>
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#c08e91]" />
                      Boss Phase &amp; State Matrix
                    </h4>
                    <p className="text-xs text-[#829285] leading-relaxed mt-1">
                      The Lignum Gigas operates as an immovable geometric system, executing severe repelling and disarming sequences when disturbed.
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap bg-[#070505] p-1 rounded-lg border border-[#301618]/30 max-w-xl select-none gap-1">
                    {[
                      { id: 'dormant', label: '1. Dormant Ring' },
                      { id: 'anchored', label: '2. Anchored Control' },
                      { id: 'growling', label: '3. Inventory Strip' }
                    ].map((state) => (
                      <button
                        key={state.id}
                        onClick={() => setActiveGigasState(state.id as any)}
                        className={`flex-1 text-center py-1.5 px-2 text-[10px] font-mono font-bold rounded transition-all cursor-pointer uppercase whitespace-nowrap ${
                          activeGigasState === state.id
                            ? 'bg-[#241315] text-[#e0b9bb] border border-[#4d2427]/40'
                            : 'text-[#5a6b5e] hover:text-[#829285]'
                        }`}
                      >
                        {state.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-[#110b0b] border border-[#301618]/30 rounded-xl">
                    {activeGigasState === 'dormant' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-[#c9d1c9]">
                          Phase 1: Dormant Ring Structure
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          Initial passive state. Units are arranged in a 400-block wide geometric circle consisting of exactly 7 units.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-[#e0e7e0]">Macro Alignment:</strong> All 7 units face perfectly inward toward the center point of the ring structure.</li>
                          <li><strong className="text-amber-400">Separation Constraint:</strong> Ring centers enforce a mandatory 900-block separation from other rings.</li>
                          <li><strong className="text-purple-400">Inert Surveillance:</strong> Remains completely still and silent, observing players who cross the perimeter.</li>
                        </ul>
                      </div>
                    )}

                    {activeGigasState === 'anchored' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-[#c08e91]">
                          Phase 2: Anchored Combat &amp; Radial Flinging
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          Triggered upon receiving direct damage. The behemoth fractures nearby blocks, sinks 5 blocks into the ground, and begins periodic radial flinging sweeps.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-red-400">Sinking Anchor:</strong> Instantly fractures all solid blocks within a 9-block radius and sinks 5 blocks down.</li>
                          <li><strong className="text-purple-400">Continuous Sweeps:</strong> Executes sweep passes across a 28-block radius around its base coordinate.</li>
                          <li><strong className="text-amber-400">Kinetic Repelling:</strong> Forcefully flings players high into the air, causing extreme fall damage risk.</li>
                        </ul>
                      </div>
                    )}

                    {activeGigasState === 'growling' && (
                      <div className="space-y-2">
                        <h5 className="font-serif text-sm font-bold text-amber-500">
                          Phase 3: Ender Dragon Growl &amp; Inventory Strip
                        </h5>
                        <p className="text-xs text-[#8c8779] leading-relaxed">
                          Severe defensive mechanism triggered after prolonged close-quarters combat inside its defense perimeter.
                        </p>
                        <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                          <li><strong className="text-red-400">Dragon Growl:</strong> Emits a terrifying, deep vocalization that rumbles the surrounding ground.</li>
                          <li><strong className="text-amber-300">Hotbar Evacuation:</strong> Instantly strips main-hand, off-hand, and all hotbar items from players.</li>
                          <li><strong className="text-emerald-400">Item Scatter:</strong> Casts all stripped gear onto the floor within a 28-block radius, forcing strategic retreats.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </UpdatedFrame>
          )}

          {/* VERDANT ENGINE: Custom mechanics */}
          {currentEntity.id === 'verdant_engine' && (
            <UpdatedFrame id="verdant_engine_custom_dossier" isUpdated={true}>
              <div className="space-y-6 pt-2">
                {/* Abilities Accordion */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#c08e91]" />
                    Behavioral &amp; Combat Dossier (Click to expand details)
                  </h4>
                  
                  <div className="space-y-2">
                    {verdantEngineAbilities.map((ab, idx) => {
                      const isOpen = openAbilityIndex === idx;
                      return (
                        <div 
                          key={idx} 
                          className="bg-[#120c0c] border border-[#301618]/20 hover:border-[#4d2427]/30 rounded-lg transition-all"
                        >
                          <button
                            onClick={() => toggleAbility(idx)}
                            className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-[#c08e91] bg-[#241315]/30 border border-[#4d2427]/40 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                                {ab.category}
                              </span>
                              <span className="font-serif text-xs sm:text-sm font-bold text-[#e0e7e0] hover:text-[#c08e91] transition-colors">
                                {ab.title}
                              </span>
                            </div>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-[#5a6b5e]" /> : <ChevronDown className="w-4 h-4 text-[#5a6b5e]" />}
                          </button>
                          
                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 text-xs text-[#8c8779] border-t border-[#301618]/20 space-y-2">
                              <div className="flex items-center gap-1 text-[10px] font-mono text-amber-500">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Trigger Condition: {ab.trigger}</span>
                              </div>
                              <p className="leading-relaxed pl-1">{ab.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subsystem 1: Global Hive Architecture & Spatial Telemetry */}
                <div className="space-y-3 pt-4 border-t border-[#301618]/20">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#c08e91]" />
                    Dimension-Wide Hivemind &amp; Spatial Coordination
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#0e0909] border border-[#2b1416]/30 rounded-lg space-y-2">
                      <h5 className="font-serif text-xs font-bold text-[#e0e7e0] flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        256x256 Coordinate Grid &amp; Destination Locking
                      </h5>
                      <p className="text-[11px] text-[#8c8779] leading-relaxed">
                        The dimension is mathematically mapped into 256x256 block coordinate regions. When an engine initiates relocation, it locks its target region in the shared hive register, applying a severe -50,000 fitness penalty to prevent two engines from ever selecting or contending for the same sector.
                      </p>
                    </div>
                    <div className="p-3.5 bg-[#0e0909] border border-[#2b1416]/30 rounded-lg space-y-2">
                      <h5 className="font-serif text-xs font-bold text-[#e0e7e0] flex items-center gap-2">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        Deterministic Radial Fanning &amp; Separation
                      </h5>
                      <p className="text-[11px] text-[#8c8779] leading-relaxed">
                        Engines divide the 360-degree radial compass by total active members (2π multiplied by index divided by member count), fanning out uniformly without intersecting. In non-relocating states, engines enforce a strict 50-block repulsion bubble to prevent idling clusters.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subsystem 2: Transmutation Pipeline & Contention Locking */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#c08e91]" />
                    Subterranean Rod Infection &amp; Contention Controls
                  </h4>
                  <div className="p-4 bg-[#0e0909] border border-[#2b1416]/30 rounded-lg space-y-3">
                    <p className="text-xs text-[#8c8779] leading-relaxed">
                      Continuous downward gravity beams project vertical infected wood pillars through surface dirt, stone strata, deepslate, and subterranean caverns down to the bottom of the world. High-density multi-engine operations are protected by a 3-tier safety pipeline:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px]">
                      <div className="p-2.5 bg-[#150d0d] border border-[#301618]/40 rounded">
                        <span className="text-red-400 font-bold block mb-1">1. Chunk Leases (8 Ticks)</span>
                        <span className="text-[#8c8779]">Closer engine claims exclusive chunk execution rights; farther units skip redundant work.</span>
                      </div>
                      <div className="p-2.5 bg-[#150d0d] border border-[#301618]/40 rounded">
                        <span className="text-amber-400 font-bold block mb-1">2. Column Cooldown (100 Ticks)</span>
                        <span className="text-[#8c8779]">Sampled columns are locked for 5 seconds across a 65,536-entry coordinator cache.</span>
                      </div>
                      <div className="p-2.5 bg-[#150d0d] border border-[#301618]/40 rounded">
                        <span className="text-emerald-400 font-bold block mb-1">3. Salted Tick Hash (16K)</span>
                        <span className="text-[#8c8779]">Prevents single-tick duplicate checks, salted per dimension and server level.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subsystem 3: Two-Tier Grid Auditing & Gap Correction */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#c08e91]" />
                    Two-Tier Grid Audits &amp; Coverage Gap Targeting
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#0e0909] border border-[#2b1416]/30 rounded-lg space-y-2">
                      <h5 className="font-serif text-xs font-bold text-[#e0e7e0]">5x5 Coarse to 9x9 Fine Surveys</h5>
                      <p className="text-[11px] text-[#8c8779] leading-relaxed">
                        Surveys evaluate 256x256 block sectors on a 5x5 coarse grid during early infection, automatically escalating to a 9x9 high-density audit once measured saturation reaches 90%.
                      </p>
                    </div>
                    <div className="p-3.5 bg-[#0e0909] border border-[#2b1416]/30 rounded-lg space-y-2">
                      <h5 className="font-serif text-xs font-bold text-[#e0e7e0]">Gap Pinpointing &amp; Direct Repairs</h5>
                      <p className="text-[11px] text-[#8c8779] leading-relaxed">
                        Surveys locate the exact coordinates of uninfected ground pockets, routing relocation into gaps before sector departure. At mature radius (90% or higher), engines directly repair up to 8 failed probe columns per check.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subsystem 4: Fractus Orbital Defense Rings */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Fractus Orbital Defense Rings (39 Guard Slots across 3 Tiers)
                  </h4>
                  <div className="p-4 bg-[#0e0909] border border-[#2b1416]/30 rounded-lg space-y-3">
                    <p className="text-xs text-[#8c8779] leading-relaxed">
                      Active Verdant Engines serve as central aerial nexuses for Fractus sentinels, drawing up to 39 drones into synchronized, rotating orbital defense rings. Sentinels utilize the engine's projectile dampening field for shielding while providing multi-angle thermal laser protection.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px]">
                      <div className="p-2.5 bg-[#150d0d] border border-cyan-950/40 rounded">
                        <span className="text-cyan-400 font-bold block mb-1">Tier 1: Middle Ring (Slots 0..12)</span>
                        <span className="text-[#8c8779]">Strictly filled first at the engine's vertical center (Y + 50% height). Phase offset 0.0.</span>
                      </div>
                      <div className="p-2.5 bg-[#150d0d] border border-cyan-950/40 rounded">
                        <span className="text-cyan-400 font-bold block mb-1">Tier 2: Bottom Ring (Slots 13..25)</span>
                        <span className="text-[#8c8779]">Filled second around the lower hull (Y + 15% height). Phase offset π / 13.</span>
                      </div>
                      <div className="p-2.5 bg-[#150d0d] border border-cyan-950/40 rounded">
                        <span className="text-cyan-400 font-bold block mb-1">Tier 3: Top Ring (Slots 26..38)</span>
                        <span className="text-[#8c8779]">Filled third around the upper crown (Y + 85% height). Phase offset 2π / 39.</span>
                      </div>
                    </div>
                    <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px] pt-1 border-t border-[#301618]/20">
                      <li><strong className="text-cyan-300">Synchronized Celestial Orbit:</strong> Rings rotate at 0.00125 radians/tick with harmonic vertical wave bobbing at a standoff radius of (hitbox radius + 10.4) * 1.125 blocks.</li>
                      <li><strong className="text-amber-400">Dynamic Peel-Off &amp; Re-Slotting:</strong> Sentinels smoothly break formation to engage approaching hostiles, automatically returning to their reserved ring slots once threats are neutralized.</li>
                      <li><strong className="text-red-400">Core Beam Avoidance:</strong> Drones continuously calculate cylindrical collision margins, maintaining a 12-block safety radius away from the central downward terraforming beam.</li>
                    </ul>
                  </div>
                </div>

                {/* Subsystem 5: Spacetime Defense & Kinetic Distortion */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#c08e91]" />
                    Spacetime Defense &amp; Projectile Nullification Field
                  </h4>
                  <div className="p-4 bg-[#0e0909] border border-[#2b1416]/30 rounded-lg space-y-2.5">
                    <p className="text-xs text-[#8c8779] leading-relaxed">
                      Surrounding airspace is distorted inside a 48-block defensive sphere. Incoming arrows, fireworks, and projectile entities experience up to 90% motion drag. Living players attempting flight or kinetic strikes face active atmospheric suppression:
                    </p>
                    <ul className="text-xs text-[#8c8779] space-y-1.5 pl-3.5 list-disc leading-relaxed font-mono text-[11px]">
                      <li><strong className="text-red-400">Anti-Elytra Wing Collapse:</strong> Gliding victims have their flight momentum arrested and chestplate wing states disrupted, while nearby firework rockets are vaporized instantly.</li>
                      <li><strong className="text-amber-400">Riptide Stall:</strong> Trident-spinning attackers are clamped to 15% velocity, stripping impulse momentum on contact.</li>
                      <li><strong className="text-purple-400">Zero-G Suspension &amp; Repulsion:</strong> Intruders within 16 blocks are pushed outward and lifted into low-gravity floating suspension.</li>
                      <li><strong className="text-[#e0e7e0]">Non-Terraforming Dampening (55%):</strong> During idle navigation, relocation leaps, or dormancy, defensive drag and pushback automatically dampen down to 55% power.</li>
                    </ul>
                  </div>
                </div>

                {/* Subsystem 6: World Border Margin & Collective Dormancy */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b2797c] font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-[#c08e91]" />
                    World Border Clearance, Final Sweep &amp; Collective Dormancy
                  </h4>
                  <div className="p-4 bg-[#0e0909] border border-[#2b1416]/30 rounded-lg space-y-2.5 text-xs text-[#8c8779] leading-relaxed">
                    <p>
                      All physical navigation, coordinate locking, and candidate searches strictly maintain a 25-block clearance inside the active world border. In compact custom borders, relocation jump distances automatically adapt from 64 down to 224 blocks to stay within boundaries.
                    </p>
                    <div className="p-3 bg-[#150d0d] border border-[#301618]/40 rounded-lg text-[11px] space-y-1.5">
                      <strong className="text-red-400 font-serif block">Final Sweep &amp; Border Expansion Wake-up Protocol:</strong>
                      <p>
                        Before entering dormancy, the hive executes a complete verification sweep across all regions. When 100% of regions inside the border achieve 95% or higher saturation, all engines transition into silent low-power hover with 70-tick one-shot closing petal animations. If world borders expand, the hive instantly detects new uninfected territory, clears dormancy, wakes every engine, and dispatches them into the frontier.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </UpdatedFrame>
          )}

          {/* FRACTUS: Custom mechanics */}
          {currentEntity.id === 'fractus' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-cyan-950/10 border border-cyan-900/20 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-cyan-400">Sub-Strata Sentry Drone:</strong> Stationed to guard ancient geometries and Menger Sponge structures, these airborne sentinels operate on autonomous security protocols. They can evade some incoming projectiles, and coordinate into disciplined 3-tier orbital rings (up to 39 drones) around active Verdant Engines for broader coverage and the engine's projectile dampening field.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-[#e0e7e0] mb-2">Aerial Maneuvering &amp; Orbital Formations</h5>
                  <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4">
                    <li>Maintains stable airborne hovering, elevating when entering aggressive combat states.</li>
                    <li>Dynamically lowers altitude in tight subterranean corridors to establish line-of-sight locks.</li>
                    <li>Retreats smoothly to maintain optimal standoff distance while channeling beam attacks.</li>
                    <li><strong className="text-cyan-400">3-Tier Orbital Defense Screen:</strong> Assembles into Middle (0..12), Bottom (13..25), and Top (26..38) rings around Verdant Engines, dynamically peeling off to intercept hostiles, steering clear of the core beam, and returning smoothly to assigned slots.</li>
                  </ul>
                </div>
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-[#e0e7e0] mb-2 font-mono text-cyan-400">Target-Lock Laser &amp; Mega Burst</h5>
                  <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4">
                    <li><strong className="text-white">Calm Tracking:</strong> Channels continuous thermal beam pulses against standard intruders.</li>
                    <li><strong className="text-white">Aggressive Overdrive:</strong> Rapidly increases beam tick frequency and damage when agitated.</li>
                    <li><strong className="text-white">Disruption Vulnerability:</strong> Sustaining direct damage during laser charge breaks the emitter cycle and forces a recalibration.</li>
                    <li><strong className="text-cyan-400">Mega Laser Burst:</strong> Fires long-range concentrated thermal sweeps capable of piercing distant targets.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-[#0c120d] border border-emerald-900/30 rounded-lg space-y-2">
                <h5 className="font-serif text-sm font-bold text-emerald-400">The Summoning Ritual</h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  When multiple Fractus sentinels assemble in close proximity, they circle a shared focal point and direct their beams inward as they prepare a coordinated summon.
                </p>
                <ul className="text-xs text-[#8c8779] list-disc pl-4 leading-relaxed">
                  <li><strong className="text-white">Collaborative Acceleration:</strong> More participating sentinels shorten the preparation time.</li>
                  <li><strong className="text-white">Ritual Disruption:</strong> Losing participants extends the remaining preparation time. The formation is cancelled if fewer than two sentinels remain.</li>
                  <li><strong className="text-emerald-400">Summon Result:</strong> At completion, the formation creates either a <strong className="text-cyan-400 font-bold">Fractus Prime</strong> or a <strong className="text-red-400 font-bold">Rot</strong> at a safe point near its center.</li>
                </ul>
              </div>
            </div>
          )}

          {/* FRACTUS PRIME: Custom mechanics */}
          {currentEntity.id === 'fractus_prime' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-cyan-950/20 border border-cyan-900/40 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-cyan-400">Elite Planetary Laser Overseer:</strong> The colossal overseer drone commands a vast aerial perimeter. It bypasses camouflage, holds targets in telekinetic suspension, splits its laser array across multiple adversaries, and unleashes destructive energy detonations.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-1.5">
                  <h5 className="font-serif text-sm font-bold text-cyan-400">Multi-Target Split Arrays</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed font-sans">
                    Commands a broad combat engagement radius with intensified laser output.
                  </p>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    When engaging multiple threats or powerful adversaries, it splits its optical emitter into multiple concurrent beams, independently tracking and incinerating separate targets simultaneously.
                  </p>
                </div>
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-1.5">
                  <h5 className="font-serif text-sm font-bold text-cyan-400">Helix Ray &amp; Telekinetic Hold</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Sweeps a colossal dual-helix beam across extreme distances. Targets caught in its focal grip are suspended mid-air in a tractor beam lock.
                  </p>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    <strong>Grip Escape:</strong> Sustained physical strikes against the Prime weaken its tractor hold and force it to release the trapped target.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#140d0d] border border-red-950/40 rounded-lg space-y-2">
                <h5 className="font-serif text-sm font-bold text-red-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-red-500" />
                  Energy Sphere Burst
                </h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  Periodically charges an expanding core energy sphere before releasing a devastating shockwave that expands outward in a wide radius.
                </p>
                <ul className="text-xs text-red-300 pl-4 list-disc space-y-1 leading-relaxed">
                  <li>Vaporizes surrounding brittle blocks and foliage caught in the blast envelope.</li>
                  <li>Deals massive concussive damage and radial knockback to all non-woodbound targets caught in the detonation.</li>
                  <li><strong className="text-emerald-400">Post-Burst Fatigue:</strong> Enters a brief cooldown phase following the blast with reduced mobility and exposed defenses, giving adversaries a vital counterattack opening.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-1">
                  <h5 className="font-serif text-sm font-bold text-cyan-400">Echolocation Network</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Emits acoustic pulses to locate nearby entities with the Invisibility effect. A detected target is marked with particles and tracked briefly for combat targeting.
                  </p>
                </div>
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-1">
                  <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Sonic Absorption</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Its stronger, thicker body and its denser core allows it be more resistant to the Warden's sonic boom, absorbing 55% of the damage.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Global Statistics Table */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#e0e7e0]">Global Entity Database</h3>
        
        <div className="overflow-x-auto rounded-lg border border-[#1a221c] bg-[#0a0c0a] scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#111612] text-[#829285] border-b border-[#1c241e]">
                <th className="p-3 text-left">Entity</th>
                <th className="p-3 text-center">Health (HP)</th>
                <th className="p-3 text-center">Damage</th>
                <th className="p-3 text-center">Armor</th>
                <th className="p-3 text-center">Move Speed</th>
                <th className="p-3 text-center">Rose Wilt Trigger</th>
                <th className="p-3 text-center">Max Hardness Cap</th>
                <th className="p-3 text-center">Builds / Bridges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171f18] text-[#829285]">
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Splinter</td>
                <td className="p-3 text-center font-mono">30</td>
                <td className="p-3 text-center font-mono">6</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0.335</td>
                <td className="p-3 text-center font-mono">450t</td>
                <td className="p-3 text-center font-mono">50</td>
                <td className="p-3 text-center text-emerald-400 font-mono">Yes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Kyne Splinter</td>
                <td className="p-3 text-center font-mono">20</td>
                <td className="p-3 text-center font-mono">5</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0.280</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">50</td>
                <td className="p-3 text-center font-mono text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Dorceless Splinter</td>
                <td className="p-3 text-center font-mono">24</td>
                <td className="p-3 text-center font-mono">6</td>
                <td className="p-3 text-center font-mono">3</td>
                <td className="p-3 text-center font-mono">0.220</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">50</td>
                <td className="p-3 text-center text-emerald-400 font-mono">Yes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Log Splinter</td>
                <td className="p-3 text-center font-mono">32</td>
                <td className="p-3 text-center font-mono">6</td>
                <td className="p-3 text-center font-mono">2</td>
                <td className="p-3 text-center font-mono">0.335</td>
                <td className="p-3 text-center font-mono">750t</td>
                <td className="p-3 text-center font-mono">50</td>
                <td className="p-3 text-center text-emerald-400 font-mono">Yes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Blindspot Splinter</td>
                <td className="p-3 text-center font-mono">30</td>
                <td className="p-3 text-center font-mono">6</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0.335</td>
                <td className="p-3 text-center text-amber-500 font-mono font-bold">150t</td>
                <td className="p-3 text-center font-mono">50</td>
                <td className="p-3 text-center text-emerald-400 font-mono">Yes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Petrified Log Splinter</td>
                <td className="p-3 text-center font-mono">56</td>
                <td className="p-3 text-center font-mono">8</td>
                <td className="p-3 text-center font-mono">4</td>
                <td className="p-3 text-center font-mono">0.300</td>
                <td className="p-3 text-center font-mono">400t</td>
                <td className="p-3 text-center font-mono">60</td>
                <td className="p-3 text-center text-emerald-400 font-mono">Yes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">The Hollow</td>
                <td className="p-3 text-center font-mono">10</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0.300</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Stilt Walker</td>
                <td className="p-3 text-center font-mono">40</td>
                <td className="p-3 text-center text-gray-500">N/A</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0.160</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">50</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr className="bg-emerald-950/20">
                <td className="p-3 font-bold text-emerald-400 text-left">The Ash-Weaver</td>
                <td className="p-3 text-center font-mono">40</td>
                <td className="p-3 text-center font-mono">4</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">Walk / Sprint</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr className="bg-red-950/10">
                <td className="p-3 font-bold text-red-400 text-left">The Rot (Sentinel)</td>
                <td className="p-3 text-center font-bold text-[#e0e7e0] font-mono">550 (+2/min)</td>
                <td className="p-3 text-center text-[#e0e7e0] font-mono">18 (Adaptive)</td>
                <td className="p-3 text-center font-bold text-[#e0e7e0] font-mono">15</td>
                <td className="p-3 text-center font-mono">0.3 (Adaptive)</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">60</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Lignum Gigas</td>
                <td className="p-3 text-center font-mono">1008</td>
                <td className="p-3 text-center font-mono">3</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono font-bold">0.0</td>
                <td className="p-3 text-center text-gray-500 font-mono font-bold">N/A</td>
                <td className="p-3 text-center font-mono">40</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Fractus</td>
                <td className="p-3 text-center font-mono">48</td>
                <td className="p-3 text-center font-mono">2 (3 Phase 2)</td>
                <td className="p-3 text-center font-mono">6</td>
                <td className="p-3 text-center font-mono">0.200</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">0.2</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Fractus Prime</td>
                <td className="p-3 text-center font-mono">270</td>
                <td className="p-3 text-center font-mono">21.3 (55.0 Phase 2)</td>
                <td className="p-3 text-center font-mono">20</td>
                <td className="p-3 text-center font-mono">0.200</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">4.5</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Lignum Vermis</td>
                <td className="p-3 text-center font-mono">10</td>
                <td className="p-3 text-center font-mono">1</td>
                <td className="p-3 text-center font-mono">0.5</td>
                <td className="p-3 text-center font-mono">0.230</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Lignum Palus</td>
                <td className="p-3 text-center font-mono">50</td>
                <td className="p-3 text-center font-mono">8</td>
                <td className="p-3 text-center font-mono">6</td>
                <td className="p-3 text-center font-mono">0.05 / 0.12</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">10</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Petrified Lignum Trilobita</td>
                <td className="p-3 text-center font-mono">40</td>
                <td className="p-3 text-center font-mono">4</td>
                <td className="p-3 text-center font-mono">14</td>
                <td className="p-3 text-center font-mono">0.140</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono text-emerald-400">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Lignum Trilobita</td>
                <td className="p-3 text-center font-mono">18</td>
                <td className="p-3 text-center font-mono">3</td>
                <td className="p-3 text-center font-mono">8</td>
                <td className="p-3 text-center font-mono">0.220</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono text-emerald-400">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Lignum Spina</td>
                <td className="p-3 text-center font-mono">12</td>
                <td className="p-3 text-center font-mono">4 (+ Thorns)</td>
                <td className="p-3 text-center font-mono">4</td>
                <td className="p-3 text-center font-mono">0.320</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Petrified Lignum Spina</td>
                <td className="p-3 text-center font-mono">28</td>
                <td className="p-3 text-center font-mono">6 (+ Thorns)</td>
                <td className="p-3 text-center font-mono">8</td>
                <td className="p-3 text-center font-mono">0.260</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Lignum Echinus</td>
                <td className="p-3 text-center font-mono">16</td>
                <td className="p-3 text-center font-mono">4 (+ Spikes)</td>
                <td className="p-3 text-center font-mono">4</td>
                <td className="p-3 text-center font-mono">0.350</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Petrified Lignum Echinus</td>
                <td className="p-3 text-center font-mono">32</td>
                <td className="p-3 text-center font-mono">7 (+ Spikes)</td>
                <td className="p-3 text-center font-mono">10</td>
                <td className="p-3 text-center font-mono">0.380</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Hewn Splinter</td>
                <td className="p-3 text-center font-mono">6</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0.0</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">50</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr className="bg-[#2c0f12]/20">
                <td className="p-3 font-bold text-[#cc7e82] text-left">Woodweaver (Boss)</td>
                <td className="p-3 text-center font-mono font-bold text-[#e0e7e0]">370</td>
                <td className="p-3 text-center font-mono">16 (Beam/Melee)</td>
                <td className="p-3 text-center font-mono">20</td>
                <td className="p-3 text-center font-mono">0.280</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr className="bg-[#221315]/40">
                <td className="p-3 font-bold text-[#cf8f92] text-left">Verdant Engine</td>
                <td className="p-3 text-center font-mono font-bold text-[#e0e7e0]">2,500</td>
                <td className="p-3 text-center font-mono text-gray-500">0 (Spacetime)</td>
                <td className="p-3 text-center font-mono">150 (+40 Tough)</td>
                <td className="p-3 text-center font-mono">0.300</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

