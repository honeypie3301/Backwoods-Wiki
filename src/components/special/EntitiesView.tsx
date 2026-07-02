import React, { useState, useEffect } from 'react';
import { 
  Shield, Sparkles, ChevronDown, ChevronUp, Skull, AlertCircle, 
  Heart, Swords, Eye, Zap, BookOpen, Activity, Compass, 
  EyeOff, ShieldAlert, Award, Package, RefreshCw, ArrowUpDown 
} from 'lucide-react';
import ModelViewer from './ModelViewer';

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
  }
};

const ENTITY_IMMUNITIES: Record<string, string[]> = {
  rot: ["Fall Damage", "Cactus", "Drowning"],
  splinter: ["Poison", "Splash Potions", "Cactus", "Drowning", "Dragon's Breath"],
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
  lignum_palus: ["Poison", "Splash Potions", "Cactus", "Drowning", "Falling Anvils", "Wither"]
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
  threatLevel: 'Low' | 'Medium' | 'High' | 'Extreme' | 'Extermination Class';
  threatColor: string;
  badgeBg: string;
  borderColor: string;
  hp: string;
  damage: string;
  armor: string;
  speed: string;
  dim: string;
  desc: string;
}

export default function EntitiesView() {
  const [selectedEntity, setSelectedEntity] = useState<string>('rot');
  const [activeTotemState, setActiveTotemState] = useState<'dormant' | 'empowered' | 'infinity'>('dormant');
  const [openAbilityIndex, setOpenAbilityIndex] = useState<number | null>(0);
  const [sortBy, setSortBy] = useState<'default' | 'threat-asc' | 'threat-desc'>('default');

  const THREAT_VALUES: Record<string, number> = {
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
      damage: "18 Base (Adaptive / Mimicked multipliers)",
      armor: "15 Points",
      speed: "0.3 (Scales dynamically in combat cycle)",
      dim: "The Backwoods / Dynamic Sentry deployment",
      desc: "An advanced multi-dimensional biological sentinel designed to neutralize high-tier players carrying powerful gear modifiers. It starts combat in a dormant state, demonstrating no magical powers, but dynamically studies, adapts, and mimics your combat behaviors as the battle progresses."
    },
    {
      id: "splinter",
      name: "The Splinter",
      title: "Woodbound Predator",
      threatLevel: "Medium",
      threatColor: "text-amber-400",
      badgeBg: "bg-amber-950/30 border-amber-900/40 text-amber-400",
      borderColor: "border-amber-950/20",
      hp: "30 HP",
      damage: "6 (3 Hearts)",
      armor: "0 Points",
      speed: "0.335",
      dim: "The Backwoods (Dense Oak/Spruce forests)",
      desc: "The primary threat of the Backwoods. A gaunt, hollow wooden figure that hunts targets with infinite patience. Upon spawning, each unit is assigned a stealth Stalker profile or a weeping Angel profile that advances only when unwatched."
    },
    {
      id: "log_splinter",
      name: "Log Splinter",
      title: "Camouflaged Sentry",
      threatLevel: "Medium",
      threatColor: "text-amber-500",
      badgeBg: "bg-amber-950/40 border-amber-800/40 text-amber-500",
      borderColor: "border-amber-900/20",
      hp: "32 HP",
      damage: "6 (3 Hearts)",
      armor: "2 Points (Dense Bark)",
      speed: "0.335",
      dim: "The Backwoods / Forestry Mimicry",
      desc: "A heavier, bark-skinned variant of the standard Splinter possessing elevated health and a custom wood-rich dropset. It excels at camouflaging against local trees, packing tightly together in mature world phases."
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
      desc: "A terrifying sub-species that leverages advanced visual manipulation, turning completely invisible when viewed through the front third-person camera perspective. It wilts protective Ash-Roses at accelerated rates."
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
      desc: "A highly resilient, fossilized variant of the Splinter lineage. Adapted to the extreme pressures of the Petrified Weald, it moves slower but acts as a dense physical shield, taking minimal damage from kinetic strikes."
    },
    {
      id: "hollow",
      name: "The Hollow",
      title: "Phantom Spectator",
      threatLevel: "Low",
      threatColor: "text-teal-400",
      badgeBg: "bg-teal-950/20 border-teal-900/30 text-teal-400",
      borderColor: "border-teal-950/10",
      hp: "10 HP",
      damage: "0 (Passive Stalker)",
      armor: "0 Points",
      speed: "0.300 (Teleporting)",
      dim: "Deep Backwoods Canopy",
      desc: "An eerie stalking entity that never engages in physical confrontation. Instead, it looms in the distant fog, teleporting closer when the player is distracted, and instantly vanishes into thin air if attacked."
    },
    {
      id: "stilt_walker",
      name: "Stilt Walker",
      title: "Dimensional Observer",
      threatLevel: "High",
      threatColor: "text-purple-400",
      badgeBg: "bg-purple-950/30 border-purple-900/40 text-purple-400",
      borderColor: "border-purple-950/20",
      hp: "40 HP",
      damage: "N/A (Spawns swarms on stalk cycle)",
      armor: "0 Points",
      speed: "0.160",
      dim: "The Backwoods / Tall Canopies",
      desc: "A tall, looming figure that watches from extreme distances. Prolonged observation activates its hostile phase. It locks its gaze unyieldingly on the player, rotating its body continuously even when teleporting."
    },
    {
      id: "ash_weaver",
      name: "The Ash-Weaver",
      title: "Sub-Realm Gardener",
      threatLevel: "Low",
      threatColor: "text-emerald-400",
      badgeBg: "bg-emerald-950/20 border-emerald-900/30 text-emerald-400",
      borderColor: "border-emerald-950/10",
      hp: "40 HP",
      damage: "0 (Completely Passive)",
      armor: "0 Points",
      speed: "0.3",
      dim: "The Backwoods (Flat biomes)",
      desc: "A rare, completely harmless entity that drifts peacefully across forest floors, planting defensive Ash-Roses in its wake. It always drops ash roses when defeated. Survivalists frequently follow its trail to harvest raw protective blossoms."
    },
    {
      id: "lignum_gigas",
      name: "Lignum Gigas",
      title: "Woodbound Titan Behemoth",
      threatLevel: "Extreme",
      threatColor: "text-rose-500",
      badgeBg: "bg-rose-950/30 border-rose-900/40 text-rose-400",
      borderColor: "border-rose-950/20",
      hp: "1,008 HP",
      damage: "3 (Plus massive fall damage launches)",
      armor: "0 Points (Absorbs damage via massive health regen)",
      speed: "0.000 (Immobile Behemoth)",
      dim: "Wood Plains & The Thicket (Colossal Ring formations)",
      desc: "A gargantuan stationary biomechanical titan standing 80 blocks tall. Built from ancient interlocking oak planks, it channels the legendary properties of the Coelum Carnis. Striking it triggers apocalyptic defensive routines."
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
      damage: "2.0 Base / 3.0 Angry (Constant Laser Tick)",
      armor: "6 Points (Metallic Chassis)",
      speed: "0.200 (Ignoring Gravity)",
      dim: "The Sub-Strata (Menger Sponge structures)",
      desc: "A floating security drone guarding ancient geometries deep underground. It maintains strict tactical combat distances, utilizes tracking lasers, predictively evades projectiles, and coordinates summoning rituals with partners."
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
      damage: "21.3 Base / 55.0 Angry (Divided across multi-targets)",
      armor: "20 Points (High Alloy Plating)",
      speed: "0.200 (High-velocity reverse thrust)",
      dim: "The Sub-Strata (Summoned via Drone Rituals)",
      desc: "A 2x scaled orbital laser battery defense drone. It commands a massive 48-block threat range, capable of engaging multiple targets simultaneously with split laser arrays, gravity-suspension, and devastating wide-area Helix beams."
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
      desc: "A neutral, arthropod organism constructed entirely of segmented oak planks. Mirroring a wooden silverfish in scale and model size, it blends into forest debris, wood blocks, and abandoned mineshafts. Its diminutive stature allows it to squeeze through narrow apertures and crawl into spaces larger entities cannot navigate."
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
      desc: "A towering, grid-bound entity standing approximately 5.8 blocks tall that stalks its prey through architecture, mimicry, and psychic coercion. It navigates exclusively along the cardinal axis of block grids, moving in perfectly straight lines and turning only at right angles to blend into structural columns."
    }
  ];

  const rotAbilities: Ability[] = [
    {
      title: "Adaptive Learning & Cooldown Compression",
      trigger: "Continuous engagement up to 1 real-world hour (72,000 ticks)",
      description: "Studies target patterns over time. Cooldowns compress dynamically from a slow 160 ticks down to a frantic, relentless 20 ticks at peak combat cycles, rendering normal wars of attrition impossible.",
      category: "Escalation"
    },
    {
      title: "Adaptive Health Regeneration",
      trigger: "Triggered after absorbing 50 cumulative damage",
      description: "Healing factor accelerates dramatically the longer the fight lasts, scaling to extreme critical healing rates when its health drops below 50% and 25% thresholds.",
      category: "Defense"
    },
    {
      title: "Sonic Boom Resonance",
      trigger: "Engaging a Warden entity",
      description: "Instantly mimics the Warden's specialized auditory physiology, gaining a devastating ranged sonic shockwave blast with direct armor bypassing.",
      category: "Mimicry"
    },
    {
      title: "Thermal Synthesis (Beams)",
      trigger: "Taking fire/cold damage, or entering hot/cold biomes",
      description: "Fires specialized lasers that bore through terrain. Solar Beam (heat) melts armor with unmitigable fire damage. Cryo Beam (cold) rapidly freezes and shatters targets with high critical multipliers.",
      category: "Lethal Ranged"
    },
    {
      title: "Dimensional Spacing (Blink)",
      trigger: "End stimuli (End dimension, Ender Pearls, or End creatures nearby)",
      description: "Adapts instant teleporting dodge maneuvers (18-tick cooldown), making it exceptionally evasive and allowing it to reposition behind the player's blind spots.",
      category: "Mobility"
    },
    {
      title: "Martial Combat Combos (Minos Protocol)",
      trigger: "Active once physical coordination and tactical pacing synchronize",
      description: "Unlocks spectacular martial combinations: floor slams, dropkicks, rider kicks, launching the target skyward and spiking them back with kinetic momentum, and shield-breaking punches followed by high-velocity diving kicks.",
      category: "Melee Combos"
    }
  ];

  const toggleAbility = (idx: number) => {
    setOpenAbilityIndex(openAbilityIndex === idx ? null : idx);
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
      }
    };
    window.addEventListener('wiki-scroll-to-heading', handleHeadingClick);
    return () => window.removeEventListener('wiki-scroll-to-heading', handleHeadingClick);
  }, [entities]);

  const sortedEntities = React.useMemo(() => {
    if (sortBy === 'default') return entities;
    return [...entities].sort((a, b) => {
      const valA = THREAT_VALUES[a.threatLevel] || 0;
      const valB = THREAT_VALUES[b.threatLevel] || 0;
      return sortBy === 'threat-asc' ? valA - valB : valB - valA;
    });
  }, [sortBy, entities]);

  const currentEntity = entities.find(e => e.id === selectedEntity) || entities[0];

  return (
    <div className="space-y-8 select-text">
      
      {/* Intro section */}
      <div className="p-5 bg-[#0f1210] border border-[#1c241e] rounded-lg">
        <p className="text-sm text-[#c9d1c9] leading-relaxed">
          The Backwoods environment is populated by highly aggressive, adaptive organisms. This dossier provides classified intelligence, operational mechanics, and behavioral logic for all documented entities.
        </p>
      </div>

      {/* Main Grid: Sidebar + Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Selector */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[380px] lg:max-h-none overflow-y-auto pr-1 scrollbar-thin">
            {sortedEntities.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedEntity(e.id)}
                className={`w-full text-left px-3.5 py-3 rounded-lg border transition-all shrink-0 lg:shrink cursor-pointer flex flex-col justify-between ${
                  selectedEntity === e.id
                    ? 'bg-gradient-to-r from-red-950/30 to-zinc-900 text-[#e0e7e0] border-red-900/40 font-semibold shadow-md'
                    : 'bg-[#0a0c0a] hover:bg-[#121612] text-[#829285] border-[#161c17]'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-serif text-sm text-[#e0e7e0]">{e.name}</span>
                  <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${e.badgeBg}`}>
                    {e.threatLevel}
                  </span>
                </div>
                <div className="text-[10px] text-[#5a6b5e] font-mono mt-1 italic">{e.title}</div>
              </button>
            ))}
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
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#e0e7e0] mt-1">{currentEntity.name}</h3>
              <p className="text-xs text-[#709978] font-mono mt-0.5">{currentEntity.title}</p>
            </div>
            <div className="shrink-0">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${currentEntity.badgeBg}`}>
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
                    The Rot scans for equipped Totems of Undying or Infinity Totems in your hand. Within a 12-block radius, it siphons the totem over a 4-second sequence and crushes it to permanently empower itself.
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
                        The sentinel displays standard attributes (550 HP base) and pursues players relying purely on standard learned cooldown triggers. Equipped totems remain safe unless the player allows the sentinel to approach within close proximity.
                      </p>
                    </div>
                  )}

                  {activeTotemState === 'empowered' && (
                    <div className="space-y-2">
                      <h5 className="font-serif text-sm font-bold text-amber-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Standard Totem (Empowered State)
                      </h5>
                      <ul className="text-xs text-[#8c8779] space-y-1 pl-3.5 list-disc leading-relaxed">
                        <li><strong className="text-[#e0e7e0]">+50% Attack Damage</strong> and <strong className="text-[#e0e7e0]">+35% Movement Speed</strong> modifiers.</li>
                        <li>Global ability cooldowns tick down twice as fast (ultra-fast combo chain pacing).</li>
                        <li>Melee combos scale to a terrifying <strong>85% activation chance</strong> per physical strike.</li>
                        <li>Attacks punch tunnels directly through structural blocks behind the impact point.</li>
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
                        Consuming the legendary Infinity Totem—supported via compatibility with the <a href="https://www.curseforge.com/minecraft/mc-mods/re-avaritia" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline font-medium">Avaritia</a> mod—elevates the sentinel to its ultimate limit state, triggering permanent <strong className="text-red-400">Infinity Mode</strong>:
                      </p>
                      <ul className="text-xs text-[#8c8779] space-y-1 pl-3.5 list-disc leading-relaxed">
                        <li>Inherits all damage and speed adjustments of the standard Empowered state.</li>
                        <li>Grants immense, continuous <strong className="text-emerald-400 font-bold">passive health regeneration</strong> that heals wounds in real time.</li>
                        <li>Significantly enlarges shockwaves, blast radii, and basic attack damage, driving aggression to maximum limits.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Survivor lore intercept */}
              <div className="pt-4 border-t border-red-950/20 space-y-2">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-red-400" />
                  Survivor Log Intercept
                </h4>
                <p className="text-xs text-[#8c8779] leading-relaxed italic p-3 bg-[#0d0707] border-l-2 border-red-600 rounded-r-md">
                  "I critical-struck it with maxed Netherite gear, but the horror adapted right before my eyes. Its skin hardened, my sword bounced off. It shredded through my obsidian walls like paper. Then, it grabbed the Totem of Undying directly out of my hand, crushed it, and absorbed the particles to empower itself. I survived only by crawling into a rock fissure..."
                </p>
              </div>
            </div>
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
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    The Rage Mechanic
                  </h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Staring at a Splinter for too long triggers a sudden state of <strong className="text-amber-500">rage</strong>, overriding its freeze behavior. Striking the entity decreases this sight threshold, provoking enrage reactions progressively faster.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#120e09] border border-amber-900/20 rounded-lg space-y-1.5">
                <h5 className="font-serif text-sm font-bold text-amber-400">Kinship Alarm (On Death)</h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  Upon death, a Splinter broadcasts a panic wave that forces all woodbound entities within range into an enraged hunt state for <strong className="text-amber-300 font-mono">600 ticks (30s)</strong>.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-[10px] text-center text-[#829285]">
                  <div className="p-2 bg-[#090705] rounded">Easy: <strong className="text-emerald-400">24 blocks</strong></div>
                  <div className="p-2 bg-[#090705] rounded">Normal: <strong className="text-amber-400">40 blocks</strong></div>
                  <div className="p-2 bg-[#090705] rounded">Hard: <strong className="text-red-400">64 blocks</strong></div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Environmental Hazards & Navigation</h5>
                <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4 leading-relaxed">
                  <li><strong className="text-[#c9d1c9]">Adaptive Navigation:</strong> If you build up, it builds blocks upward. If you cross a gorge, it bridges across. Mines dividing terrain blockades (slower for high hardness materials).</li>
                  <li><strong className="text-purple-400">Dimensional Pull:</strong> A rare subset (10%) carry a 10% chance per hit to drag the victim directly into <strong className="text-purple-300 font-bold">The Grain</strong>.</li>
                  <li><strong className="text-emerald-400">Ash-Rose Vulnerability:</strong> Holding an Ash-Rose halts movement, and planting one freezes all Splinters within its aura.</li>
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
                        <td className="p-2 text-right text-emerald-400">64 Blocks around spawn</td>
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
                        <td className="p-2 text-right text-amber-500">24 Blocks around spawn</td>
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
                        <td className="p-2 text-right text-amber-500">28 Blocks around spawn</td>
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
                  <div className="p-2 bg-[#0c120d] border border-emerald-900/30 rounded text-center">
                    <div className="text-emerald-500 text-[9px]">Splinter Shard</div>
                    <div className="text-emerald-400 font-bold mt-1">3%</div>
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
                  <li><strong className="text-[#c9d1c9]">Occlusion Control:</strong> Floor blocks in targeted biomes must possess light-occluding density values (<code>canOcclude</code>).</li>
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
                  Inside the Dead Grain biome, the safety exclusion zone compresses relentlessly as total player ticks (<code>sub_strata_time</code>) accumulate:
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
                        <td className="p-2 text-right text-amber-500">28 Blocks safety radius</td>
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

          {/* PETRIFIED LOG SPLINTER: Custom mechanics */}
          {currentEntity.id === 'petrified_splinter' && (
            <div className="space-y-4 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-zinc-300">Hardened Physiology:</strong> Emerging solely from fossilized understories, the Petrified Log Splinter is incredibly robust. It possesses high natural armor ratings (4 points) and moves slower than its fleshier brothers (0.3 speed), acting as an unyielding physical gatekeeper in the high-density ash forests.
              </div>
              <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4 leading-relaxed">
                <li><strong className="text-zinc-300">Gaze Locking:</strong> Freezes on direct sights and stalks once line of sight breaks.</li>
                <li><strong className="text-zinc-300">Kinship Alarms:</strong> Integrates fully with the global difficulty death alert triggers, driving surrounding Petrified Log Splinters into instant 600-tick fury states.</li>
              </ul>
            </div>
          )}

          {/* THE HOLLOW: Custom mechanics */}
          {currentEntity.id === 'hollow' && (
            <div className="space-y-4 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-teal-950/10 border border-teal-900/20 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-teal-400">The Silent Observer:</strong> The Hollow is an non-hostile phantom. It never pursues nor attacks. It maintains a safe, eerie presence in deep forests, creeping closer when your sight is turned, but vanishes instantly with a warp sound if struck.
              </div>
            </div>
          )}

          {/* LIGNUM VERMIS: Custom mechanics */}
          {currentEntity.id === 'lignum_vermis' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-teal-950/10 border border-teal-900/20 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-teal-400">Harvesting Hazards:</strong> Mining Scandere Lignum blocks carries a notable risk: there is a 10% chance for a Lignum Vermis to emerge upon total block destruction via player tools or explosions. Additionally, there is a rare 1% chance per tick for the hidden organism to violently fracture the block early while a player is actively mining it. They also generate naturally at specific Y-levels within the Sub-Strata.
              </div>
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
                        <td className="p-2 text-right text-emerald-400">19.5%</td>
                      </tr>
                      <tr>
                        <td className="p-2">Splinter Shard</td>
                        <td className="p-2 text-right text-emerald-400">15.6%</td>
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
              <div className="p-4 bg-purple-950/10 border border-purple-900/20 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-purple-400">Stalk & Punishment Loop:</strong> Remaining tracked or close to a Stilt Walker for too long triggers an escalation sequence: looking directly at it inflicts complete blindness (60 ticks) and spawns hostile Blindspot Splinters nearby right before the Stilt Walker teleports away.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-purple-400 mb-2">Predictive Dodging</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    If a survival mode player within <strong className="text-white">3.2 blocks</strong> swings a weapon, the Stilt Walker instantly senses the action, plays an alert chime, inflicts blindness, spawns Splinters, and teleports on the exact same frame!
                  </p>
                </div>
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-purple-400 mb-2">Circular Cage Formation</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Whenever Blindspot Splinters are summoned by a Stilt Walker, they generate in a perfect, uniform circle (<strong className="text-white">3.2-block radius</strong>) centered around the attacker to build an inescapable wooden trap.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#110d14] border border-purple-950/40 rounded-lg space-y-1">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Spawn Grace Protection System</h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  For the first <strong className="text-white">20 ticks (1s)</strong> after spawning, the Stilt Walker is immune to damage and predictive dodging checks. In addition, its stalk cycle cannot trigger/terminate until it has been alive for <strong className="text-white">60 ticks (3s)</strong>, preventing instant unfair traps.
                </p>
              </div>
            </div>
          )}

          {/* THE ASH-WEAVER: Custom mechanics */}
          {currentEntity.id === 'ash_weaver' && (
            <div className="space-y-4 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-emerald-400">The Botanical Wanderer:</strong> Completely safe, the Ash-Weaver patrols the dark forest soils. It ignores active players and continuously places <strong className="text-emerald-300">Ash-Roses</strong> along its movement trail. Tailing an Ash-Weaver provides players with a guaranteed, unlimited source of protective blossoms.
              </div>
            </div>
          )}

          {/* LIGNUM GIGAS: Custom mechanics */}
          {currentEntity.id === 'lignum_gigas' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-rose-950/10 border border-rose-900/20 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-rose-400">Ancient Bio-mechanical Behemoth:</strong> Standing roughly 80 blocks tall and arranged in perfect geometrical formations, Lignum Gigas represents the peak of woodbound growth. Striking it triggers active defensive routines that strip players of their weapons.
              </div>

              <div className="space-y-3">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Active Defence Routines</h5>
                <ul className="space-y-3 text-xs text-[#8c8779] pl-4 list-decimal leading-relaxed">
                  <li>
                    <strong className="text-[#c9d1c9]">Sinking Logic:</strong> 
                    On initial combat activation, it fractures all surrounding blocks in a <strong className="text-white">9-block radius</strong> and sinks exactly <strong className="text-white">5 blocks</strong> down to anchor its colossal mass.
                  </li>
                  <li>
                    <strong className="text-[#c9d1c9]">Radial Flinging:</strong> 
                    Every few ticks, it sweeps a <strong className="text-white">28-block area</strong> around its base, launching any active players high into the sky, inducing lethal fall risks.
                  </li>
                  <li>
                    <strong className="text-rose-400 font-bold">Inventory Stripping:</strong> 
                    Upon emitting an ominous Ender Dragon growl, all players in a 28-block radius have their active hotbars, main inventory items, and off-hands forcefully cast onto the ground (armor is safe).
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-2">
                <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Spawning Formations</h5>
                <ul className="space-y-1.5 text-xs text-[#8c8779] list-disc pl-4 leading-relaxed">
                  <li>Generates strictly in groups of <strong className="text-white">7 units</strong> arranged in a massive <strong className="text-white">400-block wide ring</strong> (200-block radius from center), all facing inward.</li>
                  <li>Extremely rare: Ring centers cannot generate within <strong className="text-white">900 blocks</strong> of another ring.</li>
                  <li>Only spawns on flat ground profiles above sea level, checking mountains and overhanging trees to prevent clipping.</li>
                </ul>
              </div>
            </div>
          )}

          {/* FRACTUS: Custom mechanics */}
          {currentEntity.id === 'fractus' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-cyan-950/10 border border-cyan-900/20 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-cyan-400">Sponge Guard:</strong> Found protecting Menger Sponge structures inside the Sub-Strata, these gravity-defying drones coordinate as a security faction, dispersing their aggression across multiple group members instead of focus-firing a single player.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-[#e0e7e0] mb-2">Maneuvering & Hover Heights</h5>
                  <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4">
                    <li>Standard hover at <strong className="text-white">3.25 blocks</strong> (4.35b if angry).</li>
                    <li>Gains a <strong className="text-white">+2.25 blocks</strong> height bonus if escaped from its home dimension.</li>
                    <li>In Sub-Strata corridors, hover height scales down by <strong className="text-white">1.0 block</strong> to lock-on in close quarters.</li>
                    <li>Retreats to maintain a defensive combat range of <strong className="text-white">13 blocks</strong> (17b if angry).</li>
                  </ul>
                </div>
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg">
                  <h5 className="font-serif text-sm font-bold text-[#e0e7e0] mb-2 font-mono text-cyan-400">Target-Lock Laser</h5>
                  <ul className="space-y-2 text-xs text-[#8c8779] list-disc pl-4">
                    <li>Standard Range: <strong className="text-white">32 blocks</strong> (44b if angry).</li>
                    <li><strong className="text-white">Calm Mode:</strong> Deals 2.0 damage every 10 ticks (0.5s).</li>
                    <li><strong className="text-white">Angry Mode:</strong> Deals 3.0 damage every 6 ticks (0.3s).</li>
                    <li>Interrupted: Taking damage while charging breaks the laser cycle and resets its hum.</li>
                    <li><strong className="text-cyan-400">Mega Laser Burst:</strong> Fires long-range sweeps dealing 70.0 damage up to 128 blocks.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-[#0c120d] border border-emerald-900/30 rounded-lg space-y-2">
                <h5 className="font-serif text-sm font-bold text-emerald-400">The Summoning Ritual</h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  If 2 to 6 partners detect each other within a 96-block range, they freeze, emit Evoker chants, and project beams into a central focal point to tear open a gateway (once every 30s per drone).
                </p>
                <ul className="text-xs text-[#8c8779] list-disc pl-4 leading-relaxed">
                  <li><strong className="text-white">Duration:</strong> Base 420 ticks (21s). Each extra drone cuts the time down by <strong className="text-white">40 ticks</strong> (minimum 180 ticks / 9s with 6 drones).</li>
                  <li><strong className="text-white">Adaptive Extension:</strong> Killing a participant mid-ritual forces the survivors to compensate, adding <strong className="text-red-400 font-bold">120 ticks (+6s)</strong> to the timer. Falls below 2 drones crashes the ritual.</li>
                  <li><strong className="text-emerald-400">Gateway Yields:</strong> 70% chance to summon a <strong className="text-cyan-400 font-bold">Fractus Prime</strong>, 30% chance to summon <strong className="text-red-400 font-bold">The Rot</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* FRACTUS PRIME: Custom mechanics */}
          {currentEntity.id === 'fractus_prime' && (
            <div className="space-y-5 pt-2 border-t border-[#1a221c]">
              <div className="p-4 bg-cyan-950/20 border border-cyan-900/40 rounded-lg text-xs text-[#8c8779] leading-relaxed">
                <strong className="text-cyan-400">Elite Planetary Laser Overseer:</strong> The 2x scaled mini-boss drone operates as a heavy orbital defense array. Bypasses standard camouflage, locks targets in gravity-holds, and detonates wide-area thermal novas.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-1.5">
                  <h5 className="font-serif text-sm font-bold text-cyan-400">Laser Multiplication</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed font-sans">
                    Range of 64 blocks (80b if angry). Base damage: 21.3 calm / 55.0 angry. 
                  </p>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    If engaging strong entities (&ge;80 Max HP, &ge;60 Current HP, &ge;6 attack, or &ge;2,400 ticks age) or when angry, it splits its array to fire up to <strong className="text-white">5 concurrent lasers</strong> simultaneously.
                  </p>
                </div>
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-1.5">
                  <h5 className="font-serif text-sm font-bold text-cyan-400">Helix Ray & Telekinetic Hold</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Sweeps a colossal helix beam up to 128 blocks dealing <strong className="text-white">180.0 damage</strong>. Frequently holds targets in a telekinetic grip during the sweep.
                  </p>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    <strong>Gaze Escape:</strong> Strike the Prime to break free. Needs 1-6 hits when healthy (&gt;100 HP), or <strong className="text-red-400 font-bold">8 to 24 hits</strong> when desperate (&le;100 HP).
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#140d0d] border border-red-950/40 rounded-lg space-y-2">
                <h5 className="font-serif text-sm font-bold text-red-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-red-500" />
                  Laser Sphere Burst (Elite AoE Nova)
                </h5>
                <p className="text-xs text-[#8c8779] leading-relaxed">
                  Triggers every 16s (8s against boss enemies). Buildup phase (135 ticks) expands an energy sphere up to 4.5 blocks; vaporization phase (5 ticks) explodes in a massive <strong className="text-white">17-block radius shell</strong>.
                </p>
                <ul className="text-xs text-red-300 pl-4 list-disc space-y-1 leading-relaxed">
                  <li>Vaporizes all surrounding weak blocks with hardness values &le; 100.0.</li>
                  <li>Inflicts a massive <strong className="font-bold">175.0 damage</strong> (225.0 if angry) to non-woodbound targets inside the shell.</li>
                  <li><strong className="text-emerald-400">Vulnerability Window:</strong> Instantly enters a 2.5-second (50 ticks) post-nova fatigue phase where all incoming projectiles bypass its defenses with 100% accuracy.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-1">
                  <h5 className="font-serif text-sm font-bold text-cyan-400">Echolocation Network</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Bypasses standard invisibility. Emits mechanical clicks if an invisible target is within 15 blocks. Every 7s, projects an 18-block sonar sweep ripple. Revealing targets locks onto them for 9s with Glowing tags.
                  </p>
                </div>
                <div className="p-4 bg-[#090b09] border border-[#1b231c] rounded-lg space-y-1">
                  <h5 className="font-serif text-sm font-bold text-[#e0e7e0]">Anti-Warden Adaptation</h5>
                  <p className="text-xs text-[#8c8779] leading-relaxed">
                    Deep underground battle defenses reduce incoming Warden attacks: Sonic Booms are reduced by <strong className="text-emerald-400">-45%</strong>, and physical strikes are mitigated by <strong className="text-emerald-400">-30%</strong>.
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
                <td className="p-3 text-center font-mono">0.3</td>
                <td className="p-3 text-center font-mono">400t</td>
                <td className="p-3 text-center font-mono">60</td>
                <td className="p-3 text-center text-emerald-400 font-mono">Yes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Stilt Walker</td>
                <td className="p-3 text-center font-mono">40</td>
                <td className="p-3 text-center text-gray-500">N/A</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0.16</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">50</td>
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
                <td className="p-3 text-center font-mono">2 (3 angry)</td>
                <td className="p-3 text-center font-mono">6</td>
                <td className="p-3 text-center font-mono">0.2</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">0.2</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#c9d1c9] text-left">Fractus Prime</td>
                <td className="p-3 text-center font-mono">270</td>
                <td className="p-3 text-center font-mono">21.3 (31.3 angry)</td>
                <td className="p-3 text-center font-mono">20</td>
                <td className="p-3 text-center font-mono">0.2</td>
                <td className="p-3 text-center text-gray-500 font-mono">N/A</td>
                <td className="p-3 text-center font-mono">4.5</td>
                <td className="p-3 text-center font-mono">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
