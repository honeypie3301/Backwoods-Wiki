import React, { useState, useRef, useEffect } from 'react';
import { Compass, ShieldAlert, Flame, Eye, Image as ImageIcon, Search, X, Maximize2, ChevronDown, Check } from 'lucide-react';
import UpdatedFrame from '../UpdatedFrame';

function getAbsoluteAssetUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
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

export interface BiomeData {
  id: string;
  name: string;
  image: string;
  desc: string;
  dimensionId: string;
  dimensionName: string;
}

export interface DimensionData {
  id: string;
  isUpdated?: boolean;
  name: string;
  subtitle: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  textColor: string;
  accentColor: string;
  desc: string;
  access: string;
  biomes: BiomeData[];
  rules: { title: string; desc: string }[];
}

export default function DimensionsView() {
  const [activeTab, setActiveTab] = useState<'realms' | 'biomes' | 'igniters'>('realms');
  const [selectedDimension, setSelectedDimension] = useState<string>('backwoods');
  const [biomeFilter, setBiomeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeImageModal, setActiveImageModal] = useState<{ url: string; title: string; desc: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        {
          id: "wood_plains",
          name: "The Wood Plains",
          image: "biomes/wood_plains.png",
          desc: "The most common biome in the dimension. Flat, open, and deceptively quiet flat expanses.",
          dimensionId: "backwoods",
          dimensionName: "The Backwoods"
        },
        {
          id: "the_thicket",
          name: "The Thicket",
          image: "biomes/the_thicket.png",
          desc: "A heavily packed region containing wooden trees. No geodes generate beneath the surface here.",
          dimensionId: "backwoods",
          dimensionName: "The Backwoods"
        },
        {
          id: "deep_backwoods",
          name: "The Deep Backwoods",
          image: "biomes/deep_backwoods.png",
          desc: "A dense area filled with taller tree trunks, spruce wood variants, and frequent rotten geodes.",
          dimensionId: "backwoods",
          dimensionName: "The Backwoods"
        }
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
      isUpdated: true,
      name: "The Loss",
      subtitle: "The Forgotten Sub-Realm",
      color: "from-slate-500 to-slate-800",
      borderColor: "border-slate-800/40",
      bgGlow: "bg-slate-900/30",
      textColor: "text-slate-200",
      accentColor: "text-slate-400",
      desc: "A sub-dimension representing a fading memory of the world. It is composed of fading blocks, with absolutely no structures. An ash-grey sky looms over the vast, empty expanse.",
      access: "Can be entered involuntarily via Stage Four mental degradation, or manually activated by building a portal frame out of Nullstone and igniting it using a Dead Memory Shard.",
      biomes: [
        {
          id: "loss_confusion",
          name: "Confusion",
          image: "biomes/loss_confusion.png",
          desc: "A dark, ash-swept biome with a grey-fog sky, floors of Faded Blocks, and trenches filled with Plaque. Passive ash particles drift through the atmosphere.",
          dimensionId: "loss",
          dimensionName: "The Loss"
        }
      ],
      rules: [
        {
          title: "Portal Ignition",
          desc: "Constructed using a Nullstone frame and ignited with a Dead Memory Shard (harvested from Memory Quartz). In survival, each ignition attempt consumes 16 durability."
        },
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
      desc: "A dark, oppressive realm characterized by dense, towering forests of rotten oak wood and a thick, suffocating fog that heavily limits visibility.",
      access: "Discovered by exploring and entering deep underground geodes inside the Backwoods dimension.",
      biomes: [
        {
          id: "rotting_deep",
          name: "Rotting Deep",
          image: "biomes/the_rotting_rotting_deep.png",
          desc: "Constructed of rotting oak wood with abundant ground foliage like mushrooms and dead bushes, densely populated with 32-block-high trees.",
          dimensionId: "rotting",
          dimensionName: "The Rotting"
        }
      ],
      rules: [
        {
          title: "Perpetual Midnight",
          desc: "The Rotting has no day/night cycle, remaining permanently dark and requiring constant artificial lighting to survive."
        },
        {
          title: "Single Biome Realm",
          desc: "The entire dimension consists solely of the Rotting Deep biome."
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
      access: "Can be entered by building a portal frame out of Oak Planks and igniting it with a Splinter Needle (stonecut from Sharpened Splinter Shards), or by being struck by a Splinter, building to extreme altitudes, or remaining in the Backwoods for long durations.",
      biomes: [
        {
          id: "uniform_grain",
          name: "The Uniform Grain",
          image: "biomes/uniform_grain.png",
          desc: "The vast plains of the dimension. Features flat expanses of pure oak floor and completely lacks tree growth.",
          dimensionId: "grain",
          dimensionName: "The Grain"
        },
        {
          id: "the_stillwood",
          name: "The Stillwood",
          image: "biomes/the_stillwood.png",
          desc: "The primary forest sector of the dimension, densely packed with vertical wooden towers and trees.",
          dimensionId: "grain",
          dimensionName: "The Grain"
        },
        {
          id: "splinter_nest",
          name: "The Splinter Nest",
          image: "biomes/splinter_nest.png",
          desc: "A haunting, high-density region characterized by colossal, highly repetitive timber networks.",
          dimensionId: "grain",
          dimensionName: "The Grain"
        },
        {
          id: "pillar_thicket",
          name: "The Pillar Thicket",
          image: "biomes/pillar_thicket.png",
          desc: "A rare architectural anomaly forming a vertical labyrinth composed of colossal, hollow wooden chimneys.",
          dimensionId: "grain",
          dimensionName: "The Grain"
        },
        {
          id: "labyrinthine_grids",
          name: "The Labyrinthine Grids",
          image: "biomes/the_labyrinthine_grids.png",
          desc: "Procedurally generated maze walls that change per chunk, rendering traditional maps useless.",
          dimensionId: "grain",
          dimensionName: "The Grain"
        },
        {
          id: "fractured_barrens",
          name: "The Fractured Barrens",
          image: "biomes/fractured_barrens.png",
          desc: "Fractured angular wooden growths stretching into the sky, resembling broken frameworks.",
          dimensionId: "grain",
          dimensionName: "The Grain"
        }
      ],
      rules: [
        {
          title: "Portal Ignition",
          desc: "Constructed using Oak Planks (or Splintered Oak Planks) and ignited using a Splinter Needle. Has a 100% ignition chance inside The Grain, 50% in Overworld, 30% in Backwoods, and 20% in Loss."
        },
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
        {
          id: "mirrored_plains",
          name: "Mirrored Plains",
          image: "biomes/the_familiar_mirrored_plains.png",
          desc: "A simulated Overworld mirror zone where passive and hostile creatures stand completely still, rotate to stare, and emit subtle humming.",
          dimensionId: "familiar",
          dimensionName: "The Familiar"
        }
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
        {
          id: "calcified_plains",
          name: "Calcified Plains",
          image: "biomes/calcified_plains.png",
          desc: "Desolate wasteland dominated by massive, 100-block tall spikes of petrified wood leaning toward the west.",
          dimensionId: "petrified",
          dimensionName: "The Petrified Weald"
        },
        {
          id: "weald_outskirts",
          name: "Weald Outskirts",
          image: "biomes/weald_outskirts.png",
          desc: "The youngest part of the petrified forest, sparsely populated with Fancy Oak style trees and jungle bushes.",
          dimensionId: "petrified",
          dimensionName: "The Petrified Weald"
        },
        {
          id: "petrified_thickwoods",
          name: "Petrified Thickwoods",
          image: "biomes/petrified_thickwoods.png",
          desc: "A dense, claustrophobic forest of Dark Oak and Mega Spruce style trees. Primary hunting ground for Splinters.",
          dimensionId: "petrified",
          dimensionName: "The Petrified Weald"
        },
        {
          id: "fossilized_core",
          name: "Fossilized Core",
          image: "biomes/fossilized_core.png",
          desc: "Ancient heart of the dimension featuring Mega Jungles trees and embedded Ancient Debris.",
          dimensionId: "petrified",
          dimensionName: "The Petrified Weald"
        },
        {
          id: "ashen_barrens",
          name: "Ashen Barrens",
          image: "biomes/ashen_barrens.png",
          desc: "Desolate field of ash roses with a deepslate floor. Entering inflicts the Heavy Lungs condition.",
          dimensionId: "petrified",
          dimensionName: "The Petrified Weald"
        }
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
        {
          id: "dead_grain",
          name: "The Dead Grain",
          image: "biomes/the_dead_grain.png",
          desc: "A desolate, monochrome variation of standard Grain architecture. Secondary habitat for Blindspot Splinters.",
          dimensionId: "substrata",
          dimensionName: "The Sub-Strata"
        }
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

  const allBiomes: BiomeData[] = dimensions.flatMap(d => d.biomes);

  const filteredBiomes = allBiomes.filter(b => {
    const matchesDimension = biomeFilter === 'all' || b.dimensionId === biomeFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.dimensionName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDimension && matchesSearch;
  });

  return (
    <div className="space-y-8 select-text">
      {/* Top Navigation Mode Selection */}
      <div className="flex flex-wrap border-b border-[#1a221c] pb-4 gap-3">
        <button
          onClick={() => setActiveTab('realms')}
          className={`px-4 py-2 font-serif text-sm font-semibold rounded-md transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'realms' 
              ? 'bg-[#151a16] text-[#a9d1b0] border border-[#2d3a2f]' 
              : 'text-[#829285] hover:text-[#e0e7e0]'
          }`}
        >
          <Compass className="w-4 h-4 text-[#709978]" />
          <span>Explore Realms ({dimensions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('biomes')}
          className={`px-4 py-2 font-serif text-sm font-semibold rounded-md transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'biomes' 
              ? 'bg-[#151a16] text-[#a9d1b0] border border-[#2d3a2f]' 
              : 'text-[#829285] hover:text-[#e0e7e0]'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-[#709978]" />
          <span>Biomes Dossier ({allBiomes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('igniters')}
          className={`px-4 py-2 font-serif text-sm font-semibold rounded-md transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'igniters' 
              ? 'bg-[#151a16] text-[#a9d1b0] border border-[#2d3a2f]' 
              : 'text-[#829285] hover:text-[#e0e7e0]'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Portal Catalysts & Success Rates</span>
        </button>
      </div>

      {/* LIGHTBOX IMAGE MODAL */}
      {activeImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveImageModal(null)}
        >
          <div 
            className="bg-[#0e110f] border border-[#232c25] rounded-xl max-w-4xl w-full p-4 sm:p-6 space-y-4 relative shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-4 right-4 p-2 bg-[#171e19] text-[#a9d1b0] hover:text-white rounded-lg border border-[#27332a] transition-all cursor-pointer z-10"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 pr-10">
              <span className="text-[10px] font-mono text-[#709978] uppercase tracking-widest">Biome Dossier Photograph</span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#e0e7e0]">{activeImageModal.title}</h3>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-[#232c25] bg-black max-h-[70vh] flex items-center justify-center">
              <img 
                src={getAbsoluteAssetUrl(activeImageModal.url)} 
                alt={activeImageModal.title}
                className="max-h-[68vh] w-auto object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <p className="text-xs sm:text-sm text-[#a9d1b0] font-mono bg-[#111613] p-3 rounded-lg border border-[#1a231c]">
              {activeImageModal.desc}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'realms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar selector */}
          <div className="lg:col-span-4 space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#5a6b5e] mb-3">Dimensions Index</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[380px] lg:max-h-none overflow-y-auto pr-1 scrollbar-thin">
              {dimensions.map(d => (
                <UpdatedFrame key={d.id} id={`dim_btn_${d.id}`} isUpdated={!!d.isUpdated}>
                  <button
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
                </UpdatedFrame>
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
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#5a6b5e] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Regional Biomes ({currentDim.biomes.length})
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentDim.biomes.map((biome) => (
                  <div 
                    key={biome.id}
                    className="p-3 bg-[#070907] border border-[#161d18] hover:border-[#2a382d] rounded-lg text-xs space-y-2 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      {/* Biome Image */}
                      <div 
                        onClick={() => setActiveImageModal({ url: biome.image, title: biome.name, desc: biome.desc })}
                        className="relative h-32 w-full rounded-md overflow-hidden bg-[#111612] border border-[#1f2820] cursor-pointer group/img flex items-center justify-center"
                      >
                        <img 
                          src={getAbsoluteAssetUrl(biome.image)} 
                          alt={biome.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const parent = (e.currentTarget as HTMLElement).parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.biome-fallback');
                              if (fallback) (fallback as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div className="biome-fallback hidden absolute inset-0 bg-[#0d120e] flex-col items-center justify-center gap-1 text-[#3a4a3e]">
                          <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Awaiting Render</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <span className="font-serif font-bold text-white text-xs tracking-wide shadow-sm">{biome.name}</span>
                          <span className="p-1 bg-black/60 rounded text-[#a9d1b0] opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <Maximize2 className="w-3 h-3" />
                          </span>
                        </div>
                      </div>

                      <p className="text-[#829285] leading-relaxed text-[11px]">
                        {biome.desc}
                      </p>
                    </div>
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
      )}

      {/* BIOMES DOSSIER TAB */}
      {activeTab === 'biomes' && (
        <UpdatedFrame id="biomes_dossier_tab" isUpdated={true}>
          <div className="space-y-6">
            
            {/* Header Controls */}
            <div className="p-5 bg-[#0c0f0d] border border-[#1d251e] rounded-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#e0e7e0] flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#709978]" />
                    <span>Regional Biomes Field Gallery</span>
                  </h3>
                  <p className="text-xs text-[#829285] font-mono mt-0.5">
                    Photographic survey of all regional biomes across Backwoods dimensions.
                  </p>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6b5e]" />
                    <input 
                      type="text"
                      placeholder="Search biomes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#121613] border border-[#202b22] text-[#c9d1c9] text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-[#709978]"
                    />
                  </div>

                  {/* Custom Styled Realm Filter Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="bg-[#121613] border border-[#202b22] text-[#c9d1c9] text-xs px-3 py-1.5 rounded-lg hover:border-[#709978] focus:outline-none flex items-center justify-between gap-2 cursor-pointer transition-colors min-w-[150px]"
                    >
                      <span className="truncate">
                        {biomeFilter === 'all'
                          ? `All Realms (${allBiomes.length})`
                          : dimensions.find(d => d.id === biomeFilter)?.name || 'Select Realm'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#5a6b5e] transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-[#709978]' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-1.5 w-56 bg-[#0d120e] border border-[#233226] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#c9d1c9] divide-y divide-[#172219]">
                        <button
                          type="button"
                          onClick={() => { setBiomeFilter('all'); setDropdownOpen(false); }}
                          className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#162218] hover:text-[#e0e7e0] transition-colors cursor-pointer ${biomeFilter === 'all' ? 'text-[#a9d1b0] bg-[#131d15] font-semibold' : ''}`}
                        >
                          <span className="flex items-center gap-2">
                            {biomeFilter === 'all' && <Check className="w-3.5 h-3.5 text-[#709978]" />}
                            <span>All Realms</span>
                          </span>
                          <span className="text-[10px] font-mono text-[#5a6b5e]">({allBiomes.length})</span>
                        </button>
                        {dimensions.map(d => {
                          const count = allBiomes.filter(b => b.dimensionId === d.id).length;
                          const isSelected = biomeFilter === d.id;
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => { setBiomeFilter(d.id); setDropdownOpen(false); }}
                              className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#162218] hover:text-[#e0e7e0] transition-colors cursor-pointer ${isSelected ? 'text-[#a9d1b0] bg-[#131d15] font-semibold' : ''}`}
                            >
                              <span className="flex items-center gap-2">
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#709978]" />}
                                <span>{d.name}</span>
                              </span>
                              <span className="text-[10px] font-mono text-[#5a6b5e]">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Biomes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBiomes.map((biome) => (
                <div 
                  key={biome.id}
                  className="p-4 bg-[#0a0c0a] border border-[#1b231d] hover:border-[#2f3d32] rounded-xl space-y-3 transition-all flex flex-col justify-between group shadow-md"
                >
                  <div className="space-y-3">
                    {/* Dimension Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#709978] uppercase tracking-wider font-semibold">
                        {biome.dimensionName}
                      </span>
                      <span className="text-[9px] font-mono text-[#5a6b5e] uppercase">
                        SECTOR ID: {biome.id}
                      </span>
                    </div>

                    {/* Image Box */}
                    <div 
                      onClick={() => setActiveImageModal({ url: biome.image, title: biome.name, desc: biome.desc })}
                      className="relative h-44 w-full rounded-lg overflow-hidden bg-[#0d120e] border border-[#1e2720] cursor-pointer group/img flex items-center justify-center"
                    >
                      <img 
                        src={getAbsoluteAssetUrl(biome.image)} 
                        alt={biome.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                          const parent = (e.currentTarget as HTMLElement).parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.biome-fallback');
                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div className="biome-fallback hidden absolute inset-0 bg-[#0d120e] flex-col items-center justify-center gap-1 text-[#3a4a3e]">
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Awaiting Render</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 pointer-events-none" />
                      
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                        <h4 className="font-serif font-bold text-white text-sm tracking-wide drop-shadow">{biome.name}</h4>
                        <div className="p-1.5 bg-black/70 rounded-md text-[#a9d1b0] opacity-80 group-hover/img:opacity-100 transition-opacity">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#829285] leading-relaxed">
                      {biome.desc}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#141b15] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedDimension(biome.dimensionId);
                        setActiveTab('realms');
                      }}
                      className="text-[11px] font-mono text-[#709978] hover:text-[#a9d1b0] uppercase tracking-wider font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <span>Explore Realm</span>
                      <Compass className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-mono text-[#4a594c]">REGIONAL PHOTO</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredBiomes.length === 0 && (
              <div className="p-12 text-center bg-[#0a0c0a] border border-[#1b231d] rounded-xl space-y-2">
                <p className="text-sm font-mono text-[#829285]">No biomes matched your search query.</p>
                <button
                  onClick={() => { setSearchQuery(''); setBiomeFilter('all'); }}
                  className="text-xs font-mono text-[#709978] underline hover:text-[#a9d1b0]"
                >
                  Clear search filters
                </button>
              </div>
            )}

          </div>
        </UpdatedFrame>
      )}

      {/* IGNITERS TAB */}
      {activeTab === 'igniters' && (
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

            {/* Igniter 3 */}
            <div className="p-5 bg-[#0a0c0a] border border-[#1f2821] rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#e0e7e0]">Dead Memory Shard</h4>
                  <p className="text-[10px] font-mono text-[#5a6b5e] uppercase">Gate to: The Loss</p>
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
                      <td className="p-3 font-medium text-[#c9d1c9]">The Loss (Self)</td>
                      <td className="p-3 text-center font-mono">0</td>
                      <td className="p-3 text-right text-emerald-400 font-bold font-mono">10 in 10 (100%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">Familiar</td>
                      <td className="p-3 text-center font-mono">8</td>
                      <td className="p-3 text-right text-rose-400 font-mono">2 in 10 (20%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-[#c9d1c9]">Overworld</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Backwoods</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Rotting</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Still</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">Petrified Weald</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Igniter 4 */}
            <div className="p-5 bg-[#0a0c0a] border border-[#1f2821] rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#e0e7e0]">Splinter Needle</h4>
                  <p className="text-[10px] font-mono text-[#5a6b5e] uppercase">Gate to: The Grain</p>
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
                      <td className="p-3 font-medium text-[#c9d1c9]">The Backwoods</td>
                      <td className="p-3 text-center font-mono">4</td>
                      <td className="p-3 text-right text-emerald-400 font-bold font-mono">6 in 10 (60%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-[#c9d1c9]">The Grain (Self)</td>
                      <td className="p-3 text-center font-mono">4</td>
                      <td className="p-3 text-right text-emerald-400 font-bold font-mono">6 in 10 (60%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">Overworld</td>
                      <td className="p-3 text-center font-mono">5</td>
                      <td className="p-3 text-right text-amber-400 font-mono">5 in 10 (50%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Loss</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Rotting</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">The Still</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">Familiar</td>
                      <td className="p-3 text-center font-mono">9</td>
                      <td className="p-3 text-right text-rose-600 font-bold font-mono">1 in 10 (10%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#c9d1c9]">Petrified Weald</td>
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
