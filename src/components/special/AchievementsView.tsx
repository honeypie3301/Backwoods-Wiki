import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trophy, 
  Target, 
  CheckCircle, 
  Flame, 
  Sparkles, 
  HelpCircle, 
  Award
} from 'lucide-react';
import UpdatedFrame from '../UpdatedFrame';

interface AchievementItem {
  id: string;
  title: string;
  type: 'Task' | 'Goal' | 'Challenge';
  description: string;
  requirement: string;
  xp: number;
}

export default function AchievementsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const achievements: AchievementItem[] = [
    {
      id: "enter_backwoods",
      title: "Backwoods",
      type: "Task",
      description: "Step into the cold, dense overgrowth of the Backwoods.",
      requirement: "Enter the Backwoods dimension.",
      xp: 20
    },
    {
      id: "drink_pale_draught",
      title: "Stagnant Brew",
      type: "Task",
      description: "Refine Seep into a liquid gateway.",
      requirement: "Drink the Pale Draught.",
      xp: 15
    },
    {
      id: "enter_familiar",
      title: "Home sweet?",
      type: "Goal",
      description: "Discover the dimension that mirrors your memories.",
      requirement: "Enter the Familiar dimension.",
      xp: 30
    },
    {
      id: "punishment",
      title: "The source",
      type: "Goal",
      description: "Get dragged into The Grain for looking where you shouldn't.",
      requirement: "Get teleported into the Grain dimension.",
      xp: 25
    },
    {
      id: "enter_rotting_dimension",
      title: "Inner Circle",
      type: "Task",
      description: "Reach the core of the Backwoods infection.",
      requirement: "Enter the Rotting dimension.",
      xp: 20
    },
    {
      id: "enter_still",
      title: "Total Stasis",
      type: "Goal",
      description: "Enter the dimension where time forgot to move.",
      requirement: "Enter the Still dimension.",
      xp: 20
    },
    {
      id: "enter_loss",
      title: "A Memory Misplaced",
      type: "Task",
      description: "Seek out what was forgotten.",
      requirement: "Enter the Loss dimension.",
      xp: 35
    },
    {
      id: "rot_effigy_obtain",
      title: "A Cruel Likeness",
      type: "Goal",
      description: "Fashion a key out of splintered shards and string.",
      requirement: "Craft the Rot Effigy.",
      xp: 15
    },
    {
      id: "nest_structure",
      title: "The Hive Walls",
      type: "Task",
      description: "Enter a biome where the structures reach the sky and the silence is loud.",
      requirement: "Step into the Splinter Nest biome in the Grain.",
      xp: 25
    },
    {
      id: "enter_weald",
      title: "The Forest That Outlived Time",
      type: "Task",
      description: "Travel beyond the boundaries of temporal decay.",
      requirement: "Enter the Weald dimension.",
      xp: 45
    },
    {
      id: "heartwood_sword",
      title: "Pumping Heart",
      type: "Goal",
      description: "Infuse your blade with the core of the Rotting dimension.",
      requirement: "Craft the Heartwood Rotten Sword.",
      xp: 30
    },
    {
      id: "get_all_recovered",
      title: "What Was Lost",
      type: "Challenge",
      description: "Reclaim every recovered faded tool.",
      requirement: "Complete the full set of recovered faded armaments.",
      xp: 60
    },
    {
      id: "borrowed_time",
      title: "Borrowed Time",
      type: "Task",
      description: "Destroy a Plaque Heart to buy more time in Loss.",
      requirement: "Shatter a pulsing heart in the depths.",
      xp: 16
    },
    {
      id: "obtain_first_recovered_tool",
      title: "Edge of Recall",
      type: "Goal",
      description: "Forge your first Recovered Faded tool.",
      requirement: "Forge a tool imbued with past thoughts.",
      xp: 11
    },
    {
      id: "obtain_memory_fragment",
      title: "First Splinter of Memory",
      type: "Task",
      description: "Obtain a Memory Fragment from a Plaque Heart.",
      requirement: "Recover a fragment of past awareness.",
      xp: 15
    },
    {
      id: "obtain_recovered_fragment",
      title: "Recovered Thought",
      type: "Goal",
      description: "Craft a Recovered Fragment from distorted memory and remedy.",
      requirement: "Synthesize memory and remedy together.",
      xp: 15
    },
    {
      id: "use_resin",
      title: "Patchwork Survival",
      type: "Task",
      description: "Use Petrified Resin to repair a Recovered Faded tool.",
      requirement: "Apply resin to mend deteriorating gear.",
      xp: 8
    },
    {
      id: "rot_boss",
      title: "Sentinel",
      type: "Challenge",
      description: "Try to kill the Rot.",
      requirement: "Initiate or face the ultimate trial against the Rot.",
      xp: 2077
    }
  ];

  // Stats calculation
  const totalXp = useMemo(() => achievements.reduce((acc, curr) => acc + curr.xp, 0), [achievements]);
  const taskCount = useMemo(() => achievements.filter(a => a.type === 'Task').length, [achievements]);
  const goalCount = useMemo(() => achievements.filter(a => a.type === 'Goal').length, [achievements]);
  const challengeCount = useMemo(() => achievements.filter(a => a.type === 'Challenge').length, [achievements]);
  const apexChallenge = useMemo(() => {
    return achievements.reduce((max, curr) => curr.xp > max.xp ? curr : max, achievements[0]);
  }, [achievements]);

  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.requirement.toLowerCase().includes(q);

      const matchesType = selectedType === 'all' || a.type.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [achievements, searchQuery, selectedType]);

  const getTypeIcon = (type: 'Task' | 'Goal' | 'Challenge') => {
    switch (type) {
      case 'Task':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'Goal':
        return <Target className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'Challenge':
        return <Trophy className="w-4 h-4 text-purple-400 shrink-0" />;
    }
  };

  const getTypeStyle = (type: 'Task' | 'Goal' | 'Challenge') => {
    switch (type) {
      case 'Task':
        return 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400';
      case 'Goal':
        return 'bg-blue-950/40 border-blue-500/30 text-blue-400';
      case 'Challenge':
        return 'bg-purple-950/40 border-purple-500/30 text-purple-400';
    }
  };

  const getXpBadgeStyle = (type: 'Task' | 'Goal' | 'Challenge') => {
    switch (type) {
      case 'Challenge':
        return 'bg-purple-950/50 border-purple-500/40 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.15)]';
      case 'Goal':
        return 'bg-blue-950/50 border-blue-500/40 text-blue-300';
      case 'Task':
        return 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300';
    }
  };

  return (
    <UpdatedFrame id="achievements_view" isUpdated={true}>
      <div className="space-y-6 max-w-[1000px] mx-auto text-[#c9d1c9] select-text">
        
        {/* 1. Header Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0c100d] border border-[#1b251f] rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider">Total Advancements</div>
              <div className="text-lg font-bold font-mono text-[#e0e7e0]">{achievements.length} Entries</div>
            </div>
          </div>

          <div className="p-4 bg-[#0c100d] border border-[#1b251f] rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider">Total Reward Pool</div>
              <div className="text-lg font-bold font-mono text-[#e0e7e0]">
                {totalXp.toLocaleString()} XP
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0c100d] border border-[#1b251f] rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-purple-950/40 border border-purple-500/30 rounded-lg text-purple-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider">Apex Challenge</div>
              <div className="text-xs font-serif font-semibold text-[#e0e7e0] truncate">
                {apexChallenge.title}
              </div>
              <div className="text-[10px] font-mono text-purple-400 font-bold">
                {apexChallenge.xp.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Search & Filters Panel */}
        <div className="p-4 bg-[#0f1210] border border-[#1d251e] rounded-xl space-y-4 shadow-md select-none">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6b5e] pointer-events-none" />
              <input
                type="text"
                placeholder="Filter advancements by title, description, or requirements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0d0b] border border-[#232f26] rounded-lg py-2 pl-9 pr-4 text-xs font-mono text-[#c9d1c9] placeholder-[#5a6b5e] focus:outline-none focus:border-[#415645] transition-all"
              />
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-1 bg-[#0a0d0b] border border-[#232f26] rounded-lg p-1">
              {[
                { label: 'All', value: 'all', count: achievements.length },
                { label: 'Task', value: 'Task', count: taskCount },
                { label: 'Goal', value: 'Goal', count: goalCount },
                { label: 'Challenge', value: 'Challenge', count: challengeCount }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedType(tab.value)}
                  className={`px-3 py-1 text-[11px] font-mono rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                    selectedType.toLowerCase() === tab.value.toLowerCase()
                      ? 'bg-[#18221b] text-[#a9d1b0] font-semibold border border-[#304434]'
                      : 'text-[#6f7e73] hover:text-[#c9d1c9]'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Achievements Cards Grid */}
        {filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map(a => (
              <div 
                key={a.id}
                className="p-5 bg-[#0f1210] border border-[#1a221c] rounded-xl flex flex-col justify-between h-full hover:bg-[#121714] hover:border-[#243127] transition-all group"
              >
                <div className="space-y-3">
                  {/* Card Header (Title & Badge) */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-lg font-bold text-[#e0e7e0] group-hover:text-emerald-300 transition-colors">
                      {a.title}
                    </h3>
                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-medium ${getTypeStyle(a.type)}`}>
                      {getTypeIcon(a.type)}
                      <span>{a.type}</span>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-[#829285] leading-relaxed">
                      {a.description}
                    </p>
                    <div className="text-[11px] font-mono text-[#5a6b5e] bg-[#090b0a] p-2.5 rounded border border-[#141b16] leading-relaxed">
                      <span className="text-emerald-600 font-semibold uppercase text-[9px] block mb-0.5 tracking-wider">In-Game Requirement:</span>
                      {a.requirement}
                    </div>
                  </div>
                </div>

                {/* Card Footer (XP Reward) */}
                <div className="mt-4 pt-3.5 border-t border-[#1a221c]/60 flex items-center justify-between select-none">
                  <div className="text-[10px] font-mono text-[#5a6b5e] uppercase tracking-wider">
                    Advancement Reward
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-xs font-bold border ${getXpBadgeStyle(a.type)}`}>
                    <span>{a.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0f1210] border border-[#1a221c] rounded-xl select-none">
            <HelpCircle className="w-10 h-10 text-[#334237] mx-auto mb-3" />
            <p className="text-sm font-serif italic text-[#829285]">No advancements match your filter criteria.</p>
            <p className="text-xs text-[#5a6b5e] mt-1.5 font-mono">Try clearing the search query or changing the tier selection.</p>
          </div>
        )}

        {/* 4. Progression Guidance Footnote */}
        <div className="p-4 bg-[#0c100d] border border-[#1a241d] rounded-xl text-xs text-[#829285] leading-relaxed select-none font-mono flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#a9d1b0]">Advancement Progression Protocol:</strong> Advancements in The Backwoods track dimensional exploration, hazard encounters, and survival milestones across hostile thresholds. Each completion awards experience points corresponding to its objective class (Task, Goal, or Challenge).
          </div>
        </div>
      </div>
    </UpdatedFrame>
  );
}
